/**
 * Utilities for syncing between WebContainer folders and Convex projects
 *
 * Single source of truth: Convex projects table
 * WebContainer folders are derived from and synced with Convex
 */

import type { WebContainer } from '@webcontainer/api';

/**
 * Initialize a project folder in WebContainer
 * Called when a new project is created in Convex
 */
export async function initializeProjectFolder(
	wc: WebContainer,
	projectId: string,
	projectName: string
): Promise<boolean> {
	try {
		// Create project folder at root
		await wc.fs.mkdir(projectId);

		// Optionally create README
		const readmeContent = `# ${projectName}\n\nNew project created at ${new Date().toISOString()}\n`;
		await wc.fs.writeFile(`${projectId}/README.md`, readmeContent);

		return true;
	} catch (err) {
		console.error(`Failed to initialize project folder ${projectId}:`, err);
		return false;
	}
}

/**
 * Delete a project folder from WebContainer
 * Called when a project is deleted from Convex
 */
export async function deleteProjectFolder(wc: WebContainer, projectId: string): Promise<boolean> {
	try {
		// Recursively remove folder
		await wc.fs.rm(projectId, { recursive: true });
		return true;
	} catch (err) {
		console.error(`Failed to delete project folder ${projectId}:`, err);
		return false;
	}
}

/**
 * Serialize project files from WebContainer to JSON
 * Used for saving to Convex
 */
export async function serializeProjectFiles(
	wc: WebContainer,
	projectId: string
): Promise<Array<{ name: string; contents: string }>> {
	const files: Array<{ name: string; contents: string }> = [];

	async function walk(dirPath: string) {
		const entries = await wc.fs.readdir(dirPath, { withFileTypes: true });

		for (const entry of entries) {
			const fullPath = `${dirPath}/${entry.name}`;

			if (entry.isDirectory()) {
				await walk(fullPath);
			} else {
				const contents = await wc.fs.readFile(fullPath, 'utf-8');
				// Store relative path (without project ID prefix)
				const relativePath = fullPath.replace(`${projectId}/`, '');
				files.push({ name: relativePath, contents });
			}
		}
	}

	try {
		await walk(projectId);
	} catch (err) {
		console.error(`Failed to serialize project ${projectId}:`, err);
	}

	return files;
}

/**
 * Hydrate project files from Convex to WebContainer
 * Used when loading a project from DB
 */
export async function hydrateProjectFiles(
	wc: WebContainer,
	projectId: string,
	files: Array<{ name: string; contents: string }>
): Promise<boolean> {
	try {
		// Ensure project folder exists
		await wc.fs.mkdir(projectId).catch(() => {
			// Folder might already exist
		});

		// Write all files
		for (const file of files) {
			const filePath = `${projectId}/${file.name}`;

			// Create parent directories
			const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
			if (dirPath !== projectId) {
				await wc.fs.mkdir(dirPath, { recursive: true }).catch(() => {
					// Directory might already exist
				});
			}

			await wc.fs.writeFile(filePath, file.contents);
		}

		return true;
	} catch (err) {
		console.error(`Failed to hydrate project ${projectId}:`, err);
		return false;
	}
}

/**
 * Validate project folder exists in WebContainer
 */
export async function projectFolderExists(wc: WebContainer, projectId: string): Promise<boolean> {
	try {
		const entries = await wc.fs.readdir('.');
		return entries.includes(projectId);
	} catch {
		return false;
	}
}
