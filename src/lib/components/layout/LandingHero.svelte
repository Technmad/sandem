<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		left,
		right
	}: {
		left: Snippet;
		right: Snippet;
	} = $props();
</script>

<section class="hero">
	<div class="hero-left">
		{@render left()}
	</div>
	<div class="hero-right">
		{@render right()}
	</div>
</section>

<style>
	.hero {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: center;
		max-width: 1140px;
		margin: 0 auto;
		padding: 6rem 2.5rem 5rem;
	}

	.hero-right {
		position: relative;
		animation: fadeUp 0.6s 0.1s ease both;
	}

	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 900px) {
		.hero {
			grid-template-columns: 1fr;
			padding: 4rem 1.5rem 3rem;
			gap: 3rem;
		}
		.hero-right {
			order: -1;
		}
	}
</style>
