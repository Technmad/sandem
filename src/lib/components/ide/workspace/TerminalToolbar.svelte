<script lang="ts">
	import {
		Plus,
		ChevronDown,
		ChevronUp,
		X,
		Columns2,
		Pencil,
		ArrowLeft,
		ArrowRight
	} from '@lucide/svelte';
	import Button from '$lib/components/ui/primitives/Button.svelte';
	import type { TerminalPanelTab } from '$lib/controllers/workspace/createTerminalPanelController.svelte.js';
	import type { TerminalSessionMeta } from '$lib/controllers/workspace/createTerminalSessionsController.svelte.js';

	type Props = {
		activeTab: TerminalPanelTab;
		isOpen: boolean;
		sessions: Array<TerminalSessionMeta & { isReady: boolean }>;
		activeSessionId: string;
		splitSessionId: string | null;
		onSelectSession: (id: string) => void;
		onCloseSession: (id: string) => void;
		onEnsureShell: (id: string) => void;
		onCreateSession: () => void;
		onRenameSession: (id: string, label: string) => void;
		onMoveSession: (id: string, direction: 'left' | 'right') => void;
		onSplitActive: () => void;
		onCloseSplit: () => void;
		onSetOpen: (next: boolean) => void;
	};

	let {
		activeTab,
		isOpen,
		sessions,
		activeSessionId,
		splitSessionId,
		onSelectSession,
		onCloseSession,
		onEnsureShell,
		onCreateSession,
		onRenameSession,
		onMoveSession,
		onSplitActive,
		onCloseSplit,
		onSetOpen
	}: Props = $props();

	let renamingSessionId = $state<string | null>(null);
	let renameValue = $state('');

	function startRename() {
		const active = sessions.find((session) => session.id === activeSessionId);
		if (!active) return;
		renamingSessionId = active.id;
		renameValue = active.label;
	}

	function cancelRename() {
		renamingSessionId = null;
		renameValue = '';
	}

	function confirmRename() {
		if (!renamingSessionId) return;
		onRenameSession(renamingSessionId, renameValue);
		cancelRename();
	}
</script>

{#if activeTab === 'TERMINAL' && isOpen}
	<div class="terminal-toolbar">
		{#if renamingSessionId}
			<div class="rename-strip">
				<input
					type="text"
					value={renameValue}
					oninput={(event) => (renameValue = (event.currentTarget as HTMLInputElement).value)}
					onkeydown={(event) => {
						if (event.key === 'Enter') {
							event.preventDefault();
							confirmRename();
						}
						if (event.key === 'Escape') {
							event.preventDefault();
							cancelRename();
						}
					}}
				/>
				<Button size="sm" variant="ghost" onclick={confirmRename}>Save</Button>
				<Button size="sm" variant="ghost" onclick={cancelRename}>Cancel</Button>
			</div>
		{/if}
		<div class="session-tabs" role="tablist" aria-label="Terminal sessions">
			{#each sessions as session (session.id)}
				<div class={`session-tab ${session.id === activeSessionId ? 'active' : ''}`}>
					<Button
						size="sm"
						variant="ghost"
						title={session.label}
						onclick={() => {
							onSelectSession(session.id);
							onEnsureShell(session.id);
						}}
					>
						{session.label}
					</Button>
					<Button
						size="icon"
						variant="ghost"
						class="session-close"
						title={`Close ${session.label}`}
						onclick={() => onCloseSession(session.id)}
					>
						<X size={11} strokeWidth={2} />
					</Button>
				</div>
			{/each}
		</div>
		<div class="terminal-toolbar-actions">
			<div class="toolbar-btn">
				<Button
					size="icon"
					variant="ghost"
					title="Move Session Left"
					onclick={() => onMoveSession(activeSessionId, 'left')}
				>
					<ArrowLeft size={14} strokeWidth={1.7} />
				</Button>
			</div>
			<div class="toolbar-btn">
				<Button
					size="icon"
					variant="ghost"
					title="Move Session Right"
					onclick={() => onMoveSession(activeSessionId, 'right')}
				>
					<ArrowRight size={14} strokeWidth={1.7} />
				</Button>
			</div>
			<div class="toolbar-btn">
				<Button size="icon" variant="ghost" title="Rename Session" onclick={startRename}>
					<Pencil size={14} strokeWidth={1.7} />
				</Button>
			</div>
			<div class="toolbar-btn">
				<Button
					size="icon"
					variant="ghost"
					title={splitSessionId ? 'Close Split' : 'Split Terminal'}
					onclick={splitSessionId ? onCloseSplit : onSplitActive}
				>
					<Columns2 size={14} strokeWidth={1.7} />
				</Button>
			</div>
			<div class="toolbar-btn">
				<Button size="icon" variant="ghost" title="New Terminal" onclick={onCreateSession}>
					<Plus size={14} strokeWidth={1.7} />
				</Button>
			</div>
			<div class="toolbar-btn">
				<Button
					size="icon"
					variant="ghost"
					title="Collapse Toolbar"
					onclick={() => onSetOpen(false)}
				>
					<ChevronDown size={14} strokeWidth={1.7} />
				</Button>
			</div>
		</div>
	</div>
{:else if activeTab === 'TERMINAL'}
	<div class="terminal-toolbar collapsed">
		<div class="toolbar-btn">
			<Button size="sm" variant="ghost" title="Expand Toolbar" onclick={() => onSetOpen(true)}>
				<ChevronUp size={14} strokeWidth={1.7} />
				Terminal
			</Button>
		</div>
	</div>
{/if}

<style>
	.terminal-toolbar {
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-inline: 8px;
		gap: 10px;
		background: color-mix(in srgb, var(--bg) 95%, black);
		border-bottom: 1px solid color-mix(in srgb, var(--border) 58%, transparent);
	}

	.rename-strip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding-right: 8px;
	}

	.rename-strip input {
		height: 22px;
		min-width: 150px;
		padding: 0 8px;
		border-radius: 4px;
		border: 1px solid color-mix(in srgb, var(--border) 65%, transparent);
		background: color-mix(in srgb, var(--fg) 75%, var(--bg));
		color: var(--text);
		font-size: 11px;
	}

	.rename-strip input:focus {
		outline: none;
		border-color: color-mix(in srgb, var(--text) 45%, var(--border));
	}

	.terminal-toolbar::before {
		content: 'TERMINAL';
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.08em;
		color: color-mix(in srgb, var(--muted) 76%, var(--text));
		margin-right: 10px;
	}

	.terminal-toolbar > :first-child {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
		overflow: auto hidden;
	}

	.session-tabs {
		display: flex;
		align-items: center;
		gap: 6px;
		padding-block: 2px;
	}

	.terminal-toolbar.collapsed {
		justify-content: flex-start;
	}

	.session-tab :global([data-button-root]) {
		height: 22px;
		padding: 0 8px;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.02em;
		border-radius: 4px;
		background: transparent !important;
		border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
		color: var(--muted);
	}

	.session-tab.active :global([data-button-root]) {
		color: var(--text);
		background: color-mix(in srgb, var(--fg) 62%, var(--bg)) !important;
	}

	.session-tab {
		display: inline-flex;
		align-items: center;
		gap: 2px;
	}

	.session-close :global([data-button-root]) {
		height: 20px;
		min-width: 20px;
		padding: 0;
		border-radius: 4px;
		color: var(--muted);
		border: 1px solid transparent;
	}

	.session-close :global([data-button-root]:hover) {
		color: var(--text);
		background: color-mix(in srgb, var(--fg) 70%, var(--bg));
		border-color: color-mix(in srgb, var(--border) 50%, transparent);
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
</style>
