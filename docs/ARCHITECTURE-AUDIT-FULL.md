# NextFaster Architecture Audit — Database Mutations

**Date:** 2025-02-28

**Goal:** Trace every database mutation (db.insert, db.update, db.delete) and verify it follows the intended layering:

```
UI/API → domain services → validators → DB actions → database
```

---

## Summary

| Risk Level | Total | VALID | BYPASS |
|------------|-------|-------|--------|
| **HIGH** (critical POS path) | 17 | 16 | 1 |
| **MEDIUM** (important path) | 16 | 7 | 9 |
| **LOW** (admin/config path) | 38 | 0 | 38 |
| **Total** | 71 | 23 | 48 |

---

## HIGH RISK — Critical POS Path (orders, sessions, order_items, payments, seats)

### VALID (goes through domain layer)

| # | File | Function | Mutation | Call Chain | Notes |
|---|------|----------|----------|------------|-------|
| 1 | `src/domain/serviceActions.ts` | addItemsToOrder | db.insert(orderItemsTable), db.insert(orderItemCustomizationsTable) | table page → serviceActions.addItemsToOrder → validators (canAddItems) → db | Domain layer performs insert; UI does not bypass |
| 2 | `src/domain/serviceActions.ts` | fireWave (internal) | db.update(ordersTable), db.update(orderItemsTable) | table page → serviceActions.fireWave → validators (canFireWave) → db | |
| 3 | `src/domain/serviceActions.ts` | createNextWaveForSession | (delegates to orders.ts) | table page → serviceActions.createNextWaveForSession → orders.createNextWave → db | |
| 4 | `src/app/actions/orders.ts` | closeSession | db.insert(paymentsTable), db.update(sessionsTable), db.update(ordersTable), db.update(orderItemsTable) | table page → serviceActions.closeSessionService → orders.closeSession → db | |
| 5 | `src/app/actions/orders.ts` | createOrderWithItemsForPickupDelivery | db.insert(ordersTable), db.insert(orderItemsTable), db.insert(orderItemCustomizationsTable), db.insert(orderTimelineTable) | API POST /orders → serviceActions.createOrderFromApi → createOrderWithItemsForPickupDelivery → db | Pickup/delivery channel |
| 6 | `src/app/actions/orders.ts` | addItemToOrderByOrderId | db.insert(orderItemsTable), db.insert(orderItemCustomizationsTable) | API POST /orders/items → serviceActions.addItemToExistingOrder → addItemToOrderByOrderId → db | |
| 7 | `src/app/actions/orders.ts` | updateOrderMetadata | db.update(ordersTable) | serviceActions.updateOrder, cancelOrder → orders.updateOrderMetadata → db | |
| 8 | `src/app/actions/orders.ts` | updateOrderStatusByOrderId | db.update(ordersTable), db.insert(orderTimelineTable) | API → serviceActions.updateOrderStatus → orders.updateOrderStatusByOrderId → db | |
| 9 | `src/app/actions/orders.ts` | addPaymentToOrder | db.insert(paymentsTable), db.update(ordersTable) | API → serviceActions.addPayment → orders.addPaymentToOrder → db | |
| 10 | `src/app/actions/orders.ts` | updatePaymentStatus | db.update(paymentsTable), db.update(ordersTable) | API → serviceActions.updatePayment → orders.updatePaymentStatus → db | |
| 11 | `src/app/actions/order-item-lifecycle.ts` | markItemPreparing, markItemReady, markItemServed, voidItem, refireItem | db.update(orderItemsTable) | table page, KDS, API → serviceActions (markItem*, serveItem, voidItem) → order-item-lifecycle → db | |
| 12 | `src/app/actions/seat-management.ts` | addSeatToSession, removeSeatFromSession, renameSeat, syncSeatsWithGuestCount | db.insert(seatsTable), db.update(seatsTable), db.delete(seatsTable), db.update(orderItemsTable) | table page → serviceActions (addSeat, removeSeatByNumber, renameSeat) → seat-management → db | |
| 13 | `src/domain/orderTotals.ts` | recalculateOrderTotals, recalculateStandaloneOrderTotals | db.update(ordersTable) | serviceActions, orders, order-item-lifecycle → orderTotals → db | Helper used by domain/actions |
| 14 | `src/app/actions/orders.ts` | getOrCreateSessionForTable | db.insert(sessionsTable) | ensureSessionForTable → getOrCreateSessionForTable → db | Session creation; used by service layer |
| 15 | `src/app/api/orders/[id]/items/[itemId]/route.ts` | PUT (status, quantity, notes) | (none direct) | API → serviceActions (markItemPreparing, markItemReady, serveItem, updateItemQuantity, updateItemNotes) → order-item-lifecycle → db | **VALID** — API routes through domain |
| 16 | `src/app/api/orders/[id]/items/[itemId]/route.ts` | DELETE | (none direct) | API → serviceActions.voidItem → order-item-lifecycle.voidItem → db | **VALID** — uses voidItem from domain |

### BYPASS (UI/API calls DB directly or skips domain)

| # | File | Function | Mutation | Call Chain | Risk |
|---|------|----------|----------|------------|------|
| 1 | `src/app/actions/session-events.ts` | recordSessionEvent | db.insert(sessionEventsTable) | **table page, floor-map, kitchen-delay-detection** → recordSessionEventWithSource (session-events) → db | UI calls session-events directly; no domain gate. Session events are audit trail — lower impact but still bypass. |

---

## MEDIUM RISK — Important Path (reservations, tables, floor plans, session events)

### VALID

| # | File | Function | Mutation | Call Chain | Notes |
|---|------|----------|----------|------------|-------|
| 1 | `src/app/actions/floor-plans.ts` | deleteFloorPlan | handleFloorPlanDeletion (serviceActions) for unlink | floor-plans → serviceActions.handleFloorPlanDeletion → unlinkOrdersAndReservationsFromTableIds | Unlink step uses domain; floor plan delete is direct |
| 2 | `src/app/actions/floor-plans.ts` | syncTablesFromElements | unlinkOrdersAndReservationsFromTableIds (serviceActions) | floor-plans → serviceActions.unlinkOrdersAndReservationsFromTableIds | Before table delete |
| 3 | `src/domain/serviceActions.ts` | unlinkOrdersAndReservationsFromTableIds | db.update(ordersTable), db.update(reservationsTable) | floor-plans → serviceActions → db | Table unlink before floor plan sync |
| 4 | `src/domain/serviceActions.ts` | handleFloorPlanDeletion | (delegates to unlinkOrdersAndReservationsFromTableIds) | floor-plans → serviceActions | |
| 5 | `src/app/actions/reservations.ts` | createReservation | db.insert(reservationsTable) | useRestaurantMutations, API POST /reservations → reservations → db | No domain layer for reservations |
| 6 | `src/app/actions/reservations.ts` | updateReservation | db.update(reservationsTable) | useRestaurantMutations, API → reservations → db | |
| 7 | `src/app/actions/tables.ts` | updateTable | db.update(tablesTable) | serviceActions.updateTableLayout → tables.updateTable → db | Table layout updates via domain |

### BYPASS

| # | File | Function | Mutation | Call Chain | Notes |
|---|------|----------|----------|------------|-------|
| 1 | `src/app/actions/session-events.ts` | recordSessionEvent | db.insert(sessionEventsTable) | table page, floor-map, kitchen-delay-detection → session-events → db | See HIGH RISK bypass #1 |
| 2 | `src/app/actions/floor-plans.ts` | saveFloorPlan | db.update(floorPlans), db.insert(floorPlans) | floorplan-storage-db (client) → floor-plans → db | UI → actions → db. No domain layer for floor plans. |
| 3 | `src/app/actions/floor-plans.ts` | setActiveFloorPlanId | db.update(floorPlans) | floorplan-storage-db → floor-plans → db | |
| 4 | `src/app/actions/floor-plans.ts` | deleteFloorPlan | db.delete(floorPlans) | floorplan-storage-db → floor-plans → db | Uses serviceActions for unlink only |
| 5 | `src/app/actions/floor-plans.ts` | syncTablesFromElements | db.delete(tables), db.insert(tables) | saveFloorPlan → syncTablesFromElements → db | After serviceActions unlink |
| 6 | `src/app/api/reservations/route.ts` | POST | db.insert(reservations) | API → db | Direct API → db |
| 7 | `src/app/api/reservations/[id]/route.ts` | PATCH, DELETE | db.update(reservations), db.delete(reservations) | API → db | Direct API → db |
| 8 | `src/app/api/tables/route.ts` | POST | db.insert(tables) | API → db | Direct API → db |
| 9 | `src/app/api/tables/[id]/route.ts` | PATCH, DELETE | db.update(tables), db.delete(tables) | API → db | Direct API → db |

---

## LOW RISK — Admin/Config Path (menus, items, categories, customizations, tags, allergens, customers, merchants, locations, auth, invitations, waitlist)

These mutations have **no domain service layer** by design. Config CRUD is typically API/actions → db.

### API Routes — Direct DB Access

| File | Mutations | Caller |
|------|-----------|--------|
| `src/app/api/menus/route.ts` | db.insert(menus) | menu-context.tsx (dashboard) |
| `src/app/api/menus/[id]/route.ts` | db.update(menus), db.delete(menus) | menu-context.tsx |
| `src/app/api/categories/route.ts` | db.insert(categories), db.insert(menuCategories) | menu-context.tsx |
| `src/app/api/categories/[id]/route.ts` | db.update(categories), db.delete(menuCategories), db.insert(menuCategories), db.delete(categories) | menu-context.tsx |
| `src/app/api/categories/reorder/route.ts` | db.update(categories) | menu-context.tsx |
| `src/app/api/items/route.ts` | db.insert(items), db.insert(categoryItems), db.insert(itemTags), db.insert(itemAllergens), db.insert(itemCustomizations) | menu-context.tsx |
| `src/app/api/items/[id]/route.ts` | db.update(items), db.delete(categoryItems), db.insert(categoryItems), db.delete(itemTags), db.insert(itemTags), db.delete(itemAllergens), db.insert(itemAllergens), db.delete(itemCustomizations), db.insert(itemCustomizations), db.delete(items) | menu-context.tsx |
| `src/app/api/items/reorder/route.ts` | db.update(items) | menu-context.tsx |
| `src/app/api/customizations/route.ts` | db.insert(customizationGroups), db.insert(customizationOptions), db.update(customizationGroups), db.insert(conditionalPrices), db.insert(conditionalQuantities), db.insert(secondaryGroupRules) | menu-context.tsx |
| `src/app/api/customizations/[id]/route.ts` | db.update(customizationGroups), db.delete(customizationOptions), db.insert(customizationOptions), db.delete(conditionalPrices), db.insert(conditionalPrices), db.delete(conditionalQuantities), db.insert(conditionalQuantities), db.delete(secondaryGroupRules), db.insert(secondaryGroupRules), db.delete(customizationGroups) | menu-context.tsx |
| `src/app/api/tags/route.ts` | db.insert(tags) | menu-context.tsx |
| `src/app/api/tags/[id]/route.ts` | db.delete(tags) | menu-context.tsx |
| `src/app/api/allergens/route.ts` | db.insert(allergens) | menu-context.tsx |
| `src/app/api/allergens/[id]/route.ts` | db.delete(allergens) | menu-context.tsx |
| `src/app/api/customers/route.ts` | db.insert(customers) | (API consumers) |
| `src/app/api/customers/[id]/route.ts` | db.update(customers), db.delete(customers) | (API consumers) |
| `src/app/api/locations/route.ts` | db.insert(merchantLocations) | stores page |
| `src/app/api/locations/[id]/route.ts` | db.update(merchantLocations) | stores page |
| `src/app/api/merchants/[id]/route.ts` | db.update(merchants) | business settings |
| `src/app/api/admin/merchants/route.ts` | tx.insert(merchants), tx.insert(merchantLocations), tx.insert(invitations) | MerchantOnboardingForm |
| `src/app/api/admin/promote/route.ts` | db.insert(platformPersonnel) | (admin) |
| `src/app/api/invitations/[token]/accept/route.ts` | tx.update(invitations), tx.insert(merchantUsers), tx.update(invitations) | invite page |

### Server Actions — Direct DB Access

| File | Function | Mutations | Caller |
|------|----------|-----------|--------|
| `src/app/actions/auth.ts` | login, signup | db.insert(users) upsert | LoginForm, SignupForm |
| `src/app/actions/merchants.ts` | createMerchant | tx.insert(merchants), tx.insert(merchantLocations) | NewMerchantForm |
| `src/app/actions/merchants.ts` | updateMerchant | db.update(merchants), db.update(merchantLocations), db.insert(merchantLocations) | EditMerchantForm |
| `src/app/actions/waitlist.ts` | addToWaitlist, removeFromWaitlist, updateWaitlistEntry | db.insert(waitlistTable), db.delete(waitlistTable), db.update(waitlistTable) | useRestaurantMutations → waitlist-view, etc. |

---

## Call Chain Reference

### Table Page (src/app/table/[id]/page.tsx)

| Action | Target | Classification |
|--------|--------|----------------|
| addItemsToOrder | serviceActions | VALID |
| ensureSession | serviceActions | VALID |
| createNextWaveForSession | serviceActions | VALID |
| fireWave | serviceActions | VALID |
| closeSessionService | serviceActions | VALID |
| voidItem | serviceActions | VALID |
| serveItem | serviceActions | VALID |
| advanceWaveStatus | serviceActions | VALID |
| removeSeatByNumber | serviceActions | VALID |
| renameSeat | serviceActions | VALID |
| updateTableLayout | serviceActions | VALID |
| recordSessionEventWithSource | session-events (actions) | **BYPASS** |
| getOrderForTable, getSeatsForSession, getOpenSessionIdForTable | orders (reads) | N/A |

### KDS Page (src/app/kds/page.tsx)

| Action | Target | Classification |
|--------|--------|----------------|
| refireItem | serviceActions | VALID |
| fetch PUT/DELETE /api/orders/.../items/... | API → serviceActions | VALID |

### Floor Map (src/app/floor-map/page.tsx)

| Action | Target | Classification |
|--------|--------|----------------|
| ensureSession | serviceActions | VALID |
| recordSessionEventWithSource | session-events | **BYPASS** |

### API Orders

| Endpoint | Flow | Classification |
|----------|------|----------------|
| POST /api/orders | createOrderFromApi (serviceActions) | VALID |
| PUT/DELETE /api/orders/[id] | updateOrder, cancelOrder (serviceActions) | VALID |
| PUT /api/orders/[id]/status | updateOrderStatus (serviceActions) | VALID |
| POST /api/orders/[id]/items | addItemToExistingOrder (serviceActions) | VALID |
| PUT/DELETE /api/orders/[id]/items/[itemId] | markItem*, serveItem, voidItem, updateItemQuantity, updateItemNotes (serviceActions) | VALID |
| POST /api/orders/[id]/payments | addPayment (serviceActions) | VALID |
| PUT /api/payments/[id] | updatePayment (serviceActions) | VALID |

---

## Recommendations

### High Priority

1. **session-events bypass** — Table page, floor-map, and kitchen-delay-detection call `recordSessionEventWithSource` directly. Consider:
   - Adding `recordSessionEvent` to the domain layer if event recording should be gated, or
   - Documenting that session events are intentionally a lightweight audit sink called from UI/actions (acceptable if no business rules depend on them).

### Medium Priority

2. **Floor plans** — Floor plan and table layout mutations (save, delete, setActive, syncTables) go directly from UI → floor-plans actions → db. The POS-critical "unlink" step already uses serviceActions. If floor plan changes need validation (e.g. prevent delete when tables have active sessions), add a domain gate.

3. **Reservations/Tables APIs** — POST/PATCH/DELETE for reservations and tables hit the database directly. These are config/setup operations. If business rules (e.g. "cannot delete table with open session") are needed, introduce a domain layer.

### Low Priority (Acceptable)

4. **Config CRUD** — Menus, items, categories, customizations, tags, allergens, customers, merchants, locations have no domain layer. This is typical for admin/config; add validation in actions or a thin domain layer only if complex rules appear.

---

## Excluded (Not Database Mutations)

- `Map.delete()`, `Set.delete()` — in-memory
- `cookieStore.delete()` — auth.ts, supabaseServer.ts
- `toastTimeouts.delete()` — use-toast.ts
- `platformAdminCache.delete()` — permissions.ts
- `response.cookies.delete()` — proxy.ts
- URL param handling (e.g. `delete searchParams.x`)
