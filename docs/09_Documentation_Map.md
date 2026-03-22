**[← Home](./README.md) | [← Previous](./08_What_Was_Built.md)** | [Next: Next Steps →](./10_Next_Steps.md)

---

# 📚 Documentation Index: Convex ↔ Explorer Sync

> Complete guide to implementing VS Code Explorer synced with Convex database

## 🚀 Quick Start (15 minutes)

1. **Read first**: [`EXPLORER_SYNC_README.md`](EXPLORER_SYNC_README.md) - 5 min overview
2. **See diagrams**: [`VISUAL_REFERENCE.md`](VISUAL_REFERENCE.md) - 5 min
3. **Code examples**: [`LAYOUT_INTEGRATION.md`](LAYOUT_INTEGRATION.md) - 5 min

## 📖 Complete Documentation

### Core Concepts (Read First)

- **[`CONVEX_EXPLORER_SYNC.md`](CONVEX_EXPLORER_SYNC.md)**
  - What problem this solves
  - How it works (high level)
  - Comparison to StackBlitz
  - 3-layer control architecture
  - File persistence strategies

### Detailed Architecture (Understand Design)

- **[`ARCHITECTURE_EXPLORER.md`](ARCHITECTURE_EXPLORER.md)`**
  - System diagrams
  - Component relationships
  - Data flow examples (create/open/edit)
  - File sync options (A/B/C)
  - Task list for phases 1-4

### Step-by-Step Implementation (Follow Instructions)

- **[`IMPLEMENTATION_GUIDE.md`](IMPLEMENTATION_GUIDE.md)`**
  - Phase-by-phase checklist
  - What each file does
  - Integration patterns
  - Troubleshooting guide

### Code Examples (Copy & Paste)

- **[`LAYOUT_INTEGRATION.md`](LAYOUT_INTEGRATION.md)`**
  - Full layout code example
  - Component integration patterns
  - Usage examples in Explorer
  - Key points & gotchas

### Visual Explanations (See The Flow)

- **[`VISUAL_REFERENCE.md`](VISUAL_REFERENCE.md)`**
  - System flow diagrams
  - State transitions
  - Component hierarchy
  - Data mutation timeline
  - Error handling flow
  - File tree filtering illustrated

### Progress Tracking (Keep On Track)

- **[`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md)`**
  - 8 phases with sub-tasks
  - Validation steps for each phase
  - Timeline estimates
  - Success criteria
  - Issues & blockers log

## 📂 Files Created

### New Controllers & Hooks

```
src/lib/hooks/explorer/
  └── createProjectSyncController.svelte.ts    [✨ NEW]

src/lib/controllers/explorer/
  ├── createExplorerActionsController.svelte.ts [✨ NEW]
  └── createFileTreeController.svelte.ts       [REFACTORED]

src/lib/utils/editor/
  ├── projectFolderSync.ts                     [✨ NEW]
  └── fileTreeOps.ts                           [✨ NEW - extracted pure functions]
```

### Documentation

```
Project Root/
├── EXPLORER_SYNC_README.md                   [START HERE!]
├── CONVEX_EXPLORER_SYNC.md                   [Architecture overview]
├── ARCHITECTURE_EXPLORER.md                   [Detailed design]
├── IMPLEMENTATION_GUIDE.md                    [Step-by-step]
├── LAYOUT_INTEGRATION.md                      [Code examples]
├── IMPLEMENTATION_CHECKLIST.md                [Progress tracking]
├── VISUAL_REFERENCE.md                        [Diagrams & flows]
└── DOCUMENTATION_INDEX.md                     [This file]
```

## 🎯 Reading Path by Use Case

### "I just want to understand the concept"

1. [`EXPLORER_SYNC_README.md`](EXPLORER_SYNC_README.md) - 5 min
2. [`VISUAL_REFERENCE.md`](VISUAL_REFERENCE.md) - 5 min
3. Done! ✓

### "I need to implement this"

1. [`EXPLORER_SYNC_README.md`](EXPLORER_SYNC_README.md) - 5 min
2. [`LAYOUT_INTEGRATION.md`](LAYOUT_INTEGRATION.md) - 10 min
3. [`IMPLEMENTATION_GUIDE.md`](IMPLEMENTATION_GUIDE.md) - 10 min
4. Follow [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md) - 10-16 hours

### "I want to understand the design decisions"

1. [`CONVEX_EXPLORER_SYNC.md`](CONVEX_EXPLORER_SYNC.md) - 10 min
2. [`ARCHITECTURE_EXPLORER.md`](ARCHITECTURE_EXPLORER.md) - 20 min
3. [`VISUAL_REFERENCE.md`](VISUAL_REFERENCE.md) - 10 min
4. Done! ✓

### "I need to extend/modify this"

1. All of the above (45 min)
2. [`IMPLEMENTATION_GUIDE.md`](IMPLEMENTATION_GUIDE.md) - Phase-specific
3. Code comments in source files
4. Done! ✓

## 🔍 Quick Reference

### What each file does

| File                          | Purpose                   | Read When             |
| ----------------------------- | ------------------------- | --------------------- |
| `EXPLORER_SYNC_README.md`     | Overview & setup          | First!                |
| `CONVEX_EXPLORER_SYNC.md`     | Architecture & comparison | Understanding design  |
| `ARCHITECTURE_EXPLORER.md`    | Detailed system design    | Deep dive             |
| `IMPLEMENTATION_GUIDE.md`     | Integration steps         | Implementing          |
| `LAYOUT_INTEGRATION.md`       | Code examples             | Need code             |
| `VISUAL_REFERENCE.md`         | Diagrams & flows          | Visual learner        |
| `IMPLEMENTATION_CHECKLIST.md` | Progress tracking         | During implementation |
| `DOCUMENTATION_INDEX.md`      | This index                | Finding things        |

### What each controller does

| Controller        | Responsibility          | Key Methods                                                            |
| ----------------- | ----------------------- | ---------------------------------------------------------------------- |
| `projectSync`     | Convex ↔ project data   | `syncProjects()`, `createProjectFolder()`, `getWorkspaceRootFolders()` |
| `fileTree`        | WebContainer filesystem | `refresh()`, `toggleDir()`, `isExpanded()`                             |
| `explorerActions` | UI actions ↔ mutations  | `createFolderAtRoot()`, `deleteFolderAtRoot()`                         |

### Quick decision matrix

**Which file should I read?**

- Architecture questions → `ARCHITECTURE_EXPLORER.md`
- How to integrate → `IMPLEMENTATION_GUIDE.md`
- Need code → `LAYOUT_INTEGRATION.md`
- Want visual → `VISUAL_REFERENCE.md`
- Progress tracking → `IMPLEMENTATION_CHECKLIST.md`

**Which controller should I use?**

- Syncing projects from Convex → `projectSync`
- Reading WebContainer files → `fileTree`
- Handling create/delete → `explorerActions`

**Which utility should I call?**

- Create project folder in WebContainer → `initializeProjectFolder()`
- Save files to Convex → `serializeProjectFiles()`
- Load files from Convex → `hydrateProjectFiles()`

## ✅ Success Milestones

- [ ] Read `EXPLORER_SYNC_README.md`
- [ ] Understand 3-layer architecture
- [ ] Know the 3 controllers
- [ ] Can explain single source of truth
- [ ] Ready to integrate

👉 **Next step**: Open [`EXPLORER_SYNC_README.md`](EXPLORER_SYNC_README.md)

## 📚 Library Structure Documentation (2026-03-22)

The `src/lib` folder now has comprehensive README files for each subdirectory:

| Directory        | Purpose                    | Key Exports                                                             |
| ---------------- | -------------------------- | ----------------------------------------------------------------------- |
| **components/**  | UI presentation layer      | Svelte components organized by concern (primitives, editor, activities) |
| **config/**      | Static app configuration   | Header links, menu items, app constants                                 |
| **context/**     | Svelte context providers   | Auth client, IDE runtime context                                        |
| **controllers/** | UI command orchestration   | Action handlers for explorer, editor, activity, workspace               |
| **hooks/**       | Lifecycle & composition    | Editor lifecycle, pane composition utilities                            |
| **services/**    | Persistence & runtime APIs | Convex saves, WebContainer integration, shell processes                 |
| **stores/**      | Reactive state (Svelte 5)  | Activity tabs, editor tabs, panel visibility                            |
| **svelte/**      | Client setup               | Convex + Better Auth client initialization                              |
| **sveltekit/**   | SSR utilities              | Server-side auth, Convex HTTP client, error formatting                  |
| **utils/**       | Pure utility functions     | Tree operations, file system helpers, language detection                |

Each README explains:

- What the folder contains
- Import patterns (leveraging the 3-tier structure)
- Design philosophy
- Usage examples

---

## 🆘 Troubleshooting

### Where do I start?

- Open [`EXPLORER_SYNC_README.md`](EXPLORER_SYNC_README.md).

### I do not understand the architecture

- Read [`ARCHITECTURE_EXPLORER.md`](ARCHITECTURE_EXPLORER.md)
  and [`VISUAL_REFERENCE.md`](VISUAL_REFERENCE.md).

### I do not know how to integrate

- Follow [`LAYOUT_INTEGRATION.md`](LAYOUT_INTEGRATION.md).

### I am lost in implementation

- Check [`IMPLEMENTATION_CHECKLIST.md`](IMPLEMENTATION_CHECKLIST.md)
  for the current phase.

### I need specific code

- Review examples in [`LAYOUT_INTEGRATION.md`](LAYOUT_INTEGRATION.md).

### Something is broken

- See troubleshooting in [`IMPLEMENTATION_GUIDE.md`](IMPLEMENTATION_GUIDE.md).

## 📊 Documentation Stats

| Type                  | Count      | Pages         |
| --------------------- | ---------- | ------------- |
| Architecture docs     | 3          | 15            |
| Implementation guides | 2          | 10            |
| Code examples         | 1          | 5             |
| Visual references     | 1          | 8             |
| Progress checklists   | 1          | 6             |
| **Total**             | **8 docs** | **~44 pages** |

## 🏆 What You Get

✓ Complete architecture for Convex ↔ Explorer sync
✓ 3 new controllers (projectSync, fileTree, explorerActions)
✓ 2 utility modules (fileTreeOps, projectFolderSync)
✓ 8 comprehensive documentation files
✓ Code examples & integration patterns
✓ Visual diagrams & flow charts
✓ Progress checklist & troubleshooting
✓ Type-safe, Svelte 5, production-ready code

---

**[← Previous](./08_What_Was_Built.md) | [Next: Next Steps →](./10_Next_Steps.md) | [Home](./README.md)**

## 🚀 Ready?

**→ Start reading [`EXPLORER_SYNC_README.md`](EXPLORER_SYNC_README.md) now!**

---

_Last updated: March 22, 2026_
_Architecture inspired by StackBlitz, implemented for Sandem with Convex + Svelte 5_
_Library consolidation: 3-tier index.ts structure (38 files) with zero export conflicts_
