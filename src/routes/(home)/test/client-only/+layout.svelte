<script lang="ts">
	/**
	 * Client-only auth layout - NO SSR state
	 * Simulates a client-only auth flow
	 */
	import { createSvelteAuthClient } from '$lib/svelte/index.js';
	import { authClient } from '$lib/context';

	let { children } = $props();

	// Initialize auth client WITHOUT getServerState
	// This simulates a client-only auth flow
	createSvelteAuthClient({ authClient });
</script>

{@render children()}
