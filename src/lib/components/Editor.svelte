<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { onMount } from 'svelte';
	import { createClient } from '@liveblocks/client';
	import { getYjsProviderForRoom } from '@liveblocks/yjs';
	import * as Y from 'yjs';
	import { yCollab } from 'y-codemirror.next';
	import { EditorView, basicSetup } from 'codemirror';
	import { EditorState } from '@codemirror/state';
	import { javascript } from '@codemirror/lang-javascript';

	let parent: HTMLElement;

	// Set up Liveblocks client
	const client = createClient({
		publicApiKey: String(env.PUBLIC_LIVEBLOCKS_KEY)
	});

	onMount(() => {
		// Enter a multiplayer room
		const { room, leave } = client.enterRoom('my-room');

		// Set up Yjs document, shared text, undo manager, and Liveblocks Yjs provider
		const yProvider = getYjsProviderForRoom(room);
		const yDoc = yProvider.getYDoc();
		const yText = yDoc.getText('codemirror');
		const undoManager = new Y.UndoManager(yText);

		// Set up CodeMirror and extensions
		const state = EditorState.create({
			doc: yText.toString(),
			extensions: [basicSetup, javascript(), yCollab(yText, yProvider.awareness, { undoManager })]
		});

		// Attach CodeMirror to element
		const view = new EditorView({
			state,
			parent
		});

		return () => {
			view.destroy();
			leave();
		};
	});
</script>

<div bind:this={parent} class="editor-wrapper"></div>

<style>
	.editor-wrapper {
		/* Apply the exact same card-style from your layout */
		border: 1px solid var(--border);
		background: var(--mg);

		/* Layout */
		height: 100%;
		width: 100%;
		overflow: hidden; /* Keeps the editor inside the rounded corners */
	}

	/* Target CodeMirror's injected classes to make it fit and match your theme */
	:global(.cm-editor) {
		height: 100%;
		background-color: transparent !important;
		color: var(--text) !important;
	}

	:global(.cm-gutters) {
		background-color: var(--bg) !important;
		color: var(--muted) !important;
		border-right: 1px solid var(--border) !important;
	}

	:global(.cm-activeLine),
	:global(.cm-activeLineGutter) {
		background-color: var(--fg) !important;
	}
</style>
