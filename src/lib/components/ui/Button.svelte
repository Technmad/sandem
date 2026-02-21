<script lang="ts">
	import { Button } from 'bits-ui';
	import type { ComponentProps } from 'svelte';
	type Variant = 'push' | 'pop' | 'outline' | 'ghost' | 'icon';

	let {
		children,
		variant = 'push',
		...attributes
	}: ComponentProps<typeof Button.Root> & { variant?: Variant } = $props();
</script>

<Button.Root data-variant={variant} {...attributes}>
	{@render children?.()}
</Button.Root>

<style>
	:global([data-button-root]) {
		display: inline-flex;
		align-items: center;
		justify-content: center;

		width: auto;
		height: auto;
		padding: 0 1rem;

		border: 1px solid var(--border);
		box-shadow: var(--shadow);
		border-radius: var(--radius);
		cursor: pointer;
	}
	:global([data-button-root]:hover) {
		box-shadow: none;
	}

	:global([data-button-root][data-variant='pop']) {
		background: var(--fg);
	}
	:global([data-button-root][data-variant='pop']):hover {
		background: var(--highlight);
	}

	:global([data-button-root][data-variant='push']) {
		background: var(--fg);
	}
	:global([data-button-root][data-variant='push']:hover) {
		background: var(--mg);
	}

	:global([data-button-root][data-variant='outline']) {
		background: var(--mg);
	}
	:global([data-button-root][data-variant='outline']:hover) {
		background: var(--bg);
		color: var(--muted);
	}

	:global([data-button-root][data-variant='ghost']) {
		background: linear-gradient(0deg, var(--fg) 0%, var(--bg) 100%);
		color: var(--text);
		box-shadow: none;
	}
	:global([data-button-root][data-variant='ghost']:hover) {
		background: var(--accent);
		color: white;
	}
	:global([data-button-root][data-variant='icon']) {
		background: var(--bg);
		border: none;
		box-shadow: none;
	}
	:global([data-button-root][data-variant='icon']:hover) {
		background: var(--mg);
	}
</style>
