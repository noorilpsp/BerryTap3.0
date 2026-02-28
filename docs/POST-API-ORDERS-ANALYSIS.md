# POST /api/orders Analysis

**Date:** 2025-02-24

## Purpose

Determine whether POST /api/orders is used for dine-in POS, pickup, delivery, or mobile ordering, and whether it should migrate to the `addItemsToOrder` flow or be documented as a separate order channel.

---

## API Behavior

**Endpoint:** `POST /api/orders`

**Body:** `{ locationId, customerId?, sessionId?, tableId?, reservationId?, assignedStaffId?, orderType, paymentTiming, guestCount?, items: [...], notes? }`

**orderType values:** `dine_in` | `pickup` | `delivery` (from `order_type` enum)

**Dine-in handling:**
- If `sessionId` provided and valid (open session for location) → use it
- Else if `tableId` (table UUID) provided → resolves/creates session via `ensureSessionByTableUuid`
- Else → 400 "Dine-in orders require sessionId or tableId"

**Pickup/delivery:** No session. Creates order and items directly.

**Flow:** Direct `db.insert(orders)`, then `db.insert(orderItems)` for each item. Supports item customizations (order_item_customizations). Calculates tax, service charge, totals from location defaults.

---

## Caller Analysis

| Potential caller | Uses POST /api/orders? | Notes |
|------------------|------------------------|-------|
| **Dine-in POS (table page)** | No | Uses `addItemsToOrder` from serviceActions directly. Server action, no HTTP. |
| **Floor map** | No | Uses `ensureSession` for seating; order creation via table page flow. |
| **Mobile ordering (checkout)** | No | Prototype UI only. "Place Order" navigates to `/mobile/order-confirmation` with query params. No API call. |
| **KDS** | No | Uses `GET /api/kds/orders` (read) and `PUT /api/orders/[id]/items/[itemId]` (status updates). |
| **External clients** | Unknown | No callers found in codebase. API exists for future integrations, kiosks, or mobile apps. |

**Conclusion:** POST /api/orders has **no current callers** in the codebase. It is a general-purpose order creation API surface.

---

## Order Channel Classification

| Channel | Uses POST /api/orders? | Uses addItemsToOrder? | Session model |
|---------|------------------------|------------------------|---------------|
| **Dine-in POS** | No | Yes (table page) | Session → waves → order_items |
| **Pickup** | Yes (when wired) | No | No session; single order |
| **Delivery** | Yes (when wired) | No | No session; single order |
| **Mobile / QR dine-in** | Yes (when wired) | No | Would use session via tableId |

---

## addItemsToOrder vs POST /api/orders

| Aspect | addItemsToOrder | POST /api/orders |
|--------|-----------------|------------------|
| **Input** | sessionId, AddItemInput[] | locationId, orderType, items[] |
| **Session** | Required | Only for dine_in |
| **Customizations** | Not supported (customizationsTotal: "0.00") | Full support (order_item_customizations) |
| **Wave model** | Creates/finds open wave, adds to it | Creates single order (one wave) |
| **Totals** | recalculateOrderTotals, recalculateSessionTotals | Manual tax/service charge |

---

## Recommendation

**Document POST /api/orders as a separate order channel** — pickup, delivery, and external dine-in (e.g. QR/mobile ordering at table).

**Reasons:**
1. **Dine-in POS does not use it.** The table page uses `addItemsToOrder` directly. Migrating would not change current POS behavior.
2. **Pickup and delivery cannot use addItemsToOrder.** They have no session; addItemsToOrder requires sessionId.
3. **Migration of dine_in branch is possible but non-trivial.** addItemsToOrder does not support item customizations. Extending AddItemInput and the service to handle customizations would be required. The result would be: `ensureSessionByTableUuid` → `addItemsToOrder(sessionId, transformedItems)`.
4. **No callers today.** The API is an external surface. Documenting it clarifies architecture without blocking current work.

**Future option:** When wiring mobile/QR ordering for dine-in, either (a) extend addItemsToOrder with customizations and migrate the dine_in branch, or (b) keep POST /api/orders as the mobile entry point and accept the dual path (POS vs API) for dine-in.

---

## Architecture Status

POST /api/orders:
- **Bypasses service layer** for order and order_items creation (direct db.insert)
- **Uses service layer** for session resolution (ensureSessionByTableUuid) when orderType === "dine_in"
- **Documented as** separate order channel in this file and in ARCHITECTURE-AUDIT.md
