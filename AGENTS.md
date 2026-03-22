You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

> Last updated: 2026-03-22

## Available MCP Tools:

### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

# Agent Instructions & Session Learnings

## Core Directives

1. **Svelte 5 First**: Always prefer Runes ($state, $props, $derived) over Svelte 4 store/export syntax.
2. **Event Attributes**: Use `onclick`, `oninput`, etc., instead of `on:click` or `on:input`.
3. **Data Injection + Pure Functions**: Use explicit dependency injection pattern where components receive props (not state) and action handlers are pure functions taking context. See `createExplorerActionHandlers.svelte.ts` for pattern.
4. **Data Injection**: Pass configuration data (like nav links) from layouts to components using props to keep components pure and reusable.
5. **`/repo` Auth Gating**: Demo mode is guest-only. If authenticated, always run repo workspace flow; do not gate by project count.
6. **Starter Seed on First Visit**: For authenticated owners with zero projects, rely on `ensureStarterProjectForOwner` to create starter content.
7. **Keep this file current**: Whenever `AGENTS.md` is read during work, update it as needed so it accurately reflects the app’s current behavior, architecture, scripts, and known status.
8. **Explorer Multi-root Contract**: In authenticated `/repo`, the WebContainer root is a multi-project workspace (folder names are slugified from each Convex project title). Explorer tree should treat those folders as the canonical top-level roots.
9. **Explorer Sync Status**: Treat Convex ↔ Explorer sync as foundational/in-progress unless explicitly wired in the active `/repo` shell. Avoid documenting it as fully shipped if delete/rename root actions are still scaffolded.
10. **Explorer Startup Sync**: Explorer must not require manual refresh to reveal project root folders; keep silent polling + bootstrap retries active so post-boot mount races self-heal.
11. **Project Selection Sync**: Selecting a root project folder should re-target sync context immediately (room/subscription and tree refresh behavior should follow selected project).
12. **Explorer Action UX**: Use non-blocking in-panel dialogs (create/rename/delete intents) instead of `window.prompt`/`window.confirm` in the active Explorer flow.

## Styling Architecture (The "Svelte.dev" Way)

- **Token Layers**: Maintain a strict separation between Primitive Tokens (raw colors/spacing) and Semantic Tokens (roles like `--color-brand`).
- **Global Over Scoped**: Put interactive states (hover, active, focus) and base resets in `app.css` to keep `.svelte` file styles minimal.
- **Centering**: Use `display: grid; place-items: center;` on the `main` or wrapper element for modern, robust centering.
- **Header Layouts**: Use `display: grid; grid-template-columns: 1fr auto 1fr;` for perfectly balanced 3-section headers (Nav | Search | Action).

## MCP Tool Utilization

- **svelte-autofixer**: Run this on EVERY code generation to ensure Svelte 5 compatibility.
- **list-sections**: Use at the start of any new technical implementation to verify the latest API changes in the Svelte 5 docs.

## Explorer Architecture (Data Injection + Pure Functions)

**Pattern Overview**: Three-layer architecture with explicit data flow:

1. **Action Handlers** (`createExplorerActionHandlers.svelte.ts`): Pure async/sync functions taking `ExplorerActionContext` parameter. All dependencies passed as context parameters (fileTree, projectSync, editorOpenFile, getWebcontainer, getActiveProject, tree, selectedPath, onMessage, onError).
2. **Orchestrator** (Explorer.svelte): Manages state (explorerState, fileTree, projectSync), creates ExplorerActionContext, and passes everything as props to children. Event handlers call action functions with context.
3. **Presentation** (ExplorerContent + sub-components): Pure presentational components receiving all state/callbacks via props. No internal state management or side effects.

**Key Files**:

- `src/lib/controllers/explorer/createExplorerActionHandlers.svelte.ts` - Pure action handlers (8 functions for file operations)
- `src/lib/components/ide/activities/Explorer.svelte` - Orchestrator component managing state & context
- `src/lib/components/ide/activities/ExplorerContent.svelte` - Orchestrator for sub-components (status, open editors, files, project info, outline, timeline)
- `src/lib/components/ide/activities/ExplorerFilesSection.svelte` - Presentation component for file tree with search
- `src/lib/components/ide/activities/ExplorerOpenEditors.svelte` - Presentation component for open tabs
- `src/lib/components/ide/activities/ExplorerProjectInfo.svelte` - Presentation component for project details
- `src/lib/components/ide/activities/ExplorerOutline.svelte` - Active-model symbol outline with line-jump navigation (heuristic parsing)
- `src/lib/components/ide/activities/ExplorerTimeline.svelte` - Local explorer activity timeline (actions/errors/open/toggle) with file reopen shortcuts

**Benefits**: All dependencies are explicit in context object, making data flow transparent. Pure functions are testable without mocking. Presentation components are reusable with any data source.

## Terminal Architecture (Orchestrator + Controller + Presentation)

**Pattern Overview**: Terminal now follows the same decomposition style as Explorer:

1. **Controllers** (`createTerminalPanelController.svelte.ts`, `createTerminalSessionsController.svelte.ts`, `createTerminalWorkspaceController.svelte.ts`): Own panel/session state plus injected runtime orchestration handlers (session runtime sync, shell lifecycle, panel actions, theme sync observer).
2. **Orchestrator** (`Terminal.svelte`): Keeps only dependency wiring (permissions subscription + controller injection), then passes controller-derived props/callbacks to children.
3. **Presentation** (`TerminalPanelHeader.svelte`, `TerminalToolbar.svelte`, `TerminalViewport.svelte`, `TerminalSessionPane.svelte`): Stateless render components receiving data + callbacks via props; supports multi-session tabs and optional two-pane split view.

**Key Files**:

- `src/lib/controllers/workspace/createTerminalPanelController.svelte.ts`
- `src/lib/controllers/workspace/createTerminalSessionsController.svelte.ts`
- `src/lib/controllers/workspace/createTerminalWorkspaceController.svelte.ts`
- `src/lib/components/ide/workspace/Terminal.svelte`
- `src/lib/components/ide/workspace/TerminalPanelHeader.svelte`
- `src/lib/components/ide/workspace/TerminalToolbar.svelte`
- `src/lib/components/ide/workspace/TerminalViewport.svelte`
- `src/lib/components/ide/workspace/TerminalSessionPane.svelte`

---

## Session resume checklist — quick onboarding (for assistants) ✅

Use this checklist when picking up the project in a new session to get productive quickly.

- Workspace root: `c:\projects\capstone\sandem`
- Dev server URL: `http://localhost:5173/` (start with `pnpm run dev`)

### Helpful scripts

- `pnpm install` — install dependencies
- `pnpm run dev` — start development server
- `pnpm run check` — run `svelte-check` diagnostics
- `pnpm run format` — run Prettier
- `pnpm run lint` — run ESLint
- `pnpm run build` — produce a production build
- `pnpm run test` — run unit tests in one-shot mode
- `pnpm run test:unit` — run Vitest in watch/interactive mode
- `pnpm run test:e2e:install-browsers` — one-time Playwright browser install
- `pnpm run test:e2e` — run E2E tests
- `pnpm run setup:test-user` — creates/verifies E2E auth user; skips by default if SITE_URL is unreachable (`SKIP_SETUP_TEST_USER_IF_SITE_UNREACHABLE=0` to fail hard)
- `pnpm run changeset` — wrapper that runs interactive prompt locally and a non-interactive status check in CI/audits
- `pnpm run release` — wrapper that skips publish when npm auth is missing; use `pnpm run release:publish` for strict publish behavior

### Key files & areas

- Global tokens & interactive states: `src/app.css`
- Header/layout shell: `src/lib/components/ui/navigation/AppHeader.svelte`
- Card component shell: `src/lib/components/ui/primitives/Card.svelte`
- Theme switcher: `src/lib/components/ui/theme/ThemeSwitcher.svelte`
- IDE route shell: `src/routes/repo/+layout.svelte`, `src/routes/repo/+layout.server.ts`
- Repo workspace controller (runtime + project orchestration): `src/lib/controllers/workspace/createRepoController.svelte.ts`
- Explorer tree controller (polling until runtime available): `src/lib/controllers/explorer/createFileTreeController.svelte.ts`
- Explorer pure tree ops: `src/lib/utils/editor/fileTreeOps.ts`
- Git activity controller (real repository ops via isomorphic-git + WebContainer FS): `src/lib/controllers/activity/createGitActivity.svelte.ts`
- Shell process controller (terminal bootstrap + git command shim aliasing): `src/lib/services/runtime/createShellProcess.svelte.ts`
- Terminal panel/session UI controllers + split presentation: `src/lib/controllers/workspace/createTerminal*Controller.svelte.ts`, `src/lib/components/ide/workspace/Terminal*.svelte`
- Editor pane orchestration controller (injected runtime + persistence wiring): `src/lib/controllers/editor/createEditorPaneController.svelte.ts`
- Explorer/Convex sync scaffolding: `src/lib/hooks/explorer/createProjectSyncController.svelte.ts`, `src/lib/controllers/explorer/createExplorerActionsController.svelte.ts`
- Project folder sync helpers: `src/lib/utils/editor/projectFolderSync.ts`
- App-level SvelteKit error helpers: `src/lib/sveltekit/errors.ts`
- SvelteKit auth forwarding + timeout handling: `src/lib/sveltekit/index.ts`
- Lifecycle hooks: `src/lib/hooks/*`
- Editor pane lifecycle composition: `src/lib/hooks/editor/createEditorLifecycle.svelte.ts`
- Monaco loader/static asset config (build-safe): `src/lib/services/editor/createMonacoConfig.svelte.ts`, `vite.config.ts`, `static/monaco/vs/*`
- UI command controllers: `src/lib/controllers/*`
- Runtime/persistence services: `src/lib/services/*`
- Editor pane pseudo-pure view helpers: `src/lib/utils/editor/editorPaneView.ts`
- Layout and pages: `src/routes/+layout.svelte`, `src/routes/(home)/*`, `src/routes/repo/*`
- Project file-tree conversion utility: `src/lib/utils/project/filesystem.ts`
- Docker status reference: `README.md` (compose exists, root Dockerfile currently missing)
- Architecture docs hub: `docs/README.md` (ordered docs `00_...` through `11_...`)

### lib/ Organization (3-tier index.ts structure)

**New Structure** (updated 2026-03-22): All subdirectories now support single-line imports via consolidated index.ts files:

Tier 1 (Parent level): `src/lib/components/`, `src/lib/controllers/`, `src/lib/hooks/`, `src/lib/services/`, `src/lib/stores/`, `src/lib/context/`, `src/lib/utils/`

- Re-exports from domain-level (Tier 2) folders for convenient `import { Component } from '$lib/components'` patterns

Tier 2 (Domain level): Within each parent, folders like `activity/`, `editor/`, `explorer/`, `workspace/`, etc.

- Re-export their contained modules for convenient `import { handler } from '$lib/controllers/explorer'` patterns

Tier 3 (Leaf level): Actual implementation files (components, functions, types)

- Exported individually and aggregated through Tier 2 index files

Example imports (all valid):

```typescript
// Leaf level
import { createExplorerActionHandlers } from '$lib/controllers/explorer/createExplorerActionHandlers.svelte.js';

// Domain level
import { createExplorerActionHandlers } from '$lib/controllers/explorer';

// Parent level
import { createExplorerActionHandlers } from '$lib/controllers';
```

**Benefits**: Zero ambiguity (no `export *` conflicts), flexible import styles, clear dependency scoping.

Total structure: 38 index.ts files organized as 8 parent-level consolidators → 19 domain-level re-exporters → leaf-level implementations. All verified with `pnpm run check` (0 errors) and `pnpm run build` (success).

### Conventions & best practices

- Svelte 5 runes: prefer `$state`, `$props`, `$derived` (avoid legacy `export let` where possible)
- Use event attributes (`onclick`, `oninput`) instead of legacy `on:` syntax
- Keep architecture boundaries strict:
  - `src/lib/hooks/*` = lifecycle/composition hooks only
  - `src/lib/controllers/*` = UI command orchestration
  - `src/lib/services/*` = runtime/persistence/integration logic
  - Do not add compatibility re-export shims under `hooks/*`; import controllers/services directly where needed.
- Keep interactive states (hover, focus, active) in `src/app.css`; components should be layout-only shells and accept content via `$props` or `#snippet`
- Theme: controlled by `ThemeSwitcher.svelte`, stored in `localStorage`, and applied via `document.documentElement.dataset.theme`
- App-wide error shaping/formatting should use `createAppError`, `toAppError`, and `formatAppError` from `src/lib/sveltekit/errors.ts`
- Explorer: `createFileTree` should filter top-level roots to known workspace project folders when provided; nested files/folders remain fully recursive like VS Code.

### Workflow tips

- Run `pnpm run format` before `pnpm run lint` if formatting fails in CI
- Run `pnpm run check` to catch Svelte/TypeScript diagnostics
- Run `pnpm run test` after non-trivial logic changes
- For E2E on a fresh machine, run `pnpm run test:e2e:install-browsers` once first
- E2E specs should fail fast for missing auth credentials and runtime readiness; avoid silent early returns/reload-based retries when validating benchmark reliability
- When adding components, run the `svelte-autofixer` on generated code

### Quick troubleshooting

- If banner image 404s in dev, verify root assets `banner.webp` / `bannerDark.webp` exist and README references them correctly.
- If `docker compose up --build` fails, check `README.md` Docker section: the compose file references a root Dockerfile that is not currently present.
- If lint fails for formatting, run `pnpm run format` and re-run `pnpm run lint`.
- If explorer shows "WebContainer not ready", verify runtime boot via repo controller mount; the file tree now keeps polling and clears once the runtime is available.
- If auth endpoints intermittently fail with aborted fetches, verify `PUBLIC_CONVEX_SITE_URL` and current timeout behavior in `src/lib/sveltekit/index.ts`.
- If `setup:test-user` appears skipped, ensure frontend server is running at `SITE_URL` or set `SKIP_SETUP_TEST_USER_IF_SITE_UNREACHABLE=0` to enforce failure.
- If Monaco fails to boot in production, verify `static/monaco/vs/loader.js` and `static/monaco/vs/editor/editor.main.js` exist (copied by `monaco-static-assets` plugin in `vite.config.ts`) and that the app can serve `/monaco/vs/*`.

---

<!-- convex-ai-start -->
This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `src/convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.
<!-- convex-ai-end -->
