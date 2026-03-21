# Controllers organization

> Last updated: 2026-03-21

Controllers are for UI command orchestration.

- `activity/` → activity panel actions and keyboard command handling
- `explorer/` → explorer interaction flows (tree state, create/rename/delete, panel actions)
- `editor/` → editor command orchestration (shortcuts)
- `workspace/` → app menu, command palette, and right-pane tab control

## Import style

- `import { createActivityBarController } from '$lib/controllers/activity/index.js'`
- `import { createExplorerPanelController } from '$lib/controllers/explorer/index.js'`
- `import { createEditorShortcuts } from '$lib/controllers/editor/index.js'`
- `import { createAppMenuController } from '$lib/controllers/workspace/index.js'`
