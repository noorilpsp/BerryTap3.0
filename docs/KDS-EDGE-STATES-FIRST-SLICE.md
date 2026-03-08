# KDS Edge States First Slice

Documentation of empty, error, and fallback states after the first polish pass.

## Files Changed

| File | Change |
|------|--------|
| `src/components/kds/KDSEmptyState.tsx` | Optional `message` prop, theme-aware, client component |
| `src/components/kds/KDSColumn.tsx` | `emptyStateMessage` prop; column-specific default messages |
| `src/app/kds/page.tsx` | `KDSNoLocationState`, `KDSErrorState`, `KDSStaleBanner`; empty-stations banner |
| `src/lib/hooks/useKdsView.ts` | `staleError` state; silent refresh failure keeps view |

## Supported Edge States

### 1. No location selected

**When:** `locationId` is null after location resolve.

**User sees:** Centered message: "No location selected" + "Select a store in POS or KDS settings."

**Behavior:** Full-page state with theme styling. No retry or action buttons.

---

### 2. Initial load failure

**When:** First `GET /api/kds/view` fails (no view exists yet).

**User sees:** Full-page error message + Retry button.

**Behavior:** No view. Retry triggers `refresh()` (non-silent). Same as any non-silent refresh failure.

---

### 2b. Silent refresh / poll failure (view already exists)

**When:** Poll or visibility-triggered refresh fails and KDS already has a view.

**User sees:** KDS stays visible. Amber banner at top: "Couldn't refresh KDS. Showing last known data." + Retry button.

**Behavior:** View preserved. `staleError` set; banner shows until next successful refresh. Retry triggers non-silent refresh; on success banner clears; on failure full-page error.

---

### 3. No stations configured

**When:** `STATIONS.length === 0` (API returned empty; in practice API adds kitchen fallback).

**User sees:** Amber banner: "No stations configured. Add stations in KDS settings" (link).

**Behavior:** Banner above content. Header still renders; station tabs would be empty.

---

### 4. No tickets in column

**When:** Column has zero orders (NEW, PREPARING, or READY).

**User sees:** Column-specific empty state:

- NEW: "No new orders"
- PREPARING: "No orders in prep"
- READY: "Nothing ready"

**Behavior:** `KDSEmptyState` with ChefHat icon, themed text. Delay before showing so exit animation can run.

---

### 5. Station tab with no visible tickets

**When:** Station has no orders, or all orders are in other columns.

**User sees:** Same as above; column header shows (0). Each empty column shows its message.

---

### 6. All tickets snoozed

**When:** All orders in a column are snoozed.

**User sees:** Snoozed tickets (dimmed) at bottom. Not an empty state; tickets remain visible.

---

### 7. Station removed while viewing

**When:** Active station is no longer in `STATIONS` (e.g. deactivated).

**User sees:** `activeStationId` syncs to first available station. No explicit message.

---

### 8. Loading

**When:** Initial fetch or non-silent refresh.

**User sees:** Full-screen overlay: "Loading KDS…" (white on dark).

---

## Remaining Limitations

1. **Initial load / no-view failure** – When no view exists, failure still shows full-page error. Stale banner only when view exists.
2. **No location has no action** – No button to open settings; user must navigate manually.
3. **Empty stations is rare** – API guarantees at least kitchen; banner is for edge cases.
4. **Lane empty state** – PreparingLanes lanes use plain "No orders" text; not `KDSEmptyState`.
5. **Mobile tabs** – Same empty logic; no extra mobile-specific states.
