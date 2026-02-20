// convex/schema.ts
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	users: defineTable({
		// It's still stored as a string, but this tells Convex it's specifically a string
		// that represents a Better Auth user ID from the component.
		authUserId: v.string(),
		name: v.optional(v.string())
		// ... other fields
	}).index('by_authUserId', ['authUserId']),

	documents: defineTable({
		roomId: v.string(),
		content: v.string()
	}).index('by_roomId', ['roomId'])
});
