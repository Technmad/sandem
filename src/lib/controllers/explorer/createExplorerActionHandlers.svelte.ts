/**
 * Pure, testable action handlers for Explorer operations.
 * These functions take dependencies as parameters (data injection pattern).
 */
import type { WebContainer } from '@webcontainer/api';
import type { FileTreeController, ProjectSyncController } from '$types/hooks';
import type { IDEProject } from '$types/projects';
import type { FileNode } from '$types/editor';
import { projectFolderName } from '$lib/utils/project/projects.js';
import {
	findNode,
	getAllDirectoryPaths,
	validateProjectRelativePath
} from '$lib/utils/editor/explorerTreeOps.js';

export type ExplorerActionContext = {
	fileTree: FileTreeController;
	projectSync: ProjectSyncController;
	editorOpenFile: (path: string) => void;
	getWebcontainer: () => WebContainer;
	getActiveProject: () => IDEProject | undefined;
	tree: FileNode[];
	selectedPath: string | null;
	onMessage: (msg: string) => void;
	onError: (msg: string) => void;
};

function validateRequiredPathInput(value: string, label: string): string {
	const normalized = value.trim();
	if (!normalized) {
		throw new Error(`${label} is required`);
	}
	return normalized;
}

/**
 * Create file action handler
 */
export async function handleCreateFile(ctx: ExplorerActionContext, requestedPath: string) {
	if (!ctx.projectSync.canWrite()) {
		ctx.onError('You have viewer access. File changes are disabled.');
		return false;
	}

	try {
		const input = validateRequiredPathInput(requestedPath, 'File path');
		const fullPath = normalizeToProjectPath(input, ctx.tree, ctx.getActiveProject?.());
		const validatedPath = validateProjectRelativePath(fullPath);
		const segments = validatedPath.split('/');
		const fileName = segments.pop();

		if (!fileName) throw new Error('Invalid file name');

		const directory = segments.join('/');
		if (directory) {
			await ctx.getWebcontainer().fs.mkdir(directory, { recursive: true });
		}

		await ctx.getWebcontainer().fs.writeFile(validatedPath, '', 'utf-8');
		await ctx.projectSync.createFile(validatedPath, '');
		ctx.editorOpenFile(validatedPath);
		await ctx.fileTree.refresh();
		ctx.onMessage(`Created ${validatedPath}`);
		return true;
	} catch (error) {
		ctx.onError(`Could not create file: ${String(error)}`);
		return false;
	}
}

/**
 * Create folder action handler
 */
export async function handleCreateFolder(ctx: ExplorerActionContext, requestedPath: string) {
	if (!ctx.projectSync.canWrite()) {
		ctx.onError('You have viewer access. Folder changes are disabled.');
		return false;
	}

	try {
		const input = validateRequiredPathInput(requestedPath, 'Folder path');
		const fullPath = normalizeToProjectPath(input, ctx.tree, ctx.getActiveProject?.());
		const validatedPath = validateProjectRelativePath(fullPath);
		await ctx.getWebcontainer().fs.mkdir(validatedPath, { recursive: true });
		await ctx.projectSync.createDirectory(validatedPath);
		await ctx.fileTree.refresh();
		ctx.onMessage(`Created folder ${validatedPath}`);
		return true;
	} catch (error) {
		ctx.onError(`Could not create folder: ${String(error)}`);
		return false;
	}
}

/**
 * Rename node action handler
 */
export async function handleRenameNode(ctx: ExplorerActionContext, requestedPath: string) {
	if (!ctx.selectedPath) {
		ctx.onError('Please select a file or folder first.');
		return false;
	}

	if (!ctx.projectSync.canWrite()) {
		ctx.onError('You have viewer access. Rename is disabled.');
		return false;
	}

	const node = findNode(ctx.tree, ctx.selectedPath);
	if (!node) return false;

	try {
		const input = validateRequiredPathInput(requestedPath, 'New path');
		const currentPath = validateProjectRelativePath(ctx.selectedPath);
		const fullNewPath = normalizeToProjectPath(input, ctx.tree, ctx.getActiveProject?.());
		const validatedNewPath = validateProjectRelativePath(fullNewPath);

		if (validatedNewPath === currentPath) {
			ctx.onError('New path must be different from the current path.');
			return false;
		}

		await ctx.projectSync.renamePath(currentPath, validatedNewPath);
		await ctx.fileTree.refresh();
		ctx.onMessage(`Renamed to ${validatedNewPath}`);
		return true;
	} catch (error) {
		ctx.onError(`Could not rename: ${String(error)}`);
		return false;
	}
}

/**
 * Delete node action handler
 */
export async function handleDeleteNode(ctx: ExplorerActionContext) {
	if (!ctx.selectedPath) {
		ctx.onError('Please select a file or folder first.');
		return false;
	}

	if (!ctx.projectSync.canWrite()) {
		ctx.onError('You have viewer access. Delete is disabled.');
		return false;
	}

	const node = findNode(ctx.tree, ctx.selectedPath);
	if (node?.type === 'directory' && node.depth === 0) {
		ctx.onError('Deleting a project root folder is not supported from this action.');
		return false;
	}

	try {
		const targetPath = validateProjectRelativePath(ctx.selectedPath);
		await ctx.projectSync.deletePath(targetPath);
		await ctx.fileTree.refresh();
		ctx.onMessage(`Deleted ${targetPath}`);
		return true;
	} catch (error) {
		ctx.onError(`Could not delete: ${String(error)}`);
		return false;
	}
}

/**
 * Refresh tree action handler
 */
export async function handleRefreshTree(ctx: ExplorerActionContext) {
	await ctx.fileTree.refresh();
	ctx.onMessage('Explorer refreshed');
}

/**
 * Expand all directories
 */
export function handleExpandAll(ctx: ExplorerActionContext) {
	const allDirs = getAllDirectoryPaths(ctx.tree);
	let expandedCount = 0;

	for (const path of allDirs) {
		if (!ctx.fileTree.isExpanded(path)) {
			ctx.fileTree.toggleDir(path);
			expandedCount++;
		}
	}

	ctx.onMessage(
		expandedCount > 0 ? `Expanded ${expandedCount} folder(s)` : 'All folders already expanded'
	);
}

/**
 * Collapse all directories
 */
export function handleCollapseAll(ctx: ExplorerActionContext) {
	const allDirs = getAllDirectoryPaths(ctx.tree);
	let collapsedCount = 0;

	for (const path of allDirs) {
		if (ctx.fileTree.isExpanded(path)) {
			ctx.fileTree.toggleDir(path);
			collapsedCount++;
		}
	}

	ctx.onMessage(
		collapsedCount > 0 ? `Collapsed ${collapsedCount} folder(s)` : 'All folders already collapsed'
	);
}

/**
 * Refresh and expand all
 */
export async function handleRefreshAndExpandAll(ctx: ExplorerActionContext) {
	await ctx.fileTree.refresh();
	handleExpandAll(ctx);
	ctx.onMessage('Explorer synced');
}

/**
 * Normalize path to project path (pure utility)
 */
export function normalizeToProjectPath(
	input: string,
	tree: FileNode[],
	activeProject?: IDEProject
): string {
	const value = validateProjectRelativePath(input);

	// If path starts with a known root, use it as-is
	const firstSegment = value.split('/')[0] ?? '';
	const isKnownRoot = tree.some(
		(node) => node.depth === 0 && node.type === 'directory' && node.name === firstSegment
	);

	if (isKnownRoot) return value;

	// Otherwise, prepend the active project root
	if (activeProject && '_id' in activeProject) {
		const rootFolder = projectFolderName(activeProject._id, activeProject.title);
		if (!value.startsWith(`${rootFolder}/`)) {
			return validateProjectRelativePath(`${rootFolder}/${value}`);
		}
	}

	return validateProjectRelativePath(value);
}
