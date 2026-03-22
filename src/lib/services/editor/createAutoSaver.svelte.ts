import { useConvexClient } from 'convex-svelte';
import { api } from '$convex/_generated/api.js';
import {
	mergeProjectFilesWithPatches,
	normalizeProjectFilePatches,
	resolveProjectFileName
} from '$lib/utils/project/filesystem.js';
import type { IDEProject, ProjectId } from '$types/projects.js';
import { isPersistedProject } from '$lib/utils/project/guards.js';

export type AutoSaveStatus =
	| 'Saved'
	| 'Saving...'
	| 'Unsaved changes'
	| 'Session only'
	| 'Save failed';

export function createAutoSaver(getProject: () => IDEProject | undefined) {
	// Gracefully degrade when there is no ConvexProvider in the tree
	// (e.g. the /shop demo route). In that case every call is a no-op and
	// the status stays 'Saved' so the Editor UI looks clean.
	let convexClient: ReturnType<typeof useConvexClient> | null = null;
	try {
		convexClient = useConvexClient();
	} catch {
		// No provider — demo / offline mode
	}

	let saveStatus = $state<AutoSaveStatus>('Saved');
	let saveTimeout: ReturnType<typeof setTimeout> | undefined;

	// Track in-flight saves to avoid clobbering with stale data
	const pendingSaves = new Map<string, string>(); // fileName -> latest content to save

	function queuePendingSave(fileName: string, content: string) {
		pendingSaves.set(fileName, content);
	}

	function queuePendingSaves(next: ReadonlyArray<{ fileName: string; content: string }>) {
		for (const item of next) {
			queuePendingSave(item.fileName, item.content);
		}
	}

	async function persistProjectFilePatches(
		projectId: ProjectId,
		patches: ReadonlyArray<{ name: string; contents: string }>,
		project: IDEProject
	) {
		try {
			await convexClient!.mutation(api.projects.updateProjectFiles, {
				id: projectId,
				files: [...patches]
			});
			return;
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			const needsFallback =
				message.includes('Could not find public function') ||
				message.includes('updateProjectFiles');
			if (!needsFallback) throw error;
		}

		const mergedFiles = mergeProjectFilesWithPatches(project.files, patches);
		await convexClient!.mutation(api.projects.updateProject, {
			id: projectId,
			files: mergedFiles
		});
	}

	async function flushPendingSaves() {
		const project = getProject();
		const projectId = isPersistedProject(project) ? project._id : undefined;

		// No-op in demo/guest mode (no persisted project)
		if (!convexClient || !projectId) {
			pendingSaves.clear();
			saveStatus = 'Session only';
			return;
		}

		if (!project || pendingSaves.size === 0) {
			saveStatus = 'Saved';
			return;
		}

		saveStatus = 'Saving...';
		const snapshot = new Map(pendingSaves);
		pendingSaves.clear();
		const normalizedPatches = normalizeProjectFilePatches(
			Array.from(snapshot.entries()).map(([name, contents]) => ({ name, contents })),
			project.files
		);

		if (normalizedPatches.length === 0) {
			saveStatus = 'Saved';
			return;
		}

		try {
			await persistProjectFilePatches(projectId as ProjectId, normalizedPatches, project);

			saveStatus = 'Saved';
		} catch (err) {
			console.error('Save failed', err);
			// Re-queue failed saves — don't overwrite if a newer save came in during the flight
			for (const patch of normalizedPatches) {
				if (!pendingSaves.has(patch.name)) {
					pendingSaves.set(patch.name, patch.contents);
				}
			}
			saveStatus = 'Save failed';
		}
	}

	/** Call only on local user input (not remote Yjs syncs). */
	function triggerAutoSave(fileName: string, content: string) {
		triggerAutoSaveBatch([{ fileName, content }]);
	}

	/** Call when a sync cycle produces multiple touched files. */
	function triggerAutoSaveBatch(changes: ReadonlyArray<{ fileName: string; content: string }>) {
		if (changes.length === 0) return;

		const project = getProject();
		const projectId = isPersistedProject(project) ? project._id : undefined;

		if (!convexClient || !projectId || !project) {
			saveStatus = 'Session only';
			return;
		}

		queuePendingSaves(
			changes.map((change) => ({
				fileName: resolveProjectFileName(change.fileName, project.files),
				content: change.content
			}))
		);

		saveStatus = 'Unsaved changes';
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(flushPendingSaves, 1500);
	}

	/** Force an immediate save — useful on tab switch or beforeunload. */
	async function forceSave(fileName: string, content: string) {
		const project = getProject();
		if (project) {
			queuePendingSave(resolveProjectFileName(fileName, project.files), content);
		} else {
			queuePendingSave(fileName, content);
		}
		clearTimeout(saveTimeout);
		await flushPendingSaves();
	}

	function cleanup() {
		clearTimeout(saveTimeout);
	}

	/**
	 * Flushes queued autosave mutations and stops the timer.
	 * Intended for deterministic teardown paths.
	 */
	async function drainAndCleanup() {
		clearTimeout(saveTimeout);
		await flushPendingSaves();
	}

	return {
		get status() {
			return saveStatus;
		},
		triggerAutoSave,
		triggerAutoSaveBatch,
		forceSave,
		drainAndCleanup,
		cleanup
	};
}
