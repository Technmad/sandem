<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
</script>

<section>
	<header> ye raha header for the code page</header>
	
	<Editor />
</section>

<style>
	section {
		min-height: calc(100vh - 4rem);
		display: grid;
		grid-template-rows: 2rem auto;
	}
</style>
