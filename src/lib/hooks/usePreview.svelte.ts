import type { WebContainer } from '@webcontainer/api';

export function usePreview(getWebcontainer: () => WebContainer) {
	let url = $state('');
	let reloadKey = $state(0); // We change this to force the iframe to remount

	function listenForServer() {
		const webcontainer = getWebcontainer();

		webcontainer.on('server-ready', (port: number, serverUrl: string) => {
			url = serverUrl;
		});
	}

	function reload() {
		if (url) reloadKey += 1;
	}

	return {
		get url() {
			return url;
		},
		get key() {
			return reloadKey;
		},
		listenForServer,
		reload
	};
}
