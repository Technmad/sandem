<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { activity, type TabId } from '$lib/stores';
	import { getPanelsContext } from '$lib/stores';
	import { createMenuController } from '$lib/controllers';

	interface Props {
		menus: string[];
	}
	let { menus }: Props = $props();

	const panels = getPanelsContext();
	let root: HTMLElement | null = $state(null);

	function setActivityTab(tab: TabId) {
		activity.tab = tab;
		if (panels) panels.leftPane = true;
	}

	const controller = createMenuController({
		navigate: (path) => void goto(path),
		setActivityTab,
		toggleLeftPane: () => {
			if (!panels) return;
			panels.leftPane = !panels.leftPane;
		},
		toggleDownPane: () => {
			if (!panels) return;
			panels.downPane = !panels.downPane;
		},
		toggleRightPane: () => {
			if (!panels) return;
			panels.rightPane = !panels.rightPane;
		},
		openDownPane: () => {
			if (!panels) return;
			panels.downPane = true;
		},
		openCommandPalette: () => {
			window.dispatchEvent(new CustomEvent('app:command-palette:toggle'));
		},
		openReadme: () => {
			window.open('/README.md', '_blank', 'noopener,noreferrer');
		}
	});

	onMount(() => {
		return controller.mount((target) => {
			if (!root || !target) return false;
			return root.contains(target as Node);
		});
	});
</script>

<menu class="menu-bar" aria-label="Application menu" role="menubar" bind:this={root}>
	{#each menus as item (item)}
		<div class="menu-node">
			<button
				class="menu-item"
				class:active={controller.openMenu === item}
				role="menuitem"
				aria-haspopup="true"
				aria-expanded={controller.openMenu === item}
				tabindex="0"
				onclick={() => controller.toggleMenu(item)}
				onmouseenter={() => controller.onMenuHover(item)}
			>
				{item}
			</button>

			{#if controller.openMenu === item}
				<div class="menu-popup" role="menu" aria-label={`${item} actions`}>
					{#each controller.menuActions[item] ?? [] as action, index}
						{#if 'separator' in action}
							<div class="menu-separator" aria-hidden="true"></div>
						{:else}
							<button
								class="menu-action"
								class:highlighted={controller.highlighted === index}
								role="menuitem"
								onmouseenter={() => controller.onItemHover(index)}
								onclick={() => controller.execute(action)}
							>
								<span>{action.label}</span>
								{#if action.hint}<kbd>{action.hint}</kbd>{/if}
							</button>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</menu>

<style>
	.menu-bar {
		display: flex;
		align-items: center;
		margin: 0;
		padding: 0;
		height: 100%;
	}

	.menu-item {
		height: 22px;
		padding: 0 7px;
		background: transparent;
		border: none;
		color: var(--text);
		font-family: var(--fonts);
		font-size: 11.5px;
		cursor: pointer;
		border-radius: 3px;
		white-space: nowrap;
		-webkit-app-region: no-drag;
	}
	.menu-item:hover {
		background: var(--fg);
	}

	.menu-item.active {
		background: var(--fg);
	}

	.menu-node {
		position: relative;
	}

	.menu-popup {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		min-width: 220px;
		padding: 6px;
		background: var(--fg);
		border: 1px solid var(--border);
		border-radius: 8px;
		box-shadow: var(--shadow);
		z-index: 500;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.menu-action {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 5px 8px;
		border: none;
		background: transparent;
		border-radius: 5px;
		color: var(--text);
		font-size: 11.5px;
		font-family: var(--fonts);
		cursor: pointer;
		text-align: left;
	}

	.menu-action:hover,
	.menu-action.highlighted {
		background: var(--mg);
	}

	kbd {
		font-size: 10px;
		color: var(--muted);
		font-family: var(--fonts-mono);
	}

	.menu-separator {
		height: 1px;
		background: var(--border);
		margin: 3px 2px;
	}
</style>
