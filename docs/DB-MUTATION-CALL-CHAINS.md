# Database Mutation Call Chain Report

Tracing of every `db.insert`, `db.update`, `db.delete`, and `tx.insert/update/delete` in the NextFaster application (excluding `scripts/`).

---

## Domain: POS – Sessions

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/actions/orders.ts` | `getOrCreateSessionForTable` (via `ensureSessionForTable`/`ensureSessionForTableByTableUuid`) | `sessions` (insert) | UI/API → `ensureSessionForTable` / `ensureSessionForTableByTableUuid` → `getOrCreateSessionForTable` → db.insert | YES (when via serviceActions.ensureSession / ensureSessionByTableUuid) |
| `src/app/actions/orders.ts` | `getOrCreateSessionForTable` | `sessions` (insert) | `ensureSessionForTable` → `getOrCreateSessionForTable` → db.insert | YES (indirect via ensureSessionForTable) |
| `src/app/actions/orders.ts` | `closeSession` | `sessions` (update) | `closeSessionService` (serviceActions) → `closeSessionAction` → db.update | YES |

---

## Domain: POS – Orders

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/actions/orders.ts` | `createNextWave` | `orders` (insert) | Table page / serviceActions.addItemsToOrder → createNextWave → db.insert | YES |
| `src/app/actions/orders.ts` | `fireWave` | `orders`, `order_items` (update) | serviceActions.fireWave → fireWaveAction → db.update | YES |
| `src/app/actions/orders.ts` | `closeSession` | `orders` (update) | closeSessionService → closeSessionAction → db.update | YES |
| `src/app/api/orders/route.ts` | POST handler | `orders` (insert) | HTTP POST → route → db.insert | NO |
| `src/app/api/orders/[id]/route.ts` | PUT handler | `orders` (update) | HTTP PUT → route → db.update | NO |
| `src/app/api/orders/[id]/route.ts` | DELETE handler | `orders` (update), `tables` (update), `order_timeline` (insert) | HTTP DELETE → route → db.update/insert | NO |
| `src/app/api/orders/[id]/status/route.ts` | PUT handler | `orders` (update), `order_timeline` (insert) | HTTP PUT → route → db.update/insert | NO |

---

## Domain: POS – Order Items

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/domain/serviceActions.ts` | `updateItemQuantity` | `order_items` (update) | API PUT /api/orders/[id]/items/[itemId] OR table page → updateItemQuantity → db.update | YES |
| `src/domain/serviceActions.ts` | `updateItemNotes` | `order_items` (update) | API PUT /api/orders/[id]/items/[itemId] → updateItemNotes → db.update | YES |
| `src/domain/serviceActions.ts` | `addItemsToOrder` | `order_items` (insert) | Table page → addItemsToOrder → db.insert | YES |
| `src/domain/serviceActions.ts` | `fireWave` | `orders`, `order_items` (update) | Table page → fireWave → fireWaveAction → db.update | YES |
| `src/domain/serviceActions.ts` | `refireItem` | `order_items` (update) | KDS page / API → refireItem → refireItemAction + db.update | YES |
| `src/domain/serviceActions.ts` | `updateItemSeat` (assignItemToSeat / moveItemToSeat) | `order_items` (update) | UI → assignItemToSeat / moveItemToSeat → updateItemSeat → db.update | YES |
| `src/app/actions/order-item-lifecycle.ts` | `markItemPreparing` | `order_items` (update) | serviceActions.markItemPreparing → markItemPreparingAction → db.update | YES |
| `src/app/actions/order-item-lifecycle.ts` | `markItemReady` | `order_items` (update) | serviceActions.markItemReady → markItemReadyAction → db.update | YES |
| `src/app/actions/order-item-lifecycle.ts` | `markItemServed` | `order_items` (update) | serviceActions.serveItem → markItemServedAction → db.update | YES |
| `src/app/actions/order-item-lifecycle.ts` | `voidItem` | `order_items` (update) | serviceActions.voidItem / API DELETE → voidItemAction → db.update | YES |
| `src/app/actions/order-item-lifecycle.ts` | `refireItem` | `order_items` (update) | serviceActions.refireItem → refireItemAction → db.update | YES |
| `src/app/actions/orders.ts` | `closeSession` (force close) | `order_items` (update) | closeSessionService → closeSessionAction → db.update | YES |
| `src/app/api/orders/route.ts` | POST handler | `order_items`, `order_item_customizations` (insert) | HTTP POST → route → db.insert | NO |
| `src/app/api/orders/[id]/items/route.ts` | POST handler | `order_items`, `order_item_customizations`, `orders` (insert, update) | HTTP POST → route → db.insert/update | NO |
| `src/app/api/orders/[id]/items/[itemId]/route.ts` | PUT/DELETE | — | Uses serviceActions (markItemPreparing, markItemReady, serveItem, updateItemQuantity, updateItemNotes, voidItem) | YES |

---

## Domain: POS – Order Item Customizations

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/api/orders/route.ts` | POST handler | `order_item_customizations` (insert) | HTTP POST → route → db.insert | NO |
| `src/app/api/orders/[id]/items/route.ts` | — | (not in current grep; see orders route) | — | — |

---

## Domain: POS – Order Timeline

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/api/orders/route.ts` | POST handler | `order_timeline` (insert) | HTTP POST → route → db.insert | NO |
| `src/app/api/orders/[id]/route.ts` | DELETE handler | `order_timeline` (insert) | HTTP DELETE → route → db.insert | NO |
| `src/app/api/orders/[id]/status/route.ts` | PUT handler | `order_timeline` (insert) | HTTP PUT → route → db.insert | NO |

---

## Domain: POS – Seats

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/actions/seat-management.ts` | `addSeatToSession` | `seats` (insert) | serviceActions.addSeat → addSeatToSessionAction → db.insert | YES |
| `src/app/actions/seat-management.ts` | `removeSeatFromSession` | `seats` (update or delete) | serviceActions.removeSeat / removeSeatByNumber → removeSeatFromSessionAction → db.update or db.delete | YES |
| `src/app/actions/seat-management.ts` | `renameSeat` | `seats`, `order_items` (update) | serviceActions.renameSeat → renameSeatBySessionAndNumberAction → renameSeat → db.update | YES |
| `src/app/actions/seat-management.ts` | `syncSeatsWithGuestCount` | `seats` (insert, update) | orders.ensureSessionForTable → ensureSeatsForSession → syncSeatsWithGuestCount → db.insert/update | YES (via orders) |

---

## Domain: POS – Payments

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/actions/orders.ts` | `closeSession` | `payments` (insert) | closeSessionService → closeSessionAction → db.insert | YES |
| `src/app/api/orders/[id]/payments/route.ts` | POST handler | `payments`, `orders` (insert, update) | HTTP POST → route → db.insert/update | NO |
| `src/app/api/payments/[id]/route.ts` | PUT handler | `payments`, `orders` (update) | HTTP PUT → route → db.update | NO |

---

## Domain: POS – Session Events

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/actions/session-events.ts` | `recordSessionEvent` | `session_events` (insert) | serviceActions, order-item-lifecycle, orders, kitchen-delay-detection, table page, floor-map page → recordSessionEvent → db.insert | YES (when via POS flows) / NO (when called from floor-map/table page directly) |

---

## Domain: POS – Tables (physical layout)

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/actions/floor-plans.ts` | `deleteFloorPlan` | `orders`, `reservations` (update), `tables` (delete) | UI → deleteFloorplanDb → deleteFloorPlan → db.update/delete | NO |
| `src/app/actions/floor-plans.ts` | `syncTablesFromElements` (via saveFloorPlan, deleteFloorPlan) | `orders`, `reservations` (update), `tables` (delete, insert) | UI → saveFloorplanDb / deleteFloorplanDb → saveFloorPlan / deleteFloorPlan → syncTablesFromElements → db.update/delete/insert | NO |
| `src/app/actions/tables.ts` | `updateTable` | `tables` (update) | Table page / floor-map page → updateTable → db.update | NO |
| `src/app/api/orders/[id]/route.ts` | DELETE handler | `tables` (update) | HTTP DELETE → route → db.update | NO |
| `src/app/api/tables/route.ts` | POST handler | `tables` (insert) | HTTP POST → route → db.insert | NO |
| `src/app/api/tables/[id]/route.ts` | PUT handler | `tables` (update) | HTTP PUT → route → db.update | NO |
| `src/app/api/tables/[id]/route.ts` | DELETE handler | `tables` (delete) | HTTP DELETE → route → db.delete | NO |

---

## Domain: Menu – Items

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/api/items/route.ts` | POST handler | `items`, `category_items`, `item_tags`, `item_allergens`, `item_customizations` (insert) | HTTP POST → route → db.insert | NO |
| `src/app/api/items/[id]/route.ts` | PUT handler | `items`, `category_items`, `item_tags`, `item_allergens`, `item_customizations` (update, delete, insert) | HTTP PUT → route → db.update/delete/insert | NO |
| `src/app/api/items/[id]/route.ts` | DELETE handler | `items` (delete) | HTTP DELETE → route → db.delete | NO |
| `src/app/api/items/reorder/route.ts` | (handler) | `items` (update) | HTTP → route → db.update | NO |

---

## Domain: Menu – Categories

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/api/categories/route.ts` | POST handler | `categories`, `menu_categories` (insert) | HTTP POST → route → db.insert | NO |
| `src/app/api/categories/[id]/route.ts` | PUT handler | `categories`, `menu_categories` (update, delete, insert) | HTTP PUT → route → db.update/delete/insert | NO |
| `src/app/api/categories/[id]/route.ts` | DELETE handler | `categories` (delete) | HTTP DELETE → route → db.delete | NO |
| `src/app/api/categories/reorder/route.ts` | (handler) | `categories` (update) | HTTP → route → db.update | NO |

---

## Domain: Menu – Menus

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/api/menus/route.ts` | POST handler | `menus` (insert) | HTTP POST → route → db.insert | NO |
| `src/app/api/menus/[id]/route.ts` | PUT handler | `menus` (update) | HTTP PUT → route → db.update | NO |
| `src/app/api/menus/[id]/route.ts` | DELETE handler | `menus` (delete) | HTTP DELETE → route → db.delete | NO |

---

## Domain: Menu – Customizations

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/api/customizations/route.ts` | POST handler | `customization_groups`, `customization_options`, `conditional_prices`, `conditional_quantities`, `secondary_group_rules` (insert, update) | HTTP POST → route → db.insert/update | NO |
| `src/app/api/customizations/[id]/route.ts` | PUT handler | `customization_groups`, `customization_options`, `conditional_prices`, `conditional_quantities`, `secondary_group_rules` (update, delete, insert) | HTTP PUT → route → db.update/delete/insert | NO |
| `src/app/api/customizations/[id]/route.ts` | DELETE handler | `customization_groups` (delete) | HTTP DELETE → route → db.delete | NO |

---

## Domain: Menu – Allergens, Tags

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/api/allergens/route.ts` | POST handler | `allergens` (insert) | HTTP POST → route → db.insert | NO |
| `src/app/api/allergens/[id]/route.ts` | DELETE handler | `allergens` (delete) | HTTP DELETE → route → db.delete | NO |
| `src/app/api/tags/route.ts` | POST handler | `tags` (insert) | HTTP POST → route → db.insert | NO |
| `src/app/api/tags/[id]/route.ts` | DELETE handler | `tags` (delete) | HTTP DELETE → route → db.delete | NO |

---

## Domain: Reservations

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/actions/reservations.ts` | `createReservation` | `reservations` (insert) | UI → useRestaurantMutations.createReservation → createReservationAction → db.insert | NO |
| `src/app/actions/reservations.ts` | `updateReservation` | `reservations` (update) | UI → useRestaurantMutations.updateReservation → updateReservationAction → db.update | NO |
| `src/app/api/reservations/route.ts` | POST handler | `reservations` (insert) | HTTP POST → route → db.insert | NO |
| `src/app/api/reservations/[id]/route.ts` | PUT handler | `reservations` (update) | HTTP PUT → route → db.update | NO |
| `src/app/api/reservations/[id]/route.ts` | DELETE handler | `reservations` (delete) | HTTP DELETE → route → db.delete | NO |

---

## Domain: Waitlist

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/actions/waitlist.ts` | `addToWaitlist` | `waitlist` (insert) | UI → useRestaurantMutations.addToWaitlist → addToWaitlistAction → db.insert | NO |
| `src/app/actions/waitlist.ts` | `removeFromWaitlist` | `waitlist` (delete) | UI → useRestaurantMutations.removeFromWaitlist → removeFromWaitlistAction → db.delete | NO |
| `src/app/actions/waitlist.ts` | `updateWaitlistEntry` | `waitlist` (update) | UI → useRestaurantMutations.updateWaitlistEntry → updateWaitlistEntryAction → db.update | NO |

---

## Domain: Merchants / Locations

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/actions/merchants.ts` | `createMerchant` | `merchants`, `merchant_locations` (insert) | Admin UI → createMerchant → tx.insert | NO |
| `src/app/actions/merchants.ts` | `updateMerchant` | `merchants`, `merchant_locations` (update, insert) | Admin UI → updateMerchant → db.update/insert | NO |
| `src/app/api/merchants/[id]/route.ts` | PUT handler | `merchants` (update) | HTTP PUT → route → db.update | NO |
| `src/app/api/admin/merchants/route.ts` | POST handler | `merchants`, `merchant_locations`, `invitations` (insert) | HTTP POST → route → tx.insert | NO |
| `src/app/api/locations/route.ts` | POST handler | `merchant_locations` (insert) | HTTP POST → route → db.insert | NO |
| `src/app/api/locations/[id]/route.ts` | PUT handler | `merchant_locations` (update) | HTTP PUT → route → db.update | NO |
| `src/app/api/invitations/[token]/accept/route.ts` | handler | `invitations` (update), `merchant_users` (insert) | HTTP → route → tx.update/insert | NO |

---

## Domain: Auth / Users

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/actions/auth.ts` | `login` | `users` (insert/upsert) | LoginForm → login → db.insert (onConflictDoUpdate) | NO |
| `src/app/actions/auth.ts` | `signup` | `users` (insert/upsert) | SignupForm → signup → db.insert (onConflictDoUpdate) | NO |
| `src/app/api/admin/promote/route.ts` | handler | `platform_personnel` (insert) | HTTP POST → route → db.insert | NO |

---

## Domain: Customers

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/app/api/customers/route.ts` | POST handler | `customers` (insert) | HTTP POST → route → db.insert | NO |
| `src/app/api/customers/[id]/route.ts` | PUT handler | `customers` (update) | HTTP PUT → route → db.update | NO |
| `src/app/api/customers/[id]/route.ts` | DELETE handler | `customers` (delete) | HTTP DELETE → route → db.delete | NO |

---

## Domain: Order Totals (derived)

| File | Function | Tables Mutated | Call Chain | Through service layer? |
|------|----------|----------------|------------|------------------------|
| `src/domain/orderTotals.ts` | `recalculateOrderTotals` | `orders` (update) | serviceActions, order-item-lifecycle, orders → recalculateOrderTotals → db.update | YES (all callers) |
| `src/domain/orderTotals.ts` | `recalculateSessionTotals` | `orders` (update, via recalc per order) | serviceActions, orders → recalculateSessionTotals → recalculateOrderTotals → db.update | YES |

---

## Summary: Service Layer Coverage

| Domain | Mutations | Through serviceActions | Bypass |
|--------|-----------|------------------------|--------|
| POS (sessions, orders, order_items, seats, payments, session_events) | Dine-in table flow | Most via serviceActions | POST /api/orders, POST /api/orders/[id]/items, PUT/DELETE /api/orders/[id], PUT /api/orders/[id]/status, POST /api/orders/[id]/payments, PUT /api/payments/[id] |
| POS (tables, floor plans) | Layout management | — | All (floor-plans, tables actions, API) |
| Menu | All | — | All (API routes only) |
| Reservations | All | — | All (actions + API) |
| Waitlist | All | — | All (actions) |
| Merchants / Locations | All | — | All (actions + API) |
| Auth / Users | All | — | All (actions + API) |
| Customers | All | — | All (API) |

---

## API Route Callers (Top-Level)

API routes are invoked by HTTP requests. Typical callers:

- **Frontend fetch/axios** from dashboard, builder, admin, booking, KDS, etc.
- **External systems** (webhooks, integrations)
- **Mobile apps** or third-party clients

Specific UI → action/API mappings are documented in the call chain column above where relevant.
