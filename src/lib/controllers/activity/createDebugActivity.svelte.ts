import type { WebContainer } from '@webcontainer/api';
import { getRootFolder } from '$lib/utils/project/filesystem.js';
import type { DebugActivityDeps } from '../../../types/hooks.js';

export function createDebugActivity(deps: DebugActivityDeps) {
	let checking = $state(false);
	let launchExists = $state(false);
	let debugMessage = $state('');

	function getWebcontainer(): WebContainer {
		return deps.getWebcontainer();
	}

	function getProjectRootPath() {
		return getRootFolder(deps.getActiveTabPath() ?? deps.getEntryPath());
	}

	function getLaunchPath() {
		return `${getProjectRootPath()}/.vscode/launch.json`;
	}

	async function checkLaunchConfig() {
		checking = true;
		debugMessage = '';
		try {
			await getWebcontainer().fs.readFile(getLaunchPath(), 'utf-8');
			launchExists = true;
		} catch {
			launchExists = false;
		} finally {
			checking = false;
		}
	}

	async function createLaunchConfig() {
		const launchPath = getLaunchPath();

		if (launchExists) {
			deps.openFile(launchPath);
			debugMessage = 'Opened launch.json';
			return;
		}

		const directory = launchPath.split('/').slice(0, -1).join('/');
		const config = {
			version: '0.2.0',
			configurations: [
				{
					name: 'WebContainer Dev Server',
					type: 'node',
					request: 'launch',
					program: '${workspaceFolder}/node_modules/vite/bin/vite.js',
					args: ['dev']
				}
			]
		};

		await getWebcontainer().fs.mkdir(directory, { recursive: true });
		await getWebcontainer().fs.writeFile(launchPath, JSON.stringify(config, null, 2), 'utf-8');
		deps.openFile(launchPath);
		launchExists = true;
		debugMessage = 'launch.json created';
	}

	async function startDebugging() {
		if (!launchExists) {
			await createLaunchConfig();
		}

		const panels = deps.getPanels();
		if (panels) {
			panels.leftPane = true;
			panels.downPane = true;
		}

		window.dispatchEvent(new CustomEvent('app:command-palette:toggle'));
		debugMessage = 'Debug surfaces opened';
	}

	return {
		get checking() {
			return checking;
		},
		get launchExists() {
			return launchExists;
		},
		get debugMessage() {
			return debugMessage;
		},
		checkLaunchConfig,
		createLaunchConfig,
		startDebugging
	};
}
