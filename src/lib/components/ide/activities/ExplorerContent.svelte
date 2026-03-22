<script lang="ts">
	import { Accordion } from 'bits-ui';

	import type { FileNode } from '$types/editor';
	import type { IDEProject } from '$types/projects';
	import { projectFolderName } from '$lib/utils/project/projects.js';

	import ExplorerOpenEditors from './ExplorerOpenEditors.svelte';
	import ExplorerFilesSection from './ExplorerFilesSection.svelte';
	import ExplorerProjectInfo from './ExplorerProjectInfo.svelte';
	import ExplorerOutline from './ExplorerOutline.svelte';
	import ExplorerTimeline from './ExplorerTimeline.svelte';

	interface Props {
		openSections: string[];
		tree: FileNode[];
		filteredTree: FileNode[];
		expandOnSearch: Set<string>;
		treeLoading: boolean;
		treeError: string | null;
		activeProject: IDEProject | null;
		actionMessage: string;
		actionError: string;
		selectedPath: string | null;
		activeFilePath: string | null;
		timelineEvents: Array<{
			id: string;
			at: number;
			kind: 'action' | 'error' | 'file-open' | 'folder-toggle';
			label: string;
			path?: string;
		}>;
		searchQuery: string;
		hasSearch: boolean;
		isExpanded: (path: string) => boolean;
		onDirClick: (node: FileNode) => void;
		onFileClick: (node: FileNode) => void;
		onNodeContextMenu: (node: FileNode, event: MouseEvent) => void;
		contextMenu: {
			open: boolean;
			x: number;
			y: number;
			path: string | null;
		};
		onContextMenuAction: (
			action: 'new-file' | 'new-folder' | 'rename' | 'delete' | 'refresh'
		) => void;
		onCloseContextMenu: () => void;
		onTimelineOpenPath: (path: string) => void;
		onSearchChange: (query: string) => void;
		onSearchClear: () => void;
	}

	let {
		openSections = $bindable(),
		tree,
		filteredTree,
		expandOnSearch,
		treeLoading,
		treeError,
		activeProject,
		actionMessage,
		actionError,
		selectedPath,
		activeFilePath,
		timelineEvents,
		searchQuery,
		hasSearch,
		isExpanded,
		onDirClick,
		onFileClick,
		onNodeContextMenu,
		contextMenu,
		onContextMenuAction,
		onCloseContextMenu,
		onTimelineOpenPath,
		onSearchChange,
		onSearchClear
	}: Props = $props();

	// Compute folder name for project info (supports both workspace summaries with `id`
	// and full project objects with `_id`).
	const folderName = $derived.by(() => {
		if (!activeProject) return null;
		const projectId =
			(activeProject as { _id?: string; id?: string })._id ??
			(activeProject as { _id?: string; id?: string }).id;
		if (!projectId) return null;
		return projectFolderName(projectId);
	});
</script>

<Accordion.Root type="multiple" bind:value={openSections} class="explorer-content">
	<!-- Status Messages -->
	{#if actionError}
		<div class="status-msg error">{actionError}</div>
	{:else if actionMessage}
		<div class="status-msg success">{actionMessage}</div>
	{/if}

	<!-- Open Editors Child Component -->
	<ExplorerOpenEditors />

	<!-- Files & Folders Child Component -->
	<ExplorerFilesSection
		{tree}
		{filteredTree}
		{treeLoading}
		{treeError}
		{searchQuery}
		{hasSearch}
		{expandOnSearch}
		{selectedPath}
		{isExpanded}
		{onDirClick}
		{onFileClick}
		{onNodeContextMenu}
		{contextMenu}
		{onContextMenuAction}
		{onCloseContextMenu}
		{onSearchChange}
		{onSearchClear}
	/>

	<!-- Project Info Child Component -->
	{#if activeProject}
		<ExplorerProjectInfo {activeProject} projectFolderName={folderName} />
	{/if}

	<!-- Outline Child Component -->
	<ExplorerOutline {activeFilePath} />

	<!-- Timeline Child Component -->
	<ExplorerTimeline events={timelineEvents} onOpenPath={onTimelineOpenPath} />
</Accordion.Root>

<style>
	/* ── Accordion sections (VS Code-like) ────────────────────── */
	:global(.explorer-content) {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		overflow: hidden;
		background: color-mix(in srgb, var(--mg) 92%, var(--bg));
	}

	:global(.explorer-content .explorer-section) {
		display: flex;
		flex: 0 0 auto;
		flex-direction: column;
		border-bottom: 1px solid color-mix(in srgb, var(--border) 52%, transparent);
	}

	:global(.explorer-content .explorer-section[data-state='open']) {
		flex: 1 1 0;
		min-height: 104px;
	}

	:global(.explorer-content .explorer-section:last-child) {
		border-bottom: 0;
	}

	:global(.explorer-content .section-trigger) {
		display: flex;
		align-items: center;
		gap: 3px;
		width: 100%;
		height: 28px;
		padding: 0 10px;
		border: 0;
		background: color-mix(in srgb, var(--mg) 90%, var(--bg));
		color: var(--muted);
		cursor: pointer;
		text-align: left;
	}

	:global(.explorer-content .section-trigger:hover) {
		background: color-mix(in srgb, var(--fg) 68%, transparent);
	}

	:global(.explorer-content .section-title) {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--muted);
		text-transform: uppercase;
		line-height: 1;
	}

	:global(.explorer-content .section-chevron) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 12px;
		height: 12px;
		color: var(--muted);
		transition: transform var(--time) var(--ease);
	}

	:global(.explorer-content .explorer-section[data-state='open'] .section-chevron) {
		transform: rotate(90deg);
	}

	:global(.explorer-content .explorer-section [data-accordion-content]) {
		flex: 1;
		min-height: 0;
		overflow: hidden;
	}

	:global(.explorer-content .explorer-section[data-state='open'] [data-accordion-content]) {
		overflow: auto;
	}

	/* ── Status messages ────────────────────────────────────– */
	.status-msg {
		padding: 6px 12px;
		font-size: 11px;
		color: var(--muted);
		font-style: italic;
	}

	.status-msg.error {
		color: var(--error);
	}

	.status-msg.success {
		color: var(--success);
	}
</style>
