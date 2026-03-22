// convex/projects.ts
import { mutation, query } from './_generated/server.js';
import { v } from 'convex/values';
import {
	STARTER_PROJECT_ENTRY,
	STARTER_PROJECT_FILES,
	STARTER_PROJECT_TITLE
} from '../lib/utils/project/template.js';

const FILE = v.object({
	name: v.string(),
	contents: v.string()
});

function toRoomSlug(input: string) {
	return (
		input
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '')
			.slice(0, 36) || 'project'
	);
}

function generateLiveblocksRoomId(owner: string, title: string) {
	const stamp = Date.now().toString(36);
	const entropy = Math.random().toString(36).slice(2, 8);
	return `room-${toRoomSlug(owner)}-${toRoomSlug(title)}-${stamp}-${entropy}`;
}

// -------------------------
// Create & Get
// -------------------------

export const createProject = mutation({
	args: {
		title: v.string(),
		files: v.array(FILE),
		owner: v.string(),
		room: v.optional(v.string()),
		entry: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		const room = args.room?.trim() || generateLiveblocksRoomId(args.owner, args.title);
		// db.insert returns the new document's _id
		const id = await ctx.db.insert('projects', { ...args, room });
		return id;
	}
});

export const ensureLiveblocksRoomsForOwner = mutation({
	args: { owner: v.string() },
	handler: async (ctx, args) => {
		if (!args.owner) return 0;

		const projects = await ctx.db
			.query('projects')
			.withIndex('by_owner', (q) => q.eq('owner', args.owner))
			.collect();

		let patched = 0;
		for (const project of projects) {
			if (project.room?.trim()) continue;
			await ctx.db.patch(project._id, {
				room: generateLiveblocksRoomId(project.owner, project.title)
			});
			patched += 1;
		}

		return patched;
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

export const ensureStarterProjectForOwner = mutation({
	args: { owner: v.string() },
	handler: async (ctx, args) => {
		if (!args.owner) return null;

		const now = Date.now();

		const seedState = await ctx.db
			.query('projectSeedState')
			.withIndex('by_owner', (q) => q.eq('owner', args.owner))
			.first();

		const ownedProjects = await ctx.db
			.query('projects')
			.withIndex('by_owner', (q) => q.eq('owner', args.owner))
			.collect();

		if (seedState?.starterProjectSeeded) {
			return null;
		}

		const hasStarterProject = ownedProjects.some(
			(project) => project.title === STARTER_PROJECT_TITLE
		);

		let demoId: string | null = null;

		// Seed starter only for empty owners (new-user behavior).
		if (!hasStarterProject && ownedProjects.length === 0) {
			demoId = await ctx.db.insert('projects', {
				title: STARTER_PROJECT_TITLE,
				files: STARTER_PROJECT_FILES.map((file: { name: string; contents: string }) => ({
					...file
				})),
				owner: args.owner,
				room: generateLiveblocksRoomId(args.owner, STARTER_PROJECT_TITLE),
				entry: STARTER_PROJECT_ENTRY
			});
		}

		if (seedState) {
			await ctx.db.patch(seedState._id, {
				starterProjectSeeded: true,
				seededAt: now
			});
		} else {
			await ctx.db.insert('projectSeedState', {
				owner: args.owner,
				starterProjectSeeded: true,
				seededAt: now
			});
		}

		return demoId;
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

export const updateProjectFiles = mutation({
	args: {
		id: v.id('projects'),
		files: v.array(FILE)
	},
	handler: async (ctx, args) => {
		const project = await ctx.db.get(args.id);
		if (!project) {
			throw new Error('Project not found');
		}

		if (args.files.length === 0) {
			return { updated: 0, total: project.files.length };
		}

		const contentsByName = new Map(project.files.map((file) => [file.name, file.contents]));
		for (const patch of args.files) {
			contentsByName.set(patch.name, patch.contents);
		}

		const existingNames = new Set(project.files.map((file) => file.name));
		const mergedFiles = project.files.map((file) => ({
			name: file.name,
			contents: contentsByName.get(file.name) ?? file.contents
		}));

		for (const patch of args.files) {
			if (existingNames.has(patch.name)) continue;
			mergedFiles.push({ name: patch.name, contents: patch.contents });
		}

		await ctx.db.patch(args.id, { files: mergedFiles });

		return {
			updated: args.files.length,
			total: mergedFiles.length
		};
	}
});

export const deleteProject = mutation({
	args: { id: v.id('projects') },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	}
});
