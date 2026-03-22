import type { Terminal } from '@battlefieldduck/xterm-svelte';
import { createErrorReporter } from '$lib/sveltekit/index.js';
import {
	getTerminalTabPlaceholder,
	isTerminalPanelTab,
	type TerminalPanelTab
} from './createTerminalPanelController.svelte.js';
import type { createTerminalPanelController } from './createTerminalPanelController.svelte.js';
import type { createTerminalSessionsController } from './createTerminalSessionsController.svelte.js';
import type { TerminalSessionMeta } from './createTerminalSessionsController.svelte.js';

type RuntimeShell = {
	isReady: boolean;
	initShell: (terminal: Terminal) => Promise<void>;
	writeInput: (data: string) => void;
	clearTerminal: () => void;
	restartShell: () => Promise<void>;
	killShell: () => void;
};

export type TerminalSessionRuntime = {
	id: string;
	label: string;
	shell: RuntimeShell;
	terminal?: Terminal;
	terminalError: string | null;
};

type CreateShell = (options: {
	canExecute: () => boolean;
	onAudit: (entry: { command: string; allowed: boolean; at: number }) => void;
}) => RuntimeShell;

type CreateTerminalWorkspaceControllerOptions = {
	terminalPanel: ReturnType<typeof createTerminalPanelController>;
	terminalSessions: ReturnType<typeof createTerminalSessionsController>;
	createShell: CreateShell;
	getCanExecute: () => boolean;
	getRoomId: () => string | null;
	appendAudit: (entry: {
		at: number;
		command: string;
		allowed: boolean;
		roomId: string | null;
	}) => void;
	getPanels: () => { upPane?: boolean; downPane?: boolean } | undefined;
};

export function createTerminalWorkspaceController(
	options: CreateTerminalWorkspaceControllerOptions
) {
	let sessionRuntimes = $state<TerminalSessionRuntime[]>([]);
	let themeObserver: MutationObserver | undefined;

	function createRuntimeSession(meta: TerminalSessionMeta): TerminalSessionRuntime {
		return {
			id: meta.id,
			label: meta.label,
			shell: options.createShell({
				canExecute: options.getCanExecute,
				onAudit: ({ command, allowed, at }) => {
					options.appendAudit({
						at,
						command,
						allowed,
						roomId: options.getRoomId()
					});
				}
			}),
			terminal: undefined,
			terminalError: null
		};
	}

	function getRuntimeById(sessionId: string): TerminalSessionRuntime | undefined {
		return sessionRuntimes.find((session) => session.id === sessionId);
	}

	function getActiveRuntime(): TerminalSessionRuntime | undefined {
		return getRuntimeById(options.terminalSessions.activeSessionId);
	}

	function setRuntimeError(sessionId: string, next: string | null) {
		sessionRuntimes = sessionRuntimes.map((session) =>
			session.id === sessionId ? { ...session, terminalError: next } : session
		);
	}

	function reportTerminalErrorForSession(sessionId: string, message: string, error: unknown) {
		const reporter = createErrorReporter((next) => {
			setRuntimeError(sessionId, next);
		});
		reporter(message, error);
	}

	function syncTerminalTheme(terminal: Terminal | undefined) {
		if (!terminal) return;

		const style = getComputedStyle(document.documentElement);
		const mono = style.getPropertyValue('--fonts-mono').trim();
		terminal.options.fontFamily = mono || "'Cascadia Mono', 'Consolas', 'SF Mono', monospace";
		terminal.options.theme = {
			background: style.getPropertyValue('--bg').trim(),
			foreground: style.getPropertyValue('--text').trim(),
			cursor: style.getPropertyValue('--text').trim(),
			selectionBackground: style.getPropertyValue('--border').trim()
		};
	}

	function watchThemeChanges() {
		themeObserver?.disconnect();
		themeObserver = new MutationObserver(() => {
			for (const session of sessionRuntimes) {
				syncTerminalTheme(session.terminal);
			}
		});
		themeObserver.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-theme', 'data-mode', 'style', 'class']
		});
	}

	async function handleLoad(sessionId: string) {
		const runtime = getRuntimeById(sessionId);
		if (!runtime?.terminal) return;
		try {
			setRuntimeError(sessionId, null);
			syncTerminalTheme(runtime.terminal);
			watchThemeChanges();
			await runtime.shell.initShell(runtime.terminal);
		} catch (error) {
			reportTerminalErrorForSession(sessionId, 'Failed to initialize terminal shell.', error);
		}
	}

	async function ensureShell(sessionId: string) {
		const runtime = getRuntimeById(sessionId);
		if (!runtime?.terminal) return;
		try {
			setRuntimeError(sessionId, null);
			if (!runtime.shell.isReady) {
				await runtime.shell.initShell(runtime.terminal);
			}
		} catch (error) {
			reportTerminalErrorForSession(sessionId, 'Failed to start terminal shell.', error);
		}
	}

	function syncSessionRuntimes() {
		const sessions = options.terminalSessions.sessions;
		const sessionIds = new Set(sessions.map((session) => session.id));

		for (const meta of sessions) {
			const existing = sessionRuntimes.find((session) => session.id === meta.id);
			if (existing) {
				existing.label = meta.label;
				continue;
			}

			sessionRuntimes = [...sessionRuntimes, createRuntimeSession(meta)];
		}

		const removed = sessionRuntimes.filter((session) => !sessionIds.has(session.id));
		if (removed.length > 0) {
			for (const session of removed) {
				session.shell.killShell();
			}
			sessionRuntimes = sessionRuntimes.filter((session) => sessionIds.has(session.id));
		}
	}

	async function handleTabClick(id: string) {
		if (!isTerminalPanelTab(id)) return;

		options.terminalPanel.setActiveTab(id);

		const tab: TerminalPanelTab = id;
		if (tab === 'TERMINAL') {
			await ensureShell(options.terminalSessions.activeSessionId);
		}
	}

	async function handleSelectSession(sessionId: string) {
		options.terminalSessions.setActiveSession(sessionId);
		await ensureShell(sessionId);
	}

	async function handleCreateSession() {
		const sessionId = options.terminalSessions.createSession();
		syncSessionRuntimes();
		await ensureShell(sessionId);
	}

	function handleRenameSession(sessionId: string, nextLabel: string) {
		options.terminalSessions.renameSession(sessionId, nextLabel);
	}

	function handleMoveSession(sessionId: string, direction: 'left' | 'right') {
		options.terminalSessions.moveSession(sessionId, direction);
	}

	function handleCloseSession(sessionId: string) {
		options.terminalSessions.closeSession(sessionId);
	}

	async function splitActiveSession() {
		const splitSessionId = options.terminalSessions.splitActiveSession();
		syncSessionRuntimes();
		await ensureShell(splitSessionId);
	}

	function clearTerminal() {
		getActiveRuntime()?.shell.clearTerminal();
	}

	async function restartTerminal() {
		const sessionId = options.terminalSessions.activeSessionId;
		const runtime = getRuntimeById(sessionId);
		if (!runtime) return;

		try {
			setRuntimeError(sessionId, null);
			await runtime.shell.restartShell();
		} catch (error) {
			reportTerminalErrorForSession(sessionId, 'Failed to restart terminal shell.', error);
		}
	}

	function killTerminal() {
		const sessionId = options.terminalSessions.activeSessionId;
		const runtime = getRuntimeById(sessionId);
		if (!runtime) return;

		try {
			runtime.shell.killShell();
		} catch (error) {
			reportTerminalErrorForSession(sessionId, 'Failed to stop terminal shell.', error);
		}
	}

	function handleTerminalInput(sessionId: string, data: string) {
		const runtime = getRuntimeById(sessionId);
		if (!runtime) return;

		try {
			runtime.shell.writeInput(data);
		} catch (error) {
			reportTerminalErrorForSession(sessionId, 'Failed to send input to terminal process.', error);
		}
	}

	function toggleMaximize() {
		const panels = options.getPanels();
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
		const panels = options.getPanels();
		if (!panels) return;
		panels.downPane = false;
	}

	const placeholderText = $derived.by(() => {
		if (options.terminalPanel.activeTab === 'TERMINAL') return '';
		return getTerminalTabPlaceholder(options.terminalPanel.activeTab);
	});

	const runtimeSessions = $derived.by(() =>
		sessionRuntimes.map((session) => ({
			id: session.id,
			label: session.label,
			shellReady: session.shell.isReady,
			isReady: session.shell.isReady,
			terminalError: session.terminalError,
			terminal: session.terminal
		}))
	);

	function cleanup() {
		themeObserver?.disconnect();
		for (const runtime of sessionRuntimes) {
			runtime.shell.killShell();
		}
	}

	return {
		get sessionRuntimes() {
			return sessionRuntimes;
		},
		syncSessionRuntimes,
		handleLoad,
		ensureShell,
		handleTabClick,
		handleSelectSession,
		handleCreateSession,
		handleRenameSession,
		handleMoveSession,
		handleCloseSession,
		splitActiveSession,
		clearTerminal,
		restartTerminal,
		killTerminal,
		handleTerminalInput,
		toggleMaximize,
		closePanel,
		get placeholderText() {
			return placeholderText;
		},
		get runtimeSessions() {
			return runtimeSessions;
		},
		cleanup
	};
}
