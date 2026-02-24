<script lang="ts">
	import { onMount } from 'svelte';
	import { Awareness } from 'y-protocols/awareness';
	import { createClient } from '@liveblocks/client';
	import { getYjsProviderForRoom } from '@liveblocks/yjs';

	import Tab from '../ui/Tab.svelte';
	import Tabs from '../ui/Tabs.svelte';

	import SaveButton from '$lib/components/ui/SaveButton.svelte';

	import { VITE_REACT_TEMPLATE } from '$lib/templates.js';

	// --- 1. Import New Abstractions ---
	import { setupMonacoWorkers } from '$lib/hooks/setupWorker.js';

	import { getIDEContext } from '$lib/ide.js';
	import { createAutoSaver } from '$lib/hooks/useAutoSave.svelte.js';

	// 2. Grab the context instance
	const ide = getIDEContext();

	// 3. Re-create 'project' and 'webcontainer' as reactive variables
	// so the rest of the file can use them without changing any code!
	let project = $derived(ide.getProject());
	let webcontainer = $derived(ide.getWebcontainer());

	// Liveblocks Client
	const client = createClient({
		authEndpoint: '/api/liveblocks-auth'
	});

	// 2. Pass getter to hook
	const autoSaver = createAutoSaver(ide.getProject);

	// Example of using a value from context directly in the template/logic:
	let roomId = $derived(ide.getProject().liveblocksRoomId ?? '');
	// Initialize the custom Svelte 5 auto-saver hook

	let element: HTMLDivElement | undefined = $state();
	let activeFile: string = $state(VITE_REACT_TEMPLATE.entry);
	let editor: import('monaco-editor').editor.IStandaloneCodeEditor | null = $state(null);
	let models: Record<string, import('monaco-editor').editor.ITextModel> = {};

	function getLanguage(fileName: string): string {
		if (fileName.endsWith('.jsx') || fileName.endsWith('.js')) return 'javascript';
		if (fileName.endsWith('.html')) return 'html';
		if (fileName.endsWith('.json')) return 'json';
		return 'plaintext';
	}

	onMount(() => {
		if (!project?.liveblocksRoomId) return;

		let isDestroyed = false;
		let bindings: import('y-monaco').MonacoBinding[] = [];
		let leaveRoom: () => void;

		// --- 3. Clean Worker Setup ---
		setupMonacoWorkers();

		const initEditor = async () => {
			if (!element) return;

			const monaco = await import('monaco-editor');
			const { MonacoBinding } = await import('y-monaco');

			if (isDestroyed) return;

			const { room, leave } = client.enterRoom(roomId);
			leaveRoom = leave;

			const yProvider = getYjsProviderForRoom(room);
			const yDoc = yProvider.getYDoc();

			editor = monaco.editor.create(element, {
				theme: 'vs-dark',
				automaticLayout: true
			});

			for (const fileName of VITE_REACT_TEMPLATE.visibleFiles) {
				const language = getLanguage(fileName);

				const model = monaco.editor.createModel(
					'',
					language,
					monaco.Uri.parse(`file:///${fileName}`)
				);
				models[fileName] = model;

				const yText = yDoc.getText(fileName);

				const binding = new MonacoBinding(
					yText,
					model,
					new Set([editor]),
					yProvider.awareness as unknown as Awareness
				);
				bindings.push(binding);

				model.onDidChangeContent(async () => {
					// --- 4. Clean Auto-Save Trigger ---
					autoSaver.triggerAutoSave(fileName, model.getValue());

					// Write straight to WebContainer to trigger HMR Preview
					try {
						await webcontainer.fs.writeFile(fileName, model.getValue());
					} catch (error) {
						console.error(`Failed to write ${fileName} to WebContainer:`, error);
					}
				});
			}

			editor.setModel(models[activeFile]);

			// Safely populate Default Data from Convex
			yProvider.on('sync', (isSynced: boolean) => {
				if (isSynced) {
					for (const fileName of VITE_REACT_TEMPLATE.visibleFiles) {
						const yText = yDoc.getText(fileName);

						if (yText.length === 0) {
							const dbFile = project.files.find((f) => f.name === fileName);
							const initialContent = dbFile ? dbFile.contents : '';
							yText.insert(0, initialContent);
						}
					}
				}
			});
		};

		initEditor();

		return () => {
			isDestroyed = true;
			autoSaver.cleanup(); // Clean up timeout from our hook
			bindings.forEach((b) => b.destroy());
			Object.values(models).forEach((m) => m.dispose());
			if (editor) editor.dispose();
			if (leaveRoom) leaveRoom();
		};
	});

	$effect(() => {
		if (!project) return;
		if (editor && models[activeFile]) {
			editor.setModel(models[activeFile]);
		}
	});
</script>

<div class="layout-container">
	<div class="editor-shell">
		{#snippet editorActions()}
			<SaveButton
				status={autoSaver.status}
				onsave={() => {
					if (models[activeFile]) {
						autoSaver.triggerAutoSave(activeFile, models[activeFile].getValue());
					}
				}}
			/>
		{/snippet}

		<Tabs variant="editor" actions={editorActions}>
			{#each VITE_REACT_TEMPLATE.visibleFiles as fileName}
				<Tab
					variant="editor"
					active={activeFile === fileName}
					onclick={() => (activeFile = fileName)}
				>
					{fileName}
				</Tab>
			{/each}
		</Tabs>

		<div bind:this={element} class="monaco-container"></div>
	</div>
</div>

<style>
	.layout-container {
		height: 100%;
		width: 100%;
	}

	.editor-shell {
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: 100%;
		background-color: #1e1e1e;
		position: relative;
	}

	.monaco-container {
		flex: 1;
		width: 100%;
	}
</style>
