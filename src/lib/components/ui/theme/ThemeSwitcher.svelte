<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import DropDown from '$lib/components/ui/inputs/DropDown.svelte';
	import { Ellipsis } from '@lucide/svelte';

	const themes = [
		{ id: 'default', label: 'Default', light: 'hsl(0 0% 90%)', dark: 'hsl(0 0% 8%)' },
		{ id: 'abyss', label: 'Abyss', light: 'hsl(215 28% 94%)', dark: 'hsl(222 42% 7%)' },
		{ id: 'forest', label: 'Forest', light: 'hsl(130 28% 91%)', dark: 'hsl(130 38% 8%)' },
		{ id: 'solar', label: 'Solar', light: 'hsl(38 50% 91%)', dark: 'hsl(22 52% 10%)' }
	];

	type Theme = (typeof themes)[0];

	type Props = {
		children?: Snippet<
			[
				{
					themes: Theme[];
					currentTheme: string;
					activeTheme: Theme;
					selectTheme: (id: string) => void;
				}
			]
		>;
	};

	let { children }: Props = $props();

	let currentTheme = $state('default');
	let currentMode = $state<'light' | 'dark'>('dark');
	let open = $state(false);

	onMount(() => {
		currentTheme = document.documentElement.getAttribute('data-theme') ?? 'default';
		currentMode =
			(document.documentElement.getAttribute('data-mode') as 'light' | 'dark') ?? 'dark';

		const observer = new MutationObserver(() => {
			const mode = document.documentElement.getAttribute('data-mode') as 'light' | 'dark' | null;
			if (mode && mode !== currentMode) currentMode = mode;
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-mode']
		});
		return () => observer.disconnect();
	});

	$effect(() => {
		document.documentElement.setAttribute('data-theme', currentTheme);
		localStorage.setItem('theme', currentTheme);
	});

	function selectTheme(id: string) {
		currentTheme = id;
	}

	let activeTheme = $derived(themes.find((t) => t.id === currentTheme)!);
	let dropdownItems = $derived(
		themes.map((t) => ({
			label: `${t.id === currentTheme ? '✓ ' : ''}${t.label}`,
			value: t.id
		}))
	);
</script>

{#if children}
	{@render children({ themes, currentTheme, activeTheme, selectTheme })}
{:else}
	<DropDown
		bind:open
		label="Theme switcher"
		items={dropdownItems}
		variant="ghost"
		tone="neutral"
		onSelect={(value: string) => {
			selectTheme(value);
			open = false;
		}}
	>
		{#snippet children()}
			<Ellipsis size={18} />
		{/snippet}
	</DropDown>
{/if}

<style>
</style>
