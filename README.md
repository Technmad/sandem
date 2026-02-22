# Sandem

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)  
[![SvelteKit](https://img.shields.io/badge/framework-SvelteKit-orange.svg)]

Version: 0.5.2

<picture>
  <source srcset="./bannerDark.webp" media="(prefers-color-scheme: dark)">
  <source srcset="./banner.webp" media="(prefers-color-scheme: light)">
  <img src="./banner.webp" alt="Auth components preview">
</picture>

## Quick summary ✅

- Frontend: SvelteKit (Svelte v5) + Vite
- Backend: Convex serverless functions (folder: `src/convex`)
- Auth: `better-auth` + `@mmailaender/convex-better-auth-svelte`
- Tests: Vitest (unit) and Playwright (E2E)

This repo is ideal as a reference implementation for SSR + client auth with Convex and for running end-to-end auth tests.

A hands‑on starter kit showing how to build a SvelteKit app with authenticated
routes and real‑time collaboration. Nothing flashy – just a bunch of working
examples you can copy, tweak and learn from.

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

This repo stitches together a handful of pieces that work nicely together.
It’s not meant to be complete; it’s meant to be useful when you’re trying to
understand how things fit.

- **SvelteKit** powers the front end. Everything is written in TypeScript and
  uses Svelte 5’s “rune” syntax (`$state`, `$derived`, etc.). There are global
  styles in `src/app.css`, and most components just arrange markup and accept
  props from layouts.
- **Authentication** is handled by Better Auth (with the `@mmailaender/convex-better-auth-svelte` integration). The client is configured in
  `src/lib/auth-client.ts` and wired into the app via the helper in
  `src/lib/svelte/client.svelte.ts`. Server routes under
  `src/routes/api/auth` simply forward to the Better Auth handler so you don’t
  have to think about cookies or JWTs.
- **Convex** is our database and function host. The schema in
  `src/convex/schema.ts` is intentionally tiny – just users and documents – and
  `src/convex/auth.ts` shows how to plug Better Auth into Convex and export a
  couple of sample query functions. All requests from the frontend go through
  a tiny `ConvexHttpClient` helper that lives in
  `src/lib/sveltekit/index.ts`.
- **Liveblocks + Yjs + CodeMirror** provide the collaborative editor at
  `/code`. The editor component handles mounting and unmounting, while the
  server verifies Liveblocks webhooks and writes updates back into Convex.
- **WebContainer & Terminal** is an experimental feature that boots a
  lightweight Node environment directly in the browser. A terminal UI is
  rendered with `xterm`, and the underlying file system is kept in sync with
  the collaborative editor. See `TO-DO.md` for the full step‑by‑step
  integration plan.

The `src/routes/test` folder contains several small apps you can use while
learning:

- `ssr` renders auth state and user data on the server.
- `client-only` keeps everything in the browser – there’s no SSR token check.
- `queries` shows how to load both public and protected data in a layout
  load function.
- `/dev` is a playground with sign‑in/sign‑up forms, a fetch‑token demo, and
  some `console.log` debugging helpers.

Every file now has inline comments explaining what it does, so feel free to
read through them when you get lost.

---

## Quick start

What you need on your machine:

- Node.js 18 or later
- pnpm (npm/yarn also work, but this repo uses pnpm)
- Convex CLI (`npx convex`)

Get going:

```bash
pnpm install
pnpm dev              # runs frontend + backend together
# or:
pnpm dev:frontend     # just the SvelteKit app
pnpm dev:backend      # just the Convex server
```

To populate a test account for the Playwright suite, copy
`.env.test.example` to `.env.test` and then run:

```bash
pnpm run setup:test-user
```

Build and preview the production output:

```bash
pnpm build
pnpm preview
```

---

## Environment variables

Put runtime vars in `.env.local` and Playwright credentials in `.env.test`.

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

`SITE_URL` should match the baseURL used in
`src/lib/auth-client.ts` (the default there is `http://localhost:5173`).

---

## Development & testing

- `pnpm run check` – TypeScript and Svelte checks
- `pnpm format` – format code with Prettier
- `pnpm lint` – run ESLint
- `pnpm test` – unit tests (Vitest)
- `pnpm run test:e2e:install-browsers` and `pnpm run test:e2e` – Playwright

`pnpm dev` starts both the SvelteKit server and the Convex dev server.
The script `scripts/setup-test-user.ts` is handy when you need a known user
for your end‑to‑end suite.

---

## Scripts you will use frequently

- `pnpm dev` – frontend + Convex in watch mode
- `pnpm build` – create a production build
- `pnpm preview` – serve the built site locally
- `pnpm test` – unit tests
- `pnpm run test:e2e` – end‑to‑end tests
- `pnpm run test:e2e:install-browsers` – install Playwright browsers
- `pnpm format` / `pnpm lint` – code style checks
- `pnpm run check` – TypeScript + svelte-check
- `pnpm run setup:test-user` – create the test account

---

## Project layout (high level)

- `src/` – front‑end app
  - `lib/` – shared utilities and components (`auth-client.ts`, UI bits)
  - `routes/` – pages, including the examples in `test/`
- `src/convex/` – Convex schema, server functions, and generated types
- `e2e/` – Playwright tests
- `scripts/` – auxiliary scripts like the test‑user creator
- `playwright.config.ts` and `vitest.config.ts`

Key files:

- `src/lib/auth-client.ts` – Better Auth client setup
- `src/convex/schema.ts` – database schema
- `src/convex/_generated/` – generated Convex API/types
- `src/lib/components/Editor.svelte` – real‑time editor demo

---

## Tests & CI

There are a couple of test suites built in.

- Unit tests run with Vitest (`pnpm test`).
- End‑to‑end tests run with Playwright (`pnpm run test:e2e`).

A sensible CI pipeline would lint, run the unit tests, install Playwright
browsers, run the E2E tests, then build and deploy.

---

## Deployment (notes)

1. Build the frontend (`pnpm build`) and deploy it with whatever SvelteKit
   adapter you like (Node, Cloudflare, etc.).
2. Push the Convex functions with `npx convex deploy`.
3. Make sure the host has the necessary secrets: `BETTER_AUTH_SECRET`, Convex
   admin key, `SITE_URL`, etc.

---

## Troubleshooting

- If auth isn’t working, check that the cookie names in the browser match what
  your `createAuth` instance expects. The helper in
  `src/lib/sveltekit/index.ts` logs a warning if it finds a secure/insecure
  mismatch.
- Liveblocks editor requires a valid room; if the webhook handler logs
  “Webhook authorization failed”, double‑check `SECRET_LIVEBLOCKS_KEY`.
- Playwright tests talk to `http://localhost:5173`; if you change the port,
  update `.env.test` and the config file.

---

## Contributing & roadmap

Want to add features or improve the docs? great. Here are some ideas in order
of importance:

1. Add GitHub Actions workflows for lint → test → build → deploy.
2. Expand the E2E suite to cover token expiry, refresh, and other edge cases.
3. Add accessibility and performance checks (axe, Lighthouse) to CI.
4. Write a short contributor guide and draw an architecture diagram.
5. Document a sample production deployment for a popular host.

Please run `pnpm format` and `pnpm lint` before submitting a PR.

---

## Where to look next

- Auth setup: `src/convex/*` and `src/lib/auth-client.ts`.
- Add a new route or component? look under `src/routes/`.
- Convex functions & schema go in `src/convex/`.
- Tests live in `e2e/` and `src/lib/sveltekit/index.spec.ts`.

### WebContainer & Terminal demo ⚙️

A work‑in‑progress feature allows you to spin up a full Node.js shell right
in the browser using the [WebContainer API](https://webcontainer.io). The
terminal is built with `xterm`, and keystrokes are piped back to a spawned
shell process. As you type in the collaborative editor, the container file
system updates automatically, so you can run code without leaving the
sandbox.

Refer to [`TO-DO.md`](TO-DO.md) for a detailed checklist of implementation
phases and installation notes; once the integration is finished we’ll move
this documentation into its own guide.

---

## License

MIT. See the `LICENSE` file.
