# Reservations Server-Read Architecture Audit

**Goal:** Determine whether Reservations should be the next page to convert to the server-read pattern (as used by `/table/[id]`, `/floor-map`, `/kds`, `/counter`), and define the right architecture.

**Status:** Phase 1 + Phase 2 implemented — server-read view, layout fetch, clean refresh path, reduced hydration.

---

## Phase 1 Implementation Summary

**Completed:** Shared server-read view model, layout fetch, and initial data flow.

1. **Files created:** `reservationsView.ts`, `buildReservationsView.ts`, `getReservationsView.ts`, `reservationsDataContext.tsx`, `GET /api/reservations/view`
2. **Layout:** Async server layout calls `getReservationsView()`, passes `initialReservationsView` to shell
3. **Shell:** `ReservationsDataProvider` wraps content; uses initial for first paint, syncs to store, then store for reactivity
4. **Mutations:** Unchanged; `useRestaurantMutations` still refetches into store; context/children read from store after sync

**Phase 2 (clean refresh, reduce hydration):**
1. `refreshReservationsView(locationId)` fetches GET /api/reservations/view and updates store
2. `useRestaurantMutations` uses `refreshReservationsView` for post-mutation refresh (single API call for both reservations + waitlist)
3. `useReservationsData` exposes `refresh(silent?)` for manual refresh
4. `useRestaurantHydration` no longer fetches reservations/waitlist — only tables and floor plan; reservations data comes solely from layout + view API

---

## A. Exact Files Inspected

### Routes & pages
| Path | Type | Notes |
|------|------|-------|
| `src/app/(ops)/reservations/layout.tsx` | Server | Wraps children in `ReservationsShellLayout` |
| `src/app/(ops)/reservations/page.tsx` | Server | Redirects to `/reservations/list` |
| `src/app/(ops)/reservations/list/page.tsx` | Server | Renders `<ListView />` |
| `src/app/(ops)/reservations/timeline/page.tsx` | Server | Renders `<TimelineView />` |
| `src/app/(ops)/reservations/overview/page.tsx` | Client | Uses `useReservationsFromStore`, `getHeroStats` |
| `src/app/(ops)/reservations/waitlist/page.tsx` | Server | Renders `<WaitlistView />` |
| `src/app/(ops)/reservations/new/page.tsx` | Server | Redirects to `list?action=new` |
| `src/app/(ops)/reservations/edit/page.tsx` | Server | Redirects to `list?action=edit&id=res_001` (hardcoded mock ID) |

### Components
| Path | Notes |
|------|-------|
| `src/components/reservations/reservations-shell-layout.tsx` | Client layout: nav, modals, `useReservationsFromStore`, `getReservationById`, `guestDatabase`, `capacitySlots`, `restaurantConfig` |
| `src/components/reservations/list-view.tsx` | Client: `useReservationsFromStore` |
| `src/components/reservations/timeline-view.tsx` | Client: `useReservationsFromStore`, `restaurantConfig` |
| `src/components/reservations/waitlist-view.tsx` | Client: `useReservationsFromStore`, `useRestaurantMutations` |
| `src/components/reservations/upcoming-reservations.tsx` | Client: `useReservationsFromStore`, `restaurantConfig` |
| `src/components/reservations/waitlist-panel.tsx` | Client: `useReservationsFromStore` |
| `src/components/reservations/top-bar.tsx`, `floorplan-top-bar.tsx`, `timeline-top-bar.tsx` | Use `restaurantConfig` |
| `src/components/reservations/capacity-bar.tsx`, `timeline-capacity-strip.tsx` | Use `capacitySlots`, `restaurantConfig` |
| `src/components/reservations/pace-strip.tsx` | Uses `paceMetrics` |
| `src/components/reservations/turn-tracker.tsx` | Uses `occupiedTables` |
| `src/components/reservations/reservation-form-view.tsx` | Uses `guestDatabase`, `restaurantConfig` |

### Data & hooks
| Path | Notes |
|------|-------|
| `src/lib/reservations-data.ts` | `useReservationsFromStore()`, static mocks: `reservations`, `waitlistParties`, `capacitySlots`, `occupiedTables`, `paceMetrics`, `restaurantConfig` |
| `src/lib/detail-modal-data.ts` | `getReservationById`, `getReservationByStatus`, static: `sarahChen`, `completedBase`, `noShowBase`, `cancelledBase`, `overviewReservations` |
| `src/lib/reservation-form-data.ts` | `guestDatabase` (mock guest search), uses `restaurantConfig` |
| `src/lib/listview-data.ts` | Transforms for list view |
| `src/lib/timeline-data.ts` | Transforms for timeline, uses `capacitySlots`, `restaurantConfig` |
| `src/lib/waitlist-data.ts` | Waitlist utilities |

### Store & hydration
| Path | Notes |
|------|-------|
| `src/store/restaurantStore.ts` | Zustand: `reservations`, `waitlist`, `setReservations`, `setWaitlist` |
| `src/lib/hooks/useRestaurantHydration.ts` | Client: `useEffect` → `getReservationsForLocation`, `getWaitlistForLocation` (server actions) → `setReservations`, `setWaitlist` |
| `src/components/restaurant-hydration-runner.tsx` | Wraps `useRestaurantHydration` |

### API routes
| Path | Notes |
|------|-------|
| `src/app/api/reservations/route.ts` | GET list, POST create |
| `src/app/api/reservations/[id]/route.ts` | GET one, PUT update, DELETE delete |

### Server actions
| Path | Notes |
|------|-------|
| `src/app/actions/reservations.ts` | `getReservationsForLocation`, `createReservation`, `updateReservation` (real DB) |
| `src/app/actions/waitlist.ts` | `getWaitlistForLocation`, `addToWaitlist`, `removeFromWaitlist`, etc. (real DB) |
| `src/domain/reservation-mutations.ts` | DB mutations |

### Reference (fixed pages)
| Path | Notes |
|------|-------|
| `src/app/(ops)/table/[id]/page.tsx` | Server → `getTableView` → `TableDetailClient(initialTableView)` |
| `src/app/(ops)/floor-map/page.tsx` | Server → `getFloorMapView` → `FloorMapClient(initialFloorMapView)` |
| `src/app/(ops)/kds/page.tsx` | Server → `getKdsView` → `KdsClient(initialKdsView)` |
| `src/app/(ops)/counter/page.tsx` | Server → `getCounterView` → `CounterClient(initialCounterView)` |
| `docs/OPS_SERVER_READ_PATTERN.md` | Pattern doc |

---

## B. Current Reservations Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Ops Layout (with OpsProviders)                                              │
│  └── RestaurantHydrationRunner (useRestaurantHydration)                      │
│        └── useEffect when currentLocationId set                              │
│              └── getReservationsForLocation + getWaitlistForLocation         │
│                    (server actions, real DB)                                 │
│              └── setReservations / setWaitlist → restaurantStore             │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Reservations layout                                                         │
│  └── ReservationsShellLayout (client)                                        │
│        └── useReservationsFromStore() → { reservations, waitlistParties }    │
│        └── getReservationById(id, reservations) for detail modal             │
│        └── Static: capacitySlots, restaurantConfig, guestDatabase            │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
          ┌─────────────────────────────┼─────────────────────────────┐
          ▼                             ▼                             ▼
   ListView                   TimelineView                   WaitlistView
   useReservationsFromStore   useReservationsFromStore        useReservationsFromStore
```

- **Initial load:** Page renders with empty store → shell/placeholders → `RestaurantHydrationRunner` runs after mount → fetch → store update → re-render with data.
- **Route prefetch:** Next.js can prefetch links, but no reservations data is warmed. Only shell layout.
- **Detail modal:** `getReservationById(id, reservations)` — if id is in static mocks (res_001, etc.) returns mock; else looks up in `reservations` and builds `DetailReservation` via `buildDetailFromOverview`.
- **Form prefill:** `guestDatabase.find(...)` for guest lookup; `restaurantConfig` for service periods.

---

## C. Mock vs Real

| Data | Source | Real or Mock |
|------|--------|--------------|
| **reservations list** | `restaurantStore.reservations` | **Real** — from `getReservationsForLocation` (Neon) |
| **waitlist** | `restaurantStore.waitlist` | **Real** — from `getWaitlistForLocation` (Neon) |
| **detail modal (by ID)** | `getReservationById` | Mixed: static for res_001/completed/no_show/cancelled; otherwise built from store |
| **detail modal (by status)** | `getReservationByStatus` | **Mock** — returns sarahChen/completedBase/etc. |
| **capacitySlots** | `lib/reservations-data.ts` | **Mock** — static 30-min occupancy array |
| **occupiedTables** | `lib/reservations-data.ts` | **Mock** — static turn tracker data |
| **paceMetrics** | `lib/reservations-data.ts` | **Mock** — revenue, covers, turn times |
| **restaurantConfig** | `lib/reservations-data.ts` | **Mock** — Bella Vista, zones, service periods, currentTime/currentDate |
| **guestDatabase** | `lib/reservation-form-data.ts` | **Mock** — guest search / prefill |
| **edit redirect** | `edit/page.tsx` | **Mock** — hardcoded `id=res_001` |

---

## D. Should Reservations Be Next?

**Yes.** Reservations is a strong candidate:

1. **Client-fetch-after-mount:** Data comes from `RestaurantHydrationRunner` → `useEffect` → server actions. No server helper for initial render.
2. **Same pattern as pre-migration table/floor-map:** Shell first, then fetch, then render. Exactly what OPS_SERVER_READ_PATTERN describes.
3. **Real backend exists:** `getReservationsForLocation`, `getWaitlistForLocation`, and mutation actions are already in place and used.
4. **Multi-view but single data source:** List, timeline, overview, waitlist all use the same store. One server helper can feed all views.
5. **High ops value:** Reservations is central to front-of-house; faster first paint matters.
6. **Complication:** Reservations uses a **shared layout** (`ReservationsShellLayout`) that wraps multiple child routes (list, timeline, overview, waitlist). The fixed pages (table, floor-map, KDS, counter) each have a single page calling one helper. With Reservations, either:
   - each route calls its own server helper (e.g. `getReservationsListView`), or
   - the layout fetches once and passes data to children. Layouts can be async Server Components, so a server layout could call a helper and pass data down.

---

## E. Proposed Architecture

### Server helper(s)

```
getReservationsView(locationId, options?: { date?, servicePeriodId?, lens? })
  → { reservations, waitlist, restaurantConfig?, capacitySnapshot? } | error
```

- Reuse `getReservationsForLocation` + `getWaitlistForLocation` (or a shared `buildReservationsView`) inside the helper.
- Add auth/access via `verifyLocationAccess` (as in existing actions).

### Shared build logic

- Introduce `buildReservationsView(locationId, filters)` used by:
  - `getReservationsView` (RSC)
  - `GET /api/reservations/view` (client refresh/fallback)

- `restaurantConfig` should eventually come from location/merchant settings. For first pass, keep static config server-side or derive from location.

### Page / layout split

**Option A: Layout fetches (recommended)**  
- Convert `ReservationsLayout` to an async Server Component.
- Call `getReservationsView(locationId)` in layout.
- Pass `initialReservationsView` into `ReservationsShellLayout` (client).
- Child routes (list, timeline, overview, waitlist) receive data via props/context from the client shell; no per-route fetch.

**Option B: Each route fetches**  
- Each page (list, timeline, overview, waitlist) is a Server Component that calls `getReservationsView` with lens-specific filters.
- Pass `initialReservationsView` to the view client.
- More flexible per-lens filtering but more duplication.

**Recommendation:** Option A. One fetch in layout; all lenses share the same snapshot. Filters (date, service period) can be client-state that triggers refresh.

### Refresh / revalidation

- **Initial:** Server render includes full reservations + waitlist.
- **After mutations:** Use existing `useRestaurantMutations`; after create/update/delete/seat, call `router.refresh()` or a `refreshReservations` that re-fetches from `GET /api/reservations/view`.
- **Polling (optional):** Similar to KDS, poll when tab visible; cooldown after mutations.
- **Visibility:** Refresh on `visibilitychange` when returning to tab.

### Mutation model

- Keep current model: server actions + `useRestaurantMutations`.
- After mutation, either:
  - `router.refresh()` to re-run server layout, or
  - Client calls `GET /api/reservations/view` and updates local state (e.g. via a `useReservationsView` hook that accepts `initialView` and supports `refresh`).

### Client components after hydration

- **Remain client-side:**
  - Modal open/close, form state
  - Optimistic updates
  - Sort/filter state (e.g. waitlist sort, timeline service period)
  - Polling / visibility-based refresh
  - Elapsed-wait timer (waitlist)

### Performance pitfalls

1. **Layout blocking:** If layout fetches reservations for every child navigation, ensure it’s cached/revalidated appropriately. Prefer `force-dynamic` or short revalidation for ops.
2. **Large payload:** 200-reservation limit exists; keep it. Consider lens-specific filters to shrink payload (e.g. timeline might want date-range).
3. **Detail modal:** Still uses `getReservationById`; store/DB may not have full `DetailReservation` fields. Either extend the view or keep building from list + separate detail fetch when needed.
4. **restaurantConfig:** Currently static. Moving to server may require a config fetch; can be parallel with reservations or deferred.

---

## F. Expected UX / Product Benefit

- **Faster first meaningful paint:** Real reservations and waitlist in initial HTML instead of shell → fetch → render.
- **Better prefetch:** Navigating to `/reservations/list` can stream server-rendered content as soon as layout data is ready.
- **Consistency:** Same architecture as table, floor-map, KDS, counter — easier to maintain and extend.
- **Perceived reliability:** Less reliance on client hydration and store timing; data is part of the page.

---

## G. Implementation Size and Risk

| Factor | Estimate |
|--------|----------|
| **Size** | Medium–Large. Layout change, new server helper, API route, and client hook updates. Several views to receive `initialView`. |
| **Complexity** | Medium. Shared layout + multi-view complicates data flow vs single-page helpers. |
| **Risk** | Low–Medium. Existing server actions are stable. Main risk: layout-as-data-source and ensuring all lenses receive correct initial data. |
| **Phased approach** | 1) Add `getReservationsView` + `buildReservationsView` + `GET /api/reservations/view`. 2) Make layout async, fetch in layout, pass to shell. 3) Update `ReservationsShellLayout` and children to use `initialReservationsView` when present and skip store wait. 4) Add `useReservationsView` (or equivalent) with `initialView` + `refresh`; deprecate store-based flow for reservations. |
