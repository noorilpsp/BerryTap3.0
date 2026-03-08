# KDS Implementation Plan

**Source:** `docs/KDS-ARCHITECTURE-PLAN.md`  
**Purpose:** Concrete file-by-file build plan for KDS. No implementation code yet.

---

## 1. Build order

Implement in this order:

1. **Types / view contract**
   - Add `src/lib/kds/kdsView.ts`: `KdsView` type, `KdsOrder`, `KdsOrderItem`, `KdsStation`, `KdsDelay`, `KdsActions` (or minimal per-item action flags), and `isKdsView` guard.
   - Ensures all later work uses a single contract.

2. **Pure helpers**
   - Add `src/lib/kds/computeKdsActions.ts`: from orderItems + domain validators → per-item or aggregate actions (canMarkPreparing, canMarkReady, canMarkServed). Used by GET route only; no DB.
   - Reuse `src/lib/pos/computeKitchenDelays.ts` as-is; no new delay helper.
   - Optional: `src/lib/kds/groupItemsByStation.ts` (or inline in hook) to group orderItems by station for UI. Defer to “UI wiring” if we keep grouping in the hook.

3. **GET route**
   - Add `src/app/api/kds/view/route.ts`: GET handler, auth via getPosUserId, getPosMerchantContext, load location + orders + orderItems, compute delays + actions, return `posSuccess(KdsView)`. Add DEV timing/explain behind query param.
   - Depends on step 1 and 2.

4. **View hook**
   - Add `src/lib/hooks/useKdsView.ts`: state (kdsView), refresh(silent?), patch(fn), fetch on mount/locationId, derived (e.g. itemsByStation, selectedStation filter). Exposes view, loading, error, refresh, patch, derived data.
   - Depends on step 1 and 3 (calls GET /api/kds/view).

5. **Mutation hook**
   - Add `src/lib/hooks/useKdsMutations.ts`: fireAndReconcile, mutateThenRefresh, handlers (handleMarkPreparing, handleMarkReady, handleMarkServed, handleVoidItem). Takes patch, refresh, and orderId lookup (from view or ref). Per-mutation snapshot or single queue for rollback. In-flight Set for item ids. Uses fetchPos.
   - Depends on step 4 (needs patch/refresh from view hook).

6. **UI wiring**
   - Refactor `src/app/kds/page.tsx`: thin shell, useKdsView(locationId), useKdsMutations(view), pass view + handlers to existing KDS components (KDSHeader, StationSwitcher, KDSColumns/KDSColumn, KDSTicket, toasts). Remove mock data and large local state; keep only UI state (e.g. viewMode, activeStationId, toasts visibility) in page or in hooks as agreed.
   - Optionally add a small presentational wrapper (e.g. `KdsViewContent`) that takes view + handlers and composes columns/lanes. Depends on step 4 and 5.

7. **Mutation integration**
   - Wire handlers in useKdsMutations to existing PUT/DELETE routes; ensure request body and response patch match (see section 7). Add onSuccessPatch logic to update KdsView from each response. If any route does not return a patch payload, extend it (see section 3).
   - Depends on step 5 and on “Files to update” for item route.

8. **DEV instrumentation**
   - In GET route: optional `?explain=1` (and optionally `?station=...` for future server filter), devTimer for auth, context, queries, total. In mutation hook: optional single place for request duration (DEV only). No per-handler timing.
   - Can be done alongside step 3 and 5.

---

## 2. Files to create

| Path | Purpose | Exports | Page-specific? |
|------|---------|--------|----------------|
| `src/lib/kds/kdsView.ts` | KDS view contract and guard | `KdsView`, `KdsOrder`, `KdsOrderItem`, `KdsStation`, `KdsDelay`, `KdsActions` (or equivalent), `isKdsView(x)` | Reusable (KDS and any consumer of GET /api/kds/view) |
| `src/lib/kds/computeKdsActions.ts` | Pure: orderItems → action flags per item (or aggregate) using domain validators | `computeKdsActions(orderItems): KdsActions` (or per-item map) | Reusable (GET route, tests) |
| `src/app/api/kds/view/route.ts` | GET /api/kds/view?locationId=... | GET handler; no named exports | Reusable (any client that needs KdsView) |
| `src/lib/hooks/useKdsView.ts` | View state, refresh, patch, derived data for KDS | `useKdsView(locationId: string \| null)` → { view, loading, error, refresh, patch, itemsByStation?, readyItems?, ... } | KDS page (could be reused by another KDS-style screen) |
| `src/lib/hooks/useKdsMutations.ts` | Mutation handlers and fireAndReconcile for KDS | `useKdsMutations(options: { patch, refresh, getOrderIdForItem? })` → { handleMarkPreparing, handleMarkReady, handleMarkServed, handleVoidItem, ... } | KDS page |
| `src/app/kds/page.tsx` | Thin page shell: location, useKdsView, useKdsMutations, render presentational components | Default export page component | KDS page only |

Optional (only if we extract grouping):

| Path | Purpose | Exports | Page-specific? |
|------|---------|--------|----------------|
| `src/lib/kds/groupItemsByStation.ts` | Pure: orderItems + stations → Record<stationId, items[]> | `groupItemsByStation(orderItems, stations)` | Reusable |

We do **not** create new presentational components in the first slice; we reuse KDSHeader, KDSColumns, KDSColumn, KDSTicket, etc., and only change how they receive data (from hook instead of local state).

---

## 3. Files to update

| Path | What to change | Why |
|------|----------------|-----|
| `src/app/api/orders/[id]/items/[itemId]/route.ts` | On success for `status === "preparing"` and `status === "ready"`: save idempotent response with body `{ itemId, status }`, then `return posSuccess({ itemId, status }, { correlationId })`. Today only `status === "served"` returns a patch; KDS needs the same for preparing and ready so onSuccessPatch can update the view. | Patch-friendly response for all status transitions. |
| `src/app/kds/page.tsx` | Remove mock data (e.g. initialOrders, simulateNewOrder, large inline state). Use useKdsView(currentLocationId) and useKdsMutations({ patch, refresh, getOrderIdForItem }). Pass view (or derived itemsByStation/readyItems) and handlers into existing KDS components. Keep only minimal UI state (viewMode, activeStationId, toasts, message panel) either in page or in view hook as decided. Remove or refactor any logic that duplicated GET (e.g. fetch from /api/kds/orders) in favor of GET /api/kds/view. | Align with blueprint: thin shell, data from view hook, mutations from mutation hook. |
| `src/app/kds/page.tsx` (location) | Ensure location is from LocationContext (or equivalent) and passed to useKdsView. If the page currently uses getCurrentLocationId or similar, keep one place that resolves locationId and pass it into the hook. | Single source of location for the read model. |

No changes to domain/serviceActions or domain/serviceFlow for the first slice; they already expose markItemPreparing, markItemReady, serveItem, voidItem and the validators. No changes to pos-envelope, fetchPos, computeKitchenDelays, posMerchantContext, posAuth.

---

## 4. KdsView contract

Minimal recommended shape for implementation:

- **`location`** — `{ id: string; name?: string }`
- **`orders`** — `Array<{ id: string; orderNumber: string; orderType: string; status: string; station: string | null; wave: number; firedAt: string | null; sessionId: string | null; tableId: string | null; tableNumber: string | null; customerName: string | null; createdAt: string }>`
- **`orderItems`** — `Array<{ id: string; orderId: string; itemName: string; quantity: number; notes: string | null; status: "pending" | "preparing" | "ready" | "served"; sentToKitchenAt: string | null; startedAt: string | null; readyAt: string | null; voidedAt: string | null; stationOverride: string | null; seatNumber: number | null }>`
- **`stations`** — `Array<{ id: string; name: string; displayOrder?: number }>`
- **`delays`** — `Array<{ orderItemId: string; minutesLate: number; station: string | null }>`
- **`actions`** — Either (a) per-item: `Record<itemId, { canMarkPreparing: boolean; canMarkReady: boolean; canMarkServed: boolean }>` or (b) aggregate: `{ canMarkPreparing: boolean; canMarkReady: boolean; canMarkServed: boolean }` for the whole view. Recommendation for first slice: **per-item** so the UI can enable/disable buttons per ticket item.

Omit fields we don’t need for the first slice (e.g. bill, outstanding). Keep timestamps as ISO strings for JSON. Add `isKdsView(x: unknown): x is KdsView` that checks required keys and types.

---

## 5. GET route implementation plan

- **Auth:** Call `getPosUserId(supabase)` (from `src/lib/pos/posAuth.ts`). If !ok return 401. Use only for this GET route; do not use in any mutation.
- **Merchant/location validation:** Call `getPosMerchantContext(authResult.userId)` (from `src/lib/pos/posMerchantContext.ts`). Require `locationIds.length > 0`. Read `locationId` from query: `request.nextUrl.searchParams.get("locationId")`. If missing return 400. If `locationId` not in `locationIds` return 403.
- **Load location:** Single query: merchantLocations by id, columns id, name (or equivalent). If not found or wrong merchant, return 404.
- **Load orders:** Query orders where locationId = X and status in (`pending`, `preparing`, `ready`). Columns: id, orderNumber, orderType, status, station, wave, firedAt, sessionId, createdAt; with session.tableId, table.tableNumber, customer.name (or equivalent). Order by firedAt desc, createdAt desc.
- **Load order items:** One query: orderItems where orderId in (order ids from previous step), voidedAt is null. Columns: id, orderId, itemName, quantity, notes, status, sentToKitchenAt, startedAt, readyAt, voidedAt, stationOverride, seat. Order by createdAt asc.
- **Parallelization:** After auth and context: (1) fetch location; (2) fetch orders (depends on locationId); (3) fetch orderItems (depends on order ids). So: location and orders can be parallel if we have locationId; then orderItems. Alternatively: location first, then (orders + nothing) in one step, then orderItems. Keep it to two DB round-trips: (location + orders in parallel with one query that joins or two queries), then orderItems by orderIds.
- **Stations:** From orders/items: collect distinct station ids (order.station, item.stationOverride); build list `{ id, name, displayOrder }` (name can be id for now, or from a small config map). No extra DB in first slice.
- **Delays:** Call `computeKitchenDelaysFromOrderItems(orderItemsRows, orderIdToStationMap, { warningMinutes: 10 })` from `src/lib/pos/computeKitchenDelays.ts`. orderIdToStationMap from orders (order.id → order.station). Result → `KdsView.delays`.
- **Actions:** Call `computeKdsActions(orderItems)` from `src/lib/kds/computeKdsActions.ts` (implement using canMarkItemPreparing, canMarkItemReady, canServeItem from domain/serviceFlow per item). Result → `KdsView.actions`.
- **Response:** Build object matching KdsView; run `isKdsView(built)`. Return `posSuccess(built)`. No caching of response.
- **DEV:** If `explain=1` (and DEV), run EXPLAIN on the heaviest query (e.g. orderItems), put in `meta.explain`. Use `devTimer` for auth, context, location, orders, orderItems, delays, actions, total. All behind NODE_ENV !== "production".

---

## 6. Hook plan

- **useKdsView responsibilities:** (1) Hold raw view state (KdsView | null). (2) Fetch from GET /api/kds/view?locationId=... on mount and when locationId changes; set loading/error. (3) Expose refresh(silent?: boolean): re-fetch and set view (or only update state without loading indicator if silent). (4) Expose patch(updater: (prev: KdsView) => KdsView): set state with updater. (5) Compute derived data: e.g. itemsByStation = group orderItems by station (order.station or item.stationOverride); readyItems = orderItems.filter(i => i.status === "ready"). (6) Accept optional selectedStationId; filter derived data to that station if provided. Expose: view, loading, error, refresh, patch, itemsByStation (or items filtered by station), readyItems, and optionally selectedStationId/setSelectedStationId if we keep station filter in the hook.
- **useKdsMutations responsibilities:** (1) Accept options: { patch, refresh, getOrderIdForItem } (getOrderIdForItem: itemId → orderId, from view.orderItems or a ref). (2) Implement fireAndReconcile (optimisticApply, requestFn, onSuccessPatch, optimisticRollback). (3) For each action (mark preparing, mark ready, mark served, void): build request (PUT or DELETE), call fetchPos, on success call onSuccessPatch with response data to patch the one item (or run silent refresh if no patch). (4) Rollback: per-mutation snapshot (e.g. copy the one item before optimistic update; on error restore that item in the view via patch). (5) In-flight: Set<itemId> or Set<string> for “mutation in progress” to disable double submit. Expose: handleMarkPreparing(itemId), handleMarkReady(itemId), handleMarkServed(itemId), handleVoidItem(itemId) (and optionally handleFireWave if we add it later).
- **State ownership:** View state (kdsView, loading, error) and derived state (itemsByStation, readyItems) live in useKdsView. In-flight set and any mutation queue/snapshot live in useKdsMutations. Station filter (selectedStationId) can live in useKdsView or in page; recommendation: page holds selectedStationId and passes it to useKdsView so the hook can return filtered derived data, or the hook holds it and exposes setSelectedStationId.
- **What remains in page.tsx:** (1) Resolve locationId (e.g. from LocationContext). (2) Call useKdsView(locationId) and useKdsMutations({ patch, refresh, getOrderIdForItem }). (3) Local UI state: viewMode, activeStationId (if not in hook), toasts, message panel open state. (4) Render: KDSHeader, station switcher, KDSColumns/KDSColumn with view and handlers, toasts, delay alert if delays.length > 0. No business logic; no fetch; no mock data.

---

## 7. Mutation integration plan

| KDS action | Route to call | Request | Response patch | onSuccessPatch behavior |
|------------|----------------|---------|----------------|-------------------------|
| Mark preparing | PUT /api/orders/[id]/items/[itemId] | Body: `{ status: "preparing", eventSource: "kds" }`. id = orderId from getOrderIdForItem(itemId). | After update: `{ itemId, status: "preparing" }`. If route doesn’t return it yet, add it (see section 3). | patch(view => ({ ...view, orderItems: view.orderItems.map(i => i.id === itemId ? { ...i, status: "preparing", startedAt: now or response.startedAt } : i) })). Recompute actions/delays in next GET or via a small local recompute if we expose it. |
| Mark ready | PUT /api/orders/[id]/items/[itemId] | Body: `{ status: "ready", eventSource: "kds" }`. | `{ itemId, status: "ready" }`. Add in route if missing. | patch(view => ({ ...view, orderItems: view.orderItems.map(i => i.id === itemId ? { ...i, status: "ready", readyAt: response.readyAt or now } : i) })). |
| Mark served | PUT /api/orders/[id]/items/[itemId] | Body: `{ status: "served", eventSource: "kds" }`. | `{ itemId, status: "served" }` (already returned). | patch(view => ({ ...view, orderItems: view.orderItems.map(i => i.id === itemId ? { ...i, status: "served" } : i) })). |
| Void item | DELETE /api/orders/[id]/items/[itemId] | Body: `{ reason?: string, eventSource: "kds" }` (or reason in header if API expects it). id = orderId. | `{ itemId, voidedAt: string }` — do **not** use status "served" for void. | patch(view => ({ ...view, orderItems: view.orderItems.map(i => i.id === itemId ? { ...i, voidedAt: response.voidedAt ?? new Date().toISOString() } : i) })) or remove item from list; product decision. Simplest: set status to "served" and voidedAt so it drops out of “active” display. |

All requests: use fetchPos (adds Idempotency-Key). Parse response as `{ ok, data }`; if ok, call onSuccessPatch(data). On error, run optimisticRollback (restore snapshot for that item) and show error (e.g. warning dialog or toast).

---

## 8. Reuse map

- **Reuse unchanged:** `src/app/api/_lib/pos-envelope.ts`, `src/lib/pos/fetchPos.ts`, `src/lib/pos/fireAndForget.ts`, `src/lib/pos/posDebugError.ts`, `src/lib/pos/posMerchantContext.ts`, `src/lib/pos/posAuth.ts`, `src/lib/pos/computeKitchenDelays.ts`, `src/domain/serviceFlow.ts` (canMarkItemPreparing, canMarkItemReady, canServeItem, canVoidItem), `src/domain/serviceActions.ts` (markItemPreparing, markItemReady, serveItem, voidItem), `src/domain/idempotency.ts`, existing PUT/DELETE `src/app/api/orders/[id]/items/[itemId]/route.ts` (except for the small response fix in section 3).
- **Extend:** `src/app/api/orders/[id]/items/[itemId]/route.ts`: add success response and idempotent save for status "preparing" and "ready" so they return `{ itemId, status }` like "served". No change to domain.
- **Do not touch:** `src/domain/serviceActions.ts` and `src/domain/serviceFlow.ts` for the first slice (no new exports). Other API routes (sessions, waves) not used in first slice. Table page and floor map.

---

## 9. Risks / decision points

- **Actions in KdsView vs pure helpers only:** Decision: include `actions` in KdsView, computed in the GET route via a pure helper (computeKdsActions). So the view is self-contained and the client doesn’t need to re-run validators. If we later want to recompute actions after a patch without refetch, we can add a small client-side helper that runs the same rules on patched orderItems.
- **Station filter: client-only or server-filtered:** Decision for first slice: **client-only**. GET returns all orderItems for the location; useKdsView or the page filters by selectedStationId. Optional query param `station=` can be added later for a “single-station” view if we want to reduce payload size.
- **KDS can fire waves or only update item status:** Decision for first slice: **only item status** (preparing, ready, served, void). Do not implement “fire wave” from KDS in the first slice. Add later if product requires it.
- **Void display:** When an item is voided, do we remove it from orderItems in the view or set voidedAt and filter in UI? Decision: patch the item to status "served" and voidedAt set (or a dedicated "void" status if we add it) and filter out voided items in derived data (e.g. itemsByStation only includes non-void). So the view can keep the item for audit or we remove from a copy; minimal approach is patch in place and let UI filter by !voidedAt.
- **getOrderIdForItem:** View has orderItems[].orderId; so for any itemId we can find orderId from view.orderItems. The mutation hook can receive getOrderIdForItem: (itemId) => view.orderItems.find(i => i.id === itemId)?.orderId ?? null and refuse to call the route if null. No extra ref if we pass view (or orderItems) into the mutation hook.
- **Existing KDS components:** They may expect a different shape (e.g. Order with items nested). We have two options: (1) adapt the components to accept KdsView + orderItems (and derived itemsByStation) and handlers; (2) build a thin adapter in the page that maps KdsView to the existing component props. Prefer (1) so we don’t maintain two shapes; if the existing components are tightly coupled to the current order shape, add a small mapper (KdsView → legacy order list) in the page or in a dedicated file until we refactor the components.

---

## 10. First implementation slice

**Scope:** Smallest useful KDS that follows the blueprint.

- **GET /api/kds/view** — Implement full. Returns KdsView (location, orders, orderItems, stations, delays, actions). Auth: getPosUserId. Context: getPosMerchantContext. One location + orders + orderItems flow; delays via computeKitchenDelays; actions via computeKdsActions.
- **Render active items by station** — Page uses useKdsView; derive itemsByStation (or equivalent) in the hook; pass to KDSColumns/KDSColumn (or PreparingLanes). Show orders and their items; group or filter by station (client-side). No fancy grouping: e.g. one column per station or one list with station labels.
- **Mark ready / Mark served** — useKdsMutations exposes handleMarkReady and handleMarkServed. Wire to PUT /api/orders/[id]/items/[itemId] with status ready/served. Optimistic update + onSuccessPatch. Per-item rollback on error.
- **Omit for first slice:** Mark preparing (can add right after), void item (add next), fire wave, server-side station filter, explain=1 (can add with GET), toasts for new orders (keep existing behavior or simplify), delay alert (can add once delays are in the view). Optional: “mark preparing” in the first slice if the route is already fixed; otherwise second slice.

**Deliverables for first slice:** (1) KdsView type and isKdsView. (2) computeKdsActions. (3) GET /api/kds/view. (4) useKdsView and useKdsMutations. (5) page.tsx refactored to use them and show items by station with mark ready / mark served. (6) PUT route updated to return { itemId, status } for preparing and ready. No new presentational components; reuse and wire existing ones.
