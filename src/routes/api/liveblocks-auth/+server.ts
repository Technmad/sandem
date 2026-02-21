import { Liveblocks } from '@liveblocks/node';
import { type RequestEvent } from '@sveltejs/kit';
import { PUBLIC_CONVEX_SITE_URL } from '$env/static/public';
import { LIVEBLOCKS_SECRET } from '$env/static/private';

// 1. Initialize Liveblocks
// The secret key must start with "sk_" and should never be exposed client-side
const liveblocks = new Liveblocks({ secret: LIVEBLOCKS_SECRET });

export async function POST({ request }: RequestEvent) {
	// Debug: log whatever cookies we received from the browser
	const cookieHeader = request.headers.get('cookie') || '';
	console.debug(`[liveblocks-auth] incoming cookies: ${cookieHeader}`);

	// 2. Ask Better Auth (running on Convex) to verify the session
	// We forward the exact cookie string the browser sent to SvelteKit
	if (!PUBLIC_CONVEX_SITE_URL) {
		console.error('[liveblocks-auth] PUBLIC_CONVEX_SITE_URL is not configured');
		return new Response('Configuration error', { status: 500 });
	}

	const authResponse = await fetch(`${PUBLIC_CONVEX_SITE_URL}/api/auth/get-session`, {
		headers: {
			cookie: cookieHeader
		}
	});

	// 3. Parse the session data
	const sessionData = await authResponse.json().catch(() => null);

	// If Convex rejects the cookie or it's missing, sessionData.user will be undefined
	if (!sessionData || !sessionData.user) {
		return new Response('Unauthorized - Invalid or missing Better Auth session', { status: 401 });
	}

	const user = sessionData.user;

	try {
		// 4. Start Liveblocks session using the verified user ID
		const session = liveblocks.prepareSession(user.id, {
			userInfo: {
				name: user.name || 'Anonymous User'
			}
		});

		// 5. Grant access to the room
		session.allow(`my-room`, session.FULL_ACCESS);

		// 6. Return the secure token to the frontend
		const { status, body } = await session.authorize();
		return new Response(body, { status });
	} catch (error) {
		console.error('Liveblocks authorization failed:', error);
		return new Response('Internal Server Error', { status: 500 });
	}
}
