# Svelte utilities and client setup

> Last updated: 2026-03-22

Client-side Svelte helpers and auth integration.

## Contents

- `client.svelte.ts` → Convex + Better Auth client initialization
  - `createSvelteAuthClient()` → initialize auth with Convex plugins
  - `setupConvexAuth()` → wire up auth context and error boundaries
  - Context helpers for accessing auth state in components

## Import style

```typescript
import { createSvelteAuthClient } from '$lib/svelte';
import type { ConvexAuthClient } from '$lib/svelte';
```

## Usage

Typically set up once in root layout:

```svelte
<script>
	import { createSvelteAuthClient } from '$lib/svelte';

	const { authClient, convexClient } = createSvelteAuthClient({
		verbose: true
	});
</script>
```

## Design philosophy

- **Client-only** — uses Svelte 5 runes and browser APIs
- **Composable** — designed to be called from layout components
- **Type-safe** — full TypeScript support for auth state
