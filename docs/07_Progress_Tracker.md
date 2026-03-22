**[← Home](./README.md) | [← Previous](./06_Diagrams_and_Flows.md)** | [Next: What Was Built →](./08_What_Was_Built.md)

---

# Implementation Checklist

> Track your progress integrating Convex ↔ Explorer sync

## Phase 1: Understanding ✅ (Complete)

- [x] Read `CONVEX_EXPLORER_SYNC.md` - Architecture overview
- [x] Read `ARCHITECTURE_EXPLORER.md` - Detailed design
- [x] Read `IMPLEMENTATION_GUIDE.md` - Step-by-step instructions
- [x] Read `LAYOUT_INTEGRATION.md` - Code examples

**Status**: Concepts understood, ready to implement

---

## Phase 2: Setup (Next)

### Create Project Sync Controller

- [ ] Verify `src/lib/hooks/explorer/createProjectSyncController.svelte.ts` exists
- [ ] Check `createProjectSyncController()` exports
- [ ] Check `projectSync.syncProjects()` implementation
- [ ] Check `projectSync.getWorkspaceRootFolders()` implementation

### Wire to Repo Layout

- [ ] Open `src/routes/repo/+layout.svelte`
- [ ] Import `createProjectSyncController`
- [ ] Create instance: `const projectSync = createProjectSyncController(...)`
- [ ] Add `onMount(async () => { await projectSync.syncProjects(); })`
- [ ] Verify `data.convexClient` and `data.userId` are available

### Connect to File Tree

- [ ] Import `createFileTree` (already exists)
- [ ] Pass `getWorkspaceRootFolders: () => projectSync.getWorkspaceRootFolders()`
- [ ] Call `fileTree.refresh()` in onMount after projectSync
- [ ] Test: Do projects appear as root folders?

**Validation**: Run `pnpm run dev` and check:

- Explorer shows projects from Convex
- No console errors
- `projectSync.projects` has data

---

## Phase 3: Explorer Actions

### Create Actions Controller

- [ ] Verify `src/lib/controllers/explorer/createExplorerActionsController.svelte.ts` exists
- [ ] Check `createFolderAtRoot(name)` implementation
- [ ] Check `deleteFolderAtRoot()` implementation

### Wire to Layout

- [ ] Import `createExplorerActionsController` in layout
- [ ] Create instance: `const explorerActions = createExplorerActionsController(...)`
- [ ] Pass `projectSync` and `fileTree` to it

### Connect UI Buttons

- [ ] Find "New Folder" button in Explorer component
- [ ] Wire to: `onclick={() => explorerActions.createFolderAtRoot("My Project")}`
- [ ] Add loading state: `disabled={explorerActions.creatingFolder}`
- [ ] Add error display: `{explorerActions.error}`

**Validation**:

- Click "New Folder"
- Enter project name
- Verify in Convex dashboard that project was created
- Verify explorer refreshes automatically

---

## Phase 4: WebContainer Sync

### Add Delete Mutation

- [ ] Open `src/convex/projects.ts`
- [ ] Add `deleteProject` mutation (remove this TODO)
- [ ] Test mutation manually in Convex dashboard

### Initialize on Create

- [ ] In `createProject` mutation, call `initializeProjectFolder()`
- [ ] Test: New project folder appears in WebContainer

### Clean Up on Delete

- [ ] In `deleteProject` mutation, call `deleteProjectFolder()`
- [ ] Test: Deleted project folder removed from WebContainer

**Validation**:

- Create project via explorer
- Check WebContainer filesystem
- Folder with project ID should exist
- Folder should contain README.md

---

## Phase 5: File Persistence (Optional)

### Choose Strategy

- [ ] Decide: Ephemeral (A), Lazy (B), or Real-time (C)?
- [ ] Document choice in `ARCHITECTURE_EXPLORER.md`

### If Ephemeral (Simplest)

- [ ] Nothing to do—files live in WebContainer only
- [ ] Files lost on page reload (acceptable for demos)

### If Lazy Save (Recommended)

- [ ] Implement `serializeProjectFiles()` on project close
- [ ] Implement `hydrateProjectFiles()` on project load
- [ ] Save files to Convex when leaving editor
- [ ] Restore files when opening editor

### If Real-time (Complex)

- [ ] Hook file saves to trigger Convex mutations
- [ ] Handle conflicts/concurrency
- [ ] Higher latency but always synced

---

## Phase 6: Testing

### Manual Tests

- [ ] Create a project—verify in DB and explorer
- [ ] Delete a project—verify removed from DB and explorer
- [ ] Create files in project—verify in WebContainer
- [ ] Reload page—verify projects/files still there
- [ ] Check console—no errors or warnings

### Edge Cases

- [ ] Create 10+ projects—verify performance
- [ ] Create project with special characters—verify sanitization
- [ ] Disconnect from internet—verify graceful fallback
- [ ] Very large files—verify no timeouts

### Browser DevTools

- [ ] Network tab: Check Convex mutation payloads
- [ ] Console: Check for errors or warnings
- [ ] Sources: Verify breakpoints work in controllers
- [ ] Application: Check localStorage/session state

---

## Phase 7: Optimization (Future)

- [ ] Add pagination for large project lists
- [ ] Add caching for recent projects
- [ ] Add search/filter in explorer
- [ ] Add drag-to-reorder projects
- [ ] Add project templates
- [ ] Add sharing/permissions

---

## Phase 8: Documentation

- [ ] Update README with sync architecture
- [ ] Document file sync strategy chosen
- [ ] Document how to add new root-level actions
- [ ] Document how to extend to sub-folders
- [ ] Create user guide for project management

---

## Blockers & Questions

### Known Issues

- [ ] List any bugs found during testing
- [ ] List any type errors not yet fixed
- [ ] List any performance issues

### Questions

- [ ] Which file sync strategy to use?
- [ ] How to handle project deletion—cascade to files?
- [ ] Should projects be shareable?
- [ ] Should there be project permissions?

---

## Timeline Estimate

| Phase                      | Effort | Time            |
| -------------------------- | ------ | --------------- |
| Phase 1: Understanding     | Low    | 30 min          |
| Phase 2: Setup             | Low    | 1 hour          |
| Phase 3: Explorer Actions  | Medium | 2 hours         |
| Phase 4: WebContainer Sync | Medium | 2 hours         |
| Phase 5: File Persistence  | Varies | 2-8 hours       |
| Phase 6: Testing           | Medium | 2 hours         |
| Phase 7-8: Polish & Docs   | Low    | 1 hour          |
| **Total**                  |        | **10-16 hours** |

---

## Success Criteria

✅ **Implementation is complete when:**

1. User can create project via "New Folder" button
2. Project automatically appears in Convex DB
3. Project automatically appears in Explorer
4. User can delete project
5. Deleted project removed from DB and Explorer
6. WebContainer has folder with project ID
7. Files in WebContainer survive page reload
8. No console errors
9. All tests pass
10. Documentation is updated

---

## Notes

Use this section to track your progress:

```
Date: ___________
Phase: ___ / 8

Current Issue:

---

**[← Previous](./06_Diagrams_and_Flows.md)** | [Next: What Was Built →](./08_What_Was_Built.md) | [Home](./README.md)
_________________________________

Next Step:
_________________________________

Blockers:
_________________________________
```
