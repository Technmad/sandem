<script lang="ts">
	import { onMount } from 'svelte';
	import { Sun, Moon } from '@lucide/svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let mode = $state<'light' | 'dark'>();

	onMount(() => {
		// Look for the saved mode, else use system preference
		const savedMode = localStorage.getItem('mode') as 'light' | 'dark' | null;
		mode =
			savedMode ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
	});

	$effect(() => {
		// CHANGE: Bail out if mode hasn't been determined yet
		if (!mode) return;

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
	variant="outline"
	aria-label="Toggle {mode === 'light' ? 'Dark' : 'Light'} Mode"
	class="mode-toggle"
	style="display: inline-flex; place-items: center; padding: 0.5rem; width: 100%; height: 100%"
>
	{#if mode === 'light'}
		<Sun id="mode-toggle-icon" />
	{:else}
		<Moon id="mode-toggle-icon" />
	{/if}
</Button>

<style>
	:global(#mode-toggle-icon) {
		animation: fade-in var(--time) ease-out;
	}

	@keyframes fade-in {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
