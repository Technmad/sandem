<script lang="ts">
	import { ChevronRight } from '@lucide/svelte';
	import { Accordion } from 'bits-ui';

	import { editorStore } from '$lib/stores/editor/editorStore.svelte.js';
	import Button from '$lib/components/ui/primitives/Button.svelte';

	// Only render if there are open tabs
</script>

{#if editorStore.tabs.length > 0}
	<Accordion.Item value="open-editors" class="explorer-section">
		<Accordion.Header>
			<Accordion.Trigger class="section-trigger">
				<span class="section-chevron" aria-hidden="true">
					<ChevronRight size={11} strokeWidth={2} />
				</span>
				<span class="section-title">OPEN EDITORS</span>
			</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Content>
			{#each editorStore.tabs as tab (tab.path)}
				{@const isActive = editorStore.isActive(tab.path)}
				<div class="open-editor-row" title={tab.path}>
					<Button
						variant={isActive ? 'default' : 'ghost'}
						tone={isActive ? 'accent' : 'neutral'}
						size="sm"
						justify="start"
						class="open-editor-btn"
						onclick={() => editorStore.openFile(tab.path)}
					>
						<span class="open-editor-dot" class:active={isActive}></span>
						<span class="open-editor-label">{tab.label}</span>
					</Button>
					<button
						type="button"
						class="close-editor-btn"
						onclick={(event) => {
							event.stopPropagation();
							editorStore.closeTab(tab.path);
						}}
						aria-label={`Close ${tab.label}`}
						title={`Close ${tab.label}`}
					>
						×
					</button>
				</div>
			{/each}
		</Accordion.Content>
	</Accordion.Item>
{/if}

<style>
	/* ── Open editors ────────────────────────────────────── */
	.open-editor-row {
		display: flex;
		align-items: center;
		gap: 4px;
		padding-right: 6px;
		border-bottom: 1px solid color-mix(in srgb, var(--border) 24%, transparent);
	}

	:global([data-button-root].open-editor-btn) {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
		min-width: 0;
		height: 22px;
		padding: 0 12px;
		font-size: 11px;
		font-family: var(--fonts-mono);
		border-radius: 0;
	}

	.open-editor-label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.close-editor-btn {
		width: 16px;
		height: 16px;
		padding: 0;
		border: 0;
		background: transparent;
		color: var(--muted);
		font-size: 13px;
		line-height: 1;
		cursor: pointer;
		border-radius: 3px;
		flex-shrink: 0;
		opacity: 0.75;
	}

	.close-editor-btn:hover {
		background: color-mix(in srgb, var(--fg) 70%, transparent);
		color: var(--text);
		opacity: 1;
	}

	.open-editor-dot {
		width: 6px;
		height: 6px;
		border-radius: 999px;
		background: transparent;
		border: 1px solid var(--border);
		flex-shrink: 0;
		transition:
			background var(--time) var(--ease),
			border-color var(--time) var(--ease);
	}

	.open-editor-dot.active {
		background: var(--accent);
		border-color: var(--accent);
	}
</style>
