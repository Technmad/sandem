<script lang="ts">
	import Editor from '$lib/components/ide/Editor.svelte';
	import Terminal from '$lib/components/ide/Terminal.svelte';
	import Preview from '$lib/components/ide/Preview.svelte';

	import { getIDEContext } from '$lib/utils/ide-context.js';
</script>

<section>
	<div class="editor"><Editor /></div>
	<div class="terminal"><Terminal /></div>
	<div class="preview"><Preview /></div>
</section>

<style>
	section {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: 1fr 1fr;
		grid-template-areas:
			'editor preview'
			'terminal preview';
	}

	.editor {
		grid-area: editor;
	}
	.terminal {
		grid-area: terminal;
	}
	.preview {
		grid-area: preview;
	}
</style>
