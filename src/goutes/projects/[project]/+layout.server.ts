import { error } from '@sveltejs/kit';
import { api } from '$convex/_generated/api.js';
import type { Id } from '$convex/_generated/dataModel.js';
import { createAuth } from '$convex/auth.js';
import { createConvexHttpClient, getAuthState } from '$lib/sveltekit/index.js';
import type { LayoutServerLoad } from './$types.js';

export const ssr = false;

export const load = (async ({ locals, cookies, params }) => {
	const client = createConvexHttpClient({ token: locals.token });
	const authState = await getAuthState(createAuth, cookies);

	try {
		const currentUser = await client.query(api.auth.getCurrentUser, {});
		// Note: route parameter is named `slug` (not `projectId`).
		// use `params.slug` or rename for clarity when implementing.
		const project = await client.query(api.projects.getProject, {
			id: params.project as Id<'projects'>
		});

		// Validate ownership
		if (!project || project.owner !== currentUser?._id) {
			throw error(403, 'Unauthorized');
		}

		return { currentUser, authState, project };
	} catch {
		// if anything fails we still provide authState so client handshake won't crash
		return { currentUser: null, authState, project: null };
	}
}) satisfies LayoutServerLoad;
