import type { WebContainer } from '@webcontainer/api';
import { getRootFolder } from '$lib/utils/project/filesystem.js';
import type { FileNode } from '$types/editor.js';
import type { ExplorerActivityDeps } from '../../../types/hooks.js';

export function createExplorerActivity(deps: ExplorerActivityDeps) {
	let actionMessage = $state('');
	let actionError = $state('');

	function getWebcontainer(): WebContainer {
		return deps.getWebcontainer();
	}

	function clearActionState() {
		actionMessage = '';
		actionError = '';
	}

	function getProjectRootPath() {
		return getRootFolder(deps.getActiveTabPath() ?? deps.getEntryPath());
	}

	function normalizeToProjectPath(input: string) {
		const value = input.trim().replace(/^\/+/, '');
		if (!value) return '';

		const firstSegment = value.split('/')[0] ?? '';
		const isKnownWorkspaceRoot = deps.fileTree.tree.some(
			(node) => node.depth === 0 && node.type === 'directory' && node.name === firstSegment
		);
		if (isKnownWorkspaceRoot) return value;

		const root = getProjectRootPath();
		if (value.startsWith(`${root}/`) || value === root) return value;
		return `${root}/${value}`;
	}

	function handleFileClick(node: FileNode) {
		deps.openFile(node.path);
	}

	function handleDirClick(node: FileNode) {
		deps.fileTree.toggleDir(node.path);
	}

	function collapseAllTree(nodes: FileNode[] = deps.fileTree.tree) {
		for (const node of nodes) {
			if (node.type !== 'directory') continue;

			if (deps.fileTree.isExpanded(node.path)) {
				deps.fileTree.toggleDir(node.path);
			}

			if (node.children?.length) {
				collapseAllTree(node.children);
			}
		}
	}

	function expandAllTree(nodes: FileNode[] = deps.fileTree.tree) {
		for (const node of nodes) {
			if (node.type !== 'directory') continue;
			if (!deps.fileTree.isExpanded(node.path)) {
				deps.fileTree.toggleDir(node.path);
			}
			if (node.children?.length) {
				expandAllTree(node.children);
			}
		}
	}

	async function createFile() {
		clearActionState();
		if (!deps.projectSync.canWrite()) {
			actionError = 'You have viewer access. File changes are disabled.';
			return;
		}

		const name = window.prompt('New file path', 'src/new-file.ts');
		if (!name) return;

		const fullPath = normalizeToProjectPath(name);
		if (!fullPath) return;

		try {
			const segments = fullPath.split('/');
			const fileName = segments.pop();
			if (!fileName) return;

			const directory = segments.join('/');
			if (directory) {
				await getWebcontainer().fs.mkdir(directory, { recursive: true });
			}

			await getWebcontainer().fs.writeFile(fullPath, '', 'utf-8');
			await deps.projectSync.createFile(fullPath, '');
			deps.openFile(fullPath);
			await deps.fileTree.refresh();
			actionMessage = `Created ${fullPath}`;
		} catch (error) {
			actionError = `Could not create file: ${String(error)}`;
		}
	}

	async function createFolder() {
		clearActionState();
		if (!deps.projectSync.canWrite()) {
			actionError = 'You have viewer access. Folder changes are disabled.';
			return;
		}

		const name = window.prompt('New folder path', 'src/new-folder');
		if (!name) return;

		const fullPath = normalizeToProjectPath(name);
		if (!fullPath) return;

		try {
			await getWebcontainer().fs.mkdir(fullPath, { recursive: true });
			await deps.projectSync.createDirectory(fullPath);
			await deps.fileTree.refresh();
			actionMessage = `Created ${fullPath}/`;
		} catch (error) {
			actionError = `Could not create folder: ${String(error)}`;
		}
	}

	async function renamePath() {
		clearActionState();
		if (!deps.projectSync.canWrite()) {
			actionError = 'You have viewer access. Rename is disabled.';
			return;
		}

		const oldPath = window.prompt('Rename from path', 'src/new-file.ts');
		if (!oldPath) return;
		const nextPath = window.prompt('Rename to path', oldPath.replace(/\.ts$/, '.renamed.ts'));
		if (!nextPath) return;

		const from = normalizeToProjectPath(oldPath);
		const to = normalizeToProjectPath(nextPath);
		if (!from || !to) return;

		try {
			await getWebcontainer().fs.rename(from, to);
			await deps.projectSync.renamePath(from, to);
			await deps.fileTree.refresh();
			actionMessage = `Renamed ${from} → ${to}`;
		} catch (error) {
			actionError = `Could not rename path: ${String(error)}`;
		}
	}

	async function deletePath() {
		clearActionState();
		if (!deps.projectSync.canWrite()) {
			actionError = 'You have viewer access. Delete is disabled.';
			return;
		}

		const target = window.prompt('Delete file/folder path', 'src/new-file.ts');
		if (!target) return;
		const fullPath = normalizeToProjectPath(target);
		if (!fullPath) return;

		const confirmed = window.confirm(`Delete ${fullPath}? This cannot be undone.`);
		if (!confirmed) return;

		try {
			await getWebcontainer().fs.rm(fullPath, { recursive: true, force: true });
			await deps.projectSync.deletePath(fullPath);
			await deps.fileTree.refresh();
			actionMessage = `Deleted ${fullPath}`;
		} catch (error) {
			actionError = `Could not delete path: ${String(error)}`;
		}
	}

	function toggleAllFolders() {
		const hasExpanded = deps.fileTree.tree.some(
			(node) => node.type === 'directory' && deps.fileTree.isExpanded(node.path)
		);

		if (hasExpanded) {
			collapseAllTree();
			actionMessage = 'Collapsed all folders';
			return;
		}

		expandAllTree();
		actionMessage = 'Expanded all folders';
	}

	async function refreshTree() {
		clearActionState();
		await deps.fileTree.refresh();
		actionMessage = 'Explorer refreshed';
	}

	async function refreshAndExpandAll() {
		clearActionState();
		await deps.fileTree.refresh();
		expandAllTree();
		actionMessage = 'Explorer synced';
	}

	function delay(ms: number) {
		return new Promise<void>((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	async function bootstrapInitialTreeSync() {
		// Some sessions race runtime/project mount; retry until tree is populated
		// so folders appear without requiring a manual refresh click.
		const attempts = 80; // 24 seconds at 300ms intervals
		let previousTreeLength = 0;
		let stabilizedCount = 0;
		const stabilizeThreshold = 3; // Tree must not grow for 3 consecutive checks

		for (let i = 0; i < attempts; i += 1) {
			await deps.fileTree.refresh({ silent: true });
			const currentTreeLength = deps.fileTree.tree.length;

			if (currentTreeLength === 0) {
				// Reset if tree is empty - wait for content
				stabilizedCount = 0;
				previousTreeLength = 0;
				await delay(300);
				continue;
			}

			if (currentTreeLength === previousTreeLength) {
				// Tree size didn't change from last refresh
				stabilizedCount++;
				if (stabilizedCount >= stabilizeThreshold) {
					// Tree has stabilized - exit bootstrap
					return;
				}
			} else {
				// Tree size changed - reset stabilization counter
				stabilizedCount = 0;
			}

			previousTreeLength = currentTreeLength;
			await delay(300);
		}
	}

	function start() {
		try {
			deps.projectSync.start();
		} catch (error) {
			actionError = `Could not start project sync: ${String(error)}`;
		}

		deps.fileTree.startAutoRefresh(850);
		void deps.fileTree.refresh({ silent: true });
		void bootstrapInitialTreeSync();
	}

	function stop() {
		deps.projectSync.stop();
		deps.fileTree.stopAutoRefresh();
	}

	return {
		get actionMessage() {
			return actionMessage;
		},
		get actionError() {
			return actionError;
		},
		handleFileClick,
		handleDirClick,
		createFile,
		createFolder,
		renamePath,
		deletePath,
		toggleAllFolders,
		refreshTree,
		refreshAndExpandAll,
		start,
		stop
	};
}
