<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		value = $bindable(''),
		placeholder = 'Search...',
		variant = 'text',
		icon,
		accent = 'var(--accent)',
		padding = '0.5rem 0.75rem',
		...rest // Captures id, name, required, min, max, etc.
	}: {
		value: string;
		placeholder?: string;
		variant?: string;
		icon?: Snippet;
		accent?: string;
		padding?: string;
		[key: string]: unknown;
	} = $props();
</script>

<div class="search-container" style:--accent={accent} style:--padding={padding}>
	{#if icon}
		<div class="search-icon">
			{@render icon()}
		</div>
	{/if}
	<input type={variant} bind:value {placeholder} {...rest} />
</div>

<style>
	.search-container {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: var(--padding);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		background: var(--fg);
		transition: all var(--time) var(--ease);
	}

	.search-container:focus-within {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent);
		opacity: 0.9;
	}

	.search-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--muted);
		flex-shrink: 0;
	}

	input {
		border: none;
		background: transparent;
		outline: none;
		width: 100%;
		color: var(--text);
		font-size: 0.875rem;
		font-family: inherit;
	}

	input::placeholder {
		color: var(--muted);
	}
</style>
