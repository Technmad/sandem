// src/routes/api/liveblocks-auth/+server.ts
import { type RequestEvent } from '@sveltejs/kit';
import { LIVEBLOCKS_SECRET_KEY } from '$env/static/private';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { Liveblocks } from '@liveblocks/node';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '$convex/_generated/api.js';

const liveblocks = new Liveblocks({
	secret: LIVEBLOCKS_SECRET_KEY
});

// NOTE: create a new ConvexHttpClient for each request to avoid
// concurrency issues.  A shared client would have its auth token
// overwritten by concurrent requests, leading to possible data leaks.
// We instantiate below inside POST.

export async function POST({ locals, request }: RequestEvent): Promise<Response> {
	try {
		const { room } = await request.json();
		if (room) {
			if (typeof room !== 'string') {
				return new Response('Invalid room ID type', { status: 400 });
			}
			if (room.trim().length === 0) {
				return new Response('Room ID cannot be empty', { status: 400 });
			}
		}

		if (!locals.token) {
			return new Response('Unauthorized - No Token', { status: 401 });
		}

		// create fresh client for every POST invocation to prevent tokens
		// from leaking between concurrent requests
		const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);
		convex.setAuth(locals.token);
		const user = await convex.query(api.auth.getCurrentUser);

		if (!user) {
			return new Response('Unauthorized - User not found', { status: 401 });
		}

		const session = liveblocks.prepareSession(user._id, {
			userInfo: {
				name: user.name || 'Anonymous',
				email: user.email || '',
				avatar: user.image || ''
			}
		});

		if (room) {
			// look up project by collaboration room
			const project = await convex.query(api.projects.openCollab, {
				room,
				owner: user._id
			});
			if (!project) {
				// no such project or not accessible by this user
				return new Response('Room not found or access denied', { status: 403 });
			}

			const isOwner = project.owner === user._id;
			const permissions = isOwner
				? ['room:write', 'room:presence:write', 'room:comments:write']
				: ['room:read', 'room:presence:write'];
			session.allow(room, permissions);
		}

		const { status, body } = await session.authorize();
		return new Response(body, { status });
	} catch (error) {
		console.error('Liveblocks auth error:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}
