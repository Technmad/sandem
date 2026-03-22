# Utils organization

> Last updated: 2026-03-22

Utilities provide pure, stateless helper functions for data transformation and tree operations.

## Structure

- `editor/` → editor and file tree utilities
  - `editorPaneView.ts` → derive UI state from editor tabs
  - `fileTreeOps.ts` → file tree construction and navigation
  - `explorerTreeOps.ts` → tree searching and filtering
  - `language.ts` → language detection from filenames
  - `projectFolderSync.ts` → project folder initialization and serialization

- `project/` → project and file system utilities
  - `filesystem.ts` → project file tree conversion and path helpers
  - `guards.ts` → type guards for project validation
  - `projects.ts` → project comparison and deduplication
  - `template.ts` → starter project template definitions

## Import style

Single-line imports from domain folders:

```typescript
import { readDirRecursive, collectDirectoryPaths } from '$lib/utils/editor';
import { projectFilesToTree, resolveProjectFileName } from '$lib/utils/project';

// Or from top-level barrel
import { readDirRecursive, projectFilesToTree } from '$lib/utils';
```

## Design philosophy

- **Pure functions** — no side effects, no state
- **Testable** — no mocks or setup required
- **Stable** — return consistent structures for `$derived()`
- **Composable** — small, single-purpose functions
- **Tree operations** are BFS/DFS algorithms operating on readonly data
