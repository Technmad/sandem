<script lang="ts">
	import { Xterm } from '@battlefieldduck/xterm-svelte';
	import type {
		ITerminalOptions,
		ITerminalInitOnlyOptions,
		Terminal
	} from '@battlefieldduck/xterm-svelte';
	import { onDestroy } from 'svelte';
	import { createShellProcess } from '$lib/services';
	import { createErrorReporter } from '$lib/sveltekit/index.js';
	import { requireIDEContext } from '$lib/context';
	import { appendTerminalAudit, collaborationPermissionsStore } from '$lib/stores';
	import Tabs from '$lib/components/ui/primitives/Tabs.svelte';
	import ErrorPanel from '$lib/components/ui/primitives/ErrorPanel.svelte';
	import Button from '$lib/components/ui/primitives/Button.svelte';
	import {
		Trash2,
		RotateCcw,
		Square,
		Maximize2,
		X,
		Plus,
		ChevronDown,
		ChevronUp
	} from '@lucide/svelte';
	import { getPanelsContext } from '$lib/stores';

	const ide = requireIDEContext();
	let terminalInstance: Terminal | undefined = $state(undefined);
	let canExecute = $state(true);
	let roomId = $state<string | null>(null);
	const unsubscribePermissions = collaborationPermissionsStore.subscribe((value) => {
		canExecute = value.canWrite;
		roomId = value.roomId;
	});

	// createShellProcess (not useShellProcess — that export doesn't exist)
	const shell = createShellProcess(ide.getWebcontainer, {
		canExecute: () => canExecute,
		onAudit: ({ command, allowed, at }) => {
			appendTerminalAudit({
				at,
				command,
				allowed,
				roomId
			});
		}
	});

	const panels = getPanelsContext();

	const panelTabs = ['PROBLEMS', 'OUTPUT', 'DEBUG CONSOLE', 'TERMINAL', 'PORTS'] as const;
	type PanelTab = (typeof panelTabs)[number];
	let activeTab = $state<PanelTab>('TERMINAL');
	let isTerminalToolbarOpen = $state(true);
	let terminalError = $state<string | null>(null);
	const reportTerminalError = createErrorReporter((next) => {
		terminalError = next;
	});
	let themeObserver: MutationObserver | undefined;

	const options: ITerminalOptions & ITerminalInitOnlyOptions = {
		fontSize: 13,
		cursorBlink: true,
		cursorStyle: 'block',
		allowTransparency: true
	};

	function syncTerminalTheme() {
		if (!terminalInstance) return;

		const style = getComputedStyle(document.documentElement);
		const mono = style.getPropertyValue('--fonts-mono').trim();
		terminalInstance.options.fontFamily =
			mono || "'Cascadia Mono', 'Consolas', 'SF Mono', monospace";
		terminalInstance.options.theme = {
			background: style.getPropertyValue('--bg').trim(),
			foreground: style.getPropertyValue('--text').trim(),
			cursor: style.getPropertyValue('--text').trim(),
			selectionBackground: style.getPropertyValue('--border').trim()
		};
	}

	function watchThemeChanges() {
		themeObserver?.disconnect();
		themeObserver = new MutationObserver(() => {
			syncTerminalTheme();
		});
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme', 'data-mode', 'style', 'class']
		});
	}

	async function handleLoad() {
		if (!terminalInstance) return;
		try {
			terminalError = null;
			syncTerminalTheme();
			watchThemeChanges();
			await shell.initShell(terminalInstance);
		} catch (error) {
			reportTerminalError('Failed to initialize terminal shell.', error);
		}
	}

	async function ensureShell() {
		if (!terminalInstance) return;
		try {
			terminalError = null;
			if (!shell.isReady) {
				await shell.initShell(terminalInstance);
			}
		} catch (error) {
			reportTerminalError('Failed to start terminal shell.', error);
		}
	}

	async function handleTabClick(tab: PanelTab) {
		activeTab = tab;
		if (tab === 'TERMINAL') {
			await ensureShell();
		}
	}

	function clearTerminal() {
		shell.clearTerminal();
	}

	async function restartTerminal() {
		try {
			terminalError = null;
			await shell.restartShell();
		} catch (error) {
			reportTerminalError('Failed to restart terminal shell.', error);
		}
	}

	function killTerminal() {
		try {
			shell.killShell();
		} catch (error) {
			reportTerminalError('Failed to stop terminal shell.', error);
		}
	}

	function handleTerminalInput(data: string) {
		try {
			shell.writeInput(data);
		} catch (error) {
			reportTerminalError('Failed to send input to terminal process.', error);
		}
	}

	function toggleMaximize() {
		if (!panels) return;
		const isMaximized = !panels.upPane && panels.downPane;
		if (isMaximized) {
			panels.upPane = true;
			return;
		}
		panels.downPane = true;
		panels.upPane = false;
	}

	function closePanel() {
		if (!panels) return;
		panels.downPane = false;
	}

	function getTabPlaceholder(tab: Exclude<PanelTab, 'TERMINAL'>): string {
		const messages: Record<Exclude<PanelTab, 'TERMINAL'>, string> = {
			PROBLEMS: 'No problems have been detected in the workspace.',
			OUTPUT: 'Select an output channel to see logs.',
			'DEBUG CONSOLE': 'Debug console is idle. Start debugging to view output.',
			PORTS: 'No forwarded ports are currently open.'
		};
		return messages[tab];
	}

	const panelTabItems = $derived(
		panelTabs.map((tab) => ({
			id: tab,
			label: tab,
			active: activeTab === tab,
			closable: false
		}))
	);

	// Kill the shell process when this component is destroyed to avoid
	// leaking the WebContainer process and the WritableStream writer.
	onDestroy(() => {
		unsubscribePermissions();
		themeObserver?.disconnect();
		shell.killShell();
	});
</script>

<div class="terminal-layout">
	<div class="terminal-header">
		<Tabs
			variant="editor"
			tabs={panelTabItems}
			onSelect={(id) => void handleTabClick(id as PanelTab)}
		>
			{#snippet actions()}
				<div class="panel-actions">
					<Button
						size="icon"
						variant="ghost"
						class="action-btn"
						title="Clear"
						onclick={clearTerminal}
					>
						<Trash2 size={14} strokeWidth={1.5} />
					</Button>
					<Button
						size="icon"
						variant="ghost"
						class="action-btn"
						title="Restart Terminal"
						onclick={() => void restartTerminal()}
						disabled={activeTab !== 'TERMINAL'}
					>
						<RotateCcw size={14} strokeWidth={1.5} />
					</Button>
					<Button
						size="icon"
						variant="ghost"
						class="action-btn"
						title="Kill Terminal"
						onclick={killTerminal}
						disabled={activeTab !== 'TERMINAL'}
					>
						<Square size={14} strokeWidth={1.5} />
					</Button>
					<Button
						size="icon"
						variant="ghost"
						class="action-btn"
						title="Maximize Panel"
						onclick={toggleMaximize}
					>
						<Maximize2 size={14} strokeWidth={1.5} />
					</Button>
					<Button
						size="icon"
						variant="ghost"
						class="action-btn"
						title="Close Panel"
						onclick={closePanel}
					>
						<X size={14} strokeWidth={1.5} />
					</Button>
				</div>
			{/snippet}
		</Tabs>
	</div>
	{#if activeTab === 'TERMINAL' && isTerminalToolbarOpen}
		<div class="terminal-toolbar">
			<div class={`session-tab ${shell.isReady ? 'active' : ''}`}>
				<Button size="sm" variant="ghost" onclick={() => void ensureShell()}>1: jsh</Button>
			</div>
			<div class="terminal-toolbar-actions">
				<div class="toolbar-btn">
					<Button
						size="icon"
						variant="ghost"
						title="New Terminal"
						onclick={() => void restartTerminal()}
					>
						<Plus size={14} strokeWidth={1.7} />
					</Button>
				</div>
				<div class="toolbar-btn">
					<Button
						size="icon"
						variant="ghost"
						title="Collapse Toolbar"
						onclick={() => (isTerminalToolbarOpen = false)}
					>
						<ChevronDown size={14} strokeWidth={1.7} />
					</Button>
				</div>
			</div>
		</div>
	{:else if activeTab === 'TERMINAL'}
		<div class="terminal-toolbar collapsed">
			<div class="toolbar-btn">
				<Button
					size="sm"
					variant="ghost"
					title="Expand Toolbar"
					onclick={() => (isTerminalToolbarOpen = true)}
				>
					<ChevronUp size={14} strokeWidth={1.7} />
					Terminal
				</Button>
			</div>
		</div>
	{/if}
	<div class="terminal-container">
		{#if activeTab === 'TERMINAL'}
			{#if terminalError}
				<ErrorPanel
					title="Terminal unavailable"
					description="The terminal pane encountered an error."
					message={terminalError}
					testId="terminal-pane-error"
					compact
				>
					{#snippet actions()}
						<Button size="sm" variant="ghost" onclick={() => void ensureShell()}>
							Retry terminal
						</Button>
					{/snippet}
				</ErrorPanel>
			{:else if !canExecute}
				<div class="panel-empty-state">Terminal is read-only for viewers.</div>
			{:else}
				<Xterm
					bind:terminal={terminalInstance}
					{options}
					onLoad={handleLoad}
					onData={handleTerminalInput}
				/>
			{/if}
		{:else}
			<div class="panel-empty-state">{getTabPlaceholder(activeTab)}</div>
		{/if}
	</div>
</div>

<style>
	.terminal-layout {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: color-mix(in srgb, var(--bg) 88%, black);
	}
	.terminal-header {
		display: block;
		background: color-mix(in srgb, var(--mg) 84%, var(--bg));
		border-bottom: 1px solid color-mix(in srgb, var(--border) 70%, transparent);
		flex-shrink: 0;
	}
	.panel-actions {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.panel-actions :global([data-button-root]) {
		width: 24px;
		height: 24px;
		border-radius: 4px;
		padding: 0;
		color: color-mix(in srgb, var(--muted) 90%, var(--text));
	}

	.panel-actions :global([data-button-root]:hover) {
		background: color-mix(in srgb, var(--fg) 76%, var(--bg));
		color: var(--text);
	}

	.panel-actions :global([data-button-root]:disabled) {
		opacity: 0.45;
	}

	.terminal-toolbar {
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-inline: 8px;
		background: color-mix(in srgb, var(--bg) 94%, black);
		border-bottom: 1px solid color-mix(in srgb, var(--border) 58%, transparent);
	}

	.terminal-toolbar.collapsed {
		justify-content: flex-start;
	}

	.session-tab :global([data-button-root]) {
		height: 22px;
		padding: 0 10px;
		font-size: 11px;
		border-radius: 4px;
		background: transparent !important;
		border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
		color: var(--muted);
	}

	.session-tab.active :global([data-button-root]) {
		color: var(--text);
		background: color-mix(in srgb, var(--fg) 62%, var(--bg)) !important;
	}

	.terminal-toolbar-actions {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.toolbar-btn :global([data-button-root]) {
		height: 22px;
		min-width: 22px;
		padding: 0 6px;
		font-size: 12px;
		line-height: 1;
		border-radius: 4px;
		background: transparent !important;
		color: var(--muted);
		border: 1px solid color-mix(in srgb, var(--border) 45%, transparent);
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}

	.toolbar-btn :global([data-button-root]:hover) {
		color: var(--text);
		background: color-mix(in srgb, var(--fg) 70%, var(--bg));
	}

	.terminal-container {
		flex: 1;
		padding: 0;
		overflow: hidden;
		background: color-mix(in srgb, var(--bg) 95%, black);
	}

	.panel-empty-state {
		height: 100%;
		display: grid;
		place-items: center;
		font-size: 12px;
		font-family: 'Segoe UI', system-ui, sans-serif;
		color: var(--muted);
		border: 1px dashed color-mix(in srgb, var(--border) 60%, transparent);
		border-radius: 0;
		margin: 8px;
	}
</style>
