import type { WebContainer } from '@webcontainer/api';

async function ensureParentDir(wc: WebContainer, fileName: string) {
	const parts = fileName.split('/');
	if (parts.length > 1) {
		const dir = parts.slice(0, -1).join('/');
		await wc.fs.mkdir(dir, { recursive: true });
	}
}

const WRITE_DEBOUNCE_MS = 120;

/**
 * Writes a single file into the WebContainer. Used by the editor on every change.
 */
export function createFileWriter(getWebcontainer: () => WebContainer) {
	let disposed = false;
	let acceptingWrites = true;
	let drainingPromise: Promise<void> | null = null;
	const pendingByPath = new Map<string, string>();
	const timersByPath = new Map<string, ReturnType<typeof setTimeout>>();
	const writeSequenceByPath = new Map<string, Promise<void>>();

	async function performWrite(fileName: string, content: string) {
		if (disposed) return;

		const wc = getWebcontainer();
		try {
			await ensureParentDir(wc, fileName);
			await wc.fs.writeFile(fileName, content);
		} catch (err) {
			console.error(`Failed to write ${fileName} to WebContainer`, err);
		}
	}

	function queueWrite(fileName: string, content: string) {
		const previous = writeSequenceByPath.get(fileName) ?? Promise.resolve();
		const next = previous.finally(async () => {
			await performWrite(fileName, content);
		});
		writeSequenceByPath.set(fileName, next);
		void next.finally(() => {
			if (writeSequenceByPath.get(fileName) === next) {
				writeSequenceByPath.delete(fileName);
			}
		});
	}

	function writeFile(fileName: string, content: string) {
		if (disposed || !acceptingWrites) return;

		pendingByPath.set(fileName, content);

		const existingTimer = timersByPath.get(fileName);
		if (existingTimer) {
			clearTimeout(existingTimer);
		}

		const timer = setTimeout(() => {
			timersByPath.delete(fileName);
			const nextContent = pendingByPath.get(fileName);
			pendingByPath.delete(fileName);
			if (nextContent === undefined) return;
			queueWrite(fileName, nextContent);
		}, WRITE_DEBOUNCE_MS);

		timersByPath.set(fileName, timer);
	}

	async function flushAll() {
		if (disposed) return;

		for (const timer of timersByPath.values()) {
			clearTimeout(timer);
		}
		timersByPath.clear();

		for (const [fileName, content] of pendingByPath) {
			queueWrite(fileName, content);
		}
		pendingByPath.clear();

		await Promise.allSettled([...writeSequenceByPath.values()]);
	}

	async function drainAndDispose() {
		if (disposed) return;
		if (drainingPromise) {
			await drainingPromise;
			return;
		}

		acceptingWrites = false;
		drainingPromise = (async () => {
			await flushAll();
			disposed = true;
			writeSequenceByPath.clear();
		})();

		await drainingPromise;
	}

	function dispose() {
		void drainAndDispose();
	}

	return {
		writeFile,
		flushAll,
		drainAndDispose,
		dispose
	};
}
