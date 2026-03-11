<script lang="ts">
	import Editor from '$lib/components/ide/Editor.svelte';
	import Preview from '$lib/components/ide/Preview.svelte';
	import Terminal from '$lib/components/ide/Terminal.svelte';
	import SideBar from '$lib/components/ide/SideBar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import {
		File,
		Search,
		GitBranch,
		Bug,
		Monitor,
		Boxes,
		FlaskConical,
		Container,
		Settings
	} from '@lucide/svelte';

	import { PaneGroup, Pane, PaneResizer } from 'paneforge';

	import EyeClosed from '@lucide/svelte/icons/eye-closed';
	import Eye from '@lucide/svelte/icons/eye';

	let sidebar = $state<Pane>();
	let collapsed = $state(false);
</script>

<nav class="activity">
	{#if collapsed}
		<Button variant="ghost" onclick={() => sidebar?.expand()}><EyeClosed /></Button>
	{:else}
		<Button onclick={() => sidebar?.collapse()}><Eye /></Button>
	{/if}
	<Button variant="ghost"><File /></Button>
	<Button variant="ghost"><Search /></Button>
	<Button variant="ghost"><GitBranch /></Button>
	<Button variant="ghost"><Bug /></Button>
	<Button variant="ghost"><Monitor /></Button>
	<Button variant="ghost"><Boxes /></Button>
	<Button variant="ghost"><FlaskConical /></Button>
	<Button variant="ghost"><Container /></Button>
	<Button variant="ghost" id="settings"><Settings /></Button>
</nav>

<PaneGroup direction="horizontal">
	<Pane
		defaultSize={20}
		collapsedSize={0}
		collapsible={true}
		minSize={15}
		bind:this={sidebar}
		onCollapse={() => (collapsed = true)}
		onExpand={() => (collapsed = false)}
	>
		<SideBar />
	</Pane>

	<PaneResizer>|</PaneResizer>

	<Pane defaultSize={80}>
		<PaneGroup direction="horizontal">
			<Pane defaultSize={50}>
				<PaneGroup direction="vertical">
					<Pane defaultSize={50}>
						<article class="editor"><Editor /></article>
					</Pane>

					<PaneResizer>_</PaneResizer>

					<Pane defaultSize={50}>
						<article class="terminal"><Terminal /></article>
					</Pane>
				</PaneGroup>
			</Pane>

			<PaneResizer>|</PaneResizer>

			<Pane defaultSize={50}>
				<aside class="preview"><Preview /></aside>
			</Pane>
		</PaneGroup>
	</Pane>
</PaneGroup>

<style>
	.editor {
		background: blue;
		grid-area: E;
	}

	.terminal {
		background: hsl(0, 0%, 10%);
		grid-area: T;
	}

	.preview {
		background: red;
		grid-area: P;
	}

	.activity {
		display: flex;
		flex-direction: column;
		background: hsl(0, 0%, 20%);
	}
</style>
