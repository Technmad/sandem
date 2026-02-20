// convex/documents.ts
import { mutation } from './_generated/server.js';
import { v } from 'convex/values';

export const saveDocument = mutation({
	args: {
		roomId: v.string(),
		content: v.string()
	},
	handler: async (ctx, args) => {
		// Look to see if this room already has a saved document
		const existingDoc = await ctx.db
			.query('documents')
			.withIndex('by_roomId', (q) => q.eq('roomId', args.roomId))
			.first();

		if (existingDoc) {
			// If it exists, update it with the new code
			await ctx.db.patch(existingDoc._id, { content: args.content });
		} else {
			// If it's a new room, insert a new record
			await ctx.db.insert('documents', {
				roomId: args.roomId,
				content: args.content
			});
		}
	}
});
