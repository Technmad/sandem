// src/lib/hooks/createProjectMounter.svelte.ts
import type { WebContainer } from '@webcontainer/api';
import type { Doc } from '$convex/_generated/dataModel.js';
import type { ProjectFile } from '$lib/utils/template.js';

async function ensureParentDir(wc: WebContainer, fileName: string) {
	const parts = fileName.split('/');
	if (parts.length > 1) {
		const dir = parts.slice(0, -1).join('/');
		await wc.fs.mkdir(dir, { recursive: true });
	}
}

async function writeWcFile(wc: WebContainer, fileName: string, content: string) {
	await ensureParentDir(wc, fileName);
	await wc.fs.writeFile(fileName, content);
}

/**
 * Copies an entire project's file list into the WebContainer.
 */
export function createProjectMounter(
	getWebcontainer: () => WebContainer,
	getProject: () => Doc<'projects'>
) {
	let mounted = $state(false);
	let mountError = $state<string | null>(null);

	async function mountProjectFiles() {
		const wc = getWebcontainer();
		const project = getProject();

		try {
			for (const file of project.files as ProjectFile[]) {
				await writeWcFile(wc, file.name, file.contents ?? '');
			}
			mounted = true;
			mountError = null;
		} catch (err) {
			console.error('Failed to mount project files into WebContainer', err);
			mountError = String(err);
			mounted = false;
		}
	}

	return {
		get mounted() {
			return mounted;
		},
		get mountError() {
			return mountError;
		},
		mountProjectFiles
	};
}
