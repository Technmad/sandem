// src/lib/hooks/createAutoSaver.svelte.ts
import { useConvexClient } from 'convex-svelte';
import { api } from '$convex/_generated/api.js';
import type { Doc } from '$convex/_generated/dataModel.js';

export function createAutoSaver(getProject: () => Doc<'projects'> | undefined) {
	const convexClient = useConvexClient();

	let saveStatus = $state<'Saved' | 'Saving...' | 'Unsaved changes'>('Saved');
	let saveTimeout: ReturnType<typeof setTimeout> | undefined;

	// Track in-flight saves to avoid clobbering with stale data
	const pendingSaves = new Map<string, string>(); // fileName -> latest content to save

	async function flushPendingSaves() {
		const project = getProject();
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

			await convexClient.mutation(api.projects.updateProject, {
				id: project._id,
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
		saveStatus = 'Unsaved changes';
		pendingSaves.set(fileName, content);
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(flushPendingSaves, 1500);
	}

	/** Force an immediate save — useful on tab switch or beforeunload. */
	async function forceSave(fileName: string, content: string) {
		pendingSaves.set(fileName, content);
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
