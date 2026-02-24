import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
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
