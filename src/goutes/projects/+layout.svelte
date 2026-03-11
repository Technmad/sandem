<script lang="ts">
	import { createSvelteAuthClient } from '$lib/svelte/index.js';
	import { authClient } from '$lib/context/auth-client.js';

	let { children, data } = $props();

	// Handshake between SSR state and Client state
	createSvelteAuthClient({
		authClient,
		getServerState: () => data.authState
	});
</script>

{@render children()}
