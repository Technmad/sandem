<script lang="ts">
	import { untrack, type Snippet } from 'svelte';
	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
	import type { PaneAPI } from 'paneforge';
	import { requirePanelsContext } from '$lib/stores';

	let {
		editor,
		terminal,
		preview
	}: {
		editor: Snippet;
		terminal: Snippet;
		preview: Snippet;
	} = $props();

	const panels = requirePanelsContext();

	let workspace = $state<PaneAPI>();
	let leftpane = $state<PaneAPI>();
	let downpane = $state<PaneAPI>();
	let rightpane = $state<PaneAPI>();

	$effect(() => {
		const open = panels.leftPane || panels.rightPane;
		untrack(() => (open ? workspace?.expand() : workspace?.collapse()));
	});

	$effect(() => {
		const open = panels.leftPane;
		untrack(() => (open ? leftpane?.expand() : leftpane?.collapse()));
	});

	$effect(() => {
		const open = panels.downPane;
		untrack(() => (open ? downpane?.expand() : downpane?.collapse()));
	});

	$effect(() => {
		const open = panels.rightPane;
		untrack(() => (open ? rightpane?.expand() : rightpane?.collapse()));
	});
</script>

<PaneGroup direction="horizontal">
	<Pane bind:this={workspace} collapsible collapsedSize={0} minSize={15} defaultSize={60}>
		<PaneGroup direction="vertical">
			<Pane bind:this={leftpane} collapsible collapsedSize={0} minSize={10} defaultSize={70}>
				{@render editor()}
			</Pane>

			<PaneResizer class="resize-handle-v" />

			<Pane bind:this={downpane} collapsible collapsedSize={0} minSize={10} defaultSize={30}>
				{@render terminal()}
			</Pane>
		</PaneGroup>
	</Pane>

	<PaneResizer class="resize-handle-h" />

	<Pane bind:this={rightpane} collapsible collapsedSize={0} minSize={15} defaultSize={40}>
		{@render preview()}
	</Pane>
</PaneGroup>

<style>
	:global(.resize-handle-v) {
		height: 4px;
		background: transparent;
		cursor: row-resize;
	}

	:global(.resize-handle-v:hover),
	:global(.resize-handle-v[data-resize-handle-active]) {
		background: var(--border);
	}

	:global(.resize-handle-h) {
		width: 4px;
		background: transparent;
		cursor: col-resize;
	}

	:global(.resize-handle-h:hover),
	:global(.resize-handle-h[data-resize-handle-active]) {
		background: var(--border);
	}
</style>
