<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		icon,
		heading,
		subtitle,
		brand,
		version,
		links = [],
		copy,
		children
	}: {
		/**
		 * default   — large CTA-style footer with icon, heading, actions
		 * site      — compact horizontal global footer with links + copy
		 */
		variant?: 'default' | 'site';
		// default variant
		icon?: Snippet;
		heading?: string;
		subtitle?: string;
		// site variant
		brand?: Snippet;
		version?: string;
		links?: { href: string; label: string; external?: boolean }[];
		copy?: string;
		// both
		children?: Snippet;
	} = $props();
</script>

<footer class="page-footer" data-variant={variant}>
	{#if variant === 'default'}
		<!-- CTA footer: sits on --mg surface, accent-tinted, centered -->
		<div class="cta-inner">
			{#if icon}
				<div class="cta-icon">{@render icon()}</div>
			{/if}
			{#if heading}
				<h2 class="cta-heading">{heading}</h2>
			{/if}
			{#if subtitle}
				<p class="cta-subtitle">{subtitle}</p>
			{/if}
			{#if children}
				<div class="cta-actions">{@render children()}</div>
			{/if}
		</div>
	{:else if variant === 'site'}
		<!-- Site footer: compact, token-driven, full-width -->
		<div class="site-inner">
			<div class="site-brand">
				{@render brand?.()}
				{#if version}
					<span class="site-version">{version}</span>
				{/if}
			</div>

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
		</div>
	{/if}
</footer>

<style>
	/* ── Base ────────────────────────────────────────────────────────── */
	.page-footer {
		width: 100%;
		border-top: 1px solid var(--border);
		background: var(--pf-bg, transparent);
	}

	/* ── Variant: default (CTA) ──────────────────────────────────────── */
	.page-footer[data-variant='default'] {
		--pf-bg: var(--mg);
	}

	.cta-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 7rem 1.5rem;
		gap: 1.5rem;
		max-width: 680px;
		margin: 0 auto;
	}

	.cta-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: var(--radius-md);
		border: 1px solid var(--border);
		background: var(--fg);
		background-image: var(--gradient-emboss);
		color: var(--accent);
		box-shadow: var(--shadow);
	}

	.cta-heading {
		font-size: clamp(1.75rem, 4vw, 2.75rem);
		font-weight: 700;
		letter-spacing: -0.03em;
		color: var(--text);
		margin: 0;
		line-height: 1.1;
	}

	.cta-subtitle {
		font-size: 1rem;
		color: var(--muted);
		line-height: 1.6;
		max-width: 52ch;
		margin: 0;
	}

	.cta-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: center;
		margin-top: 0.5rem;
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

	.site-brand {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: var(--muted);
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
