import { XtermAddon } from '@battlefieldduck/xterm-svelte';
import type { Terminal } from '@battlefieldduck/xterm-svelte';
import type { WebContainer, WebContainerProcess } from '@webcontainer/api';

// Injecting the dependencies (webcontainer and terminal)
export function useShellProcess(getWebcontainer: () => WebContainer) {
	let shellProcess: WebContainerProcess | undefined;
	let shellInput: WritableStreamDefaultWriter<string> | undefined;

	// The logic is now isolated and easy to test
	async function initShell(terminal: Terminal) {
		const webcontainer = getWebcontainer();

		const fitAddon = new (await XtermAddon.FitAddon()).FitAddon();
		terminal.loadAddon(fitAddon);
		fitAddon.fit();

		window.addEventListener('resize', () => fitAddon.fit());

		// Now we spawn using the freshest instance
		shellProcess = await webcontainer.spawn('jsh', {
			terminal: { cols: terminal.cols, rows: terminal.rows }
		});

		shellInput = shellProcess.input.getWriter();

		shellProcess.output.pipeTo(
			new WritableStream<string>({
				write(data) {
					terminal.write(data);
				}
			})
		);

		function runCommand(cmd: string) {
			if (shellInput) shellInput.write(`${cmd}\r`);
		}

		// Handle Resize (UI -> WebContainer)
		terminal.onResize((size: { cols: number; rows: number }) => {
			shellProcess?.resize({ cols: size.cols, rows: size.rows });
		});
		return { initShell, writeInput, runCommand };
	}

	// Handle Input (UI -> WebContainer)
	function writeInput(data: string) {
		if (shellInput) {
			shellInput.write(data);
		}
	}

	return {
		initShell,
		writeInput
	};
}
