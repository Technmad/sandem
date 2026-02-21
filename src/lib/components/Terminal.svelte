<script lang="ts">
	import { onMount } from 'svelte';
	// 1. Change to 'import type' so Node.js ignores them during SSR
	import type { Terminal as TerminalType } from 'xterm';
	import type { FitAddon as FitAddonType } from '@xterm/addon-fit';

	// to allow parent to receive the instance
	// runes mode: grab from props
	const { onReady } = $props() as {
		onReady: ((term: TerminalType, fit: FitAddonType) => void) | null;
	};

	let terminalElement: HTMLDivElement;
	let terminal: TerminalType;
	let fitAddon: FitAddonType;

	onMount(async () => {
		// 2. Dynamically import the actual classes only in the browser
		const { Terminal } = await import('xterm');
		const { FitAddon } = await import('@xterm/addon-fit');

		terminal = new Terminal({ convertEol: true });
		fitAddon = new FitAddon();
		terminal.loadAddon(fitAddon);

		terminal.open(terminalElement);
		fitAddon.fit();

		if (onReady) {
			onReady(terminal, fitAddon);
		}
	});

	function handleResize() {
		if (fitAddon) {
			fitAddon.fit();
		}
	}
</script>

<div class="terminal-container" bind:this={terminalElement}></div>

<svelte:window onresize={handleResize} />

<style>
	/* the xterm stylesheet is loaded globally (see app.css) */
	.terminal-container {
		width: 100%;
		height: 100%;
	}
</style>
