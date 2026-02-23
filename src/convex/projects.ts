import { mutation, query } from './_generated/server.js';
import { v } from 'convex/values';

// Define a reusable validator for your file objects
const fileSchema = v.object({
	name: v.string(),
	contents: v.string()
});

// -------------------------
// Create & Get Workspace
// -------------------------

// Create a new multi-file project
export const createProject = mutation({
	args: {
		title: v.string(),
		files: v.array(fileSchema), // Strict array of objects
		entry: v.string(),
		visibleFiles: v.array(v.string()),
		ownerId: v.optional(v.string()),
		liveblocksRoomId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('projects', { ...args });
	}
});

// Get the user's permanent workspace, or create it if it doesn't exist
export const getOrCreateUserWorkspace = mutation({
	args: {
		ownerId: v.string(),
		defaultFiles: v.array(v.object({ name: v.string(), contents: v.string() })),
		entry: v.string(),
		visibleFiles: v.array(v.string())
	},
	handler: async (ctx, args) => {
		// 1. Check if the user already has a project
		const existingProject = await ctx.db
			.query('projects')
			.withIndex('by_owner', (q) => q.eq('ownerId', args.ownerId))
			.first();

		if (existingProject) {
			return existingProject;
		}

		// 2. If not, create their permanent room tied deterministically to their ID
		const permanentRoomId = `workspace-${args.ownerId}`;

		const newProjectId = await ctx.db.insert('projects', {
			title: 'My Permanent Workspace',
			ownerId: args.ownerId,
			liveblocksRoomId: permanentRoomId,
			files: args.defaultFiles,
			entry: args.entry,
			visibleFiles: args.visibleFiles
		});

		return await ctx.db.get(newProjectId);
	}
});

// -------------------------
// Read
// -------------------------

// Load a specific project by its Convex ID
export const getProject = query({
	args: { id: v.id('projects') },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	}
});

// List all projects (optionally filtered by the owner)
export const listProjects = query({
	args: {
		ownerId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		if (args.ownerId) {
			// If you add an index on ownerId in schema.ts, you can optimize this with .withIndex()
			return await ctx.db
				.query('projects')
				.filter((q) => q.eq(q.field('ownerId'), args.ownerId))
				.collect();
		}
		return await ctx.db.query('projects').collect();
	}
});

// -------------------------
// Update
// -------------------------

// Update an existing project
// Update an existing project
export const updateProject = mutation({
	args: {
		id: v.id('projects'),
		title: v.optional(v.string()),
		files: v.optional(v.array(v.object({ name: v.string(), contents: v.string() }))),
		entry: v.optional(v.string()),
		visibleFiles: v.optional(v.array(v.string())),
		liveblocksRoomId: v.optional(v.string()) // 👈 ADD THIS
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		await ctx.db.patch(id, updates);
		return id;
	}
});

// -------------------------
// Delete
// -------------------------

// Delete a project by its Convex ID
export const deleteProject = mutation({
	args: { id: v.id('projects') },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	}
});
