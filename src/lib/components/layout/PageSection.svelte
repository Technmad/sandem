<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		heading,
		label,
		children,
		aside
	}: {
		/**
		 * default   — centered header, standard padding
		 * split     — two-column, main + aside
		 * features  — bento grid (gap + bg = token-driven border lines)
		 * highlight — elevated --mg band with border top/bottom
		 * prose     — narrow readable column
		 * wide      — full-bleed, no max-width
		 * grid      — auto-fit card grid, centered header
		 */
		variant?: 'default' | 'split' | 'features' | 'highlight' | 'prose' | 'wide' | 'grid';
		heading?: string;
		label?: string;
		children: Snippet;
		aside?: Snippet;
	} = $props();
</script>

<section class="page-section" data-variant={variant}>
	<div class="section-inner">
		{#if label || heading}
			<div class="section-header">
				{#if label}<p class="section-label">{label}</p>{/if}
				{#if heading}<h2 class="section-heading">{@html heading}</h2>{/if}
			</div>
		{/if}

		<div class="section-body">
			<div class="section-main">
				{@render children()}
			</div>
			{#if aside}
				<div class="section-aside">
					{@render aside()}
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	/* ── Base ────────────────────────────────────────────────────────── */
	.page-section {
		width: 100%;
		background: var(--ps-bg, transparent);
		border-top: var(--ps-border-top, none);
		border-bottom: var(--ps-border-bottom, none);
	}

	.section-inner {
		max-width: var(--ps-max-width, 1200px);
		margin: 0 auto;
		padding: var(--ps-padding, 5rem 1.5rem);
	}

	.section-header {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-bottom: 3rem;
		text-align: var(--ps-header-align, left);
		align-items: var(--ps-header-items, flex-start);
	}

	.section-label {
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--accent);
		margin: 0;
	}

	.section-heading {
		font-size: var(--ps-heading-size, clamp(1.5rem, 3.5vw, 2.5rem));
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.15;
		color: var(--text);
		margin: 0;
	}

	.section-body {
		display: flex;
		gap: var(--ps-body-gap, 3rem);
	}

	.section-main {
		flex: 1;
		min-width: 0;
	}

	.section-aside {
		flex: 1;
		min-width: 0;
	}

	/* ── Variant: default ────────────────────────────────────────────── */
	.page-section[data-variant='default'] {
		--ps-header-align: center;
		--ps-header-items: center;
	}

	/* ── Variant: split ──────────────────────────────────────────────── */
	.page-section[data-variant='split'] {
		--ps-padding: 3rem 1.5rem 6rem;
		--ps-body-gap: 4rem;
	}

	.page-section[data-variant='split'] .section-body {
		align-items: center;
	}

	@media (max-width: 900px) {
		.page-section[data-variant='split'] .section-body {
			flex-direction: column;
		}
	}

	/* ── Variant: features ───────────────────────────────────────────── */
	.page-section[data-variant='features'] {
		--ps-padding: 6rem 1.5rem 8rem;
	}

	.page-section[data-variant='features'] .section-main {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		/* gap + background = token-driven border lines between cards */
		gap: 1px;
		background: var(--border);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
	}

	/* CTA card spans full width */
	.page-section[data-variant='features'] .section-main :global(.card[data-variant='feature-cta']) {
		grid-column: span 2;
	}

	@media (max-width: 900px) {
		.page-section[data-variant='features'] .section-main {
			grid-template-columns: 1fr;
		}

		.page-section[data-variant='features']
			.section-main
			:global(.card[data-variant='feature-cta']) {
			grid-column: span 1;
		}
	}

	/* ── Variant: highlight ──────────────────────────────────────────── */
	/* Elevated --mg band, bounded by --border lines */
	.page-section[data-variant='highlight'] {
		--ps-bg: var(--mg);
		--ps-border-top: 1px solid var(--border);
		--ps-border-bottom: 1px solid var(--border);
		--ps-padding: 6rem 1.5rem;
		--ps-header-align: center;
		--ps-header-items: center;
	}

	/* ── Variant: prose ──────────────────────────────────────────────── */
	.page-section[data-variant='prose'] {
		--ps-max-width: 720px;
		--ps-padding: 4rem 1.5rem;
		--ps-heading-size: clamp(1.25rem, 2.5vw, 1.75rem);
	}

	/* ── Variant: wide ───────────────────────────────────────────────── */
	.page-section[data-variant='wide'] {
		--ps-max-width: 100%;
		--ps-padding: 5rem 0;
	}

	/* ── Variant: grid ───────────────────────────────────────────────── */
	.page-section[data-variant='grid'] {
		--ps-header-align: center;
		--ps-header-items: center;
	}

	.page-section[data-variant='grid'] .section-main {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 1.25rem;
	}
</style>
