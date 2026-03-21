import { useConvexClient } from 'convex-svelte';
import { api } from '$convex/_generated/api.js';
import { resolveProjectFileName } from '$lib/utils/project/filesystem.js';
import type { IDEProject, ProjectId } from '$types/projects.js';
import { isPersistedProject } from '$lib/utils/project/guards.js';

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

	let saveStatus = $state<'Saved' | 'Saving...' | 'Unsaved changes' | 'Session only'>('Saved');
	let saveTimeout: ReturnType<typeof setTimeout> | undefined;

	// Track in-flight saves to avoid clobbering with stale data
	const pendingSaves = new Map<string, string>(); // fileName -> latest content to save

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

		try {
			const updatedFiles = project.files.map((f) =>
				snapshot.has(f.name) ? { ...f, contents: snapshot.get(f.name)! } : f
			);

			// Upsert brand-new files that are not in project.files yet (e.g. created from Explorer)
			for (const [fileName, content] of snapshot) {
				if (updatedFiles.some((f) => f.name === fileName)) continue;
				updatedFiles.push({ name: fileName, contents: content });
			}

			await convexClient.mutation(api.projects.updateProject, {
				id: projectId as ProjectId,
				files: updatedFiles
			});

			saveStatus = 'Saved';
		} catch (err) {
			console.error('Save failed', err);
			// Re-queue failed saves — don't overwrite if a newer save came in during the flight
			snapshot.forEach((content, fileName) => {
				if (!pendingSaves.has(fileName)) {
					pendingSaves.set(fileName, content);
				}
			});
			saveStatus = 'Unsaved changes';
		}
	}

	/** Call only on local user input (not remote Yjs syncs). */
	function triggerAutoSave(fileName: string, content: string) {
		const project = getProject();
		const projectId = isPersistedProject(project) ? project._id : undefined;

		if (!convexClient || !projectId || !project) {
			saveStatus = 'Session only';
			return;
		}

		const normalizedName = resolveProjectFileName(fileName, project.files);

		saveStatus = 'Unsaved changes';
		pendingSaves.set(normalizedName, content);
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(flushPendingSaves, 1500);
	}

	/** Force an immediate save — useful on tab switch or beforeunload. */
	async function forceSave(fileName: string, content: string) {
		const project = getProject();
		if (project) {
			pendingSaves.set(resolveProjectFileName(fileName, project.files), content);
		} else {
			pendingSaves.set(fileName, content);
		}
		clearTimeout(saveTimeout);
		await flushPendingSaves();
	}

	function cleanup() {
		clearTimeout(saveTimeout);
	}

	return {
		get status() {
			return saveStatus;
		},
		triggerAutoSave,
		forceSave,
		cleanup
	};
}
