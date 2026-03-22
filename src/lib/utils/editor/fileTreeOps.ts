import type { WebContainer } from '@webcontainer/api';
import type { FileNode } from '$types/editor.js';

const IGNORE = new Set(['.git', 'node_modules', '.svelte-kit', 'dist', '.cache']);

/**
 * Recursively read directory structure from WebContainer
 */
export async function readDirRecursive(
	wc: WebContainer,
	dirPath: string,
	rootFolders: ReadonlySet<string>,
	depth = 0
): Promise<FileNode[]> {
	const entries = await wc.fs.readdir(dirPath, { withFileTypes: true });
	const relevantEntries = entries.filter((entry) => {
		if (IGNORE.has(entry.name)) return false;
		if (dirPath !== '.') return true;
		if (rootFolders.size === 0) return true;
		return entry.isDirectory() && rootFolders.has(entry.name);
	});

	if (dirPath === '.' && depth === 0) {
		console.debug(
			'[readDirRecursive] At root: found',
			entries.length,
			'entries, keeping',
			relevantEntries.length,
			'relevant (rootFolders.size:',
			rootFolders.size,
			') rootFolders:',
			Array.from(rootFolders)
		);
	}

	const nodes = await Promise.all(
		relevantEntries.map(async (entry) => {
			const fullPath = dirPath === '.' ? entry.name : `${dirPath}/${entry.name}`;

			if (entry.isDirectory()) {
				const children = await readDirRecursive(wc, fullPath, rootFolders, depth + 1);
				return { name: entry.name, path: fullPath, type: 'directory', children, depth } as FileNode;
			}

			return { name: entry.name, path: fullPath, type: 'file', depth } as FileNode;
		})
	);

	return nodes.sort((a, b) => {
		if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
		return a.name.localeCompare(b.name);
	});
}

/**
 * Generate a unique signature for the file tree structure
 */
export function createSignature(nodes: FileNode[]): string {
	const out: string[] = [];

	function walk(list: FileNode[]) {
		for (const node of list) {
			out.push(`${node.type}:${node.path}`);
			if (node.children) walk(node.children);
		}
	}

	walk(nodes);
	return out.join('|');
}

/**
 * Collect all directory paths from file tree
 */
export function collectDirectoryPaths(nodes: FileNode[], out = new Set<string>()): Set<string> {
	for (const node of nodes) {
		if (node.type !== 'directory') continue;
		out.add(node.path);
		if (node.children?.length) {
			collectDirectoryPaths(node.children, out);
		}
	}
	return out;
}

/**
 * Prune expanded state to only include existing directories
 */
export function pruneExpandedState(
	expanded: Record<string, true>,
	nextTree: FileNode[]
): Record<string, true> {
	const existingDirectories = collectDirectoryPaths(nextTree);
	return Object.fromEntries(
		Object.entries(expanded).filter(([path]) => existingDirectories.has(path))
	) as Record<string, true>;
}

/**
 * Find a node by path in the tree (breadth-first search)
 */
export function findNodeByPath(nodes: FileNode[], targetPath: string): FileNode | undefined {
	const queue = [...nodes];
	while (queue.length > 0) {
		const node = queue.shift();
		if (!node) continue;
		if (node.path === targetPath) return node;
		if (node.children?.length) queue.push(...node.children);
	}
	return undefined;
}
