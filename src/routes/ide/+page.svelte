<script lang="ts">
	import { onMount } from 'svelte';
	import { WebContainer } from '@webcontainer/api';
	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
	import { useConvexClient } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';

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
	let project: any = $state(); // The database project object

	onMount(() => {
		async function init() {
			try {
				if (!user?.id) {
					error = 'You must be logged in to access the IDE.';
					return;
				}

				// 1. Convert template format into an array for Convex
				const filesArray = Object.entries(VITE_REACT_TEMPLATE.files).map(([name, node]) => ({
					name,
					contents: (node as { file: { contents: string } }).file.contents
				}));

				// 2. Fetch or Create their permanent project
				project = await convexClient.mutation(api.projects.getOrCreateUserWorkspace, {
					ownerId: user.id,
					defaultFiles: filesArray,
					entry: VITE_REACT_TEMPLATE.entry,
					visibleFiles: VITE_REACT_TEMPLATE.visibleFiles
				});

				// 3. Convert Convex array format back to WebContainer's expected file tree
				const wcFiles: Record<string, any> = {};
				for (const f of project.files) {
					wcFiles[f.name] = { file: { contents: f.contents } };
				}

				// 4. Boot WebContainer with the USER'S permanently saved files!
				const instance = await WebContainer.boot();
				await instance.mount(wcFiles);
				wc = instance;
			} catch (e) {
				console.error('WebContainer boot failed:', e);
				error = 'Failed to boot WebContainer.';
			}
		}
		init();
	});
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
