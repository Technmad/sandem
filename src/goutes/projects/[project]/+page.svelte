<script lang="ts">
	import Editor from '$lib/components/ide/Editor.svelte';
	import Terminal from '$lib/components/ide/Terminal.svelte';
	import Preview from '$lib/components/ide/Preview.svelte';

	let { data } = $props();
</script>

{#if data.project}
	<!--
		.ide-grid is used by app.css via body:has(.ide-grid) to:
		  - kill overflow and background bleed on the body
		  - hide the dot-grid and glow pseudo-elements

		Layout: editor top-left, terminal bottom-left, preview full right.
		Inline style avoids a <style> block while keeping the named-area grid.
	-->
	<div
		class="ide-grid"
		style="
			display: grid;
			grid-template-columns: 1fr 1fr;
			grid-template-rows: 1fr 1fr;
			grid-template-areas: 'editor preview' 'terminal preview';
			height: 100%;
			overflow: hidden;
		"
	>
		<div style="grid-area: editor; min-height: 0;">
			<Editor />
		</div>
		<div style="grid-area: terminal; min-height: 0;">
			<Terminal />
		</div>
		<div style="grid-area: preview; min-height: 0;">
			<Preview />
		</div>
	</div>
{:else}
	<div
		style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--muted); font-size: 0.875rem;"
	>
		Project not found or you don't have access.
	</div>
{/if}
