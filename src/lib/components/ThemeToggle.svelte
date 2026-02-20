<script lang="ts">
	import { onMount } from 'svelte';

	let currentTheme = $state('default');
	const themes = ['default', 'forest', 'solar', 'ocean'];

	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme && themes.includes(savedTheme)) {
			currentTheme = savedTheme;
		} else {
			// Set initial state on mount
			document.documentElement.setAttribute('data-theme', currentTheme);
		}
	});

	$effect(() => {
		document.documentElement.setAttribute('data-theme', currentTheme);
		localStorage.setItem('theme', currentTheme);
	});
</script>

<select bind:value={currentTheme} class="theme-select">
	{#each themes as theme}
		<option value={theme}>{theme.charAt(0).toUpperCase() + theme.slice(1)}</option>
	{/each}
</select>

<style>
	.theme-select {
		padding: 0.5rem;
		border-radius: 6px;
		border: 1px solid var(--border);
		background-color: var(--mg);
		color: var(--text);
		cursor: pointer;
	}
</style>
