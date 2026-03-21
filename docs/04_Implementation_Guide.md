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

**Projects not showing in explorer?**

- Check: Is `projectSync.syncProjects()` called on mount?
- Check: Is `getWorkspaceRootFolders()` returning project IDs?
- Check: File tree filtering logic in controller

**Create folder fails?**

- Check: Is Convex mutation `createProject` working?
- Check: Does `createProject` return a valid ID?
- Check: Is `projectSync.syncProjects()` called after mutation?

**Files not appearing in WebContainer?**

- Check: Does `initializeProjectFolder()` exist in mutation?
- Check: Are files being written to correct path? (`projectId/filename`)
- Check: WebContainer file tree permissions

**Folders exist but file tree won't refresh?**

- Check: Is `fileTree.refresh()` being awaited?
- Check: Is WebContainer ready before refresh?
- Check: Are there any network/timeout errors?
