<script lang="ts">
	import { NavigationMenu } from 'bits-ui';
	import type { NavigationMenuRootProps } from 'bits-ui';
	import { Menubar } from 'bits-ui';
	import MenuBar from '$lib/components/ui/MenuBar.svelte';
	import ModeToggle from '$lib/components/colors/ModeToggle.svelte';
	import Home from '@lucide/svelte/icons/home';
	import SearchBar from '../ui/SearchBar.svelte';
	import ThemeSwitcher from '../colors/ThemeSwitcher.svelte';
	import favicon from '$lib/assets/favicon.svg';

	type Props = NavigationMenuRootProps & {
		variant?: 'default' | 'outline' | 'ghost';
	};

	let { variant = 'default' }: Props = $props();

	const links = [{ path: '/repo', label: 'repo' }];

	const file = [
		{ label: 'Michael Scott', value: 'michael' },
		{ label: 'Dwight Schrute', value: 'dwight' },
		{ label: 'Jim Halpert', value: 'jim' },
		{ label: 'Stanley Hudson', value: 'stanley' },
		{ label: 'Phyllis Vance', value: 'phyllis' },
		{ label: 'Pam Beesly', value: 'pam' },
		{ label: 'Andy Bernard', value: 'andy' }
	];

	const edit = [
		{ label: 'Toby Flenderson', value: 'toby' },
		{ label: 'Holly Flax', value: 'holly' },
		{ label: 'Jan Levinson', value: 'jan' }
	];

	const selection = [
		{ label: 'Angela Martin', value: 'angela' },
		{ label: 'Kevin Malone', value: 'kevin' },
		{ label: 'Oscar Martinez', value: 'oscar' }
	];

	const menus = [
		{ title: 'File', items: file },
		{ title: 'Edit', items: edit },
		{ title: 'Selection', items: selection }
	];
</script>

<NavigationMenu.Root data-variant={variant} class="navbar">
	<!-- Links -->
	{@render nav()}

	<!-- Menu -->
	{@render menu()}

	<!-- Search -->
	{@render search()}

	<!-- Actions -->
	{@render actions()}

	<!--
		Viewport: the bits-ui prescribed portal for NavigationMenu.Content.
		Placed inside Root so pointer events stay continuous — no gap between
		trigger and content that would cause the menu to close prematurely.
		The wrapper uses perspective for a subtle 3-D scale-in effect.
	-->
	<div class="viewport-wrapper">
		<NavigationMenu.Viewport />
	</div>
</NavigationMenu.Root>

{#snippet nav()}
	<NavigationMenu.List class="navbar-list">
		<NavigationMenu.Item>
			<NavigationMenu.Trigger>
				<Home size={16} /> 
			</NavigationMenu.Trigger>

			<!--
				Content sits at position:absolute top:0 left:0 inside the Viewport.
				data-motion attributes are added by bits-ui automatically and drive
				the directional slide-in/out animations below.
			-->
			<NavigationMenu.Content>
				<div class="content">
					<NavigationMenu.Link href="/" class="nav-featured">
						<article>
							<img src={favicon} alt="svelte" />
							<span class="nav-featured-title">Home</span>
						</article>
					</NavigationMenu.Link>
					<ul>
						{#each links as link}
							<li>
								<NavigationMenu.Link href={link.path} class="nav-link-item">
									{link.label}
								</NavigationMenu.Link>
							</li>
						{/each}
					</ul>
				</div>
			</NavigationMenu.Content>
		</NavigationMenu.Item>
	</NavigationMenu.List>
{/snippet}

{#snippet menu()}
	<Menubar.Root class="menu-bar">
		{#each menus as { title, items }}
			<MenuBar triggerText={title} {items} />
		{/each}
	</Menubar.Root>
{/snippet}

{#snippet search()}
	<SearchBar value={''} placeholder="...search" class="search-bar" />
{/snippet}

{#snippet actions()}
	<div class="actions">
		<ModeToggle />
		<ThemeSwitcher />
	</div>
{/snippet}

<style>
	/* app.css resets already handle: list-style, margin, padding, border: none,
	   cursor: pointer, text-decoration, color: inherit, outline: none,
	   focus-visible ring, and button/a transitions. */

	:global(.navbar) {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		height: var(--navbar-height);
		padding: 0 1rem;
		background: var(--fg);
		border-bottom: 1px solid var(--border);
	}

	:global(.navbar-list),
	:global(.menu-bar) {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	:global([data-navigation-menu-trigger]) {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		height: 2rem;
		padding: 0 0.625rem;
		border-radius: var(--radius-sm);
		font-size: 0.875rem;
		font-weight: 500;
	}

	:global([data-navigation-menu-trigger]:hover),
	:global([data-navigation-menu-trigger][data-state='open']) {
		background: var(--mg);
	}

	/* Viewport: flush to navbar bottom, no gap */
	.viewport-wrapper {
		perspective: 2000px;
		position: absolute;
		top: 100%;
		left: 0;
		width: 20rem;
		z-index: 50;
	}

	:global([data-navigation-menu-viewport]) {
		position: relative;
		width: 100%;
		height: var(--bits-navigation-menu-viewport-height);
		background: var(--fg);
		border: 1px solid var(--border);
		border-top: none;
		border-radius: 0 0 var(--radius-sm) var(--radius-sm);
		box-shadow: var(--shadow);
		overflow: hidden;
		transform-origin: top center;
		transition: height var(--time) var(--ease);
	}

	:global([data-navigation-menu-viewport][data-state='open']) {
		animation: viewport-in var(--time) var(--ease) forwards;
	}
	:global([data-navigation-menu-viewport][data-state='closed']) {
		animation: viewport-out var(--time) var(--ease) forwards;
	}

	@keyframes viewport-in {
		from {
			opacity: 0;
			transform: scaleY(0.95);
		}
		to {
			opacity: 1;
			transform: scaleY(1);
		}
	}
	@keyframes viewport-out {
		from {
			opacity: 1;
			transform: scaleY(1);
		}
		to {
			opacity: 0;
			transform: scaleY(0.95);
		}
	}

	/* Content: absolute inside viewport for directional slide animations */
	:global([data-navigation-menu-content]) {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
	}
	.content {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		padding: 1rem;
	}

	:global([data-navigation-menu-link]) {
		display: block;
		border-radius: var(--radius-sm);
		transition: background var(--time) var(--ease);
	}
	:global([data-navigation-menu-link]:hover) {
		background: var(--mg);
	}
	:global([data-navigation-menu-link][data-active]) {
		font-weight: 600;
		color: var(--accent);
	}

	:global(.search-bar) {
		flex: 1;
		max-width: 300px;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-left: auto;
	}
</style>
