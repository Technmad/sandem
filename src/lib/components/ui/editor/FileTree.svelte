<script lang="ts">
	import FileTreeView from './FileTreeView.svelte';
	import type { FileNode, FileTreeItem } from '$types/editor.js';

	const defaultItems: FileTreeItem[] = [
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
	];

	type Props = {
		items?: FileTreeItem[];
		selected?: string;
		variant?: 'default' | 'compact';
		onSelect?: (name: string, item: FileTreeItem) => void;
	};

	let { items, selected = $bindable('app.css'), variant = 'default', onSelect }: Props = $props();

	let files = $state<FileTreeItem[]>(structuredClone(defaultItems));
	let treeNodes = $state<FileNode[]>([]);
	let itemByPath = $state<Record<string, FileTreeItem>>({});
	let expandedByPath = $state<Record<string, true>>({});

	$effect(() => {
		files = structuredClone(items ?? defaultItems);

		const nextItemByPath: Record<string, FileTreeItem> = {};
		const nextExpandedByPath: Record<string, true> = {};

		function mapTree(source: FileTreeItem[], depth = 0, parentPath = ''): FileNode[] {
			return source.map((item) => {
				const path = parentPath ? `${parentPath}/${item.name}` : item.name;
				nextItemByPath[path] = item;

				if (item.type === 'folder') {
					if (item.isOpen) nextExpandedByPath[path] = true;
					const children = mapTree(item.children ?? [], depth + 1, path);
					return {
						name: item.name,
						path,
						type: 'directory',
						depth,
						children
					} satisfies FileNode;
				}

				return {
					name: item.name,
					path,
					type: 'file',
					depth
				} satisfies FileNode;
			});
		}

		treeNodes = mapTree(files);
		itemByPath = nextItemByPath;
		expandedByPath = nextExpandedByPath;
	});

	function toggleFolder(path: string) {
		if (expandedByPath[path]) {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const { [path]: _removed, ...rest } = expandedByPath;
			expandedByPath = rest;
			return;
		}

		expandedByPath = { ...expandedByPath, [path]: true };
	}

	function selectFile(path: string) {
		const item = itemByPath[path];
		if (!item) return;

		selected = item.name;
		onSelect?.(item.name, item);
	}

	function isExpanded(path: string) {
		return Boolean(expandedByPath[path]);
	}

	function isFileActive(path: string) {
		const item = itemByPath[path];
		if (!item) return false;
		return selected === path || selected === item.name;
	}
</script>

<div class="tree-root" data-variant={variant}>
	<FileTreeView
		nodes={treeNodes}
		selectedPath={selected}
		{isExpanded}
		{isFileActive}
		onDirClick={(node) => toggleFolder(node.path)}
		onFileClick={(node) => selectFile(node.path)}
	/>
</div>

<style>
	.tree-root {
		padding: 0.25rem 0;
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		font-size: 13px;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		background: var(--fg);
		overflow: hidden;
	}

	.tree-root[data-variant='compact'] {
		font-size: 12px;
	}
</style>
