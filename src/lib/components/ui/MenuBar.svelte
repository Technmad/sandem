<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		role = 'toolbar',
		ariaLabel = '',
		children,
		actions,
		legend,
		gap = '0.5rem',
		padding = '1rem',
		background = 'transparent'
	}: {
		role?: string;
		ariaLabel?: string;
		children?: Snippet;
		actions?: Snippet;
		legend?: Snippet;
		gap?: string;
		padding?: string;
		background?: string;
	} = $props();
</script>

<menu
	class="menubar"
	{role}
	aria-label={ariaLabel}
	style:--gap={gap}
	style:--padding={padding}
	style:--bg={background}
>
	{#if legend}
		<div class="legend">{@render legend()}</div>
	{/if}

	<li class="content">
		{@render children?.()}
	</li>

	{#if actions}
		<li class="actions">
			{@render actions()}
		</li>
	{/if}
</menu>

<style>
	menu {
		display: flex;
		align-items: center;
		gap: var(--gap);
		padding: var(--padding);
		background: var(--bg);
		width: 100%;
		/* Variable for children to inherit */
		--icon-color: var(--muted);
	}

	li {
		display: flex;
		align-items: center;
		gap: var(--gap);
	}

	.actions {
		margin-left: auto;
	}

	.legend {
		margin-right: 1rem;
		font-weight: 600;
	}
</style>
