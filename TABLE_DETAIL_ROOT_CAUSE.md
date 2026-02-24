# Root Cause: /table/[id] Design Mismatches

## The Problem

Header, meal progress container, Table Info panel, animations, circles (seat badges) all look wrong compared to table-merge-manager.

## Root Cause: Theme Format Mismatch

| | table-merge | NextFaster |
|---|-------------|------------|
| **Theme system** | HSL variables in `:root`: `--background: 220 20% 4%`, `--card: 220 18% 7%` | oklch variables in `.dark`: `--background: oklch(0.12 0.01 250)`, `--card: oklch(0.15 0.01 250)` |
| **Tailwind** | v3, uses `hsl(var(--background))` | v4 with `@theme inline`, uses `var(--background)` directly |
| **Our override** | N/A (native) | We set `--background: 220 20% 4%` in `.ops-tables-root` |

**The bug:** In ops-tables-root we set raw HSL values like `--background: 220 20% 4%`. In Tailwind v4, `@theme` maps `--color-background: var(--background)`, and utilities use that. The raw value `220 20% 4%` is **not a valid CSS color** — it must be wrapped as `hsl(220 20% 4%)`. So `bg-background`, `bg-card`, etc. end up with invalid or wrong colors.

**Flow:**
1. Components use `bg-card`, `bg-background`, `bg-secondary`
2. Tailwind outputs something using `var(--color-card)` etc.
3. We override `--card: 220 18% 7%` — invalid on its own
4. `.dark`'s oklch values may win, or the invalid value is ignored
5. Result: wrong container colors (header, meal progress, Table Info sidebar)

## Secondary Issues

- **Animations:** Added to globals.css; could be overridden by `prefers-reduced-motion` or load order.
- **Circles/seat badges:** Use gradients and theme colors; when theme variables resolve wrong, they look different.
- **Layout:** Table layout uses `ops-tables-root dark`; the `.dark` theme (oklch) applies to the whole app, and our HSL overrides don't correctly override it for Tailwind utilities.

## Fix Strategy

**Option A (recommended):** Use full color values in ops-tables-root so Tailwind receives valid colors:
```css
.ops-tables-root {
  --background: hsl(220 20% 4%);
  --card: hsl(220 18% 7%);
  --secondary: hsl(220 15% 12%);
  /* ... all as full hsl() values */
}
```

**Option B:** Add explicit overrides for every semantic container, bypassing variables:
```css
.ops-tables-root .bg-background { background-color: hsl(220 20% 4%) !important; }
.ops-tables-root .bg-card { background-color: hsl(220 18% 7%) !important; }
.ops-tables-root aside.bg-card { background-color: hsl(220 18% 7%) !important; }
/* etc. */
```

**Option C:** Convert table-merge HSL to oklch and use those in ops-tables-root so they match Tailwind v4's expected format.
