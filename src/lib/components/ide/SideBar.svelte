<script lang="ts">
	import Form from '$lib/components/ui/Form.svelte';
	import AccordionItem from '$lib/components/ui/AccordionItem.svelte';
	import { Accordion } from 'bits-ui';
	import FileTree from '$lib/components/ui/FileTree.svelte';
	import { tools, activity } from '$lib/stores/activityStore.svelte';

	let { type = 'single' as const, ...rest } = $props();

	// Derive the active tool label reactively
	const label = $derived(tools.find((t) => t.id === activity.tab)?.label ?? '');
</script>

<div class="sidebar">
	<Form ariaLabel={activity.tab} preset="plain">
		<span class="title">
			<p>{label.toUpperCase()}</p>
		</span>
		<Accordion.Root {type} {...rest}>
			{#if activity.tab === 'explorer'}
				<AccordionItem title="project">
					<FileTree />
				</AccordionItem>
				<AccordionItem title="outline">
					<FileTree />
				</AccordionItem>
				<AccordionItem title="timeline">
					<ul>
						<li>File saved</li>
						<li>File saved</li>
						<li>File saved</li>
						<li>File saved</li>
					</ul>
				</AccordionItem>
			{:else if activity.tab === 'search'}
				<div class="panel-content">
					<input class="search-input" type="text" placeholder="Search…" />
				</div>
			{:else if activity.tab === 'git'}
				<div class="panel-content">
					<p class="muted">No changes detected.</p>
				</div>
			{:else if activity.tab === 'run'}
				<div class="panel-content">
					<p class="muted">No launch configurations.</p>
				</div>
			{/if}
		</Accordion.Root>
	</Form>
</div>

<style>
	.sidebar {
		grid-area: sidebar;
		height: 100%;
		background: hsl(0, 0%, 15%);
	}

	.title {
		display: grid;
		grid-template-columns: 1fr auto;
	}

	.panel-content {
		padding: 8px 12px;
	}

	.search-input {
		width: 100%;
		padding: 4px 8px;
		background: var(--bg, hsl(0, 0%, 12%));
		border: 1px solid var(--border, hsl(0, 0%, 25%));
		color: var(--text, #ccc);
		border-radius: 3px;
		font-size: 13px;
	}

	.muted {
		font-size: 12px;
		color: var(--muted, #666);
		margin: 0;
	}
</style>
