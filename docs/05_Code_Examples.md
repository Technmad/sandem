# Layout Integration Example

File: `src/routes/repo/+layout.svelte`

```svelte
<script>
	import { createProjectSyncController } from '$lib/hooks/explorer/createProjectSyncController.svelte';
	import { createFileTree } from '$lib/controllers/explorer/createFileTreeController.svelte';
	import { createExplorerActionsController } from '$lib/controllers/explorer/createExplorerActionsController.svelte';
	import { onMount } from 'svelte';

	let { data, children } = $props();

	// ============================================
	// 1. INITIALIZE PROJECT SYNC (Convex ↔ Data)
	// ============================================

	const projectSync = createProjectSyncController({
		convexClient: data.convexClient, // from layout.server.ts
		owner: data.userId // or data.user?.id from auth
	});

	// ============================================
	// 2. INITIALIZE FILE TREE (WebContainer FS)
	// ============================================

	const fileTree = createFileTree(
		() => data.webcontainer, // from IDE layout controller
		{
			// THIS IS KEY: Filter root folders to only show projects from Convex
			getWorkspaceRootFolders: () => projectSync.getWorkspaceRootFolders()
		}
	);

	// ============================================
	// 3. INITIALIZE EXPLORER ACTIONS (UI → Convex)
	// ============================================

	const explorerActions = createExplorerActionsController({
		projectSync,
		fileTree
	});

	// ============================================
	// 4. SYNC ON MOUNT
	// ============================================

	onMount(async () => {
		// Fetch projects from Convex
		await projectSync.syncProjects();

		// Refresh file tree to show project folders
		await fileTree.refresh();

		// Optional: Start auto-refresh (every 5 seconds)
		// fileTree.startAutoRefresh(5000);
	});
</script>

<!-- ============================================ -->
<!-- 5. PASS TO COMPONENTS                       -->
<!-- ============================================ -->

<!-- In your Explorer component: -->
<Explorer {projectSync} {fileTree} {explorerActions} />

<!-- Usage patterns in Explorer component:
     - Show loading state: {explorerActions.creatingFolder}
     - Show error: {explorerActions.error}
     - Handle create: onclick={() => explorerActions.createFolderAtRoot("New Project")}
     - Render tree: {#each fileTree.tree as node}
     - Toggle folder: onclick={() => fileTree.toggleDir(node.path)}
     - Check if expanded: {fileTree.isExpanded(node.path)}
-->

{@render children()}
```

## What Gets Passed Where

### To Explorer Component

```svelte
<Explorer {projectSync} {fileTree} {explorerActions} />
```

**projectSync** properties:

- `projects` - Array of projects from Convex
- `loading` - Boolean while fetching
- `error` - Error message if sync failed
- `getWorkspaceRootFolders()` - Returns project IDs

**fileTree** properties:

- `tree` - FileNode[] representing the full tree
- `loading` - Boolean while refreshing
- `error` - Error message if refresh failed
- `refresh()` - Manually refresh the tree
- `toggleDir(path)` - Toggle folder expansion
- `isExpanded(path)` - Check if folder is open

**explorerActions** properties:

- `creatingFolder` - Boolean while creating
- `deletingFolder` - Boolean while deleting
- `error` - Action error message
- `createFolderAtRoot(name)` - Create new project
- `deleteFolderAtRoot()` - Delete project
- `isRootProjectFolder(node)` - Check if root-level

## Example: Explorer Component

```svelte
<script>
	let { projectSync, fileTree, explorerActions } = $props();

	function handleCreateFolder() {
		const name = prompt('Project name:');
		if (name) {
			explorerActions.createFolderAtRoot(name);
		}
	}
</script>

<div class="explorer">
	{#if explorerActions.error}
		<div class="error">{explorerActions.error}</div>
	{/if}

	<button
		disabled={explorerActions.creatingFolder || projectSync.loading}
		onclick={handleCreateFolder}
	>
		{explorerActions.creatingFolder ? 'Creating...' : 'New Project'}
	</button>

	{#if projectSync.loading}
		<p>Loading projects...</p>
	{:else if fileTree.tree.length === 0}
		<p>No projects yet. Create one to get started.</p>
	{:else}
		{#each fileTree.tree as node}
			<ProjectTreeNode {node} {fileTree} {explorerActions} />
		{/each}
	{/if}
</div>
```

## Key Points

1. **Order matters**: Initialize in this order:
   - projectSync (Convex data)
   - fileTree (with projectSync root folders)
   - explorerActions (with both)

2. **getWorkspaceRootFolders is the bridge**:
   - Connects Convex projects to file tree roots
   - Only root folders are projects
   - Nested items are files in projects

3. **onMount is critical**:
   - Fetch projects first
   - Then refresh file tree
   - This populates the explorer

4. **Pass controllers as props**:
   - Don't recreate them in child components
   - Keep state in layout
   - Pass via `$props()`
