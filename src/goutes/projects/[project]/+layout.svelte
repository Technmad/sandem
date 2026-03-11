<script lang="ts">
	import { onMount } from 'svelte';
	import { WebContainer } from '@webcontainer/api';
	import { createSvelteAuthClient } from '$lib/svelte/index.js';
	import { authClient } from '$lib/context/auth-client.js';
	import { setIDEContext } from '$lib/context/ide-context.js';
	import { createProjectMounter } from '$lib/hooks/createProjectMounter.svelte.js';

	let { children, data } = $props();

	// Auth handshake between SSR state and client state
	createSvelteAuthClient({
		authClient,
		getServerState: () => data.authState
	});

	// webcontainer is a plain let — the closures below always read the
	// current value, so $state is not needed here.
	let webcontainer: WebContainer | null = null;

	// setIDEContext MUST be called synchronously during component init.
	// Calling it inside onMount is too late — child components (Editor,
	// Terminal, Preview) call requireIDEContext() during their own init,
	// which happens as part of this component's synchronous render.
	// The getters are closures, so they always return the latest value of
	// `webcontainer` and `data.project` when eventually invoked.
	setIDEContext({
		getWebcontainer: () => {
			if (!webcontainer) throw new Error('WebContainer not ready');
			return webcontainer;
		},
		getProject: () => {
			if (!data.project) throw new Error('Project not available');
			return data.project;
		}
	});

	onMount(async () => {
		webcontainer = await WebContainer.boot();

		if (data.project) {
			const mounter = createProjectMounter(
				() => webcontainer!,
				() => data.project
			);
			await mounter.mountProjectFiles();
		}
	});
</script>

{@render children()}
