**[← Home](./README.md) | [← Previous](./02_System_Architecture.md)** | [Next: Implementation Guide →](./04_Implementation_Guide.md)

---

# Sandem — Architecture Guide

> Last updated: 2026-03-21  
> **Philosophy:** Headless components + data injection + strict layer separation = maintainable at scale

---

## Overview

Sandem's frontend is organized by **concern**, not by screen. Each layer has a single responsibility:

```
┌─────────────────────────────────────────────┐
│         Routes / Layouts (SvelteKit)        │  ← Server data, page shells
├─────────────────────────────────────────────┤
│    Context / Config (Shared Getters)        │  ← Provides dependencies to children
├─────────────────────────────────────────────┤
│  Controllers (UI Command Orchestration)     │  ← Keyboard shortcuts, menu actions
│  Stores (Reactive State)                    │  ← Editor tabs, activity, panels
├─────────────────────────────────────────────┤
│   Services (Persistence / Runtime APIs)     │  ← File I/O, WebContainer, Convex
├─────────────────────────────────────────────┤
│  Utils (Pure Transforms)                    │  ← No side effects, testable
├─────────────────────────────────────────────┤
│   Components (Presentational Shells)        │  ← Props in, render out
└─────────────────────────────────────────────┘
```

**Data flows DOWN** (context/props). **Events bubble UP** (callbacks/dispatches). **No sideways imports** between layers.

---

## Folder Structure

```
src/lib/
├── components/          # Presentational shells (headless)
│   ├── ide/
│   │   ├── workspace/   # IDE chrome (ActivityBar, Sidebar, Statusbar)
│   │   ├── panes/       # Primary panes (Editor, Terminal, Preview)
│   │   └── activities/  # Sidebar panels (Explorer, Search, Git, Debug)
│   └── ui/
│       ├── primitives/  # Generic building blocks (Button, Card, Tabs)
│       ├── inputs/      # Form controls (SearchBar, DropDown)
│       ├── editor/      # Editor-specific displays (Breadcrumbs, FileTree)
│       ├── navigation/  # App navigation (AppHeader, MenuBar)
│       ├── workspace/   # Workspace helpers (RepoPaneLayout, Resizer)
│       ├── layout/      # Page templates (PageSection)
│       └── theme/       # Theme controls (ModeToggle, ThemeSwitcher)
│
├── controllers/         # UI command orchestration
│   ├── activity/        # Activity panel actions, keyboard handling
│   ├── editor/          # Editor shortcuts (Ctrl+S, Ctrl+F)
│   ├── explorer/        # File tree interaction (create, rename, delete)
│   └── workspace/       # App menu, command palette, pane controls
│
├── services/            # Persistence & runtime APIs
│   ├── editor/          # Autosave, file writer, Monaco config, collaboration
│   ├── explorer/        # File sync, remote fs operations
│   └── runtime/         # WebContainer shell process, project mounter
│
├── stores/              # Reactive state machines (Svelte 5 runes)
│   ├── activity/        # Which sidebar tab is active
│   ├── editor/          # Open tabs, cursor position, save status
│   ├── panel/           # Pane visibility, layout dimensions
│   └── collaboration/   # Permissions, remote cursors
│
├── hooks/               # Lifecycle composition (initialization only)
│   ├── editor/          # Editor runtime setup, lifecycle
│   └── runtime/         # WebContainer boot, shell setup
│
├── utils/               # Pure transformations (no side effects)
│   ├── editor/          # Editor helpers (path resolution, tab derivation)
│   ├── project/         # File tree conversion, project templates
│   └── errors/          # Error formatting, app-wide error handling
│
├── context/             # Context getters (dependency injection)
│   ├── ide/             # Provides getProject(), getWebcontainer()
│   └── auth/            # Auth state & client
│
├── config/              # Configuration constants
│   └── header.ts        # Navigation links, app config
│
├── types/               # Global TypeScript definitions
│   ├── projects.d.ts    # Project schema types
│   ├── editor.d.ts      # Editor state types
│   ├── routes.d.ts      # Page data types
│   └── ...
│
└── sveltekit/           # SvelteKit helpers
    └── errors.ts        # Error shaping for consistent handling
```

---

## Data Flow Example: Opening a File

```
User clicks file in Explorer
        ↓
Editor.svelte receives onSelect callback
        ↓
editorStore.openTab(path)  [Store mutation]
        ↓
autoSaver detects change via $derived(editorStore.activeTabPath)
        ↓
autoSaver.markDirty() → schedules save in 500ms
        ↓
createAutoSaver sends mutation to Convex API
        ↓
Service updates WebContainer fs via wc.fs.writeFile()
        ↓
Liveblocks Yjs document syncs to collaborators
        ↓
editorStore derived values update
        ↓
Components re-render (EditorBreadcrumb, SaveStatus, FileTree, etc.)
```

**Key observation:** Components don't know about the save logic. They only care about `editorStore.activeTabPath`. The service handles timing, batching, and Convex calls **invisibly**.

---

## Layer Responsibilities

### **Routes / Layouts** (`src/routes/`)

- **Responsible for:** Server-side data fetching, auth checks, error boundaries
- **Receives:** SvelteKit `PageData` from `+page.server.ts`
- **Provides:** Context setters (IDE context, panels context) + initial state

**Example:** [src/routes/repo/+layout.svelte](src/routes/repo/+layout.svelte)

```svelte
<script lang="ts">
	import { setIDEContext } from '$lib/context/ide/ide-context.js';
	import { createRepoController } from '$lib/controllers/workspace/index.js';

	// Create top-level orchestrator
	const repo = createRepoController({
		/* options */
	});

	// Provide shared getters to all children
	setIDEContext({
		getProject: () => repo.activeProject,
		getWebcontainer: () => webcontainer
	});
</script>
```

---

### **Context** (`src/lib/context/`)

- **Responsible for:** Providing shared getters & async operations to nested components
- **Pattern:** `setContext(key, getter)` + `getContext(key) → getter` (never the value itself)
- **Never:** Direct mutation. Context is read-only.

**Why getters?** Components always read the latest value, even if layout-level state changed.

**Example:**

```typescript
// src/lib/context/ide/ide-context.ts
const IDE_CONTEXT_KEY = Symbol();

export function setIDEContext(ide: IDEContext) {
	setContext(IDE_CONTEXT_KEY, ide);
}

export function requireIDEContext() {
	return getContext<IDEContext>(IDE_CONTEXT_KEY);
}

// In a component:
const ide = requireIDEContext();
let project = $derived(ide.getProject()); // Always current
```

---

### **Controllers** (`src/lib/controllers/`)

- **Responsible for:** Handling user input → coordinating side effects
- **Receives:** Getters for state/services, callbacks for UI updates
- **Never:** Directly import components or stores

**Example:** Keyboard shortcuts

```typescript
// src/lib/controllers/editor/createEditorShortcuts.svelte.ts
export function createEditorShortcuts(deps: {
	getPanels: () => PanelsState;
	onOpenSearch: () => void;
	onToggleCommandPalette: () => void;
}) {
	return {
		handleKeyDown: (e: KeyboardEvent) => {
			if (e.ctrlKey && e.key === 'k') {
				deps.onToggleCommandPalette();
			}
			if (e.ctrlKey && e.key === 'f') {
				deps.onOpenSearch();
			}
		}
	};
}
```

The controller **doesn't know about Editor.svelte**. It just calls callbacks. Tests can mock those callbacks.

---

### **Stores** (`src/lib/stores/`)

- **Responsible for:** UI state (not business logic)
- **Pattern:** Svelte 5 runes (`$state`, `$derived`, `$effect`)
- **Scope:** Single domain (editor tabs, activity bar, panels—not cross-domain)

**Example:**

```typescript
// src/lib/stores/editor/editorStore.svelte.ts
export const editorStore = {
	// State
	tabs: $state<EditorTab[]>([]),
	activeTabPath: $state<string | undefined>(),

	// Derived
	activeTab: $derived(editorStore.tabs.find((t) => t.path === editorStore.activeTabPath)),
	isDirty: $derived(editorStore.tabs.some((t) => t.unsaved)),

	// Mutations
	openTab: (path: string) => {
		editorStore.tabs.push({ path, unsaved: false, modified: Date.now() });
		editorStore.activeTabPath = path;
	},

	closeTab: (path: string) => {
		editorStore.tabs = editorStore.tabs.filter((t) => t.path !== path);
	}
};
```

**Stores are NOT singletons for data**—they're event buses for UI state changes. Services listen to these changes and persist them.

---

### **Services** (`src/lib/services/`)

- **Responsible for:** Persistence, runtime APIs, side effects
- **Pattern:** Creator functions returning methods
- **Key rule:** Services listen to stores/context, not the other way around

**Example:** Autosave service

```typescript
// src/lib/services/editor/createAutoSaver.svelte.ts
export function createAutoSaver(getProject: () => IDEProject | undefined) {
  let saveTimer: ReturnType<typeof setTimeout> | undefined;

  return {
    markDirty: () => {
      // Batch saves: only persist once per 500ms
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => this.forceSave(), 500);
    },

    forceSave: async () => {
      const project = getProject();
      if (!project) return;

      // Call Convex API
      await convexClient.mutation(api.projects.updateProject, { ... });
    }
  };
}
```

**In the Editor component:**

```svelte
<script>
	const ide = requireIDEContext();
	const autoSaver = createAutoSaver(() => ide.getProject());

	// Service watches the store
	$effect(() => {
		editorStore.isDirty; // Trigger side effect
		autoSaver.markDirty();
	});
</script>
```

The service **doesn't know about Editor.svelte**. It just has a getter. Tests can mock the getter.

---

### **Utils** (`src/lib/utils/`)

- **Responsible for:** Pure transformations (no side effects)
- **Pattern:** Functions, not classes; return stable values or new references
- **Testing:** Trivial—no mocks needed

**Example:**

```typescript
// src/lib/utils/editor/editorPaneView.ts
export function deriveEditorTabItems(tabs: EditorTab[]): TabItem[] {
	return tabs.map((t) => ({
		id: t.path,
		label: basename(t.path),
		active: false, // Set by component
		closable: true
	}));
}

export function shouldShowEmptyEditorState(tabs: EditorTab[]): boolean {
	return tabs.length === 0;
}
```

Call these in `$derived()` to recompute when inputs change.

---

### **Components** (`src/lib/components/`)

- **Responsible for:** Rendering only
- **Receive:** Props (data) + callbacks (events)
- **Never:** Import services, stores, or controllers directly
- **Pattern:** Accept data via props, emit via callbacks or `$bindable()`

**Headless principle:** Components are layout shells. Business logic lives elsewhere.

**Example: Primitive (Tabs.svelte)**

```svelte
<script lang="ts">
	type Props = {
		tabs: TabItem[];
		onSelect?: (id: string) => void;
		onClose?: (id: string) => void;
	};

	let { tabs = [], onSelect, onClose }: Props = $props();
</script>

<div class="tabs">
	{#each tabs as tab}
		<button onclick={() => onSelect?.(tab.id)} class:active={tab.active}>
			{tab.label}
			{#if tab.closable}
				<button onclick={() => onClose?.(tab.id)}>×</button>
			{/if}
		</button>
	{/each}
</div>
```

**Example: Container (Editor.svelte)**

```svelte
<script lang="ts">
	// Imports: Context, hooks, services, stores, utils (not components)
	const ide = requireIDEContext();
	const autoSaver = createAutoSaver(() => ide.getProject());
	const tabItems = $derived(deriveEditorTabItems(editorStore.tabs));

	function handleTabSelect(id: string) {
		editorStore.activeTabPath = id;
	}

	function handleTabClose(id: string) {
		editorStore.closeTab(id);
	}
</script>

<!-- Pass derived data DOWN as props -->
<div class="editor">
	<Tabs {tabItems} onSelect={handleTabSelect} onClose={handleTabClose} />
	<!-- Rest of editor UI -->
</div>
```

**The component orchestrates.** Services handle the hard work invisibly.

---

## Dependency Injection Pattern

Instead of:

```typescript
// ❌ BAD: Component imports a service directly
import { autoSaver } from '$lib/services/editor/createAutoSaver.js';
```

Do this:

```typescript
// ✅ GOOD: Service is created in the layout, passed via context/prop
const autoSaver = createAutoSaver(() => ide.getProject());

// Component receives it
const Editor = ({ autoSaver }) => {
	/* ... */
};
```

**Benefits:**

- Services are testable (mock the getter)
- Services don't assume global state
- Multiple independent instances possible
- Components stay pure

---

## Svelte 5 Runes

This codebase uses **Svelte 5 runes** exclusively:

### `$state` — Reactive variable

```typescript
let count = $state(0);
let user = $state({ name: 'Alice' });
```

### `$derived` — Computed value (recalculates automatically)

```typescript
let tabs = $state<Tab[]>([]);
let isDirty = $derived(tabs.some((t) => t.unsaved)); // Re-runs when tabs changes
```

### `$effect` — Side effect trigger

```typescript
let activeTab = $state<string>();
let project = $derived(ide.getProject());

$effect(() => {
	// Runs when activeTab or project changes
	autoSaver.markDirty();
});
```

### `$bindable` — Two-way binding for props

```typescript
// Parent: <Child bind:selected />
// Child: let { selected = $bindable() } = $props();
```

---

## Testing Strategy

### Unit Tests (Services)

```typescript
// src/lib/services/editor/__tests__/createAutoSaver.spec.ts
describe('createAutoSaver', () => {
	it('should batch rapid markDirty calls', async () => {
		const mockConvex = { mutation: vi.fn() };
		const saver = createAutoSaver(() => mockProject, { convex: mockConvex });

		saver.markDirty();
		saver.markDirty();
		saver.markDirty();

		// Wait for batch window
		await new Promise((r) => setTimeout(r, 600));

		// Only 1 mutation despite 3 calls
		expect(mockConvex.mutation).toHaveBeenCalledOnce();
	});
});
```

### Integration Tests (Components + Services)

```typescript
// Test that Editor + autoSaver work together
describe('Editor', () => {
  it('should auto-save when content changes', async () => {
    const { getByRole } = render(Editor, { props: { ... } });
    const editor = getByRole('textbox');

    await userEvent.type(editor, 'hello');

    // Verify mockConvex.mutation was called
    expect(mockConvex.mutation).toHaveBeenCalled();
  });
});
```

### E2E Tests (Full user flows)

See `e2e/` folder. Test realistic scenarios:

- Open project → edit file → auto-save → reload → changes persist
- Two users editing same file → see real-time updates
- Network failure → graceful recovery

---

## Common Patterns

### Pattern 1: Component with Internal Service

```svelte
<script lang="ts">
	const ide = requireIDEContext();
	const autoSaver = createAutoSaver(() => ide.getProject());

	$effect(() => {
		if (isDirty) autoSaver.markDirty();
	});
</script>
```

### Pattern 2: Shared Store Mutation

```typescript
// src/lib/stores/editor/editorStore.svelte.ts
export const editorStore = {
  tabs: $state([]),
  openTab: (path: string) => {
    editorStore.tabs.push({ path });
  }
};

// In a component:
<button onclick={() => editorStore.openTab('/src/App.svelte')}>Open</button>
```

### Pattern 3: Derive Complex UI State

```typescript
const activeTab = $derived(editorStore.tabs.find((t) => t.path === editorStore.activeTabPath));
const breadcrumbs = $derived(activeTab ? toPathSegments(activeTab.path) : []);
const isDirty = $derived(activeTab?.unsaved ?? false);
```

### Pattern 4: Context for Shared Dependencies

```typescript
// Layout
setIDEContext({
	getProject: () => repo.activeProject,
	getWebcontainer: () => webcontainer
});

// Deep child component
const ide = requireIDEContext();
const project = $derived(ide.getProject());
```

---

## What NOT to Do

❌ **Import a service from a component**

```typescript
import { autoSaver } from '$lib/services/...'; // NO!
```

❌ **Store in a service references a component**

```typescript
// In a service:
import { myComponent } from '$lib/components/...'; // NO!
```

❌ **Circular dependencies** (Store A imports Store B imports Store A)

```typescript
// Store A
import { storeB } from '$lib/stores/B';
storeB.subscribe(...); // NO! Circular.
```

❌ **Global mutable state**

```typescript
let globalEditor; // NO! Makes testing impossible.
```

❌ **Business logic in components**

```svelte
<script>
	// File parsing, math, transformations → utils instead!
	const result = complexTransform(data);
</script>
```

---

## Next Steps for Maintainers

1. **Read [AGENTS.md](AGENTS.md)** for session resume checklist & scripts
2. **Check [TO-DO.md](TO-DO.md)** for S-grade improvements roadmap
3. **Run `pnpm run check`** to catch type errors before shipping
4. **Write tests** for any new service (test the business logic, not the UI)
5. **Keep components simple** — if it's more than 100 lines, extract a service

---

---

**[← Previous](./02_System_Architecture.md)** | [Next: Implementation Guide →](./04_Implementation_Guide.md) | [Home](./README.md)
