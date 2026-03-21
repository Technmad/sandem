import type { WebContainer } from '@webcontainer/api';
import { getRootFolder } from '$lib/utils/project/filesystem.js';
import type { IDEProject, ProjectFile } from '$types/projects.js';
import type { GitActivityDeps } from '$types/hooks.js';
import type { ChangeItem } from '$types/editor.js';

const IGNORE = new Set(['.git', 'node_modules', '.svelte-kit', 'dist', '.cache']);

export function createGitActivity(deps: GitActivityDeps) {
	let message = $state('');
	let scanning = $state(false);
	let changes = $state<ChangeItem[]>([]);
	let lastCommitSummary = $state('');
	let baseline = new Map<string, string>();

	const canCommit = $derived(message.trim().length > 0);

	function getWebcontainer(): WebContainer {
		return deps.getWebcontainer();
	}

	function getProject(path?: string): IDEProject {
		return deps.getProject(path);
	}

	function getProjectRootPath() {
		return getRootFolder(deps.getActiveTabPath() ?? deps.getEntryPath());
	}

	async function collectFiles(dirPath: string, acc: string[]) {
		const entries = await getWebcontainer().fs.readdir(dirPath, { withFileTypes: true });

		for (const entry of entries) {
			if (IGNORE.has(entry.name)) continue;
			const fullPath = dirPath === '.' ? entry.name : `${dirPath}/${entry.name}`;

			if (entry.isDirectory()) {
				await collectFiles(fullPath, acc);
				continue;
			}

			acc.push(fullPath);
		}
	}

	async function snapshotCurrentFiles() {
		const files: string[] = [];
		await collectFiles(getProjectRootPath(), files);

		const map = new Map<string, string>();
		for (const path of files) {
			const content = await getWebcontainer().fs.readFile(path, 'utf-8');
			map.set(path, content);
		}

		return map;
	}

	function detectChanges(current: Map<string, string>) {
		const next: ChangeItem[] = [];

		for (const [path, previous] of baseline) {
			if (!current.has(path)) {
				next.push({ path, type: 'deleted' });
				continue;
			}

			if (current.get(path) !== previous) {
				next.push({ path, type: 'modified' });
			}
		}

		for (const [path] of current) {
			if (!baseline.has(path)) {
				next.push({ path, type: 'new' });
			}
		}

		return next.sort((a, b) => a.path.localeCompare(b.path));
	}

	async function refreshChanges() {
		scanning = true;
		try {
			const current = await snapshotCurrentFiles();
			changes = detectChanges(current);
		} finally {
			scanning = false;
		}
	}

	async function commitAll() {
		if (!canCommit) return;
		const current = await snapshotCurrentFiles();
		baseline = current;
		changes = [];
		lastCommitSummary = `${message.trim()} · ${new Date().toLocaleTimeString()}`;
		message = '';
	}

	function openChangedFile(item: ChangeItem) {
		if (item.type === 'deleted') return;
		deps.openFile(item.path);
	}

	async function init() {
		const project = getProject(deps.getActiveTabPath() ?? undefined);
		baseline = new Map(
			project.files.map((file: ProjectFile) => {
				const root = getProjectRootPath();
				const fullPath = file.name.startsWith(`${root}/`) ? file.name : `${root}/${file.name}`;
				return [fullPath, file.contents ?? ''];
			})
		);

		await refreshChanges();
	}

	function setMessage(value: string) {
		message = value;
	}

	return {
		get message() {
			return message;
		},
		get canCommit() {
			return canCommit;
		},
		get scanning() {
			return scanning;
		},
		get changes() {
			return changes;
		},
		get lastCommitSummary() {
			return lastCommitSummary;
		},
		setMessage,
		refreshChanges,
		commitAll,
		openChangedFile,
		init
	};
}
