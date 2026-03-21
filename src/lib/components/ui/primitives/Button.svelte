<script lang="ts">
	import { Button } from 'bits-ui';
	import type { ButtonRootProps } from 'bits-ui';
	import type { Tone, Variant } from '$types/ui';

	type ButtonVariant = Extract<Variant, 'default' | 'outline' | 'ghost' | 'link' | 'delete'>;

	type Size = 'sm' | 'md' | 'lg' | 'icon';

	type Justify = 'start' | 'center' | 'end';

	type Align = 'start' | 'center' | 'end';

	type Props = ButtonRootProps & {
		variant?: ButtonVariant;
		tone?: Tone;
		size?: Size;
		justify?: Justify;
		align?: Align;
	};

	const toneMap: Record<Tone, string> = {
		neutral: 'var(--muted)',
		accent: 'var(--accent)',
		success: 'var(--success)',
		warning: 'var(--warning)',
		info: 'var(--info)',
		danger: 'var(--error)'
	};

	let {
		variant = 'default',
		tone = 'neutral',
		size = 'md',
		justify = 'center',
		align = 'center',
		children,
		...rest
	}: Props = $props();
</script>

<div class="button-shell">
	<Button.Root
		data-variant={variant}
		data-tone={tone}
		data-size={size}
		data-justify={justify}
		data-align={align}
		style={`--btn-tone: ${toneMap[tone]};`}
		{...rest}
	>
		{@render children?.()}
	</Button.Root>
</div>

<style>
	.button-shell :global([data-button-root]) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: inherit;
		font-weight: 500;
		font-size: 0.84rem;
		padding: 0.45rem 0.8rem;
		border-radius: 0.55rem;
		border: 1px solid transparent;
		cursor: pointer;
		transition:
			background-color var(--time) var(--ease),
			border-color var(--time) var(--ease),
			color var(--time) var(--ease),
			opacity var(--time) var(--ease);
	}

	.button-shell :global([data-button-root][data-size='sm']) {
		padding: 0.3rem 0.6rem;
		font-size: 0.78rem;
	}

	.button-shell :global([data-button-root][data-size='lg']) {
		padding: 0.6rem 1rem;
		font-size: 0.9rem;
	}

	.button-shell :global([data-button-root][data-size='icon']) {
		width: 2rem;
		height: 2rem;
		padding: 0;
	}

	.button-shell :global([data-button-root][data-justify='start']) {
		justify-content: flex-start;
	}

	.button-shell :global([data-button-root][data-justify='end']) {
		justify-content: flex-end;
	}

	.button-shell :global([data-button-root][data-align='start']) {
		align-items: flex-start;
	}

	.button-shell :global([data-button-root][data-align='end']) {
		align-items: flex-end;
	}

	.button-shell :global([data-button-root][data-variant='default']) {
		background: color-mix(in srgb, var(--btn-tone) 8%, var(--fg));
		color: color-mix(in srgb, var(--btn-tone) 45%, var(--text));
		border-color: color-mix(in srgb, var(--btn-tone) 24%, var(--border));
	}

	.button-shell :global([data-button-root][data-variant='default']:hover) {
		color: color-mix(in srgb, var(--btn-tone) 62%, var(--text));
		background: color-mix(in srgb, var(--btn-tone) 15%, var(--fg));
	}

	.button-shell :global([data-button-root][data-variant='outline']) {
		background: transparent;
		color: color-mix(in srgb, var(--btn-tone) 50%, var(--text));
		border-color: color-mix(in srgb, var(--btn-tone) 35%, var(--border));
	}

	.button-shell :global([data-button-root][data-variant='outline']:hover) {
		background: color-mix(in srgb, var(--btn-tone) 10%, var(--fg));
	}

	.button-shell :global([data-button-root][data-variant='ghost']) {
		background: transparent;
		color: color-mix(in srgb, var(--btn-tone) 38%, var(--muted));
	}

	.button-shell :global([data-button-root][data-variant='ghost']:hover) {
		background: color-mix(in srgb, var(--btn-tone) 8%, transparent);
		color: color-mix(in srgb, var(--btn-tone) 55%, var(--text));
	}

	.button-shell :global([data-button-root][data-variant='link']) {
		background: transparent;
		color: var(--btn-tone);
		border-color: transparent;
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.button-shell :global([data-button-root][data-variant='link']:hover) {
		opacity: 0.8;
	}

	.button-shell :global([data-button-root][data-variant='delete']) {
		background: transparent;
		color: var(--error);
		border-color: transparent;
	}

	.button-shell :global([data-button-root][data-variant='delete']:hover) {
		background: color-mix(in srgb, var(--error) 12%, transparent);
		border-color: color-mix(in srgb, var(--error) 30%, transparent);
	}

	.button-shell :global([data-button-root]:disabled),
	.button-shell :global([data-button-root][aria-disabled='true']) {
		opacity: 0.4;
		cursor: not-allowed;
		pointer-events: none;
	}

	.button-shell :global([data-button-root][data-variant='ghost'][aria-current='page']) {
		color: var(--text);
		background: var(--bg);
	}
</style>
