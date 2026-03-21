import type { WebContainer } from '@webcontainer/api';
import type { FileNode } from '$types/editor.js';
import {
	readDirRecursive,
	createSignature,
	pruneExpandedState as pruneExpandedStatePure
} from '$lib/utils/editor/fileTreeOps.js';

export type { FileNode } from '$types/editor.js';

type CreateFileTreeOptions = {
	getWorkspaceRootFolders?: () => string[];
};

function toErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	return String(error);
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
	let wcReady = $state(false);
	let retryCount = $state(0);
	const maxRetries = 30; // ~30 seconds with 1s intervals

	let expanded = $state<Record<string, true>>({});

	function getWorkspaceRootFolders(): ReadonlySet<string> {
		const folders = options.getWorkspaceRootFolders?.() ?? [];
		return new Set(folders.map((folder) => folder.trim()).filter(Boolean));
	}

	function isReady() {
		try {
			const wc = getWebcontainer();
			return !!wc;
		} catch {
			return false;
		}
	}

	async function refresh(options?: { silent?: boolean }) {
		if (refreshInFlight) return refreshInFlight;

		const run = (async () => {
			if (!options?.silent) loading = true;
			error = null;

			try {
				const wc = getWebcontainer();

				// Check if WebContainer is ready
				if (!wc) {
					throw new Error('WebContainer not initialized');
				}

				wcReady = true;
				retryCount = 0;

				const nextTree = await readDirRecursive(wc, '.', getWorkspaceRootFolders());
				const nextSignature = createSignature(nextTree);

				if (nextSignature !== lastSignature) {
					tree = nextTree;
					lastSignature = nextSignature;
					expanded = pruneExpandedStatePure(expanded, nextTree);
				}
			} catch (err) {
				// If WebContainer isn't ready yet, schedule a retry
				if (!wcReady && retryCount < maxRetries) {
					retryCount++;
					if (!options?.silent) {
						error = `WebContainer not ready (${retryCount}/${maxRetries})`;
					}
					// Silently retry in 1 second
					setTimeout(() => {
						void refresh({ silent: true });
					}, 1000);
				} else {
					error = toErrorMessage(err);
				}
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
		isReady,
		refresh,
		toggleDir,
		isExpanded,
		startAutoRefresh,
		stopAutoRefresh
	};
}
