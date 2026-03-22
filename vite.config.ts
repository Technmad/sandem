import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

function copyDirRecursive(sourceDir: string, targetDir: string) {
	if (!fs.existsSync(sourceDir)) {
		throw new Error(`Missing source directory: ${sourceDir}`);
	}

	fs.mkdirSync(targetDir, { recursive: true });

	for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
		const sourcePath = path.join(sourceDir, entry.name);
		const targetPath = path.join(targetDir, entry.name);

		if (entry.isDirectory()) {
			copyDirRecursive(sourcePath, targetPath);
			continue;
		}

		fs.copyFileSync(sourcePath, targetPath);
	}
}

function createMonacoAssetsPlugin() {
	let targetVsDir = '';
	let rootDir = '';
	let isBuild = false;

	function ensureAssetsCopied(root: string) {
		const sourceVsDir = path.resolve(root, 'node_modules/monaco-editor/min/vs');
		targetVsDir = path.resolve(root, 'static/monaco/vs');
		copyDirRecursive(sourceVsDir, targetVsDir);
	}

	return {
		name: 'monaco-static-assets',
		enforce: 'pre',
		configResolved(config) {
			rootDir = config.root;
			isBuild = config.command === 'build';
			ensureAssetsCopied(config.root);
		},
		buildStart() {
			if (!rootDir) return;
			// Keep copied assets up to date for repeated local builds.
			ensureAssetsCopied(rootDir);
		},
		closeBundle() {
			if (!isBuild || !targetVsDir) return;

			const loaderPath = path.join(targetVsDir, 'loader.js');
			const editorMainPath = path.join(targetVsDir, 'editor/editor.main.js');
			if (!fs.existsSync(loaderPath) || !fs.existsSync(editorMainPath)) {
				throw new Error(
					'Monaco smoke check failed: missing required assets (loader.js/editor.main.js) in static/monaco/vs'
				);
			}
		}
	};
}

export default defineConfig({
	plugins: [sveltekit(), devtoolsJson(), createMonacoAssetsPlugin()],
	optimizeDeps: {
		exclude: ['monaco-editor']
	}
});
