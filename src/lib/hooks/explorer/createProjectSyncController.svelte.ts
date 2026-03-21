/**
 * Syncs Convex projects table with the file tree explorer.
 * Projects in Convex → Root folders in WebContainer
 *
 * Single source of truth: Convex projects table
 * - Create/delete folders at root → Convex mutations
 * - File tree renders projects as folders
 */

import { ConvexClient } from 'convex/browser';
import { api } from '$convex/_generated/api.js';

export interface ProjectFolder {
	_id: string;
	title: string;
	owner: string;
}

export type CreateProjectSyncControllerOptions = {
	convexClient: ConvexClient;
	owner: string;
};

export function createProjectSyncController(options: CreateProjectSyncControllerOptions) {
	const { convexClient, owner } = options;

	let projects = $state<ProjectFolder[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	/**
	 * Get workspace root folders (project IDs to filter WebContainer root)
	 */
	function getWorkspaceRootFolders(): string[] {
		return projects.map((p) => p._id);
	}

	/**
	 * Fetch projects from Convex
	 */
	async function syncProjects() {
		if (!owner) {
			projects = [];
			return;
		}

		loading = true;
		error = null;

		try {
			const result = await convexClient.query(api.projects.getProjects, { owner });
			projects = result;
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			loading = false;
		}
	}

	/**
	 * Create a new project (creates folder at root)
	 */
	async function createProjectFolder(title: string): Promise<string | null> {
		try {
			const id = await convexClient.mutation(api.projects.createProject, {
				title,
				owner,
				files: [],
				room: undefined,
				entry: undefined
			});

			// Refresh projects list
			await syncProjects();
			return id;
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			return null;
		}
	}

	/**
	 * Delete a project (delete folder at root)
	 * TODO: Add delete mutation to projects.ts
	 */
	async function deleteProjectFolder(): Promise<boolean> {
		try {
			// TODO: Implement deleteProject mutation
			await syncProjects();
			return true;
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			return false;
		}
	}

	return {
		get projects() {
			return projects;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		getWorkspaceRootFolders,
		syncProjects,
		createProjectFolder,
		deleteProjectFolder
	};
}
