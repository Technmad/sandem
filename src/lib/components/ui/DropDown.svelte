<script lang="ts">
	import type { Snippet } from 'svelte';
	import { fly } from 'svelte/transition'; // fly feels more "premium" than fade

	let {
		open = $bindable(false),
		trigger,
		content,
		align = 'start',
		side = 'bottom'
	}: {
		open?: boolean;
		trigger: Snippet;
		content: Snippet;
		align?: 'start' | 'center' | 'end';
		side?: 'top' | 'bottom';
	} = $props();

	let id: string = `dropdown-${Math.random().toString(36).slice(2, 9)}`;
</script>

<div class="dropdown" onmouseleave={() => (open = false)} role="group">
	<button
		id={id + '-trigger'}
		type="button"
		class="trigger-button"
		onclick={() => (open = !open)}
		aria-expanded={open}
		aria-haspopup="menu"
		aria-controls={id + '-menu'}
	>
		{@render trigger()}
		<svg
			class="chevron"
			class:open
			width="12"
			height="12"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
		>
			<path d="M6 9l6 6 6-6" />
		</svg>
	</button>

	{#if open}
		<div
			id={id + '-menu'}
			class="menu"
			data-side={side}
			data-align={align}
			role="menu"
			aria-labelledby={id + '-trigger'}
			transition:fly={{ y: side === 'bottom' ? -8 : 8, duration: 200 }}
		>
			<div class="menu-inner">
				{@render content()}
			</div>
		</div>
	{/if}
</div>

<style>
	.dropdown {
		position: relative;
		display: inline-block;
	}

	.trigger-button {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: var(--bg); /* */
		color: var(--text); /* */
		border: 1px solid var(--border); /* */
		border-radius: var(--radius); /* */
		font-weight: 500;
		cursor: pointer;
		transition: all var(--time) ease; /* */
	}

	.trigger-button:hover {
		background: var(--bg);
		border-color: var(--accent); /* */
	}

	.chevron {
		transition: transform var(--time);
		opacity: 0.6;
	}

	.chevron.open {
		transform: rotate(180deg);
	}

	.menu {
		position: absolute;
		z-index: 50;
		min-width: 200px;
		filter: drop-shadow(var(--shadow-card)); /* */
	}

	.menu-inner {
		background: var(--bg); /* */
		border: 1px solid var(--border); /* */
		border-radius: var(--radius-md); /* Using radius-md for the menu */
		padding: 0.25rem;
		overflow: hidden;
	}

	/* Positioning Logic */
	.menu[data-side='bottom'] {
		top: 100%;
		margin-top: 0.6rem;
	}
	.menu[data-side='top'] {
		bottom: 100%;
		margin-bottom: 0.6rem;
	}

	.menu[data-align='start'] {
		left: 0;
	}
	.menu[data-align='center'] {
		left: 50%;
		transform: translateX(-50%);
	}
	.menu[data-align='end'] {
		right: 0;
	}

	/* Global hint: Target menu items inside {@render content} */
	:global(.menu-inner button, .menu-inner a) {
		display: flex;
		width: 100%;
		padding: 0.6rem 0.8rem;
		font-size: 0.875rem;
		color: var(--text);
		border-radius: var(--radius-sm);
		text-align: left;
		transition: background var(--time);
	}

	:global(.menu-inner button:hover) {
		background: var(--mg);
		color: var(--accent);
	}
</style>
