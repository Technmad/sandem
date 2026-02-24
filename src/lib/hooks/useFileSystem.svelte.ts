import type { WebContainer } from '@webcontainer/api';
import type { Doc } from '$convex/_generated/dataModel.js';

/**
 * Mounts all project files into the WebContainer filesystem.
 * Should be called once when the container is ready and project data is loaded.
 * Also exposes a method to write a single file (used by the editor on save).
 */
export function useFilesystem(
	getWebcontainer: () => WebContainer,
	getProject: () => Doc<'projects'>
) {
	let mounted = $state(false);
	let mountError = $state<string | null>(null);

	/**
	 * Writes all project files into the WebContainer.
	 * Safe to call multiple times — will overwrite.
	 */
	async function mountProjectFiles() {
		const wc = getWebcontainer();
		const project = getProject();

		try {
			for (const file of project.files) {
				// Ensure parent directories exist
				const parts = file.name.split('/');
				if (parts.length > 1) {
					const dir = parts.slice(0, -1).join('/');
					await wc.fs.mkdir(dir, { recursive: true });
				}
				await wc.fs.writeFile(file.name, file.contents ?? '');
			}
			mounted = true;
			mountError = null;
		} catch (err) {
			console.error('Failed to mount project files into WebContainer', err);
			mountError = String(err);
			mounted = false;
		}
	}

	/**
	 * Writes a single file to the WebContainer filesystem.
	 * Call this after every successful Convex save to keep FS in sync.
	 */
	async function writeFile(fileName: string, content: string) {
		const wc = getWebcontainer();
		try {
			const parts = fileName.split('/');
			if (parts.length > 1) {
				const dir = parts.slice(0, -1).join('/');
				await wc.fs.mkdir(dir, { recursive: true });
			}
			await wc.fs.writeFile(fileName, content);
		} catch (err) {
			console.error(`Failed to write ${fileName} to WebContainer`, err);
		}
	}

	return {
		get mounted() {
			return mounted;
		},
		get mountError() {
			return mountError;
		},
		mountProjectFiles,
		writeFile
	};
}
