<script lang="ts">
	import {
		ChevronRight,
		RefreshCw,
		FilePlus,
		FolderPlus,
		FilePenLine,
		Trash2,
		ChevronsUpDown,
		Ellipsis
	} from '@lucide/svelte';
	import { onMount } from 'svelte';

	import { requireIDEContext } from '$lib/context';
	import { editorStore } from '$lib/stores';
	import { activity } from '$lib/stores';
	import { projectFolderName } from '$lib/utils/project/projects.js';
	import { findNodeByPath } from '$lib/utils/editor/fileTreeOps.js';
	import { filterNodesByQuery, getPathsToExpand } from '$lib/utils/editor/explorerTreeOps.js';
	import type { FileNode } from '$types/editor';
	import type { IDEProject } from '$types/projects';

	import { createFileTree } from '$lib/controllers';
	import { createProjectFilesSync } from '$lib/services';
	import { createExplorerStateController } from '$lib/controllers/explorer/createExplorerStateController.svelte.js';
	import {
		handleCreateFile,
		handleCreateFolder,
		handleRenameNode,
		handleDeleteNode,
		handleRefreshTree,
		handleExpandAll,
		handleCollapseAll,
		handleRefreshAndExpandAll,
		type ExplorerActionContext
	} from '$lib/controllers/explorer/createExplorerActionHandlers.svelte.js';

	import ExplorerContent from './ExplorerContent.svelte';
	import ActivityPanel from './ActivityPanel.svelte';

	// ─────────────────────────────────────────────────────────
	// Injection: IDE context, stores, and dependencies
	// ─────────────────────────────────────────────────────────

	const ide = requireIDEContext();
	const explorerState = createExplorerStateController();

	const fileTree = createFileTree(ide.getWebcontainer, {
		getWorkspaceRootFolders: () =>
			(ide.getWorkspaceProjects?.() ?? []).map((p) => projectFolderName(p.id, p.title))
	});

	const projectSync = createProjectFilesSync({
		getProject: () => ide.getProject(editorStore.activeTabPath ?? undefined),
		getProjectForPath: (path: string) => ide.getProject(path),
		getWebcontainer: ide.getWebcontainer,
		onRemoteOperationApplied: async () => {
			await fileTree.refresh({ silent: true });
		}
	});

	// ─────────────────────────────────────────────────────────
	// Derived state: filtered and decorated tree
	// ─────────────────────────────────────────────────────────

	const tree = $derived(fileTree.tree);
	const treeLoading = $derived(fileTree.loading);
	const treeError = $derived(fileTree.error);

	// Filter tree by search query
	const filteredTree = $derived(filterNodesByQuery(tree, explorerState.searchQuery));

	// Get paths to expand when searching
	const expandOnSearch = $derived(getPathsToExpand(filteredTree, explorerState.searchQuery));

	const workspaceProjects = $derived(ide.getWorkspaceProjects?.() ?? []);
	const activeProject = $derived(
		workspaceProjects.find((p) => p.id === ide.getActiveProjectId?.())
	);
	const activeFilePath = $derived(editorStore.activeTabPath);

	type TimelineEvent = {
		id: string;
		at: number;
		kind: 'action' | 'error' | 'file-open' | 'folder-toggle';
		label: string;
		path?: string;
	};

	type ExplorerDialogIntent = 'create-file' | 'create-folder' | 'rename' | 'delete';

	type ExplorerDialogState = {
		open: boolean;
		intent: ExplorerDialogIntent | null;
		value: string;
		targetPath: string | null;
	};

	let timelineEvents = $state<TimelineEvent[]>([]);
	let contextMenu = $state({ open: false, x: 0, y: 0, path: null as string | null });
	let dialogState = $state<ExplorerDialogState>({
		open: false,
		intent: null,
		value: '',
		targetPath: null
	});

	function closeContextMenu() {
		contextMenu = { ...contextMenu, open: false };
	}

	function handleContextMenuAction(
		action: 'new-file' | 'new-folder' | 'rename' | 'delete' | 'refresh'
	) {
		closeContextMenu();
		if (action === 'new-file') return void openCreateDialog('file');
		if (action === 'new-folder') return void openCreateDialog('folder');
		if (action === 'rename') return void openRenameDialog();
		if (action === 'delete') return void openDeleteDialog();
		return void handleRefreshTree(getActionContext());
	}

	function addTimelineEvent(kind: TimelineEvent['kind'], label: string, path?: string) {
		timelineEvents = [
			{
				id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
				at: Date.now(),
				kind,
				label,
				path
			},
			...timelineEvents
		].slice(0, 40);
	}

	// ─────────────────────────────────────────────────────────
	// Action handlers (pure, can be imported/tested)
	// ─────────────────────────────────────────────────────────

	let actionMessage = $state('');
	let actionError = $state('');

	function clearActionState() {
		actionMessage = '';
		actionError = '';
	}

	function setActionMessage(msg: string) {
		clearActionState();
		actionMessage = msg;
		addTimelineEvent('action', msg);
		setTimeout(() => {
			if (actionMessage === msg) {
				actionMessage = '';
			}
		}, 3000);
	}

	function setActionError(msg: string) {
		clearActionState();
		actionError = msg;
		addTimelineEvent('error', msg);
		setTimeout(() => {
			if (actionError === msg) {
				actionError = '';
			}
		}, 5000);
	}

	function getSelectedDirectory(): string | null {
		const selectedPath = explorerState.selectedPath;
		if (!selectedPath) return null;

		const selectedNode = findNodeByPath(tree, selectedPath);
		if (!selectedNode) return null;

		if (selectedNode.type === 'directory') {
			return selectedNode.path;
		}

		const segments = selectedNode.path.split('/');
		segments.pop();
		const parentPath = segments.join('/');
		return parentPath || null;
	}

	function getSuggestedCreatePath(kind: 'file' | 'folder'): string {
		const selectedDirectory = getSelectedDirectory();

		if (kind === 'file') {
			return selectedDirectory ? `${selectedDirectory}/new-file.ts` : 'src/new-file.ts';
		}

		return selectedDirectory ? `${selectedDirectory}/new-folder` : 'src/new-folder';
	}

	function openCreateDialog(kind: 'file' | 'folder') {
		dialogState = {
			open: true,
			intent: kind === 'file' ? 'create-file' : 'create-folder',
			value: getSuggestedCreatePath(kind),
			targetPath: explorerState.selectedPath
		};
	}

	function openRenameDialog() {
		if (!explorerState.selectedPath) {
			setActionError('Please select a file or folder first.');
			return;
		}

		dialogState = {
			open: true,
			intent: 'rename',
			value: explorerState.selectedPath,
			targetPath: explorerState.selectedPath
		};
	}

	function openDeleteDialog() {
		if (!explorerState.selectedPath) {
			setActionError('Please select a file or folder first.');
			return;
		}

		dialogState = {
			open: true,
			intent: 'delete',
			value: '',
			targetPath: explorerState.selectedPath
		};
	}

	function closeDialog() {
		dialogState = {
			open: false,
			intent: null,
			value: '',
			targetPath: null
		};
	}

	function setDialogValue(value: string) {
		dialogState = {
			...dialogState,
			value
		};
	}

	async function confirmDialog() {
		if (!dialogState.open || !dialogState.intent) return;

		const baseCtx = getActionContext();
		const ctx: ExplorerActionContext = {
			...baseCtx,
			selectedPath: dialogState.targetPath ?? baseCtx.selectedPath
		};
		let success = false;

		if (dialogState.intent === 'create-file') {
			success = await handleCreateFile(ctx, dialogState.value);
		} else if (dialogState.intent === 'create-folder') {
			success = await handleCreateFolder(ctx, dialogState.value);
		} else if (dialogState.intent === 'rename') {
			success = await handleRenameNode(ctx, dialogState.value);
		} else if (dialogState.intent === 'delete') {
			success = await handleDeleteNode(ctx);
		}

		if (success) {
			closeDialog();
		}
	}

	// Create the action context for pure handlers
	function getActionContext(): ExplorerActionContext {
		return {
			fileTree,
			projectSync,
			editorOpenFile: editorStore.openFile,
			getWebcontainer: ide.getWebcontainer,
			getActiveProject: () => activeProject as IDEProject | undefined,
			tree,
			selectedPath: explorerState.selectedPath,
			onMessage: setActionMessage,
			onError: setActionError
		};
	}

	function handleFileClick(node: FileNode) {
		const clickType = explorerState.handleClick(node.path);
		explorerState.selectNode(node.path);
		addTimelineEvent('file-open', `Opened ${node.name}`, node.path);

		if (clickType === 'double' || node.type === 'file') {
			editorStore.openFile(node.path);
		}
	}

	function handleDirClick(node: FileNode) {
		explorerState.selectNode(node.path);

		if (node.depth === 0) {
			const rootFolder = node.path.split('/')[0] ?? '';
			const project = workspaceProjects.find(
				(p) => projectFolderName(p.id, p.title) === rootFolder
			);
			if (project) {
				ide.selectProject?.(project.id);
			}
		}

		fileTree.toggleDir(node.path);
		addTimelineEvent(
			'folder-toggle',
			`${fileTree.isExpanded(node.path) ? 'Expanded' : 'Collapsed'} ${node.name}`,
			node.path
		);
	}

	function handleNodeContextMenu(node: FileNode, event: MouseEvent) {
		event.preventDefault();
		explorerState.selectNode(node.path);
		contextMenu = {
			open: true,
			x: event.clientX,
			y: event.clientY,
			path: node.path
		};
	}

	// ─────────────────────────────────────────────────────────
	// Lifecycle
	// ─────────────────────────────────────────────────────────
	onMount(() => {
		const onWindowKeydown = (event: KeyboardEvent) => {
			if (activity.tab !== 'explorer') return;

			const target = event.target as HTMLElement | null;
			if (
				target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement ||
				target instanceof HTMLSelectElement ||
				target?.isContentEditable
			) {
				return;
			}

			const cmdOrCtrl = event.metaKey || event.ctrlKey;

			if (cmdOrCtrl && !event.shiftKey && event.key.toLowerCase() === 'n') {
				event.preventDefault();
				openCreateDialog('file');
				return;
			}

			if (cmdOrCtrl && event.shiftKey && event.key.toLowerCase() === 'n') {
				event.preventDefault();
				openCreateDialog('folder');
				return;
			}

			if (event.key === 'F2') {
				event.preventDefault();
				openRenameDialog();
				return;
			}

			if (event.key === 'Delete') {
				event.preventDefault();
				openDeleteDialog();
				return;
			}

			if (event.key === 'Escape') {
				if (dialogState.open) {
					closeDialog();
					return;
				}
				closeContextMenu();
			}
		};

		const onWindowPointerDown = () => {
			if (contextMenu.open) {
				closeContextMenu();
			}
		};

		window.addEventListener('keydown', onWindowKeydown);
		window.addEventListener('pointerdown', onWindowPointerDown);

		projectSync.start();
		fileTree.startAutoRefresh(850);

		// Start async refresh
		fileTree.refresh({ silent: true }).then(() => {
			// Bootstrap tree sync with retry
			const attempts = 80;
			let previousLength = 0;
			let stabilizedCount = 0;

			const runBootstrap = async () => {
				for (let i = 0; i < attempts; i++) {
					await fileTree.refresh({ silent: true });
					const current = fileTree.tree.length;

					if (current === 0) {
						stabilizedCount = 0;
					} else if (current === previousLength) {
						stabilizedCount++;
						if (stabilizedCount >= 3) break;
					} else {
						stabilizedCount = 0;
					}

					previousLength = current;
					await new Promise((r) => setTimeout(r, 300));
				}
			};

			runBootstrap().catch(() => {
				// Bootstrap failed, continue anyway
			});
		});

		return () => {
			window.removeEventListener('keydown', onWindowKeydown);
			window.removeEventListener('pointerdown', onWindowPointerDown);
			fileTree.stopAutoRefresh();
			projectSync.stop();
			explorerState.reset();
		};
	});

	// Auto-open entry file
	$effect(() => {
		if (tree.length === 0 || treeLoading) return;
		if (editorStore.tabs.length > 0) return;

		const entryPath = ide.getEntryPath();
		if (entryPath) {
			const node = findNodeByPath(tree, entryPath);
			if (node?.type === 'file') {
				editorStore.openFile(entryPath);
			}
		}
	});

	// Monitor search query and expand relevant paths
	$effect(() => {
		if (!explorerState.hasSearch) return;

		for (const path of expandOnSearch) {
			if (!fileTree.isExpanded(path)) {
				fileTree.toggleDir(path);
			}
		}
	});

	let openSections = $state<string[]>(['files']);

	// ─────────────────────────────────────────────────────────
	// Action buttons configuration
	// ─────────────────────────────────────────────────────────

	import type { Component } from 'svelte';

	interface ActionButton {
		id: string;
		title?: string;
		icon?: Component;
		handler?: () => void | Promise<void>;
		disabled?: boolean | (() => boolean);
		isSpacer?: boolean;
	}

	const actionButtons: ActionButton[] = [
		{
			id: 'new-file',
			title: 'New File',
			icon: FilePlus,
			handler: () => openCreateDialog('file'),
			disabled: false
		},
		{
			id: 'new-folder',
			title: 'New Folder',
			icon: FolderPlus,
			handler: () => openCreateDialog('folder'),
			disabled: false
		},
		{
			id: 'rename',
			title: 'Rename path',
			icon: FilePenLine,
			handler: () => openRenameDialog(),
			disabled: () => !explorerState.selectedPath
		},
		{
			id: 'delete',
			title: 'Delete path',
			icon: Trash2,
			handler: () => openDeleteDialog(),
			disabled: () => !explorerState.selectedPath
		},
		{
			id: 'spacer',
			isSpacer: true
		},
		{
			id: 'expand-all',
			title: 'Expand All',
			icon: ChevronRight,
			handler: () => handleExpandAll(getActionContext()),
			disabled: false
		},
		{
			id: 'collapse-all',
			title: 'Collapse All',
			icon: ChevronsUpDown,
			handler: () => handleCollapseAll(getActionContext()),
			disabled: false
		},
		{
			id: 'refresh',
			title: 'Refresh',
			icon: RefreshCw,
			handler: () => handleRefreshTree(getActionContext()),
			disabled: false
		},
		{
			id: 'more-actions',
			title: 'More Actions',
			icon: Ellipsis,
			handler: () => handleRefreshAndExpandAll(getActionContext()),
			disabled: false
		}
	];
</script>

<ActivityPanel title="EXPLORER" {actionButtons}>
	<ExplorerContent
		bind:openSections
		{tree}
		{filteredTree}
		{treeLoading}
		{treeError}
		activeProject={(activeProject as IDEProject | undefined) ?? null}
		{actionMessage}
		{actionError}
		selectedPath={explorerState.selectedPath}
		searchQuery={explorerState.searchQuery}
		hasSearch={explorerState.hasSearch}
		{expandOnSearch}
		{activeFilePath}
		{timelineEvents}
		isExpanded={(path: string) => fileTree.isExpanded(path)}
		onDirClick={handleDirClick}
		onFileClick={handleFileClick}
		onNodeContextMenu={handleNodeContextMenu}
		{contextMenu}
		onContextMenuAction={handleContextMenuAction}
		onCloseContextMenu={closeContextMenu}
		{dialogState}
		onDialogValueChange={setDialogValue}
		onDialogCancel={closeDialog}
		onDialogConfirm={confirmDialog}
		onTimelineOpenPath={(path: string) => editorStore.openFile(path)}
		onSearchChange={(query: string) => explorerState.setSearchQuery(query)}
		onSearchClear={() => explorerState.clearSearch()}
	/>
</ActivityPanel>
