// src/lib/hooks/createShellProcess.svelte.ts
import { XtermAddon } from '@battlefieldduck/xterm-svelte';
import type { Terminal } from '@battlefieldduck/xterm-svelte';
import type { WebContainer, WebContainerProcess } from '@webcontainer/api';

export function createShellProcess(getWebcontainer: () => WebContainer) {
	let shellProcess: WebContainerProcess | undefined;
	let shellInput: WritableStreamDefaultWriter<string> | undefined;

	async function initShell(terminal: Terminal) {
		const webcontainer = getWebcontainer();

		const fitAddon = new (await XtermAddon.FitAddon()).FitAddon();
		terminal.loadAddon(fitAddon);
		fitAddon.fit();
		window.addEventListener('resize', () => fitAddon.fit());

		shellProcess = await webcontainer.spawn('jsh', {
			terminal: { cols: terminal.cols, rows: terminal.rows }
		});

		shellInput = shellProcess.input.getWriter();

		shellProcess.output.pipeTo(
			new WritableStream({
				write(data) {
					terminal.write(data);
				}
			})
		);

		terminal.onResize((size) => {
			shellProcess?.resize({ cols: size.cols, rows: size.rows });
		});
	}

	function writeInput(data: string) {
		shellInput?.write(data);
	}

	/** Kill the shell process — call from onDestroy. */
	function killShell() {
		shellInput?.close().catch(() => {});
		shellProcess?.kill();
		shellProcess = undefined;
		shellInput = undefined;
	}

	return { initShell, writeInput, killShell };
}
