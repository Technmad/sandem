<script lang="ts">
	import loader from '@monaco-editor/loader';
	import { client } from '$lib/liveblocks.config.js';
	import { onMount, onDestroy, untrack } from 'svelte';
	import * as Y from 'yjs';
	import { MonacoBinding } from 'y-monaco';
	import { LiveblocksYjsProvider } from '@liveblocks/yjs';
	import type * as Monaco from 'monaco-editor';

	import { getIDEContext } from '$lib/context/ide.js';
	import { createAutoSaver } from '$lib/hooks/createAutoSaver.svelte.js';
	import { createFileWriter } from '$lib/hooks/createFileWriter.svelte.js';
	import { getMonacoLanguage } from '$lib/utils/language.js';
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
	const { writeFile } = createFileWriter(ide.getWebcontainer);

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

		if (!project.room) {
			setupOfflineModels();
			return;
		}

		const { room, leave } = client.enterRoom(project.room, {
			initialPresence: { cursor: null }
		});
		leaveRoom = leave;

		ydoc = new Y.Doc();
		provider = new LiveblocksYjsProvider(room, ydoc);

		provider.on('sync', (isSynced: boolean) => {
			if (!isSynced || yjsSynced) return;
			yjsSynced = true;
			seedYjsFromConvex();
		});

		for (const file of project.files) {
			const yText = ydoc.getText(file.name);
			const model = monacoInstance.editor.createModel('', getMonacoLanguage(file.name));
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

		swapToFile(activeFile);

		ydoc.on('update', (_update: Uint8Array, origin: unknown) => {
			if (!yjsSynced) return;
			if (origin !== null) return; // remote change — skip
			const content = ydoc.getText(activeFile).toString();
			autoSaver.triggerAutoSave(activeFile, content);
			writeFile(activeFile, content);
		});
	});

	function seedYjsFromConvex() {
		ydoc.transact(() => {
			for (const file of project.files) {
				if (seededFiles.has(file.name)) continue;
				const yText = ydoc.getText(file.name);
				if (yText.length === 0 && file.contents) {
					yText.insert(0, file.contents);
				}
				seededFiles.add(file.name);
			}
		}, 'seed'); // 'seed' origin is ignored by the update listener
	}

	function setupOfflineModels() {
		for (const file of project.files) {
			const model = monacoInstance.editor.createModel(
				file.contents ?? '',
				getMonacoLanguage(file.name)
			);
			bindings.set(file.name, { monacoModel: model, destroy: () => model.dispose() });
		}
		swapToFile(activeFile);

		editor.onDidChangeModelContent(() => {
			const content = editor.getValue();
			autoSaver.triggerAutoSave(activeFile, content);
			writeFile(activeFile, content);
		});
	}

	function swapToFile(fileName: string) {
		if (!editor) return;
		const binding = bindings.get(fileName);
		if (!binding) return;
		if (editor.getModel() !== binding.monacoModel) {
			editor.setModel(binding.monacoModel);
		}
	}

	$effect(() => {
		swapToFile(activeFile);
	});

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
