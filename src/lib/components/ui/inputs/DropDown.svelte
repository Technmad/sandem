<script lang="ts">
	import { DropdownMenu, type WithoutChild } from 'bits-ui';
	import type { Snippet } from 'svelte';
	import type { Tone, Variant } from '$types/ui';
	import { toneMap } from '$types/ui';

	type MenuItem = { label: string; value: string };
	type MenuGroup = {
		heading?: string;
		ariaLabel?: string;
		items: MenuItem[];
	};

	type Props = DropdownMenu.RootProps & {
		label: string;

		items?: MenuItem[];
		groups?: MenuGroup[];
		variant?: Variant;
		tone?: Tone;
		onSelect?: (value: string) => void;
		contentProps?: WithoutChild<DropdownMenu.ContentProps>;
		children: Snippet;
	};

	let {
		open = $bindable(false),
		label,
		children,
		items = [],
		groups,
		variant = 'default',
		tone = 'neutral',
		onSelect,
		contentProps,
		...rest
	}: Props = $props();

	let resolvedGroups = $derived(
		groups && groups.length > 0
			? groups
			: items.length > 0
				? [{ heading: label, ariaLabel: label.toLowerCase(), items }]
				: []
	);
</script>

<div class="dropdown-shell">
	<DropdownMenu.Root bind:open {...rest}>
		<DropdownMenu.Trigger
			class="dropdown-trigger"
			data-variant={variant}
			data-tone={tone}
			aria-label={label}
			style={`--dropdown-tone: ${toneMap[tone]};`}
		>
			{@render children()}
		</DropdownMenu.Trigger>

		<DropdownMenu.Portal>
			<DropdownMenu.Content
				{...contentProps}
				class="dropdown-content"
				data-variant={variant}
				style={`--dropdown-tone: ${toneMap[tone]};`}
			>
				{#each resolvedGroups as group}
					<DropdownMenu.Group aria-label={group.ariaLabel}>
						{#if group.heading}
							<DropdownMenu.GroupHeading class="group-heading"
								>{group.heading}</DropdownMenu.GroupHeading
							>
						{/if}
						{#each group.items as item}
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
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Portal>
	</DropdownMenu.Root>
</div>

<style>
	.dropdown-shell :global(.dropdown-trigger) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.5rem;
		border: 1px solid transparent;
		font-family: inherit;
		font-weight: 500;
		font-size: 0.84rem;
		padding: 0.45rem 0.8rem;
		cursor: pointer;
		transition:
			background-color var(--time) var(--ease),
			border-color var(--time) var(--ease),
			color var(--time) var(--ease);
	}

	.dropdown-shell :global(.dropdown-trigger[data-variant='default']) {
		background: color-mix(in srgb, var(--dropdown-tone) 8%, var(--fg));
		color: color-mix(in srgb, var(--dropdown-tone) 45%, var(--text));
		border-color: color-mix(in srgb, var(--dropdown-tone) 24%, var(--border));
	}

	.dropdown-shell :global(.dropdown-trigger[data-variant='default']:hover) {
		color: color-mix(in srgb, var(--dropdown-tone) 62%, var(--text));
		background: color-mix(in srgb, var(--dropdown-tone) 15%, var(--fg));
	}

	.dropdown-shell :global(.dropdown-trigger[data-variant='outline']) {
		background: transparent;
		border-color: var(--border);
		color: color-mix(in srgb, var(--dropdown-tone) 50%, var(--text));
	}

	.dropdown-shell :global(.dropdown-trigger[data-variant='outline']:hover) {
		background: color-mix(in srgb, var(--dropdown-tone) 10%, var(--fg));
	}

	.dropdown-shell :global(.dropdown-trigger[data-variant='ghost']) {
		background: transparent;
		color: var(--muted);
	}

	.dropdown-shell :global(.dropdown-trigger[data-variant='ghost']:hover) {
		background: color-mix(in srgb, var(--dropdown-tone) 8%, transparent);
		color: color-mix(in srgb, var(--dropdown-tone) 55%, var(--text));
	}

	.dropdown-shell :global(.dropdown-content) {
		min-width: 170px;
		padding: 0.3rem;
		background: var(--fg);
		border: 1px solid var(--border);
		border-radius: 0.65rem;
		box-shadow: var(--shadow);
		z-index: 300;
	}

	.dropdown-shell :global(.item) {
		display: flex;
		align-items: center;
		padding: 0.45rem 0.6rem;
		border-radius: 0.45rem;
		font-size: 0.82rem;
		cursor: pointer;
		color: var(--muted);
	}

	.dropdown-shell :global(.item[data-highlighted]) {
		background: color-mix(in srgb, var(--dropdown-tone) 10%, var(--mg));
		color: color-mix(in srgb, var(--dropdown-tone) 70%, var(--text));
	}

	.dropdown-shell :global(.group-heading) {
		padding: 0.2rem 0.6rem 0.35rem;
		font-size: 0.64rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
		font-weight: 700;
	}
</style>
