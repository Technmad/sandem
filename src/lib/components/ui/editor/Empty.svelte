<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { toPlatformShortcutKeyLabel } from '$lib/hooks/editor/createStatus.svelte.js';
	import type { QuickAction } from '$types/editor.js';

	let {
		quickActions
	}: {
		quickActions: readonly QuickAction[];
		recentFiles?: readonly { label: string; path: string }[];
		onOpenRecent?: (path: string) => void;
	} = $props();

	type NavigatorWithUAData = Navigator & { userAgentData?: { platform?: string } };

	const currentPlatform =
		typeof navigator !== 'undefined'
			? ((navigator as NavigatorWithUAData).userAgentData?.platform ?? navigator.platform)
			: '';
</script>

<article class="editor-empty" aria-label="Editor welcome">
	<img class="empty-logo" src={favicon} alt="" aria-hidden="true" />
	<div class="empty-shortcuts" aria-label="Quick actions">
		{#each quickActions as action}
			<div class="shortcut-row">
				<span class="shortcut-label">{action.label}</span>
				<span class="shortcut-keys" aria-label={`${action.label} shortcut`}>
					{#each action.keys as key, i}
						{#if i > 0}<span class="shortcut-plus">+</span>{/if}
						<kbd>{toPlatformShortcutKeyLabel(key, currentPlatform)}</kbd>
					{/each}
				</span>
			</div>
		{/each}
	</div>
</article>

<style>
	.editor-empty {
		flex: 1;
		min-height: 0;
		display: grid;
		place-items: center;
		align-content: center;
		gap: 2rem;
		padding: clamp(1.5rem, 3.6vw, 3rem);
		background:
			radial-gradient(
				circle at 50% 40%,
				color-mix(in srgb, var(--fg) 50%, transparent),
				transparent 60%
			),
			var(--bg);
	}

	.empty-logo {
		width: clamp(90px, 17.5vw, 190px);
		height: auto;
		opacity: 0.12;
		filter: grayscale(1) contrast(1.1);
		pointer-events: none;
		user-select: none;
	}

	.empty-shortcuts {
		display: grid;
		gap: 0.5rem;
		min-width: min(280px, 92%);
		max-width: 360px;
	}

	.shortcut-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		color: var(--text);
		font-size: 0.85rem;
	}

	.shortcut-label {
		color: color-mix(in srgb, var(--text) 82%, var(--muted));
	}

	.shortcut-keys {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		color: var(--muted);
	}

	.shortcut-plus {
		font-size: 0.7rem;
		color: color-mix(in srgb, var(--muted) 72%, var(--border));
	}

	kbd {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.4rem;
		height: 1.2rem;
		padding: 0 0.3rem;
		font-family: 'Inter', 'Segoe UI', sans-serif;
		font-size: 0.65rem;
		line-height: 1;
		letter-spacing: 0.01em;
		color: var(--text);
		background: color-mix(in srgb, var(--fg) 88%, transparent);
		border: 1px solid color-mix(in srgb, var(--border) 85%, transparent);
		border-bottom-color: color-mix(in srgb, var(--border) 65%, black);
		border-radius: 4px;
		box-shadow: inset 0 -1px 0 color-mix(in srgb, black 26%, transparent);
	}
</style>
