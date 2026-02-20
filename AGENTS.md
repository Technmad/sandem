You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

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

- Workspace root: `c:\projects\svelte5-demo`
- Dev server URL: `http://localhost:5173/` (start with `pnpm run dev`)

### Helpful scripts

- `pnpm install` — install dependencies
- `pnpm run dev` — start development server
- `pnpm run check` — run `svelte-check` diagnostics
- `pnpm run format` — run Prettier
- `pnpm run lint` — run ESLint
- `pnpm run build` — produce a production build

### Key files & areas

- Global tokens & interactive states: `src/app.css`
- Header component / layout shell: `src/lib/components/Header.svelte`
- Card component shell: `src/lib/components/Card.svelte`
- Theme switcher: `src/lib/components/ThemeSwitcher.svelte`
- Layout and pages: `src/routes/+layout.svelte`, `src/routes/+page.svelte`
- Static assets: `static/` (drop images here to avoid external CDN 404s)

### Conventions & best practices

- Svelte 5 runes: prefer `$state`, `$props`, `$derived` (avoid legacy `export let` where possible)
- Use event attributes (`onclick`, `oninput`) instead of legacy `on:` syntax
- Keep interactive states (hover, focus, active) in `src/app.css`; components should be layout-only shells and accept content via `$props` or `#snippet`
- Theme: controlled by `ThemeSwitcher.svelte`, stored in `localStorage`, and applied via `document.documentElement.dataset.theme`

### Workflow tips

- Run `pnpm run format` before `pnpm run lint` if formatting fails in CI
- Run `pnpm run check` to catch Svelte/TypeScript diagnostics
- When adding components, run the `svelte-autofixer` on generated code

### Quick troubleshooting

- If hero image 404s in dev, add the image to `static/` and update `src/app.css` to reference `/your-image.avif`.
- If lint fails for formatting, run `pnpm run format` and re-run `pnpm run lint`.

---
