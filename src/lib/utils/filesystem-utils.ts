// src/lib/filesystem-utils.ts
import type { FileSystemTree } from '@webcontainer/api';
import type { Doc } from '$convex/_generated/dataModel.js';

// ─── Template definitions ────────────────────────────────────────────────────
// These are the source-of-truth files stored in Convex when a project is created.
// `contents` is a plain string — no FileNode wrapper — matching the Convex schema.

export type ProjectFile = {
	name: string;
	contents: string;
};

export type Template = {
	files: ProjectFile[];
	entry: string;
	visibleFiles: string[];
};

export const VITE_REACT_TEMPLATE: Template = {
	files: [
		{
			name: 'package.json',
			contents: JSON.stringify(
				{
					scripts: {
						dev: 'vite',
						build: 'vite build',
						preview: 'vite preview'
					},
					dependencies: {
						react: '^18.2.0',
						'react-dom': '^18.2.0'
					},
					devDependencies: {
						'@vitejs/plugin-react': '3.1.0',
						vite: '4.1.4'
					}
				},
				null,
				2
			)
		},
		{
			name: 'vite.config.js',
			contents: `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});`
		},
		{
			name: 'index.html',
			contents: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/index.jsx"></script>
  </body>
</html>`
		},
		{
			name: 'index.jsx',
			contents: `import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);`
		},
		{
			name: 'App.jsx',
			contents: `export default function App() {
  const data = "world";
  return <h1>Hello {data}</h1>;
}`
		}
	],
	entry: 'App.jsx',
	visibleFiles: ['App.jsx', 'index.jsx', 'index.html']
};

// ─── Conversion helpers ───────────────────────────────────────────────────────

/**
 * Converts Convex project.files (flat array) into a WebContainer FileSystemTree.
 * Handles nested paths like "src/App.jsx" by creating intermediate directories.
 */
export function projectFilesToFSTree(files: Doc<'projects'>['files']): FileSystemTree {
	const tree: FileSystemTree = {};

	for (const file of files) {
		const parts = file.name.split('/');

		if (parts.length === 1) {
			tree[file.name] = {
				file: { contents: file.contents ?? '' }
			};
		} else {
			// Walk/create nested directory nodes
			let current = tree;
			for (let i = 0; i < parts.length - 1; i++) {
				const segment = parts[i];
				if (!current[segment]) {
					current[segment] = { directory: {} };
				}
				current = (current[segment] as { directory: FileSystemTree }).directory;
			}
			const leafName = parts[parts.length - 1];
			current[leafName] = {
				file: { contents: file.contents ?? '' }
			};
		}
	}

	return tree;
}
