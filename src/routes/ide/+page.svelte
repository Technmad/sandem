<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import Terminal from '$lib/components/Terminal.svelte';
</script>

<section>
	<Editor />
	<Terminal />
</section>

<style>
	section {
		display: grid;
		grid-template-rows: 1fr 1fr;
	}
</style>
