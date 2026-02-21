import { type RequestEvent } from '@sveltejs/kit';
import { Liveblocks } from '@liveblocks/node';
import { PRIVATE_SECRET_KEY } from '$env/static/private';

const liveblocks = new Liveblocks({
	secret: PRIVATE_SECRET_KEY
});

export async function POST({ request }: RequestEvent) {
	try {
		// 2. Prepare the Liveblocks session
		const session = liveblocks.prepareSession('user', {
			userInfo: {
				name: 'Anonymous Developer'
			}
		});

		// 3. Get the room from the request body and grant access
		const { room } = await request.json();
		if (room) {
			session.allow(room, session.FULL_ACCESS);
		}

		// 4. Authorize and return the JSON response
		const { status, body } = await session.authorize();

		// This is the crucial part: Returning a proper Response object
		// so SvelteKit doesn't send an HTML error page.
		return new Response(body, { status });
	} catch (err: unknown) {
		console.error('Liveblocks Auth Error:', err);
		const message = err instanceof Error ? err.message : String(err);
		return new Response(JSON.stringify({ error: message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
}
