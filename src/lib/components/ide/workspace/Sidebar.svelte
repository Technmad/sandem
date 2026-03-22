<script lang="ts">
	import { activity, type TabId } from '$lib/stores/activity/activityStore.svelte.js';

	import Explorer from '../activities/Explorer.svelte';
	import SearchPanel from '../activities/Search.svelte';
	import Git from '../activities/Git.svelte';
	import Debug from '../activities/Debug.svelte';

	// Map tab id → component. Keys must exactly match TabId values.
	// ✅ 'run' key aligns with TabId and ActivityBar's corrected id: 'run'.
	const activityMap = {
		explorer: Explorer,
		search: SearchPanel,
		git: Git,
		run: Debug
	} satisfies Record<TabId, unknown>;

	const FallbackPanel = Explorer;
	let ActivePanel = $derived(activityMap[activity.tab] ?? FallbackPanel);
</script>

<aside>
	<ActivePanel />
</aside>

<style>
	aside {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-width: 0;
		height: 100%;
		overflow: hidden;
		background: color-mix(in srgb, var(--mg) 92%, var(--bg));
		border-right: 1px solid color-mix(in srgb, var(--border) 64%, transparent);
	}
</style>
