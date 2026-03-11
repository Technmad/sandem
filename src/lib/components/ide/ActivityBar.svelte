<script lang="ts">
	import { Files, Search, GitBranch, Settings, Play } from '@lucide/svelte';

	let activeTab = $state<string>('explorer');

	const tools = [
		{ id: 'explorer', icon: Files, label: 'Explorer' },
		{ id: 'search', icon: Search, label: 'Search' },
		{ id: 'git', icon: GitBranch, label: 'Source Control' },
		{ id: 'run', icon: Play, label: 'Run & Debug' }
	];
</script>

<div class="activity-bar-container">
	<div class="top-items">
		{#each tools as tool}
			<button
				class="icon-button"
				class:active={activity.tab === tool.id}
				onclick={() => (activity.tab = tool.id)}
				title={tool.label}
			>
				<tool.icon size={24} />
			</button>
		{/each}
	</div>

	<div class="bottom-items">
		<button class="icon-button" title="Settings"> S </button>
	</div>
</div>

<style>
	.activity-bar-container {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
		width: 48px;
		background: var(--fg);
		border-right: 1px solid var(--border);
	}

	.icon-button {
		width: 48px;
		height: 48px;
		display: grid;
		place-items: center;
		background: transparent;
		border: none;
		color: var(--muted);
		cursor: pointer;
		position: relative;
		transition: color 0.2s;
	}

	.icon-button:hover {
		color: var(--text);
	}

	.icon-button.active {
		color: var(--text);
	}

	.icon-button.active::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 2px;
		background: var(--accent);
	}

	.bottom-items {
		padding-bottom: 8px;
	}
</style>
