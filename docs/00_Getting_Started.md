# README: Convex ↔ Explorer Integration

## What Was Built

You now have a complete architecture for syncing VS Code Explorer with Convex database—inspired by how StackBlitz works.

**The key insight**: Projects in Convex IS the file tree. The UI is just a view of that data.

## Files Created

### Core Controllers & Hooks

1. **`src/lib/hooks/explorer/createProjectSyncController.svelte.ts`**
   - Syncs Convex projects with Explorer
   - Methods: `syncProjects()`, `createProjectFolder()`, `deleteProjectFolder()`
   - Exposes: `getWorkspaceRootFolders()` to filter file tree root

2. **`src/lib/controllers/explorer/createExplorerActionsController.svelte.ts`**
   - Wires UI actions to Convex mutations
   - Methods: `createFolderAtRoot()`, `deleteFolderAtRoot()`, `renameFolderAtRoot()`
   - Handles loading/error states for UI feedback

3. **`src/lib/utils/editor/projectFolderSync.ts`**
   - Pure utilities for WebContainer ↔ Convex sync
   - Functions: `initializeProjectFolder()`, `deleteProjectFolder()`, `serializeProjectFiles()`, `hydrateProjectFiles()`

### Documentation

4. **`CONVEX_EXPLORER_SYNC.md`** - Start here! Overview & comparison to StackBlitz
5. **`ARCHITECTURE_EXPLORER.md`** - Detailed system design & data flows
6. **`IMPLEMENTATION_GUIDE.md`** - Step-by-step integration instructions
7. **`LAYOUT_INTEGRATION.md`** - Code examples & patterns
8. **`IMPLEMENTATION_CHECKLIST.md`** - Track your progress

### Refactored

- **`src/lib/controllers/explorer/createFileTreeController.svelte.ts`** - Simplified, extracted pure functions
- **`src/lib/utils/editor/fileTreeOps.ts`** - Pure file tree operations

## How It Works (30 Second Version)

```
User creates project folder in Explorer
  ↓
explorerActions.createFolderAtRoot(name)
  ↓
Convex mutation: createProject({ title, owner })
  ↓
Database updated
  ↓
projectSync.syncProjects() refreshes
  ↓
fileTree.refresh() rescans
  ↓
Explorer re-renders with new folder ✓
```

## How To Integrate

### 1. In your `src/routes/repo/+layout.svelte`:

```svelte
<script>
	import { createProjectSyncController } from '$lib/hooks/explorer/createProjectSyncController.svelte';
	import { createFileTree } from '$lib/controllers/explorer/createFileTreeController.svelte';
	import { createExplorerActionsController } from '$lib/controllers/explorer/createExplorerActionsController.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();

	// 1. Sync Convex projects
	const projectSync = createProjectSyncController({
		convexClient: data.convexClient,
		owner: data.userId
	});

	// 2. File tree filtered to show only projects
	const fileTree = createFileTree(() => data.webcontainer, {
		getWorkspaceRootFolders: () => projectSync.getWorkspaceRootFolders()
	});

	// 3. Explorer actions (create/delete)
	const explorerActions = createExplorerActionsController({
		projectSync,
		fileTree
	});

	// 4. Load on mount
	onMount(async () => {
		await projectSync.syncProjects();
		await fileTree.refresh();
	});
</script>

<Explorer {projectSync} {fileTree} {explorerActions} />
```

### 2. Add delete mutation to `src/convex/projects.ts`:

```typescript
export const deleteProject = mutation({
	args: { id: v.id('projects') },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	}
});
```

### 3. Wire UI buttons:

```svelte
<button onclick={() => explorerActions.createFolderAtRoot('New Project')}>
	{explorerActions.creatingFolder ? 'Creating...' : 'New Folder'}
</button>
```

That's it! Projects from Convex will appear as folders in Explorer.

## Architecture Overview

```
┌─────────────────────────────────────┐
│   Convex Database (projects table)  │
│      Single source of truth         │
└────────────────┬────────────────────┘
                 │ (query/mutation)
                 ▼
        ┌────────────────────┐
        │ projectSync Hook   │
        │ (Convex ↔ Data)    │
        └────────────────────┘
                 │
      ┌──────────┼──────────┐
      ▼          ▼          ▼
┌─────────┐ ┌────────┐ ┌──────────────┐
│fileTree │ │actions │ │WebContainer  │
│         │ │        │ │   folders    │
└─────────┘ └────────┘ └──────────────┘
      ▲          ▲          ▲
      └──────────┴──────────┘
          Explorer UI
```

## What's Different From Before

### Before

- Explorer was its own state
- WebContainer folders were separate
- Convex projects were separate
- No sync between them
- Creating folder in explorer didn't persist

### After

- Convex is single source of truth
- Explorer shows Convex projects as folders
- WebContainer folders match Convex
- Everything auto-syncs
- Create/delete folder ↔ Convex mutations

## File Persistence Options

Choose one strategy:

| Strategy      | How It Works               | Best For         |
| ------------- | -------------------------- | ---------------- |
| **Ephemeral** | Files only in WebContainer | Demos, sandboxes |
| **Lazy Save** | Save on project close      | Most apps        |
| **Real-time** | Save every change          | Collaboration    |

See `ARCHITECTURE_EXPLORER.md` for details.

## Next Steps

1. **Read** `CONVEX_EXPLORER_SYNC.md` (5 min)
2. **Study** `LAYOUT_INTEGRATION.md` (10 min)
3. **Integrate** into your layout (1 hour)
4. **Test** create/delete projects (30 min)
5. **Choose** file persistence strategy (15 min)
6. **Implement** file sync (2-8 hours depending on choice)
7. **Deploy** and celebrate! 🎉

## Questions?

See the documentation:

- **Quick overview**: `CONVEX_EXPLORER_SYNC.md`
- **Full design**: `ARCHITECTURE_EXPLORER.md`
- **Step-by-step**: `IMPLEMENTATION_GUIDE.md`
- **Code examples**: `LAYOUT_INTEGRATION.md`
- **Track progress**: `IMPLEMENTATION_CHECKLIST.md`

## Key Principles

1. **Single Source of Truth** - Convex projects table
2. **Unidirectional Flow** - UI → Convex → Refresh → UI
3. **Separation of Concerns** - Sync, Actions, Tree are separate
4. **Type Safe** - All Convex calls fully typed
5. **Testable** - Controllers take dependencies as args

## Comparison to StackBlitz

StackBlitz solved this problem years ago. This architecture borrows their approach:

- **Projects table** = Database of projects
- **Root folders** = Projects (not arbitrary directories)
- **File sync** = Strategy choice (ephemeral/lazy/real-time)
- **UI** = Reactive view of DB state

The difference: They built it for millions of users over years. You have a clean, typed, modern version using Svelte 5 & Convex.

---

**Ready to implement?** Start with `LAYOUT_INTEGRATION.md` and follow the checklist in `IMPLEMENTATION_CHECKLIST.md`.
