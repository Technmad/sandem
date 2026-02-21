<script lang="ts">
	import { onMount } from 'svelte';
	import { createClient, type Room } from '@liveblocks/client';
	import { getYjsProviderForRoom } from '@liveblocks/yjs';
	import * as monaco from 'monaco-editor';
	import { MonacoBinding } from 'y-monaco';
	import type { Awareness } from 'y-protocols/awareness';

	// 1. Properly type the Monaco Environment
	interface MonacoEnvironment {
		getWorkerUrl: (moduleId: string, label: string) => string;
	}

	if (typeof window !== 'undefined') {
		// Use a type intersection to inform TS that window has this property
		(window as Window & { MonacoEnvironment: MonacoEnvironment }).MonacoEnvironment = {
			getWorkerUrl: function (_moduleId: string, label: string) {
				let workerUrl = 'https://unpkg.com/monaco-editor@0.55.1/min/vs/editor/editor.worker.js';
				if (label === 'json') {
					workerUrl = 'https://unpkg.com/monaco-editor@0.55.1/min/vs/language/json/json.worker.js';
				} else if (label === 'css' || label === 'scss' || label === 'less') {
					workerUrl = 'https://unpkg.com/monaco-editor@0.55.1/min/vs/language/css/css.worker.js';
				} else if (label === 'html' || label === 'handlebars' || label === 'razor') {
					workerUrl = 'https://unpkg.com/monaco-editor@0.55.1/min/vs/language/html/html.worker.js';
				} else if (label === 'typescript' || label === 'javascript') {
					workerUrl =
						'https://unpkg.com/monaco-editor@0.55.1/min/vs/language/typescript/ts.worker.js';
				}

				const blob = new Blob([`importScripts('${workerUrl}');`], { type: 'text/javascript' });
				return URL.createObjectURL(blob);
			}
		};
	}

	let element: HTMLDivElement;
	const roomId = 'my-room';

	const client = createClient({
		authEndpoint: async (room?: string) => {
			const res = await fetch('/api/liveblocks-auth', {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ room })
			});
			if (!res.ok) throw new Error(`Liveblocks auth failed (${res.status})`);
			return res.json();
		}
	});

	onMount(() => {
		// Explicitly typing the room and leave function
		const { room, leave }: { room: Room; leave: () => void } = client.enterRoom(roomId);

		const yProvider = getYjsProviderForRoom(room);
		const yDoc = yProvider.getYDoc();
		const yText = yDoc.getText('monaco');

		const editor = monaco.editor.create(element, {
			value: '',
			language: 'javascript',
			theme: 'vs-dark',
			automaticLayout: true
		});

		const model = editor.getModel();
		if (!model) return;

		// 2. FIXED CAST: Use 'as unknown as Awareness' to resolve the overlap error
		// This safely satisfies the compiler when versions of y-protocols mismatch.
		const binding = new MonacoBinding(
			yText,
			model,
			new Set([editor]),
			yProvider.awareness as unknown as Awareness
		);

		return () => {
			binding.destroy();
			editor.dispose();
			leave();
		};
	});
</script>

<div bind:this={element} class="editor-container"></div>

<style>
	.editor-container {
		width: 100%;
		height: 100%;
		min-height: 400px;
	}
</style>
