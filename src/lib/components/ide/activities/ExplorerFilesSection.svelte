<script lang="ts">
	import { ChevronRight, Search, X } from '@lucide/svelte';
	import { Accordion } from 'bits-ui';

	import type { FileNode } from '$types/editor';
	import { editorStore } from '$lib/stores';
	import FileTreeView from '$lib/components/ui/editor/FileTreeView.svelte';

	interface Props {
		tree: FileNode[];
		filteredTree: FileNode[];
		treeLoading: boolean;
		treeError: string | null;
		searchQuery: string;
		hasSearch: boolean;
		expandOnSearch: Set<string>;
		selectedPath: string | null;
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
		onSearchChange: (query: string) => void;
		onSearchClear: () => void;
	}

	let {
		tree,
		filteredTree,
		treeLoading,
		treeError,
		searchQuery,
		hasSearch,
		expandOnSearch,
		selectedPath,
		isExpanded,
		onDirClick,
		onFileClick,
		onNodeContextMenu,
		contextMenu,
		onContextMenuAction,
		onCloseContextMenu,
		onSearchChange,
		onSearchClear
	}: Props = $props();
</script>

<Accordion.Item value="files" class="explorer-section">
	<Accordion.Header>
		<Accordion.Trigger class="section-trigger">
			<span class="section-chevron" aria-hidden="true">
				<ChevronRight size={11} strokeWidth={2} />
			</span>
			<span class="section-title">FOLDERS</span>
		</Accordion.Trigger>
	</Accordion.Header>

	<Accordion.Content>
		<!-- Search Box -->
		<div class="search-container">
			<Search size={10} strokeWidth={2} />
			<input
				type="text"
				class="search-input"
				placeholder="Search files..."
				value={searchQuery}
				onchange={(e) => onSearchChange((e.target as HTMLInputElement).value)}
				oninput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
			/>
			{#if hasSearch}
				<button class="search-clear" onclick={() => onSearchClear()} title="Clear search">
					<X size={10} strokeWidth={2} />
				</button>
			{/if}
		</div>

		<!-- Tree View -->
		{#if tree.length > 0}
			<FileTreeView
				nodes={filteredTree}
				{selectedPath}
				isExpanded={(path) => (hasSearch ? expandOnSearch.has(path) : isExpanded(path))}
				isFileActive={(path) => editorStore.isActive(path)}
				{onDirClick}
				{onFileClick}
				{onNodeContextMenu}
			/>
		{:else if treeLoading}
			<div class="status-msg">Loading…</div>
		{:else if treeError}
			<div class="status-msg error">{treeError}</div>
		{:else}
			<div class="status-msg">No files found.</div>
		{/if}

		{#if contextMenu.open}
			<div
				class="context-menu"
				style={`left: ${contextMenu.x}px; top: ${contextMenu.y}px;`}
				role="menu"
				aria-label="Explorer context menu"
				tabindex="-1"
				onpointerdown={(event) => event.stopPropagation()}
			>
				<button type="button" class="menu-item" onclick={() => onContextMenuAction('new-file')}>
					New File
				</button>
				<button type="button" class="menu-item" onclick={() => onContextMenuAction('new-folder')}>
					New Folder
				</button>
				<div class="menu-divider"></div>
				<button
					type="button"
					class="menu-item"
					disabled={!selectedPath}
					onclick={() => onContextMenuAction('rename')}
				>
					Rename
				</button>
				<button
					type="button"
					class="menu-item danger"
					disabled={!selectedPath}
					onclick={() => onContextMenuAction('delete')}
				>
					Delete
				</button>
				<div class="menu-divider"></div>
				<button type="button" class="menu-item" onclick={() => onContextMenuAction('refresh')}>
					Refresh Explorer
				</button>
				<button type="button" class="menu-item" onclick={onCloseContextMenu}>Close</button>
			</div>
		{/if}
	</Accordion.Content>
</Accordion.Item>

<style>
	/* ── Search bar ────────────────────────────────────────── */
	.search-container {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 8px;
		border-bottom: 1px solid color-mix(in srgb, var(--border) 55%, transparent);
		background: color-mix(in srgb, var(--mg) 90%, var(--bg));
		color: var(--muted);
		flex-shrink: 0;
	}

	.search-input {
		flex: 1;
		min-width: 0;
		border: 1px solid color-mix(in srgb, var(--border) 78%, transparent);
		border-radius: 3px;
		padding: 4px 6px;
		font-size: 11px;
		background: color-mix(in srgb, var(--bg) 88%, var(--fg));
		color: var(--text);
		font-family: inherit;
	}

	.search-input::placeholder {
		color: var(--muted);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 28%, transparent);
	}

	.search-clear {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--muted);
		cursor: pointer;
		transition: color var(--time) var(--ease);
		flex-shrink: 0;
	}

	.search-clear:hover {
		color: var(--text);
	}

	.status-msg {
		padding: 6px 12px;
		font-size: 11px;
		color: var(--muted);
		font-style: italic;
	}

	.status-msg.error {
		color: var(--error);
	}

	.context-menu {
		position: fixed;
		z-index: 30;
		width: 180px;
		padding: 4px;
		border-radius: 4px;
		border: 1px solid color-mix(in srgb, var(--border) 75%, transparent);
		background: color-mix(in srgb, var(--mg) 92%, var(--bg));
		box-shadow:
			0 8px 22px color-mix(in srgb, var(--text) 16%, transparent),
			0 0 0 1px color-mix(in srgb, var(--border) 30%, transparent);
	}

	.menu-item {
		display: flex;
		align-items: center;
		width: 100%;
		height: 24px;
		padding: 0 8px;
		border: 0;
		border-radius: 4px;
		background: transparent;
		color: var(--text);
		font-size: 11px;
		text-align: left;
		cursor: pointer;
	}

	.menu-item:hover:not(:disabled) {
		background: color-mix(in srgb, var(--fg) 70%, transparent);
	}

	.menu-item:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.menu-item.danger:hover:not(:disabled) {
		background: color-mix(in srgb, var(--error) 18%, transparent);
		color: var(--error);
	}

	.menu-divider {
		height: 1px;
		margin: 4px 0;
		background: color-mix(in srgb, var(--border) 60%, transparent);
	}
</style>
