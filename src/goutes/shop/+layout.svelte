<script lang="ts">
	import { onMount } from 'svelte';
	import { WebContainer } from '@webcontainer/api';
	import { setIDEContext } from '$lib/context/ide-context.js';
	import { VITE_REACT_TEMPLATE } from '$lib/utils/template.js';
	import { projectFilesToTree } from '$lib/utils/filesystem.js';

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

{#if ready}
	<div class="sandbox">
		<!-- Gate rendering until the WebContainer is booted and files are mounted.
		 This means Editor / Terminal / Preview never call getWebcontainer() too early. -->

		{@render children()}
	</div>
{:else}
	<div class="boot-splash">
		<div class="spinner"></div>
		<p>Spinning up your sandbox…</p>
	</div>

	<div class="footer">footer</div>
{/if}

<style>
	.boot-splash {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100dvh;
		gap: 1rem;
		background: var(--bg, #1e1e1e);
		color: var(--muted, #888);
		font-family: var(--fonts, sans-serif);
		font-size: 13px;
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

	:global(.container) {
		max-height: 100dvh;
	}

	:global(main) {
		display: grid;
		grid-template-areas:
			'SANDBOX '
			'STATUS';
		grid-template-rows: 1fr auto;
	}

	.sandbox {
		grid-area: SANDBOX;

		display: grid;
		grid-template-columns: 4rem 1fr;
	}

	.footer {
		grid-area: STATUS;
		background: blue;
	}
</style>
