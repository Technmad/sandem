<script lang="ts">
	import { Settings } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { activity, tools, type TabId } from '$lib/stores/activity/activityStore.svelte.js';
	import type { IDEPanels } from '$lib/stores/panel/panelStore.svelte.js';
	import Button from '$lib/components/ui/primitives/Button.svelte';
	import { createActivityBarController } from '$lib/controllers/activity/index.js';

	interface Props {
		panels: IDEPanels;
	}

	let { panels }: Props = $props();
	const controller = createActivityBarController({
		getPanels: () => panels,
		getActiveTab: () => activity.tab,
		setActiveTab: (tab) => {
			activity.tab = tab;
		}
	});

	function selectTab(id: TabId) {
		controller.selectTab(id);
	}

	function toggleSettingsPanel() {
		controller.toggleSettingsPanel();
	}

	onMount(() => {
		return controller.mountShortcuts();
	});
</script>

<aside class="activity-bar" aria-label="Activity Bar">
	<nav class="activities" aria-label="Primary activities">
		{#each tools as tool (tool.id)}
			{@const active = activity.tab === tool.id}
			<Button
				variant="ghost"
				tone="neutral"
				size="icon"
				justify="center"
				class={`activity-btn ${active ? 'active' : ''}`}
				title={tool.label}
				aria-label={tool.label}
				aria-pressed={active}
				onclick={() => selectTab(tool.id)}
			>
				<tool.icon size={26} strokeWidth={1.25} />
			</Button>
		{/each}
	</nav>

	<div class="activity-footer">
		<Button
			variant="ghost"
			tone="neutral"
			size="icon"
			justify="center"
			class="activity-btn"
			title="Toggle Secondary Sidebar"
			aria-label="Toggle secondary sidebar"
			onclick={toggleSettingsPanel}
		>
			<Settings size={26} strokeWidth={1.25} />
		</Button>
	</div>
</aside>

<style>
	.activity-bar {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		width: 48px;
		height: 100%;
		background: color-mix(in srgb, var(--mg) 86%, var(--bg));
		border-right: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
		overflow: hidden;
	}

	.activities,
	.activity-footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 8px 0;
	}

	:global([data-button-root].activity-btn) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 38px;
		padding: 0;
		border-left: 2px solid transparent;
		color: color-mix(in srgb, var(--muted) 90%, var(--text));
		transition:
			background var(--time) var(--ease),
			color var(--time) var(--ease),
			border-color var(--time) var(--ease);
		border-radius: 0;
	}

	:global([data-button-root].activity-btn:hover) {
		background: color-mix(in srgb, var(--fg) 64%, var(--bg));
		color: var(--text);
	}

	:global([data-button-root].activity-btn.active) {
		color: var(--text);
		border-left-color: color-mix(in srgb, var(--accent) 72%, #007acc);
		background: color-mix(in srgb, var(--bg) 88%, black);
	}

	.activity-footer {
		border-top: 1px solid color-mix(in srgb, var(--border) 55%, transparent);
		width: 100%;
	}
</style>
