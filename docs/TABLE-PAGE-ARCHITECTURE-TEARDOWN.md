# Table Page (`/table/[id]`) — A-to-Z Architecture Teardown

**Goal:** One structured reference for what was built across frontend, backend, API, state, domain, performance, caching, optimistic updates, and folder structure — to decide what becomes the standard pattern for other pages.

**Scope:** `src/app/table/[id]/page.tsx`, every API route it calls (direct or indirect), every action/domain/lib/helper/schema involved, and relevant docs/migrations/utilities.

---

## 1) Big-picture map

### Full request/response/data flow for `/table/[id]`

#### Initial page load

1. User navigates to `/table/[id]` (e.g. `/table/1` or `/table/<uuid>`).
2. Page (client component) mounts; `useEffect` keyed on `id` runs: `setTableView(null)`, then `refreshTableView()`.
3. **GET `/api/tables/[id]/pos`** is called with `fetch(endpoint, { cache: "no-store" })`.
4. POS route: auth via `getPosUserId(supabase)` (fast path: `getSession()` then `getUser()`), then `getPosMerchantContext(userId)` (cached 10 min), table lookup by UUID or `displayId`, open session, seats + orders in parallel, order items, money agg + delays in parallel, `computeOutstanding()` (pure), build `TableView`, return `posSuccess(tableView)`.
5. Client: `applyTableView(payload.data)` → `setTableView(payload.data)`.
6. `projectTableView(tableView, id)` (pure) produces `table`, `tableItems`, `waveCount`, `sessionId`, `uiMode`, etc. Optimistic overlays (seats, waves) are applied in `useMemo` to produce `projectedSeats`, `waveNumbers`, `mealProgress`. UI renders from this derived state.

#### POS read path

- **Single source of truth for read:** GET `/api/tables/[id]/pos`.
- Called on: mount/navigate (effect on `id`), retry (error bar), after **mutateThenRefresh** flows (seat party, close table), and when **no onSuccessPatch**: `refreshTableView({ silent: true })` is fired in background via `fireAndForget`.
- **No** GET caching: `cache: "no-store"` and no server-side `unstable_cache` for the POS payload. Merchant context inside the route is cached via `getPosMerchantContext` (10 min).

#### Optimistic UI mutations

- **Pattern:** `fireAndReconcile({ optimisticApply, requestFn, onSuccessPatch?, optimisticRollback })`.
- **optimisticApply:** Update local state (e.g. `patchTableView`, or `setOptimisticSeatOps` / `setOptimisticWavesAdded` / etc.) so UI updates immediately.
- **requestFn:** Call API (e.g. `fetchPos(...)`).
- **onSuccessPatch(result):** If provided, patch `tableView` with the mutation response (e.g. `data.waveNumber`, `data.addedItems`, `data.deletedWaveNumber`). No full refresh. Then `onSuccessClearOptimistic?.()`.
- **If no onSuccessPatch:** `refreshTableView({ silent: true })` is run in background via `fireAndForget`; when it resolves, optimistic state is cleared.
- **On error:** `optimisticRollback()` then show warning dialog with `withPosDevContext` message.

Flows that use **onSuccessPatch** (no refresh on success): fire wave, advance wave, mark served, void item, add wave, delete wave, add seat, delete seat, rename seat, add items (send).  
Flows that use **mutateThenRefresh** (refresh after mutation): seat party (ensure session), close table.

#### Send / fire / advance / serve / void flows

| Flow | Trigger | API | Optimistic | On success |
|------|--------|-----|------------|------------|
| **Send (add items)** | User sends draft order | POST `/api/sessions/ensure` (if no session) then POST `/api/orders` (body: sessionId, items, autoFireWave1?) | Add temp items to `tableView.items`, clear draft, exit ordering | `onSuccessPatch`: replace temp items with `addedItems`, apply `autoFiredWave` to items/waves |
| **Fire wave** | User fires a wave | POST `/api/sessions/[sid]/waves/[n]/fire` | Set items in wave to `sent`, wave status to `sent`; store rollback snapshot | `onSuccessPatch`: apply `affectedItemIds` / wave status from response |
| **Advance wave** | User advances to cooking/ready/served | POST `/api/sessions/[sid]/waves/[n]/advance` (toStatus) | Set wave items and wave status to next state; rollback snapshot | `onSuccessPatch`: apply `updatedItemIds` and `toStatus`; then fire-and-forget POST events (item_ready/served) |
| **Mark served** | User marks single item served | PUT `/api/orders/[orderId]/items/[itemId]` (status: served) | Set that item to `served`; rollback snapshot | `onSuccessPatch`: set item status to served |
| **Void item** | User voids item | DELETE `/api/orders/[orderId]/items/[itemId]` | Set item to `void`; rollback snapshot | `onSuccessPatch`: set item status to void |
| **Close table** | User closes table (with or without payment) | POST `/api/sessions/[sid]/close` (payment, options) | None | `mutateThenRefresh`: refresh then navigate to floor-map; fire-and-forget events (payment_completed) |

#### Waves / seats flows

| Flow | API | Optimistic state | On success |
|------|-----|------------------|------------|
| **Add wave** | POST `/api/sessions/[sid]/waves/next` | `optimisticWavesAdded` + select new wave | `onSuccessPatch`: append wave to `tableView.waves`, update `openSession.waveCount`, canDeleteWave |
| **Delete wave** | DELETE `/api/sessions/[sid]/waves/[n]` | `optimisticWavesDeleted` + adjust selected wave | `onSuccessPatch`: remove wave from `tableView.waves`, update waveCount/canDeleteWave |
| **Add seat** | POST `/api/sessions/[sid]/seats` | `optimisticSeatOps.added` (temp seat number) | `onSuccessPatch`: append seat to `tableView.seats` |
| **Delete seat** | DELETE `/api/sessions/[sid]/seats/[n]` | `optimisticSeatOps.deleted` | `onSuccessPatch`: remove seat from `tableView.seats` |
| **Rename seat** | PUT `/api/sessions/[sid]/seats/[n]/rename` (newSeatNumber) | `optimisticSeatOps.renamed` | `onSuccessPatch`: update seat number and item seat numbers in `tableView` |

#### Frontend-only vs backend-authoritative

- **Frontend-only (until persisted):** Draft order (`orderItems` state), selected seat/category/wave, modal open state (payment, seat party, customize, discard draft, warning), alert dismissed, kitchen delay dismissed, seat rename input, “armed” delete (wave/seat hold-to-delete), add-context pulse. Optimistic overlays (e.g. `optimisticSeatOps`, `optimisticWavesAdded`) are frontend-only until the mutation response is applied via `onSuccessPatch`.
- **Backend-authoritative:** Table metadata, session, seats, orders, order items, wave status, item status, bill, outstanding (canClose/reason), delays, actions (canSend, canAddWave, canDeleteWave, canCloseSession), uiMode, serviceStage. All of this is carried in `TableView` from GET `/api/tables/[id]/pos` or from mutation responses that are merged via `patchTableView`.

---

## 2) File inventory

### Page / UI

| Path | Purpose | Reusable |
|------|---------|----------|
| `src/app/table/[id]/page.tsx` | Table detail page: POS view, ordering, waves, seats, payments, alerts. Single ~3100-line client component. | No — page-specific; patterns inside should be extracted. |
| `src/components/table-detail/top-bar.tsx` | Header with table info and close table. | Yes. |
| `src/components/table-detail/table-visual.tsx` | Table shape and seats. | Yes. |
| `src/components/table-detail/wave-timeline.tsx` | Wave list and fire/advance. | Yes. |
| `src/components/table-detail/order-list.tsx` | Order items by seat/wave; serve/void. | Yes. |
| `src/components/table-detail/info-panel.tsx` | Side panel info. | Yes. |
| `src/components/table-detail/action-bar.tsx` | Bottom actions (send, add wave, etc.). | Yes. |
| `src/components/table-detail/payment-modal.tsx` | Payment and close. | Yes. |
| `src/components/table-detail/food-ready-alert.tsx` | Food ready banner. | Yes. |
| `src/components/table-detail/kitchen-delay-alert.tsx` | Kitchen delay banner. | Yes. |
| `src/components/table-detail/payment-toggle.tsx` | Payment UI toggle. | Yes. |
| `src/components/floor-map/seat-party-modal.tsx` | Seat party form (used by table page). | Yes. |
| Take-order components: `category-nav`, `menu-search`, `menu-item-card`, `customize-item-modal`, `order-summary` (under `take-order/`) | Inline ordering UI. | Yes. |

### API routes

| Path | Purpose | Reusable |
|------|---------|----------|
| `src/app/api/tables/[id]/pos/route.ts` | GET: single read model for table POS (table, session, seats, items, waves, bill, outstanding, delays, actions, uiMode). Auth: getPosUserId. Ctx: getPosMerchantContext. | Yes — pattern for “one GET = full view”. |
| `src/app/api/sessions/ensure/route.ts` | POST: ensure session for table; body tableUuid, locationId, guestCount. Delegates to domain ensureSessionByTableUuid. | Yes. |
| `src/app/api/sessions/[sessionId]/waves/next/route.ts` | POST: create next wave. Domain: createNextWaveForSession. | Yes. |
| `src/app/api/sessions/[sessionId]/waves/[waveNumber]/route.ts` | DELETE: remove empty wave. Domain: removeWaveForSession. | Yes. |
| `src/app/api/sessions/[sessionId]/waves/[waveNumber]/fire/route.ts` | POST: fire wave. Domain: fireWave. Idempotency. | Yes. |
| `src/app/api/sessions/[sessionId]/waves/[waveNumber]/advance/route.ts` | POST: advance wave (toStatus: preparing/ready/served). Domain: advanceWaveStatus. Idempotency. | Yes. |
| `src/app/api/sessions/[sessionId]/seats/route.ts` | POST: add seat. Domain: addSeat. | Yes. |
| `src/app/api/sessions/[sessionId]/seats/[seatNumber]/route.ts` | DELETE: remove seat. Domain: removeSeatByNumber. | Yes. |
| `src/app/api/sessions/[sessionId]/seats/[seatNumber]/rename/route.ts` | PUT: rename seat number. Domain: renameSeat. | Yes. |
| `src/app/api/orders/route.ts` | POST: create order with items; optional autoFireWave1. Domain: createOrderFromApi, then fireWave if auto. Idempotency. | Yes. |
| `src/app/api/orders/[id]/items/[itemId]/route.ts` | PUT: update item (quantity, notes, status e.g. served). DELETE: void item. Domain: serveItem, voidItem, etc. Idempotency. | Yes. |
| `src/app/api/sessions/[sessionId]/close/route.ts` | POST: close session (payment, options). Domain: closeSessionService. Idempotency. | Yes. |
| `src/app/api/sessions/[sessionId]/events/route.ts` | POST: record event (guest_seated, item_ready, served, payment_completed). Fire-and-forget from client. | Yes. |
| `src/app/api/_lib/pos-envelope.ts` | posSuccess, posFailure, requireIdempotencyKey, toErrorMessage. | Yes. |

### Actions

| Path | Purpose | Reusable |
|------|---------|----------|
| `src/app/actions/session-close-validation.ts` | canCloseSession(sessionId): DB checks for session, orders, items, payments; returns CanCloseSessionResult. Used by close route and by POS route indirectly (see computeOutstanding). | Yes. |
| `src/app/actions/orders.ts` | CloseTablePayment, CloseOrderForTableOptions types used by close route. | Yes. |
| `src/app/actions/session-events.ts` | EventSource type for events. | Yes. |
| Other actions (seat-management, orders, etc.) | Not called directly by table page; domain is used via API routes. | N/A. |

### Domain

| Path | Purpose | Reusable |
|------|---------|----------|
| `src/domain/serviceActions.ts` | fireWave, advanceWaveStatus, ensureSessionByTableUuid, createNextWaveForSession, removeWaveForSession, addSeat, removeSeatByNumber, renameSeat, createOrderFromApi, closeSessionService, serveItem, voidItem, etc. | Yes. |
| `src/domain/serviceFlow.ts` | Pure validators: canFireWave, canCloseSession, canServeItem, canModifyOrderItem, etc. No DB. | Yes. |
| `src/domain/idempotency.ts` | computeRequestHash, getIdempotentResponse, saveIdempotentResponse. Used by mutation routes. | Yes. |
| `src/domain/events.ts` | recordEventRaw, recordEventWithSource. | Yes. |
| `src/domain/index.ts` | Re-exports. | Yes. |

### Lib / helpers

| Path | Purpose | Reusable |
|------|---------|----------|
| `src/lib/pos/tableView.ts` | TableView type, isTableView guard. Single source of truth for POS view shape. | Yes. |
| `src/lib/pos/fetchPos.ts` | fetchPos (adds Idempotency-Key, X-Client-Request-Id), getPosCorrelationId, makeIdempotencyKey. | Yes. |
| `src/lib/pos/fireAndForget.ts` | fireAndForget(promise, label): catch and log in DEV. | Yes. |
| `src/lib/pos/posDebugError.ts` | DEV-only debug log for failed POS calls (label, endpoint, correlationId, payload). | Yes. |
| `src/lib/pos/posAuth.ts` | getPosUserId(supabase): getSession then getUser for read-only POS. **Do not use on mutation routes.** | Yes, read-only routes only. |
| `src/lib/pos/posMerchantContext.ts` | getPosMerchantContext(userId): cached merchant/location IDs (unstable_cache 10 min). | Yes. |
| `src/lib/pos/computeOutstanding.ts` | Pure: computeOutstanding(sessionStatus, orderRows, itemRows, moneyAgg) → canClose/reason. Used by GET /pos. | Yes. |
| `src/lib/pos/computeKitchenDelays.ts` | Pure: computeKitchenDelaysFromOrderItems(items, orderIdToStation, options) → delay list. | Yes. |
| `src/lib/pos/tableStatus.ts` | normalizeFurnitureStatus(dbStatus) → active | maintenance | disabled. | Yes. |
| `src/lib/pos/devTimer.ts` | devTimer, devTimeStart/End, devSqlLog, runExplain (DEV only). | Yes. |
| `src/lib/table-data.ts` | TableDetail, Seat, OrderItem, Wave, getReadyItems, etc. UI-facing types and helpers. | Yes. |
| `src/lib/take-order-data.ts` | MenuItem, OrderItem (draft), calculateOrderTotals, hasAllergyConflict, takeOrderData (fallback menu). | Yes. |
| `src/lib/floor-map-data.ts` | storeTablesToFloorTables, SeatPartyForm. | Yes. |
| `src/lib/hooks/useLocationMenu.ts` | Menu + categories for location. | Yes. |
| `src/lib/contexts/LocationContext.tsx` | currentLocationId. | Yes. |
| `src/store/restaurantStore.ts` | Tables, openOrderForTable, closeOrder. | Yes. |
| `src/store/types.ts` | StoreTable, StoreTableSessionState. | Yes. |

### DB schema

| Path | Purpose | Reusable |
|------|---------|----------|
| `src/lib/db/schema/orders.ts` | tables, sessions, seats, orders, orderItems, payments, etc. Enums and relations. | Yes. |
| Other schema files (merchant-locations, merchant-users, menus, etc.) | Used by POS and domain. | Yes. |

### Migrations

| Path | Purpose | Reusable |
|------|---------|----------|
| `scripts/run-migration-*.ts`, `run-uuid-migration.mjs` | One-off migration scripts (UUID, proxy, admin, etc.). Not specific to table page. | N/A. |

### Docs

| Path | Purpose |
|------|---------|
| `docs/CACHING-AUDIT.md` | Caching audit; POS/TableView and merchant context; suggests posMerchantContext cache (implemented in getPosMerchantContext). |
| `docs/TABLE-PAGE-API-MAP.md` | Action → endpoint → refresh; slightly outdated (many mutations now use onSuccessPatch instead of refresh). |
| `docs/POS-TABLE-VIEW.md` | TableView contract, envelope, furniture vs service state. |
| `docs/POS-PERFORMANCE-SUMMARY.md` | /pos explain params and performance. |
| `docs/POS-STATUS-REPORT.md` | POS flows status. |
| `docs/UI-POS-MUTATION-CALLS.md` | Table/KDS/floor-map mutation call sites. |
| `docs/ARCHITECTURE-AUDIT.md`, `docs/ARCHITECTURE-AUDIT-FULL.md` | Older architecture notes. |

---

## 3) Frontend architecture

### How `src/app/table/[id]/page.tsx` is structured

- **Single client component:** “use client”, one default-export function ~3100 lines. No route segment config; data is loaded in the client via GET /pos and mutations.

**Derived state (from server + pure functions):**

- `tableView` (useState): raw server view from GET /pos or from patch.
- `projectTableView(tableView, id)` (useMemo): produces `table`, `tableItems`, `waveCount`, `sessionId`, `uiMode`, `furnitureStatus`, `outstandingItems`, `kitchenDelays`, `seatIdByNumber`, `itemOrderIds`. This is the “projected” server state.
- `projectedSeats` = `applyOptimisticSeats(table.seats, optimisticSeatOps)` (useMemo).
- `waveNumbers`: merge of backend wave numbers with `optimisticWavesAdded` minus `optimisticWavesDeleted`, sorted, with 1 always present.
- `mealProgress`: waves + waveItemsById + waveLabelsById + nextFireableWaveNumber; uses `projectedSeats` and `tableItems` and `tableView?.waves`.
- `readyItems` = `getReadyItems(projectedSeats)`; `canBill` from projected seats + tableItems totals.

**Optimistic state:**

- `optimisticSeatOps`: { added, deleted, renamed }. Applied in `applyOptimisticSeats`.
- `optimisticWavesAdded`, `optimisticWavesDeleted`: applied when computing `waveNumbers` and in mealProgress.
- In-flight flags: `waveAddInFlight`, `waveDeleteInFlight`, `seatAddInFlight`, `seatDeleteInFlight`, `seatRenameInFlight` (Sets/booleans) to disable double submit.
- For fire/advance/serve/void: no separate optimistic state; `patchTableView` is used in optimisticApply to mutate a copy of items/waves, and `rollbackSnapshotRef` holds previous state for rollback.

**Projected/overlay state:**

- “Projected” = server `tableView` transformed by `projectTableView` and then by optimistic overlays (seats, wave list). So: `table` + `projectedSeats` + `waveNumbers` + `mealProgress` + `tableItems` (shared items) are what the UI actually reads for list/visual/timeline.

**Mutation helpers:**

- `withMutation(fn)`: increments mutationInFlightRef, runs fn, decrements. Used to block 60s refresh while a mutation is in progress.
- `applyTableView(view)`: setTableView(view).
- `patchTableView(patchFn)`: setTableView(prev => prev ? patchFn(prev) : prev).
- `refreshTableView({ silent })`: GET /pos, apply result or set error; optional loading state; guarded by refreshInFlightRef.
- `mutateThenRefresh(label, endpoint, fn)`: withMutation(fn); on success calls refreshTableView({ silent: true }); on error shows warning dialog with withPosDevContext.
- `fireAndReconcile(opts)`: optimisticApply(); requestFn(); on success: onSuccessPatch? then clear optimistic, or else refreshTableView({ silent: true }) + fireAndForget; on error: optimisticRollback() and warning dialog.

**Reconcile strategy:**

- When a mutation returns and `onSuccessPatch` is provided: patch `tableView` with the response (e.g. add/remove one wave, one seat, or update item/wave status). No refetch. Optimistic overlay for that mutation is cleared.
- When no `onSuccessPatch`: background refresh via `fireAndForget(refreshTableView({ silent: true }));` and clear optimistic when refresh completes.
- 60s interval: when session exists and not (interaction open or mutation in flight), call `refreshTableView({ silent: true })` to keep view fresh.

**Local UI state vs server-backed state:**

- **Local only:** selectedSeat, infoOpen, alertDismissed, seatPartyOpen, paymentOpen, isOrderingInline, selectedCategory, searchQuery, customizingItem, customizeDefaults, editingOrderItemId, orderItems (draft), selectedWaveNumber, summaryScope, warningDialog, discardDraftDialogOpen, armedWaveDelete, armedSeatDelete, seatRenameState, kitchenDelayDismissed, addContextPulse.
- **Server-backed (and optionally patched):** tableView → table, tableItems, waveCount, sessionId, uiMode, outstandingItems, kitchenDelays, seatIdByNumber, itemOrderIds; plus optimistic overlays for seats and waves.

**What is too page-specific vs should be reusable:**

- **Too page-specific:** One giant component; inline wave/seat/item mapping and rollback snapshots; many handlers (handleFireWave, handleAdvanceWaveStatus, handleMarkServed, handleVoidItem, handleAddWave, handleDeleteWave, handleAddSeat, handleDeleteSeat, handleRenameSeat, handleSendOrder, handleCloseTable, handleSeated, etc.) all defined in the same file; DEV-only console.time/timeEnd and queueMicrotask logging scattered in handlers.
- **Should become reusable patterns:** (1) Single read-model GET that returns a full view type (TableView). (2) fireAndReconcile + onSuccessPatch contract. (3) patchTableView-style updater for that view. (4) Pure projectTableView-style derivation from view + id. (5) Optimistic overlays (e.g. list of “pending adds”) merged in useMemo. (6) Centralized error dialog with correlation id in DEV.

---

## 4) Backend/API architecture

### GET /api/tables/[id]/pos

- **Request:** GET, no body. Optional query: `explain=1`, `explain=outstanding`, `explain=delays`, `explain=tables`, `explain=close`, `debug_indexes=1` (DEV).
- **Response:** `{ ok: true, data: TableView }` or `{ ok: false, error: { code, message } }`. Optional `meta`: explain, explainClose, indexes.
- **Optimized for patching client state:** Yes — one payload contains everything the table page needs; client can replace `tableView` or patch it with mutation responses.
- **Hot path:** Yes — every load and every silent refresh.
- **Pattern for other pages:** Good. Single GET that returns a full read model; auth fast path for read-only (getPosUserId); merchant context cached (getPosMerchantContext); pure helpers for outstanding and delays; DEV explain/debug_indexes.

### POST /api/sessions/ensure

- **Request:** tableUuid, locationId, guestCount?, eventSource?.
- **Response:** `{ ok: true, data: { sessionId, tableUuid } }`.
- **Optimized for patching:** N/A — client uses sessionId for subsequent calls and may refresh.
- **Hot path:** Yes when seating or before first send.
- **Pattern:** Good — thin route, domain does the work; idempotency key required.

### Sessions/waves/seats/orders/item mutation routes

| Route | Method | Request shape | Response shape (success) | Patch-friendly | Hot/cold |
|-------|--------|----------------|--------------------------|----------------|----------|
| waves/next | POST | eventSource? | data: { waveNumber } | Yes | Hot |
| waves/[n] | DELETE | eventSource? | data: { deletedWaveNumber? } | Yes | Cold |
| waves/[n]/fire | POST | eventSource? | data: { waveNumber, status, affectedItemIds } | Yes | Hot |
| waves/[n]/advance | POST | toStatus, eventSource? | data: { waveNumber, toStatus, updatedItemIds } | Yes | Hot |
| seats | POST | eventSource? | data: { seatId?, seatNumber? } | Yes | Hot |
| seats/[n] | DELETE | eventSource? | data: { deletedSeatNumber? } | Yes | Cold |
| seats/[n]/rename | PUT | newSeatNumber, eventSource? | data: { from?, to? } | Yes | Cold |
| orders | POST | locationId, sessionId?, items, orderType, paymentTiming, guestCount?, autoFireWave1?, eventSource? | data: order, orderId, sessionId, addedItemIds, addedItems, affectedWaveNumbers?, autoFiredWave? | Yes | Hot |
| orders/[id]/items/[itemId] | PUT | status?, quantity?, notes?, eventSource? | data: { itemId?, status? } | Yes | Hot |
| orders/[id]/items/[itemId] | DELETE | eventSource? | data: { itemId?, status? } (void) | Yes | Hot |
| sessions/[sid]/close | POST | payment?, options?, eventSource? | ok + data or error with reason/items/remaining | No (client refreshes or navigates) | Hot |

All mutation routes that the table page uses return a small, deterministic success payload that the client can use in `onSuccessPatch` to update `tableView` without refetch. Close is the exception: client does mutateThenRefresh and then navigates.

---

## 5) Domain + business logic

| Rule / behavior | Where it lives | Correct? | Should move? |
|-----------------|----------------|----------|--------------|
| **Wave: can fire only if not already fired** | domain/serviceFlow: canFireWave(order.firedAt). Used in serviceActions fireWave. | Yes. | No. |
| **Wave: advance to preparing/ready/served** | domain: advanceWaveStatus. serviceFlow: canMarkItemPreparing, canMarkItemReady; canServeItem (ready → served). | Yes. | No. |
| **Seat: add/remove/rename** | domain: addSeat, removeSeatByNumber, renameSeat. | Yes. | No. |
| **Send: create order + items; optional auto-fire wave 1** | domain: createOrderFromApi (calls addItemsToOrder, etc.). API route calls fireWave if autoFireWave1. | Yes. | No. |
| **Auto-fire wave 1** | POST /api/orders: after createOrderFromApi, if autoFireWave1 && wave 1 in affected, call fireWave(sid, { waveNumber: 1 }). | Yes. | Keep in route or domain; both are fine. |
| **Outstanding / closeability** | session-close-validation: canCloseSession (DB). lib/pos/computeOutstanding: pure version used by GET /pos with already-loaded data. | Yes. | No — two layers: full check in close route, pure recompute in POS. |
| **Close: unpaid balance, unfinished items, payment in progress, kitchen mid-fire** | domain/serviceFlow: canCloseSession(ctx). session-close-validation fills ctx from DB. computeOutstanding mirrors for POS. | Yes. | No. |
| **Delay detection** | app/actions/kitchen-delay-detection (types/options). lib/pos/computeKitchenDelays: pure from item rows. GET /pos uses pure helper. | Yes. | No. |
| **Status mapping (DB → POS)** | GET /pos: mapItemStatus (pending+voidedAt → held/sent/…), mapWaveStatus. serviceStage from uiMode + items + table.stage. | Yes. | Could move mapItemStatus/mapWaveStatus to lib/pos for reuse. |
| **UI mode (blocked / needs_seating / in_service)** | GET /pos: computeUiMode(furnitureStatus, hasSession). tableStatus: normalizeFurnitureStatus. | Yes. | No. |

---

## 6) Performance lessons

| Change | Why it mattered | Standard elsewhere? | Safe to copy? |
|--------|-----------------|---------------------|---------------|
| **Removed refresh-heavy flows** | After every mutation we no longer block UI on full GET /pos when we can patch from response. | Yes — prefer onSuccessPatch over “refresh after every mutation”. | Yes. |
| **Optimistic patching** | Immediate feedback; one round-trip for state update. | Yes. | Yes. |
| **Silent/background reconciliation** | When no onSuccessPatch, refresh in background so user can keep working. | Yes. | Yes. |
| **patchTableView / onSuccessPatch** | Avoids full refetch and re-render of entire view when only a small part changed. | Yes — mutation routes should return minimal patch payload. | Yes. |
| **Caching merchant context** | getPosMerchantContext with unstable_cache cuts repeated DB for merchant/location IDs. | Yes for read-heavy routes that need membership. | Yes. |
| **Auth fast path for read-only POS** | getPosUserId uses getSession() then getUser(); fewer auth server calls on GET /pos. | Only for read-only endpoints; never for mutations. | Yes, read-only only. |
| **Collapsing duplicate queries** | GET /pos: seats + orders in parallel; then orderItems; then money agg + delays in parallel. | Yes — batch and parallelize. | Yes. |
| **Pure compute helpers** | computeOutstanding, computeKitchenDelaysFromOrderItems run in process with no DB. | Yes — keep hot path logic pure where possible. | Yes. |
| **Index additions** | order_items (order_id, etc.); documented in POS perf docs. | Yes after measuring with explain. | Only after explain shows need. |
| **Exact-match table lookup** | UUID or displayId (exact), inArray(locationId, locationIds). | Yes. | Yes. |
| **DEV explain/timing** | explain=1, explain=outstanding, etc.; devTimer in route; console.time in page. | Yes for DEV; avoid in production. | Yes in DEV only. |

---

## 7) Reusable patterns to standardize

### Patterns to copy to other pages

1. **Read-model endpoint shape:** One GET that returns a single view type (e.g. TableView) with all data the page needs. Envelope: `{ ok, data }` / `{ ok: false, error: { code, message } }`.
2. **Optimistic mutation + patch response:** fireAndReconcile pattern: optimisticApply → requestFn → onSuccessPatch(result) to merge result into view (no refresh), or else silent refresh + clear optimistic. Mutation APIs return small, patch-friendly payloads.
3. **Hot-path API design:** Auth and membership resolved once (cached where appropriate); parallel DB where possible; pure helpers for derived values (e.g. outstanding, delays).
4. **DEV explain/timing instrumentation:** Optional query params (e.g. explain=1) and DEV-only timers/logs for route and key operations. Keep behind NODE_ENV.
5. **Route-specific caching:** Like getPosMerchantContext for POS: cache membership/context by userId (or similar) with 10 min revalidate, not the full view.
6. **Pure compute helpers for read path:** e.g. computeOutstanding, computeKitchenDelays. Same logic can back both GET and close validation without duplicating DB in the GET path.
7. **Domain wrapper usage:** Routes validate (idempotency, auth, membership) then call domain (e.g. fireWave, advanceWaveStatus); no business logic in route body.
8. **Index strategy for hot filters:** Add indexes only after EXPLAIN shows need; document in perf summary.

### Patterns NOT to copy blindly

1. **Page-specific giant component:** Do not put 3000+ lines and 50+ handlers in one page file. Extract hooks (e.g. useTableView, useTableMutations) and smaller components.
2. **Using getSession auth shortcut on mutation routes:** getPosUserId is only for read-only GET /pos. Mutation routes must use supabase.auth.getUser() (or equivalent) for authoritative auth.
3. **Over-instrumentation in production:** console.time, queueMicrotask timing, and verbose logs should be DEV-only. Strip or guard in production.
4. **Premature index work without explain data:** Don’t add indexes without profiling/EXPLAIN.
5. **Mixing pure compute into `use server` files:** Pure helpers (e.g. computeOutstanding) live in lib; server actions can call them but shouldn’t inline large pure logic.

---

## 8) Gaps / debt / risks

| Item | Severity | Recommendation |
|------|----------|----------------|
| **Auth tradeoff (getPosUserId)** | Low | Document clearly: read-only only. Mutations already use getUser(). |
| **Giant page.tsx** | Medium | Clean up soon: extract useTableView, useTableMutations, subcomponents. |
| **Old seeded delay data** | Low | If any seed data is used for delays, replace with real data or remove. |
| **TableView and table-data types** | Low | Some duplication between TableView (lib/pos) and TableDetail (lib/table-data); projectTableView maps one to the other. Consider one canonical view type or clear “API vs UI” split. |
| **Correctness: rollback snapshot** | Medium | rollbackSnapshotRef is shared across fire/advance/serve/void; rapid clicks could overwrite. Prefer per-mutation snapshots or a single “pending mutation” queue. |
| **Correctness: itemOrderIdsRef** | Low | Resolved from tableView or from ref; if tableView is stale, resolveOrderIdForItem could fail. Acceptable if we always patch before next mutation. |
| **Duplicate logic in docs** | Low | TABLE-PAGE-API-MAP says “✓ refresh” for all; update to “patch or refresh”. |

**Ranking:**

- **Ignore for now:** Old seeded delay data if unused; duplicate type names if documented.
- **Clean up soon:** Giant page (extract hooks/components); TABLE-PAGE-API-MAP refresh column.
- **Must fix before copying pattern widely:** Ensure rollback/snapshot behavior is correct under concurrent mutations; document getPosUserId as read-only.

---

## 9) Standard blueprint proposal

- **Page component shape:** One page file that composes: (1) a data hook (e.g. useTableView) that holds view state, refresh, and patch; (2) a mutations hook (e.g. useTableMutations) that exposes fireAndReconcile/mutateThenRefresh and handlers; (3) presentational components that receive view + handlers. No 3000-line single component.
- **API route style:** One GET that returns a full read model (envelope ok/data or ok/error). Mutation routes: validate (idempotency, auth, membership), call domain, return minimal patch payload (e.g. { waveNumber }, { addedItems }, { deletedSeatNumber }).
- **Action/domain/lib split:** Actions for server-only validation or DB-heavy checks (e.g. canCloseSession). Domain for all write flows and pure validators (serviceFlow). Lib for pure view computation, types, and client helpers (fetchPos, fireAndForget, posDebugError).
- **Optimistic update contract:** Optimistic apply → request → onSuccessPatch(payload) to merge payload into view, or on failure rollback and show error. In-flight flags to prevent double submit.
- **Patch response contract:** Mutation success response includes the minimal set of fields needed to patch the client view (ids, status, counts). No need to return the full view.
- **Caching rules:** Cache membership/context (e.g. by userId) with 10 min revalidate. Do not cache the full view for POS. Read-only auth can use a fast path (e.g. getSession then getUser) only on read-only routes.
- **Performance rules:** Parallelize independent DB calls; use pure helpers for derived data; add indexes only after EXPLAIN; DEV-only explain and timing.
- **When to use pure compute helpers:** When the same logic is needed in a read path and elsewhere (e.g. outstanding, delays) or when the logic is hot and must stay fast (no DB).
- **When to use authoritative server checks:** All mutations: full auth (getUser), idempotency, and domain validation. Close/sensitive flows: full canCloseSession (or equivalent) with DB.

---

## 10) Concrete rollout plan

| Page / feature | Order | Why |
|----------------|-------|-----|
| **KDS page** | 1 | Same POS concepts (waves, items, fire, advance, serve); can reuse TableView-like read model, fireAndReconcile, and mutation API patterns. |
| **Floor map** | 2 | Uses table list and session state; can adopt same read-model pattern (e.g. one GET for floor state) and consistent mutation envelope. |
| **Orders list / order detail** | 3 | Order-centric view; can use same “one GET = full view” and patch-friendly mutation responses. |
| **Reservations** | 4 | Different domain but same blueprint: read model GET, thin mutation routes, domain in service layer. |
| **Payments / billing** | 5 | Depends on session/order state; align with same auth, idempotency, and envelope. |

For each rollout step: (1) Define a single read-model type and GET endpoint. (2) Add mutation routes that return patch-sized payloads. (3) Use fireAndReconcile + onSuccessPatch (or mutateThenRefresh where a full refresh is required). (4) Extract hooks and small components instead of one giant page. (5) Reuse getPosMerchantContext (or equivalent) and pure helpers where applicable.
