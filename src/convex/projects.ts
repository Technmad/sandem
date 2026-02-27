// convex/projects.ts
import { mutation, query } from './_generated/server.js';
import { v } from 'convex/values';

const FILE = v.object({
	name: v.string(),
	contents: v.string()
});

// -------------------------
// Create & Get
// -------------------------

export const createProject = mutation({
	args: {
		title: v.string(),
		files: v.array(FILE),
		owner: v.string(),
		room: v.string()
	},
	handler: async (ctx, args) => {
		return await ctx.db.insert('projects', { ...args });
	}
});

export const getProjects = query({
	args: { owner: v.string() },
	handler: async (ctx, args) => {
		if (!args.owner) return [];

		return await ctx.db
			.query('projects')
			.withIndex('by_owner', (q) => q.eq('owner', args.owner))
			.collect();
	}
});

export const getProject = query({
	args: { id: v.id('projects') },
	handler: async (ctx, args) => {
		return await ctx.db.get(args.id);
	}
});

// -------------------------
// Collab
// -------------------------

export const openCollab = query({
	args: { room: v.string(), owner: v.string() },
	handler: async (ctx, args) => {
		// BUG FIX: was `return console.log('open')` which returns undefined
		if (!args.owner) return null;

		return await ctx.db
			.query('projects')
			.filter((q) => q.eq(q.field('room'), args.room))
			.first();
	}
});

// -------------------------
// Update & Delete
// -------------------------

export const updateProject = mutation({
	args: {
		id: v.id('projects'),
		title: v.optional(v.string()),
		files: v.optional(v.array(FILE)),
		entry: v.optional(v.string()),
		room: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const { id, ...updates } = args;
		await ctx.db.patch(id, updates);
	}
});

export const deleteProject = mutation({
	args: { id: v.id('projects') },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	}
});
