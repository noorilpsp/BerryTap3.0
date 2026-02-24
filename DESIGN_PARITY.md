# Design Parity Guide

This document defines how to achieve design consistency when migrating modules from table-merge-manager (or other source projects) into NextFaster. Use the checklists below **before closing each migration task**.

---

## Root Causes of Design Inconsistency

| Cause | table-merge | NextFaster |
|-------|-------------|------------|
| **Theme system** | HSL variables + Tailwind v3 `hsl(var(--x))` | oklch variables + Tailwind v4 |
| **Component defaults** | Select h-10 w-full, Button h-10 | Select h-9 w-fit, Button h-9 |
| **Portaled content** | N/A (theme applied globally) | Radix renders in `body` — layout-scoped styles don't apply |
| **UI library** | Separate shadcn fork, different Radix versions | Different defaults (checkmark position, spacing, etc.) |

---

## Approach: What We Did (Reservations & Counter Pattern)

For each migrated ops route, we use this pattern:

### 1. Layout (`app/<route>/layout.tsx`)

- Import the route's CSS file
- Wrap content in a root div with `ops-<route>-root dark bg-zinc-950 text-zinc-100` and Inter font
- Render `Ops<Route>Attr` to set `data-ops-<route>` on `html` when the route is active

```tsx
import { OpsCounterAttr } from "@/components/navigation/ops-counter-attr"
import "./ops-counter.css"

export default function CounterLayout({ children }) {
  return (
    <div className="ops-counter-root dark min-h-dvh bg-zinc-950 text-zinc-100 ...">
      <OpsCounterAttr fontVariableClass={inter.variable} />
      {children}
    </div>
  )
}
```

### 2. CSS file (`app/<route>/ops-<route>.css`)

- `.ops-<route>-root` — Theme variables (--background, --primary, etc.) for in-page content
- `html[data-ops-<route>] [data-slot="..."]` — Overrides for portaled content (dialogs, selects, dropdowns) that render in `body`

### 3. Attr component (`components/navigation/ops-<route>-attr.tsx`)

- Client component that sets `document.documentElement.dataset.ops<Route> = "true"` on mount
- Cleans up on unmount (when navigating away)

### Why Portaled Content Needs `html[data-ops-*]`

Radix dialogs, selects, tooltips, popovers render in `document.body`, outside the layout wrapper. So `.ops-counter-root` styles don't apply to them. We set `data-ops-counter` on `html` when on that route, then target portaled elements with `html[data-ops-counter] [data-slot="dialog-content"]` etc.

---

## Design Parity Checklist (Per Migration)

Before closing a migration task, verify:

### Form Controls
- [ ] Select trigger: height, width, border, background match source
- [ ] Select dropdown (portaled): colors, font, item hover match source
- [ ] Input/Textarea: height, padding, border, placeholder color
- [ ] Button: height, padding, border-radius, font size
- [ ] Checkbox: size, border, checked state colors
- [ ] Switch/Toggle: track size, thumb size, colors, animation

### Colors
- [ ] Background and foreground match source theme
- [ ] Primary (e.g. cyan) matches source
- [ ] Borders and muted/secondary match
- [ ] Buttons (primary, outline) use correct colors

### Dropdowns & Popovers
- [ ] Dropdown menu background, border, text color
- [ ] Dropdown item hover/active state
- [ ] Popover background and border
- [ ] Tooltip styling (if used)
- [ ] Portaled content (dropdowns, modals) inherits correct theme

### Scroll Behavior
- [ ] Detail panels scroll when content overflows
- [ ] Modals/dialogs scroll when content is tall
- [ ] Flex children have `min-h-0` where needed for scroll

### Typography & Spacing
- [ ] Font family matches (e.g. Inter)
- [ ] Font sizes match (labels, body, headings)
- [ ] Spacing (padding, gap, margin) matches source
- [ ] Letter-spacing and text-transform where applicable

---

## Module Checklists

### Reservations (`/reservations`)

| Item | Status |
|------|--------|
| **Form controls** | Select, Input, Button match table-merge |
| **Colors** | Dark zinc/cyan theme via ops-reservations.css |
| **Dropdowns** | Portaled select, popover, calendar styled |
| **Scroll** | Detail panel and modals scroll correctly |
| **Typography** | Inter, uppercase labels, correct sizes |

**Files:** `src/app/reservations/ops-reservations.css`, `src/components/reservations/ops-reservations-attr.tsx`

---

### Counter (`/counter`)

| Item | Status |
|------|--------|
| **Form controls** | Select, Input, Button, Checkbox, PaymentToggle |
| **Colors** | Dark zinc/cyan theme via ops-counter.css |
| **Dropdowns** | Dialog, AlertDialog, portaled content styled |
| **Scroll** | Payment modal, CustomizeItemModal, panels scroll |
| **Typography** | Inter, section labels, pill buttons |

**Files:** `src/app/counter/ops-counter.css`, `src/components/navigation/ops-counter-attr.tsx`, `src/components/table-detail/payment-toggle.tsx`

---

### Tables (`/tables`, `/table/[id]`)

| Item | Status |
|------|--------|
| **Layout** | ops-tables-root, ops-tables.css, OpsTablesAttr (shared by tables + table detail) |
| **Colors** | Dark zinc/cyan theme via ops-tables.css |
| **Portaled** | Dialog, Sheet, Select, CustomizeItemModal, PaymentModal, SeatPartyModal styled |
| **Hub page** | Links to Floor Map, Layout Builder, quick table links (T1–T12) |
| **Table detail** | TopBar, TableVisual, WaveTimeline, OrderList, InfoPanel, ActionBar, PaymentModal, SeatPartyModal, CustomizeItemModal |
| **my-tables components** | TableCard, MyTablesTopBar, FilterSortBar, QuickStats, SeatNewTableButton (available for server view) |

**Files:** `src/app/tables/ops-tables.css`, `src/app/table/layout.tsx`, `src/components/navigation/ops-tables-attr.tsx`, `src/components/table-detail/*`, `src/components/take-order/*`, `src/components/floor-map/seat-party-modal.tsx`, `src/lib/table-data.ts`, `src/lib/floor-map-data.ts`

---

### Future Migrations

When migrating a new ops route, follow the same pattern as Reservations and Counter:

1. **Layout** — Add `ops-<route>-root` wrapper, import `ops-<route>.css`, render `Ops<Route>Attr`
2. **CSS file** — Create `app/<route>/ops-<route>.css` with `.ops-<route>-root` theme vars and `html[data-ops-<route>]` portaled overrides
3. **Attr component** — Create `Ops<Route>Attr` that sets `data-ops-<route>` on `html`
4. Run through the checklist above
5. Add a row to the Module Checklists section

---

## Component Default Overrides

For form controls that need source sizing, use explicit classes:

- `h-10 w-full` for Select, Input when migrating from table-merge
- Add `className="h-10 w-full"` to components in migrated pages
- Or add overrides to the shared ops theme CSS when many components need it

---

## Reference: Table-Merge Theme (HSL)

```css
--background: 220 20% 4%;
--foreground: 210 20% 95%;
--primary: 185 85% 45%;
--primary-foreground: 220 20% 4%;
--secondary: 220 15% 12%;
--muted: 220 15% 12%;
--muted-foreground: 220 10% 48%;
--border: 220 15% 14%;
--input: 220 15% 14%;
--ring: 185 85% 45%;
```

Use `hsl(220 20% 4%)` (with space-separated values) in CSS when NextFaster expects full color values.
