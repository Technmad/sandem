<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import Dropdown from '$lib/components/ui/DropDown.svelte';
	import Button from '../ui/Button.svelte';
	import DotsThreeIcon from 'phosphor-svelte/lib/DotsThreeIcon';

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

	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		const savedMode = localStorage.getItem('mode') as 'light' | 'dark' | null;
		if (savedTheme && themes.some((t) => t.id === savedTheme)) currentTheme = savedTheme;
		if (savedMode) currentMode = savedMode;

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
	let dropdownItems = $derived(themes.map((t) => ({ label: t.label, value: t.id })));
</script>

{#if children}
	{@render children({ themes, currentTheme, activeTheme, selectTheme })}
{:else}
	<Dropdown label={activeTheme.label} items={dropdownItems} onSelect={selectTheme}>
		<Button variant="outline" style="radius: 2rem" class="trigger">
			<DotsThreeIcon />
		</Button>
	</Dropdown>
{/if}
