import { untrack } from 'svelte';
import { createError } from '$lib/sveltekit/index.js';
import { createRepoRuntimeManager } from '$lib/services/runtime/createRepoRuntimeManager.svelte.js';
import { createRepoProjectManager } from '$lib/services/runtime/createRepoProjectManager.svelte.js';
import { VITE_REACT_TEMPLATE } from '$lib/utils/project/template.js';
import {
	areProjectsEqual,
	projectFolderName,
	uniqueProjects
} from '$lib/utils/project/projects.js';
import type { IDEProject } from '$types/projects.js';
import type { RepoLayoutData } from '$types/routes.js';

type ConvexLikeClient = {
	mutation: (mutationRef: unknown, args: Record<string, unknown>) => Promise<unknown>;
	query: (queryRef: unknown, args: Record<string, unknown>) => Promise<unknown>;
};

type Options = {
	getInitialProjects: () => RepoLayoutData['projects'];
	isDemo: () => boolean;
	isGuest: () => boolean;
	ownerId: () => string;
	convexClient: ConvexLikeClient;
};

const DEMO_FOLDER = 'demo';

export function createRepoController(options: Options) {
	const demoProject = {
		files: VITE_REACT_TEMPLATE.files,
		room: undefined
	} satisfies IDEProject;

	// UI State
	let projects = $state<RepoLayoutData['projects']>([]);
	let activeProjectId = $state<string | null>(null);
	let renamingProjectId = $state<string | null>(null);
	let pendingDeleteProjectId = $state<string | null>(null);

	// Runtime Manager
	const runtime = createRepoRuntimeManager({
		isDemo: options.isDemo,
		getProjects: () => projects,
		getEntryPath: () => getEntryPath()
	});

	// Project Manager
	const projects_ = createRepoProjectManager({
		getProjects: () => projects,
		setProjects: (p) => {
			projects = p;
		},
		getActiveProjectId: () => activeProjectId,
		setActiveProjectId: (id) => {
			activeProjectId = id;
		},
		convexClient: options.convexClient,
		getEntryPath: () => getEntryPath(),
		onError: (Error, error) => runtime.failRuntimeWithError(Error, error)
	});

	const folderMap = $derived(
		new Map<string, string>(
			options.isDemo()
				? []
				: projects.map((project) => [project._id, projectFolderName(project._id)])
		)
	);

	const activeProject = $derived(
		!options.isDemo()
			? (projects.find((project) => project._id === activeProjectId) ?? projects[0])
			: null
	);

	const statusText = $derived(
		runtime.runtimePhase === 'failed'
			? '⚠️ Runtime failed · recovery available'
			: runtime.ready
				? options.isGuest()
					? '👤 Guest session · changes are temporary'
					: `⚡ Ready · ${activeProject?.title ?? 'Project'}`
				: runtime.runtimePhase === 'installing'
					? '📦 Installing project dependencies…'
					: runtime.runtimePhase === 'mounting'
						? '🗂️ Mounting project files…'
						: '⏳ Starting sandbox runtime…'
	);

	function syncProjects(nextProjects: RepoLayoutData['projects']) {
		const unique = uniqueProjects(nextProjects);

		if (
			!areProjectsEqual(
				untrack(() => projects),
				unique
			)
		) {
			projects = unique;
		}

		const currentActiveProjectId = untrack(() => activeProjectId);
		if (
			!currentActiveProjectId ||
			!unique.some((project) => project._id === currentActiveProjectId)
		) {
			const nextActiveProjectId = unique[0]?._id ?? null;
			if (currentActiveProjectId !== nextActiveProjectId) {
				activeProjectId = nextActiveProjectId;
			}
		}
	}

	function getFallbackProject(): IDEProject {
		if (options.isDemo()) return demoProject;
		return activeProject ?? projects[0] ?? demoProject;
	}

	function getProjectForPath(path?: string): IDEProject {
		if (options.isDemo()) return demoProject;
		if (!path) return getFallbackProject();
		const folder = path.split('/')[0];
		const match = projects.find((project) => folderMap.get(project._id) === folder);
		return match ?? getFallbackProject();
	}

	function getEntryPath(): string {
		if (options.isDemo()) {
			return `${DEMO_FOLDER}/${VITE_REACT_TEMPLATE.entry}`;
		}

		const project = activeProject ?? projects[0];
		if (!project) return `${DEMO_FOLDER}/${VITE_REACT_TEMPLATE.entry}`;

		const folder = folderMap.get(project._id) ?? projectFolderName(project._id);
		const entryFile = project.entry ?? project.files[0]?.name ?? VITE_REACT_TEMPLATE.entry;
		return `${folder}/${entryFile}`;
	}

	function selectProject(projectId: string) {
		activeProjectId = projectId;
		pendingDeleteProjectId = null;
		renamingProjectId = null;
		if (typeof window !== 'undefined') {
			window.localStorage.setItem('sandem.activeProjectId', projectId);
		}
	}

	function startRename(projectId: string) {
		renamingProjectId = projectId;
		pendingDeleteProjectId = null;
	}

	function cancelRename() {
		renamingProjectId = null;
	}

	function requestDelete(projectId: string) {
		pendingDeleteProjectId = pendingDeleteProjectId === projectId ? null : projectId;
		renamingProjectId = null;
	}

	function mount() {
		if (!options.isDemo() && projects.length === 0) {
			projects = uniqueProjects(options.getInitialProjects().slice());
			activeProjectId = projects[0]?._id ?? null;
		}

		if (!options.isDemo()) {
			const fromStorage = window.localStorage.getItem('sandem.activeProjectId');
			if (fromStorage && projects.some((project) => project._id === fromStorage)) {
				activeProjectId = fromStorage;
			}
		}

		void runtime.startRuntime();

		const onUnhandledError = (event: ErrorEvent) => {
			const message = event.error instanceof Error ? event.error.message : event.message;
			if (!message) return;
			if (!/webcontainer|sandbox|terminal|mount/i.test(message)) return;
			runtime.failRuntimeWithError(
				createError('A runtime error occurred.'),
				event.error ?? message
			);
		};

		const onUnhandledRejection = (event: PromiseRejectionEvent) => {
			const message = event.reason instanceof Error ? event.reason.message : String(event.reason);
			if (!/webcontainer|sandbox|terminal|mount/i.test(message)) return;
			runtime.failRuntimeWithError(
				createError('A runtime promise rejection occurred.'),
				event.reason
			);
		};

		window.addEventListener('error', onUnhandledError);
		window.addEventListener('unhandledrejection', onUnhandledRejection);

		return () => {
			window.removeEventListener('error', onUnhandledError);
			window.removeEventListener('unhandledrejection', onUnhandledRejection);
			void runtime.stopRuntime();
		};
	}

	return {
		// UI State
		get projects() {
			return projects;
		},
		get activeProjectId() {
			return activeProjectId;
		},
		get renamingProjectId() {
			return renamingProjectId;
		},
		get pendingDeleteProjectId() {
			return pendingDeleteProjectId;
		},
		get creatingProject() {
			return projects_.creatingProject;
		},
		get mutatingProjectId() {
			return projects_.mutatingProjectId;
		},
		// Runtime State
		get runtimePhase() {
			return runtime.runtimePhase;
		},
		get runtimeError() {
			return runtime.runtimeError;
		},
		get ready() {
			return runtime.ready;
		},
		get statusText() {
			return statusText;
		},
		get activeProject() {
			return activeProject;
		},
		// Methods
		syncProjects,
		getProjectForPath,
		getEntryPath,
		selectProject,
		startRename,
		cancelRename,
		requestDelete,
		createProjectCard: projects_.createProjectCard,
		commitRename: projects_.commitRename,
		confirmDelete: projects_.confirmDelete,
		// Runtime access
		getWebcontainer: () => runtime.webcontainer,
		getWorkspaceProjects: () =>
			projects.map((project) => ({ id: project._id, title: project.title })),
		startRuntime: () => runtime.startRuntime(),
		failRuntimeWithError: (Error: ReturnType<typeof createError>, error?: unknown) =>
			runtime.failRuntimeWithError(Error, error),
		mount
	};
}
