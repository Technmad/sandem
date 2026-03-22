/**
 * Syncs Convex projects table with the file tree explorer.
 * Projects in Convex → Root folders in WebContainer
 *
 * Single source of truth: Convex projects table
 * - Create/delete folders at root → Convex mutations
 * - File tree renders projects as folders
 */

import { ConvexClient } from 'convex/browser';
import { api } from '$convex/_generated/api.js';

export interface ProjectFolder {
	_id: string;
	title: string;
	owner: string;
}

export type CreateProjectSyncControllerOptions = {
	convexClient: ConvexClient;
	owner: string;
};

export function createProjectSyncController(options: CreateProjectSyncControllerOptions) {
	const { convexClient, owner } = options;

	let projects = $state<ProjectFolder[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let pollTimer = $state<ReturnType<typeof setTimeout> | null>(null);
	let pollRunning = false;
	let syncInFlight: Promise<void> | null = null;
	let stableSyncCount = 0;
	const BASE_POLL_MS = 1200;
	const MAX_POLL_MS = 7000;

	/**
	 * Get workspace root folders (project IDs to filter WebContainer root)
	 */
	function getWorkspaceRootFolders(): string[] {
		return projects.map((p) => p._id);
	}

	/**
	 * Fetch projects from Convex
	 */
	function projectSignature(values: ProjectFolder[]): string {
		return values
			.map((project) => `${project._id}:${project.title}`)
			.sort()
			.join('|');
	}

	function getNextPollDelayMs() {
		if (stableSyncCount < 2) return BASE_POLL_MS;
		if (stableSyncCount < 6) return Math.min(BASE_POLL_MS * 2, MAX_POLL_MS);
		if (stableSyncCount < 12) return Math.min(BASE_POLL_MS * 4, MAX_POLL_MS);
		return MAX_POLL_MS;
	}

	function schedulePoll(delayMs: number) {
		if (!pollRunning) return;
		if (pollTimer) {
			clearTimeout(pollTimer);
		}

		pollTimer = setTimeout(
			async () => {
				if (!pollRunning) return;
				await syncProjects({ silent: true });
				schedulePoll(getNextPollDelayMs());
			},
			Math.max(250, delayMs)
		);
	}

	async function syncProjects(options?: { silent?: boolean }) {
		if (syncInFlight) {
			return syncInFlight;
		}

		const silent = !!options?.silent;
		if (!owner) {
			projects = [];
			error = null;
			stableSyncCount = 0;
			return;
		}

		if (!silent) {
			loading = true;
			error = null;
		}

		syncInFlight = (async () => {
			try {
				const before = projectSignature(projects);
				const result = await convexClient.query(api.projects.getProjects, { owner });
				projects = result;
				error = null;

				const after = projectSignature(result);
				if (before === after) {
					stableSyncCount += 1;
				} else {
					stableSyncCount = 0;
				}
			} catch (err) {
				error = err instanceof Error ? err.message : String(err);
				stableSyncCount = 0;
			} finally {
				syncInFlight = null;
				if (!silent) {
					loading = false;
				}
			}
		})();

		return syncInFlight;
	}

	function startPolling() {
		if (pollRunning) return;
		pollRunning = true;
		stableSyncCount = 0;
		void syncProjects({ silent: true });
		schedulePoll(BASE_POLL_MS);
	}

	function stopPolling() {
		pollRunning = false;
		if (pollTimer) {
			clearTimeout(pollTimer);
			pollTimer = null;
		}
	}

	/**
	 * Create a new project (creates folder at root)
	 */
	async function createProjectFolder(title: string): Promise<string | null> {
		try {
			const id = await convexClient.mutation(api.projects.createProject, {
				title,
				owner,
				files: [],
				room: undefined,
				entry: undefined
			});

			// Known mutation event: immediate sync and backoff reset.
			stableSyncCount = 0;
			await syncProjects();
			return id;
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			return null;
		}
	}

	/**
	 * Delete a project (delete folder at root)
	 * TODO: Add delete mutation to projects.ts
	 */
	async function deleteProjectFolder(): Promise<boolean> {
		try {
			// TODO: Implement deleteProject mutation
			stableSyncCount = 0;
			await syncProjects();
			return true;
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			return false;
		}
	}

	return {
		get projects() {
			return projects;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		getWorkspaceRootFolders,
		startPolling,
		stopPolling,
		syncProjects,
		createProjectFolder,
		deleteProjectFolder
	};
}
