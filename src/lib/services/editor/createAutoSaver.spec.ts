import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mutationMock = vi.fn();

vi.mock('convex-svelte', () => ({
	useConvexClient: () => ({
		mutation: mutationMock
	})
}));

vi.mock('$convex/_generated/api.js', () => ({
	api: {
		projects: {
			updateProjectFiles: 'projects:updateProjectFiles',
			updateProject: 'projects:updateProject'
		}
	}
}));

import { createAutoSaver } from './createAutoSaver.svelte.js';

describe('createAutoSaver', () => {
	let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.useFakeTimers();
		mutationMock.mockReset();
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
	});

	afterEach(() => {
		consoleErrorSpy.mockRestore();
		vi.useRealTimers();
	});

	it('sets non-saved status when autosave persist fails', async () => {
		mutationMock.mockRejectedValueOnce(new Error('network down'));

		const project = {
			_id: 'proj_123',
			title: 'Demo',
			owner: 'test@example.com',
			files: [{ name: 'src/main.ts', contents: 'export {}' }]
		};

		const autoSaver = createAutoSaver(() => project as never);
		autoSaver.triggerAutoSave('src/main.ts', 'next');

		await vi.advanceTimersByTimeAsync(1600);
		await Promise.resolve();

		expect(autoSaver.status).toBe('Save failed');
		expect(autoSaver.status).not.toBe('Saved');
	});

	it('drainAndCleanup flushes pending autosave immediately during teardown', async () => {
		mutationMock.mockResolvedValueOnce(undefined);

		const project = {
			_id: 'proj_123',
			title: 'Demo',
			owner: 'test@example.com',
			files: [{ name: 'src/main.ts', contents: 'export {}' }]
		};

		const autoSaver = createAutoSaver(() => project as never);
		autoSaver.triggerAutoSave('src/main.ts', 'next');

		// Before the debounce timeout fires, force teardown drain.
		await autoSaver.drainAndCleanup();

		expect(mutationMock).toHaveBeenCalledWith('projects:updateProjectFiles', {
			id: 'proj_123',
			files: [{ name: 'src/main.ts', contents: 'next' }]
		});
		expect(autoSaver.status).toBe('Saved');
	});
});
