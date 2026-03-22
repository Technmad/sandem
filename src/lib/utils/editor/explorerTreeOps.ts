/**
 * Pure functions for explorer tree operations
 * - No side effects
 * - Functional transformations
 * - Used for filtering, sorting, searching, expanding/collapsing
 */

import type { FileNode } from '$types/editor.js';

/**
 * Validate and normalize a project-relative path.
 *
 * Security rules:
 * - Must be relative (no leading slash, drive letter, or UNC prefix)
 * - Must not contain traversal/current-dir segments (`..`, `.`)
 * - Must not contain empty segments
 * - Must not contain Windows-invalid filename characters
 */
export function validateProjectRelativePath(input: string): string {
	function hasControlCharacters(value: string): boolean {
		for (const char of value) {
			if (char.charCodeAt(0) < 32) return true;
		}
		return false;
	}

	const trimmed = input.trim();
	if (!trimmed) {
		throw new Error('Path is required.');
	}

	if (/^[a-zA-Z]:[\\/]/.test(trimmed)) {
		throw new Error('Absolute paths are not allowed.');
	}

	if (trimmed.startsWith('/') || trimmed.startsWith('\\')) {
		throw new Error('Absolute paths are not allowed.');
	}

	const normalized = trimmed.replace(/\\+/g, '/');
	if (normalized.startsWith('//')) {
		throw new Error('Absolute paths are not allowed.');
	}

	const segments = normalized.split('/');
	for (const segment of segments) {
		if (!segment) {
			throw new Error('Path contains an empty segment.');
		}

		if (segment === '.' || segment === '..') {
			throw new Error('Path traversal segments are not allowed.');
		}

		if (/[<>:"|?*]/.test(segment) || hasControlCharacters(segment)) {
			throw new Error(`Invalid path segment: ${segment}`);
		}

		if (/[. ]$/.test(segment)) {
			throw new Error(`Invalid path segment: ${segment}`);
		}
	}

	return segments.join('/');
}

/**
 * Find a node by path in the tree
 */
export function findNode(nodes: FileNode[], path: string): FileNode | undefined {
	for (const node of nodes) {
		if (node.path === path) return node;
		if (node.children) {
			const found = findNode(node.children, path);
			if (found) return found;
		}
	}
	return undefined;
}

/**
 * Get all descendant nodes of a node
 */
export function getAllDescendants(node: FileNode): FileNode[] {
	if (!node.children) return [];
	return [...node.children, ...node.children.flatMap((child) => getAllDescendants(child))];
}

/**
 * Get all ancestor paths of a node
 */
export function getAncestorPaths(path: string): string[] {
	const parts = path.split('/');
	const ancestors: string[] = [];
	for (let i = 1; i < parts.length; i++) {
		ancestors.push(parts.slice(0, i).join('/'));
	}
	return ancestors.reverse();
}

/**
 * Filter nodes by search query (case-insensitive substring match)
 */
export function filterNodesByQuery(nodes: FileNode[], query: string): FileNode[] {
	if (!query.trim()) return nodes;

	const lower = query.toLowerCase();

	function matches(node: FileNode): boolean {
		return node.name.toLowerCase().includes(lower);
	}

	function walk(nodeList: FileNode[]): FileNode[] {
		const filtered: FileNode[] = [];

		for (const node of nodeList) {
			const nodeMatches = matches(node);
			const children = node.children ? walk(node.children) : [];
			const childrenMatch = children.length > 0;

			if (!(nodeMatches || childrenMatch)) {
				continue;
			}

			if (node.children) {
				filtered.push({ ...node, children });
			} else {
				filtered.push(node);
			}
		}

		return filtered;
	}

	return walk(nodes);
}

/**
 * Sort nodes by type (directories first), then by name
 */
export function sortNodes(nodes: FileNode[]): FileNode[] {
	return [...nodes].sort((a, b) => {
		if (a.type !== b.type) {
			return a.type === 'directory' ? -1 : 1;
		}
		return a.name.localeCompare(b.name);
	});
}

/**
 * Recursively sort entire tree
 */
export function sortTree(nodes: FileNode[]): FileNode[] {
	return sortNodes(
		nodes.map((node) => ({
			...node,
			children: node.children ? sortTree(node.children) : undefined
		}))
	);
}

/**
 * Map over all nodes in tree (depth-first)
 */
export function mapTree<T>(nodes: FileNode[], fn: (node: FileNode) => T): T[] {
	const result: T[] = [];

	function walk(nodeList: FileNode[]) {
		for (const node of nodeList) {
			result.push(fn(node));
			if (node.children) {
				walk(node.children);
			}
		}
	}

	walk(nodes);
	return result;
}

/**
 * Get paths for all directories that should be expanded to show matching items
 */
export function getPathsToExpand(nodes: FileNode[], query: string): Set<string> {
	if (!query.trim()) return new Set();

	const paths = new Set<string>();
	const lower = query.toLowerCase();

	function walk(nodeList: FileNode[], parentPaths: string[] = []) {
		for (const node of nodeList) {
			const nodePath = node.path;
			const matches = node.name.toLowerCase().includes(lower);

			if (matches) {
				// Add all ancestors to expand paths
				for (const ancestor of getAncestorPaths(nodePath)) {
					paths.add(ancestor);
				}
			}

			if (node.children) {
				walk(node.children, [...parentPaths, nodePath]);
			}
		}
	}

	walk(nodes);
	return paths;
}

/**
 * Get all file paths in tree (leaf nodes only)
 */
export function getAllFilePaths(nodes: FileNode[]): string[] {
	return mapTree(nodes, (node) => node.path).filter(
		(path) => findNode(nodes, path)?.type === 'file'
	);
}

/**
 * Get all directory paths in tree
 */
export function getAllDirectoryPaths(nodes: FileNode[]): string[] {
	return mapTree(nodes, (node) => node.path).filter(
		(path) => findNode(nodes, path)?.type === 'directory'
	);
}

/**
 * Get the common ancestor path for multiple paths
 */
export function getCommonAncestor(...paths: string[]): string | null {
	if (paths.length === 0) return null;
	if (paths.length === 1) return paths[0].substring(0, paths[0].lastIndexOf('/'));

	const parts = paths.map((p) => p.split('/'));
	const common: string[] = [];

	for (let i = 0; i < Math.min(...parts.map((p) => p.length)); i++) {
		const segment = parts[0][i];
		if (parts.every((p) => p[i] === segment)) {
			common.push(segment);
		} else {
			break;
		}
	}

	return common.length > 0 ? common.join('/') : null;
}

/**
 * Get tree depth (maximum nesting level)
 */
export function getTreeDepth(nodes: FileNode[]): number {
	let maxDepth = 0;

	function walk(nodeList: FileNode[]) {
		for (const node of nodeList) {
			maxDepth = Math.max(maxDepth, node.depth);
			if (node.children) {
				walk(node.children);
			}
		}
	}

	walk(nodes);
	return maxDepth;
}
