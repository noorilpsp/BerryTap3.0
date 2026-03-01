# POS API Mutations (Current Code)

Documented from current route handlers in `src/app/api/**` as implemented today.
This is a factual snapshot (no redesign).

## Idempotency-Key (Required for mutations)

**Idempotency-Key is REQUIRED for all POS mutation routes (POST/PUT/DELETE).**  
GET routes do not require this header.

If the header is missing on a mutation, the API returns `BAD_REQUEST` (400) with message `Missing Idempotency-Key`.

The idempotency key must be a unique string per logical request (e.g. UUID). For retries with the same key and identical request body (and path params where applicable), the API returns the same response as the first successful call. If the same key is used with a different request body, the API returns `CONFLICT` (409).

**Example:**
```http
POST /api/orders HTTP/1.1
Content-Type: application/json
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000

{ "locationId": "...", "items": [...], ... }
```

**Endpoints that enforce Idempotency-Key (as of this doc):**
- POST /api/orders
- POST /api/sessions/[sessionId]/close

---

## Response Envelope

All POS API routes use the standard envelope:

**Success:** `{ ok: true, data: <payload>, correlationId?: string }`

**Failure:** `{ ok: false, error: { code: string, message: string }, correlationId?: string }`

Error codes: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `BAD_REQUEST`, `CONFLICT`, `INTERNAL_ERROR`.

---

## Sessions

### POST /api/sessions/[sessionId]/close
- Method: `POST`
- Headers: `Idempotency-Key` (required)
- Purpose: Close an open session (optionally with payment + force option)
- Body:
```json
{
  "payment": {
    "amount": "number",
    "tipAmount": "number (optional)",
    "method": "card|cash|mobile|other (optional)"
  },
  "options": {
    "force": "boolean (optional)"
  },
  "eventSource": "unknown (accepted but not used by route logic)"
}
```
- Response:
```json
{ "ok": true, "data": { "sessionId": "string" }, "correlationId": "string|undefined" }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" }, "correlationId": "string|undefined" }
```
- Domain:
```ts
closeSessionService(sessionId, payment, options)
```

## Orders

### POST /api/orders
- Method: `POST`
- Headers: `Idempotency-Key` (required)
- Purpose: Create order (dine-in / pickup / delivery)
- Body:
```json
{
  "locationId": "string",
  "customerId": "string|null (optional)",
  "sessionId": "string|null (optional)",
  "tableId": "string|null (optional)",
  "reservationId": "string|null (optional)",
  "assignedStaffId": "string|null (optional)",
  "orderType": "dine_in|pickup|delivery",
  "paymentTiming": "pay_first|pay_later",
  "guestCount": "number (optional)",
  "notes": "string|null (optional)",
  "eventSource": "table_page|kds|api|system (optional)",
  "items": "array (required)"
}
```
- Response:
```json
{
  "ok": true,
  "data": {
    "order": "order with relations",
    "orderId": "string",
    "sessionId": "string|null",
    "addedItemIds": ["string", "..."]
  }
}
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
createOrderFromApi({ ...body, changedByUserId: user.id })
```

### PUT /api/orders/[id]
- Method: `PUT`
- Purpose: Update order fields
- Body:
```json
{
  "customerId": "string|null (optional)",
  "tableId": "string|null (optional)",
  "reservationId": "string|null (optional)",
  "assignedStaffId": "string|null (optional)",
  "notes": "string|null (optional)"
}
```
- Response:
```json
{ "ok": true, "data": { "order": "updated order row|null" } }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
updateOrder(id, patch)
```

### DELETE /api/orders/[id]
- Method: `DELETE`
- Purpose: Cancel order
- Body: none
- Response:
```json
{ "ok": true, "data": { "success": true, "order": "cancelled order row|null" } }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
cancelOrder(id, user.id)
```

### PUT /api/orders/[id]/status
- Method: `PUT`
- Purpose: Update order status
- Body:
```json
{
  "status": "string (required)",
  "note": "string (optional)",
  "changedByStaffId": "string (optional)"
}
```
- Response:
```json
{ "ok": true, "data": { "order": "updated order row|null" } }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
updateOrderStatus(id, {
  status,
  note,
  changedByStaffId,
  changedByUserId: user.id
})
```

## Items

### POST /api/orders/[id]/items
- Method: `POST`
- Purpose: Add item to an existing order
- Body:
```json
{
  "itemId": "string (required)",
  "quantity": "number (required)",
  "notes": "string (optional)",
  "customizations": [
    {
      "groupId": "string (optional)",
      "optionId": "string (optional)",
      "quantity": "number (optional)"
    }
  ]
}
```
- Response:
```json
{ "ok": true, "data": "order item row object" }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
addItemToExistingOrder(id, {
  itemId,
  quantity: Number(quantity),
  notes,
  customizations
})
```

### PUT /api/orders/[id]/items/[itemId]
- Method: `PUT`
- Purpose: Update item status and/or quantity and/or notes
- Body:
```json
{
  "status": "preparing|ready|served (optional)",
  "quantity": "number (optional)",
  "notes": "string (optional)",
  "eventSource": "table_page|kds|system|api (optional)"
}
```
- Response:
```json
{ "ok": true, "data": "updated order item row|null" }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
// Conditional, based on fields present
markItemPreparing(itemId)
markItemReady(itemId, { eventSource })
serveItem(itemId, { eventSource })
updateItemQuantity(itemId, quantity)
updateItemNotes(itemId, notes)
```

### DELETE /api/orders/[id]/items/[itemId]
- Method: `DELETE`
- Purpose: Void/remove item
- Body:
```json
{
  "reason": "string (optional, default: \"Removed via API\")",
  "eventSource": "table_page|kds|system|api (optional)"
}
```
- Response:
```json
{ "ok": true, "data": { "success": true } }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
voidItem(itemId, reason, { eventSource })
```

### POST /api/orders/[id]/items/[itemId]/refire
- Method: `POST`
- Purpose: Refire an item
- Body:
```json
{
  "reason": "string (optional, default: \"Refired via API\")"
}
```
- Response:
```json
{ "ok": true, "data": { "success": true } }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
refireItem(itemId, reason, { eventSource: "api" })
```

## Waves

### POST /api/sessions/[sessionId]/waves/[waveNumber]/fire
- Method: `POST`
- Purpose: Fire a session wave/course
- Body:
```json
{ "eventSource": "table_page|kds|system|api (optional)" }
```
- Response:
```json
{
  "ok": true,
  "data": {
    "sessionId": "string",
    "orderId": "string",
    "wave": "number",
    "firedAt": "string|date",
    "itemCount": "number",
    "affectedItems": ["string", "..."]
  }
}
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
fireWave(sessionId, { waveNumber, eventSource })
```

### POST /api/sessions/[sessionId]/waves/[waveNumber]/advance
- Method: `POST`
- Purpose: Advance all items in a wave to `preparing|ready|served`
- Body:
```json
{
  "toStatus": "preparing|ready|served",
  "eventSource": "table_page|kds|system|api (optional)"
}
```
- Response:
```json
{
  "ok": true,
  "data": {
    "sessionId": "string",
    "orderId": "string",
    "wave": "number",
    "updatedItemIds": ["string", "..."],
    "failed": []
  }
}
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
advanceWaveStatus(sessionId, waveNumber, toStatus, { eventSource })
```

## Payments

### POST /api/orders/[id]/payments
- Method: `POST`
- Purpose: Add payment to an order
- Body:
```json
{
  "amount": "number (required)",
  "tipAmount": "number (optional)",
  "method": "string (required)",
  "provider": "string (optional)",
  "providerTransactionId": "string (optional)",
  "providerResponse": "unknown (optional)"
}
```
- Response:
```json
{ "ok": true, "data": "payment row object" }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
addPayment(orderId, {
  amount: Number(amount),
  tipAmount,
  method,
  provider,
  providerTransactionId,
  providerResponse
})
```

### PUT /api/payments/[id]
- Method: `PUT`
- Purpose: Update payment status
- Body:
```json
{ "status": "string (required)" }
```
- Response:
```json
{ "ok": true, "data": "updated payment row object|null" }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
updatePayment(paymentId, status)
```

## Tables

### POST /api/tables
- Method: `POST`
- Purpose: Create table
- Body:
```json
{
  "locationId": "string (required)",
  "tableNumber": "string (required)",
  "seats": "number|null (optional)",
  "status": "string (optional)"
}
```
- Response:
```json
{ "ok": true, "data": "table row object" }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
createTableMutation({ locationId, tableNumber, seats, status })
```

### PUT /api/tables/[id]
- Method: `PUT`
- Purpose: Update table
- Body:
```json
{
  "tableNumber": "string (optional)",
  "seats": "number (optional)",
  "status": "string (optional)"
}
```
- Response:
```json
{ "ok": true, "data": "updated table row object" }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
updateTableMutation(locationId, tableId, { tableNumber, seats, status })
```

### DELETE /api/tables/[id]
- Method: `DELETE`
- Purpose: Delete table
- Body: none
- Response:
```json
{ "ok": true, "data": { "success": true } }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
deleteTableMutation(locationId, tableId)
```

## Reservations

### POST /api/reservations
- Method: `POST`
- Purpose: Create reservation
- Body:
```json
{
  "locationId": "string (required)",
  "customerId": "string|null (optional)",
  "tableId": "string|null (optional)",
  "partySize": "number (required)",
  "reservationDate": "string (required)",
  "reservationTime": "string (required)",
  "status": "string (optional)",
  "customerName": "string (required)",
  "customerPhone": "string|null (optional)",
  "customerEmail": "string|null (optional)",
  "notes": "string|null (optional)"
}
```
- Response:
```json
{ "ok": true, "data": "reservation row object" }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
createReservationMutation({...})
```

### PUT /api/reservations/[id]
- Method: `PUT`
- Purpose: Update reservation
- Body:
```json
{
  "customerId": "string (optional)",
  "tableId": "string (optional)",
  "partySize": "number (optional)",
  "reservationDate": "string (optional)",
  "reservationTime": "string (optional)",
  "status": "string (optional)",
  "customerName": "string (optional)",
  "customerPhone": "string (optional)",
  "customerEmail": "string (optional)",
  "notes": "string (optional)"
}
```
- Response:
```json
{ "ok": true, "data": "updated reservation row object" }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
updateReservationMutation(locationId, reservationId, patch)
```

### DELETE /api/reservations/[id]
- Method: `DELETE`
- Purpose: Delete reservation
- Body: none
- Response:
```json
{ "ok": true, "data": { "success": true } }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
- Domain:
```ts
deleteReservationMutation(locationId, reservationId)
```

---

## Reads (GET)

All GET endpoints use the same envelope. Query params and `data` payload shape below.

### GET /api/orders
- Query: `locationId` (required), `status?`, `orderType?`, `date?`, `startDate?`, `endDate?`
- Response:
```json
{ "ok": true, "data": { "orders": [...] } }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```

### GET /api/orders/[id]
- Response:
```json
{ "ok": true, "data": { "order": {...} } }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```

### GET /api/orders/[id]/timeline
- Response:
```json
{ "ok": true, "data": { "timeline": [...] } }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```

### GET /api/orders/[id]/payments
- Response:
```json
{ "ok": true, "data": [...] }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
Note: `data` is the payments array.

### GET /api/tables
- Query: `locationId` (required), `status?`
- Response:
```json
{ "ok": true, "data": [...] }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
Note: `data` is the tables array.

### GET /api/tables/[id]
- Response:
```json
{ "ok": true, "data": { "...table", "status": "string" } }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```

### GET /api/reservations
- Query: `locationId` (required), `status?`, `date?`, `startDate?`, `endDate?`
- Response:
```json
{ "ok": true, "data": [...] }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
Note: `data` is the reservations array.

### GET /api/reservations/[id]
- Response:
```json
{ "ok": true, "data": {...} }
```
or
```json
{ "ok": false, "error": { "code": "string", "message": "string" } }
```
