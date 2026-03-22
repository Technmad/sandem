<script lang="ts">
	import { ChevronRightIcon } from '@lucide/svelte';

	let { path }: { path: string | null } = $props();

	const COLLAPSE_AFTER_SEGMENTS = 5;
	const VISIBLE_TAIL_SEGMENTS = 3;

	const segments = $derived(path ? path.split('/') : []);
	const visibleSegments = $derived.by(() => {
		if (segments.length <= COLLAPSE_AFTER_SEGMENTS) {
			return segments;
		}

		return [segments[0], '…', ...segments.slice(-VISIBLE_TAIL_SEGMENTS)];
	});
</script>

{#if path}
	<nav class="breadcrumb" aria-label="File path" title={path}>
		{#each visibleSegments as segment, depth}
			{#if depth > 0}<span class="breadcrumb-sep"><ChevronRightIcon /></span>{/if}
			<span
				class="breadcrumb-segment"
				class:ellipsis={segment === '…'}
				class:last={depth === visibleSegments.length - 1}
				title={segment}
			>
				{segment}
			</span>
		{/each}
	</nav>
{/if}

<style>
	/* ── Breadcrumb ─────────────────────────────────────────── */
	.breadcrumb {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 0 14px;
		height: 22px;
		font-size: 11px;
		font-family: 'Segoe UI', system-ui, sans-serif;
		color: color-mix(in srgb, var(--muted) 88%, var(--text));
		background: color-mix(in srgb, var(--bg) 86%, black);
		border-bottom: 1px solid color-mix(in srgb, var(--border) 68%, transparent);
		flex-shrink: 0;
		overflow: hidden;
		white-space: nowrap;
	}

	.breadcrumb-sep {
		color: color-mix(in srgb, var(--border) 80%, transparent);
		font-size: 12px;
		line-height: 1;
	}

	.breadcrumb-segment {
		color: color-mix(in srgb, var(--muted) 92%, var(--text));
		cursor: default;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: min(22vw, 220px);
	}

	.breadcrumb-segment.ellipsis {
		max-width: none;
		font-weight: 600;
	}

	.breadcrumb-segment.last {
		color: color-mix(in srgb, var(--text) 96%, white);
		font-weight: 500;
	}
</style>
