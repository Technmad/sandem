# Config organization

> Last updated: 2026-03-22

Configuration modules export static, unchanging data structures used to configure the app at startup.

## Structure

- `header.ts` → header navigation links, menu items, and header UI configuration

## Import style

```typescript
import { DEFAULT_HEADER_LINKS, MENU_ITEMS } from '$lib/config';
// Or from consolidated export
import { DEFAULT_HEADER_LINKS } from '$lib/config/header';
```

## Design philosophy

- Pure data structures — no functions or side effects
- Exported as `const` with TypeScript interfaces for type safety
- Used during layout initialization to avoid prop-drilling
- Can be extended per-route via layout components if needed
