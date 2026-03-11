<script lang="ts">
	import { onMount } from 'svelte';
	import { SunIcon, MoonIcon } from 'phosphor-svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let mode = $state<'light' | 'dark'>('dark');

	onMount(() => {
		const savedMode = localStorage.getItem('mode') as 'light' | 'dark';
		if (savedMode) mode = savedMode;
	});

	$effect(() => {
		const root = document.documentElement;
		root.setAttribute('data-mode', mode);
		root.classList.toggle('dark', mode === 'dark');
		root.style.colorScheme = mode;
		localStorage.setItem('mode', mode);
	});

	function toggle() {
		mode = mode === 'light' ? 'dark' : 'light';
	}
</script>

<Button
	onclick={toggle}
	variant="ghost"
	aria-label="Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode"
	class="mode-toggle"
>
	{#if mode === 'light'}
		<SunIcon size={18} />
	{:else}
		<MoonIcon size={18} />
	{/if}
</Button>

<style>
	:global(.mode-toggle) {
		width: auto;
		height: auto;
		padding: 0.25rem;
	}
</style>
