# KDS First Slice — Architecture Review

**Purpose:** Audit the implemented KDS first slice against `docs/KDS-ARCHITECTURE-PLAN.md` and `docs/KDS-IMPLEMENTATION-PLAN.md`. Identify cleanup/refactor items before adding more features. No implementation code; review and decisions only.

---

## 1. What was implemented correctly

Comparison of current code to the plans:

| Area | Plan | Current implementation | Match |
|------|------|------------------------|-------|
| **KdsView contract** | location, orders, orderItems, stations, delays, actions; per-item actions; isKdsView guard | `src/lib/kds/kdsView.ts`: all six top-level fields; `KdsOrder`, `KdsOrderItem`, `KdsStation`, `KdsDelay`, `KdsItemActions`, `KdsActions`; `isKdsView(x)` with required keys | Yes |
| **GET /api/kds/view** | Auth getPosUserId; getPosMerchantContext; locationId required; load location, orders (active statuses), orderItems (non-void); build stations from data; delays via computeKitchenDelaysFromOrderItems; actions via computeKdsActions; posSuccess(KdsView); no full-view caching; DEV devTimer | `src/app/api/kds/view/route.ts`: same auth/context/locationId; location then orders then orderItems; stations from distinct order.station + item.stationOverride; delays and actions from pure helpers; isKdsView before return; devTimer with [kds] prefix | Yes |
| **useKdsView** | Hold view state; fetch GET on mount/locationId; refresh(silent?); patch(updater); derived itemsByStation (and optionally readyItems); expose view, loading, error, refresh, patch, derived | `src/lib/hooks/useKdsView.ts`: view, loading, error, refresh, patch; fetch with cache "no-store"; itemsByStation and orderIdToStation from groupItemsByStation; no readyItems exported | Yes (readyItems omitted but not required for first slice) |
| **useKdsMutations** | Accept patch, refresh, view/lookup; handleMarkReady, handleMarkServed; fetchPos; onSuccessPatch; toast + refresh on failure | `src/lib/hooks/useKdsMutations.ts`: options { patch, refresh, view }; handleMarkReady(orderId), handleMarkServed(orderId); fetchPos PUT; patch item + actions on success; toast.error + refresh(true) on any failure | Yes |
| **Thin page shell** | Resolve locationId; useKdsView(locationId); useKdsMutations; render presentational components; no business logic, no fetch, no mock data | `src/app/kds/page.tsx`: locationId via getCurrentLocationId; useKdsView + useKdsMutations; handleAction delegates to hook; still holds many UI state vars and adapter | Partially (see Section 5) |
| **Patch-based ready/served** | PUT returns { itemId, status }; client patches that item (and actions) in view; no full refetch on success | useKdsMutations patches orderItems and actions[itemId] from response; no optimistic apply; refresh only on failure | Yes |

**Summary:** KdsView contract, GET route, useKdsView, useKdsMutations, and patch-based ready/served behavior match the intended architecture. The page composes the hooks and uses an adapter for legacy components but still carries a lot of UI state and some dead code.

---

## 2. Architecture drift / deviations

- **useKdsMutations API:** Plan assumed `getOrderIdForItem(itemId)` and handlers by **itemId** (e.g. handleMarkReady(itemId)). Implemented API is **orderId**-based: handleMarkReady(orderId) / handleMarkServed(orderId), and the hook finds items for that order and status internally. This is a deliberate simplification for the first slice (KDSColumns passes orderId + newStatus). No drift if we document that the first-slice API is order-level; if we add per-item buttons later, we may want itemId-based handlers or a thin wrapper.

- **No optimistic updates:** Architecture plan (Section 7) describes “apply optimistic update first” and “rollback on error.” First slice does **not** implement optimistic apply or rollback: it patches only on success and refreshes on failure. Plan’s “First implementation slice” (Implementation Plan §10) says “Optimistic update + onSuccessPatch. Per-item rollback on error” but the delivered slice is “patch on success only.” This is an intentional simplification; adding mark preparing / void is the right time to introduce optimistic + rollback if desired.

- **No fireAndReconcile / mutateThenRefresh:** Implementation plan (§2, §6) mentions fireAndReconcile and mutateThenRefresh in useKdsMutations. Current hook has no such helpers; it inlines the request → patch / toast+refresh flow. Acceptable for first slice; when we add more mutations or rollback, we can extract a small fireAndReconcile.

- **Station filter in page, not hook:** Plan leaves open whether selectedStationId lives in page or useKdsView. Current code keeps activeStationId in the page and filters orders (filteredOrders, allDayOrders) in the page from adapted `orders`. useKdsView exposes itemsByStation but the page does not use it for the main columns—it uses kdsViewToOrders(view) then filters by activeStationId. So station filtering is page-local and applied to the adapted Order[] shape. No architectural violation; the only cost is that itemsByStation from the hook is underused.

- **Adapter in page:** Plan (§9) prefers adapting components to KdsView or a “small mapper (KdsView → legacy order list) in the page or in a dedicated file.” We have kdsViewToOrders in the page. That’s aligned; the adapter is in one place. Heaviness is in the legacy Order/OrderItem types and the number of derived useMemos (filteredOrders, allDayOrders, orderCounts, etc.) that stay in the page.

---

## 3. Type and shape review

**`src/lib/kds/kdsView.ts`**

- **Verdict:** Contract is clean and minimal enough to keep. Matches Implementation Plan §4.
- **location:** `{ id: string; name?: string }` — correct.
- **orders:** Has id, orderNumber, orderType, status, station, wave, firedAt, sessionId, tableId, tableNumber, customerName, createdAt. All needed for display and for building orderIdToStation. No bloat.
- **orderItems:** id, orderId, itemName, quantity, notes, status, sentToKitchenAt, startedAt, readyAt, voidedAt, stationOverride, seatNumber. Matches plan. seatNumber is number | null (maps from DB seat); fine.
- **stations:** id, name, displayOrder? — fine.
- **delays:** orderItemId, minutesLate, station — matches computeKitchenDelays output.
- **actions:** Record<string, KdsItemActions> with canMarkPreparing, canMarkReady, canMarkServed — per-item as recommended.
- **isKdsView:** Checks presence and types of location, orders, orderItems, stations, delays, actions. Does not deep-check array element shapes; acceptable for runtime guard.

**Adapter in `src/app/kds/page.tsx`**

- **kdsViewToOrders:** Maps KdsView to legacy Order[] (nested items, order status derived from item statuses, stationStatuses from single station). Logic is localized and clear. Order/OrderItem types are legacy UI types (variant, customizations, stationId, etc.); they belong to the presentational layer, not to KdsView.
- **Recommendation:** Keep KdsView as-is. When refactoring presentational components to consume KdsView or a slimmer DTO, we can move or replace kdsViewToOrders (e.g. to `src/lib/kds/kdsViewToOrders.ts` or into a component that accepts KdsView). No change required before the next feature slice.

**Unused types in page**

- **KdsOrderResponse** and **mapKdsOrderToOrder** in `src/app/kds/page.tsx` (lines ~127–171) are dead code: the page uses GET /api/kds/view and kdsViewToOrders only. They should be removed as cleanup.

---

## 4. Mutation review

**useKdsMutations (`src/lib/hooks/useKdsMutations.ts`)**

- **Ready/served patching:** Correct and minimal. For each item to update, it calls PUT, then on success patches that item’s `status` and that item’s entry in `actions` (canMarkPreparing, canMarkReady, canMarkServed derived from the new status). No extra fields patched; no full view replace.
- **Actions patch:** After a successful status change, the hook sets `actions[itemId]` to the three booleans implied by the new status (e.g. status "ready" → canMarkServed: true). This keeps the actions object in sync without recomputing from orderItems. Alternative would be to recompute actions from patched orderItems via computeKdsActions (or a client-safe equivalent). Current approach is simpler and avoids importing domain or a client-side actions helper; it’s consistent because the only transitions we support are preparing→ready and ready→served, so the new flags are deterministic. **Recommendation:** Keep manual actions patch for now. When we add void or mark preparing, consider either (a) continuing to patch actions in the hook for known transitions, or (b) introducing a small client-side `recomputeActionsForItem(orderItems, itemId)` that runs the same rules as computeKdsActions for one item, to avoid drift. No change required before next slice.

- **No in-flight guard:** Plan (§6) mentions an in-flight Set for item ids to prevent double submit. Current code does not disable buttons while a request is in progress. Acceptable for first slice; add when we introduce optimistic updates or more concurrent actions.

---

## 5. Page thinness review

**Current state:** The page is **not yet thin enough** by the blueprint’s “few hundred lines or less” and “no business logic, no long handlers” standard.

- **Data flow:** Correct: locationId → useKdsView → useKdsMutations → handleAction. Adapter kdsViewToOrders is a single pure function. Good.
- **Remaining in page:**
  - **UI state (appropriate):** viewMode, activeStationId, completedOrders, toasts, modificationToasts, highlightedTicketId, transitioningTickets, stationMessages, messagePanelOpen, messageHistoryOpen, replyToStationId, dismissedBatchKeys, highlightedBatch, plus refs for timeouts and counters. This is a lot of state but it’s all UI/UX (toasts, modals, highlights, batch hints). Per plan, “Local UI state: viewMode, activeStationId, toasts, message panel open state” can live in the page.
  - **Derived state:** filteredOrders, allDayOrders, batchSuggestions, orderCounts, activeTableNumbers, incomingUnreadMessages, unreadMessageCount, getOrderLabel. These are derived from `orders` (itself from view) and activeStationId. They’re presentation logic. Moving them into useKdsView would require the hook to accept activeStationId and return filtered data, or we introduce a small “KDS view model” hook that takes view + activeStationId and returns filteredOrders, allDayOrders, orderCounts, etc. Either way, the **page** would get slimmer.
  - **Handlers:** addToast, handleToastView, handleToastDismiss, handleRecall, handleClearModified, handleModificationToastView, handleModificationToastDismiss, handleBatchDismiss, handleBatchHighlight, handleSendMessage, handleMarkMessageRead, handleReplyToStation, handleMessagePanelOpenChange, handleSnooze, handleWakeUp, handleRefire (no-ops), plus handleAction (thin wrapper). Most are short and UI-only. The main “weight” is the number of callbacks and the fact that they’re all in one file.

**What should move (optional before next feature):**

- **Derived data:** Move filteredOrders / allDayOrders / orderCounts (and optionally batchSuggestions) into a hook that takes `view` (or `orders`) and `activeStationId`. For example extend useKdsView to accept an optional `stationId` and return `filteredOrders`, `allDayOrders`, `orderCounts`, or add a `useKdsViewDerived(view, activeStationId)` that returns them. Then the page only composes and passes to KDSColumns. This is the single change that would most reduce page size and clarify “page = shell + UI state only.”
- **Dead code:** Remove KdsOrderResponse and mapKdsOrderToOrder.

**Verdict:** Page is acceptable for the first slice and for adding one more feature. Thinning by extracting derived data (and removing dead code) is recommended before or right after the next slice, not blocking.

---

## 6. Reuse boundary review

| File | Reusable? | Notes |
|------|-----------|--------|
| `src/lib/kds/kdsView.ts` | Yes | Contract for any consumer of GET /api/kds/view (KDS page, future KDS-style screens, tests). |
| `src/lib/kds/computeKdsActions.ts` | Yes | Pure helper; used by GET route; could be used by client to recompute actions after patch. |
| `src/app/api/kds/view/route.ts` | Yes | Any client that needs the KDS read model for a location. |
| `src/lib/hooks/useKdsView.ts` | Yes (KDS-style screens) | Generic “load and hold KdsView, refresh, patch, itemsByStation.” Reusable by another KDS or kitchen-style view. |
| `src/lib/hooks/useKdsMutations.ts` | KDS-page-specific for now | Handlers are KDS-specific (orderId-based ready/served). If we add itemId-based handlers or a generic “item status mutation” hook, it could be reused. No change needed yet. |
| `src/app/kds/page.tsx` | No (page-only) | KDS page shell: location resolution, adapter kdsViewToOrders, all KDS UI state and presentational wiring. Intentionally not reused. |
| **Adapter kdsViewToOrders** | Currently page-local | Logic is reusable (any consumer that needs “Order[] with nested items” from KdsView). Could move to `src/lib/kds/kdsViewToOrders.ts` or keep in page until we refactor components to accept KdsView. |

**Explicit boundaries:**

- **Keep shared:** kdsView.ts, computeKdsActions.ts, GET route, useKdsView. These define the read model and its loading/patching.
- **Keep page-specific for now:** useKdsMutations (first-slice API), page.tsx and its Order/OrderItem types, and the adapter. When we add more mutations or a second screen that uses KdsView, we can extract a shared “item status mutation” helper or move the adapter to lib.

---

## 7. Required cleanup before feature expansion

**Must fix before adding more KDS features**

1. **Remove dead code in `src/app/kds/page.tsx`:** Delete the `KdsOrderResponse` interface and `mapKdsOrderToOrder` function (~lines 127–171). They are unused and can cause confusion.

**Nice cleanup (not blocking)**

2. **Extract derived view data from the page:** Move filteredOrders, allDayOrders, orderCounts (and optionally batchSuggestions) into useKdsView (e.g. pass activeStationId and return these) or into a small `useKdsViewDerived(view, activeStationId)` hook. Reduces page size and keeps “page = shell + UI state.”
3. **Optional: move kdsViewToOrders:** Relocate `kdsViewToOrders` (and the legacy Order/OrderItem types if needed) to `src/lib/kds/kdsViewToOrders.ts` (or similar) so the page only imports and calls it. Clearer reuse boundary; not required for the next slice.

**Safe to ignore for now**

4. **readyItems:** useKdsView does not expose readyItems. Plan listed it as optional; no current consumer. Add only when a feature needs it.
5. **explain=1 on GET:** Implementation plan mentions optional `?explain=1` and meta.explain. Not implemented; add when doing performance work.
6. **In-flight mutation guard:** Omit until we add optimistic updates or see double-submit issues.

---

## 8. Recommendation for next feature slice

**Recommendation: add “mark preparing” next.**

**Reasons:**

1. **Completes the core item lifecycle:** First slice already has “mark ready” and “mark served.” “Mark preparing” is the missing step (pending → preparing). Adding it gives the kitchen the full flow: pending → preparing → ready → served, with no new routes (PUT already returns patch for preparing).
2. **Minimal surface area:** Reuse the same PUT route and the same pattern as ready/served: in useKdsMutations add handleMarkPreparing(orderId) (or handleMarkPreparing(itemId) if we switch to per-item). Patch orderItems and actions on success; same failure handling. No new types, no new API.
3. **Validates the mutation hook:** Confirms that useKdsMutations can grow by one handler and one transition without structural change. If we later add optimistic updates or rollback, we do it once for all three transitions.
4. **Defers higher-risk or product-heavy work:** Void item (DELETE, voidedAt handling, filtering) and fire wave (different route, wave/session semantics) are larger. Station filtering/grouping is mostly UI and derived data. Mark preparing is the smallest, lowest-risk next step.

**What to do in the next slice:** (1) Remove dead code (KdsOrderResponse, mapKdsOrderToOrder). (2) In useKdsMutations add handleMarkPreparing(orderId) (items with status "pending"), same fetch/patch/toast/refresh pattern. (3) In the page, extend handleAction to call handleMarkPreparing when newStatus === "preparing". (4) Optionally add optimistic apply + rollback for all three transitions in one go; if not, keep patch-on-success-only for this slice.

**Alternative considered:** “Void item” was the other candidate. It’s more impactful for kitchen workflow but requires DELETE handling, voidedAt in the view, and filtering (e.g. exclude voided items from columns). Doing “mark preparing” first keeps the next slice small and proves the hook pattern; void can follow immediately after.
