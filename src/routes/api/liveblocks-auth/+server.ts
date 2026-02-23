import { type RequestEvent } from '@sveltejs/kit';
import { LIVEBLOCKS_SECRET_KEY } from '$env/static/private';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { Liveblocks } from '@liveblocks/node';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api.js';

const liveblocks = new Liveblocks({
	secret: LIVEBLOCKS_SECRET_KEY
});

// Initialize the Convex HTTP client for server-side queries
const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);

export async function POST({ locals, request }: RequestEvent): Promise<Response> {
	try {
		// 1. Grab the room ID from the Liveblocks client request
		const { room } = await request.json();

		// 2. Grab the token that hooks.server.ts already parsed for us
		if (!locals.token) {
			return new Response('Unauthorized - No Token', { status: 401 });
		}

		// 3. Authenticate the Convex client with the user's token
		convex.setAuth(locals.token);

		// 4. Call your `getCurrentUser` query
		const user = await convex.query(api.auth.getCurrentUser);

		if (!user) {
			return new Response('Unauthorized - User not found', { status: 401 });
		}

		// 5. Prepare the Liveblocks session for this specific user
		const session = liveblocks.prepareSession(user._id, {
			userInfo: {
				name: user.name || 'Anonymous',
				email: user.email || '',
				avatar: user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user._id}`
			}
		});

		// 6. ✨ Explicitly grant full access to the dynamically requested room ✨
		if (room) {
			session.allow(room, session.FULL_ACCESS);
		}

		// 7. Authorize and return the token to the frontend
		const { status, body } = await session.authorize();

		return new Response(body, { status });
	} catch (error) {
		console.error('Liveblocks auth error:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}
