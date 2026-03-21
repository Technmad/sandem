import type { WebContainer } from '@webcontainer/api';

async function ensureParentDir(wc: WebContainer, fileName: string) {
	const parts = fileName.split('/');
	if (parts.length > 1) {
		const dir = parts.slice(0, -1).join('/');
		await wc.fs.mkdir(dir, { recursive: true });
	}
}

/**
 * Writes a single file into the WebContainer. Used by the editor on every change.
 */
export function createFileWriter(getWebcontainer: () => WebContainer) {
	async function writeFile(fileName: string, content: string) {
		const wc = getWebcontainer();
		try {
			await ensureParentDir(wc, fileName);
			await wc.fs.writeFile(fileName, content);
		} catch (err) {
			console.error(`Failed to write ${fileName} to WebContainer`, err);
		}
	}

	return { writeFile };
}
