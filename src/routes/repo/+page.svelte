<script lang="ts">
	import RepoPaneLayout from '$lib/components/ui/workspace/RepoPaneLayout.svelte';

	import Editor from '$lib/components/ide/workspace/Editor.svelte';
	import Terminal from '$lib/components/ide/workspace/Terminal.svelte';
	import RightSidebar from '$lib/components/ide/workspace/RightSidebar.svelte';
</script>

<RepoPaneLayout>
	{#snippet editor()}
		<section aria-label="leftpane pane">
			<Editor />
		</section>
	{/snippet}

	{#snippet terminal()}
		<section class="downpane" aria-label="downpane pane">
			<Terminal />
		</section>
	{/snippet}

	{#snippet preview()}
		<aside aria-label="rightpane pane">
			<RightSidebar />
		</aside>
	{/snippet}
</RepoPaneLayout>

<style>
	section,
	aside {
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: var(--bg);
	}

	.downpane {
		border-top: 1px solid var(--border);
	}
</style>
