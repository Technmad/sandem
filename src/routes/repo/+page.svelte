<script lang="ts">
	import SideBar from '$lib/components/ide/SideBar.svelte';
	import Editor from '$lib/components/ide/Editor.svelte';
	import Terminal from '$lib/components/ide/Terminal.svelte';
	import Preview from '$lib/components/ide/Preview.svelte';
	import ActivityBar from '$lib/components/ide/ActivityBar.svelte';

	import '../../app.css';

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

<style>
	:global(.sidebar) {
		grid-area: SIDEBAR;
	}
	:global(.editor) {
		grid-area: EDITOR;
	}
	:global(.terminal) {
		grid-area: TERMINAL;
	}
	:global(.preview) {
		grid-area: PREVIEW;
	}

	:global(.sidebar-ide-preview) {
		height: 100%;
	}
</style>
