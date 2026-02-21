<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
</script>

<section>
	<header>
		<form>
			<span>file</span><span>edit</span><span>view</span><span>cmd</span><span>docs</span>
		</form>
	</header>
	<Editor />
	<div>
		<header>
			<form>
				<span>problems</span><span>output</span><span>terminal</span><span>ports</span><span
					>console</span
				>
			</form>
		</header>
		<ul><li>praj@Luigi:/media/praj/Windows/projects/capstone/sandem$</li></ul>
	</div>
</section>

<style>
	section {
		min-height: calc(100vh - 4rem);
		display: grid;
		grid-template-rows: 2rem 1fr 1fr;
	}
	header {
		display: flex;
	}
	form {
		display: grid;
		grid-auto-flow: column;
		gap: 2rem;
		padding: 0 1rem;
		margin-bottom: 1rem;
	}
	li {
		list-style-type: circle;
		margin-left: 2rem;
	}
</style>
