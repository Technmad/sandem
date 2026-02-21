import type { WebContainer } from '@webcontainer/api';

// singleton state
export let webcontainerInstance = $state<WebContainer | null>(null);

const initialFiles: Record<string, { file: { contents: string } }> = {
	'/package.json': {
		file: {
			contents: JSON.stringify({
				name: 'webcontainer-app',
				version: '0.0.0',
				scripts: {
					start: 'node index.js'
				}
			})
		}
	},
	'/index.js': {
		file: {
			contents: "console.log('hello from webcontainer');"
		}
	}
};

export async function bootContainer() {
	if (webcontainerInstance) {
		return webcontainerInstance;
	}

	const wc: WebContainer = await (window as Window).WebContainer.boot();
	webcontainerInstance = wc;

	// mount dummy files
	await wc.mount(initialFiles);

	return wc;
}
