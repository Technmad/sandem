# Contributing to Sandem

> Last updated: 2026-03-21
>
> **📚 For architecture & feature documentation, see [docs/README.md](./docs/README.md)**

Thank you for contributing to Sandem. This guide focuses on local setup, validation, and PR quality.

## Documentation first (recommended)

Before changing architecture-heavy areas, read:

- [docs/00_Getting_Started.md](./docs/00_Getting_Started.md)
- [docs/03_Architecture_Details.md](./docs/03_Architecture_Details.md)
- [docs/10_Next_Steps.md](./docs/10_Next_Steps.md)

If you are working on explorer/project synchronization, also review:

- [src/lib/controllers/explorer/createFileTreeController.svelte.ts](src/lib/controllers/explorer/createFileTreeController.svelte.ts)
- [src/lib/hooks/explorer/createProjectSyncController.svelte.ts](src/lib/hooks/explorer/createProjectSyncController.svelte.ts)
- [src/lib/controllers/explorer/createExplorerActionsController.svelte.ts](src/lib/controllers/explorer/createExplorerActionsController.svelte.ts)
- [src/lib/utils/editor/fileTreeOps.ts](src/lib/utils/editor/fileTreeOps.ts)
- [src/lib/utils/editor/projectFolderSync.ts](src/lib/utils/editor/projectFolderSync.ts)

## Prerequisites

- Node.js 22+
- pnpm
- A Convex account (free tier works)
- Playwright browsers (for E2E only)

## Development Setup

### 1. Clone and Install

```bash
git clone https://github.com/tan-devs/sandem.git
cd sandem
pnpm install
cp .env.example .env.local
```

Then fill `.env.local` with your Convex / Liveblocks / OAuth values.

### 2. Set Up Convex

Create a new Convex project or use an existing one:

```bash
npx convex dev
```

This will prompt you to create a new project or link to an existing one.

> Tip: `pnpm run dev` also starts Convex (`dev:server`) for you.

### 3. Run Development Server

```bash
pnpm run dev
```

This starts both the Vite dev server and Convex in watch mode.

## Running Tests

### Unit Tests

```bash
pnpm run test       # one-shot CI mode
pnpm run test:unit  # watch/interactive mode
```

### E2E Tests

E2E tests require:

- a running app (`SITE_URL` in `.env.test`, default `http://localhost:5173`)
- a test user in your Convex-backed auth store

#### 1. Create Test User

Make sure your dev server is running, then:

```bash
pnpm run setup:test-user
```

This creates a user with the credentials from `.env.test` in your Convex database.

#### 2. Install Playwright Browsers

First time only:

```bash
pnpm run test:e2e:install-browsers
```

#### 3. Run E2E Tests

```bash
pnpm run test:e2e
```

Or run with UI:

```bash
pnpm run test:e2e:ui
```

## Test Scenarios

The E2E tests cover these authentication scenarios:

| Scenario          | Description                                             |
| ----------------- | ------------------------------------------------------- |
| SSR Authenticated | User is authenticated via SSR, sees content immediately |
| SSR → Sign Out    | Authenticated user signs out                            |
| Client-only Auth  | User signs in without SSR state                         |
| Protected Queries | Queries that require authentication                     |

## Project Structure (high-level)

```
├── src/
│   ├── lib/
│   │   ├── components/       # Reusable UI + IDE components
│   │   ├── hooks/            # File tree, autosave, preview, etc.
│   │   ├── context/          # Shared app contexts
│   │   ├── stores/           # Shared state
│   │   ├── svelte/           # Auth bridges/helpers
│   │   └── sveltekit/        # Server-side helpers
│   └── routes/
│       ├── +layout.svelte    # Root layout (CSS, nav)
│       ├── (home)/           # Home, auth, shop, test pages
│       ├── repo/             # IDE shell route
│       └── api/              # Auth and Liveblocks server endpoints
├── e2e/                      # E2E tests (Playwright)
├── scripts/                  # Development scripts
└── src/convex/               # Convex backend

```

## Useful scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm check
pnpm test
pnpm test:unit
pnpm test:e2e:install-browsers
pnpm test:e2e
```

## Docker status

- `compose.yaml` exists.
- It references a root `Dockerfile`, but the repository currently has no root Dockerfile.
- So `docker compose up --build` is expected to fail until Dockerfile is added.

Use the Node/pnpm path above for local contribution work.

## Route Overview

| Route               | Purpose                                                         |
| ------------------- | --------------------------------------------------------------- |
| `/`                 | Landing page                                                    |
| `/auth`             | Sign in / sign up                                               |
| `/shop`             | Reusable component showcase                                     |
| `/repo`             | IDE workspace shell (guest demo / authenticated repo workspace) |
| `/test/ssr`         | SSR auth behavior tests                                         |
| `/test/client-only` | Client-only auth behavior tests                                 |
| `/test/queries`     | Public/protected query behavior test                            |

### `/repo` first-visit behavior

- Guests (`currentUser = null`) see the demo workspace template.
- Authenticated users always enter their own repo workspace flow.
- On first authenticated visit, backend seeding (`ensureStarterProjectForOwner`) creates a starter project if the owner has no projects yet.

## Code style

- We use Prettier + ESLint.
- Run `pnpm run format` before committing.
- Run `pnpm run lint` and `pnpm run check` before opening a PR.
- Prefer minimal, focused commits and avoid unrelated formatting churn.

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run checks (`pnpm run lint && pnpm run check`)
5. Run tests (`pnpm run test && pnpm run test:e2e` when relevant)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Questions?

Feel free to open an issue if you have questions or run into problems.
