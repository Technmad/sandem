# Sandem

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)  
[![SvelteKit](https://img.shields.io/badge/framework-SvelteKit-orange.svg)]

Version: 0.6.0

<picture>
  <source srcset="./bannerDark.webp" media="(prefers-color-scheme: dark)">
  <source srcset="./banner.webp" media="(prefers-color-scheme: light)">
  <img src="./banner.webp" alt="Auth components preview">
</picture>

## Quick summary ✅

- **Frontend:** SvelteKit (Svelte v5) + Vite + TailwindCSS
- **IDE Engine:** Monaco Editor + WebContainer API
- ** Auth: ** [`better-auth`]([https://github.com/m-mailaender/better-auth](https://github.com/better-auth/better-auth)) + [`@mmailaender/convex-better-auth-svelte`](https://github.com/mmailaender/convex-better-auth-svelte)
- ** Terminal: ** [`xterm.js`](https://github.com/xtermjs/xterm.js) (via [`@battlefieldduck/xterm-svelte`](https://github.com/battlefieldduck/xterm-svelte))

- **Collaboration:** Liveblocks + Yjs (Real-time syncing)
- **Backend:** Convex serverless functions (folder: `src/convex`)
- **Tests:** Vitest (unit) and Playwright (E2E)

This repo is a hands‑on reference implementation for building a full in-browser collaborative development environment (IDE) using modern web standards, complete with SSR and client auth.

---

## Core Features 🚀

- **In-Browser Node.js OS:** Spin up a fully functional Node.js environment directly in the browser using the [WebContainer API](https://webcontainer.io). No cloud VMs required.
- **Interactive Terminal:** A fully integrated terminal built with `xterm` connected directly to the WebContainer's `jsh` shell. Run `npm install`, build scripts, and see output in real-time.
- **Collaborative Editing:** Multiplayer code editing powered by Liveblocks and Yjs, integrated seamlessly into the Monaco Editor.
- **Split-Pane Layout:** A responsive, VS Code-inspired 3-panel grid featuring the Editor, a Live Preview iframe, and the Terminal.

---

## Table of contents

- Architecture & key patterns
- Quick start
- Environment variables
- Development & testing
- Project layout
- Deployment
- Troubleshooting
- Contributing & roadmap

---

## Architecture & key patterns

This repo stitches together a handful of powerful pieces that work nicely together to create a complex web application. It’s meant to be useful when you’re trying to understand how things fit in a modern Svelte 5 stack.

- **SvelteKit** powers the frontend routing, server-side rendering, and API endpoints.
- **Convex** acts as the real-time database and backend logic layer.
- **COOP/COEP Headers** are strictly enforced via Vite config and SvelteKit hooks to enable `SharedArrayBuffer`, which is required for WebContainers to function securely.

---

## Contributing & roadmap

Want to add features or improve the docs? Great. Here are some ideas in order of importance:

1. Link the Monaco editor state to the WebContainer file system (Live HMR syncing).
2. Add GitHub Actions workflows for lint → test → build → deploy.
3. Expand the E2E suite to cover token expiry, refresh, and other edge cases.
4. Add accessibility and performance checks (axe, Lighthouse) to CI.
5. Write a short contributor guide and draw an architecture diagram.

Please run `pnpm format` and `pnpm lint` before submitting a PR.

---

## Where to look next

- WebContainer IDE UI: `src/routes/ide/+page.svelte` and `src/lib/components/`.
- Auth setup: `src/convex/*` and `src/lib/auth-client.ts`.
- Convex functions & schema go in `src/convex/`.
- Tests live in `e2e/` and `src/lib/sveltekit/index.spec.ts`.

---

## License

[MIT](LICENSE)
