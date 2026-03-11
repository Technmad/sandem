// src/lib/template.ts
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
			contents: `import React, { useState } from 'react';

export default function App() {
  const data = "world";
  const [count, setCount] = useState(0);
  const increment = () => {
  setCount(previous => previous + 1);
};

  return ( 
  <main>
    <h1>Hello {data}</h1>
    <p>You clicked {count} times</p>
      <button onClick={increment}>
        Click me
      </button>        
  </main>
  )
};
`
		}
	],
	entry: 'App.jsx'
};
