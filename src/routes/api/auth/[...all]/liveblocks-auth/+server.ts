import { Liveblocks } from '@liveblocks/node';
import { ConvexHttpClient } from 'convex/browser';
import { env } from '$env/dynamic/private';
import { api } from '$convex/_generated/api.js';

// 1. Initialize Liveblocks with your SECRET key (Do not use the public key here)
const liveblocks = new Liveblocks({
	secret: env.LIVEBLOCKS_SECRET_KEY
});

// 2. Initialize Convex to read your database
const convex = new ConvexHttpClient(env.PUBLIC_CONVEX_URL);

export async function POST({  locals }) {
	// Grab the user from your Auth provider (You mentioned Better Auth in schema.ts)
	const authUserId = locals.session?.user?.id;

	if (!authUserId) {
		return new Response('Unauthorized', { status: 401 });
	}

	// 3. Fetch the user's data from your Convex database
	// You will need a simple Convex query that finds a user by their authUserId
	const convexUser = await convex.query(api.users.getUserByAuthId, { authUserId });

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
