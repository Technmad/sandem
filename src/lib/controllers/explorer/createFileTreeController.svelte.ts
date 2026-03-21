import type { WebContainer } from '@webcontainer/api';
import type { FileNode } from '$types/editor.js';

export type { FileNode } from '$types/editor.js';

type CreateFileTreeOptions = {
	getWorkspaceRootFolders?: () => string[];
};

function toErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	return String(error);
}

function collectDirectoryPaths(nodes: FileNode[], out = new Set<string>()) {
	for (const node of nodes) {
		if (node.type !== 'directory') continue;
		out.add(node.path);
		if (node.children?.length) {
			collectDirectoryPaths(node.children, out);
		}
	}
	return out;
}

async function readDirRecursive(
	wc: WebContainer,
	dirPath: string,
	rootFolders: ReadonlySet<string>,
	depth = 0
): Promise<FileNode[]> {
	const IGNORE = new Set(['.git', 'node_modules', '.svelte-kit', 'dist', '.cache']);

	const entries = await wc.fs.readdir(dirPath, { withFileTypes: true });
	const relevantEntries = entries.filter((entry) => {
		if (IGNORE.has(entry.name)) return false;
		if (dirPath !== '.') return true;
		if (rootFolders.size === 0) return true;
		return entry.isDirectory() && rootFolders.has(entry.name);
	});

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

function createSignature(nodes: FileNode[]): string {
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

export function createFileTree(
	getWebcontainer: () => WebContainer,
	options: CreateFileTreeOptions = {}
) {
	let tree = $state<FileNode[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let refreshTimer = $state<ReturnType<typeof setInterval> | null>(null);
	let lastSignature = $state('');
	let refreshInFlight: Promise<void> | null = null;

	let expanded = $state<Record<string, true>>({});

	function getWorkspaceRootFolders(): ReadonlySet<string> {
		const folders = options.getWorkspaceRootFolders?.() ?? [];
		return new Set(folders.map((folder) => folder.trim()).filter(Boolean));
	}

	function pruneExpandedState(nextTree: FileNode[]) {
		const existingDirectories = collectDirectoryPaths(nextTree);
		expanded = Object.fromEntries(
			Object.entries(expanded).filter(([path]) => existingDirectories.has(path))
		) as Record<string, true>;
	}

	async function refresh(options?: { silent?: boolean }) {
		if (refreshInFlight) return refreshInFlight;

		const run = (async () => {
			if (!options?.silent) loading = true;
			error = null;

			try {
				const nextTree = await readDirRecursive(getWebcontainer(), '.', getWorkspaceRootFolders());
				const nextSignature = createSignature(nextTree);

				if (nextSignature !== lastSignature) {
					tree = nextTree;
					lastSignature = nextSignature;
					pruneExpandedState(nextTree);
				}
			} catch (err) {
				error = toErrorMessage(err);
			} finally {
				refreshInFlight = null;
				if (!options?.silent) loading = false;
			}
		})();

		refreshInFlight = run;
		return run;
	}

	function toggleDir(path: string) {
		if (expanded[path]) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { [path]: _removed, ...rest } = expanded;
			expanded = rest;
		} else {
			expanded = { ...expanded, [path]: true };
		}
	}

	function isExpanded(path: string) {
		return !!expanded[path];
	}

	function startAutoRefresh(intervalMs = 1000) {
		if (refreshTimer) return;
		refreshTimer = setInterval(() => {
			void refresh({ silent: true });
		}, intervalMs);
	}

	function stopAutoRefresh() {
		if (!refreshTimer) return;
		clearInterval(refreshTimer);
		refreshTimer = null;
	}

	return {
		get tree() {
			return tree;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		refresh,
		toggleDir,
		isExpanded,
		startAutoRefresh,
		stopAutoRefresh
	};
}
