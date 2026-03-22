<script lang="ts">
	import type { Snippet, Component } from 'svelte';
	import Button from '$lib/components/ui/primitives/Button.svelte';
	import Icon from '$lib/components/ui/primitives/Icon.svelte';

	interface ActionButton {
		id: string;
		title?: string;
		icon?: Component;
		handler?: () => void | Promise<void>;
		disabled?: boolean | (() => boolean);
		isSpacer?: boolean;
	}

	interface Props {
		title: string;
		actions?: Snippet;
		actionButtons?: ActionButton[];
		children: Snippet;
	}

	let { title, actions, actionButtons, children }: Props = $props();
</script>

<section class="activity-panel" aria-label={title}>
	<header class="panel-header">
		<h2 class="panel-title">{title}</h2>

		{#if actions}
			<div class="panel-actions">
				{@render actions()}
			</div>
		{:else if actionButtons}
			<div class="panel-actions">
				{#each actionButtons as btn (btn.id)}
					{#if btn.isSpacer}
						<div class="actions-spacer"></div>
					{:else}
						{@const isDisabled = typeof btn.disabled === 'function' ? btn.disabled() : btn.disabled}
						<Button
							variant="ghost"
							tone="neutral"
							size="icon"
							class="panel-icon-action"
							title={btn.title}
							aria-label={btn.title}
							onclick={btn.handler}
							disabled={isDisabled}
						>
							<Icon icon={btn.icon} size={12} strokeWidth={1.75} />
						</Button>
					{/if}
				{/each}
			</div>
		{/if}
	</header>

	<div class="panel-body">
		{@render children()}
	</div>
</section>

<style>
	.activity-panel {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: color-mix(in srgb, var(--mg) 90%, var(--bg));
		border-right: 1px solid color-mix(in srgb, var(--border) 65%, transparent);
		overflow: hidden;
	}

	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		height: 35px;
		padding: 0 8px 0 12px;
		background: color-mix(in srgb, var(--mg) 86%, var(--bg));
		border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
	}

	.panel-title {
		margin: 0;
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.1em;
		color: color-mix(in srgb, var(--muted) 92%, var(--text));
		text-transform: uppercase;
		line-height: 1;
	}

	.panel-actions {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.panel-body {
		flex: 1;
		min-height: 0;
		overflow: auto;
	}

	:global([data-button-root].panel-icon-action) {
		width: 24px;
		height: 24px;
		padding: 0;
		border-radius: 4px;
		color: color-mix(in srgb, var(--muted) 92%, var(--text));
		transition:
			background 80ms linear,
			color 80ms linear;
	}

	:global([data-button-root].panel-icon-action:hover:not(:disabled)) {
		background: color-mix(in srgb, var(--fg) 74%, var(--bg));
		color: var(--text);
	}

	:global([data-button-root].panel-icon-action:disabled) {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.actions-spacer {
		flex: 1;
	}
</style>
