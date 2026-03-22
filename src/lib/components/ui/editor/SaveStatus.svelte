<script lang="ts">
	import { Check } from '@lucide/svelte';

	let {
		status,
		variant
	}: {
		status: string;
		variant: 'saving' | 'saved' | 'unsaved' | 'session' | 'error' | '';
	} = $props();
</script>

{#if status}
	<span
		class="save-status"
		class:saving={variant === 'saving'}
		class:saved={variant === 'saved'}
		class:unsaved={variant === 'unsaved'}
		class:session={variant === 'session'}
		class:error={variant === 'error'}
		data-testid="editor-save-status"
	>
		{#if variant === 'saving'}
			<span class="save-spinner"></span>
		{:else if variant === 'saved'}
			<Check size={10} strokeWidth={2} aria-hidden="true" />
		{:else if variant === 'unsaved' || variant === 'session' || variant === 'error'}
			<span class="save-indicator" aria-hidden="true"></span>
		{/if}
		{status}
	</span>
{/if}

<style>
	/* ── Save status ────────────────────────────────────────── */
	.save-status {
		display: flex;
		align-items: center;
		gap: 5px;
		font-size: 11px;
		font-family: 'Segoe UI', system-ui, sans-serif;
		color: color-mix(in srgb, var(--muted) 90%, var(--text));
		letter-spacing: 0.02em;
		padding: 0.1rem 0.4rem;
		border-radius: 4px;
		border: 1px solid transparent;
	}

	.save-status.saving {
		color: color-mix(in srgb, var(--info) 80%, #75beff);
		border-color: color-mix(in srgb, var(--info) 30%, transparent);
		background: color-mix(in srgb, var(--info) 8%, transparent);
	}

	.save-status.saved {
		color: color-mix(in srgb, var(--success) 80%, #89d185);
		border-color: color-mix(in srgb, var(--success) 30%, transparent);
		background: color-mix(in srgb, var(--success) 7%, transparent);
	}

	.save-status.unsaved {
		color: color-mix(in srgb, #fbbf24 84%, var(--text));
		border-color: color-mix(in srgb, #f59e0b 34%, transparent);
		background: color-mix(in srgb, #f59e0b 10%, transparent);
	}

	.save-status.session {
		color: color-mix(in srgb, var(--muted) 90%, var(--text));
		border-color: color-mix(in srgb, var(--border) 45%, transparent);
		background: color-mix(in srgb, var(--fg) 72%, transparent);
	}

	.save-status.error {
		color: color-mix(in srgb, var(--error) 88%, #f48771);
		border-color: color-mix(in srgb, var(--error) 32%, transparent);
		background: color-mix(in srgb, var(--error) 8%, transparent);
	}

	.save-indicator {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 999px;
		background: currentColor;
		flex-shrink: 0;
	}

	.save-spinner {
		display: inline-block;
		width: 8px;
		height: 8px;
		border: 1.5px solid currentColor;
		border-top-color: transparent;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		flex-shrink: 0;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
