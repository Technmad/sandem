# Convex ↔ Explorer Architecture Summary

> How Sandem syncs VS Code Explorer with Convex database—inspired by StackBlitz

## The Problem You Solved

**Before**: Explorer was disconnected from Convex. Folders in explorer didn't map to projects in DB.

**After**: Convex projects table IS the source of truth. Folders in explorer ARE projects in the database.

## The Architecture

```
User creates "my-project" folder in Explorer
        ↓
explorerActions.createFolderAtRoot("my-project")
        ↓
projectSync.createProjectFolder("my-project")
        ↓
Convex mutation: createProject({ title: "my-project", owner: userId })
        ↓
Database: New project record created
        ↓
projectSync.syncProjects() (auto-refresh)
        ↓
fileTree.refresh()
        ↓
File tree reads root folders from projectSync.getWorkspaceRootFolders()
        ↓
Explorer shows new folder ✓
```

## New Files Created

| File                                                                     | Purpose                        | Type       |
| ------------------------------------------------------------------------ | ------------------------------ | ---------- |
| `src/lib/hooks/explorer/createProjectSyncController.svelte.ts`           | Sync Convex ↔ project data     | Hook       |
| `src/lib/controllers/explorer/createExplorerActionsController.svelte.ts` | Wire UI actions to mutations   | Controller |
| `src/lib/utils/editor/projectFolderSync.ts`                              | WebContainer folder operations | Utility    |
| `ARCHITECTURE_EXPLORER.md`                                               | Complete architecture docs     | Docs       |
| `IMPLEMENTATION_GUIDE.md`                                                | Step-by-step integration       | Docs       |
| `LAYOUT_INTEGRATION.md`                                                  | Code examples                  | Docs       |

## How It Works

### 1. **Single Source of Truth: Convex**

- Projects table is the authority
- Explorer shows what's in Convex
- WebContainer folders are derived from Convex

### 2. **Three-Layer Control**

```
Presentation: Explorer UI
     ↓
Controller: explorerActions (create/delete folder)
     ↓
Sync: projectSync (Convex mutations + refresh)
     ↓
Data: Convex projects table
```

### 3. **Root Folders = Projects**

- `getWorkspaceRootFolders()` returns project IDs
- File tree filters root to only show these
- Nested files/folders are user content in WebContainer

### 4. **File Operations Strategy** (Choose One)

| Strategy          | Pros              | Cons                 | Use Case              |
| ----------------- | ----------------- | -------------------- | --------------------- |
| **Ephemeral (A)** | Fastest, simplest | Files lost on reload | Demos, sandboxes      |
| **Lazy Save (B)** | Good balance      | One-way sync         | Most apps             |
| **Real-time (C)** | Always in sync    | Higher latency       | Collaborative editing |

## Integration Steps

### Phase 1: Basic Setup

1. Initialize `projectSync` in layout
2. Call `projectSync.syncProjects()` on mount
3. Pass `getWorkspaceRootFolders()` to file tree
4. Verify projects appear in explorer

### Phase 2: User Actions

1. Create `deleteProject` mutation
2. Initialize `explorerActions` in layout
3. Wire UI buttons to action handlers
4. Test create/delete at root level

### Phase 3: WebContainer Sync

1. Call `initializeProjectFolder()` on project creation
2. Call `deleteProjectFolder()` on deletion
3. Verify folders appear in WebContainer

### Phase 4: File Persistence

1. Choose sync strategy (A/B/C)
2. Implement serialization/hydration
3. Test file changes persist

## Comparison: StackBlitz vs Sandem

StackBlitz has years of production experience. This architecture borrows their core insight:

**Core Insight**: The database IS the file tree. The UI is just a view of that.

| Feature         | StackBlitz | Sandem                |
| --------------- | ---------- | --------------------- |
| Projects source | Backend DB | Convex table ✓        |
| Root folders    | Projects   | Project IDs ✓         |
| File storage    | Cloud FS   | WebContainer + Convex |
| Sync            | Real-time  | Choose your own       |
| Permissions     | DB-backed  | Convex-backed ✓       |

## Key Design Principles

1. **Separation of Concerns**
   - `projectSync` = Data layer
   - `explorerActions` = Command layer
   - `fileTree` = Presentation layer
   - `projectFolderSync` = Infrastructure

2. **Unidirectional Flow**
   - UI action → Convex mutation → refresh → UI update
   - Not: UI action → optimistic update

3. **Type Safety**
   - All Convex calls are fully typed
   - Controllers expose typed return values
   - No stringly-typed operations

4. **Composition Over Inheritance**
   - Controllers take dependencies as args
   - Easy to test and mock
   - Easy to swap implementations

## Usage Example

```svelte
<script>
	// In your repo +layout.svelte
	import { createProjectSyncController } from '$lib/hooks/explorer/createProjectSyncController.svelte';
	import { createFileTree } from '$lib/controllers/explorer/createFileTreeController.svelte';
	import { createExplorerActionsController } from '$lib/controllers/explorer/createExplorerActionsController.svelte';

	let { data } = $props();

	const projectSync = createProjectSyncController({
		convexClient: data.convexClient,
		owner: data.userId
	});

	const fileTree = createFileTree(() => data.webcontainer, {
		getWorkspaceRootFolders: () => projectSync.getWorkspaceRootFolders()
	});

	const explorerActions = createExplorerActionsController({
		projectSync,
		fileTree
	});

	onMount(async () => {
		await projectSync.syncProjects();
		await fileTree.refresh();
	});
</script>

<Explorer {projectSync} {fileTree} {explorerActions} />
```

## What's Next

1. **Implement** - Wire up in your repo layout
2. **Test** - Create/delete projects, verify Convex sync
3. **Enhance** - Add rename, move, search
4. **Persist** - Choose file sync strategy
5. **Scale** - Add permissions, sharing, history

## Questions?

See the detailed docs:

- `ARCHITECTURE_EXPLORER.md` - Full system design
- `IMPLEMENTATION_GUIDE.md` - Step-by-step checklist
- `LAYOUT_INTEGRATION.md` - Code examples
