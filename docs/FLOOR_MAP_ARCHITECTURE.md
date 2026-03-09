# Floor Map Page Architecture Specification

## 1. Overview

The Floor Map page (`/floor-map`) is responsible for:

- **Displaying the floor plan** – Tables laid out on a map or grid with status (free, active, urgent, billing, closed)
- **Per-table summary** – Waves (drinks/food/dessert), alerts, bill total, server, dietary/occasion notes
- **Filtering** – By status, section, server assignment (my tables, my section)
- **Navigation** – Navigate to table detail, focus sections, search/jump to tables
- **Seat party** – Create a new session at a table (optimistic + API)
- **Floor plan switching** – Change active floor plan and load its tables

The page must feel fast, consistent with `/table/[id]` and `/kds`, and maintain a single clear loading state before showing content.

---

## 2. Current Architecture Summary

| Aspect | Current Behavior |
|--------|------------------|
| **Data source** | `restaurantStore.tables` (Zustand) populated by server actions (`getTablesForLocation`, `getTablesForFloorPlan`) |
| **Load path** | `RestaurantHydrationRunner` + Floor Map page’s own load; page can overwrite store with `store.setTables()` on floor plan change |
| **Read model** | `storeTablesToFloorTables` → `FloorTable[]`; `buildFloorMapLiveDetail(table, storeTable, openOrder)` → per-table detail |
| **API** | No dedicated Floor Map API; server actions for tables/floor plans + `fetchPos` for sessions only |
| **Mutations** | Optimistic `store.updateTable` + `store.openOrderForTable`; then `fetchPos("/api/sessions/ensure")`; no rollback on failure |
| **Refresh** | None – no polling or manual refresh |
| **Loading** | Spinner until `currentLocationId` and `initialLoadDone` |
| **Error** | Toast only; no structured error state or retry |
| **Server identity** | Hardcoded `currentServer` in `floor-map-data.ts` |

---

## 3. Target Architecture

### 3.1 FloorMapView Read Model

A typed read model returned by the Floor Map API, validated and consumed by the front-end.

```ts
interface FloorMapView {
  tables: FloorMapTable[]
  sections: { id: string; name: string }[]
  floorplan: {
    id: string | null
    elements: PlacedElement[]
    activeId: string | null
  }
  statusCounts: { free: number; active: number; urgent: number; billing: number; closed: number }
  currentServer: { id: string; name: string; section: string; assignedTableIds: string[] } | null
}

interface FloorMapTable {
  id: string
  number: number
  section: string
  status: "free" | "active" | "urgent" | "billing" | "closed"
  capacity: number
  guests: number
  stage: "drinks" | "food" | "dessert" | "bill" | null
  position: { x: number; y: number }
  shape: string
  serverId: string | null
  serverName: string | null
  seatedAt: string | null
  alerts: string[]
  width?: number
  height?: number
  rotation?: number
  // Per-table detail for waves, bill, etc.
  waves?: { type: string; status: string }[]
  billTotal?: number
}
```

- Server is the single source of truth; client derives UI from `FloorMapView`.
- Validation: `isFloorMapView(data)` guard before use.

### 3.2 API Contract: GET /api/floor-map/view

**Request:**
- Query: `locationId` (required), `floorplanId` (optional; uses active if omitted)

**Response:** POS envelope

```json
{
  "ok": true,
  "data": { /* FloorMapView */ },
  "correlationId": "..."
}
```

On failure:
```json
{
  "ok": false,
  "error": { "message": "..." },
  "correlationId": "..."
}
```

- Uses `getPosMerchantContext`, auth, and location access checks.
- Aggregates tables, sections, floor plan, status counts, and current server into one response.
- No separate calls for layout vs. live data; one round-trip per refresh.

### 3.3 useFloorMapView Hook

```ts
type UseFloorMapViewResult = {
  view: FloorMapView | null
  loading: boolean
  error: string | null
  staleError: string | null
  refresh: (silent?: boolean) => Promise<boolean>
  patch: (updater: (prev: FloorMapView) => FloorMapView) => void
}

function useFloorMapView(locationId: string | null, floorplanId?: string | null): UseFloorMapViewResult
```

- `view`: parsed `FloorMapView` or `null` while loading/on error.
- `loading`: true during non-silent fetch.
- `error`: initial load or non-silent refresh failure; triggers full-page error.
- `staleError`: silent refresh failure when `view` exists; shows banner, keeps last data.
- `refresh(silent)`: fetches `/api/floor-map/view`; updates `view`/`error`/`staleError`.
- `patch`: optimistic updates; applies `updater` to current `view`; no server call.

Pattern mirrors `useKdsView`.

### 3.4 Mutation Pattern: mutate → refresh

All mutations follow:

1. Optionally `patch` for optimistic UI.
2. Call mutation API (`fetchPos` or server action).
3. On success: `refresh(true)` to reconcile.
4. On failure: revert `patch` (if used) and surface error.

Example wrapper:

```ts
async function mutateThenRefresh<T>(
  label: string,
  endpoint: string,
  fn: () => Promise<T>
): Promise<T | null> {
  try {
    const result = await fn()
    refresh(true)
    return result
  } catch (error) {
    // Revert optimistic patch if any
    // Show error dialog / toast
    return null
  }
}
```

### 3.5 Optimistic Update Strategy

- **Seat party**: `patch` to add table to active, update counts; on API success, `refresh`; on failure, revert `patch`, show error.
- **No optimistic patch** when not needed (e.g. floor plan switch is fine to wait for response).
- `patch` only mutates in-memory `view`; server remains source of truth; `refresh` reconciles.

### 3.6 Loading / Error State Model

| State | Condition | UI |
|-------|-----------|-----|
| Loading | `!locationIdResolved` or `view === null` and `error === null` | `FloorMapPageSkeleton` |
| Error | `error !== null` | `FloorMapErrorState` (message + Retry) |
| Stale | `view !== null` and `staleError !== null` | Banner + Retry; keep showing `view` |
| Ready | `view !== null` and `error === null` | Full Floor Map UI |
| No location | `locationIdResolved` and `locationId === null` | `FloorMapNoLocationState` |

- No spinner or generic “Loading...” text; only skeleton for loading.
- `locationIdResolved` distinguishes “still resolving location” from “no location selected”.

### 3.7 Skeleton Behavior

- One skeleton: `FloorMapPageSkeleton`.
- Shown until both:
  - Location context resolved (or known to be absent).
  - `view !== null` and no blocking error.
- Skeleton should resemble layout (map/grid, top bar) for a smooth transition.
- Same approach as `KdsPageSkeleton` and `TablePageSkeleton`.

### 3.8 State Ownership Rules

- **`view`**: owned by `useFloorMapView`; single source of truth for Floor Map data.
- **`locationId`**: from `LocationContext` (via OpsProviders).
- **Floor plan ID**: local state or derived from `view.floorplan.activeId`; switching triggers `refresh` with new `floorplanId`.
- **UI state**: local (zoom, view mode, filters, highlighted table, modals).
- **`restaurantStore`**: not used for Floor Map primary data; may remain for cross-page concerns (e.g. SeatPartyModal table list) until fully migrated.
- **`currentServer`**: from API response; no hardcoding.

---

## 4. Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Server (Neon)                                                            │
│   tables, sessions, orders, order_items, floor_plans                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ GET /api/floor-map/view?locationId=&floorplanId=                         │
│   - getPosMerchantContext, auth, location access                         │
│   - aggregate tables, sections, floor plan, counts, current server       │
│   - return FloorMapView                                                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ useFloorMapView(locationId, floorplanId)                                 │
│   - fetch on mount, when locationId/floorplanId change                   │
│   - validate with isFloorMapView                                         │
│   - expose view, loading, error, staleError, refresh, patch              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ View model derivation (pure functions)                                   │
│   - filterTablesByMode(view.tables, filterMode, view.currentServer)      │
│   - filterTablesByStatus(...)                                            │
│   - displayTables, counts, sectionConfig from view                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ UI components                                                            │
│   MapTopBar, MapStatsBar, MapCanvas, GridView, SeatPartyModal, etc.      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Mutation Flow

```
┌──────────────────┐
│ UI action        │  e.g. "Seat party" on T5
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Optimistic patch │  patch(view => add T5 active, update counts)
│ (optional)       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ API mutation     │  POST /api/sessions/ensure
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
 success   failure
    │         │
    ▼         ▼
┌────────┐  ┌────────────┐
│refresh │  │ rollback   │
│(silent)│  │ patch      │
└────────┘  │ show error │
            └────────────┘
```

---

## 6. Loading States

| State | Condition | Next states |
|-------|-----------|-------------|
| **Initial** | Component mounted, `locationId` not yet resolved | Resolving |
| **Resolving** | Awaiting LocationContext / cookie | Skeleton, NoLocation |
| **Skeleton** | `!locationIdResolved` OR (`view === null` AND `error === null`) | Ready, Error, NoLocation |
| **NoLocation** | `locationIdResolved` AND `locationId === null` | (user selects location elsewhere) |
| **Ready** | `view !== null`, `error === null` | Stale (on silent refresh fail) |
| **Error** | `error !== null` | Skeleton (after Retry) |
| **Stale** | `view !== null` AND `staleError !== null` | Ready (after Retry) |

Transitions:

- Resolving → Skeleton (when location known, fetching view)
- Skeleton → Ready (view loaded)
- Skeleton → Error (view load failed)
- Skeleton → NoLocation (location resolved but null)
- Ready → Stale (silent refresh failed)
- Stale → Ready (Retry succeeded)
- Error → Skeleton (Retry in progress)

---

## 7. Refresh Policy

| Trigger | Behavior |
|---------|----------|
| **After mutation** | Call `refresh(true)` after successful API mutation. |
| **Manual refresh** | Optional pull-to-refresh or refresh button; calls `refresh(false)` so loading indicator can show. |
| **Polling** | Optional: `setInterval` with `refresh(true)` while tab visible (e.g. every 30s). Cooldown after patch to avoid overwriting optimistic state. |
| **Visibility** | On `visibilitychange` to visible, `refresh(true)` to catch external updates. |
| **Floor plan change** | Call `refresh` with new `floorplanId`; hook refetches with updated param. |

---

## 8. Migration Plan

### Phase 1: Loading, Error, Skeleton (small)

- Add `FloorMapPageSkeleton` (map/grid layout).
- Add `locationIdResolved` (or equivalent) to distinguish “loading” from “no location”.
- Replace spinner with skeleton until ready.
- Add `FloorMapErrorState` and `FloorMapNoLocationState`.
- Add basic error handling and retry for initial load.
- **Deliverable**: Single skeleton → content flow, no “Loading…” or empty flashes.

### Phase 2: View API and useFloorMapView (medium)

- Define `FloorMapView` type and `isFloorMapView` validator.
- Implement `GET /api/floor-map/view` route.
- Implement `useFloorMapView(locationId, floorplanId)`.
- Switch Floor Map page to use `useFloorMapView` as primary data source.
- Keep `restaurantStore` for SeatPartyModal table list until Phase 4.
- **Deliverable**: Page reads from view API; store no longer primary for Floor Map.

### Phase 3: Mutation Alignment (medium)

- Refactor seat-party flow to `mutateThenRefresh` pattern.
- Add rollback for optimistic `patch` on failure.
- Replace hardcoded `currentServer` with `view.currentServer` from API.
- **Deliverable**: Mutations use mutate → refresh; correct rollback and server identity.

### Phase 4: Consolidation (medium)

- Remove Floor Map page’s custom load that overwrites `store.setTables`.
- Simplify or remove Floor Map dependency on `restaurantStore` where possible.
- Add optional polling and visibility-based refresh.
- **Deliverable**: Clean data flow; Floor Map aligned with Table/KDS architecture.

---

## References

- `src/app/kds/page.tsx` – KDS loading and view usage
- `src/lib/hooks/useKdsView.ts` – view hook pattern
- `src/app/api/kds/view/route.ts` – view API pattern
- `src/app/table/[id]/page.tsx` – mutate-then-refresh, optimistic updates
- `docs/` – KDS and Table architecture docs where available
