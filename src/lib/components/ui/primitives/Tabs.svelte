<script lang="ts">
	import type { Snippet } from 'svelte';

	export interface TabItem {
		id: string;
		label: string;
		active?: boolean;
		closable?: boolean;
	}

	let {
		variant = 'default',
		tone = 'neutral',
		tabs = [],
		onSelect,
		onClose,
		actions
	}: {
		variant?: 'default' | 'editor' | 'pills';
		tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'info' | 'danger';
		tabs?: TabItem[];
		onSelect?: (id: string) => void;
		onClose?: (id: string) => void;
		actions?: Snippet;
	} = $props();

	const toneMap = {
		neutral: 'var(--muted)',
		accent: 'var(--accent)',
		success: 'var(--success)',
		warning: 'var(--warning)',
		info: 'var(--info)',
		danger: 'var(--error)'
	} as const;

	function selectTab(id: string) {
		onSelect?.(id);
	}

	function closeTab(event: Event, id: string) {
		event.stopPropagation();
		onClose?.(id);
	}
</script>

<div class="tabs-container" data-variant={variant} style={`--tabs-tone: ${toneMap[tone]};`}>
	<div class="tabs-list" role="tablist">
		{#each tabs as tab (tab.id)}
			{@const isActive = Boolean(tab.active)}
			<div class="tab-item" class:active={isActive} role="presentation">
				<button
					type="button"
					class="tab"
					role="tab"
					aria-selected={isActive}
					onclick={() => selectTab(tab.id)}
				>
					<span class="tab-label">{tab.label}</span>
				</button>

				{#if tab.closable ?? false}
					<button
						type="button"
						class="tab-close"
						aria-label={`Close ${tab.label}`}
						onclick={(event) => closeTab(event, tab.id)}
					>
						<svg
							width="9"
							height="9"
							viewBox="0 0 9 9"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M1 1L8 8M8 1L1 8"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
							/>
						</svg>
					</button>
				{/if}
			</div>
		{/each}
	</div>

	{#if actions}
		<div class="tabs-actions">
			{@render actions()}
		</div>
	{/if}
</div>

<style>
	.tabs-container {
		display: flex;
		align-items: stretch;
		justify-content: space-between;
		width: 100%;
		min-height: 35px;
	}

	.tabs-list {
		display: flex;
		flex-wrap: nowrap;
		overflow-x: auto;
		scrollbar-width: none;
		flex: 1;
		min-width: 0;
	}

	.tabs-list::-webkit-scrollbar {
		display: none;
	}

	.tab-item {
		display: flex;
		align-items: center;
		gap: 4px;
		border-right: 1px solid var(--border);
		border-top: 2px solid transparent;
		border-bottom: 2px solid transparent;
		white-space: nowrap;
		flex-shrink: 0;
		height: 35px;
	}

	.tab {
		display: flex;
		align-items: center;
		padding: 0 8px 0 14px;
		font-size: 12px;
		font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', monospace;
		height: 100%;
		border: 0;
		background: transparent;
		color: inherit;
		cursor: pointer;
		transition:
			background var(--time) var(--ease),
			color var(--time) var(--ease),
			border-color var(--time) var(--ease);
	}

	.tab-label {
		font-size: 12px;
		line-height: 1;
	}

	.tab-close {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		border: 0;
		border-radius: 3px;
		background: transparent;
		cursor: pointer;
		opacity: 0;
		flex-shrink: 0;
		transition:
			opacity var(--time) var(--ease),
			background var(--time) var(--ease),
			color var(--time) var(--ease);
	}

	.tab-item:hover .tab-close,
	.tab-item.active .tab-close {
		opacity: 1;
	}

	.tabs-actions {
		margin-left: auto;
		display: flex;
		align-items: center;
		padding: 0 12px;
	}

	/* --- Editor Preset --- */
	.tabs-container[data-variant='editor'] {
		background: color-mix(in srgb, var(--mg) 80%, var(--bg));
		border-bottom: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
		border-top: 1px solid color-mix(in srgb, var(--border) 35%, transparent);
	}

	.tabs-container[data-variant='editor'] .tab-item {
		color: color-mix(in srgb, var(--muted) 92%, var(--text));
		background: color-mix(in srgb, var(--mg) 78%, var(--bg));
		border-right-color: color-mix(in srgb, var(--border) 60%, transparent);
		border-top-color: transparent;
	}

	.tabs-container[data-variant='editor'] .tab-item:hover:not(.active) {
		background: color-mix(in srgb, var(--fg) 62%, var(--mg));
		color: color-mix(in srgb, var(--text) 92%, var(--muted));
	}

	.tabs-container[data-variant='editor'] .tab-item.active {
		background: var(--bg);
		color: var(--text);
		border-top-color: color-mix(in srgb, var(--accent) 65%, #007acc);
		position: relative;
	}

	.tabs-container[data-variant='editor'] .tab-item.active::after {
		content: '';
		position: absolute;
		inset-inline: 0;
		bottom: -1px;
		height: 1px;
		background: var(--bg);
	}

	.tabs-container[data-variant='editor'] .tab-close {
		color: color-mix(in srgb, var(--muted) 88%, var(--text));
	}

	.tabs-container[data-variant='editor'] .tab-close:hover {
		background: color-mix(in srgb, var(--border) 45%, transparent);
		color: var(--text);
	}

	.tabs-container[data-variant='editor'] .tabs-actions {
		border-left: 1px solid color-mix(in srgb, var(--border) 58%, transparent);
		background: color-mix(in srgb, var(--mg) 84%, var(--bg));
	}

	/* --- Default Preset --- */
	.tabs-container[data-variant='default'] {
		background: var(--bg);
		border-bottom: 1px solid var(--border);
	}

	.tabs-container[data-variant='default'] .tab-item {
		color: var(--text);
		background: transparent;
	}

	.tabs-container[data-variant='default'] .tab-item.active {
		border-bottom-color: color-mix(in srgb, var(--tabs-tone) 75%, var(--border));
		color: color-mix(in srgb, var(--tabs-tone) 75%, var(--text));
	}

	.tabs-container[data-variant='default'] .tab-close {
		color: var(--muted);
	}

	.tabs-container[data-variant='default'] .tab-close:hover {
		background: color-mix(in srgb, var(--border) 50%, transparent);
		color: var(--text);
	}

	/* --- Pills Preset --- */
	.tabs-container[data-variant='pills'] {
		padding: 0.25rem;
		background: transparent;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
	}

	.tabs-container[data-variant='pills'] .tabs-list {
		gap: 0.35rem;
	}

	.tabs-container[data-variant='pills'] .tab-item {
		height: 2rem;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
	}

	.tabs-container[data-variant='pills'] .tab {
		padding-inline: 0.72rem;
	}

	.tabs-container[data-variant='pills'] .tab-item.active {
		background: color-mix(in srgb, var(--tabs-tone) 12%, var(--fg));
		border-color: color-mix(in srgb, var(--tabs-tone) 30%, var(--border));
		color: color-mix(in srgb, var(--tabs-tone) 70%, var(--text));
	}
</style>
