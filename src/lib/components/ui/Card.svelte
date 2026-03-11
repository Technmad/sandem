<script lang="ts">
	import { AspectRatio, type WithoutChildrenOrChild } from 'bits-ui';
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		icon,
		title,
		class: className,
		children,
		alt,
		src,
		ref = $bindable(null),
		imageRef = $bindable(null),
		...rest
	}: WithoutChildrenOrChild<AspectRatio.RootProps> & {
		/**
		 * default
		 * outline
		 * ghost
		 * notched
		 * wide
		 */
		variant?: 'default' | 'outline' | 'ghost' | 'notched' | 'wide';
		icon?: Snippet;
		title?: string;
		class?: string;
		children?: Snippet;
		src?: string;
		alt?: string;
		imageRef?: HTMLImageElement | null;
	} = $props();
</script>

<AspectRatio.Root class="card {className}" data-variant={variant} {...rest} bind:ref>
	{#if icon}
		<div>{@render icon()}</div>
	{/if}

	{#if title}
		<h3>{title}</h3>
	{/if}
	{#if src}
		<img {src} {alt} bind:this={imageRef} />
	{/if}

	{@render children?.()}
</AspectRatio.Root>
