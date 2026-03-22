<script lang="ts">
	import { Menubar, Accordion } from 'bits-ui';
	import { Search, Plus } from '@lucide/svelte';

	import ModeToggle from '$lib/components/ui/theme/ModeToggle.svelte';
	import ThemeSwitcher from '$lib/components/ui/theme/ThemeSwitcher.svelte';

	import PageSection from '$lib/components/ui/layout/PageSection.svelte';

	import AccordionItem from '$lib/components/ui/primitives/AccordionItem.svelte';
	import Avatar from '$lib/components/ui/primitives/Avatar.svelte';
	import Button from '$lib/components/ui/primitives/Button.svelte';
	import Card from '$lib/components/ui/primitives/Card.svelte';
	import DropDown from '$lib/components/ui/inputs/DropDown.svelte';
	import FileTree from '$lib/components/ui/editor/FileTree.svelte';
	import Form from '$lib/components/ui/primitives/Form.svelte';
	import Grid from '$lib/components/ui/primitives/Grid.svelte';
	import MenuBar from '$lib/components/ui/navigation/MenuBar.svelte';
	import SearchBar from '$lib/components/ui/inputs/SearchBar.svelte';
	import Tabs from '$lib/components/ui/primitives/Tabs.svelte';

	let search = $state('');
	let selectedTab = $state('overview');
	let dropdownOpen = $state(false);
	let submitted = $state('Nothing submitted yet');

	const tabs = $derived([
		{ id: 'overview', label: 'Overview', active: selectedTab === 'overview' },
		{ id: 'components', label: 'Components', active: selectedTab === 'components' },
		{ id: 'ide', label: 'IDE Demo', active: selectedTab === 'ide' }
	]);
</script>

<div class="shop-showcase">
	<PageSection heading="Sandem Component Showcase" label="shop showcase" variant="default">
		<div class="intro">
			<p>
				Every component is rendered with placeholder content so you can visually inspect states.
			</p>
		</div>
	</PageSection>

	<PageSection heading="UI primitives" variant="grid">
		<Card title="Buttons" ratio={4 / 3} variant="outline" tone="accent">
			<div class="stack">
				<Button>Default</Button>
				<Button variant="outline" tone="info">Outline</Button>
				<Button variant="ghost" tone="warning">Ghost</Button>
				<Button variant="link" tone="success">Link</Button>
			</div>
		</Card>

		<Card title="Avatar + Search" ratio={4 / 3} variant="default">
			<div class="stack">
				<Avatar
					src="https://i.pravatar.cc/80?img=12"
					alt="Placeholder user"
					fallback="JD"
					size="lg"
					shape="circle"
				/>
				<SearchBar
					bind:value={search}
					placeholder="Search components"
					aria-label="Search components"
					variant="outline"
					tone="info"
				>
					{#snippet icon()}<Search size={14} />{/snippet}
				</SearchBar>
			</div>
		</Card>

		<Card title="DropDown + MenuBar" ratio={4 / 3} variant="outline" tone="info">
			<div class="stack">
				<DropDown
					label="Quick actions"
					bind:open={dropdownOpen}
					variant="outline"
					tone="accent"
					items={[
						{ label: 'Open', value: 'open' },
						{ label: 'Duplicate', value: 'duplicate' },
						{ label: 'Archive', value: 'archive' }
					]}
				>
					{#snippet children()}
						Actions
					{/snippet}
				</DropDown>

				<Menubar.Root>
					<MenuBar
						text="Project"
						tone="accent"
						items={[
							{ label: 'Rename', value: 'rename' },
							{ label: 'Share', value: 'share' }
						]}
					/>
				</Menubar.Root>
			</div>
		</Card>

		<Card title="Tabs + Accordion" ratio={4 / 3} variant="default" tone="success">
			<div class="stack">
				<Tabs variant="pills" tone="accent" {tabs} onSelect={(id) => (selectedTab = id)} />
				<div class="accordion-root">
					{#if selectedTab === 'overview'}
						<Accordion.Root type="single" value="overview-1">
							<AccordionItem value="overview-1" title="Design system">
								<p>Semantic token layering and reusable component shells.</p>
							</AccordionItem>
						</Accordion.Root>
					{:else if selectedTab === 'components'}
						<Accordion.Root type="single" value="components-1">
							<AccordionItem value="components-1" title="Self-contained APIs">
								<p>Each component owns layout, variants and tone mapping via semantic tokens.</p>
							</AccordionItem>
						</Accordion.Root>
					{:else}
						<Accordion.Root type="single" value="ide-1">
							<AccordionItem value="ide-1" title="Runtime integrations">
								<p>Monaco, terminal, preview and fake WebContainer hooks.</p>
							</AccordionItem>
						</Accordion.Root>
					{/if}
				</div>
			</div>
		</Card>
	</PageSection>

	<PageSection heading="Forms, grid and standalone widgets" variant="split">
		{#snippet children()}
			<div class="stack">
				<Form
					preset="card"
					variant="accent"
					ariaLabel="Showcase form"
					onsubmit={() => {
						submitted = `Submitted at ${new Date().toLocaleTimeString()}`;
					}}
				>
					<label class="field">
						<span>Project name</span>
						<input placeholder="my-cool-app" />
					</label>
					<label class="field">
						<span>Owner email</span>
						<input type="email" placeholder="owner@example.com" />
					</label>
					<Button type="submit" tone="accent">Submit form</Button>
				</Form>
				<p class="muted">{submitted}</p>
			</div>
		{/snippet}
		{#snippet aside()}
			<Grid minWidth="12rem" gap="0.75rem">
				<Button size="sm">Small</Button>
				<Button size="md">Medium</Button>
				<Button size="lg">Large</Button>
				<Button size="icon" aria-label="Add"><Plus size={14} /></Button>
			</Grid>
			<div class="stack top-gap">
				<FileTree variant="compact" />
				<div class="toolbar">
					<ModeToggle />
					<ThemeSwitcher />
				</div>
			</div>
		{/snippet}
	</PageSection>
</div>

<style>
	.shop-showcase {
		display: grid;
		gap: 1rem;
		padding-bottom: 3rem;
	}

	.intro {
		display: grid;
		gap: 0.5rem;
	}
	.intro p,
	.muted {
		margin: 0;
		color: var(--muted);
	}

	.stack {
		display: grid;
		gap: 0.75rem;
	}

	.top-gap {
		margin-top: 1rem;
	}

	.toolbar {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.field {
		display: grid;
		gap: 0.4rem;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.field input {
		padding: 0.6rem 0.7rem;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		background: var(--fg);
		color: var(--text);
	}
</style>
