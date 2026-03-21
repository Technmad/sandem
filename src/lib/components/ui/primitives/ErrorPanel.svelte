<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title = 'Something went wrong',
		description,
		message,
		retryLabel = 'Retry',
		onRetry,
		retryDisabled = false,
		testId,
		compact = false,
		actions
	}: {
		title?: string;
		description?: string;
		message: string;
		retryLabel?: string;
		onRetry?: () => void;
		retryDisabled?: boolean;
		testId?: string;
		compact?: boolean;
		actions?: Snippet;
	} = $props();
</script>

<section class={`error-panel ${compact ? 'compact' : ''}`} data-testid={testId}>
	<h3>{title}</h3>
	{#if description}
		<p class="description">{description}</p>
	{/if}
	<pre>{message}</pre>

	{#if actions}
		<div class="actions">{@render actions()}</div>
	{:else if onRetry}
		<div class="actions">
			<button type="button" onclick={onRetry} disabled={retryDisabled}>{retryLabel}</button>
		</div>
	{/if}
</section>

<style>
	.error-panel {
		display: grid;
		gap: 0.75rem;
		padding: 0.9rem;
		margin: 0.9rem;
		border: 1px solid color-mix(in srgb, var(--error) 35%, var(--border));
		border-radius: 0.5rem;
		background: color-mix(in srgb, var(--error) 8%, var(--bg));
	}

	.error-panel.compact {
		margin: 0;
	}

	h3,
	.description {
		margin: 0;
	}

	pre {
		margin: 0;
		white-space: pre-wrap;
		font-size: 0.78rem;
		line-height: 1.4;
		padding: 0.6rem;
		border: 1px solid var(--border);
		border-radius: 0.4rem;
		background: var(--bg);
		max-height: 14rem;
		overflow: auto;
	}

	.actions {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	button {
		justify-self: start;
		height: 28px;
		padding: 0 10px;
		border-radius: 4px;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--text);
		cursor: pointer;
	}

	button:hover:not(:disabled) {
		background: var(--fg);
	}
</style>
