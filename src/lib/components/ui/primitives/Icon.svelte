<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		icon?: Component;
		size?: number;
		strokeWidth?: number;
	}

	const { icon: Icon, size = 12, strokeWidth = 1.75 }: Props = $props();
</script>

{#if Icon}
	<Icon {size} {strokeWidth} />
{/if}
