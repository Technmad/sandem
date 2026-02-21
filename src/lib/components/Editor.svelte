<script lang="ts">
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
		authEndpoint: '/api/liveblocks-auth'
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

<div bind:this={parent}></div>
