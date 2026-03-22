import type { WebContainer } from '@webcontainer/api';
import { getRootFolder } from '$lib/utils/project/filesystem.js';
import type { SearchActivityDeps } from '../../../types/hooks.js';
import type { SearchMatch } from '../../../types/editor.js';

const IGNORE = new Set(['.git', 'node_modules', '.svelte-kit', 'dist', '.cache']);
const MAX_RESULTS = 200;
const MAX_SCAN_FILES = 2000;
const MAX_FILE_SIZE_BYTES = 256 * 1024;
const SEARCH_THROTTLE_MS = 220;

export function createSearchActivity(deps: SearchActivityDeps) {
	let searching = $state(false);
	let error = $state('');
	let results = $state<SearchMatch[]>([]);
	let partialMessage = $state('');
	let progress = $state({ scanned: 0, total: 0, skippedLarge: 0 });
	let searchVersion = 0;
	let scheduledSearchTimer: ReturnType<typeof setTimeout> | null = null;

	function getWebcontainer(): WebContainer {
		return deps.getWebcontainer();
	}

	function getProjectRootPath() {
		return getRootFolder(deps.getActiveTabPath() ?? deps.getEntryPath());
	}

	async function collectFiles(dirPath: string, acc: string[], localVersion: number) {
		if (localVersion !== searchVersion) return;
		if (acc.length >= MAX_SCAN_FILES) return;

		const entries = await getWebcontainer().fs.readdir(dirPath, { withFileTypes: true });

		for (const entry of entries) {
			if (localVersion !== searchVersion) return;
			if (acc.length >= MAX_SCAN_FILES) return;

			if (IGNORE.has(entry.name)) continue;
			const fullPath = dirPath === '.' ? entry.name : `${dirPath}/${entry.name}`;

			if (entry.isDirectory()) {
				await collectFiles(fullPath, acc, localVersion);
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

	function clearScheduledSearch() {
		if (!scheduledSearchTimer) return;
		clearTimeout(scheduledSearchTimer);
		scheduledSearchTimer = null;
	}

	function scheduleSearch(rawQuery: string) {
		clearScheduledSearch();
		scheduledSearchTimer = setTimeout(() => {
			scheduledSearchTimer = null;
			void runSearch(rawQuery);
		}, SEARCH_THROTTLE_MS);
	}

	async function runSearch(rawQuery: string) {
		clearScheduledSearch();

		const localVersion = ++searchVersion;
		const normalized = rawQuery.trim();
		if (!normalized) {
			results = [];
			error = '';
			partialMessage = '';
			progress = { scanned: 0, total: 0, skippedLarge: 0 };
			searching = false;
			return;
		}

		searching = true;
		error = '';
		partialMessage = '';
		progress = { scanned: 0, total: 0, skippedLarge: 0 };

		try {
			const root = getProjectRootPath();
			const files: string[] = [];
			await collectFiles(root, files, localVersion);
			if (localVersion !== searchVersion) return;

			const scanCapped = files.length >= MAX_SCAN_FILES;
			progress = { scanned: 0, total: files.length, skippedLarge: 0 };

			const next: SearchMatch[] = [];
			let skippedLarge = 0;

			for (let index = 0; index < files.length; index++) {
				if (localVersion !== searchVersion) return;

				const file = files[index];
				if (next.length >= MAX_RESULTS) break;

				const ext = file.split('.').at(-1)?.toLowerCase() ?? '';
				if (['png', 'jpg', 'jpeg', 'gif', 'ico', 'pdf', 'woff', 'woff2', 'ttf'].includes(ext)) {
					if (index % 8 === 0 || index === files.length - 1) {
						progress = { scanned: index + 1, total: files.length, skippedLarge };
					}
					continue;
				}

				let content = '';
				try {
					content = await getWebcontainer().fs.readFile(file, 'utf-8');
				} catch {
					if (index % 8 === 0 || index === files.length - 1) {
						progress = { scanned: index + 1, total: files.length, skippedLarge };
					}
					continue;
				}

				if (content.length > MAX_FILE_SIZE_BYTES) {
					skippedLarge++;
					if (index % 8 === 0 || index === files.length - 1) {
						progress = { scanned: index + 1, total: files.length, skippedLarge };
					}
					continue;
				}

				next.push(...findLineMatches(file, content, normalized));
				if (index % 8 === 0 || index === files.length - 1) {
					progress = { scanned: index + 1, total: files.length, skippedLarge };
				}
			}

			if (localVersion !== searchVersion) return;
			results = next.slice(0, MAX_RESULTS);

			const reasons: string[] = [];
			if (scanCapped) reasons.push(`Scanned first ${MAX_SCAN_FILES} files`);
			if (next.length > MAX_RESULTS) reasons.push(`Showing first ${MAX_RESULTS} matches`);
			if (skippedLarge > 0)
				reasons.push(
					`Skipped ${skippedLarge} large file${skippedLarge === 1 ? '' : 's'} (> ${Math.floor(MAX_FILE_SIZE_BYTES / 1024)} KB)`
				);

			partialMessage = reasons.join(' · ');
		} catch (searchError) {
			if (localVersion !== searchVersion) return;
			error = String(searchError);
			results = [];
			partialMessage = '';
		} finally {
			if (localVersion === searchVersion) {
				searching = false;
			}
		}
	}

	function clearSearch() {
		clearScheduledSearch();
		error = '';
		results = [];
		partialMessage = '';
		progress = { scanned: 0, total: 0, skippedLarge: 0 };
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
		get partialMessage() {
			return partialMessage;
		},
		get progress() {
			return progress;
		},
		scheduleSearch,
		runSearch,
		clearSearch,
		openResult
	};
}
