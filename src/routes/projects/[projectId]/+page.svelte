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
	:global(body) {
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	.ide-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		height: 100vh;
		width: 100vw;
		background-color: #1e1e1e;
		overflow: hidden;
	}

	.code-column {
		display: grid;
		grid-template-rows: 2fr 1fr;
		border-right: 1px solid #2d2d2d;
		min-height: 0;
		overflow: hidden;
	}

	.editor-pane {
		border-bottom: 1px solid #2d2d2d;
		min-height: 0;
		overflow: hidden;
	}

	.terminal-pane {
		min-height: 0;
		overflow: hidden;
	}

	.preview-column {
		min-height: 0;
		overflow: hidden;
		/* Let Preview.svelte own its own background — no override here */
	}
</style>
