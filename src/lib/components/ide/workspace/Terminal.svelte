<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	import {
		createTerminalWorkspaceController,
		createTerminalPanelController,
		createTerminalSessionsController
	} from '$lib/controllers';
	import { requireIDEContext } from '$lib/context';
	import { createShellProcess } from '$lib/services';
	import { appendTerminalAudit, collaborationPermissionsStore } from '$lib/stores';
	import { getPanelsContext } from '$lib/stores';
	import TerminalPanelHeader from './TerminalPanelHeader.svelte';
	import TerminalToolbar from './TerminalToolbar.svelte';
	import TerminalViewport from './TerminalViewport.svelte';

	const ide = requireIDEContext();
	const terminalPanel = createTerminalPanelController();
	const terminalSessions = createTerminalSessionsController();
	let canExecute = $state(true);
	let roomId = $state<string | null>(null);
	const unsubscribePermissions = collaborationPermissionsStore.subscribe((value) => {
		canExecute = value.canWrite;
		roomId = value.roomId;
	});

	const panels = getPanelsContext();

	const terminalWorkspace = createTerminalWorkspaceController({
		terminalPanel,
		terminalSessions,
		createShell: ({ canExecute, onAudit }) =>
			createShellProcess(ide.getWebcontainer, {
				canExecute,
				onAudit
			}),
		getCanExecute: () => canExecute,
		getRoomId: () => roomId,
		appendAudit: appendTerminalAudit,
		getPanels: () => panels
	});

	$effect(() => {
		terminalWorkspace.syncSessionRuntimes();
	});

	onMount(() => {
		terminalSessions.hydrateState();
		terminalWorkspace.syncSessionRuntimes();
	});

	// Kill the shell process when this component is destroyed to avoid
	// leaking the WebContainer process and the WritableStream writer.
	onDestroy(() => {
		unsubscribePermissions();
		terminalWorkspace.cleanup();
	});
</script>

<div class="terminal-layout">
	<TerminalPanelHeader
		panelTabItems={terminalPanel.panelTabItems}
		activeTab={terminalPanel.activeTab}
		onTabSelect={(id) => void terminalWorkspace.handleTabClick(id)}
		onClearTerminal={terminalWorkspace.clearTerminal}
		onRestartTerminal={() => void terminalWorkspace.restartTerminal()}
		onKillTerminal={terminalWorkspace.killTerminal}
		onToggleMaximize={terminalWorkspace.toggleMaximize}
		onClosePanel={terminalWorkspace.closePanel}
	/>

	<TerminalToolbar
		activeTab={terminalPanel.activeTab}
		isOpen={terminalPanel.isTerminalToolbarOpen}
		sessions={terminalWorkspace.runtimeSessions.map((session) => ({
			id: session.id,
			label: session.label,
			isReady: session.isReady
		}))}
		activeSessionId={terminalSessions.activeSessionId}
		splitSessionId={terminalSessions.splitSessionId}
		onSelectSession={(id) => void terminalWorkspace.handleSelectSession(id)}
		onCloseSession={terminalWorkspace.handleCloseSession}
		onEnsureShell={(id) => void terminalWorkspace.ensureShell(id)}
		onCreateSession={() => void terminalWorkspace.handleCreateSession()}
		onRenameSession={terminalWorkspace.handleRenameSession}
		onMoveSession={terminalWorkspace.handleMoveSession}
		onSplitActive={() => void terminalWorkspace.splitActiveSession()}
		onCloseSplit={terminalSessions.closeSplitSession}
		onSetOpen={terminalPanel.setTerminalToolbarOpen}
	/>

	<TerminalViewport
		activeTab={terminalPanel.activeTab}
		placeholderText={terminalWorkspace.placeholderText}
		sessions={terminalWorkspace.runtimeSessions}
		activeSessionId={terminalSessions.activeSessionId}
		splitSessionId={terminalSessions.splitSessionId}
		{canExecute}
		options={terminalPanel.options}
		onLoad={(sessionId) => void terminalWorkspace.handleLoad(sessionId)}
		onData={terminalWorkspace.handleTerminalInput}
		onRetry={(sessionId) => void terminalWorkspace.ensureShell(sessionId)}
	/>
</div>

<style>
	.terminal-layout {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: color-mix(in srgb, var(--bg) 92%, black);
		border-top: 1px solid color-mix(in srgb, var(--border) 64%, transparent);
	}
</style>
