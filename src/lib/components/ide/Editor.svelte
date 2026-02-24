<script lang="ts">
	import loader from '@monaco-editor/loader';
	import { client } from '$lib/liveblocks.config.js';
	import { onMount, onDestroy, untrack } from 'svelte';
	import * as Y from 'yjs';
	import { MonacoBinding } from 'y-monaco';
	import { LiveblocksYjsProvider } from '@liveblocks/yjs';
	import type * as Monaco from 'monaco-editor';

	import { getIDEContext } from '$lib/utils/ide-context.js';
	import { createAutoSaver } from '$lib/hooks/useAutoSave.svelte.js';
	import { useFilesystem } from '$lib/hooks/useFileSystem.svelte.js';
	import type { Awareness } from 'y-protocols/awareness.js';

	interface FileBinding {
		monacoModel: Monaco.editor.ITextModel;
		destroy: () => void;
	}

	const ide = getIDEContext();
	let project = $derived(ide.getProject());
	let allFiles = $derived(project.files.map((f) => f.name));

	let element: HTMLDivElement;
	let editor: Monaco.editor.IStandaloneCodeEditor;
	let monacoInstance: typeof Monaco;

	let activeFile = $state(untrack(() => project.entry || project.files[0].name));

	const autoSaver = createAutoSaver(() => project);
	const filesystem = useFilesystem(ide.getWebcontainer, () => project);

	let provider: LiveblocksYjsProvider;
	let ydoc: Y.Doc;
	let bindings: Map<string, FileBinding> = new Map();
	let leaveRoom: () => void;

	// Track whether the Yjs provider has finished its initial sync so we
	// don't trigger auto-saves from the initial hydration writes.
	let yjsSynced = false;

	// Per-file flag: has this file been seeded into Yjs yet this session?
	const seededFiles = new Set<string>();

	onMount(async () => {
		const rawLoader = loader as unknown as { init: () => Promise<typeof Monaco> };
		monacoInstance = await rawLoader.init();

		editor = monacoInstance.editor.create(element, {
			theme: 'vs-dark',
			automaticLayout: true,
			minimap: { enabled: false },
			fontSize: 14,
			padding: { top: 10 }
		});

		if (!project.liveblocksRoomId) {
			// Offline / no collab mode: just load files directly into Monaco models
			setupOfflineModels();
			return;
		}

		const { room, leave } = client.enterRoom(project.liveblocksRoomId, {
			initialPresence: { cursor: null }
		});
		leaveRoom = leave;

		ydoc = new Y.Doc();
		provider = new LiveblocksYjsProvider(room, ydoc);

		// Wait for the Yjs provider to finish its initial sync before we
		// decide whether to seed content from Convex.
		provider.on('sync', (isSynced: boolean) => {
			if (!isSynced || yjsSynced) return;
			yjsSynced = true;
			seedYjsFromConvex();
		});

		// Build Monaco models and bindings for every project file
		for (const file of project.files) {
			const yText = ydoc.getText(file.name);
			// Create model with no initial content — Yjs owns the content
			const model = monacoInstance.editor.createModel('', getLanguage(monacoInstance, file.name));
			const binding = new MonacoBinding(
				yText,
				model,
				new Set([editor]),
				provider.awareness as unknown as Awareness
			);
			bindings.set(file.name, {
				monacoModel: model,
				destroy: () => binding.destroy()
			});
		}

		// Show the active file
		swapToFile(activeFile);

		// Only save on local changes. We detect "local" by checking yjsSynced
		// and using a per-model origin guard via Yjs transactions.
		ydoc.on('update', (_update: Uint8Array, origin: unknown) => {
			// origin is null for local changes, a string/object for remote
			if (!yjsSynced) return;
			if (origin !== null) return; // remote change — skip
			const content = ydoc.getText(activeFile).toString();
			autoSaver.triggerAutoSave(activeFile, content);
			// Keep WebContainer in sync immediately (no debounce needed, FS write is cheap)
			filesystem.writeFile(activeFile, content);
		});
	});

	/**
	 * Seeds Yjs text from Convex project data for files that are still empty
	 * (i.e. brand-new rooms with no prior Yjs history).
	 */
	function seedYjsFromConvex() {
		ydoc.transact(() => {
			for (const file of project.files) {
				if (seededFiles.has(file.name)) continue;
				const yText = ydoc.getText(file.name);
				// Only write if the Yjs doc is completely empty for this file —
				// if there's already content it means a prior session saved it.
				if (yText.length === 0 && file.contents) {
					yText.insert(0, file.contents);
				}
				seededFiles.add(file.name);
			}
		}, 'seed'); // 'seed' origin — will be ignored by the update listener above
	}

	/**
	 * Offline mode: load Convex content directly into Monaco models.
	 */
	function setupOfflineModels() {
		for (const file of project.files) {
			const model = monacoInstance.editor.createModel(
				file.contents ?? '',
				getLanguage(monacoInstance, file.name)
			);
			// Use a thin wrapper so the rest of the code can still use `bindings`
			bindings.set(file.name, { monacoModel: model, destroy: () => model.dispose() });
		}
		swapToFile(activeFile);

		editor.onDidChangeModelContent(() => {
			const content = editor.getValue();
			autoSaver.triggerAutoSave(activeFile, content);
			filesystem.writeFile(activeFile, content);
		});
	}

	function swapToFile(fileName: string) {
		if (!editor) return;

		const binding = bindings.get(fileName);
		if (!binding) return;

		const targetModel = binding.monacoModel;
		if (editor.getModel() !== targetModel) {
			editor.setModel(targetModel);
		}
	}

	// React to tab switches — force-save the outgoing file first
	$effect(() => {
		swapToFile(activeFile);
	});

	function getLanguage(m: typeof Monaco, fileName: string): string {
		const ext = fileName.split('.').pop() ?? '';
		const map: Record<string, string> = {
			js: 'javascript',
			jsx: 'javascript',
			ts: 'typescript',
			tsx: 'typescript',
			html: 'html',
			css: 'css',
			json: 'json',
			md: 'markdown'
		};
		return map[ext] ?? 'plaintext';
	}

	onDestroy(() => {
		autoSaver.cleanup();
		bindings.forEach((b) => b.destroy?.());
		provider?.destroy();
		leaveRoom?.();
		editor?.dispose();
	});
</script>

<div class="editor-layout">
	<div class="tabs-header">
		<div class="tabs">
			{#each allFiles as file}
				<button class="tab" class:active={activeFile === file} onclick={() => (activeFile = file)}>
					{file}
				</button>
			{/each}
		</div>
		<div class="actions">
			<span class="save-status">{autoSaver.status}</span>
		</div>
	</div>
	<div class="editor-container" bind:this={element}></div>
</div>

<style>
	.editor-layout {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #151515;
	}
	.tabs-header {
		display: flex;
		justify-content: space-between;
		background: #1e1e1e;
		border-bottom: 1px solid #2d2d2d;
	}
	.tabs {
		display: flex;
	}
	.tab {
		padding: 8px 16px;
		border: none;
		background: transparent;
		color: #888;
		cursor: pointer;
		font-size: 12px;
		border-right: 1px solid #2d2d2d;
	}
	.tab.active {
		background: #151515;
		color: #fff;
		border-top: 2px solid #3794ff;
	}
	.save-status {
		font-size: 11px;
		color: #666;
		padding-right: 12px;
		align-self: center;
	}
	.editor-container {
		flex: 1;
	}
</style>
