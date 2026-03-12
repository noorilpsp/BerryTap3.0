# Floor Map Performance Diagnosis

## A. Files inspected

| File | Role |
|------|------|
| `src/app/(ops)/floor-map/page.tsx` | Server page; calls `getFloorMapView()` during RSC |
| `src/lib/floor-map/getFloorMapView.ts` | Server helper; auth + merchant context + buildFloorMapView |
| `src/lib/floor-map/buildFloorMapView.ts` | Shared core; floor plans, tables, enrichment, transform |
| `src/lib/hooks/useFloorMapView.ts` | Old client hook; `fetch(/api/floor-map/view)` on mount |
| `src/app/api/floor-map/view/route.ts` | API route; uses same `buildFloorMapView` logic |
| `src/app/actions/floor-plans.ts` | `getFloorPlansForLocation`, `getActiveFloorPlan`, `getConvertedTablesForFloorPlan`; all call `verifyLocationAccess` |
| `src/app/actions/tables.ts` | `getTablesForFloorPlan`, `getComputedStatusesForTables`; `verifyLocationAccess` |
| `src/lib/location-access.ts` | `verifyLocationAccess`: auth + merchantLocations + merchantUsers |
| `src/lib/pos/posMerchantContext.ts` | `getPosMerchantContext` (uses `unstable_cache`) |
| `src/app/actions/location.ts` | `getCurrentLocationId` (cookie read) |

---

## B. Old floor-map execution path

**Flow:** Client mount → skeleton UI → `useEffect` → `fetch(/api/floor-map/view?locationId=...)` → API runs logic → client renders data

1. Client mounts; user sees skeleton immediately
2. `useEffect` fires; async `fetch` to `/api/floor-map/view`
3. API route: reads `locationId` from query, runs auth + `buildFloorMapView`
4. Response streams back; client replaces skeleton with floor map

**Perceived latency:** User sees content as soon as API responds. Time to First Paint (skeleton) is fast; Time to Interactive (map) = network RTT + API work.

---

## C. New server execution path

**Flow:** Request → RSC → `getFloorMapView()` (sync on server) → buildFloorMapView → HTML sent → hydrate

1. Request hits server; RSC runs `getFloorMapView(floorplanId)`
2. `getCurrentLocationId()` — cookie read (async `cookies()`)
3. `supabaseServer()` + `getPosUserId()` — auth
4. `getPosMerchantContext(userId)` — merchantUsers + merchantLocations (cached via `unstable_cache`)
5. `buildFloorMapView(locationId, userId, floorplanId)` — see query chain below
6. Response HTML includes full floor map
7. Client hydrates

**Perceived latency:** User sees nothing until all server work is done. Time to First Paint = full server render time.

---

## D. Query list and order

### In `getFloorMapView`
1. `getCurrentLocationId()` — `cookies()` (no DB)
2. `supabaseServer()` — Supabase client
3. `getPosUserId()` — `supabase.auth.getUser()`
4. `getPosMerchantContext(userId)` — `merchantUsers` + `merchantLocations` (cached)

### In `buildFloorMapView`

**Phase 1 (parallel):**
- `getFloorPlansForLocation(locationId)` → `verifyLocationAccess` + `floorPlans.findMany`
- `getActiveFloorPlan(locationId)` → `verifyLocationAccess` + `floorPlans.findFirst` (isActive)

**Phase 2 (sequential):**
- `getTablesForFloorPlan(locationId, floorPlanId)` → `verifyLocationAccess` + `[tables.findMany, getComputedStatusesForTables]` in parallel
- If `storeTables.length === 0`: `getConvertedTablesForFloorPlan` → `verifyLocationAccess` + floor plan + tables

**Phase 3:**
- `getTableLiveEnrichment(locationId, floorPlanId)` (sequential internally):
  - tables query
  - openSessions query
  - orders + staff in parallel
  - orderItems query
  - JS mapping + result loop

**Phase 4:**
- `getCurrentServerForUser(locationId, userId)` — staff.findFirst + sessions join tables

### Redundant auth / access work

Each `verifyLocationAccess(locationId)` does:
- `supabaseServer()` + `supabase.auth.getUser()`
- `merchantLocations.findFirst`
- `merchantUsers.findFirst`

Called from:
- `getFloorPlansForLocation` (1×)
- `getActiveFloorPlan` (1×)
- `getTablesForFloorPlan` (1×)
- `getConvertedTablesForFloorPlan` (0–1×, if no tables)

So **3–4 full auth/access checks** run inside `buildFloorMapView`, even though `getFloorMapView` already validated auth and location. Each check = 3 async steps (auth + 2 DB queries).

---

## E. Measured timing breakdown

Timers were added in `getFloorMapView.ts` and `buildFloorMapView.ts` (only in `NODE_ENV !== "production"`).

**How to measure:**
1. Run `npm run dev`
2. Open `/floor-map` in a browser with an authenticated user and location cookie
3. Inspect the server console (terminal running `npm run dev`)

**Timer labels:**
- `[getFloorMapView]` — getCurrentLocationId, auth, merchant context, buildFloorMapView, total
- `[buildFloorMapView]` — floorplan lookup, tables fetch, table enrichment, transform, getCurrentServerForUser, total
- `[buildFloorMapView]   enrichment:*` — tables, openSessions, orders+staff, orderItems, JS mapping, result loop

**Sample from unauthenticated request (curl, no cookies):** `getCurrentLocationId`: ~68ms (cookies() is async). Auth and build steps did not run.

To get full timings, load `/floor-map` in a logged-in browser and note the console output.

---

## F. Top 3 slowest operations (by analysis)

1. **Repeated `verifyLocationAccess` (3–4 calls × ~30–100ms each)**  
   Each call: `getUser()` + `merchantLocations` + `merchantUsers`. Overlaps with `getPosMerchantContext` and `getPosUserId`, adding ~90–400ms.

2. **`getTableLiveEnrichment` (sequential DB chain)**  
   Five sequential DB rounds: tables → openSessions → (orders + staff parallel) → orderItems. No batching across phases. Likely ~100–300ms depending on data size.

3. **`getCurrentServerForUser`**  
   Staff lookup + sessions join. Runs at the end, adds latency before final view assembly.

---

## G. Why the migration caused slowdown

### 1. Waterfall instead of overlap

**Old (client):** The page shell and skeleton rendered quickly. API work ran in the background while the user already saw the UI. Perceived latency = max(shell render, API + network), and shell is fast.

**New (server):** The server must complete all work before sending HTML. No shell or skeleton is sent first, so the user waits for the full waterfall.

### 2. Prefetch pulls work earlier

Next.js prefetches routes on hover/focus. The server work for `/floor-map` may start on prefetch, but:
- Prefetch still runs the full `getFloorMapView` → `buildFloorMapView` chain
- If the user navigates quickly, they can hit an already-started server render
- If not, they wait for the full sequence

Prefetch does not hide the cost; it can start it earlier, but the user often still waits for a long render.

### 3. Server vs API request context

Both server page and API route use the same `buildFloorMapView` logic, but:
- API: runs in a dedicated request handler; can be measured via response time
- Server RSC: blocks the initial document. Any delay extends Time to First Byte and First Contentful Paint

### 4. Redundant auth/access

The server path already validates auth and location in `getFloorMapView`. `buildFloorMapView` calls actions that each run `verifyLocationAccess`. That repeats auth and merchant checks 3–4 times per request, adding latency.

---

## Optimization applied (auth/access deduplication)

Redundant `verifyLocationAccess` calls in the floor-map hot path have been removed.

**Changes:**
- Added trusted variants: `getFloorPlansForLocationTrusted`, `getActiveFloorPlanTrusted`, `getTablesForFloorPlanTrusted`, `getConvertedTablesForFloorPlanTrusted`.
- `buildFloorMapView` now uses these Trusted variants (callers already validate access).
- Original actions keep verification; other callers (useRestaurantHydration, floorplan-storage-db) unchanged.

**Removed:** 3–4 repeated `verifyLocationAccess` calls inside `buildFloorMapView` (each did auth + merchantLocations + merchantUsers).

---

## Next steps (when ready)

1. Run the app, load `/floor-map` in a logged-in session, and record the actual timer output.
2. Parallelize or batch parts of `getTableLiveEnrichment` if still slow.
3. Consider streaming or partial rendering (e.g. shell first, then floor map data) to improve perceived performance.
