import type { Handle } from '@sveltejs/kit';
import { createAuth } from '$convex/auth.js';
import { getToken } from '$lib/sveltekit/index.js';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.token = await getToken(createAuth, event.cookies);

	const response = await resolve(event);
	// ensure cross-origin isolation for WebContainer in production builds
	response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	return response;
};
