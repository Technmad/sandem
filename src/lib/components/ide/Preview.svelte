<script lang="ts">
	import { getIDEContext } from '$lib/utils/ide-context.js';
	import { usePreview } from '$lib/hooks/createPreview.svelte.js';

	const ide = getIDEContext();
	const preview = usePreview(ide.getWebcontainer);

	// Start listening as soon as the container is available.
	// Because we're inside the {#if project.data && webcontainerInstance} gate
	// in the layout, getWebcontainer() is guaranteed to succeed here.
	// We use $effect instead of onMount so it re-runs if the container is
	// ever replaced (e.g. hot-reload in dev).
	$effect(() => {
		preview.listenForServer();
	});
</script>

<div class="preview-shell">
	<div class="browser-toolbar">
		<button class="icon-btn" onclick={preview.reload} disabled={!preview.url} aria-label="Refresh">
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
		{#if preview.url}
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
		width: 100%;
		background-color: #1e1e1e;
	}

	.browser-toolbar {
		display: flex;
		align-items: center;
		padding: 6px 10px;
		background-color: #252526;
		border-bottom: 1px solid #333;
		gap: 8px;
		flex-shrink: 0;
	}

	.address-bar {
		flex: 1;
		background-color: #1e1e1e;
		border: 1px solid #3c3c3c;
		border-radius: 4px;
		padding: 4px 10px;
		overflow: hidden;
	}

	.url-text {
		color: #9cdcfe;
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: block;
	}

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: #c5c5c5;
		cursor: pointer;
		padding: 4px;
		border-radius: 4px;
		transition:
			background-color 0.1s,
			color 0.1s;
		flex-shrink: 0;
	}

	.icon-btn:hover:not(.disabled):not(:disabled) {
		background-color: #3c3c3c;
		color: #fff;
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
		background: #fff;
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		height: 100%;
		background: #1e1e1e;
		color: #6b7280;
		font-family: system-ui, sans-serif;
		font-size: 13px;
		text-align: center;
		padding: 24px;
	}

	.empty-state code {
		background: #2d2d2d;
		padding: 2px 6px;
		border-radius: 4px;
		color: #9cdcfe;
		font-family: 'JetBrains Mono', monospace;
		font-size: 12px;
	}

	/* Simple spinning ring */
	.spinner {
		width: 28px;
		height: 28px;
		border: 2px solid #2d2d2d;
		border-top-color: #3794ff;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
