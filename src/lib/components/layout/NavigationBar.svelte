<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';

	import Button from '$lib/components/ui/Button.svelte';
	import ModeToggle from '../colors/ModeToggle.svelte';
	import ThemeSwitcher from '../colors/ThemeSwitcher.svelte';
	import Menu from 'lucide-svelte/icons/menu';
	import X from 'lucide-svelte/icons/x';
	import { form } from '$app/server';

	let {
		variant = 'standard',
		links = [],
		brand,
		field,
		actions
	}: {
		/**
		 * standard   — sticky, full-width, bg-surface, border-bottom
		 * floating   — fixed pill that hovers above content, glass backdrop
		 * borderless — sticky, fully transparent, no border
		 */
		variant?: 'standard' | 'floating' | 'borderless';
		links?: { path: string; label: string }[];
		field?: Snippet;
		brand?: Snippet;
		actions?: Snippet;
	} = $props();

	const isActive = (path: string) => page.url.pathname === path;

	let mobileOpen = $state(false);
	const toggleMobile = () => (mobileOpen = !mobileOpen);
	const closeMobile = () => (mobileOpen = false);
</script>

<!-- Floating variant renders a positioned wrapper -->
{#if variant === 'floating'}
	<div class="floating-track" aria-hidden="true"></div>
{/if}

<header class="navbar" data-variant={variant} aria-label="Main navigation">
	<div class="navbar-inner">
		<!-- ── Brand ── -->
		<div class="nav-brand">
			<Button variant="link" href="/" onclick={closeMobile}>
				{#if brand}
					{@render brand()}
				{:else}
					<span class="brand-wordmark">sandem</span>
				{/if}
			</Button>
		</div>

		<!-- ── Desktop links ── -->
		<nav class="nav-links" aria-label="Site links">
			<ul>
				{#each links as link}
					<li>
						<Button variant="link" href={link.path} active={isActive(link.path)}>
							{link.label}
						</Button>
					</li>
				{/each}
			</ul>
		</nav>
		<!-- ── Search bar ── -->
		{#if field}
			<from>
				{@render field()}
			</from>
		{/if}

		<!-- ── Right-side controls ── -->
		<div class="nav-right">
			{#if actions}
				<div class="nav-actions">{@render actions()}</div>
			{/if}
			<div class="nav-controls">
				<ModeToggle />
				<ThemeSwitcher />
			</div>

			<!-- Hamburger — mobile only -->
			<button
				class="hamburger"
				onclick={toggleMobile}
				aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
				aria-expanded={mobileOpen}
				aria-controls="mobile-menu"
			>
				{#if mobileOpen}
					<X size={20} strokeWidth={2} />
				{:else}
					<Menu size={20} strokeWidth={2} />
				{/if}
			</button>
		</div>
	</div>

	<!-- ── Mobile drawer ── -->
	{#if mobileOpen}
		<nav class="mobile-menu" id="mobile-menu" aria-label="Mobile navigation">
			<ul>
				{#each links as link}
					<li>
						<a href={link.path} class:active={isActive(link.path)} onclick={closeMobile}>
							{link.label}
						</a>
					</li>
				{/each}
			</ul>
			{#if actions}
				<div class="mobile-actions">
					{@render actions()}
				</div>
			{/if}
		</nav>
	{/if}
</header>

<!-- Click-outside backdrop for mobile -->
{#if mobileOpen}
	<div class="mobile-backdrop" role="presentation" onclick={closeMobile}></div>
{/if}

<style>
	/* ── Shared base ─────────────────────────────────────────────── */
	.navbar {
		width: 100%;
		z-index: 100;
	}

	.navbar-inner {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 1.5rem;
		height: var(--navbar-height);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1.5rem;
	}

	.nav-brand {
		display: flex;
		align-items: center;
		flex-shrink: 0;
	}

	.brand-wordmark {
		font-size: 0.9rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--text);
	}

	.nav-links ul {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		list-style: none;
	}

	.nav-right {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
	}

	.nav-controls {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.nav-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding-right: 0.5rem;
		border-right: 1px solid var(--border);
	}

	/* ── Variant: standard ───────────────────────────────────────── */
	.navbar[data-variant='standard'] {
		position: sticky;
		top: 0;
		background-color: var(--bg);
		border-bottom: 1px solid var(--border);
		transition:
			background-color var(--time) var(--ease),
			border-color var(--time) var(--ease);
	}

	/* ── Variant: floating ───────────────────────────────────────── */
	.floating-track {
		height: var(--navbar-height);
		pointer-events: none;
	}

	.navbar[data-variant='floating'] {
		position: fixed;
		top: 0.75rem;
		left: 50%;
		transform: translateX(-50%);
		width: min(calc(100% - 2rem), 1200px);
		border-radius: var(--radius);
		border: 1px solid var(--glass-border);
		background-color: var(--glass-bg);
		backdrop-filter: var(--backdrop-blur);
		-webkit-backdrop-filter: var(--backdrop-blur);
		box-shadow: var(--shadow);
		transition:
			background-color var(--time) var(--ease),
			border-color var(--time) var(--ease),
			box-shadow var(--time) var(--ease);
	}

	.navbar[data-variant='floating'] .navbar-inner {
		padding: 0 1.25rem;
	}

	/* ── Variant: borderless ─────────────────────────────────────── */
	.navbar[data-variant='borderless'] {
		position: sticky;
		top: 0;
		background-color: transparent;
		border-bottom: 1px solid transparent;
	}

	/* ── Hamburger button ─────────────────────────────────────────── */
	.hamburger {
		display: none;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: var(--radius-sm);
		color: var(--muted);
		background: transparent;
		border: none;
		cursor: pointer;
		transition:
			color var(--time) var(--ease),
			background-color var(--time) var(--ease);
	}

	.hamburger:hover {
		color: var(--text);
		background-color: var(--mg);
	}

	/* ── Mobile menu drawer ──────────────────────────────────────── */
	.mobile-menu {
		border-top: 1px solid var(--border);
		background-color: var(--mg);
		padding: 0.75rem 1.5rem 1.25rem;
	}

	.mobile-menu ul {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.mobile-menu a {
		display: block;
		padding: 0.6rem 0.75rem;
		border-radius: var(--radius-sm);
		font-size: 0.9rem;
		color: var(--muted);
		transition:
			color var(--time) var(--ease),
			background-color var(--time) var(--ease);
	}

	.mobile-menu a:hover,
	.mobile-menu a.active {
		color: var(--text);
		background-color: var(--fg);
	}

	.mobile-menu a.active {
		font-weight: 600;
	}

	.mobile-actions {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* Click-outside overlay — invisible, captures taps */
	.mobile-backdrop {
		position: fixed;
		inset: 0;
		z-index: 99;
		background: transparent;
	}

	/* ── Responsive — hide links, show hamburger ─────────────────── */
	@media (max-width: 768px) {
		.nav-links {
			display: none;
		}

		.hamburger {
			display: flex;
		}

		.nav-actions {
			display: none;
		}

		.navbar[data-variant='floating'] {
			top: 0;
			border-radius: 0;
			width: 100%;
			left: 0;
			transform: none;
			border-left: none;
			border-right: none;
			border-top: none;
		}
	}
</style>
