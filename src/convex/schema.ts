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
		owner: v.string(),
		room: v.string()
	})
		// This index is crucial for performance and privacy
		.index('by_owner', ['owner'])
});
