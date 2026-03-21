<script lang="ts">
	import { RefreshCw, Play, ChevronRight } from '@lucide/svelte';
	import ActivityPanel from './ActivityPanel.svelte';
	import Button from '$lib/components/ui/primitives/Button.svelte';
	import { Accordion } from 'bits-ui';
	import { requireIDEContext } from '$lib/context/ide/ide-context.js';
	import { createDebugActivity } from '$lib/controllers/activity/index.js';
	import { editorStore } from '$lib/stores/editor/editorStore.svelte.js';
	import { getPanelsContext } from '$lib/stores/panel/panelStore.svelte.js';

	const ide = requireIDEContext();
	const debugSections = ['VARIABLES', 'WATCH', 'CALL STACK', 'BREAKPOINTS'];

	const panels = getPanelsContext();

	const debug = createDebugActivity({
		getWebcontainer: ide.getWebcontainer,
		getEntryPath: ide.getEntryPath,
		getActiveTabPath: () => editorStore.activeTabPath,
		openFile: editorStore.openFile,
		getPanels: () => panels
	});

	$effect(() => {
		void debug.checkLaunchConfig();
	});
</script>

<ActivityPanel title="RUN AND DEBUG">
	{#snippet actions()}
		<Button
			variant="ghost"
			tone="neutral"
			size="icon"
			class="panel-icon-action"
			title="Refresh"
			onclick={() => void debug.checkLaunchConfig()}
		>
			<RefreshCw size={14} strokeWidth={1.75} />
		</Button>
		<Button
			variant="ghost"
			tone="accent"
			size="icon"
			class="panel-icon-action"
			title="Start Debugging"
			onclick={() => void debug.startDebugging()}
		>
			<Play size={14} strokeWidth={1.75} />
		</Button>
	{/snippet}

	<div class="debug-body">
		<!-- No config CTA -->
		<div class="no-config">
			<div class="no-config-icon" aria-hidden="true">
				<Play size={24} strokeWidth={1.25} />
			</div>
			<p class="no-config-title">
				{#if debug.checking}
					Checking debug config…
				{:else if debug.launchExists}
					launch.json is ready
				{:else}
					No launch configuration
				{/if}
			</p>
			<p class="no-config-desc">
				Create a <code>launch.json</code> file to configure debugging for your project.
			</p>
			<Button
				variant="outline"
				tone="info"
				size="sm"
				class="create-config-btn"
				onclick={() => void debug.createLaunchConfig()}
			>
				{debug.launchExists ? 'Open launch.json' : 'Create launch.json'}
			</Button>

			{#if debug.debugMessage}
				<div class="debug-message">{debug.debugMessage}</div>
			{/if}
		</div>

		<Accordion.Root type="multiple" class="debug-sections">
			{#each debugSections as section}
				<Accordion.Item value={section} class="debug-section">
					<Accordion.Header>
						<Accordion.Trigger class="debug-section-header">
							<span class="section-caret" aria-hidden="true">
								<ChevronRight size={11} strokeWidth={2} />
							</span>
							<span class="section-label">{section}</span>
						</Accordion.Trigger>
					</Accordion.Header>
					<Accordion.Content>
						<div class="debug-placeholder">No data available.</div>
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	</div>
</ActivityPanel>

<style>
	.debug-body {
		display: flex;
		flex-direction: column;
	}

	/* ── No-config empty state ──────────────────────────────── */
	.no-config {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		padding: 16px 12px 12px;
		border-bottom: 1px solid color-mix(in srgb, var(--border) 58%, transparent);
		text-align: center;
	}

	.no-config-icon {
		color: var(--muted);
		opacity: 0.4;
		margin-bottom: 4px;
	}

	.no-config-title {
		font-size: 12px;
		font-weight: 600;
		color: var(--text);
	}

	.no-config-desc {
		font-size: 11px;
		color: var(--muted);
		line-height: 1.5;
		max-width: 180px;
	}

	.no-config-desc code {
		font-family: 'SF Mono', 'Cascadia Code', monospace;
		font-size: 10px;
		background: color-mix(in srgb, var(--border) 50%, transparent);
		padding: 1px 4px;
		border-radius: 3px;
		color: var(--text);
	}

	:global([data-button-root].create-config-btn) {
		margin-top: 4px;
		padding: 4px 12px;
		font-size: 11px;
		font-weight: 500;
		color: var(--info);
		border-radius: 3px;
		transition:
			background var(--time) var(--ease),
			border-color var(--time) var(--ease);
	}

	:global([data-button-root].create-config-btn:hover) {
		background: color-mix(in srgb, var(--info) 20%, transparent);
		border-color: var(--info);
	}

	/* ── Debug panel sections ───────────────────────────────── */
	:global(.debug-sections) {
		display: flex;
		flex-direction: column;
	}

	:global(.debug-section) {
		border-bottom: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
	}

	:global(.debug-section-header) {
		display: flex;
		align-items: center;
		gap: 6px;
		height: 24px;
		padding: 0 10px;
		cursor: pointer;
		transition: background var(--time) var(--ease);
	}

	:global(.debug-section-header:hover) {
		background: color-mix(in srgb, var(--fg) 60%, transparent);
	}

	.section-caret {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--muted);
		transition: transform var(--time) var(--ease);
	}

	:global(.debug-section[data-state='open'] .section-caret) {
		transform: rotate(90deg);
	}

	.section-label {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--muted);
		text-transform: uppercase;
	}

	.debug-placeholder {
		padding: 6px 10px 8px;
		font-size: 11px;
		color: var(--muted);
		font-style: italic;
	}

	.debug-message {
		margin-top: 2px;
		font-size: 10px;
		color: var(--success);
		font-family: 'SF Mono', 'Cascadia Code', monospace;
	}
</style>
