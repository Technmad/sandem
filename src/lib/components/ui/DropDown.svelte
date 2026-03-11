<script lang="ts">
	import { DropdownMenu, type WithoutChild } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import Card from './Card.svelte';

	type Props = DropdownMenu.RootProps & {
		label: string;

		items: Array<{ label: string; value: string }>;
		onSelect?: (value: string) => void;
		contentProps?: WithoutChild<DropdownMenu.ContentProps>;
		children: Snippet;
	};

	let {
		open = $bindable(false),
		children,
		items,
		onSelect,
		contentProps,
		...rest
	}: Props = $props();
</script>

<DropdownMenu.Root bind:open {...rest}>
	<DropdownMenu.Trigger>
		{@render children()}
	</DropdownMenu.Trigger>

	<DropdownMenu.Portal>
		<Card>
			<DropdownMenu.Content {...contentProps}>
				<DropdownMenu.Group>
					{#each items as item}
						<DropdownMenu.Item
							textValue={item.value}
							onSelect={() => {
								onSelect?.(item.value);
								open = false;
							}}
							class="item"
						>
							{item.label}
						</DropdownMenu.Item>
					{/each}
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</Card>
	</DropdownMenu.Portal>
</DropdownMenu.Root>
