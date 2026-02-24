<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import PageSection from '$lib/components/layout/PageSection.svelte';
	import ThemeSwitcher from '$lib/components/colors/ThemeSwitcher.svelte';
</script>

<main class="landing-page">
	<PageHeader
		heading="Modern Auth for Svelte"
		subtitle="A robust, themeable starter kit powered by Convex and Better Auth."
	>
		<div class="hero-actions">
			<Button variant="default" size="lg">Get Started</Button>
			<Button variant="outline" size="lg">Documentation</Button>
		</div>
	</PageHeader>

	<PageSection heading="Experience the System">
		<div class="theme-showcase">
			<div class="showcase-text">
				<h3>Truly Semantic</h3>
				<p>
					Toggle between themes to see the entire UI adapt. Our components use
					<strong>CSS Variables</strong> instead of hardcoded classes, making customization effortless.
				</p>
				<ThemeSwitcher />
			</div>

			<div class="preview-card">
				<div class="preview-row">
					<div class="swatch" style="background: var(--accent)"></div>
					<div class="swatch" style="background: var(--highlight)"></div>
					<div class="swatch" style="background: var(--border)"></div>
				</div>
				<p class="preview-label">Active Palette</p>
			</div>
		</div>
	</PageSection>

	<PageSection heading="Features" grid>
		<div class="card">
			<h3>Themable</h3>
			<p>Switch between Forest, Solar, Ocean, and Default themes instantly.</p>
		</div>
		<div class="card">
			<h3>Type Safe</h3>
			<p>Full TypeScript support for props and state using Svelte 5 runes.</p>
		</div>
		<div class="card">
			<h3>Real-time</h3>
			<p>Powered by Convex for instant data syncing across all clients.</p>
		</div>
	</PageSection>
</main>
