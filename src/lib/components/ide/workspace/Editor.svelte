<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	import { requireIDEContext } from '$lib/context';
	import { createEditorPaneController } from '$lib/controllers';
	import Tabs from '$lib/components/ui/primitives/Tabs.svelte';
	import { editorStore } from '$lib/stores';
	import { activity } from '$lib/stores';
	import EmptyEditorState from '$lib/components/ui/editor/Empty.svelte';
	import EditorBreadcrumb from '$lib/components/ui/editor/Breadcrumbs.svelte';
	import EditorSaveStatus from '$lib/components/ui/editor/SaveStatus.svelte';
	import ErrorPanel from '$lib/components/ui/primitives/ErrorPanel.svelte';
	import { getPanelsContext } from '$lib/stores';
	import { collaborationPermissionsStore } from '$lib/stores';

	const ide = requireIDEContext();
	const panels = getPanelsContext();

	let element: HTMLDivElement;
	let canWrite = $state(true);
	const unsubscribePermissions = collaborationPermissionsStore.subscribe((value) => {
		canWrite = value.canWrite;
	});

	const editorPane = createEditorPaneController({
		ide,
		editorStore,
		activity,
		getPanels: () => panels,
		getCanWrite: () => canWrite
	});

	onMount(() => {
		return editorPane.mountShortcuts();
	});

	onMount(async () => {
		await editorPane.initializeEditor(element);
	});

	onMount(() => {
		const handlePageHide = () => {
			void editorPane.shutdown();
		};

		window.addEventListener('pagehide', handlePageHide);

		return () => {
			window.removeEventListener('pagehide', handlePageHide);
		};
	});

	$effect(() => {
		// Reactive dependency on activeTabPath to trigger sync when it changes
		void editorStore.activeTabPath;
		editorPane.syncAfterActivePathChange();
	});

	onDestroy(() => {
		unsubscribePermissions();
		void editorPane.shutdown();
	});
</script>

<div class="editor-layout">
	<Tabs
		variant="editor"
		tabs={editorPane.tabs}
		onSelect={editorStore.openFile}
		onClose={editorStore.closeTab}
	>
		{#snippet actions()}
			<EditorSaveStatus
				status={editorPane.autoSaver.status ?? ''}
				variant={editorPane.saveStatusVariant}
			/>
		{/snippet}
	</Tabs>

	<EditorBreadcrumb path={editorStore.activeTabPath} />

	{#if editorPane.showEmptyState}
		<EmptyEditorState quickActions={editorPane.quickActions} />
	{:else if editorPane.lifecycle.editorRuntimeError}
		<ErrorPanel
			title="Editor failed to start"
			description="The editor runtime encountered an error. You can retry without refreshing."
			message={editorPane.lifecycle.editorRuntimeError}
			testId="editor-runtime-error"
			retryLabel={editorPane.lifecycle.initializingEditor ? 'Retrying…' : 'Retry editor'}
			retryDisabled={editorPane.lifecycle.initializingEditor}
			onRetry={() => void editorPane.initializeEditor(element)}
		/>
	{/if}

	<!-- Monaco editor mount point -->
	<div
		class="editor-container"
		class:hidden={editorPane.showEmptyState || !!editorPane.lifecycle.editorRuntimeError}
		bind:this={element}
	></div>
</div>

<style>
	/* ── Layout shell ───────────────────────────────────────── */
	.editor-layout {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: color-mix(in srgb, var(--bg) 90%, black);
		border-left: 1px solid color-mix(in srgb, var(--border) 52%, transparent);
		overflow: hidden;
	}

	/* ── Monaco mount ───────────────────────────────────────── */
	.editor-container {
		flex: 1;
		min-height: 0;
		overflow: hidden;
		background: color-mix(in srgb, var(--bg) 94%, black);
	}

	.editor-container.hidden {
		display: none;
	}
</style>
