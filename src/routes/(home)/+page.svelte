<script lang="ts">
	import PageHeader from '$lib/components/layout/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	import { LayoutIcon, ArrowArcRightIcon } from 'phosphor-svelte';
</script>

<!-- ── 1. Hero header ─────────────────────────────────────────────── -->
<PageHeader
	variant="hero"
	heading="sandem"
	subtitle="A browser-native dev environment. Write code, run processes, and collaborate — no server required."
>
	{#snippet badge()}
		<LayoutIcon size={13} />
		<span>browser-native IDE</span>
	{/snippet}

	{#snippet redirect()}
		<Button variant="link" href="/docs">docs</Button>
		<Button variant="link" href="https://github.com" target="_blank" rel="noopener">github</Button>
	{/snippet}

	<Button variant="outline" href="/projects">open workspace <ArrowArcRightIcon size={13} /></Button>
</PageHeader>
