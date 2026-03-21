<script lang="ts">
	import { AspectRatio, type WithoutChildrenOrChild } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { Tone, Variant } from '$types/ui';

	type CardVariant = Extract<Variant, 'default' | 'outline' | 'ghost' | 'notched' | 'wide'>;

	const toneMap: Record<Tone, string> = {
		neutral: 'var(--muted)',
		accent: 'var(--accent)',
		success: 'var(--success)',
		warning: 'var(--warning)',
		info: 'var(--info)',
		danger: 'var(--error)'
	};

	let {
		variant = 'default',
		tone = 'neutral',
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
		variant?: CardVariant;
		tone?: Tone;
		icon?: Snippet;
		title?: string;
		class?: string;
		children?: Snippet;
		src?: string;
		alt?: string;
		imageRef?: HTMLImageElement | null;
	} = $props();
</script>

<div class="card-shell">
	<AspectRatio.Root
		class="card {className}"
		data-variant={variant}
		data-tone={tone}
		style={`--card-tone: ${toneMap[tone]};`}
		{...rest}
		bind:ref
	>
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
</div>

<style>
	.card-shell :global(.card) {
		display: flex;
		flex-direction: column;
		gap: 0.65rem;
		padding: 0.9rem;
		border-radius: 0.8rem;
		border: 1px solid transparent;
		background: var(--fg);
		color: var(--text);
		box-shadow: var(--shadow);
	}

	.card-shell :global(.card h3) {
		font-size: 0.92rem;
		font-weight: 600;
	}

	.card-shell :global(.card img) {
		border-radius: 0.5rem;
		border: 1px solid var(--border);
	}

	.card-shell :global(.card[data-variant='default']) {
		background: color-mix(in srgb, var(--card-tone) 6%, var(--fg));
		border-color: color-mix(in srgb, var(--card-tone) 24%, var(--border));
	}

	.card-shell :global(.card[data-variant='outline']) {
		background: transparent;
		border-color: color-mix(in srgb, var(--card-tone) 32%, var(--border));
	}

	.card-shell :global(.card[data-variant='ghost']) {
		background: transparent;
		border-color: transparent;
		box-shadow: none;
	}

	.card-shell :global(.card[data-variant='notched']) {
		border-color: color-mix(in srgb, var(--card-tone) 35%, var(--border));
		border-radius: 0;
		clip-path: polygon(
			12px 0,
			100% 0,
			100% calc(100% - 12px),
			calc(100% - 12px) 100%,
			0 100%,
			0 12px
		);
	}

	.card-shell :global(.card[data-variant='wide']) {
		padding: 1.1rem 1.35rem;
	}
</style>
