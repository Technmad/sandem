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

const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);

export async function POST({ locals, request }: RequestEvent): Promise<Response> {
	try {
		const { room } = await request.json();

		if (!locals.token) {
			return new Response('Unauthorized - No Token', { status: 401 });
		}

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
			// FIX: Fetch the project from Convex using the Room ID
			const project = await convex.query(api.projects.getProjectByRoomId, { roomId: room });
			if (project) {
				const isOwner = project.ownerId === user._id;
				session.allow(room, isOwner ? session.FULL_ACCESS : ['room:read', 'room:presence:write']);
			} else {
				// If project doesn't exist, you might want to deny access or allow read-only
				session.allow(room, ['room:read']);
			}
		}

		const { status, body } = await session.authorize();
		return new Response(body, { status });
	} catch (error) {
		console.error('Liveblocks auth error:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}
