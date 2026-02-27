<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, children }: { title: string; children: Snippet } = $props();
</script>

<details class="accordion">
	<summary class="accordion-summary">{title}</summary>
	<div class="accordion-content">
		{@render children()}
	</div>
</details>

<style>
	.accordion {
		border-bottom: 1px solid var(--border);
	}

	.accordion-summary {
		padding: 1rem 0;
		cursor: pointer;
		font-weight: 500;
		color: var(--text);
		list-style: none; /* Hides default arrow in many browsers */
		display: flex;
		justify-content: space-between;
	}

	.accordion-summary::-webkit-details-marker {
		display: none;
	}

	.accordion-content {
		padding-bottom: 1rem;
		color: var(--muted);
		line-height: 1.6;
	}
</style>
