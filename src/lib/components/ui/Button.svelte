<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		size = 'default',
		disabled = false,
		active,
		href,
		type = 'button',
		onclick,
		children,
		...rest
	}: {
		variant?:
			| 'default'
			| 'secondary'
			| 'outline'
			| 'ghost'
			| 'link'
			| 'primary'
			| 'ghost-cta'
			| 'nav'
			| 'feat-cta'
			| 'delete';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		disabled?: boolean;
		active?: boolean;
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
		[key: string]: unknown;
	} = $props();
</script>

{#if href}
	<a class="btn" class:active data-variant={variant} data-size={size} {href} {...rest}>
		{@render children?.()}
	</a>
{:else}
	<button class="btn" class:active data-variant={variant} data-size={size} {disabled} {...rest}>
		{@render children?.()}
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem 1rem;
		font-family: inherit;
		font-size: 0.875rem;
		font-weight: 500;
		border-radius: var(--radius);
		border: 1px solid transparent;
		cursor: pointer;
		transition: all var(--time) var(--ease);
	}

	/* ── App-system variants ── */
	.btn[data-variant='default'] {
		background: var(--bg);
		color: var(--muted);
	}
	.btn[data-variant='default']:hover {
		color: var(--text);
	}
	.btn[data-variant='secondary'] {
		background: var(--bg);
		border-color: var(--border);
		color: var(--text);
	}
	.btn[data-variant='secondary']:hover {
		background: var(--border);
	}
	.btn[data-variant='outline'] {
		background: transparent;
		border-color: var(--muted);
		color: var(--text);
	}
	.btn[data-variant='outline']:hover {
		border-color: var(--text);
		color: var(--text);
	}
	.btn[data-variant='ghost'] {
		background: transparent;
		color: var(--muted);
	}
	.btn[data-variant='ghost']:hover {
		background: var(--mg);
		color: var(--text);
	}
	.btn[data-variant='link'] {
		color: var(--muted);
		font-size: 0.9rem;
		padding: 0.5rem 0.75rem;
	}
	.btn[data-variant='link']:hover,
	.btn[data-variant='link'].active {
		color: var(--text);
		background: var(--mg);
	}

	/* ── Landing page variants ── */
	.btn[data-variant='primary'] {
		background: #3b7dd8;
		color: #fff;
		border-color: #5090e8;
		font-family: 'JetBrains Mono', monospace;
		font-size: 13px;
		padding: 10px 22px;
		border-radius: 7px;
		gap: 8px;
		height: auto;
	}
	.btn[data-variant='primary']:hover {
		background: #4a8ee8;
		box-shadow: 0 0 24px #3b7dd840;
		transform: translateY(-1px);
	}

	.btn[data-variant='ghost-cta'] {
		font-family: 'JetBrains Mono', monospace;
		font-size: 12px;
		color: #2a3a50;
		border-color: #0e1521;
		padding: 10px 18px;
		border-radius: 7px;
		height: auto;
	}
	.btn[data-variant='ghost-cta']:hover {
		color: #8a9ab0;
		border-color: #1a2535;
	}

	.btn[data-variant='nav'] {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		color: #4a80c8;
		border-color: #142040;
		padding: 5px 14px;
		border-radius: 6px;
		background: #0a1828;
		letter-spacing: 0.02em;
		height: auto;
	}
	.btn[data-variant='nav']:hover {
		color: #7aaaf0;
		border-color: #1e3a6a;
		background: #0e2040;
	}

	.btn[data-variant='feat-cta'] {
		background: #0e1e36;
		border-color: #162c54;
		color: #5080d0;
		padding: 9px 18px;
		border-radius: 7px;
		font-size: 12px;
		font-family: 'JetBrains Mono', monospace;
		gap: 8px;
		height: auto;
	}
	.btn[data-variant='feat-cta']:hover {
		background: #122040;
		border-color: #2050a0;
		color: #70a0f0;
		box-shadow: 0 0 18px #0a2a6020;
	}

	/* ── Delete button ── */
	.btn[data-variant='delete'] {
		width: 2rem;
		height: 2rem;
		padding: 0;
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		color: var(--muted);
	}

	.btn[data-variant='delete']:hover {
		background: var(--mg);
		border-color: var(--error);
		color: var(--error);
	}

	/* ── Sizes (for app-system variants) ── */
	.btn[data-size='sm'] {
		height: 2rem;
		padding: 0 0.75rem;
		font-size: 0.75rem;
	}
	.btn[data-size='default'] {
		height: 2.5rem;
		padding: 0 1rem;
		font-size: 0.875rem;
	}
	.btn[data-size='lg'] {
		height: 3rem;
		padding: 0 2rem;
		font-size: 1rem;
	}
</style>
