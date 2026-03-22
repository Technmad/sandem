<script lang="ts">
	import { onMount } from 'svelte';

	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	import { PUBLIC_CONVEX_URL } from '$env/static/public';

	// Initialize Convex client
	import { setupConvex } from 'convex-svelte';
	import { createError, createErrorReporter, formatError, toError } from '$lib/sveltekit/index.js';

	import ErrorPanel from '$lib/components/ui/primitives/ErrorPanel.svelte';
	import AppHeader from '$lib/components/ui/navigation/AppHeader.svelte';

	let bootstrapError = $state<string | null>(null);
	const reportRootLayoutError = createErrorReporter((next) => {
		bootstrapError = next;
	});

	// Bootstrap Convex before rendering nested routes.
	try {
		if (!PUBLIC_CONVEX_URL?.trim()) {
			throw createError('PUBLIC_CONVEX_URL is missing.', { code: 'INTERNAL_ERROR' });
		}
		setupConvex(PUBLIC_CONVEX_URL);
	} catch (error) {
		reportRootLayoutError('Failed to initialize application services.', error);
	}

	onMount(() => {
		const onUnhandledError = (event: ErrorEvent) => {
			const message = event.error instanceof Error ? event.error.message : event.message;
			if (!message) return;
			if (!/convex|auth|bootstrap|hydrate|layout/i.test(message)) return;

			reportRootLayoutError('A root runtime error occurred.', event.error ?? message);
		};

		const onUnhandledRejection = (event: PromiseRejectionEvent) => {
			const reason = toError(event.reason, 'Unhandled promise rejection.');
			const reasonText = formatError(reason);
			if (!/convex|auth|bootstrap|hydrate|layout/i.test(reasonText)) return;

			reportRootLayoutError('A root promise rejection occurred.', event.reason);
		};

		window.addEventListener('error', onUnhandledError);
		window.addEventListener('unhandledrejection', onUnhandledRejection);

		return () => {
			window.removeEventListener('error', onUnhandledError);
			window.removeEventListener('unhandledrejection', onUnhandledRejection);
		};
	});

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<!-- html -->

<div class="container">
	<AppHeader />

	{#if bootstrapError}
		<ErrorPanel
			title="Application startup failed"
			description="The app could not initialize required services. Please retry or check configuration."
			message={bootstrapError}
			testId="root-layout-error"
		/>
	{:else}
		{@render children()}
	{/if}
</div>

<!-- /html -->

<style>
	.container {
		display: grid;
		grid-template-rows: auto 1fr;

		min-height: 100dvh;
		min-width: 100dvw;
		overflow: hidden;
	}
</style>
