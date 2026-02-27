<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		brand,
		links,
		cta
	}: {
		brand?: Snippet;
		links?: Snippet;
		cta?: Snippet;
	} = $props();
</script>

<nav class="nav">
	<div class="nav-brand">
		{@render brand?.()}
	</div>
	<div class="nav-links">
		{@render links?.()}
	</div>
	<div class="nav-cta">
		{@render cta?.()}
	</div>
</nav>

<style>
	.nav {
		position: sticky;
		top: 0;
		z-index: 50;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		padding: 0 2.5rem;
		height: 52px;
		border-bottom: 1px solid #0c1420;
		background: rgba(7, 9, 13, 0.88);
		backdrop-filter: blur(16px);
	}

	.nav-brand :global(a),
	.nav-brand {
		display: flex;
		align-items: center;
		gap: 9px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 14px;
		color: #dde4ed;
		text-decoration: none;
	}

	.nav-brand :global(svg) {
		color: #3b7dd8;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
	}

	.nav-links :global(a) {
		font-family: 'JetBrains Mono', monospace;
		font-size: 11px;
		color: #2a3a50;
		text-decoration: none;
		transition: color 0.15s;
		letter-spacing: 0.04em;
	}

	.nav-links :global(a:hover) {
		color: #6a7e96;
	}

	.nav-cta {
		display: flex;
		justify-content: flex-end;
	}

	@media (max-width: 900px) {
		.nav {
			padding: 0 1.5rem;
		}
	}

	@media (max-width: 600px) {
		.nav-links {
			display: none;
		}
	}
</style>
