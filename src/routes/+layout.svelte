<script lang="ts">
	import '../app.css';

	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import ModeToggle from '$lib/components/ModeToggle.svelte';

	let { children } = $props();

	const pages = [
		{ path: '/', label: 'home' },
		{ path: '/code', label: 'code' },
		{ path: '/dev', label: 'dev' },
		{ path: '/test/ssr', label: 'ssr' },
		{ path: '/test/client-only', label: 'client' },
		{ path: '/test/queries', label: 'queries' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{#snippet navigation(link: { path: string; label: string })}
	<li>
		<a href={link.path} class=" {page.url.pathname === link.path ? 'on_it' : 'not_on'}">
			<span>{link.label}</span>
		</a>
	</li>
{/snippet}

<!-- html -->

<header>
	<nav>
		<ul>
			{#each pages as link}
				{@render navigation(link)}
			{/each}
		</ul>
	</nav>
	<div class="button-group" role="group" aria-label="User Button Group">
		<ModeToggle />
	</div>
</header>

<hr />

<main>
	{@render children()}
</main>

<!-- /html -->

<style>
	header {
		display: grid;
		grid-template-columns: auto 4rem;
	}
	nav,
	ul {
		display: flex;
		height: 4rem;
	}
	ul {
		display: grid;
		grid-template-columns: repeat(6, 4rem);
		justify-items: center;
		align-items: center;

		padding: 0 1rem;
		gap: 1rem;

		cursor: pointer;
	}

	.on_it {
		color: var(--accent);
		font-weight: bold;
		text-decoration: underline;
		text-underline-offset: 4px;
	}

	.not_on {
		color: var(--text);
		opacity: 0.7;
	}

	main {
		height: calc(100vh - 4rem);
	}
	hr {
		display: none;
	}
</style>
