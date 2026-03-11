<script lang="ts">
	import { onMount } from 'svelte';
	import { WebContainer } from '@webcontainer/api';
	import { setIDEContext } from '$lib/context/ide-context.js';
	import { VITE_REACT_TEMPLATE } from '$lib/utils/template.js';
	import { projectFilesToTree } from '$lib/utils/filesystem.js';

	import NavigationBar from '$lib/components/layout/NavigationBar.svelte';
	import Card from '$lib/components/ui/Card.svelte';

	const nav = [
		{ label: 'Toby Flenderson', value: 'toby' },
		{ label: 'Holly Flax', value: 'holly' },
		{ label: 'Jan Levinson', value: 'jan' }
	];

	const file = [
		{ label: 'Michael Scott', value: 'michael' },
		{ label: 'Dwight Schrute', value: 'dwight' },
		{ label: 'Jim Halpert', value: 'jim' },
		{ label: 'Stanley Hudson', value: 'stanley' },
		{ label: 'Phyllis Vance', value: 'phyllis' },
		{ label: 'Pam Beesly', value: 'pam' },
		{ label: 'Andy Bernard', value: 'andy' }
	];

	const edit = [
		{ label: 'Toby Flenderson', value: 'toby' },
		{ label: 'Holly Flax', value: 'holly' },
		{ label: 'Jan Levinson', value: 'jan' }
	];

	const selection = [
		{ label: 'Angela Martin', value: 'angela' },
		{ label: 'Kevin Malone', value: 'kevin' },
		{ label: 'Oscar Martinez', value: 'oscar' }
	];

	const menus = [
		{ title: 'Nav', items: nav },
		{ title: 'File', items: file },
		{ title: 'Edit', items: edit },
		{ title: 'Selection', items: selection }
	];

	// import SideBar from '$lib/components/sidebar/SideBar.svelte';

	let { children } = $props();

	let webcontainer = $state<WebContainer | null>(null);
	let ready = $state(false);

	// Build a minimal demo project that satisfies IDEContext.
	// No _id / owner / room — Editor falls through to its offline (no-Yjs) path.
	const demoProject = {
		files: VITE_REACT_TEMPLATE.files,
		room: undefined // forces Editor into offline/local-only mode
	} as const;

	setIDEContext({
		getWebcontainer() {
			if (!webcontainer) throw new Error('WebContainer not ready yet');
			return webcontainer;
		},
		// Cast: runtime only needs `files` and (absence of) `room`
		getProject: () => demoProject as never
	});

	onMount(async () => {
		webcontainer = await WebContainer.boot();

		// Convert the flat files array → nested FileSystemTree, then mount in one shot
		await webcontainer.mount(projectFilesToTree(VITE_REACT_TEMPLATE.files));

		ready = true;
	});
</script>

<div class="container">
	<NavigationBar class="navbar" {menus} />

	<main class="content">
		{#if ready}
			<!-- Gate rendering until the WebContainer is booted and files are mounted.
		 This means Editor / Terminal / Preview never call getWebcontainer() too early. -->

			{@render children()}
		{:else}
			<Card>
				<div class="spinner"></div>
				<p>Spinning up your sandbox…</p>
			</Card>
		{/if}
	</main>

	<div class="footer">footer</div>
</div>

<style>
	.container {
		height: 100dvh;
		overflow: hidden;
		display: grid;
		grid-template-areas:
			'navigation'
			'content'
			'status';
		grid-template-rows: auto 1fr auto;

		/*
		 * height: 100% propagates the definite height from body.
		 * grid-template-rows: auto 1fr gives the nav its natural height
		 * and lets main take exactly the remaining space — no more, no less.
		 * overflow: hidden clips anything that escapes (glow halos, etc.)
		 */
	}

	:global(.navbar) {
		grid-area: navigation;
	}

	.content {
		grid-area: content;
		min-height: calc(100% - var(--navbar-height));
		position: relative;
		overflow-y: auto;
		overflow-x: hidden;
		width: 100%;

		/*
		 * Sits in the 1fr row — height is now definite (= 100% - navbar).
		 * overflow-y: auto  → normal pages scroll their content here (not body).
		 * overflow-x: hidden → prevents horizontal bleed from hero glows etc.
		 * min-height: 0     → required for nested grids/flex to shrink correctly.
		 * position: relative → stacking context for page-level z-index layers.
		 */
	}
	.footer {
		grid-area: status;
		background: blue;
	}

	.spinner {
		width: 32px;
		height: 32px;
		border: 2px solid var(--border, #333);
		border-top-color: var(--accent, #4d9fff);
		border-radius: 50%;
		animation: spin 0.9s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
