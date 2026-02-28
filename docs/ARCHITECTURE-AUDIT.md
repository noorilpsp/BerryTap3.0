# POS Architecture Audit

**Date:** 2025-02-24

**Goal:** Ensure the POS follows the intended flow:

```
UI / API
  → serviceActions (domain layer)
  → serviceFlow (validators)
  → DB actions
  → database
```

---

## VALID — Calls correctly routed through serviceActions

| Caller | Function | Source |
|--------|----------|--------|
| `src/app/table/[id]/page.tsx` | addItemsToOrder | serviceActions |
| `src/app/table/[id]/page.tsx` | fireWave | serviceActions |
| `src/app/table/[id]/page.tsx` | closeSessionService | serviceActions |
| `src/app/table/[id]/page.tsx` | voidItem | serviceActions |
| `src/app/table/[id]/page.tsx` | serveItem | serviceActions |
| `src/app/table/[id]/page.tsx` | advanceWaveStatus | serviceActions |
| `src/app/kds/page.tsx` | refireItem | serviceActions |
| `src/app/api/orders/[id]/items/[itemId]/route.ts` (PUT status) | markItemPreparing, markItemReady, serveItem | serviceActions |

---

## BYPASSING SERVICE LAYER

### 1. orders.ts

| File | Line | Function Called | Issue | Recommended Replacement |
|------|------|-----------------|-------|-------------------------|
| `src/app/table/[id]/page.tsx` | 55–61 | createNextWave, getOrderForTable, getOpenSessionIdForTable, getSeatsForSession, ensureSessionForTable | Table page calls these directly | **createNextWave**: Add `createNextWave(sessionId)` to serviceActions and route table page through it. **getOrderForTable, getSeatsForSession, getOpenSessionIdForTable**: Reads; consider keeping or moving to a dedicated read service. **ensureSessionForTable**: Add `ensureSession(locationId, tableId, guestCount)` wrapper in serviceActions if session creation should be canonical. |
| `src/app/table/[id]/page.tsx` | 1796 | createNextWave(sid) | Mutation: creates new wave when user clicks "+" | Add `createNextWave(sessionId)` to serviceActions (or expose existing internal use) and call from table page |
| `src/app/table/[id]/page.tsx` | 1296, 1632 | ensureSessionForTable | Session creation | Route through serviceActions.ensureSession or document as acceptable low-level helper |
| `src/app/floor-map/page.tsx` | 367 | ensureSessionForTable | Session creation when seating party | Same as above |
| `src/app/api/orders/route.ts` | 399 | ensureSessionByTableUuid | Session resolution for dine-in orders | ✓ Uses service layer |
| `src/app/api/orders/route.ts` | 414–456 | db.insert(orders), db.insert(orderItems) | Order creation bypasses addItemsToOrder | **Documented as separate order channel** (pickup, delivery, external dine-in). See [POST-API-ORDERS-ANALYSIS.md](./POST-API-ORDERS-ANALYSIS.md). Dine-in POS uses addItemsToOrder; pickup/delivery have no session. |
| `src/app/actions/session-events.ts` | 84 | getOpenSessionIdForTable | Read/lookup in recordSessionEventByTable | Acceptable; read operation |

### 2. order-item-lifecycle.ts

| File | Line | Function Called | Issue | Recommended Replacement |
|------|------|-----------------|-------|-------------------------|
| *(none from UI/API)* | | | All order-item-lifecycle usage is via serviceActions | — |

### 3. seat-management.ts

| File | Line | Function Called | Issue | Recommended Replacement |
|------|------|-----------------|-------|-------------------------|
| `src/app/table/[id]/page.tsx` | 1023 | removeSeatBySessionAndNumber(sid, seatNumber) | Mutation: removes seat | Add `removeSeatBySessionAndNumber` to serviceActions (wrapping seat-management) or add `removeSeat(sessionId, seatNumber)` that resolves seatId and calls removeSeat |
| `src/app/table/[id]/page.tsx` | 1054 | renameSeatBySessionAndNumber(sid, seatNumber, newSeatNumber) | Mutation: renames seat | Add `renameSeatBySessionAndNumber` or `renameSeat(sessionId, seatNumber, newSeatNumber)` to serviceActions |

### 4. session-close-validation.ts

| File | Line | Function Called | Issue | Recommended Replacement |
|------|------|-----------------|-------|-------------------------|
| `src/app/table/[id]/page.tsx` | 652 | getSessionOutstandingItems(sid) | Read: fetches blocking reasons for close | Acceptable as read; optionally expose via service layer for consistency |

### 5. Direct DB mutations (bypassing all layers)

| File | Line | Operation | Issue | Recommended Replacement |
|------|------|-----------|-------|-------------------------|
| `src/app/api/orders/[id]/items/[itemId]/route.ts` | 148–156 | db.update(orderItems) for quantity/notes | Direct update of order_items | Add updateItemQuantity, updateItemNotes to serviceActions (with canModifyOrderItem check) and call from API |
| `src/app/api/orders/[id]/items/[itemId]/route.ts` | 270–273 | db.delete(orderItems) | Direct delete of order_item | Use voidItem from serviceActions instead of delete; or add removeItem to serviceActions if hard delete is required |
| `src/app/api/orders/[id]/items/[itemId]/route.ts` | 179–189 | db.update(orders) for totals | Recalculates order totals | Prefer recalculateOrderTotals from orderTotals; ensure called after any item change |

---

## Summary

- **Valid:** Table page mutations (add items, fire wave, close, void, serve, advance status) and KDS refire go through serviceActions.
- **Bypasses:** Table page calls createNextWave, ensureSession, removeSeatByNumber, renameSeat directly (some now routed). POST /api/orders creates orders via direct db.insert — documented as separate order channel (pickup/delivery/external dine-in).

---

## Read Operations (Informational)

The following are read/lookup operations. They do not mutate state; routing through serviceActions is optional for consistency:

- getOrderForTable
- getSeatsForSession
- getOpenSessionIdForTable
- getSessionOutstandingItems
