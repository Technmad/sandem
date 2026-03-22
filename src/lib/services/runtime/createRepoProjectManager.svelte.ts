import { api } from '$convex/_generated/api.js';
import { createError } from '$lib/sveltekit/index.js';
import { editorStore } from '$lib/stores';
import { VITE_REACT_TEMPLATE } from '$lib/utils/project/template.js';
import { uniqueProjects } from '$lib/utils/project/projects.js';
import type { ProjectId } from '$types/projects.js';
import type { RepoLayoutData } from '$types/routes.js';

type ConvexLikeClient = {
	mutation: (mutationRef: unknown, args: Record<string, unknown>) => Promise<unknown>;
	query: (queryRef: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

type CreateRepoProjectManagerOptions = {
	getProjects: () => RepoLayoutData['projects'];
	setProjects: (projects: RepoLayoutData['projects']) => void;
	getActiveProjectId: () => string | null;
	setActiveProjectId: (id: string | null) => void;
	convexClient: ConvexLikeClient;
	getEntryPath: () => string;
	onError?: (appError: ReturnType<typeof createError>, error?: unknown) => void;
};

export function createRepoProjectManager(options: CreateRepoProjectManagerOptions) {
	let creatingProject = $state(false);
	let mutatingProjectId = $state<string | null>(null);

	async function createProjectCard() {
		if (creatingProject) return;
		creatingProject = true;

		try {
			const title = `Untitled Project ${options.getProjects().length + 1}`;
			const id = await options.convexClient.mutation(api.projects.createProject, {
				title,
				files: VITE_REACT_TEMPLATE.files,
				owner: '', // Set by caller if needed
				entry: VITE_REACT_TEMPLATE.entry
			});

			const project = (await options.convexClient.query(api.projects.getProject, {
				id: id as ProjectId
			})) as RepoLayoutData['projects'][number] | null;

			if (!project) throw new Error('Project creation succeeded but project could not be loaded.');

			const projects = uniqueProjects([...options.getProjects(), project]);
			options.setProjects(projects);
			options.setActiveProjectId(project._id);
			window.localStorage.setItem('sandem.activeProjectId', project._id);

			editorStore.openFile(options.getEntryPath());
		} catch (error) {
			options.onError?.(createError('Project creation failed.'), error);
		} finally {
			creatingProject = false;
		}
	}

	async function commitRename(projectId: string, title: string) {
		const nextTitle = title.trim();
		if (!nextTitle) return;

		mutatingProjectId = projectId;
		try {
			await options.convexClient.mutation(api.projects.updateProject, {
				id: projectId as ProjectId,
				title: nextTitle
			});

			const projects = options
				.getProjects()
				.map((project) => (project._id === projectId ? { ...project, title: nextTitle } : project));
			options.setProjects(projects);
		} catch (error) {
			options.onError?.(createError('Project rename failed.'), error);
		} finally {
			mutatingProjectId = null;
		}
	}

	async function confirmDelete(projectId: string) {
		mutatingProjectId = projectId;
		try {
			await options.convexClient.mutation(api.projects.deleteProject, {
				id: projectId as ProjectId
			});

			const nextProjects = options.getProjects().filter((project) => project._id !== projectId);
			options.setProjects(nextProjects);

			if (options.getActiveProjectId() === projectId) {
				const nextId = nextProjects[0]?._id ?? null;
				options.setActiveProjectId(nextId);
				if (nextId) {
					window.localStorage.setItem('sandem.activeProjectId', nextId);
					editorStore.openFile(options.getEntryPath());
				}
			}
		} catch (error) {
			options.onError?.(createError('Project deletion failed.'), error);
		} finally {
			mutatingProjectId = null;
		}
	}

	return {
		get creatingProject() {
			return creatingProject;
		},
		get mutatingProjectId() {
			return mutatingProjectId;
		},
		createProjectCard,
		commitRename,
		confirmDelete
	};
}
