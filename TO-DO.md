# Sandem — To-Do

> Last verified: 2026-02-25 · `pnpm build` passes · all CI checks green

---

## ✅ Done

### Infrastructure

- [x] COOP/COEP headers in `vite.config.ts` and `hooks.server.ts` (dev + prod)
- [x] WebContainer singleton boot guard (prevents double-boot on HMR)
- [x] `ssr = false` on `/projects/[projectId]` layout
- [x] `.gitignore` covers `.env.local` and generated files

### Auth

- [x] Email/password sign in + sign up
- [x] GitHub OAuth via better-auth social provider
- [x] SSR auth state handshake (`getServerState` → `createSvelteAuthClient`)
- [x] Liveblocks auth endpoint (`/api/liveblocks-auth`) with owner/collaborator permission split

### Backend (Convex)

- [x] `projects` table schema with `by_owner` index
- [x] `createProject`, `getProject`, `listProjects`, `updateProject`, `deleteProject`
- [x] `getProjectByRoomId` for Liveblocks auth
- [x] `getCurrentUser` query

### File system sync

- [x] `VITE_REACT_TEMPLATE` uses flat `{ name, contents }[]` format matching Convex schema
- [x] `projectFilesToFSTree()` converts flat array → WebContainer `FileSystemTree`
- [x] Correct boot sequence: boot → fetch project → mount → render
- [x] `webcontainer.mount()` seeds FS from Convex on load
- [x] `wc.fs.writeFile()` keeps FS live on every editor change

### Editor

- [x] Monaco Editor with multi-file tab switching
- [x] Liveblocks + Yjs real-time collaboration
- [x] Yjs seeding from Convex on first sync (only if doc is empty)
- [x] Local-only autosave (skips remote Yjs changes via origin check)
- [x] Offline mode (no Liveblocks room) falls back to direct Monaco models
- [x] Language detection by file extension

### Terminal

- [x] xterm.js via `@battlefieldduck/xterm-svelte`
- [x] `jsh` shell with resize sync
- [x] Input/output piping

### Preview

- [x] `server-ready` listener for iframe URL
- [x] Reload button (`{#key}` remount trick)
- [x] Open-in-new-tab link
- [x] Duplicate listener guard

### UI / Pages

- [x] Home page — editorial dark landing with faux IDE window hero
- [x] Auth page — split-panel sign in / sign up with GitHub button
- [x] Projects dashboard — project grid, skeleton loading, ghost new-project card
- [x] IDE page — editor / terminal / preview 3-pane layout
- [x] Global `transition: all` removed from `*` (was breaking Monaco + xterm)
- [x] `body:has(.ide-grid)` override keeps IDE always dark
- [x] `app.css` semantic token system (4 themes × 2 modes)

---

## 🔧 Needs fixing / polish

- [ ] **Delete confirmation** — project delete fires immediately on click; add an "are you sure?" step
- [ ] **Project rename** — inline rename on the dashboard card (double-click title)
- [ ] **Error boundary** in IDE layout — unhandled WebContainer errors should show a recoverable UI, not a blank screen
- [ ] **`console.log` cleanup** — remove `$inspect()` calls and debug logs before any public release
- [ ] **Liveblocks room creation** — `liveblocksRoomId` is currently optional and often null; wire up automatic room creation on project create
- [ ] **`useFilesystem.mountProjectFiles()`** — this method exists but is unused; the layout handles mounting directly; either remove it or use it

---

## 🚀 Next features

### File explorer

- [ ] Sidebar file tree (add, delete, rename files/folders)
- [ ] New file from template (`.tsx`, `.css`, etc.)
- [ ] File path support in editor tabs (currently flat names only)

### Editor enhancements

- [ ] Monaco IntelliSense / TypeScript LSP
- [ ] Collaborative cursors with user avatars
- [ ] Find & replace panel
- [ ] Editor font size / settings panel

### Templates

- [ ] Template picker on project create (React, Vue, Svelte, plain Node, etc.)
- [ ] Import from GitHub URL
- [ ] Export as ZIP

### Workspace

- [ ] Container snapshot / restore
- [ ] Clone project
- [ ] Guest share links (no auth required to view)
- [ ] Custom run commands (not just `npm run dev`)
- [ ] `npm` package manager UI

### Infrastructure

- [ ] Docker + docker-compose docs (`README.Docker.md`)
- [ ] CI pipeline (lint → check → build → deploy)
- [ ] E2E tests (Playwright) covering auth, project create, editor load
- [ ] Accessibility audit (keyboard nav for tabs, file tree, panes)
- [ ] Mobile / responsive layout for IDE panes

---

## 💡 Icebox (good ideas, not soon)

- Prod build button (`npm run build` → serve `/dist` in iframe)
- Resource monitor (warn on container OOM)
- Error overlay surfacing compile errors outside the terminal
- Storybook / component catalog for the UI library
- Visual regression tests for theme variants
