<script lang="ts">
	let {
		label = 'built on',
		items = []
	}: {
		label?: string;
		items: string[];
	} = $props();
</script>

<section class="stack-strip">
	<p class="strip-label">{label}</p>
	<div class="strip-items">
		{#each items as item}
			<span class="strip-item">{item}</span>
		{/each}
	</div>
</section>

<style>
	.stack-strip {
		position: relative;
		z-index: 2;
		border-top: 1px solid #0c1420;
		border-bottom: 1px solid #0c1420;
		padding: 1.5rem 2.5rem;
		display: flex;
		align-items: center;
		gap: 2rem;
		overflow: hidden;
	}

	.strip-label {
		font-family: 'JetBrains Mono', monospace;
		font-size: 9.5px;
		color: #1a2535;
		letter-spacing: 0.06em;
		white-space: nowrap;
	}

	.strip-items {
		display: flex;
		flex-wrap: wrap;
	}

	.strip-item {
		font-family: 'JetBrains Mono', monospace;
		font-size: 10.5px;
		color: #1e2e40;
		padding: 4px 14px;
		border-right: 1px solid #0c1420;
		white-space: nowrap;
		transition: color 0.15s;
	}
	.strip-item:hover {
		color: #3a5a7e;
	}
	.strip-item:last-child {
		border-right: none;
	}
</style>
