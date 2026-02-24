<script lang="ts">
	import { onMount } from 'svelte';
	import { usePreview } from '$lib/hooks/usePreview.svelte.js';

	import { getIDEContext } from '$lib/ide.js';

	// 1. Grab context
	const ide = getIDEContext();

	// 2. Pass getter to hook
	const preview = usePreview(ide.getWebcontainer);

	onMount(() => {
		preview.listenForServer();
	});
</script>

<div class="preview-shell">
	<div class="browser-toolbar">
		<button class="icon-btn" onclick={preview.reload} disabled={!preview.url} aria-label="Refresh">
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 1 0 2.13-5.85L7 8"></path></svg
			>
		</button>

		<div class="address-bar">
			<span class="url-text">{preview.url || 'Waiting for localhost...'}</span>
		</div>

		<a
			href={preview.url || '#'}
			target="_blank"
			rel="noopener noreferrer"
			class="icon-btn"
			class:disabled={!preview.url}
			aria-label="Open in New Tab"
		>
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline
					points="15 3 21 3 21 9"
				></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg
			>
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
				<div class="pulse-ring"></div>
				<p>Run <code>npm run dev</code> in the terminal to start the preview.</p>
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
		border-left: 1px solid #2d2d2d;
	}

	/* Toolbar Styling */
	.browser-toolbar {
		display: flex;
		align-items: center;
		padding: 8px 12px;
		background-color: #252526;
		border-bottom: 1px solid #333;
		gap: 8px;
	}

	.address-bar {
		flex: 1;
		background-color: #1e1e1e;
		border: 1px solid #3c3c3c;
		border-radius: 4px;
		padding: 4px 12px;
		display: flex;
		align-items: center;
		overflow: hidden;
	}

	.url-text {
		color: #d4d4d4;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 12px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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
	}

	.icon-btn:hover:not(.disabled) {
		background-color: #3c3c3c;
		color: #ffffff;
	}

	.icon-btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* Iframe Styling */
	.iframe-container {
		flex: 1;
		position: relative;
		background-color: #ffffff; /* iFrames usually have white backgrounds */
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
		height: 100%;
		background: #1e1e1e;
		color: #858585;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 14px;
	}

	.empty-state code {
		background: #2d2d2d;
		padding: 2px 6px;
		border-radius: 4px;
		color: #d4d4d4;
	}
</style>
