<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';

	// register the URL with the Convex Svelte helper
	setupConvex(PUBLIC_CONVEX_URL);

	import NavigationBar from '$lib/components/layout/NavigationBar.svelte';

	const links = [
		{ path: '/', label: 'Home' },
		{ path: '/projects', label: 'Repo' },
		{ path: '/dev', label: 'Dev' },
		{ path: '/test/ssr', label: 'SSR Test' },
		{ path: '/test/client-only', label: 'Client Test' },
		{ path: '/test/queries', label: 'Queries Test' }
	];

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<NavigationBar variant={'standard'} {links} />
{@render children()}
