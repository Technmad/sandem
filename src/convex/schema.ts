import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	projects: defineTable({
		title: v.string(),
		files: v.array(
			v.object({
				name: v.string(),
				contents: v.string()
			})
		),
		entry: v.string(),
		visibleFiles: v.array(v.string()),
		// Link the project to the owner using Better Auth's user ID
		ownerId: v.optional(v.string()),
		liveblocksRoomId: v.optional(v.string())
	})
		// This index is crucial for performance and privacy
		.index('by_owner', ['ownerId'])
});
