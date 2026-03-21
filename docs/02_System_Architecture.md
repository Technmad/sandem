# Explorer + Convex Integration Architecture

## Overview

The file tree explorer is now synced with Convex projects table. Projects in Convex appear as root-level folders in the WebContainer, and vice versa.

```
┌─────────────────────────────────────────────────┐
│         Convex Database (source of truth)      │
│                projects table                   │
│  [Project A] [Project B] [Project C]           │
└────────────────────┬────────────────────────────┘
                     │ query/mutation
                     ▼
┌─────────────────────────────────────────────────┐
│         Project Sync Controller                 │
│  - Fetch projects from Convex                  │
│  - Create/delete projects                      │
│  - Provide root folder list                    │
└────────────────────┬────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ File Tree    │ │ Explorer     │ │ Web Container│
│ Controller   │ │ Actions      │ │ Filesystem   │
│ - tree state │ │ - create     │ │ - files      │
│ - refresh    │ │ - delete     │ │ - mount      │
│ - expand     │ │ - rename     │ │ - sync       │
└──────────────┘ └──────────────┘ └──────────────┘
        ▲            ▲            ▲
        └────────────┴────────────┘
              VS Code Explorer UI
```

## Data Flow Examples

### Creating a Project (Folder at Root)

```
User clicks "New Folder" in Explorer
  ↓
Explorer Actions Controller
  ↓
createFolderAtRoot(name) → createProjectFolder(name)
  ↓
Convex Mutation: createProject() in projects.ts
  ↓
Database: Insert new project record
  ↓
Hook: projectSync.syncProjects()
  ↓
File Tree Controller: refresh()
  ↓
File Tree reads projects via getWorkspaceRootFolders()
  ↓
UI re-renders with new folder
```

### Opening a Project

```
User clicks to expand folder in Explorer
  ↓
File Tree Controller: toggleDir(projectId)
  ↓
WebContainer FS reads folder contents
  ↓
readDirRecursive() scans files within project
  ↓
UI renders file tree for that project
```

### Editing a File (Within a Project)

```
User edits file in editor
  ↓
File changes in WebContainer
  ↓
[Option A] Periodic sync to Convex
[Option B] Lazy save on project close
[Option C] Real-time sync via mutations
```

## Component Integration

### In `+layout.server.ts` (Authenticated Repo Route)

```typescript
import { getProjects } from '$convex/projects.js';

export async function load({ locals }) {
	if (!locals.userId) return { projects: [] };

	return {
		projects: await getProjects({ owner: locals.userId })
	};
}
```

### In `+layout.svelte` (Repo Layout)

```svelte
<script>
	import { createProjectSyncController } from '$lib/hooks/explorer/createProjectSyncController.svelte';
	import { createFileTree } from '$lib/controllers/explorer/createFileTreeController.svelte';
	import { createExplorerActionsController } from '$lib/controllers/explorer/createExplorerActionsController.svelte';

	let { data, children } = $props();

	// 1. Initialize project sync (Convex ↔ UI)
	const projectSync = createProjectSyncController({
		convexClient: data.convexClient,
		owner: data.userId
	});

	// 2. Initialize file tree (reads projects as root folders)
	const fileTree = createFileTree(() => data.webcontainer, {
		getWorkspaceRootFolders: () => projectSync.getWorkspaceRootFolders()
	});

	// 3. Initialize explorer actions (UI actions ↔ Convex)
	const explorerActions = createExplorerActionsController({
		projectSync,
		fileTree
	});

	// 4. Sync projects on mount
	onMount(async () => {
		await projectSync.syncProjects();
		await fileTree.refresh();
	});
</script>

<!-- Pass to Explorer component -->
<Explorer {fileTree} {explorerActions} />
{@render children()}
```

## File Operations

### Create File Within Project

Currently handled entirely in WebContainer:

- User creates file in VS Code
- File is written to WebContainer FS
- Optional: Save to Convex for persistence

### Delete File Within Project

Same as above—WebContainer-first, optionally synced to Convex.

### File Sync Strategy (Choose One)

#### Option A: Ephemeral (Fastest)

- WebContainer is stateless
- Files only in memory
- Good for demos, reduces DB writes

#### Option B: Lazy Save

- Files live in WebContainer
- On project close: serialize to Convex
- On project open: hydrate from Convex

#### Option C: Real-time Sync

- Every file change triggers mutation
- Files always in sync with DB
- Highest latency, best persistence

## Tasks

### Immediate

- [ ] Add `deleteProject` mutation to `projects.ts`
- [ ] Wire up project sync in repo layout
- [ ] Connect Explorer UI to `explorerActionsController`
- [ ] Test create/delete folder at root

### Future

- [ ] Implement file sync strategy (choose A/B/C above)
- [ ] Add rename project mutation
- [ ] Add move folder (project reorganization)
- [ ] Share/permission sync with Convex
- [ ] Version history (file snapshots)

## Type Safety

The architecture maintains type safety:

```typescript
// Convex API is fully typed
const projects = await convexClient.query(
  api.projects.getProjects,
  { owner }
);

// Mutations are typed
const projectId = await convexClient.mutation(
  api.projects.createProject,
  { title, owner, files: [], ... }
);

// File operations are typed
const tree = fileTree.tree; // FileNode[]
fileTree.refresh(); // Promise<void>
```

## Comparison: StackBlitz vs Sandem

| Feature         | StackBlitz    | Sandem                  |
| --------------- | ------------- | ----------------------- |
| Projects source | Backend DB    | Convex projects table   |
| Root folders    | Projects      | Project IDs from Convex |
| File storage    | Cloud storage | WebContainer + Convex   |
| Sync strategy   | Real-time     | TBD (A/B/C)             |
| Permissions     | DB-backed     | Convex-backed (future)  |
| Version history | Full          | Optional (future)       |
