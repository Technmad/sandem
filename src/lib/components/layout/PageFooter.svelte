<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		brand,
		version,
		links = [],
		copy,
		children
	}: {
		variant?: 'default' | 'site';
		icon?: Snippet;
		heading?: string;
		subtitle?: string;
		brand?: Snippet;
		version?: string;
		links?: { href: string; label: string; external?: boolean }[];
		copy?: string;
		children?: Snippet;
	} = $props();
</script>

<footer data-variant={variant}>
	<!-- Site footer: compact, token-driven, full-width -->
	<div class="site-inner">
		{@render brand?.()}
		{#if version}
			<span class="site-version">{version}</span>
		{/if}

		{#if links.length}
			<nav class="site-links">
				{#each links as link}
					<a
						href={link.href}
						target={link.external ? '_blank' : undefined}
						rel={link.external ? 'noopener noreferrer' : undefined}
					>
						{link.label}
					</a>
				{/each}
			</nav>
		{/if}

		{#if copy}
			<p class="site-copy">{copy}</p>
		{/if}
		{#if children}
			{@render children()}
		{/if}
	</div>
</footer>

<style>
	/* ── Base ────────────────────────────────────────────────────────── */
	footer {
		width: 100%;
		border-top: 1px solid var(--border);
		background: var(--pf-bg, transparent);
	}

	/* ── Variant: default (CTA) ──────────────────────────────────────── */
	footer[data-variant='default'] {
		--pf-bg: var(--mg);
	}

	/* ── Variant: site (global compact footer) ───────────────────────── */
	.site-inner {
		max-width: 1200px;
		margin: 0 auto;
		padding: 1.25rem 1.5rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.site-version {
		font-size: 0.6rem;
		opacity: 0.5;
		padding: 1px 5px;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		font-variant-numeric: tabular-nums;
	}

	.site-links {
		display: flex;
		gap: 1.5rem;
	}

	.site-links a {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.site-links a:hover {
		color: var(--text);
	}

	.site-copy {
		font-size: 0.7rem;
		color: var(--muted);
		opacity: 0.45;
		margin: 0;
	}

	@media (max-width: 640px) {
		.site-inner {
			flex-direction: column;
			align-items: flex-start;
			padding: 1.75rem 1.5rem;
			gap: 1rem;
		}

		.site-links {
			gap: 1rem;
		}
	}
</style>
