# Changelog

> Last updated: 2026-03-21
>
> **📚 For complete project documentation, see [docs/README.md](./docs/README.md)**

## Unreleased

### Patch Changes

- docs: moved architecture/implementation materials into [`docs/`](./docs/) with ordered filenames (`00_Getting_Started.md` → `10_Next_Steps.md`) and an index-style [docs guide](./docs/README.md)
- docs: updated root docs (`README`, `CONTRIBUTING`, `CHANGELOG`) to point to the new docs hub and current implementation status
- explorer: extracted file-tree pure operations into [src/lib/utils/editor/fileTreeOps.ts](src/lib/utils/editor/fileTreeOps.ts)
- explorer: improved file-tree resilience by adding WebContainer readiness checks + retry loop in [src/lib/controllers/explorer/createFileTreeController.svelte.ts](src/lib/controllers/explorer/createFileTreeController.svelte.ts)
- explorer: added initial Convex/project sync scaffolding in [src/lib/hooks/explorer/createProjectSyncController.svelte.ts](src/lib/hooks/explorer/createProjectSyncController.svelte.ts), [src/lib/controllers/explorer/createExplorerActionsController.svelte.ts](src/lib/controllers/explorer/createExplorerActionsController.svelte.ts), and [src/lib/utils/editor/projectFolderSync.ts](src/lib/utils/editor/projectFolderSync.ts)
- auth: added timeout + graceful 504 fallback in SvelteKit auth request forwarding in [src/lib/sveltekit/index.ts](src/lib/sveltekit/index.ts)
- vite: added Monaco dev sourcemap patching plugin + optimizeDeps exclusion in [vite.config.ts](vite.config.ts)
- ui: improved reusable token-driven component APIs for auth + showcase routes
- showcase: tabs now render different accordion datasets in `/shop`
- repo: demo mode is now guest-only on `/repo` (authenticated users no longer fall back to demo based on project count)
- repo: first-time authenticated users are auto-seeded with a starter project through `ensureStarterProjectForOwner`

## 0.5.1

### Patch Changes

- fix: Sets the host header on the proxied request to match the target Convex URL instead of copying the original request's host => Prevents request loops when both the frontend and Convex are behind the same reverse proxy (e.g. Traefik)

## 0.5.0

### Minor Changes

- feat: update to convex better auth 0.10 and better auth 1.4

## 0.4.2

### Patch Changes

- fix: initialize correctly auth.isLoading with false if the client receives the server state during ssr.

## 0.4.1

### Patch Changes

- chore: remove debug inspect statement

## 0.4.0

### Minor Changes

- Add SSR initialization for auth client

## 0.3.0

### Minor Changes

- feat: add external session support for device authorization and api keys

## 0.2.1

### Patch Changes

- chore: update convex-svelte minimum version to 0.0.12
  This avoids effect in teardown errors by using the new "skip" query option for queries that depend on isAuthenticated.

## 0.2.0

### Minor Changes

- Rised @convex-dev/better-auth peer dependency to 0.9.0
- Rised better-auth peer dependency to 1.3.27

## 0.1.1

### Patch Changes

- fix: remove bloated logging for createAuth in getToken
- Updated dependencies
  - @mmailaender/convex-better-auth-svelte@0.1.1

## 0.1.0

### Minor Changes

- fix: refactor createConvexHttpClient from cookie to token - fixes https://github.com/mmailaender/convex-better-auth-svelte/issues/6

## 0.0.6

### Patch Changes

- Updated docs to support convex better auth 0.8
- Updated peer-dependencies
  - @convex-dev/better-auth@0.8.6

## 0.0.5

### Patch Changes

- d10b08c: Update better-auth and convex dependencies to peer deps

## 0.0.4

- Feature: Validate isAuthenticated via setAuth callback instead via api similar like react. Removes the need to pass the api to createSvelteAuthClient().

```ts
import { createSvelteAuthClient } from '$lib/svelte/index.js';
import { authClient } from '$lib/auth-client.js';

createSvelteAuthClient({ authClient });
```

## 0.0.3

- Fix: Pass convex api to createSvelteAuthClient() to resolve type errors

```ts
import { createSvelteAuthClient } from '$lib/svelte/index.js';
import { authClient } from '$lib/auth-client.js';
import { api } from '$convex/_generated/api.js';

createSvelteAuthClient({ authClient, api });
```

## 0.0.2

- Add createConvexHttpClient() for sveltekit to simplify creating a Convex client with the correct authentication token

## 0.0.1

- Initial release
