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
| **fireWave** | `serviceActions.ts` → `orders.fireWave` | Table page, legacy sync path | Delegates to orders.fireWave; single code path |
| **sendWaveToKitchen** | `serviceActions.ts` | Removed | Removed to eliminate duplicate wave-fire logic |

**Notes:** Previously there were two implementations. `sendWaveToKitchen` was removed and legacy sync now calls `fireWave`, so all wave firing converges to one path.

---

## 3. Close session

| Implementation | Location | Entry Point | Notes |
|----------------|----------|-------------|-------|
| **closeSessionService** | `serviceActions.ts` → `orders.closeSession` | Table page | Canonical; validates via canCloseSession; delegates to closeSession |
| **closeSession** | `orders.ts` | closeSessionService | Single implementation; all paths converge here |

**Notes:** Only one implementation remains (`closeSession`). The unused `closeOrderForTable` entry point was removed.

---

## 4. Record session events

| Implementation | Location | Entry Point | Notes |
|----------------|----------|-------------|-------|
| **recordSessionEvent** | `session-events.ts` | All others ultimately call this | Low-level; inserts into session_events |
| **recordSessionEventWithSource** | `session-events.ts` | serviceActions, order-item-lifecycle, orders, table page, floor map, kitchen-delay-detection | Wrapper; merges source/correlationId into meta |

**Notes:** Unused wrappers (`recordEvent`, `recordSessionEventByTable`) were removed. Event writes now use either `recordSessionEvent` directly or `recordSessionEventWithSource`.

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
| **createReservation / updateReservation** | `reservations.ts` (actions) | useRestaurantMutations → timeline-view, list-view | Delegates to shared `domain/reservation-mutations.ts` |
| **POST /api/reservations** | `api/reservations/route.ts` | External API | Delegates to shared `domain/reservation-mutations.ts` |
| **PUT /api/reservations/[id]** | `api/reservations/[id]/route.ts` | External API | Delegates to shared `domain/reservation-mutations.ts` |
| **DELETE /api/reservations/[id]** | `api/reservations/[id]/route.ts` | External API | Delegates to shared `domain/reservation-mutations.ts` |

**Notes:** Entry points are still separate (UI actions vs API), but write logic is now shared, including status normalization and payload handling.

---

## 8. Tables create/update/delete

| Implementation | Location | Entry Point | Notes |
|----------------|----------|-------------|-------|
| **updateTable** | `tables.ts` (actions) | serviceActions.updateTableLayout | Delegates to shared `domain/table-mutations.ts` for writes |
| **POST /api/tables** | `api/tables/route.ts` | External API | Delegates to shared `domain/table-mutations.ts` |
| **PUT /api/tables/[id]** | `api/tables/[id]/route.ts` | External API | Delegates to shared `domain/table-mutations.ts` |
| **DELETE /api/tables/[id]** | `api/tables/[id]/route.ts` | External API | Delegates to shared `domain/table-mutations.ts` |
| **floor-plans syncTablesFromElements** | `floor-plans.ts` | saveFloorPlan flow | db.delete + db.insert for tables in floor plan |

**Notes:** Action/API writes now share one mutation layer. Floor-plan sync remains a separate bulk-rewrite path.

---

## Summary by risk

| Risk | Operation | Issue |
|------|-----------|-------|
| **Resolved** | Fire wave | Duplicate `sendWaveToKitchen` path removed; all wave firing uses `fireWave` |
| **Medium** | Add items | Three paths (addItemsToOrder, addItemToOrderByOrderId, createOrderWithItemsForPickupDelivery); different models (session/waves vs standalone) |
| **Low (reduced)** | Record events | Unused wrappers removed; remaining helpers are intentional (base + source wrapper) |
| **Low (reduced)** | Reservations | Separate entry points remain, but mutations are centralized |
| **Low (reduced)** | Tables | Action/API mutations are centralized; floor-plan sync remains separate |
