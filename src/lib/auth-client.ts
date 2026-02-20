import { createAuthClient } from 'better-auth/svelte';
import { convexClient } from '@convex-dev/better-auth/client/plugins';

export const authClient = createAuthClient({
	plugins: [convexClient()]
	// Remove the baseURL entirely so it defaults to window.location.origin
	// (which will be http://localhost:5173 in dev)
});
