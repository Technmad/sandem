<script lang="ts">
	import { onMount } from 'svelte';
	import { WebContainer } from '@webcontainer/api';
	import { setIDEContext } from '$lib/context/ide-context.js';
	import { VITE_REACT_TEMPLATE } from '$lib/utils/template.js';
	import { projectFilesToTree } from '$lib/utils/filesystem.js';

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

{#if ready}
	<div class="sandbox">
		<!-- Gate rendering until the WebContainer is booted and files are mounted.
		 This means Editor / Terminal / Preview never call getWebcontainer() too early. -->

		{@render children()}
	</div>
{:else}
		<p>Spinning up your sandbox…</p>
{/if}
