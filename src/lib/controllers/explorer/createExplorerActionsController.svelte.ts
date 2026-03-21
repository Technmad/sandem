/**
 * Explorer actions: Create/Delete folders at root
 * These trigger Convex mutations and update the file tree
 */

import type { FileNode } from '$types/editor.js';

export interface ExplorerActionContext {
	projectSync: {
		createProjectFolder(title: string): Promise<string | null>;
		deleteProjectFolder(): Promise<boolean>;
	};
	fileTree: {
		refresh(): Promise<void>;
	};
}

export function createExplorerActionsController(context: ExplorerActionContext) {
	const { projectSync, fileTree } = context;

	let creatingFolder = $state(false);
	let deletingFolder = $state(false);
	let error = $state<string | null>(null);

	/**
	 * Create a new project folder at root
	 * Flow: UI → createProject mutation in Convex → refresh file tree
	 */
	async function createFolderAtRoot(folderName: string): Promise<boolean> {
		creatingFolder = true;
		error = null;

		try {
			const projectId = await projectSync.createProjectFolder(folderName);
			if (!projectId) {
				error = 'Failed to create project';
				return false;
			}

			// Refresh file tree to show new folder
			await fileTree.refresh();
			return true;
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			return false;
		} finally {
			creatingFolder = false;
		}
	}

	/**
	 * Delete a project folder at root
	 * Flow: UI → deleteProject mutation in Convex → refresh file tree
	 */
	async function deleteFolderAtRoot(): Promise<boolean> {
		deletingFolder = true;
		error = null;

		try {
			const success = await projectSync.deleteProjectFolder();
			if (!success) {
				error = 'Failed to delete project';
				return false;
			}

			// Refresh file tree
			await fileTree.refresh();
			return true;
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			return false;
		} finally {
			deletingFolder = false;
		}
	}

	/**
	 * Rename a folder (optional - requires update mutation)
	 */
	async function renameFolderAtRoot(): Promise<boolean> {
		// TODO: Implement rename
		error = 'Rename not yet implemented';
		return false;
	}

	/**
	 * Check if node is a root-level project folder
	 */
	function isRootProjectFolder(node: FileNode | null): boolean {
		if (!node) return false;
		// Root projects have depth 0 and are directories
		return node.depth === 0 && node.type === 'directory';
	}

	return {
		get creatingFolder() {
			return creatingFolder;
		},
		get deletingFolder() {
			return deletingFolder;
		},
		get error() {
			return error;
		},
		createFolderAtRoot,
		deleteFolderAtRoot,
		renameFolderAtRoot,
		isRootProjectFolder
	};
}
