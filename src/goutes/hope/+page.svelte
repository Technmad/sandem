<script lang="ts">
	import SideBar from '$lib/components/ide/SideBar.svelte';
	import Editor from '$lib/components/ide/Editor.svelte';
	import Terminal from '$lib/components/ide/Terminal.svelte';
	import Preview from '$lib/components/ide/Preview.svelte';
	import ActivityBar from '$lib/components/ide/ActivityBar.svelte';

	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
</script>

<PaneGroup direction="horizontal" class="sidebar-ide-preview">
	<ActivityBar />
	<Pane defaultSize={20} class="sidebar">
		<SideBar />
	</Pane>
	<PaneResizer>|</PaneResizer>

	<Pane defaultSize={60}>
		<PaneGroup direction="vertical" class="editor-terminal">
			<Pane defaultSize={50} class="editor">
				<Editor />
			</Pane>
			<PaneResizer>-</PaneResizer>
			<Pane defaultSize={50} class="terminal">
				<Terminal />
			</Pane>
		</PaneGroup>
	</Pane>

	<PaneResizer>|</PaneResizer>
	<Pane defaultSize={20} class="preview">
		<Preview />
	</Pane>
</PaneGroup>

<footer>status bar</footer>

<style>
	:global(.sidebar) {
		grid-area: SIDEBAR;
		background: blue;
		border: 1px solid white;
	}
	:global(.editor) {
		grid-area: EDITOR;
		background: blue;
		border: 1px solid white;
	}
	:global(.terminal) {
		grid-area: TERMINAL;
		background: blue;
		border: 1px solid white;
	}
	:global(.preview) {
		grid-area: PREVIEW;
		background: blue;
		border: 1px solid white;
	}

	footer {
		grid-area: STATUS;
		background: blue;
		border: 1px solid white;
		width: 100%;

		height: var(--status-height);
	}

	:global(.sidebar-ide-preview) {
		max-height: calc(100% - var(--status-height));
	}
</style>
