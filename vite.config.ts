import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
	plugins: [
		sveltekit(),
		devtoolsJson(),
		{
			name: 'fix-monaco-sourcemaps',
			apply: 'serve',
			enforce: 'pre',
			async configResolved(config) {
				// Patch monaco loader.js files to remove invalid sourcemap references
				const monacoDir = path.resolve(
					config.root,
					'node_modules/.pnpm/monaco-editor@0.55.1/node_modules/monaco-editor'
				);
				const loaderPath = path.join(monacoDir, 'dev/vs/loader.js');

				if (fs.existsSync(loaderPath)) {
					try {
						let content = fs.readFileSync(loaderPath, 'utf-8');
						// Remove sourcemap comment that points to non-existent file
						if (content.includes('sourceMappingURL')) {
							content = content.replace(/\/\/# sourceMappingURL=.*$/gm, '');
							fs.writeFileSync(loaderPath, content, 'utf-8');
						}
					} catch (e) {
						console.warn('Could not patch monaco loader.js:', e);
					}
				}
			}
		}
	],
	optimizeDeps: {
		exclude: ['monaco-editor']
	},
	build: {
		rollupOptions: {
			external: ['monaco-editor'],
			output: {
				globals: {
					'monaco-editor': 'monaco'
				}
			}
		}
	}
});
