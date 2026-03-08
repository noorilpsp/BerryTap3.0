# KDS (Kitchen Display System) — Architecture Plan

**Source:** `docs/TABLE-PAGE-BLUEPRINT-DECISIONS.md`  
**Purpose:** Apply the table-page blueprint to the future KDS screen. Architecture plan only; no implementation yet.

---

## 1. KDS page purpose

The KDS page is the kitchen’s primary view for managing active orders and item flow. It should show:

- **Active orders** — Orders in a kitchen-relevant state (e.g. pending, preparing, ready), for the selected location, with enough context (order number, table, type, customer) for kitchen staff.
- **Items by station** — Order items grouped or filterable by station (e.g. grill, expo, drinks) so each station sees its own queue. Station may come from order-level `station` or item-level override.
- **Item status progression** — Each item moves through: **sent** (pending in kitchen) → **preparing** (started) → **ready** (done) → **served** (picked up). KDS drives “preparing” and “ready”; “served” may be driven from KDS or from the table page.
- **Delays** — Items that have been sent to kitchen but not yet ready, beyond a threshold (e.g. 10 minutes), with optional station and minutes-late for alerts.
- **Filtering by station** — Client-side or server-side filter so the view can show “this station only” or “all stations.” Filter choice is UI state; the read model can return all items (or a single-station slice) depending on design.
- **Batching or grouping** — Orders can be grouped by wave, by order, or by station. Typical: list orders, each with its items; optionally group items by status (e.g. preparing column, ready column). Batching/grouping is a presentation concern; the read model returns flat or minimally structured data and the client or a pure helper groups it.

---

## 2. Read-model GET route

**Route path:** `GET /api/kds/view` (or `GET /api/kds/[locationId]/view` if we want location in the path).

- **Recommendation:** `GET /api/kds/view?locationId=<uuid>`. Location is required and scopes all data; optional query params: `station=<id>` to restrict to one station (server-side filter), `explain=1` (DEV) for diagnostics.
- **Response:** Same envelope as the blueprint: `{ ok: true, data: KdsView }` or `{ ok: false, error: { code, message } }`. Optional `meta` in DEV (e.g. explain, timing).
- **Envelope shape:** Use `posSuccess(KdsView)` / `posFailure(...)` from `src/app/api/_lib/pos-envelope.ts`. No caching of the response body; client uses `cache: "no-store"` (or equivalent) when fetching.

**Why “one GET = one read model”:** The KDS screen needs one place to load everything it shows (orders, items, stations, delays, actions). One GET that returns a single `KdsView` gives predictable loading, a single type to patch from mutations, and avoids multiple round-trips or ad-hoc aggregation on the client. This matches the blueprint’s “one GET = one full read model” rule.

**Data included in KdsView (high level):** See section 3. In short: location id and display info; list of active orders; list of order items (with order id, status, timestamps, station); list of stations (id, name, optional metadata); delays (item id, minutes late, station); and an `actions` object describing what the kitchen can do (e.g. canMarkPreparing, canMarkReady, canMarkServed per item or aggregate). All derived values (delays, “ready” counts, etc.) are computed in the route via pure helpers from the same fetch, not with extra GETs.

---

## 3. KDS view type

Proposed TypeScript shape (conceptual; no code yet):

- **`location`** — `{ id: string; name?: string }`. From DB (merchantLocations). Used for header and context.
- **`orders`** — Array of `{ id, orderNumber, orderType, status, station, wave, firedAt, sessionId?, tableId?, tableNumber?, customerName?, createdAt }`. From DB (orders + optional session/table/customer). Only orders in “active” kitchen statuses (e.g. pending, preparing, ready).
- **`orderItems`** — Array of `{ id, orderId, itemName, quantity, notes, status, sentToKitchenAt, startedAt, readyAt, voidedAt, stationOverride?, seatNumber? }`. From DB (orderItems). Only items that are not voided and belong to the returned orders. Status values align with item lifecycle: pending → preparing → ready → served; voidedAt set implies “void.”
- **`stations`** — Array of `{ id: string; name: string; displayOrder?: number }`. From config or DB (e.g. distinct stations from orders/items for the location). Used for filtering and grouping.
- **`delays`** — Array of `{ orderItemId: string; minutesLate: number; station: string | null }`. **Computed** by a pure helper (reuse or wrap `computeKitchenDelaysFromOrderItems` from `src/lib/pos/computeKitchenDelays.ts`) from the same orderItems and order→station mapping. Not from DB directly.
- **`actions`** — Object describing what the UI can do: e.g. per-item flags or aggregate “can mark preparing / ready / served” derived from item status. **Computed** from orderItems using domain/serviceFlow rules (e.g. canMarkItemPreparing, canMarkItemReady, canServeItem). No extra DB.

**What comes from DB:** `location`, `orders`, `orderItems`. Optionally the list of `stations` if stored; otherwise derived from orders/items. **What is computed via pure helpers:** `delays` (from orderItems + timestamps + threshold), `actions` (from orderItems + domain validators). The route fetches orders and orderItems once (with parallelization where possible), then runs pure helpers to fill delays and actions so the GET remains a single read model with no N+1 or extra round-trips.

---

## 4. Pure compute helpers

- **`computeKitchenDelays`** — **Reuse** `computeKitchenDelaysFromOrderItems` from `src/lib/pos/computeKitchenDelays.ts`. Input: order items (with sentToKitchenAt, readyAt, voidedAt, stationOverride), orderId→station map, options (e.g. warningMinutes). Output: list of `{ orderItemId, minutesLate, station }`. Used by GET /api/kds/view. No DB; pure.

- **`computeStationQueues`** (optional) — If we want server-side grouping by station: input orders + orderItems + stations; output items grouped by station (e.g. `Record<stationId, OrderItem[]>`). Can live in `src/lib/kds/` (e.g. `computeStationQueues.ts`). Alternatively, the GET returns flat orderItems and the client or view hook groups by station; then no server-side queue helper is needed. **Recommendation:** Start with flat orderItems in KdsView; add a small pure helper in `src/lib/kds/` only if we want server-side grouping (e.g. for a future “station view” param).

- **`computeReadyItems`** (optional) — Subset of orderItems where status === "ready". Trivial filter; can live in the view hook or in `src/lib/kds/computeReadyItems.ts` if we want a single place. Not required for the GET; the GET can return all items and the client filters. **Recommendation:** Omit from GET; view hook or UI computes “ready” list from `orderItems`.

- **Prep timers** — If we need “elapsed since sent” or “elapsed since started” for display, compute in the client from `sentToKitchenAt` / `startedAt` and current time, or add a small pure helper in `src/lib/kds/` that takes items + `now` and returns elapsed seconds. No DB. **Recommendation:** Keep timer display in the client (or in the view hook) from existing item timestamps; add a lib helper only if multiple places need the same logic.

**Where helpers live:** Reuse `src/lib/pos/computeKitchenDelays.ts` for delays. Any KDS-specific pure helpers (e.g. station grouping, prep timers) live under `src/lib/kds/` (e.g. `src/lib/kds/computeStationQueues.ts`, `src/lib/kds/computePrepTimers.ts`) so the boundary is clear and the GET route stays thin.

---

## 5. Mutation routes

KDS will use **existing** mutation routes where possible; they already follow the blueprint (Idempotency-Key, patch-sized response, domain delegation).

- **Mark item preparing** — **PUT** `/api/orders/[id]/items/[itemId]` with body `{ status: "preparing", eventSource: "kds" }`. Domain: `markItemPreparing` (or equivalent in `@/domain`). Response patch: `{ itemId, status: "preparing" }` (and optionally `startedAt` if returned). Client patches the single item’s status (and startedAt) in KdsView.

- **Mark item ready** — **PUT** `/api/orders/[id]/items/[itemId]` with body `{ status: "ready", eventSource: "kds" }`. Domain: `markItemReady`. Response patch: `{ itemId, status: "ready" }` (and optionally `readyAt`). Client patches the item in KdsView; optionally fire-and-forget POST to sessions/events for `item_ready` if not done inside the domain.

- **Mark item served** — **PUT** `/api/orders/[id]/items/[itemId]` with body `{ status: "served", eventSource: "kds" }`. Domain: `serveItem`. Response patch: `{ itemId, status: "served" }`. Client patches the item.

- **Void item** — **DELETE** `/api/orders/[id]/items/[itemId]` with body/header and eventSource. Domain: `voidItem`. Response patch: `{ itemId, status: "void" }` (or equivalent). Client patches the item to void or removes it from the visible list per product choice.

- **Fire wave** — If KDS can trigger “fire wave” (e.g. expo fires the wave): **POST** `/api/sessions/[sessionId]/waves/[waveNumber]/fire` with `eventSource: "kds"`. Domain: `fireWave`. Response patch: `{ waveNumber, status, affectedItemIds }`. Client patches those items to “sent” and wave to “sent.” If KDS never fires waves, omit this.

**Requirements for all:** Idempotency-Key required (client uses `fetchPos` from `src/lib/pos/fetchPos.ts`). Routes use `getUser()` for auth (never read-only fast path). Response is minimal patch payload only. Domain functions live in `@/domain` (e.g. `markItemPreparing`, `markItemReady`, `serveItem`, `voidItem`, `fireWave`); route validates then calls domain.

**New route only if needed:** If the existing PUT/DELETE under `src/app/api/orders/[id]/items/[itemId]/route.ts` already supports status transitions and returns a patch-shaped body, KDS only needs to call them. If not, extend those routes or add a small KDS-specific route that delegates to the same domain; avoid duplicating domain logic.

---

## 6. Client architecture

- **Page shell** — Thin client component at `src/app/kds/page.tsx`. Responsibilities: read location (e.g. from LocationContext or route param); compose `useKdsView(locationId)` and `useKdsMutations(viewHook)`; render presentational components (header, station filter, columns/lanes, toasts) and pass view data + mutation handlers. No business logic, no long handlers, no mock data in the page. Target: page file on the order of a few hundred lines or less.

- **`useKdsView` hook** — Owns: raw view state (e.g. `kdsView`), `refresh(silent?)`, `patch(fn)`, and derived state (e.g. items grouped by station, filtered by selected station, ready list). Fetches from GET `/api/kds/view?locationId=...` on mount and when locationId changes; uses `patch` when mutations return. Exposes: `view`, `loading`, `error`, `refresh`, derived data (e.g. `itemsByStation`, `readyItems`), and optionally `patch` if the mutation hook needs it. Pure projection (e.g. grouping, filtering) lives inside the hook or in small lib helpers called by the hook.

- **`useKdsMutations` hook** — Owns: `fireAndReconcile`, `mutateThenRefresh`, and all handlers (e.g. handleMarkPreparing, handleMarkReady, handleMarkServed, handleVoidItem). Takes from the view hook: `patch`, `refresh`, and any refs needed (e.g. orderId by itemId). Exposes only handlers. In-flight flags (e.g. per itemId or per action type) live here to prevent double submit. Uses `fetchPos` for all mutations; on success, calls `onSuccessPatch` with the route’s response to patch the view, or falls back to silent refresh if no patch is possible. No shared rollback ref; use per-mutation snapshot or a single mutation queue if rollback is required.

- **Presentational components** — Existing or new: e.g. KDSHeader, StationSwitcher, KDSColumns/KDSColumn, KDSTicket, PreparingLanes, toasts, delay alerts. They receive view data and handlers as props; they do not fetch or hold view state. Responsibility: display and user input only.

---

## 7. Optimistic update strategy

- **Apply optimistic update first** — For mark preparing / ready / served / void: update the view immediately (e.g. set item status to the target state) so the UI reflects the action without waiting for the server. Use the view hook’s `patch` in the mutation hook’s `optimisticApply`.

- **Patch view from response on success** — When the mutation returns, use the response payload (e.g. `{ itemId, status }`) in `onSuccessPatch` to update the view: find the item by id and set its status (and timestamps if returned). No full refetch. This matches the blueprint’s “patch when the mutation response contains everything needed.”

- **Rollback on error** — On mutation failure, revert the optimistic change. Use a **per-mutation** snapshot (e.g. snapshot the one item or the minimal slice before applying) or a **single mutation queue** so only one mutation runs at a time and rollback is unambiguous. Do **not** copy the table page’s single shared `rollbackSnapshotRef` used by multiple mutation types.

- **Fallback silent refresh** — If a mutation does not return a patch-friendly payload (e.g. legacy or third-party), run `refresh({ silent: true })` in the background and clear any optimistic state when refresh completes. Prefer fixing the route to return a patch payload so KDS can rely on onSuccessPatch.

- **No full-page refresh on success** — For status transitions and void, we do not call “mutateThenRefresh” unless the flow changes the whole world (e.g. navigate away). Normal item updates are patch-only.

---

## 8. Performance considerations

- **Parallel queries** — In GET `/api/kds/view`: fetch location, then orders for the location (with active statuses), then order items for those orders. Run independent work in parallel (e.g. after orders are loaded, fetch orderItems in one query by orderIds; then run pure helpers for delays and actions). Same idea as GET `/api/tables/[id]/pos`: minimize round-trips and parallelize where possible.

- **Pure compute helpers** — Delays and actions are computed from already-fetched orders/orderItems in the route. No extra DB for “delays” or “can mark ready”; use `computeKitchenDelaysFromOrderItems` and domain validators (or small wrappers) in process.

- **No full-view caching** — Do not cache the KdsView response. Client uses `cache: "no-store"` (or equivalent). Blueprint: cache membership/context, not the read model.

- **Membership/context caching** — The GET route should use the same pattern as the table POS route: resolve user → merchant/location IDs via `getPosMerchantContext(userId)` (e.g. from `src/lib/pos/posMerchantContext.ts`) so membership is cached (~10 min). Then ensure locationId is in the allowed set before returning data.

- **Read-only auth fast path** — For GET `/api/kds/view` only, auth can use the same fast path as GET `/pos` (e.g. `getPosUserId` from `src/lib/pos/posAuth.ts`) if we document that this GET is read-only. Mutation routes must **not** use it; they use `getUser()`.

- **DEV explain tools** — Optional query param `explain=1` (or similar) on GET `/api/kds/view` to return timing or EXPLAIN data in `meta`. Use `devTimer` (e.g. from `src/lib/pos/devTimer.ts`) in the route in DEV only. Do not add production logging or timing.

- **Indexes** — Add indexes only after measuring (e.g. EXPLAIN) shows a bottleneck (e.g. on orders.locationId + status, or orderItems.orderId). Document in a perf doc. Do not optimize early.

---

## 9. Reuse from table page

Reuse the following from the existing table/POS implementation:

- **Envelope and HTTP** — `src/app/api/_lib/pos-envelope.ts`: `posSuccess`, `posFailure`, `requireIdempotencyKey`, `toErrorMessage`. Use for all KDS GET and mutation responses.
- **Client fetch** — `src/lib/pos/fetchPos.ts`: `fetchPos` (adds Idempotency-Key, X-Client-Request-Id), `getPosCorrelationId`, `makeIdempotencyKey`. Use for all KDS mutations.
- **Fire-and-forget** — `src/lib/pos/fireAndForget.ts`: for non-blocking calls (e.g. session events after mark ready). Use when we do not need to block the UI.
- **Debug** — `src/lib/pos/posDebugError.ts`: DEV-only error logging with correlation id. Use in the view hook or mutation hook when a request fails.
- **Domain** — `src/domain/serviceActions.ts` (or equivalent): `markItemPreparing`, `markItemReady`, `serveItem`, `voidItem`, `fireWave`, `advanceWaveStatus` (if KDS advances wave). Domain is called from API routes, not from the client directly.
- **Domain validators** — `src/domain/serviceFlow.ts`: `canMarkItemPreparing`, `canMarkItemReady`, `canServeItem`, `canVoidItem`. Use in the GET route to compute `actions` from orderItems (pure).
- **Delays** — `src/lib/pos/computeKitchenDelays.ts`: `computeKitchenDelaysFromOrderItems`. Use in GET `/api/kds/view` to build `KdsView.delays`.
- **Context cache** — `src/lib/pos/posMerchantContext.ts`: `getPosMerchantContext(userId)`. Use in GET `/api/kds/view` to resolve and cache membership.
- **Idempotency** — `src/domain/idempotency.ts`: `computeRequestHash`, `getIdempotentResponse`, `saveIdempotentResponse`. Already used by the existing orders/items and sessions mutation routes that KDS will call; no change needed if those routes already use them.
- **Auth (read-only GET)** — `src/lib/pos/posAuth.ts`: `getPosUserId(supabase)` for GET `/api/kds/view` only. Do not use in any mutation route.
- **DEV timing** — `src/lib/pos/devTimer.ts`: `devTimer`, `devTimeStart`, `devTimeEnd` (and optionally `runExplain`) in the GET route in DEV only.

Existing **presentational** KDS components (e.g. KDSColumn, KDSTicket, toasts) can be kept and wired to the new view and mutation hooks; they should receive data and handlers as props and not own view state.

---

## 10. What should NOT be copied from the table page

We will **not** copy:

- **The giant page component** — The table page is a single ~3100-line component with dozens of handlers and all state in one file. The KDS page will be a thin shell that composes `useKdsView` and `useKdsMutations` and presentational components. Handlers and state live in the hooks, not in the page file.
- **Shared `rollbackSnapshotRef` pattern** — The table page uses one ref for rollback across fire/advance/serve/void, which can be overwritten by concurrent actions. KDS will use either per-mutation snapshots (e.g. snapshot only the affected item before optimistic update) or a single mutation queue so that only one mutation runs at a time and rollback is well-defined.
- **Page-specific optimistic overlays** — The exact shapes (optimisticSeatOps, optimisticWavesAdded/Deleted) are table-domain specific. KDS will use the same *pattern* (optimistic apply → request → onSuccessPatch or silent refresh) but with KDS-specific state only where needed (e.g. in-flight set for item ids), and will avoid copying the table’s overlay structures.
- **Handler-level DEV timing** — We will not scatter `console.time`/`console.timeEnd` or `queueMicrotask` inside each handler. Any timing will be centralized (e.g. in the mutation hook’s `fireAndReconcile` or in the GET route via `devTimer`), and only in DEV.

**Cleaner hook-based structure:** The view hook owns the single source of truth for the screen (KdsView), refresh, and patch. The mutation hook owns all actions and uses the view hook’s patch and refresh. The page only composes them and passes data and handlers to the UI. This keeps the page small, makes the view and mutation logic testable and reusable, and avoids the table page’s monolith and shared rollback ref.
