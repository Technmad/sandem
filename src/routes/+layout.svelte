<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setupConvex } from 'convex-svelte';
	import NavigationBar from '$lib/components/layout/NavigationBar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import SearchBar from '$lib/components/ui/SearchBar.svelte';
	import DropDown from '$lib/components/ui/DropDown.svelte';
	import Search from 'lucide-svelte/icons/search';

	setupConvex(PUBLIC_CONVEX_URL);

	const links = [
		{ path: '/', label: 'home' },
		{ path: '/projects', label: 'repo' },
		{ path: '/dev', label: 'auth' },
		{ path: '/test/ssr', label: 'server test' },
		{ path: '/test/client-only', label: 'client test' },
		{ path: '/test/queries', label: 'query test' }
	];

	let searchValue = $state('');
	let userDropdownOpen = $state(false);

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="container">
	<NavigationBar variant="standard" {links}>
		{#snippet field()}
			<SearchBar
				bind:value={searchValue}
				placeholder="Search..."
				style="flex: 0 1 200px; min-width: 150px;"
			>
				{#snippet icon()}
					<Search size={16} />
				{/snippet}
			</SearchBar>
		{/snippet}

		{#snippet actions()}
			<!-- User menu -->
			<DropDown bind:open={userDropdownOpen}>
				{#snippet trigger()}
					<Avatar
						src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
						alt="User avatar"
						fallback="FX"
						size="sm"
					/>
				{/snippet}
				{#snippet content()}
					<button onclick={() => (userDropdownOpen = false)}>Profile</button>
					<button onclick={() => (userDropdownOpen = false)}>Settings</button>
					<button onclick={() => (userDropdownOpen = false)}>Sign out</button>
				{/snippet}
			</DropDown>

			<!-- Sign in button (if not authenticated) -->
			<Button variant="outline" size="sm">Sign in</Button>
		{/snippet}
	</NavigationBar>

	<main>
		{@render children()}
	</main>
</div>

<style>
	.container {
		/* Navbar row + main content */
		min-height: 100vh;
		display: grid;
		grid-template-areas:
			'navigation'
			'content';
		grid-template-rows: auto 1fr;
	}

	:global(.navbar) {
		grid-area: navigation;
	}

	:global(main) {
		/*
		 * Sits in the second grid row of body (after navbar).
		 * No explicit height — it stretches to fill remaining space.
		 * overflow-x: hidden prevents horizontal scroll from
		 * overflowing sections / hero glows.
		 */
		grid-area: content;

		position: relative;
		overflow-x: hidden;
		width: 100%;
	}
</style>
