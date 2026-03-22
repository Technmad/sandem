<script lang="ts">
	import { Xterm } from '@battlefieldduck/xterm-svelte';
	import type {
		ITerminalInitOnlyOptions,
		ITerminalOptions,
		Terminal
	} from '@battlefieldduck/xterm-svelte';
	import ErrorPanel from '$lib/components/ui/primitives/ErrorPanel.svelte';
	import Button from '$lib/components/ui/primitives/Button.svelte';

	type Props = {
		sessionId: string;
		sessionLabel: string;
		shellReady: boolean;
		terminalError: string | null;
		canExecute: boolean;
		options: ITerminalOptions & ITerminalInitOnlyOptions;
		onLoad: (sessionId: string) => Promise<void> | void;
		onData: (sessionId: string, data: string) => void;
		onRetry: (sessionId: string) => void;
		terminal?: Terminal;
	};

	let {
		sessionId,
		sessionLabel,
		shellReady,
		terminalError,
		canExecute,
		options,
		onLoad,
		onData,
		onRetry,
		terminal = $bindable()
	}: Props = $props();
</script>

<div class="terminal-session-pane">
	{#if terminalError}
		<ErrorPanel
			title="Terminal unavailable"
			description="The terminal pane encountered an error."
			message={terminalError}
			testId={`terminal-pane-error-${sessionId}`}
			compact
		>
			{#snippet actions()}
				<Button size="sm" variant="ghost" onclick={() => onRetry(sessionId)}>Retry terminal</Button>
			{/snippet}
		</ErrorPanel>
	{:else if !canExecute}
		<div class="panel-empty-state">Terminal is read-only for viewers.</div>
	{:else}
		<div class="terminal-pane">
			<div class="xterm-host">
				<Xterm
					bind:terminal
					{options}
					onLoad={() => onLoad(sessionId)}
					onData={(data) => onData(sessionId, data)}
				/>
			</div>
			<div class="terminal-statusbar" role="status" aria-live="polite">
				<div class="status-left">
					<span class="status-pill">{sessionLabel}</span>
					<span class="status-dot {shellReady ? 'ready' : 'booting'}"></span>
					<span class="status-text">{shellReady ? 'Connected' : 'Starting shell…'}</span>
				</div>
				<div class="status-right">
					<span class="status-segment">UTF-8</span>
					<span class="status-segment">LF</span>
					<span class="status-segment">{canExecute ? 'Read/Write' : 'Read-Only'}</span>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.terminal-session-pane {
		min-height: 0;
		height: 100%;
	}

	.terminal-pane {
		height: 100%;
		display: grid;
		grid-template-rows: minmax(0, 1fr) 24px;
		min-height: 0;
	}

	.xterm-host {
		min-height: 0;
		overflow: hidden;
	}

	.terminal-statusbar {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 10px;
		padding: 0 10px;
		font-size: 11px;
		line-height: 1;
		font-family: var(--fonts-mono, 'Cascadia Mono', Consolas, monospace);
		background: color-mix(in srgb, var(--mg) 88%, var(--bg));
		border-top: 1px solid color-mix(in srgb, var(--border) 58%, transparent);
		color: color-mix(in srgb, var(--muted) 85%, var(--text));
	}

	.status-left,
	.status-right {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}

	.status-pill {
		display: inline-flex;
		align-items: center;
		height: 18px;
		padding: 0 6px;
		border-radius: 4px;
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--text);
		background: color-mix(in srgb, var(--fg) 76%, var(--bg));
		border: 1px solid color-mix(in srgb, var(--border) 64%, transparent);
	}

	.status-dot {
		width: 7px;
		height: 7px;
		border-radius: 999px;
		background: color-mix(in srgb, var(--muted) 65%, var(--text));
	}

	.status-dot.ready {
		background: color-mix(in srgb, #22c55e 78%, var(--text));
		box-shadow: 0 0 0 1px color-mix(in srgb, #22c55e 45%, transparent);
	}

	.status-dot.booting {
		background: color-mix(in srgb, #f59e0b 76%, var(--text));
	}

	.status-text {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.status-segment {
		position: relative;
		padding-left: 8px;
	}

	.status-segment::before {
		content: '';
		position: absolute;
		left: -1px;
		top: 50%;
		width: 1px;
		height: 11px;
		transform: translateY(-50%);
		background: color-mix(in srgb, var(--border) 62%, transparent);
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
