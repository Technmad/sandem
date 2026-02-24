<script lang="ts">
	import { Xterm } from '@battlefieldduck/xterm-svelte';
	import type {
		ITerminalOptions,
		ITerminalInitOnlyOptions,
		Terminal
	} from '@battlefieldduck/xterm-svelte';
	import { useShellProcess } from '$lib/hooks/useShellProcess.svelte.js';
	import { getIDEContext } from '$lib/utils/ide-context.js';

	const ide = getIDEContext();
	let terminalInstance: Terminal | undefined = $state(undefined);

	// Use the hook logic
	const shell = useShellProcess(ide.getWebcontainer);

	const options: ITerminalOptions & ITerminalInitOnlyOptions = {
		fontFamily: '"JetBrains Mono", monospace',
		fontSize: 13,
		theme: { background: '#151515', foreground: '#ccc' },
		cursorBlink: true
	};

	async function handleLoad() {
		if (!terminalInstance) return;
		// Initialize the shell with the terminal instance
		await shell.initShell(terminalInstance);
	}
</script>

<div class="terminal-layout">
	<div class="terminal-header">
		<div class="terminal-tab">Terminal</div>
	</div>
	<div class="terminal-container">
		<Xterm
			bind:terminal={terminalInstance}
			{options}
			onLoad={handleLoad}
			onData={(data) => shell.writeInput(data)}
		/>
	</div>
</div>

<style>
	.terminal-layout {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #151515;
	}
	.terminal-header {
		background: #1e1e1e;
		border-bottom: 1px solid #2d2d2d;
		border-top: 1px solid #2d2d2d;
	}
	.terminal-tab {
		padding: 8px 16px;
		background: #151515;
		color: #fff;
		font-size: 12px;
		width: fit-content;
		border-top: 2px solid #3794ff;
	}
	.terminal-container {
		flex: 1;
		padding: 8px;
	}
</style>
