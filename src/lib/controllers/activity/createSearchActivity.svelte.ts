import type { WebContainer } from '@webcontainer/api';
import { getRootFolder } from '$lib/utils/project/filesystem.js';
import type { SearchActivityDeps } from '../../../types/hooks.js';
import type { SearchMatch } from '../../../types/editor.js';

const IGNORE = new Set(['.git', 'node_modules', '.svelte-kit', 'dist', '.cache']);
const MAX_RESULTS = 200;

export function createSearchActivity(deps: SearchActivityDeps) {
	let searching = $state(false);
	let error = $state('');
	let results = $state<SearchMatch[]>([]);
	let searchVersion = 0;

	function getWebcontainer(): WebContainer {
		return deps.getWebcontainer();
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

	function findLineMatches(path: string, text: string, term: string): SearchMatch[] {
		const out: SearchMatch[] = [];
		const lines = text.split('\n');
		const needle = term.toLowerCase();

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			if (!line.toLowerCase().includes(needle)) continue;
			out.push({ path, line: i + 1, preview: line.trim() || '(blank line)' });
			if (out.length >= 10) break;
		}

		return out;
	}

	async function runSearch(rawQuery: string) {
		const localVersion = ++searchVersion;
		const normalized = rawQuery.trim();
		if (!normalized) {
			results = [];
			error = '';
			searching = false;
			return;
		}

		searching = true;
		error = '';

		try {
			const root = getProjectRootPath();
			const files: string[] = [];
			await collectFiles(root, files);

			const next: SearchMatch[] = [];
			for (const file of files) {
				if (next.length >= MAX_RESULTS) break;

				const ext = file.split('.').at(-1)?.toLowerCase() ?? '';
				if (['png', 'jpg', 'jpeg', 'gif', 'ico', 'pdf', 'woff', 'woff2', 'ttf'].includes(ext)) {
					continue;
				}

				let content = '';
				try {
					content = await getWebcontainer().fs.readFile(file, 'utf-8');
				} catch {
					continue;
				}

				next.push(...findLineMatches(file, content, normalized));
			}

			if (localVersion !== searchVersion) return;
			results = next.slice(0, MAX_RESULTS);
		} catch (searchError) {
			if (localVersion !== searchVersion) return;
			error = String(searchError);
			results = [];
		} finally {
			if (localVersion === searchVersion) {
				searching = false;
			}
		}
	}

	function clearSearch() {
		error = '';
		results = [];
	}

	function openResult(result: SearchMatch) {
		deps.openFile(result.path);
	}

	return {
		get searching() {
			return searching;
		},
		get error() {
			return error;
		},
		get results() {
			return results;
		},
		runSearch,
		clearSearch,
		openResult
	};
}
