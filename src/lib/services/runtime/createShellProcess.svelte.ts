import { XtermAddon } from '@battlefieldduck/xterm-svelte';
import type { Terminal } from '@battlefieldduck/xterm-svelte';
import type { WebContainer, WebContainerProcess } from '@webcontainer/api';

type ShellProcessOptions = {
	canExecute?: () => boolean;
	onAudit?: (entry: { command: string; allowed: boolean; at: number }) => void;
};

export function createShellProcess(
	getWebcontainer: () => WebContainer,
	options: ShellProcessOptions = {}
) {
	let shellProcess: WebContainerProcess | undefined;
	let shellInput: WritableStreamDefaultWriter<string> | undefined;
	let terminalRef: Terminal | undefined;
	let fitAddon:
		| InstanceType<Awaited<ReturnType<typeof XtermAddon.FitAddon>>['FitAddon']>
		| undefined;
	let onWindowResize: (() => void) | undefined;
	let ready = $state(false);
	let commandBuffer = '';

	function isAllowed() {
		return options.canExecute ? options.canExecute() : true;
	}

	function audit(command: string, allowed: boolean) {
		const trimmed = command.trim();
		if (!trimmed) return;
		options.onAudit?.({ command: trimmed, allowed, at: Date.now() });
	}

	function pushCommandChunks(data: string, allowed: boolean) {
		commandBuffer += data;
		const lines = commandBuffer.split(/\r?\n/);
		commandBuffer = lines.pop() ?? '';
		for (const line of lines) {
			audit(line, allowed);
		}
	}

	async function initShell(terminal: Terminal) {
		if (!isAllowed()) {
			audit('init-shell', false);
			return;
		}

		terminalRef = terminal;
		if (shellProcess) return;

		const webcontainer = getWebcontainer();

		fitAddon = new (await XtermAddon.FitAddon()).FitAddon();
		terminal.loadAddon(fitAddon);
		fitAddon.fit();

		onWindowResize = () => fitAddon?.fit();
		window.addEventListener('resize', onWindowResize);

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

		ready = true;
	}

	function writeInput(data: string) {
		if (!isAllowed()) {
			pushCommandChunks(data, false);
			return;
		}

		pushCommandChunks(data, true);
		shellInput?.write(data);
	}

	function clearTerminal() {
		terminalRef?.clear();
	}

	async function restartShell() {
		if (!isAllowed()) {
			audit('restart-shell', false);
			return;
		}

		if (!terminalRef) return;
		killShell();
		await initShell(terminalRef);
	}

	/** Kill the shell process — call from onDestroy. */
	function killShell() {
		if (!isAllowed()) {
			audit('kill-shell', false);
			return;
		}

		shellInput?.close().catch(() => {});
		shellProcess?.kill();
		if (onWindowResize) {
			window.removeEventListener('resize', onWindowResize);
			onWindowResize = undefined;
		}
		fitAddon = undefined;
		shellProcess = undefined;
		shellInput = undefined;
		ready = false;
		commandBuffer = '';
	}

	return {
		get isReady() {
			return ready;
		},
		initShell,
		writeInput,
		clearTerminal,
		restartShell,
		killShell
	};
}
