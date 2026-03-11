<script lang="ts">
	import { Menubar, type WithoutChildrenOrChild } from 'bits-ui';

	type Props = WithoutChildrenOrChild<Menubar.MenuProps> & {
		text: string;
		items: { label: string; value: string; onSelect?: () => void }[];
		content?: WithoutChildrenOrChild<Menubar.ContentProps>;
	};

	let { text, items, content, ...rest }: Props = $props();
</script>

<Menubar.Menu {...rest}>
	<Menubar.Trigger class="menubar-trigger">
		{text}
	</Menubar.Trigger>
	<Menubar.Content class="menubar-content" {...content}>
		<Menubar.Group class="menubar-group" aria-label={text}>
			{#each items as item}
				<Menubar.Item
					class="menubar-item"
					textValue={item.label}
					onSelect={() => {
						console.log(`MenuItem selected: ${item.label} (${item.value})`);
						item.onSelect?.();
					}}
				>
					{item.label}
				</Menubar.Item>
			{/each}
		</Menubar.Group>
	</Menubar.Content>
</Menubar.Menu>

<style>
	:global(.menubar-trigger) {
		display: inline-flex;
		align-items: center;
		padding: 0.3rem 0.65rem;
		font-family: inherit;
		font-size: 0.82rem;
		font-weight: 500;
		color: var(--muted);
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		cursor: pointer;
		user-select: none;
		outline: none;
		transition:
			background-color var(--time) var(--ease),
			border-color var(--time) var(--ease),
			color var(--time) var(--ease);
	}

	:global(.menubar-trigger:hover) {
		color: var(--text);
		background: var(--fg);
	}

	:global(.menubar-trigger[data-state='open']) {
		color: var(--text);
		background: var(--fg);
		border-color: var(--border);
	}

	:global(.menubar-trigger[data-highlighted]) {
		color: var(--text);
		background: var(--fg);
	}

	/* ── Dropdown panel ───────────────────────────────── */
	:global(.menubar-content) {
		min-width: 152px;
		background: var(--fg);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow);
		padding: 0.375rem;
		display: flex;
		flex-direction: column;
		gap: 1px;
		z-index: 200;
		animation: menubar-in var(--time) var(--ease-out) both;
	}

	:global(.menubar-content[data-state='closed']) {
		animation: menubar-out var(--time) var(--ease) both;
	}

	:global(.menubar-group) {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	/* ── Items ────────────────────────────────────────── */
	:global(.menubar-item) {
		display: flex;
		align-items: center;
		padding: 0.45rem 0.6rem;
		border-radius: var(--radius-sm);
		font-size: 0.82rem;
		font-family: inherit;
		color: var(--muted);
		background: transparent;
		border: none;
		cursor: pointer;
		user-select: none;
		outline: none;
		transition:
			background-color var(--time) var(--ease),
			color var(--time) var(--ease);
	}

	:global(.menubar-item[data-highlighted]) {
		background: var(--mg);
		color: var(--text);
	}

	:global(.menubar-item[data-disabled]) {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* ── Animations ───────────────────────────────────── */
	@keyframes menubar-in {
		from {
			opacity: 0;
			transform: translateY(-4px) scale(0.97);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes menubar-out {
		from {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
		to {
			opacity: 0;
			transform: translateY(-4px) scale(0.97);
		}
	}
</style>
