<script lang="ts">
	import { Awareness } from 'y-protocols/awareness';
	import { onMount } from 'svelte';
	import { createClient } from '@liveblocks/client';
	import { getYjsProviderForRoom } from '@liveblocks/yjs';

	// Convex imports
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';

	// Monaco Workers
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';

	// --- Import Template and Types ---
	import { VITE_REACT_TEMPLATE } from '$lib/templates.js';
	import type { Id } from '$convex/_generated/dataModel.js';

	const convexClient = useConvexClient();
	const client = createClient({
		authEndpoint: '/api/liveblocks-auth'
	});

	// --- 2. Svelte 5 Reactive State ---
	let element: HTMLDivElement | undefined = $state();
	let activeFile: string = $state(VITE_REACT_TEMPLATE.entry);
	let editor: import('monaco-editor').editor.IStandaloneCodeEditor | null = $state(null);
	let models: Record<string, import('monaco-editor').editor.ITextModel> = {};

	// Auto-save State
	let saveStatus: 'Saved' | 'Saving...' | 'Unsaved changes' = $state('Saved');
	let saveTimeout: ReturnType<typeof setTimeout>;

	let {
		webcontainer,
		project
	}: {
		webcontainer: import('@webcontainer/api').WebContainer;
		project: any;
	} = $props();

	// 1. Grab dynamic room ID from the permanently assigned database record
	let roomId = $derived(project.liveblocksRoomId);

	function getLanguage(fileName: string): string {
		if (fileName.endsWith('.jsx') || fileName.endsWith('.js')) return 'javascript';
		if (fileName.endsWith('.html')) return 'html';
		if (fileName.endsWith('.json')) return 'json';
		return 'plaintext';
	}

	// Debounced Auto-Save Logic
	async function saveToConvex() {
		saveStatus = 'Saving...';
		try {
			// Scrape the latest content out of our Monaco models
			const updatedFiles = VITE_REACT_TEMPLATE.visibleFiles.map((fileName) => {
				const content = models[fileName]?.getValue() || '';
				return { name: fileName, contents: content };
			});

			await convexClient.mutation(api.projects.updateProject, {
				id: project._id,
				files: updatedFiles
			});
			saveStatus = 'Saved';
		} catch (error) {
			console.error('Failed to auto-save to Convex:', error);
			saveStatus = 'Unsaved changes'; // Allow retry on next keystroke
		}
	}

	function triggerAutoSave() {
		saveStatus = 'Unsaved changes';
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			saveToConvex();
		}, 1500); // Wait 1.5 seconds after they stop typing to fire the DB query
	}

	onMount(() => {
		let isDestroyed = false;
		let bindings: import('y-monaco').MonacoBinding[] = [];
		let leaveRoom: () => void;

		self.MonacoEnvironment = {
			getWorker: function (_moduleId: Id, label: string) {
				if (label === 'typescript' || label === 'javascript') return new tsWorker();
				if (label === 'json') return new jsonWorker();
				if (label === 'html') return new htmlWorker();
				return new editorWorker();
			}
		};

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

			// --- Setup Multiple Models ---
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

				// Listen for keystrokes
				model.onDidChangeContent(async () => {
					// 1. Kick off the auto-save countdown
					triggerAutoSave();

					// 2. Write straight to WebContainer to trigger HMR Preview
					try {
						await webcontainer.fs.writeFile(fileName, model.getValue());
					} catch (error) {
						console.error(`Failed to write ${fileName} to WebContainer:`, error);
					}
				});
			}

			editor.setModel(models[activeFile]);

			// --- Safely populate Default Data from Convex (Not the template!) ---
			yProvider.on('sync', (isSynced: boolean) => {
				if (isSynced) {
					for (const fileName of VITE_REACT_TEMPLATE.visibleFiles) {
						const yText = yDoc.getText(fileName);

						if (yText.length === 0) {
							// Check the database project files!
							const dbFile = project.files.find((f: any) => f.name === fileName);
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
			clearTimeout(saveTimeout);
			bindings.forEach((b) => b.destroy());
			Object.values(models).forEach((m) => m.dispose());
			if (editor) editor.dispose();
			if (leaveRoom) leaveRoom();
		};
	});

	$effect(() => {
		if (editor && models[activeFile]) {
			editor.setModel(models[activeFile]);
		}
	});
</script>

<div class="layout-container">
	<div class="editor-shell">
		<div class="tabs">
			{#each VITE_REACT_TEMPLATE.visibleFiles as fileName}
				<button
					class="tab"
					class:active={activeFile === fileName}
					onclick={() => (activeFile = fileName)}
				>
					{fileName}
				</button>
			{/each}

			<div class="save-indicator">
				<span class:saving={saveStatus === 'Saving...'} class:saved={saveStatus === 'Saved'}>
					{saveStatus === 'Saved' ? '✓ ' : ''}{saveStatus}
				</span>
			</div>
		</div>

		<div bind:this={element} class="monaco-container"></div>
	</div>
</div>

<style>
	/* Basic VS Code-like styling */
	.editor-shell {
		display: flex;
		flex-direction: column;
		height: 100vh;
		width: 100%;
		background-color: #1e1e1e;
		position: relative;
	}
	.tabs {
		display: flex;
		background-color: #2d2d2d;
		overflow-x: auto;
		align-items: center; /* Center the new text vertically */
	}
	.tab {
		padding: 10px 16px;
		background: transparent;
		border: none;
		color: #969696;
		cursor: pointer;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 13px;
		border-right: 1px solid #1e1e1e;
		border-top: 2px solid transparent;
		transition: background-color 0.1s;
	}
	.tab:hover {
		background-color: #1e1e1e;
	}
	.tab.active {
		background-color: #1e1e1e;
		color: #ffffff;
		border-top: 2px solid #007acc; /* VS Code blue accent */
	}

	/* Cool minimal save indicator styling */
	.save-indicator {
		margin-left: auto;
		padding-right: 16px;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 12px;
		color: #969696;
	}
	.save-indicator span {
		transition: color 0.3s ease;
	}
	.save-indicator .saving {
		color: #e5c07b; /* Slight yellow */
	}
	.save-indicator .saved {
		color: #98c379; /* Green checkmark vibes */
	}

	.monaco-container {
		flex: 1;
		width: 100%;
	}
</style>
