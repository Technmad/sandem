<script lang="ts">
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import { Search, ChevronRight } from '@lucide/svelte';
	import { activity, type TabId } from '$lib/stores/activity/activityStore.svelte.js';
	import { getPanelsContext } from '$lib/stores/panel/panelStore.svelte.js';
	import { createCommandPaletteController } from '$lib/controllers/workspace/index.js';

	const panels = getPanelsContext();
	let inputEl: HTMLInputElement | null = $state(null);

	function setActivity(tab: TabId) {
		activity.tab = tab;
		if (panels) panels.leftPane = true;
	}

	const controller = createCommandPaletteController({
		navigate: (path) => void goto(path),
		getPanels: () => panels,
		setActivityTab: setActivity
	});

	$effect(() => {
		if (!controller.isOpen) {
			return;
		}

		void tick().then(() => inputEl?.focus());
	});

	$effect(() => {
		return controller.mount();
	});
</script>

<div class="cmd-palette">
	<button class="cmd-search" title="Search (Ctrl+K)" onclick={controller.openPalette}>
		<Search size={11} strokeWidth={2} />
		<span class="cmd-label">Commands</span>
		<span class="cmd-shortcut">Ctrl+K</span>
	</button>
	<button class="cmd-chevron" title="Open command palette" onclick={controller.openPalette}>
		<ChevronRight size={12} strokeWidth={2} />
	</button>

	{#if controller.isOpen}
		<div class="cmd-backdrop" role="presentation" onclick={controller.closePalette}></div>
		<div
			class="cmd-dialog"
			role="dialog"
			aria-label="Command palette"
			tabindex="-1"
			onkeydown={controller.onResultKeydown}
		>
			<div class="cmd-input-row">
				<Search size={13} strokeWidth={2} />
				<input
					bind:this={inputEl}
					value={controller.query}
					oninput={(event: Event) =>
						controller.setQuery((event.currentTarget as HTMLInputElement).value)}
					placeholder="Type a command"
					aria-label="Search commands"
				/>
			</div>

			<div class="cmd-results" role="listbox" aria-label="Commands">
				{#if controller.filtered.length === 0}
					<div class="cmd-empty">No matching commands.</div>
				{:else}
					{#each controller.filtered as command, index (command.id)}
						<button
							class="cmd-item"
							class:selected={controller.selectedIndex === index}
							role="option"
							aria-selected={controller.selectedIndex === index}
							onmouseenter={() => controller.setSelectedIndex(index)}
							onclick={() => controller.execute(command)}
						>
							<span>{command.label}</span>
							{#if command.shortcut}<kbd>{command.shortcut}</kbd>{/if}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.cmd-palette {
		display: flex;
		align-items: center;
		gap: 1px;
		flex-shrink: 0;
		-webkit-app-region: no-drag;
	}
	.cmd-search {
		display: flex;
		align-items: center;
		gap: 6px;
		height: 22px;
		padding: 0 10px;
		background: var(--fg);
		border: 1px solid var(--border);
		border-radius: 4px 0 0 4px;
		color: var(--muted);
		font-family: var(--fonts);
		font-size: 11px;
		cursor: pointer;
		min-width: 220px;
	}
	.cmd-search:hover {
		background: color-mix(in srgb, var(--fg) 80%, var(--text));
		color: var(--text);
		border-color: var(--muted);
	}

	.cmd-label {
		flex: 1;
		text-align: center;
		color: var(--text);
	}

	.cmd-shortcut {
		font-size: 10px;
		color: var(--muted);
		opacity: 0.7;
	}

	.cmd-chevron {
		height: 22px;
		width: 22px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--fg);
		border: 1px solid var(--border);
		border-left: none;
		border-radius: 0 4px 4px 0;
		color: var(--muted);
		cursor: pointer;
	}
	.cmd-chevron:hover {
		color: var(--text);
	}

	.cmd-backdrop {
		position: fixed;
		inset: 0;
		background: color-mix(in srgb, black 20%, transparent);
		z-index: 999;
	}

	.cmd-dialog {
		position: fixed;
		top: 64px;
		left: 50%;
		transform: translateX(-50%);
		width: min(560px, calc(100vw - 32px));
		background: var(--fg);
		border: 1px solid var(--border);
		border-radius: 10px;
		box-shadow: var(--shadow);
		overflow: hidden;
		z-index: 1000;
	}

	.cmd-input-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		border-bottom: 1px solid var(--border);
		color: var(--muted);
	}

	.cmd-input-row input {
		flex: 1;
		background: transparent;
		border: none;
		outline: none;
		color: var(--text);
		font-family: var(--fonts);
		font-size: 13px;
	}

	.cmd-results {
		max-height: 320px;
		overflow: auto;
		padding: 6px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.cmd-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		width: 100%;
		padding: 8px 10px;
		border: none;
		background: transparent;
		border-radius: 6px;
		cursor: pointer;
		font-family: var(--fonts);
		font-size: 12px;
		color: var(--text);
	}

	.cmd-item:hover,
	.cmd-item.selected {
		background: var(--mg);
	}

	.cmd-item kbd {
		font-family: var(--fonts-mono);
		font-size: 10px;
		color: var(--muted);
	}

	.cmd-empty {
		padding: 14px 10px;
		font-size: 12px;
		color: var(--muted);
	}
</style>
