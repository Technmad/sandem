# Components organization

> Last updated: 2026-03-22

Components are organized by shell concern and grouped into two domains.

## Structure

- `ui/` → reusable UI primitives and patterns
  - `primitives/` → base components (`Button`, `Card`, `Avatar`, `Tabs`, etc.)
  - `editor/` → editor-specific UI (`FileTree`, `Breadcrumbs`, `SaveStatus`)
  - `inputs/` → form inputs and controls (`SearchBar`, `DropDown`)
  - `navigation/` → header and menu chrome (`AppHeader`, `AppMenu`, `MenuBar`)
  - `layout/` → page layout primitives (`PageSection`)
  - `theme/` → theme switcher and mode toggle
  - `workspace/` → panel controls and resizing (`Resizer`, `PanelControls`)

- `ide/` → IDE-specific shell components
  - `activities/` → sidebar activity panels (`Explorer`, `Search`, `Git`, `Debug`)
  - `workspace/` → IDE shell chrome (`ActivityBar`, `Sidebar`, `Statusbar`, `Editor`, `Terminal`, `Preview`)

## Import style

Prefer single-line imports from consolidated parent paths:

```typescript
// UI components
import { Button, Card, Avatar } from '$lib/components/ui/primitives';
import { FileTree, Breadcrumbs } from '$lib/components/ui/editor';
import { AppHeader, MenuBar } from '$lib/components/ui/navigation';
import { ThemeSwitcher } from '$lib/components/ui/theme';
import { Resizer } from '$lib/components/ui/workspace';

// IDE components
import { Explorer, Search, Git } from '$lib/components/ide/activities';
import { ActivityBar, Sidebar, Editor, Preview } from '$lib/components/ide/workspace';

// Or from top-level barrel
import { Button, Explorer, ActivityBar } from '$lib/components/ui';
import { Editor, ActivityBar } from '$lib/components/ide';
```

## Design philosophy

- Components are **pure presentation** — no internal state management
- Styling uses global tokens in `src/app.css` + scoped `.svelte` files
- Prefer `#snippet` props and event handlers over context
- Center with `display: grid; place-items: center;` for robustness
