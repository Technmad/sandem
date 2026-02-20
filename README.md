# Sandem

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)  
[![SvelteKit](https://img.shields.io/badge/framework-SvelteKit-orange.svg)]

Version: 0.5.1

A compact, opinionated example demonstrating SvelteKit + Convex with Better Auth (SSR + client flows). Includes examples, unit + E2E tests, and utilities so you can bootstrap auth-enabled SvelteKit apps backed by Convex.

---

## Table of contents

- Quick start
- Environment variables
- Development & testing
- Project layout
- Deployment
- Troubleshooting
- Contributing & roadmap

---

## Quick start

Requirements:

- Node.js 18+
- pnpm (recommended) or npm/yarn
- Convex CLI (used via `npx convex`)

Install and run locally:

```bash
pnpm install
pnpm dev           # starts frontend + convex (recommended)
# or
pnpm dev:frontend   # frontend only
pnpm dev:backend    # convex backend only
```

Create the E2E test user (uses `./.env.test`):

```bash
pnpm run setup:test-user
```

Build & preview:

```bash
pnpm build
pnpm preview
```

---

## Environment variables

Create `.env.local` for runtime/dev and `.env.test` for Playwright credentials.

Example `.env.local`:

```env
SITE_URL=http://localhost:5173
PUBLIC_CONVEX_URL=https://<your-convex>.convex.cloud
PUBLIC_CONVEX_SITE_URL=https://<your-convex>.convex.site
CONVEX_DEPLOYMENT=dev:your-deployment
BETTER_AUTH_SECRET=<random-base64-secret>
```

Example `.env.test`:

```env
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
TEST_USER_NAME="Test User"
SITE_URL=http://localhost:5173
```

Important: `SITE_URL` must match the `baseURL` in `src/lib/auth-client.ts` (default: `http://localhost:5173`).

---

## Development & testing

- Type-check and Svelte checks: `pnpm run check`
- Format: `pnpm format`
- Lint: `pnpm lint`
- Unit tests (Vitest): `pnpm test`
- E2E tests (Playwright):
  - Install browsers: `pnpm run test:e2e:install-browsers`
  - Run: `pnpm run test:e2e`

Notes:

- `pnpm dev` runs both the SvelteKit dev server and the Convex dev server concurrently.
- `scripts/setup-test-user.ts` creates a verified test user for Playwright flows.

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

## Project layout (high level)

- `src/` — frontend app
  - `lib/` — shared utilities & UI components (`auth-client.ts`, components)
  - `routes/` — SvelteKit pages and examples
- `src/convex/` — Convex server functions, schema and generated API
- `e2e/` — Playwright end-to-end tests
- `scripts/` — helper scripts (test user setup)
- `playwright.config.ts`, `vitest.config.ts`

Key files:

- `src/lib/auth-client.ts` — baseURL and auth helper
- `src/convex/schema.ts` — Convex schema
- `src/convex/_generated/` — generated Convex API
- `src/lib/components/Editor.svelte` — collaborative editor example (Liveblocks + Yjs)

---

## Tests & CI

- Unit: Vitest (`pnpm test`)
- E2E: Playwright (`pnpm run test:e2e`)

Suggested CI: lint → test → e2e (install browsers) → build → deploy.

---

## Deployment (notes)

- Build the frontend with `pnpm build` and deploy with a SvelteKit adapter appropriate for your host.
- Deploy Convex functions with `npx convex deploy`.
- Ensure runtime secrets are set in your host (e.g. `BETTER_AUTH_SECRET`, Convex admin key, `SITE_URL`).

Production checklist:

1. Choose stable SvelteKit adapter for host (e.g. `adapter-node`).
2. Add CI pipelines for tests and deploy.
3. Add monitoring and health checks for auth flows.

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

## Where to look next

- Authentication / Better Auth integration: `src/convex/*` and `src/lib/auth-client.ts`.
- Add new examples/pages: `src/routes/`.
- Convex functions & schema: `src/convex/` (edit `schema.ts`, add functions).
- E2E tests: `e2e/` and Playwright config.

---

## License

MIT — see `LICENSE`.

---
