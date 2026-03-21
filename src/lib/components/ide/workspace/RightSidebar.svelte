<script lang="ts">
	import Preview from '../panes/Preview.svelte';
	import Chat from '../panes/Chat.svelte';
	import { createRightPaneController } from '$lib/controllers/workspace/index.js';
	const controller = createRightPaneController();
	let ActivePanel = $derived(controller.tab === 'chat' ? Chat : Preview);
</script>

<aside>
	<header class="right-header">
		<button
			class="tab"
			class:active={controller.tab === 'vscode'}
			onclick={() => controller.setTab('vscode')}
		>
			Preview
		</button>
		<button
			class="tab"
			class:active={controller.tab === 'chat'}
			onclick={() => controller.setTab('chat')}
		>
			Chat
		</button>
	</header>

	<section class="panel-body">
		<ActivePanel />
	</section>
</aside>

<style>
	aside {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		overflow: hidden;
		background: var(--mg);
		border-left: 1px solid var(--border);
	}

	.right-header {
		display: flex;
		align-items: center;
		height: 32px;
		border-bottom: 1px solid var(--border);
		padding: 0 6px;
		gap: 4px;
	}

	.tab {
		height: 24px;
		padding: 0 8px;
		border: 1px solid transparent;
		background: transparent;
		color: var(--muted);
		font-size: 11px;
		border-radius: 4px;
		cursor: pointer;
	}

	.tab:hover {
		background: var(--fg);
		color: var(--text);
	}

	.tab.active {
		border-color: var(--border);
		background: var(--fg);
		color: var(--text);
	}

	.panel-body {
		flex: 1;
		min-height: 0;
	}
</style>
