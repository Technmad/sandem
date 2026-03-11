<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		variant = 'default',
		heading,
		children,
		aside
	}: {
		/**
		 * default   — centered header, standard padding
		 * split     — two-column, main + aside
		 * wide      — full-bleed, no max-width
		 * grid      — auto-fit card grid, centered header
		 */
		variant?: 'default' | 'split' | 'wide' | 'grid';
		heading?: string;
		label?: string;
		children: Snippet;
		aside?: Snippet;
	} = $props();
</script>

<section data-variant={variant}>
	<main>
		{#if heading}<h2 class="section-heading">{@html heading}</h2>{/if}

		<article>
			{@render children()}
			{#if aside}
				<aside>
					{@render aside()}
				</aside>
			{/if}
		</article>
	</main>
</section>
