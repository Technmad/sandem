<script lang="ts">
	import HeroContent from '$lib/components/ui/HeroContent.svelte';
	import IdeWindow from '$lib/components/ui/IdeWindow.svelte';
	import StackStrip from '$lib/components/ui/StackStrip.svelte';

	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import PageSection from '$lib/components/layout/PageSection.svelte';
	import PageFooter from '$lib/components/layout/PageFooter.svelte';

	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	import LayoutGrid from 'lucide-svelte/icons/layout-grid';
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import GamePad from 'lucide-svelte/icons/gamepad';
	import Terminal from 'lucide-svelte/icons/terminal';

	// ── Feature cards ────────────────────────────────────────────────
	const features: {
		id: string;
		variant?: 'feature-large';
		title: string;
		description: string;
		pill?: string;
	}[] = [
		{
			id: 'webcontainer',
			variant: 'feature-large',
			title: 'WebContainer API',
			pill: 'zero server overhead',
			description:
				'A full Node.js OS running in WebAssembly inside your tab. Install packages, run build tools, spawn processes — all client-side.'
		},
		{
			id: 'collab',
			title: 'Real-time collab',
			description:
				'Liveblocks + Yjs keeps every cursor and keystroke in sync across all participants instantly.'
		},
		{
			id: 'monaco',
			title: 'Monaco editor',
			description:
				'The same editor that powers VS Code, with syntax highlighting, multi-file tabs, and autosave to Convex.'
		},
		{
			id: 'terminal',
			title: 'Integrated terminal',
			description:
				'xterm.js wired directly to the container shell. Run <code>npm install</code>, watch files, do anything.'
		},
		{
			id: 'convex',
			title: 'Convex backend',
			description:
				'Projects persist to a real-time database. Open on any device and pick up exactly where you left off.'
		}
	];

	// ── Stack marquee ────────────────────────────────────────────────
	const stackItems = [
		'SvelteKit',
		'Convex',
		'WebContainer API',
		'Monaco Editor',
		'Liveblocks',
		'Yjs',
		'xterm.js',
		'better-auth'
	];

	// ── Site footer links ─────────────────────────────────────────────
	const footerLinks = [
		{ href: '/projects', label: 'workspace' },
		{ href: '/login', label: 'sign in' },
		{ href: 'https://github.com', label: 'github', external: true }
	];
</script>

<!-- ── 1. Hero header ─────────────────────────────────────────────── -->
<PageHeader
	variant="hero"
	heading="sandem"
	subtitle="A browser-native dev environment. Write code, run processes, and collaborate — no server required."
>
	{#snippet badge()}
		<LayoutGrid size={13} strokeWidth={1.5} />
		<span>browser-native IDE</span>
	{/snippet}

	{#snippet redirect()}
		<Button variant="link" href="/docs">docs</Button>
		<Button variant="link" href="https://github.com" target="_blank" rel="noopener">github</Button>
	{/snippet}

	<Button variant="nav" href="/projects"
		>open workspace <ArrowRight size={13} strokeWidth={2.5} /></Button
	>
</PageHeader>

<!-- ── 2. Split: hero content + IDE preview ───────────────────────── -->
<PageSection variant="split">
	<HeroContent />
</PageSection>

<!-- ── 3. Features bento grid ─────────────────────────────────────── -->
<PageSection
	variant="features"
	label="why sandem"
	heading="Everything you need.<br />Nothing you don't."
>
	{#each features as f (f.id)}
		<Card variant={f.variant ?? 'feature'} title={f.title} pill={f.pill}>
			<p>{@html f.description}</p>
			{#snippet icon()}
				<GamePad size={13} strokeWidth={1.5} />
			{/snippet}
		</Card>
	{/each}

	<Card variant="feature-cta">
		<p class="cta-label">ready to try it?</p>
		<Button variant="feat-cta" href="/projects">
			open workspace <ArrowRight size={13} strokeWidth={2.5} />
		</Button>
	</Card>
</PageSection>

<!-- ── 4. Stack strip ─────────────────────────────────────────────── -->
<StackStrip items={stackItems} />

<!-- ── 5. CTA footer ──────────────────────────────────────────────── -->
<PageFooter
	variant="default"
	heading="Start building today."
	subtitle="Spin up a project in seconds. No installs, no config, no waiting."
>
	{#snippet icon()}
		<Terminal size={18} strokeWidth={1.5} />
	{/snippet}

	<Button variant="nav" href="/projects">
		open workspace <ArrowRight size={13} strokeWidth={2.5} />
	</Button>
	<Button variant="link" href="/docs">read the docs</Button>
</PageFooter>

<!-- ── 6. Site footer ─────────────────────────────────────────────── -->
<PageFooter
	variant="site"
	version="v0.8.0"
	links={footerLinks}
	copy="MIT licensed · built in public"
>
	{#snippet brand()}
		<LayoutGrid size={13} strokeWidth={1.5} />
		<span>sandem</span>
	{/snippet}
</PageFooter>


