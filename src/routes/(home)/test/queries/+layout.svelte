<script lang="ts">
	/**
	 * Queries test layout - uses SSR auth state
	 */
	import { createSvelteAuthClient } from '$lib/svelte/index.js';
	import { authClient } from '$lib/context';
	import type { AuthLayoutData } from '../../../../types/routes.js';
	import type { Snippet } from 'svelte';

	let { children, data }: { children: Snippet; data: AuthLayoutData } = $props();

	// Initialize auth client WITH SSR state
	createSvelteAuthClient({ authClient, getServerState: () => data.authState });
</script>

{@render children()}
