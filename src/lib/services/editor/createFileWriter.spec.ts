import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createFileWriter } from './createFileWriter.svelte.js';

type WriteCall = { fileName: string; content: string };

describe('createFileWriter', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('drainAndDispose flushes latest debounced write before teardown', async () => {
		const writes: WriteCall[] = [];
		const wc = {
			fs: {
				mkdir: vi.fn(async () => undefined),
				writeFile: vi.fn(async (fileName: string, content: string) => {
					writes.push({ fileName, content });
				})
			}
		};

		const writer = createFileWriter(() => wc as never);

		writer.writeFile('src/main.ts', 'first');
		writer.writeFile('src/main.ts', 'latest');

		const draining = writer.drainAndDispose();
		await vi.advanceTimersByTimeAsync(130);
		await draining;

		expect(wc.fs.mkdir).toHaveBeenCalledWith('src', { recursive: true });
		expect(writes).toEqual([{ fileName: 'src/main.ts', content: 'latest' }]);
	});

	it('does not drop queued same-file writes while one write is in flight', async () => {
		const writes: WriteCall[] = [];
		let releaseFirstWrite: (() => void) | undefined;
		let writeCount = 0;

		const wc = {
			fs: {
				mkdir: vi.fn(async () => undefined),
				writeFile: vi.fn(async (fileName: string, content: string) => {
					writes.push({ fileName, content });
					writeCount += 1;
					if (writeCount === 1) {
						await new Promise<void>((resolve) => {
							releaseFirstWrite = resolve;
						});
					}
				})
			}
		};

		const writer = createFileWriter(() => wc as never);

		writer.writeFile('src/main.ts', 'one');
		await vi.advanceTimersByTimeAsync(130);

		writer.writeFile('src/main.ts', 'two');
		await vi.advanceTimersByTimeAsync(130);

		let drained = false;
		const draining = writer.drainAndDispose().then(() => {
			drained = true;
		});

		await Promise.resolve();
		expect(drained).toBe(false);
		expect(releaseFirstWrite).toBeTypeOf('function');

		releaseFirstWrite?.();
		await draining;

		expect(writes).toEqual([
			{ fileName: 'src/main.ts', content: 'one' },
			{ fileName: 'src/main.ts', content: 'two' }
		]);

		writer.writeFile('src/main.ts', 'three');
		await vi.advanceTimersByTimeAsync(130);
		expect(writes).toHaveLength(2);
	});
});
