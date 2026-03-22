# SvelteKit server and auth helpers

> Last updated: 2026-03-22

Server-side utilities for SSR authentication, Convex HTTP client setup, and auth routing.

## Contents

- `index.ts` → core SvelteKit auth utilities
  - `getToken()` → extract JWT from cookies
  - `getAuthState()` → check if user is authenticated (SSR)
  - `createConvexHttpClient()` → initialize Convex HTTP client for server
  - `createSvelteKitHandler()` → handle auth routes with timeouts

- `errors.ts` → app-level error formatting and helpers
  - `createAppError()` → structured error creation
  - `toAppError()` → convert any value to app error
  - `formatAppError()` → human-readable error messages

## Import style

```typescript
import { getAuthState, createConvexHttpClient } from '$lib/sveltekit';
import { createAppError, formatAppError } from '$lib/sveltekit';

// Or separated
import { createAppError } from '$lib/sveltekit/errors';
```

## Usage in +layout.server.ts

```typescript
import { getAuthState, createConvexHttpClient } from '$lib/sveltekit';

export const load = async ({ cookies }) => {
	const authState = await getAuthState(createAuth, cookies);
	const client = createConvexHttpClient({ token: cookies.get('token') });

	return { authState };
};
```

## Design philosophy

- **Server-only** — uses SvelteKit RequestHandler and Cookies
- **Error recovery** — timeouts and fallbacks for auth endpoints
- **SSR first** — provides initial auth state to avoid hydration flash
