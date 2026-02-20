import { Liveblocks } from '@liveblocks/node';
import { ConvexHttpClient } from 'convex/browser';
import { SECRET_LIVEBLOCKS_KEY } from '$env/static/private';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { api } from '$convex/_generated/api.js';

// 1. Initialize Liveblocks with your SECRET key (Do not use the public key here)
const liveblocksSecret = SECRET_LIVEBLOCKS_KEY;
if (!liveblocksSecret) throw new Error('LIVEBLOCKS_SECRET_KEY is not set');

const liveblocks = new Liveblocks({
	secret: liveblocksSecret
});

// 2. Initialize Convex to read your database
const convexUrl = PUBLIC_CONVEX_URL;
if (!convexUrl) throw new Error('PUBLIC_CONVEX_URL is not set');

const convex = new ConvexHttpClient(convexUrl);

export async function POST({ locals }) {
	// Grab the user from your Auth provider (You mentioned Better Auth in schema.ts)
	const authUserId = locals.session?.user?.id;

	if (!authUserId) {
		return new Response('Unauthorized', { status: 401 });
	}

	// 3. Fetch the user's data from your Convex database
	// You will need a simple Convex query that finds a user by their authUserId
	const convexUser = await convex.query(api.users.getUserByAuthId, { authUserId });

	if (!convexUser) {
		return new Response('User not found', { status: 404 });
	}

	// 4. Start a Liveblocks session using the Convex user ID
	const session = liveblocks.prepareSession(convexUser._id, {
		userInfo: {
			name: convexUser.name || 'Anonymous User'
		}
	});

	// 5. Give the user access to the room
	// You can use a wildcard like `*` for all rooms or specify the exact room name
	session.allow(`my-room`, session.FULL_ACCESS);

	// 6. Return the secure token to the frontend
	const { status, body } = await session.authorize();
	return new Response(body, { status });
}
