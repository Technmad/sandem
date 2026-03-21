# Services organization

> Last updated: 2026-03-21

Services are for persistence/runtime API integration.

- `editor/` → Convex save APIs, WebContainer writes, Monaco setup, collaboration adapters
- `explorer/` → project file sync and remote fs-operation persistence
- `runtime/` → shell process and project mount runtime APIs

## Import style

- `import { createAutoSaver } from '$lib/services/editor/index.js'`
- `import { createProjectFilesSync } from '$lib/services/explorer/index.js'`
- `import { createShellProcess } from '$lib/services/runtime/index.js'`
