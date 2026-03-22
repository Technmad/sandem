<script lang="ts">
	import { goto } from '$app/navigation';
	import { Minus, Maximize2, X } from '@lucide/svelte';
	import { getPanelsContext } from '$lib/stores';

	const panels = getPanelsContext();

	let isFullscreen = $state(false);

	function minimizeView() {
		if (!panels) return;
		panels.leftPane = false;
		panels.rightPane = false;
		panels.downPane = false;
	}

	async function toggleFullscreen() {
		if (!document.fullscreenElement) {
			await document.documentElement.requestFullscreen();
			isFullscreen = true;
			return;
		}

		await document.exitFullscreen();
		isFullscreen = false;
	}

	async function closeWorkspace() {
		await goto('/');
	}
</script>

<div class="win-group">
	<button class="win-btn" title="Minimize" onclick={minimizeView}>
		<Minus size={13} strokeWidth={1.5} />
	</button>
	<button
		class="win-btn"
		title={isFullscreen ? 'Restore' : 'Maximize'}
		onclick={() => void toggleFullscreen()}
	>
		<Maximize2 size={12} strokeWidth={1.5} />
	</button>
	<button class="win-btn win-close" title="Close" onclick={() => void closeWorkspace()}>
		<X size={13} strokeWidth={1.5} />
	</button>
</div>

<style>
	.win-group {
		display: flex;
		align-items: center;
		gap: 0;
		-webkit-app-region: no-drag;
	}

	.win-btn {
		width: 46px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: var(--muted);
		border-radius: 0;
		cursor: pointer;
		flex-shrink: 0;
		transition:
			color 0.1s,
			background 0.1s;
	}
	.win-btn:hover {
		background: var(--fg);
		color: var(--text);
	}

	.win-close:hover {
		background: #c42b1c !important;
		color: white !important;
	}
</style>
