# Sandem — To-Do

> Last updated: 2026-03-21 · locally verified today: `pnpm lint` ✅, `pnpm check` ✅ (0 errors, 0 warnings)

---

## ✅ Completed / verified

### Script + quality baseline (merged from PLAN)

- [x] Full script audit performed recently (`prepare`, `check`, `lint`, `test`, `build`, `prepack`, e2e-related scripts)
- [x] Current local baseline is stable (`lint` + `check` pass)
- [x] Docs were refreshed across markdown files after script audit

### Infrastructure

- [x] COOP/COEP headers in `vite.config.ts` and `hooks.server.ts` (dev + prod)
- [x] WebContainer singleton boot guard (prevents double-boot on HMR)
- [x] `ssr = false` on `/repo/+layout.server.ts`
- [x] `.gitignore` covers `.env.local` and generated/build artifacts

### Auth

- [x] Email/password sign in + sign up
- [x] GitHub OAuth via better-auth social provider
- [x] SSR auth state handshake (`getAuthState` on server + `getServerState` in `createSvelteAuthClient`)
- [x] Liveblocks auth endpoint (`/api/liveblocks-auth`) with owner/collaborator permission split
- [x] `/repo` demo gating depends on auth state (guest-only demo mode)
- [x] Authenticated users always load repo workspace flow

### Backend (Convex)

- [x] `projects` table schema with `by_owner` index
- [x] `createProject`, `getProjects`, `getProject`, `updateProject`, `deleteProject`
- [x] `openCollab` query for Liveblocks auth lookups
- [x] `getCurrentUser` query
- [x] `ensureStarterProjectForOwner` seeds starter project on first authenticated `/repo` visit
- [x] Liveblocks room IDs auto-generated when missing (`createProject` + room backfill mutation)

### File system sync + Explorer

- [x] `VITE_REACT_TEMPLATE` uses flat `{ name, contents }[]` matching Convex schema
- [x] `projectFilesToTree()` converts flat array → WebContainer `FileSystemTree`
- [x] Boot flow is runtime boot → project fetch/live query → file mount → render
- [x] `webcontainer.mount()` seeds initial FS from Convex/template
- [x] `wc.fs.writeFile()` keeps FS live on editor changes
- [x] Explorer supports create/rename/delete for files/folders

### Editor / Terminal / Preview

- [x] Monaco editor with multi-file tabs
- [x] Liveblocks + Yjs real-time collaboration
- [x] Yjs seed from Convex on first sync (empty-doc guard)
- [x] Autosave skips remote-origin Yjs changes
- [x] Offline/demo mode fallback when collaboration/provider is unavailable
- [x] xterm.js terminal via `@battlefieldduck/xterm-svelte` with `jsh`
- [x] Preview `server-ready` handling + reload + open-in-new-tab
- [x] Runtime error UI + retry action in repo layout (recoverable screen instead of blank page)

### UI / Theming

- [x] Home, auth, and repo flows are wired
- [x] `/shop` showcase tabs drive distinct accordion content
- [x] Global `transition: all` removed from universal selector
- [x] `body:has(.ide-grid)` keeps IDE dark
- [x] `app.css` semantic token system (themes + modes)
- [x] Project delete has a confirmation step
- [x] Project rename supports inline edit (double-click or action button)

---

## 🏆 Improvements

### Type safety & validation

- [ ] **End-to-end type safety** — Convex schema → runtime validators → stores → components (use Zod for boundary validation)
- [ ] **Project validator service** — `createProjectValidator()` ensures invalid projects never reach components
- [ ] **Schema inference** — Generate TypeScript types directly from Convex schema to avoid duplication

### State machines & complex flows

- [ ] **Editor state machine** — Explicit states (idle, loading, editing, saving, error) instead of free-form booleans
- [ ] **File operations state machine** — Create/rename/delete operations with atomic transitions
- [ ] **Authentication state machine** — Guest → loading → authenticated/error flow enforcement

### Error handling & recovery

- [ ] **Error boundary service** — `createErrorRecovery()` captures errors, shows UI, auto-retries after 3s
- [ ] **Graceful degradation** — Fallback to offline mode when WebContainer/collaboration unavailable
- [ ] **Conflict resolution UI** — When optimistic write conflicts with server version, show merge interface

### Data sync & consistency

- [ ] **Optimistic file writer** — Client writes optimistically, resolves server conflicts
- [ ] **Conflict detection** — Detect version mismatch on save, prevent silent data loss
- [ ] **Batch mutations** — Combine rapid file changes into single Convex mutation

### Performance & monitoring

- [ ] **Performance monitor service** — `createPerformanceMonitor()` measures slow operations (>1s threshold)
- [ ] **Auto-save batching** — Group rapid changes within 500ms window before persisting
- [ ] **Lazy load Monaco** — Defer editor script until user opens file (not at boot)

### Testing & DX

- [ ] **Service unit tests** — Test `createAutoSaver`, `createOptimisticFileWriter` with mock Convex
- [ ] **Type-enforced APIs** — Make it impossible to call functions without required params (JSDoc + TypeScript)
- [ ] **Error case coverage** — Test network failures, timeouts, conflict scenarios

### Accessibility & UX

- [ ] **Keyboard navigation** — Arrow keys in file tree, Tab through panes, Enter to open files
- [ ] **ARIA labels** — All interactive components have proper `aria-label`, `role`, `aria-live` attributes
- [ ] **Focus management** — Trap focus in modal dialogs, restore focus on close
- [ ] **Screen reader testing** — Verify editor state changes announced to assistive tech

### Developer experience

- [ ] **ARCHITECTURE.md** — Document data flow, module boundaries, and patterns for new contributors
- [ ] **JSDoc comments** — Every service/controller creator function has examples and type hints
- [ ] **Error messages** — Helpful, actionable error text (not "Error: undefined")

---

## 🔧 Needs fixing / polish

- [ ] **Root Dockerfile missing** — `compose.yaml` references `Dockerfile`, so `docker compose up --build` fails until Dockerfile is added
- [ ] **Debug log cleanup** — remove remaining server debug log(s), e.g. `console.log('authState', authState)` in `(home)/auth/+layout.server.ts`
- [ ] **Dead runtime hook cleanup** — `createProjectMounter` is exported but unused; remove or wire it intentionally
- [ ] **Tab labeling UX** — tabs still display filename-only labels (full path disambiguation for same-name files not implemented)

---

## 🚀 Next features

### Editor enhancements

- [ ] Make a Discord activity component that renders a dynamic discrod.md file to show servers
- [ ] Monaco IntelliSense / richer TS language features in workspace templates
- [ ] Collaborative cursors with user avatars
- [ ] Find & replace panel
- [ ] Editor font size / settings panel

### Templates / project lifecycle

- [ ] Template picker on project create (React, Vue, Svelte, plain Node, etc.)
- [ ] Import project from GitHub URL
- [ ] Export project as ZIP
- [ ] Clone project

### Workspace

- [ ] Container snapshot / restore
- [ ] Guest share links (read-only or scoped write permissions)
- [ ] Custom run commands UI (not just fixed script flow)
- [ ] NPM scripts/tasks panel backed by real package.json parsing
- [ ] Make preview component a full browser experience inside the webcontainer

### Infrastructure

- [ ] GitHub Actions CI pipeline (`lint` → `check` → `test` → `build`)
- [ ] Docker production path completion (add Dockerfile + validate compose)
- [ ] Accessibility audit (keyboard nav for tabs, tree, panes)
- [ ] Mobile/responsive layout improvements for IDE panes

---

## 💡 Icebox (later)

- Prod build button (`npm run build` → serve `/dist` in iframe)
- Resource monitor (container memory/CPU warnings)
- Compile-error overlay outside terminal
- Storybook/component catalog for UI primitives
- Visual regression tests for theme variants
