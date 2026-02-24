<script lang="ts">
	import { setIDEContext } from '$lib/ide-context.js';
	import { useQuery } from 'convex-svelte';
	import { api } from '$convex/_generated/api.js';
	import { WebContainer } from '@webcontainer/api';
	import type { Doc } from '$convex/_generated/dataModel.js';
	import { onMount } from 'svelte';
	import type { FileSystemTree } from '@webcontainer/api';

	let { children, data } = $props();

	// 1. Reactive query - 'project.data' will update as Convex syncs
	// This ensures that when SvelteKit updates 'data', the query refetches.
	const project = useQuery(api.projects.getProject, () => ({
		id: data.projectId
	}));

	// 2. WebContainer state
	let webcontainerInstance = $state<WebContainer | undefined>();

	// Add a derived state to transform Convex files to WebContainer tree
	const fileTree = $derived.by(() => {
		if (!project.data) return {};
		const tree: FileSystemTree = {};
		project.data.files.forEach((file) => {
			tree[file.name] = {
				file: { contents: file.contents }
			};
		});
		return tree;
	});

	onMount(async () => {
		const instance = await WebContainer.boot();
		// Wait for Convex data to be ready, then mount
		if (project.data) {
			await instance.mount(fileTree);
		}
		webcontainerInstance = instance;
	});

	// 3. Pass closures to the context to avoid "capturing" initial null values
	setIDEContext({
		getProject: () => {
			if (!project.data) throw new Error('Project not loaded');
			return project.data as Doc<'projects'>;
		},
		getWebcontainer: () => {
			if (!webcontainerInstance) throw new Error('WebContainer not booted');
			return webcontainerInstance;
		}
	});
</script>

{#if project.data && webcontainerInstance}
	{@render children()}
{:else}
	<div class="loading-screen">
		<p>{!project.data ? 'Fetching Project...' : 'Booting Container...'}</p>
	</div>
{/if}

<style>
	.loading-screen {
		display: flex;
		height: 100vh;
		align-items: center;
		justify-content: center;
		background: #1e1e1e;
		color: white;
		font-family: sans-serif;
	}
</style>
