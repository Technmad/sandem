// src/routes/api/liveblocks-webhook/+server.ts
import { WebhookHandler } from '@liveblocks/node';
import { ConvexHttpClient } from 'convex/browser';
import { env } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { api } from '$convex/_generated/api.js';

// Initialize Convex and Liveblocks Webhook verifyer
const convex = new ConvexHttpClient(publicEnv.PUBLIC_CONVEX_URL);
const webhookHandler = new WebhookHandler(env.LIVEBLOCKS_WEBHOOK_SECRET!); // Get this from Liveblocks dashboard

export async function POST({ request }) {
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
					Authorization: `Bearer ${env.LIVEBLOCKS_SECRET_KEY}`
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
