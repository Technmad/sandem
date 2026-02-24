<script lang="ts">
	import { setIDEContext } from '$lib/utils/ide-context.js';
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import { WebContainer } from '@webcontainer/api';
	import type { Doc } from '$convex/_generated/dataModel.js';
	import { onMount, onDestroy } from 'svelte';

	import { createSvelteAuthClient } from '$lib/svelte/index.js';
	import { authClient } from '$lib/utils/auth-client.js';
	import { projectFilesToFSTree } from '$lib/utils/filesystem-utils.js';

	createSvelteAuthClient({ authClient });

	let { children, data } = $props();

	const projectQuery = useQuery(api.projects.getProject, () => ({ id: data.projectId }));

	let webcontainerInstance = $state<WebContainer | undefined>();
	let ready = $state(false);
	let loadingMessage = $state('Fetching project…');
	let fatalError = $state<string | null>(null);

	let containerBootPromise: Promise<WebContainer>;
	let booted = false;

	onMount(() => {
		if (!booted) {
			booted = true;
			containerBootPromise = WebContainer.boot().catch((err) => {
				fatalError = `WebContainer failed to boot: ${err}`;
				throw err;
			});
		}
	});

	onDestroy(() => {
		webcontainerInstance?.teardown();
	});

	setIDEContext({
		getProject: () => {
			if (!projectQuery.data) throw new Error('Project not loaded');
			return projectQuery.data as Doc<'projects'>;
		},
		getWebcontainer: () => {
			if (!webcontainerInstance) throw new Error('WebContainer not ready');
			return webcontainerInstance;
		}
	});

	$effect(() => {
		const project = projectQuery.data;
		if (!project || ready) return;

		(async () => {
			try {
				loadingMessage = 'Booting container…';
				const instance = await containerBootPromise;

				loadingMessage = 'Mounting files…';
				const tree = projectFilesToFSTree(project.files);
				await instance.mount(tree);

				webcontainerInstance = instance;
				ready = true;
			} catch (err) {
				if (!fatalError) fatalError = String(err);
			}
		})();
	});
</script>

{#if fatalError}
	<div class="loading-screen error">
		<svg
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<circle cx="12" cy="12" r="10"></circle>
			<line x1="12" y1="8" x2="12" y2="12"></line>
			<line x1="12" y1="16" x2="12.01" y2="16"></line>
		</svg>
		<p>{fatalError}</p>
		<button onclick={() => window.location.reload()}>Reload page</button>
	</div>
{:else if !ready}
	<div class="loading-screen">
		<div class="spinner"></div>
		<p>{loadingMessage}</p>
	</div>
{:else}
	{@render children()}
{/if}

<style>
	.loading-screen {
		display: flex;
		flex-direction: column;
		height: 100vh;
		align-items: center;
		justify-content: center;
		gap: 12px;
		background: #151515;
		color: #6b7280;
		font-family: 'JetBrains Mono', monospace;
		font-size: 13px;
	}
	.loading-screen.error {
		color: #f87171;
	}
	.loading-screen p {
		max-width: 480px;
		text-align: center;
		line-height: 1.6;
	}
	.loading-screen button {
		margin-top: 4px;
		padding: 6px 16px;
		background: #2d2d2d;
		border: 1px solid #3c3c3c;
		border-radius: 4px;
		color: #d4d4d4;
		cursor: pointer;
		font-size: 12px;
		font-family: inherit;
	}
	.loading-screen button:hover {
		background: #3c3c3c;
	}
	.spinner {
		width: 22px;
		height: 22px;
		border: 2px solid #2d2d2d;
		border-top-color: #3794ff;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
