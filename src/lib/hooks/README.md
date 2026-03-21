# Hooks organization

> Last updated: 2026-03-21

Hooks are now lifecycle/composition only:

- `editor/` → editor lifecycle hooks (`createEditorRuntime`, `createEditorStatus`)
- `runtime/` → pane lifecycle hooks (`createPreview`, `createChatPane`)

## Architecture split

- `src/lib/hooks/*` → UI-composition lifecycle pieces
- `src/lib/controllers/*` → UI command orchestration
- `src/lib/services/*` → persistence/runtime APIs

## Import style

- `import { createEditorRuntime } from '$lib/hooks/editor/index.js'`
- `import { createExplorerActivity } from '$lib/controllers/explorer/index.js'`
- `import { createCommandPaletteController } from '$lib/controllers/workspace/index.js'`
- `import { createAutoSaver } from '$lib/services/editor/index.js'`
- `import { createShellProcess } from '$lib/services/runtime/index.js'`
