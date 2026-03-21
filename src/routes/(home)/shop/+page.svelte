<script lang="ts">
	import { onMount } from 'svelte';
	import { Menubar, Accordion } from 'bits-ui';
	import { Search, Plus } from '@lucide/svelte';

	import ModeToggle from '$lib/components/ui/theme/ModeToggle.svelte';
	import ThemeSwitcher from '$lib/components/ui/theme/ThemeSwitcher.svelte';

	import PageSection from '$lib/components/ui/layout/PageSection.svelte';
	import RepoPaneLayout from '$lib/components/ui/workspace/RepoPaneLayout.svelte';

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

	import ActivityBar from '$lib/components/ide/workspace/ActivityBar.svelte';
	import Sidebar from '$lib/components/ide/workspace/Sidebar.svelte';
	import Editor from '$lib/components/ide/panes/Editor.svelte';
	import Terminal from '$lib/components/ide/panes/Terminal.svelte';
	import Preview from '$lib/components/ide/panes/Preview.svelte';
	import AppHeader from '$lib/components/ui/navigation/AppHeader.svelte';

	import { activity } from '$lib/stores/activity/activityStore.svelte.js';
	import { createPanelsState, setPanelsContext } from '$lib/stores/panel/panelStore.svelte.js';
	import { setIDEContext } from '$lib/context/ide/ide-context.js';

	let search = $state('');
	let selectedTab = $state('overview');
	let dropdownOpen = $state(false);
	let submitted = $state('Nothing submitted yet');

	const tabs = $derived([
		{ id: 'overview', label: 'Overview', active: selectedTab === 'overview' },
		{ id: 'components', label: 'Components', active: selectedTab === 'components' },
		{ id: 'ide', label: 'IDE Demo', active: selectedTab === 'ide' }
	]);

	const panels = createPanelsState();

	setPanelsContext(panels);

	type Entry = { name: string; directory: boolean };

	let fileStore = $state<Record<string, string>>({
		'demo/package.json': '{\n  "name": "component-showcase",\n  "scripts": { "dev": "vite" }\n}',
		'demo/src/main.ts': 'console.log("Shop showcase loaded")',
		'demo/src/App.svelte': '<h1>Shop route IDE preview</h1>',
		'demo/src/app.css': ':root { color: white; background: #101012; }',
		'demo/README.md': '# Placeholder demo project\n\nGenerated for component showcase.'
	});

	let folders = $state<Set<string>>(new Set(['.', 'demo', 'demo/src']));

	function normalize(path: string) {
		if (path === '.') return '.';
		return path.replace(/^\.\//, '').replace(/\/+$/, '');
	}

	function collectEntries(dirPath: string): Entry[] {
		const dir = normalize(dirPath);
		const prefix = dir === '.' ? '' : `${dir}/`;
		const names = new Map<string, Entry>();

		for (const folder of folders) {
			if (folder === '.' || !folder.startsWith(prefix)) continue;
			const rest = folder.slice(prefix.length);
			if (!rest || rest.includes('/')) continue;
			names.set(rest, { name: rest, directory: true });
		}

		for (const filePath of Object.keys(fileStore)) {
			if (!filePath.startsWith(prefix)) continue;
			const rest = filePath.slice(prefix.length);
			if (!rest) continue;
			const first = rest.split('/')[0];
			if (!first) continue;
			names.set(first, {
				name: first,
				directory: rest.includes('/') ? true : false
			});
		}

		return [...names.values()].sort((a, b) => {
			if (a.directory !== b.directory) return a.directory ? -1 : 1;
			return a.name.localeCompare(b.name);
		});
	}

	type Listener = (port: number, url: string) => void;
	const listeners = new Set<Listener>();

	const fakeWebContainer = {
		fs: {
			async readdir(path: string, options?: { withFileTypes?: boolean }) {
				const entries = collectEntries(path);
				if (!options?.withFileTypes) {
					return entries.map((entry) => entry.name);
				}
				return entries.map((entry) => ({
					name: entry.name,
					isDirectory: () => entry.directory
				}));
			},
			async readFile(path: string) {
				return fileStore[normalize(path)] ?? '';
			},
			async writeFile(path: string, content: string) {
				fileStore = { ...fileStore, [normalize(path)]: content };
			},
			async mkdir(path: string, options?: { recursive?: boolean }) {
				const target = normalize(path);
				if (target === '.') return;
				if (options?.recursive) {
					const parts = target.split('/');
					let current = '';
					for (const part of parts) {
						current = current ? `${current}/${part}` : part;
						folders.add(current);
					}
					folders = new Set(folders);
					return;
				}
				folders.add(target);
				folders = new Set(folders);
			}
		},
		on(event: string, callback: Listener) {
			if (event === 'server-ready') listeners.add(callback);
		},
		async spawn(cmd: string, args?: unknown) {
			void cmd;
			void args;
			const encoder = new TextEncoder();
			const output = new ReadableStream<string>({
				start(controller) {
					controller.enqueue('Welcome to fake shell\r\n$ ');
				}
			});

			const input = new WritableStream<string>({
				write(chunk) {
					const text = typeof chunk === 'string' ? chunk : String(chunk);
					void encoder;
					if (text.includes('npm run dev') || text.includes('pnpm dev')) {
						for (const callback of listeners) callback(5173, 'https://demo.sandem.local');
					}
				}
			});

			return {
				input,
				output,
				resize: (size: { cols: number; rows: number }) => {
					void size;
				},
				kill: () => {},
				exit: Promise.resolve(0)
			};
		}
	} as unknown as import('@webcontainer/api').WebContainer;

	setIDEContext({
		getWebcontainer: () => fakeWebContainer,
		getProject: () =>
			({
				files: [
					{ name: 'src/main.ts', contents: fileStore['demo/src/main.ts'] },
					{ name: 'src/App.svelte', contents: fileStore['demo/src/App.svelte'] },
					{ name: 'src/app.css', contents: fileStore['demo/src/app.css'] },
					{ name: 'README.md', contents: fileStore['demo/README.md'] }
				],
				room: undefined
			}) as never,
		getEntryPath: () => 'demo/src/main.ts'
	});

	onMount(() => {
		activity.tab = 'search';
		setTimeout(() => {
			for (const callback of listeners) callback(5173, 'https://demo.sandem.local');
		}, 250);
	});
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

	<PageSection heading="IDE components with fake data" variant="wide">
		<div class="ide-shell">
			<AppHeader />
			<div class="ide-main">
				<ActivityBar {panels} />
				<div class="ide-pane">
					<Sidebar />
				</div>
				<div class="ide-workbench">
					<RepoPaneLayout>
						{#snippet editor()}
							<Editor />
						{/snippet}
						{#snippet terminal()}
							<Terminal />
						{/snippet}
						{#snippet preview()}
							<Preview />
						{/snippet}
					</RepoPaneLayout>
				</div>
			</div>
		</div>
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

	.ide-shell {
		height: 75dvh;
		min-height: 42rem;
		border: 1px solid var(--border);
		border-radius: 0.65rem;
		overflow: hidden;
		background: var(--bg);
		display: grid;
		grid-template-rows: auto 1fr;
	}

	.ide-main {
		display: grid;
		grid-template-columns: auto minmax(15rem, 20rem) 1fr;
		overflow: hidden;
	}

	.ide-pane {
		border-right: 1px solid var(--border);
		min-height: 0;
		overflow: hidden;
	}

	.ide-workbench {
		min-height: 0;
		overflow: hidden;
	}

	.accordion-root {
		display: grid;
		gap: 0.5rem;
	}

	@media (max-width: 1100px) {
		.ide-main {
			grid-template-columns: auto 1fr;
		}

		.ide-pane {
			display: none;
		}
	}
</style>
