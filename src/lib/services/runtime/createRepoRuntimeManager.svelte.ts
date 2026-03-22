import { WebContainer, type WebContainerProcess } from '@webcontainer/api';
import { createError, composeErrorMessage } from '$lib/sveltekit/index.js';
import { editorStore } from '$lib/stores';
import { projectFilesToTree } from '$lib/utils/project/filesystem.js';
import { projectFolderName } from '$lib/utils/project/projects.js';
import type { RepoLayoutData } from '$types/routes.js';

type RuntimePhase = 'idle' | 'booting' | 'mounting' | 'installing' | 'running' | 'failed';

type Options = {
	isDemo: () => boolean;
	getProjects: () => RepoLayoutData['projects'];
	getEntryPath: () => string;
};

function getRootWorkspaceTree() {
	return {
		'package.json': {
			file: {
				contents: JSON.stringify(
					{
						name: 'sandem-workspace',
						private: true,
						version: '0.0.0',
						workspaces: ['project-*', 'demo']
					},
					null,
					2
				)
			}
		}
	};
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) return error.message;
	return String(error);
}

export function createRepoRuntimeManager(options: Options) {
	let webcontainer: WebContainer | null = null;
	let devServerProcess: WebContainerProcess | null = null;

	let runtimePhase = $state<RuntimePhase>('idle');
	let runtimeError = $state<string | null>(null);
	let ready = $state(false);
	let bootRunId = 0;

	function failRuntime(message: string, error?: unknown) {
		runtimeError = error ? `${message}\n\n${getErrorMessage(error)}` : message;
		runtimePhase = 'failed';
		ready = false;
	}

	function failRuntimeWithError(Error: ReturnType<typeof createError>, error?: unknown) {
		failRuntime(composeErrorMessage(Error, error));
	}

	async function stopRuntime() {
		devServerProcess?.kill();
		devServerProcess = null;

		const current = webcontainer as (WebContainer & { teardown?: () => Promise<void> }) | null;
		if (current?.teardown) {
			try {
				await current.teardown();
			} catch {
				// ignore teardown failures during recovery
			}
		}

		webcontainer = null;
	}

	async function startRuntime() {
		const runId = ++bootRunId;
		runtimeError = null;
		runtimePhase = 'booting';
		ready = false;

		try {
			await stopRuntime();

			const wc = await WebContainer.boot();
			if (runId !== bootRunId) {
				if (wc.teardown) {
					try {
						await wc.teardown();
					} catch {
						// ignore stale teardown race
					}
				}
				return;
			}

			webcontainer = wc;
			runtimePhase = 'mounting';

			await wc.mount(getRootWorkspaceTree());

			if (options.isDemo()) {
				// Demo mode mounting handled by caller
			} else {
				for (const project of options.getProjects()) {
					const folder = projectFolderName(project._id);
					await wc.mount({
						[folder]: { directory: projectFilesToTree(project.files) }
					});
				}
			}

			if (!editorStore.activeTabPath) {
				editorStore.openFile(options.getEntryPath());
			}

			ready = true;

			runtimePhase = 'installing';
			const entryFolder = options.getEntryPath().split('/').filter(Boolean)[0] ?? '';
			if (entryFolder) {
				const packageJsonPath = `${entryFolder}/package.json`;
				const hasPackageJson = await wc.fs
					.readFile(packageJsonPath, 'utf-8')
					.then(() => true)
					.catch(() => false);

				if (hasPackageJson) {
					const install = await wc.spawn('sh', ['-c', `cd ${entryFolder} && pnpm i`]);
					const installExitCode = await install.exit;
					if (installExitCode === 0) {
						devServerProcess = await wc.spawn('sh', ['-c', `cd ${entryFolder} && pnpm dev`]);
					} else {
						console.warn(`Dependency install failed (exit ${installExitCode}). Continuing.`);
					}
				}
			}
			runtimePhase = 'running';
		} catch (error) {
			failRuntimeWithError(createError('Failed to start the IDE runtime.'), error);
		}
	}

	return {
		get runtimePhase() {
			return runtimePhase;
		},
		get runtimeError() {
			return runtimeError;
		},
		get ready() {
			return ready;
		},
		get webcontainer() {
			if (!webcontainer) throw new Error('WebContainer not ready');
			return webcontainer;
		},
		startRuntime,
		stopRuntime,
		failRuntimeWithError
	};
}
