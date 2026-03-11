<script lang="ts">
	import { NavigationMenu, type WithoutChildrenOrChild } from 'bits-ui';

	import Home from 'phosphor-svelte/lib/HouseSimpleIcon';

	import ModeToggle from '$lib/components/colors/ModeToggle.svelte';

	import SearchBar from '../ui/SearchBar.svelte';
	import ThemeSwitcher from '../colors/ThemeSwitcher.svelte';

	import { Menubar } from 'bits-ui';
	import MenuBar from '$lib/components/ui/MenuBar.svelte';

	type Props = WithoutChildrenOrChild<NavigationMenu.RootProps> & {
		variant?: 'default' | 'outline' | 'ghost';
		links?: {
			path: string;
			label: string;
		}[];
		menus?: { title: string; items: { label: string; value: string; onSelect?: () => void }[] }[];
		class?: string;
	};

	let {
		variant = 'default',
		links = [],
		menus = [],
		class: className,
		ref = $bindable(null),
		...rest
	}: Props = $props();
</script>

<NavigationMenu.Root data-variant={variant} class={className} {...rest} bind:ref>
	{#snippet child({ props })}
		<header {...props} class="navbar">
			{#if links.length}
				<NavigationMenu.List>
					{#snippet child({ props })}
						<ul {...props} class="links">
							{#each links as link}
								<NavigationMenu.Item>
									<NavigationMenu.Link href={link.path}>
										{link.label}
									</NavigationMenu.Link>
								</NavigationMenu.Item>
							{/each}
						</ul>
					{/snippet}
				</NavigationMenu.List>
			{/if}

			{#if menus.length}
				<div class="menu">
					<NavigationMenu.Root data-variant={variant} class={className} {...rest} bind:ref>
						<NavigationMenu.List class="nav">
							<NavigationMenu.Item>
								<NavigationMenu.Link href="/" id="home-link">
									<Home />
								</NavigationMenu.Link>
							</NavigationMenu.Item>
						</NavigationMenu.List>
					</NavigationMenu.Root>
					<Menubar.Root>
						{#each menus as { title, items }}
							<MenuBar
								text={title}
								items={items.map((item) => ({
									...item,
									onSelect: () => console.log(`Menu item clicked: ${item.label}`)
								}))}
							/>
						{/each}
					</Menubar.Root>
				</div>
			{/if}

			<!-- Search -->
			<div class="search">
				{@render search()}
			</div>
			<!-- Actions -->
			<div class="actions">
				{@render actions()}
			</div>
			<div class="viewport">
				<NavigationMenu.Viewport />
			</div>
		</header>
	{/snippet}
</NavigationMenu.Root>

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
	.navbar {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
	}

	.links,
	.menu {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-left: 1rem;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-right: 1rem;

		justify-content: end;
	}
</style>
