**[← Home](./README.md) | [← Previous](./03_Architecture_Details.md)** | [Next: Code Examples →](./05_Code_Examples.md)

---

# Implementation Guide: Convex ↔ Explorer Sync

## Created Files

### 1. `src/lib/hooks/explorer/createProjectSyncController.svelte.ts`

**Purpose**: Syncs Convex projects table with the file tree controller

**Responsibilities**:

- Fetch projects from Convex via `getProjects` query
- Create projects via `createProject` mutation
- Delete projects via mutation (pending)
- Expose `getWorkspaceRootFolders()` for file tree filtering

**Usage in Layout**:

```svelte
const projectSync = createProjectSyncController({
  convexClient: data.convexClient,
  owner: data.userId
});

onMount(() => projectSync.syncProjects());
```

---

### 2. `src/lib/controllers/explorer/createExplorerActionsController.svelte.ts`

**Purpose**: Wire VS Code explorer actions to Convex mutations and file tree updates

**Responsibilities**:

- Handle "create folder at root" → `projectSync.createProjectFolder()`
- Handle "delete folder at root" → `projectSync.deleteProjectFolder()`
- Track loading/error states for UI feedback
- Validate which nodes are root-level projects

**Usage in Explorer Component**:

```svelte
const actions = createExplorerActionsController({(projectSync, fileTree)}); // User creates folder
await actions.createFolderAtRoot("my-project");
```

---

### 3. `src/lib/utils/editor/projectFolderSync.ts`

**Purpose**: Pure utilities for syncing WebContainer filesystem with Convex

**Functions**:

- `initializeProjectFolder()` - Create folder in WebContainer when project is created
- `deleteProjectFolder()` - Remove folder from WebContainer
- `serializeProjectFiles()` - Save files to Convex for persistence
- `hydrateProjectFiles()` - Load files from Convex into WebContainer
- `projectFolderExists()` - Validate folder exists

**Called by**: Project mutation handlers or sync hooks

---

### 4. `ARCHITECTURE_EXPLORER.md`

**Purpose**: Comprehensive architecture documentation

**Covers**:

- Data flow diagrams
- Component integration examples
- File sync strategies (ephemeral, lazy, real-time)
- Task list for implementation

---

## Integration Checklist

### Phase 1: Setup (Do First)

- [ ] Import `createProjectSyncController` in repo `+layout.svelte`
- [ ] Add `onMount` to call `projectSync.syncProjects()`
- [ ] Pass `projectSync.getWorkspaceRootFolders()` to file tree controller
- [ ] Test: Projects from Convex appear as root folders in explorer

### Phase 2: Explorer Actions (Do Second)

- [ ] Create `deleteProject` mutation in `src/convex/projects.ts`
- [ ] Import `createExplorerActionsController` in Explorer component
- [ ] Wire up "New Folder" button → `explorerActions.createFolderAtRoot()`
- [ ] Wire up "Delete Folder" button → `explorerActions.deleteFolderAtRoot()`
- [ ] Test: Create/delete folders at root level

### Phase 3: WebContainer Sync (Do Third)

- [ ] When project is created, call `initializeProjectFolder()` in mutation handler
- [ ] When project is deleted, call `deleteProjectFolder()`
- [ ] Test: Folders appear in WebContainer file tree

### Phase 4: File Persistence (Do Later)

- [ ] Choose sync strategy: ephemeral (A), lazy (B), or real-time (C)
- [ ] Implement file sync hooks based on choice
- [ ] Test: Files persist across page reloads (if strategy B/C)

---

## Data Flow: Creating a Project

```
1. User clicks "New Folder" in VS Code Explorer
   ↓
2. Explorer UI calls: explorerActions.createFolderAtRoot("my-project")
   ↓
3. Controller calls: projectSync.createProjectFolder("my-project")
   ↓
4. Hook calls Convex mutation: createProject({ title, owner, files: [] })
   ↓
5. Convex inserts project into DB, returns projectId
   ↓
6. Hook refreshes projects list via: projectSync.syncProjects()
   ↓
7. File tree calls: getWorkspaceRootFolders()
   ↓
8. File tree controller: refresh()
   ↓
9. readDirRecursive() scans WebContainer root
   ↓
10. New project folder (projectId) found
   ↓
11. VS Code Explorer UI renders new folder ✓
```

---

## Key Design Decisions

### Single Source of Truth: Convex

- Projects table is the authority
- WebContainer folders are derived from Convex
- If a folder exists in WebContainer but not Convex → out of sync
- If Convex has project but WebContainer doesn't → hydrate on load

### Root-Level Folders Only

- Top-level folders are projects (from Convex)
- Nested folders/files are user content (in WebContainer)
- File tree controller filters root via `getWorkspaceRootFolders()`

### Separation of Concerns

- `projectSync` = Convex ↔ project data
- `explorerActions` = UI → mutations + tree refresh
- `fileTree` = WebContainer filesystem tree
- `projectFolderSync` = WebContainer ↔ file operations

---

## Next Steps

1. **Implement in repo layout** - Wire up `projectSync` in `+layout.svelte`
2. **Test project creation** - Verify Convex → explorer sync works
3. **Add delete mutation** - Implement `deleteProject` in Convex
4. **Connect UI buttons** - Wire explorer actions to mutation calls
5. **Choose file persistence strategy** - Ephemeral vs. persistent
6. **Implement file sync** - Serialize/hydrate project files

---

## Troubleshooting

### Projects do not appear in Explorer

- Confirm `projectSync.syncProjects()` runs on mount.
- Confirm `getWorkspaceRootFolders()` returns project IDs.
- Verify root filtering logic in the file tree controller.

### Create folder action fails

- Verify Convex mutation `createProject` succeeds.
- Verify `createProject` returns a valid project ID.
- Verify `projectSync.syncProjects()` runs after mutation.

### Files do not appear in WebContainer

- Verify `initializeProjectFolder()` exists and is called.
- Verify paths are written as `projectId/filename`.
- Verify WebContainer file permissions and runtime state.

---

**[← Previous](./03_Architecture_Details.md)** | [Next: Code Examples →](./05_Code_Examples.md) | [Home](./README.md)

### Folders exist but Explorer tree does not update

Verify that `fileTree.refresh()` is called after project creation and that `getWorkspaceRootFolders()` returns the new project ID.
**[← Previous](./03_Architecture_Details.md)** | [Next: Code Examples →](./05_Code_Examples.md) | [Home](./README.md)
