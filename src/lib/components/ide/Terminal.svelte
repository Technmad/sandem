<script lang="ts">
	import { Xterm } from '@battlefieldduck/xterm-svelte';
	import type {
		ITerminalOptions,
		ITerminalInitOnlyOptions,
		Terminal
	} from '@battlefieldduck/xterm-svelte';
	import { useShellProcess } from '$lib/hooks/useShellProcess.svelte.js';

	import { getIDEContext } from '$lib/ide.js';

	// 1. Grab the context
	const ide = getIDEContext();
	let terminal: Terminal | undefined = $state(undefined);

	// 2. Pass the getter directly into the hook!
	const shell = useShellProcess(ide.getWebcontainer);

	const options: ITerminalOptions & ITerminalInitOnlyOptions = {
		fontFamily: 'Consolas, monospace',
		convertEol: true,
		theme: { background: '#1e1e1e' }
	};

	async function onLoad() {
		if (!terminal) return;
		await shell.initShell(terminal);
	}

	function onData(data: string) {
		shell.writeInput(data);
	}
</script>

<div class="terminal-container">
	<Xterm bind:terminal {options} {onLoad} {onData} />
</div>

<style>
	.terminal-container {
		height: 100%;
		width: 100%;
		overflow: hidden;
		background-color: #1e1e1e;
		padding: 0.5rem;
		box-sizing: border-box;
	}
</style>
