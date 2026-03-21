import type { FileNode } from '$types/editor.js';

type WorkspaceProject = { id: string; title: string };

type CreateExplorerPanelControllerOptions = {
	getWorkspaceProjects: () => WorkspaceProject[];
	projectFolderName: (projectId: string) => string;
	selectProject?: (projectId: string) => void;
	createProject?: () => Promise<void>;
	renameProject?: (projectId: string, title: string) => Promise<void>;
	deleteProject?: (projectId: string) => Promise<void>;
	handleFileClick: (node: FileNode) => void;
	handleDirClick: (node: FileNode) => void;
	createFolder: () => Promise<void>;
	renamePath: () => Promise<void>;
	deletePath: () => Promise<void>;
	prompt: (message: string, defaultValue?: string) => string | null;
	confirm: (message: string) => boolean;
};

export function createExplorerPanelController(options: CreateExplorerPanelControllerOptions) {
	let selectedTreePath = $state<string | null>(null);
	let selectedTreeType = $state<'file' | 'directory' | null>(null);
	let selectedTreeDepth = $state<number | null>(null);

	const projectsById = $derived(
		new Map(options.getWorkspaceProjects().map((project) => [project.id, project]))
	);
	const projectIdByFolder = $derived(
		new Map(
			options
				.getWorkspaceProjects()
				.map((project) => [options.projectFolderName(project.id), project.id])
		)
	);

	function getSelectedProject() {
		if (!selectedTreePath || selectedTreeType !== 'directory' || selectedTreeDepth !== 0) {
			return null;
		}

		const rootFolder = selectedTreePath.split('/')[0] ?? '';
		const projectId = projectIdByFolder.get(rootFolder);
		if (!projectId) return null;

		return projectsById.get(projectId) ?? null;
	}

	function handleFileRowClick(node: FileNode) {
		selectedTreePath = node.path;
		selectedTreeType = 'file';
		selectedTreeDepth = node.depth;
		options.handleFileClick(node);
	}

	function handleDirRowClick(node: FileNode) {
		selectedTreePath = node.path;
		selectedTreeType = 'directory';
		selectedTreeDepth = node.depth;

		if (node.depth === 0) {
			const rootFolder = node.path.split('/')[0] ?? '';
			const projectId = projectIdByFolder.get(rootFolder);
			if (projectId) {
				options.selectProject?.(projectId);
			}
		}

		options.handleDirClick(node);
	}

	async function createFolderAction() {
		if (options.createProject && (!selectedTreePath || selectedTreeDepth === 0)) {
			await options.createProject();
			return;
		}

		await options.createFolder();
	}

	async function renameAction() {
		const selectedProject = getSelectedProject();
		if (selectedProject && options.renameProject) {
			const nextTitle = options.prompt('Rename project', selectedProject.title);
			if (!nextTitle) return;
			await options.renameProject(selectedProject.id, nextTitle);
			return;
		}

		await options.renamePath();
	}

	async function deleteAction() {
		const selectedProject = getSelectedProject();
		if (selectedProject && options.deleteProject) {
			const confirmed = options.confirm(
				`Delete project "${selectedProject.title}"? This cannot be undone.`
			);
			if (!confirmed) return;
			await options.deleteProject(selectedProject.id);
			return;
		}

		await options.deletePath();
	}

	return {
		get selectedTreePath() {
			return selectedTreePath;
		},
		handleFileRowClick,
		handleDirRowClick,
		createFolderAction,
		renameAction,
		deleteAction
	};
}
