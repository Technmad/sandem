<script lang="ts">
	import { ArrowDownIcon, ArrowRightIcon, FileCodeIcon, FolderIcon } from 'phosphor-svelte';

	interface FileItem {
		name: string;
		type: 'file' | 'folder';
		isOpen?: boolean;
		children?: FileItem[];
	}

	let files = $state<FileItem[]>([
		{
			name: 'src',
			type: 'folder',
			isOpen: true,
			children: [
				{ name: 'lib', type: 'folder', isOpen: false, children: [] },
				{ name: 'app.css', type: 'file' },
				{ name: '+page.svelte', type: 'file' }
			]
		},
		{ name: 'package.json', type: 'file' },
		{ name: 'vite.config.ts', type: 'file' }
	]);

	let selectedFile = $state('app.css');

	// Fix: Change 'any' to 'FileItem'
	function toggleFolder(folder: FileItem) {
		folder.isOpen = !folder.isOpen;
	}
</script>

<ul class="tree-root">
	{#each files as item}
		<li class="tree-item">
			{#if item.type === 'folder'}
				<button class="item-label folder" onclick={() => toggleFolder(item)}>
					<span class="chevron">
						{#if item.isOpen}<ArrowDownIcon size={14} />{:else}<ArrowRightIcon size={14} />{/if}
					</span>
					<FolderIcon size={16} class="icon-folder" />
					{item.name}
				</button>

				{#if item.isOpen}
					<ul class="sub-tree">
						{#each item.children as child}
							<li class="tree-item">
								<button
									class="item-label file"
									class:active={selectedFile === child.name}
									onclick={() => (selectedFile = child.name)}
								>
									<FileCodeIcon size={16} class="icon-file" />
									{child.name}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			{:else}
				<button
					class="item-label file"
					class:active={selectedFile === item.name}
					onclick={() => (selectedFile = item.name)}
				>
					<FileCodeIcon size={16} class="icon-file" />
					{item.name}
				</button>
			{/if}
		</li>
	{/each}
</ul>

<style>
	.tree-root {
		list-style: none;
		padding: 8px 0;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 13px;
	}

	.sub-tree {
		list-style: none;
		padding-left: 20px;
	}

	.item-label {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 4px 12px;
		background: transparent;
		border: none;
		color: var(--muted);
		cursor: pointer;
		text-align: left;
		gap: 6px;
		white-space: nowrap;
	}

	.item-label:hover {
		background: var(--glint); /* Subtle hover token */
		color: var(--text);
	}

	.item-label.active {
		background: var(--border);
		color: var(--text);
	}

	.chevron {
		display: flex;
		align-items: center;
		width: 16px;
	}

	:global(.icon-folder) {
		color: var(--info);
	}
	:global(.icon-file) {
		color: var(--muted);
	}

	.item-label.active :global(.icon-file) {
		color: var(--accent);
	}
</style>
