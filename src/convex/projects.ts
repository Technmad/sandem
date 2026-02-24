import { mutation, query } from './_generated/server.js';
import { v } from 'convex/values';

const fileSchema = v.object({
	name: v.string(),
	contents: v.string()
});

// -------------------------
// Create & Get
// -------------------------

export const createProject = mutation({
	args: {
		title: v.string(),
		files: v.array(fileSchema),
		entry: v.string(),
		visibleFiles: v.array(v.string()),
		ownerId: v.optional(v.string()), // Passed from the frontend auth state
		liveblocksRoomId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('projects', { ...args });
	}
});

// List projects FOR THE CURRENT USER
export const listProjects = query({
	args: {
		ownerId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		// Secure by default: if no ownerId is provided, return nothing
		if (!args.ownerId) {
			return [];
		}

		// Optimized fetch using the index
		return await ctx.db
			.query('projects')
			.withIndex('by_owner', (q) => q.eq('ownerId', args.ownerId))
			.collect();
	}
});

// -------------------------
// Liveblocks Queries
// -------------------------

export const getProjectByRoomId = query({
	args: { roomId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('projects')
			.filter((q) => q.eq(q.field('liveblocksRoomId'), args.roomId))
			.first();
	}
});

export const getProject = query({
	args: { id: v.id('projects') },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	}
});

// -------------------------
// Update
// -------------------------

export const updateProject = mutation({
	args: {
		id: v.id('projects'),
		title: v.optional(v.string()),
		files: v.optional(v.array(fileSchema)),
		entry: v.optional(v.string()),
		visibleFiles: v.optional(v.array(v.string())),
		liveblocksRoomId: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		await ctx.db.patch(id, updates);
	}
});

// Helper for workspace initialization
export const getOrCreateUserWorkspace = mutation({
	args: {
		ownerId: v.string(),
		defaultFiles: v.array(fileSchema),
		entry: v.string(),
		visibleFiles: v.array(v.string())
	},
	handler: async (ctx, args) => {
		const existingProject = await ctx.db
			.query('projects')
			.withIndex('by_owner', (q) => q.eq('ownerId', args.ownerId))
			.first();

		if (existingProject) return existingProject;

		const id = await ctx.db.insert('projects', {
			title: 'My Permanent Workspace',
			files: args.defaultFiles,
			entry: args.entry,
			visibleFiles: args.visibleFiles,
			ownerId: args.ownerId
		});

		return await ctx.db.get(id);
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
