// liveblocks.config.ts
import { createClient } from '@liveblocks/client';

// Define Liveblocks types based on your Convex user schema
declare global {
	interface Liveblocks {
		Presence: {
			cursor: { x: number; y: number } | null;
		};
		Storage: Record<string, never>;
		UserMeta: {
			id: string; // Convex User ID
			info: {
				name: string;
				email: string;
				avatar: string;
			};
		};
		RoomEvent: Record<string, never>;
		ThreadMetadata: Record<string, never>;
		RoomInfo: Record<string, never>;
	}
}

// Client initialization with the custom auth fetcher
export const client = createClient({
	authEndpoint: async (room) => {
		const response = await fetch('/api/liveblocks-auth', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ room })
		});

		if (!response.ok) {
			throw new Error('Failed to authenticate with Liveblocks');
		}

		return await response.json();
	}
});
