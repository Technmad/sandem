<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	import { requireIDEContext } from '$lib/context';
	import {
		createEditorStatus,
		createEditorRuntime,
		createEditorLifecycle
	} from '$lib/hooks';
	import { createAutoSaver, createFileWriter } from '$lib/services';
	import { createEditorShortcuts } from '$lib/controllers';
	import {
		getRootFolder,
		resolveProjectFileName,
		toWebContainerPath
	} from '$lib/utils/project/filesystem.js';
	import {
		EDITOR_QUICK_ACTIONS,
		deriveEditorSaveStatusVariant,
		deriveEditorTabItems,
		shouldShowEmptyEditorState
	} from '$lib/utils';
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

	let project = $derived(ide.getProject(editorStore.activeTabPath ?? undefined));
	const rootFolder = $derived(getRootFolder(editorStore.activeTabPath ?? ide.getEntryPath()));

	let element: HTMLDivElement;
	let canWrite = $state(true);
	const unsubscribePermissions = collaborationPermissionsStore.subscribe((value) => {
		canWrite = value.canWrite;
	});

	const autoSaver = createAutoSaver(() => project);
	const { writeFile } = createFileWriter(ide.getWebcontainer);
	const status = createEditorStatus(editorStore);
	const shortcuts = createEditorShortcuts({
		getPanels: () => panels,
		onOpenSearch: () => {
			activity.tab = 'search';
		},
		onToggleCommandPalette: () => {
			window.dispatchEvent(new CustomEvent('app:command-palette:toggle'));
		}
	});
	const runtime = createEditorRuntime({
		getProject: () => project,
		getActivePath: () => editorStore.activeTabPath,
		toProjectFile: (path) => toProjectFile(path),
		toWebPath: (projectFileName) => toWebPath(projectFileName),
		readFile: (path) => ide.getWebcontainer().fs.readFile(path, 'utf-8'),
		onPersist: ({ activePath, projectFileName, content }) => {
			if (!canWrite) return;
			autoSaver.triggerAutoSave(projectFileName, content);
			writeFile(activePath, content);
		},
		onStatusSync: () => lifecycle.syncEditorStatusFromModel()
	});

	const lifecycle = createEditorLifecycle({
		runtime,
		status
	});

	function toProjectFile(path: string): string {
		return resolveProjectFileName(path, project.files);
	}

	function toWebPath(projectFileName: string): string {
		return toWebContainerPath(rootFolder, projectFileName);
	}

	onMount(() => {
		return shortcuts.mount();
	});

	onMount(async () => {
		await lifecycle.initializeEditor(element);
	});

	$effect(() => {
		// Reactive dependency on activeTabPath to trigger sync when it changes
		void editorStore.activeTabPath;
		lifecycle.syncAfterActivePathChange();
	});

	onDestroy(() => {
		unsubscribePermissions();
		autoSaver.cleanup();
		lifecycle.cleanup();
	});

	// Derive a nice save status label + variant
	const saveStatusVariant = $derived(deriveEditorSaveStatusVariant(autoSaver.status));

	const showEmptyState = $derived(
		shouldShowEmptyEditorState(editorStore.tabs, editorStore.activeTabPath)
	);

	const tabs = $derived(deriveEditorTabItems(editorStore.tabs, editorStore.isActive));

	const quickActions = EDITOR_QUICK_ACTIONS;
</script>

<div class="editor-layout">
	<Tabs variant="editor" {tabs} onSelect={editorStore.openFile} onClose={editorStore.closeTab}>
		{#snippet actions()}
			<EditorSaveStatus status={autoSaver.status ?? ''} variant={saveStatusVariant} />
		{/snippet}
	</Tabs>

	<EditorBreadcrumb path={editorStore.activeTabPath} />

	{#if showEmptyState}
		<EmptyEditorState {quickActions} />
	{:else if lifecycle.editorRuntimeError}
		<ErrorPanel
			title="Editor failed to start"
			description="The editor runtime encountered an error. You can retry without refreshing."
			message={lifecycle.editorRuntimeError}
			testId="editor-runtime-error"
			retryLabel={lifecycle.initializingEditor ? 'Retrying…' : 'Retry editor'}
			retryDisabled={lifecycle.initializingEditor}
			onRetry={() => void lifecycle.initializeEditor(element)}
		/>
	{/if}

	<!-- Monaco editor mount point -->
	<div
		class="editor-container"
		class:hidden={showEmptyState || !!lifecycle.editorRuntimeError}
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
