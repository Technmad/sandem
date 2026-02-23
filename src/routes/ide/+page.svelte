<script lang="ts">
	import { onMount } from 'svelte';
	import { WebContainer, type FileSystemTree } from '@webcontainer/api';
	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import type { Doc } from '$convex/_generated/dataModel.js';

	import Editor from '$lib/components/Editor.svelte';
	import Preview from '$lib/components/Preview.svelte';
	import Terminal from '$lib/components/Terminal.svelte';
	import { VITE_REACT_TEMPLATE } from '$lib/templates.js';

	// Extract the user data that your layout/auth hooks provide
	let { data }: { data: { user?: { id: string } } } = $props();
	let user = $derived(data?.user);

	const convexClient = useConvexClient();

	let wc: WebContainer | undefined = $state();
	let error: string | undefined = $state();
	let project = $state<Doc<'projects'> | null | undefined>(undefined); // The database project object

	let isBooting = false; // Guard to prevent multiple boot attempts

	$effect(() => {
		// Only run init if we have a user, haven't booted yet, and aren't currently booting
		if (user?.id && !wc && !isBooting) {
			isBooting = true;
			init();
		}
	});

	// Move the init function outside of the effect for clarity
	async function init() {
		try {
			// 1. Convert template format
			const filesArray = Object.entries(VITE_REACT_TEMPLATE.files).map(([name, node]) => ({
				name,
				contents: (node as { file: { contents: string } }).file.contents
			}));

			// 2. Fetch or Create workspace
			project = await convexClient.mutation(api.projects.getOrCreateUserWorkspace, {
				ownerId: user!.id,
				defaultFiles: filesArray,
				entry: VITE_REACT_TEMPLATE.entry,
				visibleFiles: VITE_REACT_TEMPLATE.visibleFiles
			});

			if (!project) throw new Error('Failed to load or create workspace.');

			// 3. Prepare WebContainer files
			const wcFiles: import('@webcontainer/api').FileSystemTree = {};
			for (const f of project.files) {
				wcFiles[f.name] = { file: { contents: f.contents } };
			}

			// 4. Boot WebContainer
			const instance = await WebContainer.boot();
			await instance.mount(wcFiles);
			wc = instance;
		} catch (e) {
			console.error('WebContainer boot failed:', e);
			error = 'Failed to boot WebContainer.';
			isBooting = false;
		}
	}
</script>

{#if error}
	<div class="status-screen error">{error}</div>
{:else if !wc || !project}
	<div class="status-screen">
		<div class="spinner"></div>
		<p>Loading your permanent workspace...</p>
	</div>
{:else}
	<div class="app-container">
		<PaneGroup direction="horizontal">
			<Pane defaultSize={50}>
				<PaneGroup direction="vertical">
					<Pane defaultSize={70}>
						<div class="pane-content editor-pane">
							<Editor webcontainer={wc} {project} />
						</div>
					</Pane>
					<PaneResizer class="resizer-horizontal" />
					<Pane defaultSize={30}>
						<div class="pane-content terminal-pane">
							<Terminal webcontainer={wc} />
						</div>
					</Pane>
				</PaneGroup>
			</Pane>
			<PaneResizer class="resizer-vertical" />
			<Pane defaultSize={50}>
				<div class="pane-content preview-pane">
					<Preview webcontainer={wc} />
				</div>
			</Pane>
		</PaneGroup>
	</div>
{/if}

<style>
	/* --- Container & Pane Helpers --- */
	.app-container {
		height: 100vh;
		width: 100%;
		background-color: #1e1e1e;
	}

	.pane-content {
		height: 100%;
		overflow: hidden;
	}

	/* --- Loading Screen Styles --- */
	.status-screen {
		height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: #1e1e1e;
		color: #fff;
		font-family: sans-serif;
	}

	.error {
		color: #ff5f56;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(255, 255, 255, 0.1);
		border-radius: 50%;
		border-top-color: #007acc;
		animation: spin 1s ease-in-out infinite;
		margin-bottom: 20px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Generic Resizer Styles from paneforge */
	:global(.resizer-horizontal) {
		height: 4px;
		background: #2d2d2d;
		cursor: row-resize;
	}
	:global(.resizer-vertical) {
		width: 4px;
		background: #2d2d2d;
		cursor: col-resize;
	}
	:global(.resizer-horizontal:hover),
	:global(.resizer-vertical:hover) {
		background: #007acc;
	}
</style>
