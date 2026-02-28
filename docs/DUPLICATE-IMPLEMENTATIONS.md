# Duplicate / Parallel Implementations Audit

**Date:** 2025-02-24

Business operations that have multiple implementations or entry points.

---

## 1. Add items to orders

| Implementation | Location | Entry Point | Context |
|----------------|----------|-------------|---------|
| **addItemsToOrder** | `serviceActions.ts` | Table page, syncSessionOrderViaServiceLayer | Session-based; creates/finds wave; inserts order_items + customizations; records items_added; supports seat breakdown |
| **addItemToOrderByOrderId** | `orders.ts` (via `addItemToExistingOrder` in serviceActions) | API `POST /api/orders/[id]/items` | Standalone order (pickup/delivery); no session; no wave model; inserts order_items + customizations |
| **createOrderWithItemsForPickupDelivery** | `orders.ts` (via `createOrderFromApi`) | API `POST /api/orders` (pickup/delivery branch) | Creates order + items in one shot; no session; single wave |

**Notes:** Dine-in POS uses `addItemsToOrder`. Pickup/delivery cannot use it (no session). API dine-in branch uses `addItemsToOrder` when sessionId provided. Different input shapes, validation, and event recording.

---

## 2. Fire wave / send to kitchen

| Implementation | Location | Entry Point | DB writes |
|----------------|----------|-------------|-----------|
| **fireWave** | `serviceActions.ts` → `orders.fireWave` | Table page | Delegates to orders.fireWave; single code path |
| **sendWaveToKitchen** | `serviceActions.ts` | syncSessionOrderViaServiceLayer (deprecated) | **Parallel implementation** — does its own db.update(orders), db.update(order_items), recordSessionEvent; does NOT call orders.fireWave |

**Notes:** Both perform the same business operation (fire a wave). `sendWaveToKitchen` duplicates the logic of `orders.fireWave` inline. `fireWave` (service layer) resolves orderId from sessionId+waveNumber, then calls `orders.fireWave`. Risk: behavior divergence if one is updated and not the other.

---

## 3. Close session

| Implementation | Location | Entry Point | Notes |
|----------------|----------|-------------|-------|
| **closeSessionService** | `serviceActions.ts` → `orders.closeSession` | Table page | Canonical; validates via canCloseSession; delegates to closeSession |
| **closeOrderForTable** | `orders.ts` → `closeSession` | No current callers | Same underlying closeSession; takes tableId, looks up session, then calls closeSession |
| **closeSession** | `orders.ts` | closeSessionService, closeOrderForTable | Single implementation; all paths converge here |

**Notes:** Only one actual implementation (`closeSession`). `closeOrderForTable` is an alternative entry point (tableId → sessionId) with no current callers. Not a true duplicate.

---

## 4. Record session events

| Implementation | Location | Entry Point | Notes |
|----------------|----------|-------------|-------|
| **recordSessionEvent** | `session-events.ts` | All others ultimately call this | Low-level; inserts into session_events |
| **recordSessionEventWithSource** | `session-events.ts` | serviceActions, order-item-lifecycle, orders, table page, floor map, kitchen-delay-detection | Wrapper; merges source/correlationId into meta |
| **recordSessionEventByTable** | `session-events.ts` | No current callers | Wrapper; looks up session by tableId, then recordSessionEvent |
| **recordEvent** | `serviceActions.ts` | No current callers | Domain wrapper; looks up locationId from session, calls recordSessionEventWithSource |

**Notes:** Multiple layers (recordSessionEvent → recordSessionEventWithSource → recordEvent). Table page and floor map call `recordSessionEventWithSource` directly (bypass domain wrapper). `recordEvent` and `recordSessionEventByTable` exist but are unused. Not truly parallel—same underlying insert—but multiple entry points and the domain wrapper is unused.

---

## 5. Void item

| Implementation | Location | Entry Point | Notes |
|----------------|----------|-------------|-------|
| **voidItem** (service) | `serviceActions.ts` → `order-item-lifecycle.voidItem` | Table page, API DELETE, syncSessionOrderViaServiceLayer | Single path; all go through service layer |

**Notes:** No duplicates. Table page, API, and sync all use `serviceActions.voidItem`.

---

## 6. Advance wave status (mark items preparing/ready/served)

| Implementation | Location | Entry Point | Notes |
|----------------|----------|-------------|-------|
| **advanceWaveStatus** | `serviceActions.ts` → `orders.advanceOrderWaveStatusBySession` → `order-item-lifecycle` | Table page | Batches all items in wave; calls markItemPreparing/markItemReady/markItemServed per item |
| **markItemPreparing / markItemReady / markItemServed** (per-item) | `serviceActions.ts` → `order-item-lifecycle` | API PUT, KDS (via API) | Single-item status change |

**Notes:** Same underlying lifecycle functions. `advanceWaveStatus` is a batch wrapper. Not a duplicate—different granularity (wave vs item).

---

## 7. Reservations create/update

| Implementation | Location | Entry Point | Notes |
|----------------|----------|-------------|-------|
| **createReservation / updateReservation** | `reservations.ts` (actions) | useRestaurantMutations → timeline-view, list-view | Server actions; direct db.insert/update |
| **POST /api/reservations** | `api/reservations/route.ts` | External API | Direct db.insert; parallel implementation |
| **PUT /api/reservations/[id]** | `api/reservations/[id]/route.ts` | External API | Direct db.update; parallel implementation |
| **DELETE /api/reservations/[id]** | `api/reservations/[id]/route.ts` | External API | Direct db.delete; parallel implementation |

**Notes:** UI uses server actions. API has its own implementation. Same tables, different code paths. No shared validation layer.

---

## 8. Tables create/update/delete

| Implementation | Location | Entry Point | Notes |
|----------------|----------|-------------|-------|
| **updateTable** | `tables.ts` (actions) | serviceActions.updateTableLayout | Used for layout updates from table page |
| **POST /api/tables** | `api/tables/route.ts` | External API | Direct db.insert |
| **PATCH /api/tables/[id]** | `api/tables/[id]/route.ts` | External API | Direct db.update |
| **DELETE /api/tables/[id]** | `api/tables/[id]/route.ts` | External API | Direct db.delete |
| **floor-plans syncTablesFromElements** | `floor-plans.ts` | saveFloorPlan flow | db.delete + db.insert for tables in floor plan |

**Notes:** Table layout updates go through service layer. Table CRUD from API and floor plan sync use separate paths.

---

## Summary by risk

| Risk | Operation | Issue |
|------|-----------|-------|
| **High** | Fire wave | `sendWaveToKitchen` duplicates `orders.fireWave`; two implementations of same logic |
| **Medium** | Add items | Three paths (addItemsToOrder, addItemToOrderByOrderId, createOrderWithItemsForPickupDelivery); different models (session/waves vs standalone) |
| **Medium** | Record events | Domain wrapper `recordEvent` unused; UI calls `recordSessionEventWithSource` directly |
| **Low** | Reservations | Actions vs API; separate implementations |
| **Low** | Tables | Layout via service; CRUD via API/floor-plans |
