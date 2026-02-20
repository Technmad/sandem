# Sandem — SvelteKit + Convex demo

Version: 0.5.1

A small SvelteKit example/demonstrator that showcases Convex-based backend functions and integration with Better Auth for authentication (SSR + client-only flows). The repository contains example routes, tests (Vitest + Playwright), and helper utilities for working with Convex and Better Auth.

---

## Quick summary ✅

- Frontend: SvelteKit (Svelte v5) + Vite
- Backend: Convex serverless functions (folder: `src/convex`)
- Auth: `better-auth` + `@mmailaender/convex-better-auth-svelte`
- Tests: Vitest (unit) and Playwright (E2E)

This repo is ideal as a reference implementation for SSR + client auth with Convex and for running end-to-end auth tests.

---

## Features

- Example authentication flows (sign up / sign in) using Better Auth + Convex
- SSR-aware auth pages and client-only pages (`/test/ssr`, `/test/client-only`, `/test/queries`)
- Convex schema + generated API in `src/convex/_generated`
- E2E test support with Playwright and a helper script to create a test user
- Developer-friendly tasks: linting, formatting, type-checking, and test runners

---

## Getting started (local development) 💡

### Prerequisites

- Node.js 18+ (recommended)
- pnpm (preferred) or npm/yarn
- Convex CLI (used automatically via `npx convex`)

### Install

```bash
pnpm install
```

### Environment

Copy or create the following environment files in the project root:

- `./.env.local` — runtime/dev variables (site URL, Convex deployment, secret)
- `./.env.test` — test user credentials for E2E tests

Important variables (examples):

```env
# .env.local (example)
CONVEX_DEPLOYMENT=dev:pastel-cardinal-852
PUBLIC_CONVEX_URL=https://<your-convex>.convex.cloud
PUBLIC_CONVEX_SITE_URL=https://<your-convex>.convex.site
SITE_URL=http://localhost:5173
BETTER_AUTH_SECRET=<random-base64-secret>

# .env.test (example)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
TEST_USER_NAME="Test User"
SITE_URL=http://localhost:5173
```

> Note: `SITE_URL` must match the `baseURL` set in `src/lib/auth-client.ts` (default: `http://localhost:5173`).

### Run (dev)

Starts both the frontend and Convex dev server (recommended):

```bash
pnpm dev
```

Start frontend only:

```bash
pnpm dev:frontend
```

Start Convex backend only:

```bash
pnpm dev:backend
# (runs `npx convex dev`)
```

### Setup test user (for Playwright E2E)

1. Add credentials to `./.env.test` (see example above).
2. Ensure dev server is running: `pnpm dev`.
3. Run:

```bash
pnpm run setup:test-user
```

This hits the local sign-up endpoint and creates/verifies the test account.

---

## Scripts you will use frequently

- `pnpm dev` — frontend + Convex in watch mode
- `pnpm build` — production build
- `pnpm preview` — preview built site
- `pnpm test` — run unit tests (Vitest)
- `pnpm run test:e2e` — run Playwright tests
- `pnpm run test:e2e:install-browsers` — install Playwright browsers
- `pnpm format` / `pnpm lint` — code style & lint
- `pnpm run check` — TypeScript + svelte-check
- `pnpm run setup:test-user` — create test user for E2E

---

## Project structure (high level) 🔧

- `src/` — SvelteKit app
  - `routes/` — pages + examples (`/dev`, `/test/*`)
  - `lib/` — shared utilities and components (e.g. `auth-client.ts`, UI components)
- `src/convex/` — Convex functions, schema and config (server-side)
- `scripts/` — handy scripts like `setup-test-user.ts`
- `playwright.config.ts` — E2E config
- `vitest.config.ts` — unit test config

Key files: `src/lib/auth-client.ts`, `src/convex/schema.ts`, `src/routes/test/*` (auth examples).

---

## Tests & CI 📋

- Unit: Vitest (`pnpm test`) — component + utility tests
- E2E: Playwright (`pnpm run test:e2e`) — end-to-end flows (requires test user)
- Add CI workflow to run `pnpm test` and `pnpm run test:e2e:install-browsers` + `pnpm run test:e2e` (recommended)

---

## Security & secrets ⚠️

- Keep `BETTER_AUTH_SECRET` and any Convex admin keys out of the repo.
- Use environment variables in CI / hosting provider secret stores.

---

## Recommended improvements / roadmap (short & prioritized) 🚀

1. Add GitHub Actions workflows for: lint → test → build → deploy.
2. Harden E2E coverage for auth edge-cases (token expiry, refresh, error states).
3. Add accessibility and performance checks (axe/lighthouse) to CI.
4. Expand documentation: add CONTRIBUTING notes for new contributors and architecture diagram.
5. Add example production deployment instructions (SvelteKit adapter + Convex deploy steps).

---

## Contributing

See `CONTRIBUTING.md` for contributor guidelines. The repo follows standard linting and formatting rules — please run `pnpm format` and `pnpm lint` before opening PRs.

---

## Where to look in the code for common tasks

- Authentication / Better Auth integration: `src/convex/*` and `src/lib/auth-client.ts`.
- Add new examples/pages: `src/routes/`.
- Convex functions & schema: `src/convex/` (edit `schema.ts`, add functions).
- E2E tests: `e2e/` and Playwright config.

---

## License

MIT — see `LICENSE`.

---