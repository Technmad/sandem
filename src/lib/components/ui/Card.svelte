<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		icon,
		title,
		pill,
		class: className,
		children,
		...rest
	}: {
		/**
		 * default         — token-based card, hovers up
		 * notched         — thick accent bottom border
		 * flat            — transparent bg, no shadow
		 * create          — create new project card (dashed border, hover elevation)
		 * project         — project card with metadata footer
		 * feature         — dark landing-page feature cell
		 * feature-large   — spans 2 rows in the features grid
		 * feature-cta     — centred call-to-action cell
		 */
		variant?:
			| 'default'
			| 'notched'
			| 'flat'
			| 'create'
			| 'project'
			| 'feature'
			| 'feature-large'
			| 'feature-cta';
		icon?: Snippet;
		title?: string;
		pill?: string;
		class?: string; 
		children?: Snippet;
		[key: string]: any; 
	} = $props();
</script>

<article class="card {className}"  data-variant={variant} {...rest}>
	{#if icon}
		{@render icon?.()}
	{/if}
	{#if title}
		<h3 class="card-title">{title}</h3>
	{/if}
	{@render children?.()}
	{#if pill}
		<div class="card-pill">{pill}</div>
	{/if}
</article>

<style>
	/* ── Base ── */
	.card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 2rem;
		background: var(--fg);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
		transition:
			transform var(--time) var(--ease),
			box-shadow var(--time) var(--ease);
		position: relative;
		overflow: hidden;
	}

	/* ── Variants ── */
	.card[data-variant='default']:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.card[data-variant='notched'] {
		border-bottom: 3px solid var(--accent);
	}

	.card[data-variant='flat'] {
		background: transparent;
		box-shadow: none;
		border-color: transparent;
		padding: 1rem 0;
	}

	/* ── Create Project Card ── */
	.card[data-variant='create'] {
		background: var(--bg);
		border: 2px dashed var(--border);
		box-shadow: none;
		padding: 1.5rem;
		min-height: 180px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		color: var(--muted);
	}

	.card[data-variant='create']:hover {
		border-color: var(--text);
		color: var(--text);
		background: var(--mg);
		transform: none;
	}

	.card[data-variant='create'] :global(svg) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: var(--radius-sm);
		background: var(--fg);
		border: 1px solid var(--border);
		padding: 0.375rem;
		color: var(--accent);
		transition:
			background-color var(--time) var(--ease),
			border-color var(--time) var(--ease);
	}

	.card[data-variant='create']:hover :global(svg) {
		background: var(--highlight);
		border-color: var(--accent);
	}

	.card[data-variant='create'] :global(span) {
		font-size: 0.95rem;
		font-weight: 500;
		line-height: 1.4;
	}

	/* ── Project Card ── */
	.card[data-variant='project'] {
		background: var(--fg);
		border: 1px solid var(--border);
		padding: 1.5rem;
	}

	.card[data-variant='project']:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow);
	}

	/* Project card internal structure */
	.card[data-variant='project'] :global(.project-header) {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.5rem;
		gap: 0.75rem;
	}

	.card[data-variant='project'] :global(.project-icon) {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: var(--radius-sm);
		background: var(--mg);
		color: var(--text);
		flex-shrink: 0;
		border: 1px solid var(--border);
		transition:
			background-color var(--time) var(--ease),
			border-color var(--time) var(--ease);
	}

	.card[data-variant='project']:hover :global(.project-icon) {
		background: var(--fg);
		border-color: var(--accent);
	}

	.card[data-variant='project'] :global(.project-body) {
		margin-bottom: 2rem;
	}

	.card[data-variant='project'] :global(.project-title) {
		font-size: 1.125rem;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--text);
		margin: 0;
		line-height: 1.3;
		word-break: break-word;
	}

	.card[data-variant='project'] :global(.project-footer) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
		gap: 0.5rem;
	}

	.card[data-variant='project'] :global(.project-meta) {
		font-family: var(--fonts-mono);
		font-size: 0.7rem;
		color: var(--muted);
		letter-spacing: 0.02em;
	}

	.card[data-variant='project'] :global(.project-meta.id) {
		font-weight: 500;
	}

	.card[data-variant='project'] :global(.project-meta.time) {
		opacity: 0.75;
	}

	/* ── Feature Cards ── */
	.card[data-variant^='feature'] {
		background: #060810;
		border: none;
		border-radius: 0;
		box-shadow: none;
		padding: 2.5rem;
		transition: background-color 0.2s ease;
	}

	.card[data-variant^='feature']:hover {
		background: #0a0e17;
	}

	.card[data-variant='feature-large'] {
		grid-row: span 2;
	}

	.card[data-variant='feature-cta'] {
		align-items: center;
		justify-content: center;
		text-align: center;
		gap: 14px;
	}
	.card[data-variant='feature-cta']:hover {
		background: #060810;
		transform: none;
		box-shadow: none;
	}

	/* ── Shared feature sub-elements ── */

	.card-title {
		font-family: 'Syne', sans-serif;
		font-weight: 600;
		font-size: 1rem;
		color: #c0cad6;
		letter-spacing: -0.02em;
		margin: 0;
	}

	/* Prose inside feature cards */
	.card[data-variant^='feature'] :global(p) {
		font-size: 0.83rem;
		color: #2a3a50;
		line-height: 1.7;
		margin: 0;
	}

	.card[data-variant^='feature'] :global(code) {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		background: #0a1020;
		border: 1px solid #0e1521;
		border-radius: 4px;
		padding: 1px 5px;
		color: #5a9af0;
	}

	/* Feature Pills */
	.card-pill {
		position: absolute;
		top: 2rem;
		right: 2.5rem;
		font-size: 0.65rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: #3b7dd8;
		background: rgba(59, 125, 216, 0.1);
		border: 1px solid rgba(59, 125, 216, 0.2);
		padding: 2px 8px;
		border-radius: 12px;
	}
</style>
