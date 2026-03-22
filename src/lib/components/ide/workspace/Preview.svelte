<script lang="ts">
	import { requireIDEContext } from '$lib/context';
	import { createPreview } from '$lib/hooks';
	import ErrorPanel from '$lib/components/ui/primitives/ErrorPanel.svelte';
	import { createErrorReporter } from '$lib/sveltekit/index.js';

	const ide = requireIDEContext();

	// createPreview (not usePreview — that export doesn't exist)
	const preview = createPreview(ide.getWebcontainer);
	let previewError = $state<string | null>(null);

	const reportPreviewError = createErrorReporter((next) => {
		previewError = next;
	});

	function startPreviewListener() {
		previewError = null;
		try {
			preview.listenForServer();
		} catch (error) {
			reportPreviewError('Failed to subscribe to preview server events.', error);
		}
	}

	function reloadPreview() {
		try {
			preview.reload();
		} catch (error) {
			reportPreviewError('Failed to reload preview.', error);
		}
	}

	// Start listening as soon as the container is available.
	// Because we're inside the {#if project.data && webcontainerInstance} gate
	// in the layout, getWebcontainer() is guaranteed to succeed here.
	// We use $effect instead of onMount so it re-runs if the container is
	// ever replaced (e.g. hot-reload in dev).
	$effect(() => {
		startPreviewListener();
	});
</script>

<div class="preview-shell">
	<div class="browser-toolbar">
		<button class="icon-btn" onclick={reloadPreview} disabled={!preview.url} aria-label="Refresh">
			<!-- Refresh icon -->
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M21 2v6h-6"></path>
				<path d="M3 12a9 9 0 1 0 2.13-5.85L7 8"></path>
			</svg>
		</button>

		<div class="address-bar">
			<span class="url-text">{preview.url || 'Waiting for dev server…'}</span>
		</div>

		<a
			href={preview.url || '#'}
			target="_blank"
			rel="noopener noreferrer"
			class="icon-btn"
			class:disabled={!preview.url}
			aria-label="Open in new tab"
		>
			<!-- External-link icon -->
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
				<polyline points="15 3 21 3 21 9"></polyline>
				<line x1="10" y1="14" x2="21" y2="3"></line>
			</svg>
		</a>
	</div>

	<div class="iframe-container">
		{#if previewError}
			<ErrorPanel
				title="Preview unavailable"
				description="The preview pane could not connect to the runtime."
				message={previewError}
				testId="preview-pane-error"
				retryLabel="Retry preview"
				onRetry={startPreviewListener}
				compact
			/>
		{:else if preview.url}
			{#key preview.key}
				<iframe title="WebContainer Preview" src={preview.url} allow="cross-origin-isolated"
				></iframe>
			{/key}
		{:else}
			<div class="empty-state">
				<div class="spinner"></div>
				<p>
					Run <code>npm run dev</code> in the terminal to start the preview.
				</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.preview-shell {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: var(--bg);
	}
	.browser-toolbar {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		background: var(--bg);
		border-bottom: 1px solid var(--border);
		flex-shrink: 0;
	}
	.address-bar {
		flex: 1;
		display: flex;
		align-items: center;
		background: var(--fg);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 2px 8px;
		overflow: hidden;
		min-height: 24px;
	}
	.url-text {
		color: var(--text);
		font-size: 11px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
		font-family: var(--fonts);
	}
	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		color: var(--muted);
		border-radius: 4px;
		flex-shrink: 0;
		background: transparent;
		border: none;
		cursor: pointer;
	}
	.icon-btn:hover:not(.disabled):not(:disabled) {
		background: var(--fg);
		color: var(--text);
	}
	.icon-btn:disabled,
	.icon-btn.disabled {
		opacity: 0.4;
		cursor: not-allowed;
		pointer-events: none;
	}
	.iframe-container {
		flex: 1;
		position: relative;
		overflow: hidden;
	}
	iframe {
		width: 100%;
		height: 100%;
		border: none;
		display: block;
	}
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		height: 100%;
		color: var(--muted);
		font-size: 13px;
		text-align: center;
		padding: 24px;
	}
	.empty-state code {
		background: var(--fg);
		padding: 2px 6px;
		border-radius: 3px;
		color: var(--accent);
		font-size: 12px;
	}
	.spinner {
		width: 26px;
		height: 26px;
		border: 2px solid var(--border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.9s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
