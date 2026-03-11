<script lang="ts">
	import '../../app.css';
	import favicon from '$lib/assets/favicon.svg';

	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';
	import NavigationBar from '$lib/components/navbar/NavigationBar.svelte';
	setupConvex(PUBLIC_CONVEX_URL);

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="container">
	<NavigationBar />

	<main>
		{@render children()}
	</main>
</div>

<style>
	.container {
		height: 100dvh;
		overflow: hidden;
		display: grid;
		grid-template-areas:
			'navigation'
			'content';
		grid-template-rows: auto 1fr;

		/*
		 * height: 100% propagates the definite height from body.
		 * grid-template-rows: auto 1fr gives the nav its natural height
		 * and lets main take exactly the remaining space — no more, no less.
		 * overflow: hidden clips anything that escapes (glow halos, etc.)
		 */
	}

	:global(main) {
		grid-area: content;
		min-height: calc(100% - var(--navbar-height));
		position: relative;
		overflow-y: auto;
		overflow-x: hidden;
		width: 100%;

		/*
		 * Sits in the 1fr row — height is now definite (= 100% - navbar).
		 * overflow-y: auto  → normal pages scroll their content here (not body).
		 * overflow-x: hidden → prevents horizontal bleed from hero glows etc.
		 * min-height: 0     → required for nested grids/flex to shrink correctly.
		 * position: relative → stacking context for page-level z-index layers.
		 */
	}

	:global(.navbar) {
		grid-area: navigation;
	}

	:global(.sign-in) {
		width: 4rem;
		height: 2rem;
		padding: 0rem;
		flex-shrink: 0;
	}
</style>
