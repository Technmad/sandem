<script lang="ts">
	import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from '@lucide/svelte';
	import Button from '$lib/components/ui/primitives/Button.svelte';
	import type { FileNode } from '$types/editor.js';

	type Props = {
		nodes: FileNode[];
		selectedPath?: string | null;
		isExpanded: (path: string) => boolean;
		isFileActive: (path: string) => boolean;
		onDirClick: (node: FileNode) => void;
		onFileClick: (node: FileNode) => void;
	};

	let {
		nodes,
		selectedPath = null,
		isExpanded,
		isFileActive,
		onDirClick,
		onFileClick
	}: Props = $props();
</script>

<div class="tree" role="tree">
	{#each nodes as node (node.path)}
		{@render treeNode(node)}
	{/each}
</div>

{#snippet treeNode(node: FileNode)}
	{#if node.type === 'directory'}
		{@const open = isExpanded(node.path)}
		{@const selected = selectedPath === node.path}

		<Button
			variant="ghost"
			tone="neutral"
			size="sm"
			justify="start"
			class={`tree-row ${node.depth === 0 ? 'root' : ''} ${open ? 'open' : ''} ${selected ? 'active' : ''}`}
			style={`--depth: ${node.depth};`}
			onclick={() => onDirClick(node)}
			role="treeitem"
			aria-expanded={open}
		>
			<span class="caret" aria-hidden="true">
				{#if open}
					<ChevronDown size={12} strokeWidth={1.9} />
				{:else}
					<ChevronRight size={12} strokeWidth={1.9} />
				{/if}
			</span>
			<span class="node-icon folder-icon" aria-hidden="true">
				{#if open}
					<FolderOpen size={12} strokeWidth={1.9} />
				{:else}
					<Folder size={12} strokeWidth={1.9} />
				{/if}
			</span>
			<span class="node-label">{node.name}</span>
		</Button>

		{#if open && node.children}
			{#each node.children as child (child.path)}
				{@render treeNode(child)}
			{/each}
		{/if}
	{:else}
		{@const active = isFileActive(node.path)}
		{@const selected = selectedPath === node.path}

		<Button
			variant={active || selected ? 'default' : 'ghost'}
			tone={active || selected ? 'accent' : 'neutral'}
			size="sm"
			justify="start"
			class={`tree-row ${active || selected ? 'active' : ''}`}
			style={`--depth: ${node.depth};`}
			onclick={() => onFileClick(node)}
			role="treeitem"
			aria-current={active || selected ? 'true' : undefined}
		>
			<span class="caret" aria-hidden="true"></span>
			<span class="node-icon file-icon" aria-hidden="true">
				<File size={12} strokeWidth={1.9} />
			</span>
			<span class="node-label">{node.name}</span>
		</Button>
	{/if}
{/snippet}

<style>
	.tree {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-width: thin;
		scrollbar-color: var(--border) transparent;
		padding: 2px 0;
	}

	.tree::-webkit-scrollbar {
		width: 4px;
	}

	.tree::-webkit-scrollbar-thumb {
		background: var(--border);
		border-radius: 2px;
	}

	:global([data-button-root].tree-row) {
		display: flex;
		align-items: center;
		gap: 3px;
		padding-left: calc(8px + var(--depth, 0) * 14px);
		padding-right: 8px;
		height: 22px;
		white-space: nowrap;
		overflow: hidden;
		width: 100%;
		border-radius: 0;
		font-size: 12px;
		font-family: 'Segoe UI', system-ui, sans-serif;
	}

	:global([data-button-root][data-size='sm'][data-variant='ghost'].tree-row),
	:global([data-button-root][data-size='sm'][data-variant='default'].tree-row) {
		padding-left: calc(8px + var(--depth, 0) * 14px);
		padding-right: 8px;
	}

	:global(.tree-row.root) {
		color: var(--text);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 11px;
		height: 26px;
	}

	:global(.tree-row:hover) {
		background: color-mix(in srgb, var(--fg) 70%, transparent);
	}

	:global(.tree-row.active) {
		background: color-mix(in srgb, var(--accent) 15%, transparent);
	}

	.caret {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		flex-shrink: 0;
		color: var(--muted);
		opacity: 0.7;
	}

	.node-icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		color: var(--muted);
		transition: color var(--time) var(--ease);
	}

	:global(.tree-row:hover) .folder-icon,
	:global(.tree-row.open) .folder-icon,
	:global(.tree-row.root) .folder-icon {
		color: var(--accent);
	}

	:global(.tree-row:hover) .file-icon,
	:global(.tree-row.active) .file-icon {
		color: var(--highlight);
	}

	.node-label {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 1;
		font-size: 12px;
	}

	:global(.tree-row.root) .node-label {
		font-size: 11px;
	}
</style>
