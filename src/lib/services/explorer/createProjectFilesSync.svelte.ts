import { useConvexClient } from 'convex-svelte';
import { api } from '$convex/_generated/api.js';
import { resolveProjectFileName } from '$lib/utils/project/filesystem.js';
import type { IDEProject, ProjectId, ProjectFile } from '$types/projects.js';
import type { WebContainer } from '@webcontainer/api';
import { getLiveblocksClient } from '$lib/liveblocks.config.js';
import {
	appendTerminalAudit,
	collaborationPermissionsStore
} from '$lib/stores/collaboration/collaborationStore.svelte.js';

type MutableProject = { files: ProjectFile[] };
type FsEvent = Extract<Liveblocks['RoomEvent'], { type: 'fs-op' }>;

type CreateProjectFilesSyncOptions = {
	getProject: () => IDEProject | undefined;
	getProjectForPath?: (path: string) => IDEProject | undefined;
	getWebcontainer: () => WebContainer;
	onRemoteOperationApplied?: () => Promise<void> | void;
};

export function createProjectFilesSync(options: CreateProjectFilesSyncOptions) {
	let convexClient: ReturnType<typeof useConvexClient> | null = null;
	try {
		convexClient = useConvexClient();
	} catch {
		// No provider (demo/guest mode)
	}

	let permissions = { canWrite: true, roomId: null as string | null };
	const unsubPermissions = collaborationPermissionsStore.subscribe((value) => {
		permissions = value;
	});

	let leaveRoom: (() => void) | undefined;
	let roomRef: ReturnType<ReturnType<typeof getLiveblocksClient>['enterRoom']>['room'] | undefined;
	let unsubscribeEvents: (() => void) | undefined;
	let currentRoomId: string | null = null;
	const seenOperationIds = new Set<string>();

	function canWrite() {
		return permissions.canWrite;
	}

	function operationId(prefix: string) {
		return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
	}

	function getProjectId(project: IDEProject | undefined): ProjectId | null {
		const id = (project as { _id?: ProjectId } | undefined)?._id;
		return id ?? null;
	}

	function resolveProject(path?: string): IDEProject | undefined {
		if (path) {
			const byPath = options.getProjectForPath?.(path);
			if (byPath) return byPath;
		}

		return options.getProject();
	}

	function ensureRoomForProject(project: IDEProject | undefined) {
		if (!project?.room) return;
		if (currentRoomId === project.room && roomRef) return;

		unsubscribeEvents?.();
		unsubscribeEvents = undefined;
		leaveRoom?.();
		leaveRoom = undefined;
		roomRef = undefined;

		const client = getLiveblocksClient();
		const entered = client.enterRoom(project.room, {
			initialPresence: { cursor: null, selection: null }
		});

		leaveRoom = entered.leave;
		roomRef = entered.room;
		currentRoomId = project.room;

		unsubscribeEvents = roomRef.subscribe('event', ({ event }) => {
			if (isFsEvent(event)) {
				void applyRemoteFsOperation(event);
			}
		});
	}

	function isFsEvent(value: unknown): value is FsEvent {
		if (!value || typeof value !== 'object') return false;
		const candidate = value as {
			type?: unknown;
			op?: unknown;
			path?: unknown;
			opId?: unknown;
		};
		return (
			candidate.type === 'fs-op' &&
			(candidate.op === 'create' || candidate.op === 'rename' || candidate.op === 'delete') &&
			typeof candidate.path === 'string' &&
			typeof candidate.opId === 'string'
		);
	}

	async function persistProjectFiles(nextFiles: ProjectFile[], project?: IDEProject) {
		const targetProject = project ?? options.getProject();
		const projectId = getProjectId(targetProject);
		if (!convexClient || !targetProject || !projectId) return;

		await convexClient.mutation(api.projects.updateProject, {
			id: projectId as ProjectId,
			files: nextFiles
		});

		(targetProject as unknown as MutableProject).files = nextFiles;
	}

	async function applyRemoteFsOperation(event: FsEvent) {
		if (seenOperationIds.has(event.opId)) return;
		seenOperationIds.add(event.opId);

		const wc = options.getWebcontainer();
		const project = resolveProject(event.path);
		if (!project) return;

		if (event.op === 'create') {
			if (event.isDirectory) {
				await wc.fs.mkdir(event.path, { recursive: true });
			} else {
				const content = event.contents ?? '';
				const parts = event.path.split('/');
				if (parts.length > 1) {
					await wc.fs.mkdir(parts.slice(0, -1).join('/'), { recursive: true });
				}
				await wc.fs.writeFile(event.path, content, 'utf-8');

				const fileName = resolveProjectFileName(event.path, project.files);
				const nextFiles = project.files.some((f: ProjectFile) => f.name === fileName)
					? project.files.map((f: ProjectFile) =>
							f.name === fileName ? { ...f, contents: content } : { ...f }
						)
					: [
							...project.files.map((f: ProjectFile) => ({ ...f })),
							{ name: fileName, contents: content }
						];

				await persistProjectFiles(nextFiles, project);
			}
		}

		if (event.op === 'rename' && event.nextPath) {
			await wc.fs.rename(event.path, event.nextPath);

			const fromName = resolveProjectFileName(event.path, project.files);
			const toName = resolveProjectFileName(event.nextPath, project.files);
			const nextFiles = project.files.map((file: ProjectFile) =>
				file.name === fromName ? { ...file, name: toName } : { ...file }
			);

			await persistProjectFiles(nextFiles, project);
		}

		if (event.op === 'delete') {
			await wc.fs.rm(event.path, { recursive: true, force: true });

			const deleted = resolveProjectFileName(event.path, project.files);
			const nextFiles = project.files
				.filter((file: ProjectFile) => file.name !== deleted)
				.map((f: ProjectFile) => ({ ...f }));
			await persistProjectFiles(nextFiles, project);
		}

		await options.onRemoteOperationApplied?.();
	}

	function start() {
		ensureRoomForProject(options.getProject());
	}

	function stop() {
		unsubscribeEvents?.();
		unsubscribeEvents = undefined;
		leaveRoom?.();
		leaveRoom = undefined;
		roomRef = undefined;
		currentRoomId = null;
		unsubPermissions();
	}

	async function broadcastFsOperation(event: FsEvent, project?: IDEProject) {
		const targetProject = project ?? options.getProject();
		ensureRoomForProject(targetProject);
		if (!targetProject?.room || !roomRef) return;

		seenOperationIds.add(event.opId);
		roomRef.broadcastEvent(event);
		appendTerminalAudit({
			at: Date.now(),
			command: `fs:${event.op} ${event.path}${event.nextPath ? ` -> ${event.nextPath}` : ''}`,
			allowed: true,
			roomId: targetProject.room
		});
	}

	async function upsertFile(path: string, contents: string) {
		const project = resolveProject(path);
		const projectId = getProjectId(project);
		if (!convexClient || !project || !projectId) return;

		const fileName = resolveProjectFileName(path, project.files);
		const nextFiles = project.files.map((file: ProjectFile) =>
			file.name === fileName ? { ...file, contents } : file
		);

		if (!nextFiles.some((file: ProjectFile) => file.name === fileName)) {
			nextFiles.push({ name: fileName, contents });
		}

		await convexClient.mutation(api.projects.updateProject, {
			id: projectId as ProjectId,
			files: nextFiles
		});

		(project as unknown as MutableProject).files = nextFiles;
	}

	async function createFile(path: string, contents: string) {
		if (!canWrite()) return;
		const project = resolveProject(path);
		if (!project) return;
		await upsertFile(path, contents);

		const actorId = String((project as { owner?: string } | undefined)?.owner ?? 'unknown');
		await broadcastFsOperation(
			{
				type: 'fs-op',
				opId: operationId('create-file'),
				actorId,
				op: 'create',
				path,
				contents,
				isDirectory: false,
				ts: Date.now()
			},
			project
		);
	}

	async function createDirectory(path: string) {
		if (!canWrite()) return;
		const project = resolveProject(path);
		if (!project) return;
		const actorId = String((project as { owner?: string } | undefined)?.owner ?? 'unknown');
		await broadcastFsOperation(
			{
				type: 'fs-op',
				opId: operationId('create-dir'),
				actorId,
				op: 'create',
				path,
				isDirectory: true,
				ts: Date.now()
			},
			project
		);
	}

	async function renamePath(path: string, nextPath: string) {
		if (!canWrite()) return;
		const project = resolveProject(path) ?? resolveProject(nextPath);
		if (!project) return;

		const fromName = resolveProjectFileName(path, project.files);
		const toName = resolveProjectFileName(nextPath, project.files);
		const nextFiles = project.files.map((file: ProjectFile) =>
			file.name === fromName ? { ...file, name: toName } : { ...file }
		);
		await persistProjectFiles(nextFiles, project);

		const actorId = String((project as { owner?: string } | undefined)?.owner ?? 'unknown');
		await broadcastFsOperation(
			{
				type: 'fs-op',
				opId: operationId('rename'),
				actorId,
				op: 'rename',
				path,
				nextPath,
				ts: Date.now()
			},
			project
		);
	}

	async function deletePath(path: string) {
		if (!canWrite()) return;
		const project = resolveProject(path);
		if (!project) return;

		const deleted = resolveProjectFileName(path, project.files);
		const nextFiles = project.files
			.filter((file: ProjectFile) => file.name !== deleted)
			.map((f: ProjectFile) => ({ ...f }));
		await persistProjectFiles(nextFiles, project);

		const actorId = String((project as { owner?: string } | undefined)?.owner ?? 'unknown');
		await broadcastFsOperation(
			{
				type: 'fs-op',
				opId: operationId('delete'),
				actorId,
				op: 'delete',
				path,
				ts: Date.now()
			},
			project
		);
	}

	return {
		start,
		stop,
		canWrite,
		createFile,
		createDirectory,
		renamePath,
		deletePath,
		upsertFile
	};
}
