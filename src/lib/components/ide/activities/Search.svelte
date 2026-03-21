<script lang="ts">
	import { X, RefreshCw } from '@lucide/svelte';
	import ActivityPanel from './ActivityPanel.svelte';
	import Button from '$lib/components/ui/primitives/Button.svelte';
	import SearchBar from '$lib/components/ui/inputs/SearchBar.svelte';
	import { requireIDEContext } from '$lib/context/ide/ide-context.js';
	import { createSearchActivity } from '$lib/controllers/activity/index.js';
	import { editorStore } from '$lib/stores/editor/editorStore.svelte.js';

	const ide = requireIDEContext();
	const search = createSearchActivity({
		getWebcontainer: ide.getWebcontainer,
		getEntryPath: ide.getEntryPath,
		getActiveTabPath: () => editorStore.activeTabPath,
		openFile: editorStore.openFile
	});

	let query = $state('');

	function clearSearch() {
		search.clearSearch();
		query = '';
	}

	$effect(() => {
		const current = query;
		const timer = setTimeout(() => {
			void search.runSearch(current);
		}, 180);

		return () => clearTimeout(timer);
	});
</script>

<ActivityPanel title="SEARCH">
	{#snippet actions()}
		<Button
			variant="ghost"
			tone="neutral"
			size="icon"
			class="panel-icon-action"
			title="Clear"
			onclick={clearSearch}
		>
			<X size={14} strokeWidth={1.75} />
		</Button>
		<Button
			variant="ghost"
			tone="neutral"
			size="icon"
			class="panel-icon-action"
			title="Refresh"
			onclick={() => void search.runSearch(query)}
		>
			<RefreshCw size={14} strokeWidth={1.75} />
		</Button>
	{/snippet}

	<div class="search-body">
		<div class="search-input-wrap">
			<SearchBar
				value={query}
				oninput={(event: Event) => {
					query = (event.currentTarget as HTMLInputElement).value;
				}}
				placeholder="Search in files"
				aria-label="Search in files"
			/>
		</div>

		{#if query}
			<div class="results-section">
				<div class="results-header">
					<span class="results-label">RESULTS</span>
					<span class="results-count">
						{#if search.searching}
							Searching…
						{:else}
							{search.results.length} result{search.results.length === 1 ? '' : 's'}
						{/if}
					</span>
				</div>

				{#if search.error}
					<div class="empty-state">Search failed: <strong>{search.error}</strong></div>
				{:else if !search.searching && search.results.length === 0}
					<div class="empty-state">No results for "<strong>{query}</strong>"</div>
				{:else}
					<div class="results-list">
						{#each search.results as result (`${result.path}:${result.line}:${result.preview}`)}
							<button class="result-item" onclick={() => search.openResult(result)}>
								<div class="result-path">{result.path}:{result.line}</div>
								<div class="result-preview">{result.preview}</div>
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<div class="empty-state muted">Type to search across all files</div>
		{/if}
	</div>
</ActivityPanel>

<style>
	.search-body {
		display: flex;
		flex-direction: column;
	}

	.search-input-wrap {
		padding: 6px 8px;
		border-bottom: 1px solid color-mix(in srgb, var(--border) 58%, transparent);
	}

	/* ── Results section ────────────────────────────────────── */
	.results-section {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.results-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 24px;
		padding: 0 10px;
		border-bottom: 1px solid color-mix(in srgb, var(--border) 40%, transparent);
	}

	.results-label {
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: var(--muted);
		text-transform: uppercase;
	}

	.results-count {
		font-size: 10px;
		color: var(--muted);
		font-family: 'SF Mono', 'Cascadia Code', monospace;
	}

	/* ── Empty / status states ──────────────────────────────── */
	.empty-state {
		padding: 10px 12px;
		font-size: 12px;
		color: var(--text);
		line-height: 1.5;
	}

	.empty-state strong {
		color: var(--text);
		font-weight: 600;
	}

	.empty-state.muted {
		color: var(--muted);
		font-style: italic;
	}

	.results-list {
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: auto;
	}

	.result-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-height: 32px;
		padding: 6px 10px;
		text-align: left;
		background: transparent;
		border: none;
		border-bottom: 1px solid color-mix(in srgb, var(--border) 35%, transparent);
		cursor: pointer;
	}

	.result-item:hover {
		background: color-mix(in srgb, var(--fg) 70%, transparent);
	}

	.result-path {
		font-size: 10px;
		font-family: 'SF Mono', 'Cascadia Code', monospace;
		color: var(--muted);
	}

	.result-preview {
		font-size: 11px;
		font-family: 'Segoe UI', system-ui, sans-serif;
		color: var(--text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
