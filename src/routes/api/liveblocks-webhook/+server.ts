// src/routes/api/liveblocks-webhook/+server.ts
import { WebhookHandler } from '@liveblocks/node';
import { ConvexHttpClient } from 'convex/browser';
import { SECRET_LIVEBLOCKS_KEY } from '$env/static/private';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { api } from '$convex/_generated/api.js';

// Initialize Convex and Liveblocks Webhook verifyer
const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);

export async function POST({ request }) {
	const webhookHandler = new WebhookHandler(SECRET_LIVEBLOCKS_KEY);
	const body = await request.text();
	const headers = request.headers;

	try {
		// 1. Verify the request actually came from Liveblocks
		const event = webhookHandler.verifyRequest({
			headers: {
				'webhook-id': headers.get('webhook-id')!,
				'webhook-timestamp': headers.get('webhook-timestamp')!,
				'webhook-signature': headers.get('webhook-signature')!
			},
			rawBody: body
		});

		// 2. Check if the event is a Yjs Document Update
		if (event.type === 'ydocUpdated') {
			const roomId = event.data.roomId;

			// 3. Fetch the actual text content from Liveblocks API
			// Note: 'codemirror' is the name you gave your Yjs text in Editor.svelte
			const response = await fetch(`https://api.liveblocks.io/v2/rooms/${roomId}/ydoc/codemirror`, {
				headers: {
					Authorization: `Bearer ${SECRET_LIVEBLOCKS_KEY}`
				}
			});

			if (response.ok) {
				const content = await response.text();

				// 4. Send the updated code to your Convex database
				await convex.mutation(api.documents.saveDocument, {
					roomId,
					content
				});
			}
		}

		return new Response('Webhook processed successfully', { status: 200 });
	} catch (error) {
		console.error('Webhook Error:', error);
		return new Response('Webhook authorization failed', { status: 400 });
	}
}
