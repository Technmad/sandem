<script lang="ts">
<<<<<<< HEAD
	import '../../app.css';
	import favicon from '$lib/assets/favicon.svg';

	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';

	setupConvex(PUBLIC_CONVEX_URL);
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
=======
	import NavigationBar from '$lib/components/layout/NavigationBar.svelte';

	const links = [
		{ path: '/', label: 'home' },
		{ path: '/repo', label: 'repo' },
		{ path: '/shop', label: 'shop' },
		{ path: '/auth', label: 'auth' }
	];

	let { children } = $props();
</script>

<div class="container">
	<NavigationBar {links} />

	<main class="content">
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

	:global(.navbar) {
		grid-area: navigation;
		max-height: var(--navbar-height);
	}

	.content {
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
</style>
>>>>>>> b36b4de6784089e4826b57edc381068bca3fd052
