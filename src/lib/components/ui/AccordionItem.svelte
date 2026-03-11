<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Accordion, type WithoutChildrenOrChild } from 'bits-ui';

	type Props = WithoutChildrenOrChild<Accordion.ItemProps> & {
		title: string;
		children: Snippet;
	};

	let { title, children, ...rest }: Props = $props();
</script>

<Accordion.Item {...rest}>
	<Accordion.Header>
		<summary class="accordion-summary">
			<Accordion.Trigger>{title}</Accordion.Trigger>
		</summary>
	</Accordion.Header>
	<Accordion.Content>
		{@render children()}
	</Accordion.Content>
</Accordion.Item>

<style>
	summary {
		padding: 1rem 0;
		cursor: pointer;
		font-weight: 500;
		color: var(--text);
		list-style: none; /* Hides default arrow in many browsers */
		display: flex;
		justify-content: space-between;
	}

	summary::-webkit-details-marker {
		display: none;
	}
</style>
