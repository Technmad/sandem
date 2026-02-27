// src/lib/hooks/createPreview.svelte.ts
import type { WebContainer } from '@webcontainer/api';

export function createPreview(getWebcontainer: () => WebContainer) {
	let url = $state('');
	let reloadKey = $state(0);
	let listening = false;

	function listenForServer() {
		// Guard: only register once — WebContainer's `on` doesn't deduplicate listeners
		if (listening) return;
		listening = true;

		getWebcontainer().on('server-ready', (_port: number, serverUrl: string) => {
			url = serverUrl;
		});
	}

	function reload() {
		if (url) reloadKey += 1;
	}

	function reset() {
		url = '';
		reloadKey = 0;
		listening = false;
	}

	return {
		get url() {
			return url;
		},
		get key() {
			return reloadKey;
		},
		listenForServer,
		reload,
		reset
	};
}
