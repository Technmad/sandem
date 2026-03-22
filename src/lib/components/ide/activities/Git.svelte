<script lang="ts">
	import { RefreshCw, Check } from '@lucide/svelte';
	import ActivityPanel from './ActivityPanel.svelte';
	import Button from '$lib/components/ui/primitives/Button.svelte';
	import { requireIDEContext } from '$lib/context';
	import { createGitActivity } from '$lib/controllers';
	import { editorStore } from '$lib/stores';

	const ide = requireIDEContext();
	const git = createGitActivity({
		getWebcontainer: ide.getWebcontainer,
		getEntryPath: ide.getEntryPath,
		getActiveTabPath: () => editorStore.activeTabPath,
		getProject: ide.getProject,
		openFile: editorStore.openFile
	});

	$effect(() => {
		void git.init();
	});
</script>

<ActivityPanel title="SOURCE CONTROL">
	<Button
		variant="ghost"
		tone="neutral"
		size="icon"
		class="panel-icon-action"
		title="Refresh"
		onclick={() => void git.refreshChanges()}
	>
		<RefreshCw size={14} strokeWidth={1.75} />
	</Button>
	<Button
		variant="ghost"
		tone="success"
		size="icon"
		class="panel-icon-action"
		title="Commit All"
		onclick={() => void git.commitAll()}
	>
		<Check size={14} strokeWidth={1.75} />
	</Button>

	<div class="git-body">
		<!-- Commit message input area -->
		<div class="commit-area">
			<textarea
				class="commit-input"
				placeholder="Message (⌘↵ to commit)"
				rows="3"
				value={git.message}
				oninput={(event: Event) => {
					git.setMessage((event.currentTarget as HTMLTextAreaElement).value);
				}}
			></textarea>
			<Button
				variant="outline"
				tone="info"
				size="sm"
				class="commit-btn"
				disabled={!git.canCommit}
				aria-disabled={!git.canCommit}
				onclick={() => void git.commitAll()}
			>
				<Check size={12} strokeWidth={2} />
				Commit
			</Button>

			{#if git.lastCommitSummary}
				<div class="last-commit">Last commit: {git.lastCommitSummary}</div>
			{/if}
		</div>

		<!-- Changes section -->
		<div class="changes-section">
			<div class="changes-header">
				<span class="changes-label">CHANGES</span>
				<span class="changes-count">{git.changes.length}</span>
			</div>
			{#if git.scanning}
				<div class="empty-state">Scanning workspace…</div>
			{:else if git.changes.length === 0}
				<div class="empty-state">No changes detected in working tree</div>
			{:else}
				<div class="changes-list">
					{#each git.changes as item (item.path)}
						<button class="change-item" onclick={() => git.openChangedFile(item)}>
							<span class={`change-type ${item.type}`}>{item.type[0].toUpperCase()}</span>
							<span class="change-path">{item.path}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</ActivityPanel>

<style>
	.git-body {
		display: flex;
		flex-direction: column;
	}

	/* ── Commit area ────────────────────────────────────────── */
	.commit-area {
		padding: 6px 8px;
		border-bottom: 1px solid color-mix(in srgb, var(--border) 58%, transparent);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.commit-input {
		width: 100%;
		background: var(--fg);
		border: 1px solid var(--border);
		border-radius: 3px;
		padding: 6px 8px;
		font-size: 12px;
		font-family: -apple-system, 'Segoe UI', sans-serif;
		color: var(--text);
		resize: none;
		line-height: 1.4;
		transition:
			border-color var(--time) var(--ease),
			background var(--time) var(--ease);
	}

	.commit-input::placeholder {
		color: var(--muted);
		font-style: italic;
	}

	.commit-input:focus {
		outline: none;
		border-color: var(--info);
		background: var(--bg);
	}

	:global([data-button-root].commit-btn) {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 5px;
		width: 100%;
		height: 26px;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.03em;
		color: var(--highlight);
		border-radius: 3px;
		transition:
			background var(--time) var(--ease),
			opacity var(--time) var(--ease);
		padding: 0;
	}

	:global([data-button-root].commit-btn:disabled),
	:global([data-button-root].commit-btn[aria-disabled='true']) {
		opacity: 0.4;
		cursor: default;
	}

	:global([data-button-root].commit-btn:not(:disabled):hover) {
		background: var(--info);
	}

	.last-commit {
		font-size: 10px;
		color: var(--muted);
		font-family: 'SF Mono', 'Cascadia Code', monospace;
	}

	/* ── Changes section ────────────────────────────────────── */
	.changes-section {
		display: flex;
		flex-direction: column;
	}

	.changes-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 24px;
		padding: 0 10px;
		border-bottom: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
	}

	.changes-label {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--muted);
		text-transform: uppercase;
	}

	.changes-count {
		font-size: 10px;
		color: var(--muted);
		background: color-mix(in srgb, var(--border) 60%, transparent);
		border-radius: 999px;
		padding: 0 5px;
		min-width: 16px;
		text-align: center;
		font-family: 'SF Mono', 'Cascadia Code', monospace;
	}

	.empty-state {
		padding: 10px 12px;
		font-size: 12px;
		color: var(--muted);
		font-style: italic;
		line-height: 1.5;
	}

	.changes-list {
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: auto;
	}

	.change-item {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 28px;
		padding: 4px 10px;
		background: transparent;
		border: none;
		border-bottom: 1px solid color-mix(in srgb, var(--border) 35%, transparent);
		cursor: pointer;
		text-align: left;
	}

	.change-item:hover {
		background: color-mix(in srgb, var(--fg) 65%, transparent);
	}

	.change-type {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		border-radius: 999px;
		font-size: 10px;
		font-weight: 700;
		font-family: 'SF Mono', 'Cascadia Code', monospace;
	}

	.change-type.modified {
		background: color-mix(in srgb, var(--warning) 20%, transparent);
		color: var(--warning);
	}

	.change-type.new {
		background: color-mix(in srgb, var(--success) 20%, transparent);
		color: var(--success);
	}

	.change-type.deleted {
		background: color-mix(in srgb, var(--error) 20%, transparent);
		color: var(--error);
	}

	.change-path {
		font-size: 11px;
		font-family: 'SF Mono', 'Cascadia Code', monospace;
		color: color-mix(in srgb, var(--text) 92%, var(--muted));
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
