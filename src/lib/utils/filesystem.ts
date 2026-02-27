// src/lib/utils/filesystem.ts
import type { FileSystemTree } from '@webcontainer/api';
import type { Doc } from '$convex/_generated/dataModel.js';

/**
 * Converts a flat Convex project.files array into a WebContainer FileSystemTree.
 * Handles nested paths like "src/App.jsx" by creating intermediate directories.
 */
export function projectFilesToTree(files: Doc<'projects'>['files']): FileSystemTree {
	const tree: FileSystemTree = {};

	for (const file of files) {
		const parts = file.name.split('/');

		if (parts.length === 1) {
			tree[file.name] = { file: { contents: file.contents ?? '' } };
		} else {
			let current = tree;
			for (let i = 0; i < parts.length - 1; i++) {
				const segment = parts[i];
				if (!current[segment]) {
					current[segment] = { directory: {} };
				}
				current = (current[segment] as { directory: FileSystemTree }).directory;
			}
			const leaf = parts[parts.length - 1];
			current[leaf] = { file: { contents: file.contents ?? '' } };
		}
	}

	return tree;
}
