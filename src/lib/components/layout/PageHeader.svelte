<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		badge,
		redirect,
		heading,
		subtitle,
		children
	}: {
		variant?: 'default' | 'hero';
		badge?: Snippet;
		redirect?: Snippet;
		heading?: string;
		subtitle?: string;
		children?: Snippet;
	} = $props();
</script>

<header data-variant={variant}>
	{#if badge}
		<div class="badge">{@render badge()}</div>
	{/if}

	{#if heading}
		<h1 class="heading">{heading}</h1>
	{/if}

	{#if subtitle}
		<p class="subtitle">{subtitle}</p>
	{/if}

	{#if redirect}
		<nav class="redirect">
			{@render redirect()}
		</nav>
	{/if}

	{#if children}
		<main class="actions">
			{@render children()}
		</main>
	{/if}
</header>

<style>
	/* ── Base ────────────────────────────────────────────────────────── */
	header {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		margin: 0 auto;
		overflow: hidden;
		gap: var(--ph-gap, 1.25rem);
		padding: var(--ph-padding, 5rem 1.5rem 4rem);
		max-width: var(--ph-max-width, 720px);
	}

	.heading {
		margin: 0;
		color: var(--text);
		line-height: 1.1;
		font-weight: 700;
		font-size: var(--ph-heading-size, clamp(1.75rem, 4vw, 2.75rem));
	}

	.subtitle {
		margin: 0;
		color: var(--muted);
		line-height: 1.6;
		font-size: var(--ph-subtitle-size, 1rem);
		max-width: var(--ph-subtitle-width, 52ch);
	}

	/* ── Shared badge base ───────────────────────────────────────────── */
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.35rem 0.75rem;
		border-radius: 999px;
		border: 1px solid var(--border);
		background: var(--fg);
		color: var(--ph-badge-color, var(--muted));
		font-size: var(--ph-badge-size, 0.75rem);
		font-weight: var(--ph-badge-weight, 500);
		letter-spacing: var(--ph-badge-tracking, 0.03em);
	}

	.redirect {
		display: flex;
		align-items: center;
		gap: var(--ph-redirect-gap, 0.5rem);
		flex-wrap: wrap;
		justify-content: center;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		justify-content: center;
	}

	/* ── Variant: hero ───────────────────────────────────────────────── */
	header[data-variant='hero'] {
		--ph-gap: 2rem;
		--ph-padding: 9rem 1.5rem 7rem;
		--ph-max-width: 860px;
		--ph-heading-size: clamp(3rem, 9vw, 5.5rem);
		--ph-subtitle-size: 1.125rem;
		--ph-subtitle-width: 56ch;
		--ph-redirect-gap: 1rem;
		--ph-badge-color: var(--accent);
		--ph-badge-size: 0.7rem;
		--ph-badge-weight: 600;
		--ph-badge-tracking: 0.08em;
	}

	/* Lift all children above the glow layer */
	header[data-variant='hero'] > * {
		position: relative;
		z-index: 1;
	}

	header[data-variant='hero'] .badge {
		background-image: linear-gradient(135deg, var(--glint) 0%, transparent 100%);
		text-transform: uppercase;
		box-shadow: var(--shadow);
	}

	header[data-variant='hero'] .heading {
		font-weight: 800;
		letter-spacing: -0.04em;
		background: linear-gradient(160deg, var(--text) 30%, var(--accent) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	header[data-variant='hero'] .actions {
		margin-top: 0.5rem;
	}
</style>
