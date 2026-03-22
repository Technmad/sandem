<script lang="ts">
	import type {
		ITerminalInitOnlyOptions,
		ITerminalOptions,
		Terminal
	} from '@battlefieldduck/xterm-svelte';
	import type { TerminalPanelTab } from '$lib/controllers/workspace/createTerminalPanelController.svelte.js';
	import TerminalSessionPane from './TerminalSessionPane.svelte';

	type TerminalSessionView = {
		id: string;
		label: string;
		shellReady: boolean;
		terminalError: string | null;
		terminal?: Terminal;
	};

	type Props = {
		activeTab: TerminalPanelTab;
		placeholderText: string;
		sessions: TerminalSessionView[];
		activeSessionId: string;
		splitSessionId: string | null;
		canExecute: boolean;
		options: ITerminalOptions & ITerminalInitOnlyOptions;
		onLoad: (sessionId: string) => Promise<void> | void;
		onData: (sessionId: string, data: string) => void;
		onRetry: (sessionId: string) => void;
	};

	let {
		activeTab,
		placeholderText,
		sessions,
		activeSessionId,
		splitSessionId,
		canExecute,
		options,
		onLoad,
		onData,
		onRetry
	}: Props = $props();

	const activeSession = $derived(
		sessions.find((session) => session.id === activeSessionId) ?? null
	);
	const splitSession = $derived(
		splitSessionId
			? (sessions.find(
					(session) => session.id === splitSessionId && session.id !== activeSessionId
				) ?? null)
			: null
	);
</script>

<div class="terminal-container">
	{#if activeTab === 'TERMINAL'}
		{#if !activeSession}
			<div class="panel-empty-state">No terminal session available.</div>
		{:else if splitSession}
			<div class="terminal-split-grid">
				<TerminalSessionPane
					sessionId={activeSession.id}
					sessionLabel={activeSession.label}
					shellReady={activeSession.shellReady}
					terminalError={activeSession.terminalError}
					{canExecute}
					{options}
					{onLoad}
					{onData}
					{onRetry}
					bind:terminal={activeSession.terminal}
				/>
				<TerminalSessionPane
					sessionId={splitSession.id}
					sessionLabel={splitSession.label}
					shellReady={splitSession.shellReady}
					terminalError={splitSession.terminalError}
					{canExecute}
					{options}
					{onLoad}
					{onData}
					{onRetry}
					bind:terminal={splitSession.terminal}
				/>
			</div>
		{:else}
			<TerminalSessionPane
				sessionId={activeSession.id}
				sessionLabel={activeSession.label}
				shellReady={activeSession.shellReady}
				terminalError={activeSession.terminalError}
				{canExecute}
				{options}
				{onLoad}
				{onData}
				{onRetry}
				bind:terminal={activeSession.terminal}
			/>
		{/if}
	{:else}
		<div class="panel-empty-state">{placeholderText}</div>
	{/if}
</div>

<style>
	.terminal-container {
		flex: 1;
		padding: 0;
		overflow: hidden;
		background: color-mix(in srgb, var(--bg) 97%, black);
	}

	.terminal-split-grid {
		height: 100%;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1px;
		background: color-mix(in srgb, var(--border) 65%, transparent);
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
