<script lang="ts">
	import Editor from '$lib/components/ide/Editor.svelte';
	import Terminal from '$lib/components/ide/Terminal.svelte';
	import Preview from '$lib/components/ide/Preview.svelte';
</script>

<div class="ide-grid">
	<div class="code-column">
		<section class="editor-pane">
			<Editor />
		</section>
		<section class="terminal-pane">
			<Terminal />
		</section>
	</div>

	<aside class="preview-column">
		<Preview />
	</aside>
</div>

<style>
	.ide-grid {
		display: grid;
		grid-template-columns: 1fr 1fr; /* Two equal columns */
		height: 100vh;
		width: 100vw;
		background-color: #1e1e1e;
		overflow: hidden;
	}

	.code-column {
		display: grid;
		grid-template-rows: 2fr 1fr; /* Editor gets more space than terminal */
		border-right: 1px solid #333;
		min-height: 0;
	}

	.editor-pane {
		border-bottom: 1px solid #333;
		min-height: 0;
		position: relative;
	}

	.terminal-pane {
		min-height: 0;
		position: relative;
	}

	.preview-column {
		min-height: 0;
		background: #ffffff; /* Typically preview has a light background */
	}
</style>
