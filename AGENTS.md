You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

> Last updated: 2026-03-21

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
3. **Data Injection**: Pass configuration data (like nav links) from layouts to components using props to keep components pure and reusable.
4. **`/repo` Auth Gating**: Demo mode is guest-only. If authenticated, always run repo workspace flow; do not gate by project count.
5. **Starter Seed on First Visit**: For authenticated owners with zero projects, rely on `ensureStarterProjectForOwner` to create starter content.
6. **Keep this file current**: Whenever `AGENTS.md` is read during work, update it as needed so it accurately reflects the app’s current behavior, architecture, scripts, and known status.
7. **Explorer Multi-root Contract**: In authenticated `/repo`, the WebContainer root is a multi-project workspace (`project-*` folders from Convex). Explorer tree should treat those folders as the canonical top-level roots.

## Styling Architecture (The "Svelte.dev" Way)

- **Token Layers**: Maintain a strict separation between Primitive Tokens (raw colors/spacing) and Semantic Tokens (roles like `--color-brand`).
- **Global Over Scoped**: Put interactive states (hover, active, focus) and base resets in `app.css` to keep `.svelte` file styles minimal.
- **Centering**: Use `display: grid; place-items: center;` on the `main` or wrapper element for modern, robust centering.
- **Header Layouts**: Use `display: grid; grid-template-columns: 1fr auto 1fr;` for perfectly balanced 3-section headers (Nav | Search | Action).

## MCP Tool Utilization

- **svelte-autofixer**: Run this on EVERY code generation to ensure Svelte 5 compatibility.
- **list-sections**: Use at the start of any new technical implementation to verify the latest API changes in the Svelte 5 docs.

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

### Key files & areas

- Global tokens & interactive states: `src/app.css`
- Header/layout shell: `src/lib/components/ui/navigation/AppHeader.svelte`
- Card component shell: `src/lib/components/ui/primitives/Card.svelte`
- Theme switcher: `src/lib/components/ui/theme/ThemeSwitcher.svelte`
- IDE route shell: `src/routes/repo/+layout.svelte`, `src/routes/repo/+layout.server.ts`
- Repo workspace controller (runtime + project orchestration): `src/lib/controllers/workspace/createRepoLayoutController.svelte.ts`
- App-level SvelteKit error helpers: `src/lib/sveltekit/errors.ts`
- Lifecycle hooks: `src/lib/hooks/*`
- Editor pane lifecycle composition: `src/lib/hooks/editor/createEditorLifecycle.svelte.ts`
- UI command controllers: `src/lib/controllers/*`
- Runtime/persistence services: `src/lib/services/*`
- Editor pane pseudo-pure view helpers: `src/lib/utils/editor/editorPaneView.ts`
- Layout and pages: `src/routes/+layout.svelte`, `src/routes/(home)/*`, `src/routes/repo/*`
- Project file-tree conversion utility: `src/lib/utils/project/filesystem.ts`
- Docker status reference: `README.md` (compose exists, root Dockerfile currently missing)

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
- When adding components, run the `svelte-autofixer` on generated code

### Quick troubleshooting

- If banner image 404s in dev, verify root assets `banner.webp` / `bannerDark.webp` exist and README references them correctly.
- If `docker compose up --build` fails, check `README.md` Docker section: the compose file references a root Dockerfile that is not currently present.
- If lint fails for formatting, run `pnpm run format` and re-run `pnpm run lint`.

---
