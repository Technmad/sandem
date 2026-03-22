/**
 * Pure, testable action handlers for Explorer operations.
 * These functions take dependencies as parameters (data injection pattern).
 */
import type { WebContainer } from '@webcontainer/api';
import type { FileTreeController, ProjectSyncController } from '$types/hooks';
import type { IDEProject } from '$types/projects';
import type { FileNode } from '$types/editor';
import { projectFolderName } from '$lib/utils/project/projects.js';
import { findNode, getAllDirectoryPaths } from '$lib/utils/editor/explorerTreeOps.js';

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

/**
 * Create file action handler
 */
export async function handleCreateFile(ctx: ExplorerActionContext) {
	if (!ctx.projectSync.canWrite()) {
		ctx.onError('You have viewer access. File changes are disabled.');
		return;
	}

	const selectedDirectory = getSelectedDirectory(ctx.tree, ctx.selectedPath);
	const suggestedPath = selectedDirectory ? `${selectedDirectory}/new-file.ts` : 'src/new-file.ts';
	const path = window.prompt('New file path', suggestedPath);
	if (!path) return;

	try {
		const fullPath = normalizeToProjectPath(path, ctx.tree, ctx.getActiveProject?.());
		const segments = fullPath.split('/');
		const fileName = segments.pop();

		if (!fileName) throw new Error('Invalid file name');

		const directory = segments.join('/');
		if (directory) {
			await ctx.getWebcontainer().fs.mkdir(directory, { recursive: true });
		}

		await ctx.getWebcontainer().fs.writeFile(fullPath, '', 'utf-8');
		await ctx.projectSync.createFile(fullPath, '');
		ctx.editorOpenFile(fullPath);
		await ctx.fileTree.refresh();
		ctx.onMessage(`Created ${fullPath}`);
	} catch (error) {
		ctx.onError(`Could not create file: ${String(error)}`);
	}
}

/**
 * Create folder action handler
 */
export async function handleCreateFolder(ctx: ExplorerActionContext) {
	if (!ctx.projectSync.canWrite()) {
		ctx.onError('You have viewer access. Folder changes are disabled.');
		return;
	}

	const selectedDirectory = getSelectedDirectory(ctx.tree, ctx.selectedPath);
	const suggestedPath = selectedDirectory ? `${selectedDirectory}/new-folder` : 'src/new-folder';
	const path = window.prompt('New folder path', suggestedPath);
	if (!path) return;

	try {
		const fullPath = normalizeToProjectPath(path, ctx.tree, ctx.getActiveProject?.());
		await ctx.getWebcontainer().fs.mkdir(fullPath, { recursive: true });
		await ctx.projectSync.createDirectory(fullPath);
		await ctx.fileTree.refresh();
		ctx.onMessage(`Created folder ${fullPath}`);
	} catch (error) {
		ctx.onError(`Could not create folder: ${String(error)}`);
	}
}

/**
 * Rename node action handler
 */
export async function handleRenameNode(ctx: ExplorerActionContext) {
	if (!ctx.selectedPath) {
		ctx.onError('Please select a file or folder first.');
		return;
	}

	if (!ctx.projectSync.canWrite()) {
		ctx.onError('You have viewer access. Rename is disabled.');
		return;
	}

	const node = findNode(ctx.tree, ctx.selectedPath);
	if (!node) return;

	const newPath = window.prompt('New path', ctx.selectedPath);
	if (!newPath || newPath === ctx.selectedPath) return;

	try {
		const fullNewPath = normalizeToProjectPath(newPath, ctx.tree, ctx.getActiveProject?.());
		await ctx.projectSync.renamePath(ctx.selectedPath, fullNewPath);
		await ctx.fileTree.refresh();
		ctx.onMessage(`Renamed to ${fullNewPath}`);
	} catch (error) {
		ctx.onError(`Could not rename: ${String(error)}`);
	}
}

/**
 * Delete node action handler
 */
export async function handleDeleteNode(ctx: ExplorerActionContext) {
	if (!ctx.selectedPath) {
		ctx.onError('Please select a file or folder first.');
		return;
	}

	if (!ctx.projectSync.canWrite()) {
		ctx.onError('You have viewer access. Delete is disabled.');
		return;
	}

	const confirmed = window.confirm(`Delete ${ctx.selectedPath}? This cannot be undone.`);
	if (!confirmed) return;

	const node = findNode(ctx.tree, ctx.selectedPath);
	if (node?.type === 'directory' && node.depth === 0) {
		ctx.onError('Deleting a project root folder is not supported from this action.');
		return;
	}

	try {
		await ctx.projectSync.deletePath(ctx.selectedPath);
		await ctx.fileTree.refresh();
		ctx.onMessage(`Deleted ${ctx.selectedPath}`);
	} catch (error) {
		ctx.onError(`Could not delete: ${String(error)}`);
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
	const value = input.trim().replace(/^\/+/, '');
	if (!value) return '';

	// If path starts with a known root, use it as-is
	const firstSegment = value.split('/')[0] ?? '';
	const isKnownRoot = tree.some(
		(node) => node.depth === 0 && node.type === 'directory' && node.name === firstSegment
	);

	if (isKnownRoot) return value;

	// Otherwise, prepend the active project root
	if (activeProject && '_id' in activeProject) {
		const rootFolder = projectFolderName(activeProject._id);
		if (!value.startsWith(`${rootFolder}/`)) {
			return `${rootFolder}/${value}`;
		}
	}

	return value;
}

function getSelectedDirectory(tree: FileNode[], selectedPath: string | null): string | null {
	if (!selectedPath) return null;

	const selectedNode = findNode(tree, selectedPath);
	if (selectedNode?.type === 'directory') {
		return selectedNode.path;
	}

	if (selectedNode?.type === 'file') {
		const segments = selectedNode.path.split('/');
		segments.pop();
		const parent = segments.join('/');
		return parent || null;
	}

	return null;
}
