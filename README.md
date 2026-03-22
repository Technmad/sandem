# Sandem

> Last updated: 2026-03-22

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![SvelteKit](https://img.shields.io/badge/framework-SvelteKit-orange.svg)](https://svelte.dev)
[![Convex](https://img.shields.io/badge/backend-Convex-purple.svg)](https://convex.dev)

---

<picture>
  <source srcset="./bannerDark.webp" media="(prefers-color-scheme: dark)">
  <source srcset="./banner.webp" media="(prefers-color-scheme: light)">
  <img src="./banner.webp" alt="Sandem IDE interface">
</picture>

**Version:** 0.0.1 · **Status:** ✅ build passing · actively maintained

---

## What is Sandem?

A **collaborative, browser-based IDE** that gives you a complete Node.js development environment without leaving your browser tab — no installation, no cloud VM, no overhead. Write code, run commands, see live previews, and collaborate in real-time with teammates. Perfect for teaching, code interviews, rapid prototyping, and pair programming.

### Use cases

- **Live coding demos & tutorials** — teach Node.js interactively without asking students to install anything
- **Code interviews** — pair-code with candidates in a shared, browser-based workspace
- **Rapid prototyping** — spin up a full Node.js project in seconds to test an idea
- **Pair programming** — real-time collaborative editing with live cursors and presence
- **Bootcamp labs** — isolated, disposable project sandboxes for exercises

---

## Core features

| Feature                            | What it means                                                           |
| ---------------------------------- | ----------------------------------------------------------------------- |
| Real Node.js in the browser        | No backend needed — everything runs client-side via WebContainer API    |
| Monaco editor with multi-file tabs | Familiar VS Code–like editing, syntax highlighting, multi-file projects |
| Real-time collaboration            | See teammates' cursors, edits sync live; works offline & reconnects     |
| Live preview                       | Built-in iframe preview for web projects; updates as you code           |
| Full terminal                      | Run scripts, install packages, execute shell commands                   |
| Projects persist                   | Auto-save to database; access your work anywhere, anytime               |
| Social auth                        | Sign in with email or GitHub; no password headaches                     |
| Themeable UI                       | 4 color palettes (default, forest, solar, ocean) + light/dark mode      |

---

## How it works

**The simple version:** When you open a project, Sandem boots a full Node.js runtime in your browser (via [WebContainer](https://webcontainer.io)), mounts your files, and connects Monaco Editor to that environment. As you type, changes sync to the filesystem in real-time; when you run a script, it executes locally in the browser. If another user is in the room, their edits stream in live via [Liveblocks](https://liveblocks.io/) + [Yjs](https://github.com/yjs/yjs) (a conflict-free sync engine).

**The tech stack:** Built on [SvelteKit](https://svelte.dev) (Svelte 5 with runes), [Convex](https://convex.dev) for serverless backend & persistence, and [better-auth](https://github.com/better-auth/better-auth) for OAuth. Docker Compose scaffolding is present, but the root Dockerfile is currently missing (see Docker section). Full test coverage with [Vitest](https://vitest.dev) (unit) and [Playwright](https://playwright.dev) (end-to-end).

---

## Quick start

```bash
pnpm install
cp .env.example .env.local   # then add your Convex / Liveblocks / OAuth keys
# (also set PUBLIC_LIVEBLOCKS_KEY, SITE_URL, etc. as shown below)
pnpm dev
```

App runs at `http://localhost:5173`. The Convex dev server starts alongside it via `concurrently`.

> **Note:** WebContainer requires `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin` headers. These are set automatically by `src/hooks.server.ts` for all non-API routes.

---

## Environment variables

```env
# .env.local (copy from .env.example)

# Convex backend (serverless database & auth)
CONVEX_DEPLOYMENT=dev:your-team,project-name      # e.g. dev:tan-devs/sandem
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
PUBLIC_CONVEX_SITE_URL=https://your-app-domain.com

# Liveblocks (real-time collaboration)
PUBLIC_LIVEBLOCKS_KEY=pk_live_...               # published to browser
LIVEBLOCKS_SECRET_KEY=sk_live_...               # server only

# Application URL (used by auth callbacks, E2E tests, etc.)
SITE_URL=http://localhost:5173

# GitHub OAuth (for social sign-in)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

---

## Project structure

```
src/
├── convex/               # Serverless backend (auth, mutations, schema)
│   ├── _generated/       # Auto-generated Convex types & client
│   ├── auth.config.ts
│   ├── auth.ts
│   ├── projects.ts       # Project CRUD and queries
│   ├── schema.ts         # Data model
│   └── tsconfig.json
├── lib/                  # Reusable frontend code
│   ├── components/       # UI library (IDE panes, theme, layout)
│   ├── context/          # Svelte context for IDE & auth
│   ├── hooks/            # Custom logic (autoSaver, collaboration, etc.)
│   ├── stores/           # Reactive state management
│   ├── utils/            # Filesystem, language, template helpers
│   └── liveblocks.config.ts
├── routes/               # SvelteKit pages & server endpoints
│   ├── (home)/           # Public pages: home, auth, shop, test
│   ├── repo/             # IDE workspace route
│   └── api/              # Server endpoints: auth, Liveblocks hooks
├── app.css               # Global tokens & interactive states
├── app.html
├── hooks.server.ts       # COOP/COEP header setup
└── types/
    └── env.d.ts
```

---

## Architecture & data flow

### Boot sequence

When a user opens `/repo/[projectId]`:

1. **Server validates** — checks auth token and loads the project document from Convex
2. **WebContainer boots** — starts Node.js runtime in the browser (non-blocking; spinner shows while loading)
3. **Live query** — subscribes to the Convex project; updates stream in automatically if shared
4. **Mount files** — transforms flat file array into a filesystem tree and mounts it into WebContainer
5. **Provide context** — layout creates shared getters so child components (Editor, Terminal, Preview) can access the container and project
6. **Render UI** — only after mount is done, to avoid showing broken editors

### File synchronization

- **Convex → WebContainer:** bulk mount on startup; can remount on document updates
- **Editor → WebContainer:** keystroke-by-keystroke via `wc.fs.writeFile()` (sub-100ms)
- **Editor → Convex:** debounced auto-save (1.5s); tracks pending saves per file and retries on failure
- **Collaboration:** Liveblocks + Yjs CRDT syncs remote edits live; local changes trigger save, remote changes are preserved

### Data model

Files stored as: `{ name: string, contents: string }[]` (a flat array). Converted to WebContainer `FileSystemTree` at mount time using `filesystem-utils.ts`.

### Theming

All colors reference semantic CSS variables (`--bg`, `--fg`, `--accent`, etc.) in `app.css`. Four built-in palettes (default, forest, solar, ocean) with light/dark variants, toggled via `data-theme` and `data-mode` attributes. The IDE route (`/repo`) always renders dark.

---

## Scripts

```bash
pnpm dev          # start client + Convex dev server (concurrently)
pnpm build        # production build
pnpm check        # svelte-check TypeScript diagnostics
pnpm lint         # ESLint + Prettier
pnpm format       # Prettier write
pnpm test         # Vitest unit tests (one-shot CI mode)
pnpm test:unit    # Vitest in interactive/watch mode
pnpm test:e2e:install-browsers  # one-time Playwright browser install
pnpm test:e2e     # Playwright E2E tests
```

---

## Docker

**Current status (2026-03-22):**

- A [compose.yaml](compose.yaml) file exists and maps `5173:5173`
- It references `build.dockerfile: Dockerfile`, but there is currently no root Dockerfile in this repo
- Result: `docker compose up --build` will fail until a Dockerfile is added

### Recommended local development setup

Use the Node/pnpm workflow for local development:

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

### Docker setup (once Dockerfile is added)

```bash
docker compose up --build
```

Application URL: `http://localhost:5173`

Before running with Docker, ensure `.env.local` (or Compose environment injection) includes:

- `PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT`
- `PUBLIC_LIVEBLOCKS_KEY`
- `LIVEBLOCKS_SECRET_KEY`
- `SITE_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

If you inject vars via Compose, map these keys into the service definition.

### Build and push image

```bash
docker build -t sandem:latest .
docker tag sandem:latest your-registry/sandem:latest
docker push your-registry/sandem:latest
```

For cross-platform builds:

```bash
docker build --platform=linux/amd64 -t sandem:latest .
```

---

## Deployment notes

- Ensure COOP/COEP headers survive your hosting proxy/CDN — WebContainer will not boot without them
- Set `PUBLIC_CONVEX_URL` to your Convex deployment and `PUBLIC_CONVEX_SITE_URL` for auth callbacks
- `SITE_URL` should be your public-facing URL (used by auth, E2E tests, and scripts)
- `LIVEBLOCKS_SECRET_KEY` is server-only; never expose it client-side
- Configure `PUBLIC_LIVEBLOCKS_KEY`, `GITHUB_CLIENT_ID`, and `GITHUB_CLIENT_SECRET`
- `/repo` behavior: guest users load demo mode; authenticated users load repo mode and are auto-seeded with a starter project on first visit if none exists

---

## Documentation & Architecture

Complete guides and architecture documentation are in the [**docs/** folder](./docs/):

- **[Getting Started](./docs/00_Getting_Started.md)** — Quick overview and setup
- **[Architecture Overview](./docs/01_Architecture_Overview.md)** — High-level system design
- **[System Architecture](./docs/02_System_Architecture.md)** — Detailed design with flows
- **[Architecture Details](./docs/03_Architecture_Details.md)** — Deep dive into design patterns
- **[Implementation Guide](./docs/04_Implementation_Guide.md)** — Step-by-step integration
- **[Code Examples](./docs/05_Code_Examples.md)** — Copy-paste patterns and usage
- **[Diagrams & Flows](./docs/06_Diagrams_and_Flows.md)** — Visual reference
- **[Progress Tracker](./docs/07_Progress_Tracker.md)** — Track implementation status
- **[What Was Built](./docs/08_What_Was_Built.md)** — Summary of deliverables
- **[Next Steps](./docs/10_Next_Steps.md)** — Future improvements

**→ [Start with docs/README.md](./docs/README.md) for navigation guidance.**

### Implementation Status

The Convex ↔ Explorer sync layer features:

- ✓ Three production-ready controllers (ProjectSync, FileTree, ExplorerActions)
- ✓ Two utility modules (fileTreeOps, projectFolderSync) with pure functions
- ✓ Complete end-to-end documentation
- ✓ WebContainer readiness retry behavior and Convex sync scaffolding
- ⏳ Full integration of root-level explorer actions to Convex mutations in active `/repo` shell (in progress)

---

## Recent updates (2026-03-22)

- **docs**: Complete documentation refresh across all markdown files with consistent professional formatting and accurate references to current codebase
- **lib organization**: All subdirectories now support single-line imports via consolidated index.ts files (38 total) organized in 3-tier structure (Parent → Domain → Leaf)
- **explorer**: Refactored file tree with pure utility helpers (`fileTreeOps`), WebContainer readiness retries, and Convex sync scaffolding
- **auth proxy**: Added timeout + graceful `504 Gateway Timeout` fallback in SvelteKit auth forwarding handler
- **dev server**: Added Monaco sourcemap patching in Vite dev config to suppress invalid sourcemap loader noise
- **UI refactor**: Core primitives updated for reusability, `/shop` showcase improved with consistent component variants, `/auth` page restyled with reusable components
- **styling**: Added missing global semantic tokens (`--radius-sm`, `--radius-md`, `--radius-lg`, `--ease-out`, `--shadow-card`)
- Updated `/repo` auth: demo workspace for guests only; authenticated users always enter their own workspace
- First-time authenticated users auto-seeded with a starter project

---

## License

[MIT](LICENSE)
