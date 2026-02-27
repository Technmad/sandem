<script lang="ts">
	import { onMount } from 'svelte';

	/*
	 * Each theme entry: the key stored in localStorage/data-theme,
	 * plus a sample color for the dot swatch.
	 * The `light` and `dark` swatches represent the mid-surface (--mg)
	 * of each theme so the dot is visually representative.
	 */
	const themes: { id: string; label: string; light: string; dark: string }[] = [
		{ id: 'default', label: 'Default', light: 'hsl(0 0% 90%)', dark: 'hsl(0 0% 8%)' },
		{ id: 'abyss', label: 'Abyss', light: 'hsl(215 28% 94%)', dark: 'hsl(222 42% 7%)' },
		{ id: 'forest', label: 'Forest', light: 'hsl(130 28% 91%)', dark: 'hsl(130 38% 8%)' },
		{ id: 'solar', label: 'Solar', light: 'hsl(38 50% 91%)', dark: 'hsl(22 52% 10%)' },
		{ id: 'ocean', label: 'Ocean', light: 'hsl(205 40% 91%)', dark: 'hsl(218 54% 9%)' },
		{ id: 'rose', label: 'Rose', light: 'hsl(340 30% 92%)', dark: 'hsl(340 38% 8%)' },
		{ id: 'midnight', label: 'Midnight', light: 'hsl(255 25% 93%)', dark: 'hsl(252 42% 8%)' }
	];

	let currentTheme = $state('default');
	let currentMode = $state<'light' | 'dark'>('dark');
	let popoverOpen = $state(false);

	onMount(() => {
		const savedTheme = localStorage.getItem('theme');
		const savedMode = localStorage.getItem('mode') as 'light' | 'dark' | null;

		if (savedTheme && themes.some((t) => t.id === savedTheme)) {
			currentTheme = savedTheme;
		}
		if (savedMode) {
			currentMode = savedMode;
		}

		// Listen for mode changes from ModeToggle
		const observer = new MutationObserver(() => {
			const mode = document.documentElement.getAttribute('data-mode') as 'light' | 'dark' | null;
			if (mode && mode !== currentMode) {
				currentMode = mode;
			}
		});

		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ['data-mode']
		});
		return () => observer.disconnect();
	});

	$effect(() => {
		document.documentElement.setAttribute('data-theme', currentTheme);
		localStorage.setItem('theme', currentTheme);
	});

	function select(id: string) {
		currentTheme = id;
		popoverOpen = false;
	}

	function getSwatchColor(theme: (typeof themes)[0]) {
		return currentMode === 'dark' ? theme.dark : theme.light;
	}

	// Close on outside click
	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') popoverOpen = false;
	}
</script>

<svelte:window onkeydown={onKeydown} />

<div class="theme-switcher">
	<button
		class="swatch-trigger"
		onclick={() => (popoverOpen = !popoverOpen)}
		aria-label="Switch theme"
		aria-expanded={popoverOpen}
		aria-haspopup="listbox"
		title="Switch theme"
	>
		<!-- Active theme dot -->
		<span
			class="swatch-dot active-dot"
			style:background={getSwatchColor(themes.find((t) => t.id === currentTheme)!)}
		></span>
	</button>

	{#if popoverOpen}
		<!-- Invisible backdrop to catch outside clicks -->
		<div class="popover-backdrop" role="presentation" onclick={() => (popoverOpen = false)}></div>

		<div class="popover" role="listbox" aria-label="Theme options">
			{#each themes as theme}
				<button
					class="swatch-item"
					class:current={theme.id === currentTheme}
					role="option"
					aria-selected={theme.id === currentTheme}
					onclick={() => select(theme.id)}
					title={theme.label}
				>
					<span class="swatch-dot" style:background={getSwatchColor(theme)}></span>
					<span class="swatch-label">{theme.label}</span>
					{#if theme.id === currentTheme}
						<span class="check" aria-hidden="true">✓</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.theme-switcher {
		position: relative;
	}

	/* ── Trigger button — just a colored dot ─────────────────── */
	.swatch-trigger {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: var(--radius-sm);
		border: 1px solid var(--border);
		background: var(--fg);
		cursor: pointer;
		transition:
			border-color var(--time) var(--ease),
			background-color var(--time) var(--ease);
	}

	.swatch-trigger:hover {
		border-color: var(--glint);
		background: var(--mg);
	}

	/* ── Swatch dot ──────────────────────────────────────────── */
	.swatch-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		display: inline-block;
		flex-shrink: 0;
		border: 1px solid var(--border);
	}

	.active-dot {
		width: 12px;
		height: 12px;
	}

	/* ── Backdrop ────────────────────────────────────────────── */
	.popover-backdrop {
		position: fixed;
		inset: 0;
		z-index: 199;
	}

	/* ── Popover ─────────────────────────────────────────────── */
	.popover {
		position: absolute;
		top: calc(100% + 0.5rem);
		right: 0;
		z-index: 200;
		min-width: 160px;
		background: var(--fg);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow);
		padding: 0.375rem;
		display: flex;
		flex-direction: column;
		gap: 1px;
		/* Animate in */
		animation: popover-in var(--time) var(--ease-out) both;
	}

	@keyframes popover-in {
		from {
			opacity: 0;
			transform: translateY(-4px) scale(0.97);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	/* ── Swatch items inside popover ──────────────────────────── */
	.swatch-item {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.45rem 0.6rem;
		border-radius: var(--radius-sm);
		width: 100%;
		background: transparent;
		border: none;
		cursor: pointer;
		font-size: 0.78rem;
		color: var(--muted);
		transition:
			background-color var(--time) var(--ease),
			color var(--time) var(--ease);
	}

	.swatch-item:hover {
		background: var(--mg);
		color: var(--text);
	}

	.swatch-item.current {
		color: var(--text);
		font-weight: 600;
	}

	.swatch-label {
		flex: 1;
		text-align: left;
	}

	.check {
		font-size: 0.7rem;
		color: var(--accent);
		margin-left: auto;
	}
</style>
