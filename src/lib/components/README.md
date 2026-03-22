# IDE components organization

> Last updated: 2026-03-20

IDE components are grouped by shell concern:

- `workspace/` → shell chrome and routing surfaces (`ActivityBar`, `Sidebar`, `Statusbar`)
- `panes/` → primary IDE panes (`Editor`, `Terminal`, `Preview`)
- `activities/` → sidebar activity panels (`Explorer`, `Search`, `Git`, `Debug`)

## Import style

Prefer grouped paths:

- `import Editor from '$lib/components/ide/panes/Editor.svelte'`
- `import ActivityBar from '$lib/components/ide/workspace/ActivityBar.svelte'`
- `import Search from '$lib/components/ide/activities/Search.svelte'`

Optional barrel:

- `import { Editor } from '$lib/components/ide/index.js'`
