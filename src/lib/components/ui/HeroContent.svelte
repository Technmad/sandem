<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	const stats = [
		{ value: '~800ms', label: 'container boot' },
		{ value: '0', label: 'cloud VMs' },
		{ value: '∞', label: 'concurrency' }
	];
</script>

<div class="hero-left">
	<div class="eyebrow">
		<div class="eyebrow-dot"></div>
		<span>in-browser · Node.js · collaborative</span>
	</div>

	<h1 class="hero-heading">
		<span class="h-line h-line-1">A full dev</span>
		<span class="h-line h-line-2">environment.</span>
		<span class="h-line h-line-3 accent">In your browser.</span>
	</h1>

	<p class="hero-sub">
		Sandem runs a real Node.js OS in WebAssembly — no cloud VMs, no setup. Just open a project and
		start coding.
	</p>

	<div class="hero-actions">
		<Button variant="primary" href="/projects">
			<svg
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<polygon points="5 3 19 12 5 21 5 3" />
			</svg>
			start building
		</Button>
		<Button variant="ghost-cta" href="/login">sign in free</Button>
	</div>

	<div class="hero-stats">
		{#each stats as stat, i}
			<div class="stat">
				<span class="stat-val">{stat.value}</span>
				<span class="stat-label">{stat.label}</span>
			</div>
			{#if i < stats.length - 1}
				<div class="stat-divider"></div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.eyebrow {
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 10.5px;
		color: #2a3a50;
		letter-spacing: 0.06em;
		margin-bottom: 1.5rem;
		animation: fadeUp 0.5s ease both;
	}

	.eyebrow-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #3b7dd8;
		box-shadow: 0 0 8px #3b7dd860;
		flex-shrink: 0;
	}

	.hero-heading {
		display: flex;
		flex-direction: column;
		margin: 0 0 1.5rem;
	}

	.h-line {
		font-family: 'Syne', sans-serif;
		font-weight: 700;
		font-size: clamp(2.8rem, 5vw, 4.2rem);
		line-height: 1;
		letter-spacing: -0.04em;
		color: #dde4ed;
		display: block;
	}
	.h-line-1 {
		animation: fadeUp 0.5s 0.05s ease both;
	}
	.h-line-2 {
		animation: fadeUp 0.5s 0.12s ease both;
	}
	.h-line-3 {
		animation: fadeUp 0.5s 0.19s ease both;
	}

	.accent {
		color: transparent;
		-webkit-text-stroke: 1.5px #3b7dd8;
	}

	.hero-sub {
		font-size: 0.95rem;
		color: #3a4a5e;
		line-height: 1.75;
		max-width: 400px;
		margin-bottom: 2rem;
		animation: fadeUp 0.5s 0.25s ease both;
	}

	.hero-actions {
		display: flex;
		gap: 12px;
		align-items: center;
		margin-bottom: 2.5rem;
		animation: fadeUp 0.5s 0.3s ease both;
	}

	.hero-stats {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		animation: fadeUp 0.5s 0.35s ease both;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.stat-val {
		font-family: 'JetBrains Mono', monospace;
		font-size: 1.1rem;
		color: #dde4ed;
		font-weight: 400;
	}

	.stat-label {
		font-family: 'JetBrains Mono', monospace;
		font-size: 9.5px;
		color: #1e2e40;
		letter-spacing: 0.05em;
	}

	.stat-divider {
		width: 1px;
		height: 28px;
		background: #0e1521;
		flex-shrink: 0;
	}

	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 600px) {
		.hero-stats {
			flex-wrap: wrap;
		}
	}
</style>
