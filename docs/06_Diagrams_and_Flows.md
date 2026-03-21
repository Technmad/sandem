# Visual Reference: Convex ↔ Explorer Sync

## System Flow Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    USER INTERACTIONS                         │
│                                                              │
│  1. Clicks "New Folder"    2. Enters name          3. Sees  │
│  ┌─────────────┐    →      ┌─────────────┐    →   folder   │
│  │ Explorer    │           │ Input dialog│        in tree   │
│  │ UI          │           │ "my-project"│                  │
│  └──────┬──────┘           └──────┬──────┘                  │
│         │                         │                         │
│         │                         ▼                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    createFolderAtRoot("my-project")                 │   │
│  │    (Explorer Actions Controller)                     │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    createProjectFolder("my-project")                │   │
│  │    (Project Sync Hook)                             │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
└───────────────────┼─────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    CONVEX BACKEND                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    createProject mutation                            │   │
│  │    args: {                                          │   │
│  │      title: "my-project",                           │   │
│  │      owner: "user123",                              │   │
│  │      files: [],                                     │   │
│  │      room: "room-..."                               │   │
│  │    }                                                │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    Database Insert                                  │   │
│  │                                                     │   │
│  │    projects                                        │   │
│  │    _id    | title      | owner  | room             │   │
│  │    ────────────────────────────────────────────     │   │
│  │    123   | my-project | user123| room-...  ✓      │   │
│  │                                                     │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   │ returns projectId: "123"                │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    Mutation Response                                │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
└───────────────────┼─────────────────────────────────────────┘
                    │
                    ▼ (promise resolves)
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                    FRONTEND UPDATE                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    projectSync.syncProjects()                       │   │
│  │    (refresh projects from Convex)                   │   │
│  │                                                     │   │
│  │    projects = [                                    │   │
│  │      { _id: "123", title: "my-project", ... }  ✓  │   │
│  │    ]                                              │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    fileTree.refresh()                              │   │
│  │    (re-scan root folders)                          │   │
│  │                                                     │   │
│  │    getWorkspaceRootFolders()                       │   │
│  │    → ["123"]  (project IDs from projectSync)       │   │
│  │                                                     │   │
│  │    readDirRecursive(".", ["123"])                  │   │
│  │    → finds folder "123" in WebContainer            │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
│                   ▼                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │    tree = [                                        │   │
│  │      {                                             │   │
│  │        name: "my-project",                         │   │
│  │        path: "123",                                │   │
│  │        type: "directory",                          │   │
│  │        depth: 0,                                   │   │
│  │        children: [...]                            │   │
│  │      }                                             │   │
│  │    ]                                              │   │
│  │                                                     │   │
│  │    fileTree.$state.tree = tree ✓                   │   │
│  └────────────────┬─────────────────────────────────────┘   │
│                   │                                         │
└───────────────────┼─────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                  EXPLORER UI RE-RENDERS                      │
│                                                              │
│  {#each fileTree.tree as node}                             │
│    <FolderNode {node} />    ← Shows "my-project"           │
│  {/each}                                                   │
│                                                              │
│  [📁] my-project                    ✓ NOW VISIBLE          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## State Diagram: Project Lifecycle

```
┌─────────────┐
│   Initial   │
│   State     │
└──────┬──────┘
       │ user types folder name
       ▼
┌─────────────────────────────┐
│ Creating (optimistic state) │
│ explorerActions.creatingFo..│
│ loading = true              │
└──────┬──────────────────────┘
       │ createProject mutation
       ▼
┌─────────────────────────────┐
│ Creating in Convex          │
│ (awaiting mutation)         │
│ Network in progress         │
└──────┬──────────────────────┘
       │ mutation resolves
       ▼
┌─────────────────────────────┐
│ Syncing from Convex         │
│ projectSync.syncProjects()  │
│ Network in progress         │
└──────┬──────────────────────┘
       │ query resolves
       ▼
┌─────────────────────────────┐
│ Refreshing File Tree        │
│ fileTree.refresh()          │
│ WebContainer in progress    │
└──────┬──────────────────────┘
       │ refresh completes
       ▼
┌─────────────────────────────┐
│ Done!                       │
│ loading = false             │
│ tree contains new project   │
│ UI renders new folder       │
└─────────────────────────────┘
```

## Component Relationships

```
┌──────────────────────────────────────────────┐
│         Repo Layout (+layout.svelte)         │
│                                              │
│  Creates:                                    │
│  • projectSync                               │
│  • fileTree                                  │
│  • explorerActions                           │
│                                              │
│  Passes down as $props()                     │
└──────────────────┬───────────────────────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
       ▼                       ▼
┌──────────────┐      ┌──────────────────┐
│  Explorer    │      │  Editor Pane     │
│  Component   │      │  Component       │
│              │      │                  │
│ Uses:        │      │ Uses:            │
│ • fileTree   │      │ • fileTree (maybe)
│ • actions    │      │ • projectSync    │
│              │      │                  │
│ Emits:       │      │ Emits:           │
│ • create folder       │ • file changes   │
│ • delete folder       │ • switch files   │
│ • toggle expand       │                  │
│ • select file         │                  │
└──────────────┘      └──────────────────┘
       ▲                       ▲
       │                       │
       └───────────┬───────────┘
                   │
                   │ (props down, events up)
                   │
              Children render
```

## Data Mutation Timeline

```
Timeline              Convex State       Explorer State
────────              ──────────         ──────────────

T=0                   projects:[]        tree: []

[User clicks "New"]

T=0.1s   ──────────→  Mutation sent      [Creating...]

T=0.2s                                   (waiting)

T=0.3s   ←──────────  {_id: "123"}       (awaiting)

T=0.4s                projects:[         refresh() called
                        {_id: "123",
                         title: "new-project"}
                       ]

T=0.5s                                   readDirRecursive()

T=0.6s   ←──────────  [result]           tree: [
                                          {path: "123",
                                           name: "new-project",
                                           type: "directory"}
                                        ]

T=0.7s                                   [✓ Render!]

                                         [📁] new-project
```

## Error Flow

```
User action
    │
    ▼
explorerActions.createFolderAtRoot()
    │
    ├─ projectSync.createProjectFolder()
    │   │
    │   ├─ Success ──→ projectSync.syncProjects()
    │   │   │
    │   │   └─→ fileTree.refresh()
    │   │       │
    │   │       └─→ Update UI
    │   │
    │   └─ Error ──→ explorerActions.error = "Convex error"
    │       │
    │       └─→ Display error to user
    │
    └─ catch (err)
        │
        └─→ explorerActions.error = "Network error"
            │
            └─→ Show error toast
```

## File Tree Filtering (The Key!)

```
Raw WebContainer Root Directory:
  ./
  ├── node_modules
  ├── .git
  ├── my-project-id-123
  ├── another-project-id-456
  └── temp-folder

Convex Projects Table:
  _id: "123", title: "my-project"
  _id: "456", title: "another-project"

Filter Applied:
  getWorkspaceRootFolders() → ["123", "456"]

File Tree After Filter:
  ./
  ├── my-project-id-123    ← Only projects!
  └── another-project-id-456

Explorer Shows:
  [📁] my-project
  [📁] another-project

  (temp-folder is hidden)
```

## Type Safety Flow

```
User Input
    │
    ▼
explorerActions.createFolderAtRoot(name: string)
                                   ├─ name is typed ✓
    │
    ▼
projectSync.createProjectFolder(title: string)
                               ├─ title is typed ✓
    │
    ▼
convexClient.mutation(api.projects.createProject, {...})
                                    ├─ args are typed ✓
                                    ├─ returns Promise<string> ✓
    │
    ▼
Result: projectId (typed as string)
    │
    ▼
projectSync.syncProjects()
    │
    ▼
projects: Array<ProjectFolder> (typed)
    │
    ▼
projectSync.getWorkspaceRootFolders(): string[]
                                       ├─ return type is typed ✓
    │
    ▼
fileTree.refresh()
    │
    ▼
tree: FileNode[] (typed)
    │
    ▼
{#each tree as node}
       ├─ node.path: string ✓
       ├─ node.type: 'file' | 'directory' ✓
       └─ node.children?: FileNode[] ✓
```

---

**Use these diagrams when explaining the architecture to others!**
