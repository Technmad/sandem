import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	// The new table for your collaborative multi-modal editor projects
	projects: defineTable({
		title: v.string(), // e.g., "React Vite Starter"

		// We store files as an array of objects to ensure strict validation in Convex
		files: v.array(
			v.object({
				name: v.string(), // e.g., "App.jsx"
				contents: v.string() // e.g., "export default function App() {..."
			})
		),

		entry: v.string(), // e.g., "index.jsx"

		visibleFiles: v.array(
			v.string() // e.g., ["App.jsx", "index.jsx", "index.html"]
		),

		// Link the project to the owner using Better Auth's user ID
		ownerId: v.optional(v.string()),

		// Optional: a room ID string to easily link this to a Liveblocks room
		liveblocksRoomId: v.optional(v.string())
	})
		// Create an index so you can quickly fetch all projects belonging to a specific user
		.index('by_owner', ['ownerId'])
});
