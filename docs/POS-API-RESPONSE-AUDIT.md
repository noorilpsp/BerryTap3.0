# POS API Response Envelope Audit

**Date:** 2025-02-24

**Standard envelope:**

- **Success:** `{ ok: true, data: <payload>, correlationId?: string }`
- **Failure:** `{ ok: false, error: { code: string, message: string }, correlationId?: string }`

---

## 1. Routes that follow the standard

These use `posSuccess` / `posFailure` and return the standard shape.

| Route | Method | Success response | Error response | Notes |
|-------|--------|------------------|----------------|-------|
| `POST /api/orders` | POST | `{ ok: true, data: {...} }` | `{ ok: false, error: { code, message } }` | Full standard |
| `PUT /api/orders/[id]` | PUT | `{ ok: true, data: { order } }` | `{ ok: false, error: { code, message } }` | Full standard |
| `DELETE /api/orders/[id]` | DELETE | `{ ok: true, data: {...} }` | `{ ok: false, error: { code, message } }` | Full standard |
| `POST /api/orders/[id]/items` | POST | `{ ok: true, data: <orderItem> }` | `{ ok: false, error: { code, message } }` | Full standard |
| `PUT /api/orders/[id]/items/[itemId]` | PUT | `{ ok: true, data: <orderItem> }` | `{ ok: false, error: { code, message } }` | Full standard |
| `DELETE /api/orders/[id]/items/[itemId]` | DELETE | `{ ok: true, data: { success: true } }` | `{ ok: false, error: { code, message } }` | Full standard |
| `POST /api/orders/[id]/items/[itemId]/refire` | POST | `{ ok: true, data: { success: true } }` | `{ ok: false, error: { code, message } }` | Full standard |
| `PUT /api/orders/[id]/status` | PUT | `{ ok: true, data: { order } }` | `{ ok: false, error: { code, message } }` | Full standard |
| `POST /api/orders/[id]/payments` | POST | `{ ok: true, data: <payment> }` | `{ ok: false, error: { code, message } }` | Full standard |
| `PUT /api/payments/[id]` | PUT | `{ ok: true, data: <payment> }` | `{ ok: false, error: { code, message } }` | Full standard |
| `POST /api/sessions/[sessionId]/waves/[waveNumber]/fire` | POST | `{ ok: true, data: {...} }` | `{ ok: false, error: { code, message } }` | Full standard |
| `POST /api/sessions/[sessionId]/waves/[waveNumber]/advance` | POST | `{ ok: true, data: {...} }` | `{ ok: false, error: { code, message } }` | Full standard |
| `POST /api/sessions/[sessionId]/close` | POST | `{ ok: true, data: { sessionId }, correlationId? }` | `{ ok: false, error: { code, message }, correlationId? }` | Full standard; only route passing correlationId |
| `POST /api/tables` | POST | `{ ok: true, data: { ...table } }` | `{ ok: false, error: { code, message } }` | Full standard |
| `PUT /api/tables/[id]` | PUT | `{ ok: true, data: { ...table } }` | `{ ok: false, error: { code, message } }` | Full standard |
| `DELETE /api/tables/[id]` | DELETE | `{ ok: true, data: { success: true } }` | `{ ok: false, error: { code, message } }` | Full standard |
| `POST /api/reservations` | POST | `{ ok: true, data: { ...reservation } }` | `{ ok: false, error: { code, message } }` | Full standard |
| `PUT /api/reservations/[id]` | PUT | `{ ok: true, data: { ...reservation } }` | `{ ok: false, error: { code, message } }` | Full standard |
| `DELETE /api/reservations/[id]` | DELETE | `{ ok: true, data: { success: true } }` | `{ ok: false, error: { code, message } }` | Full standard |

---

## 2. Routes that partially follow (mixed)

| Route | Method | Current success | Current error | Issue |
|-------|--------|-----------------|---------------|-------|
| `GET /api/orders/[id]` | GET | `{ order: transformedOrder }` (no ok, no data) | `{ error: string }` | Success: legacy shape. Errors: plain string, not `{ code, message }`. |

---

## 3. Routes with legacy shapes

| Route | Method | Current success | Current error | Differs from standard |
|-------|--------|-----------------|---------------|------------------------|
| `GET /api/orders` | GET | `{ orders: transformedOrders }` | `{ error: string }` | Success: no `ok`, no `data` wrapper; payload key `orders` instead of `data`. Error: `error` is string, not `{ code, message }`. |
| `GET /api/orders/[id]/timeline` | GET | `{ timeline: transformedTimeline }` | `{ error: string }` | Success: no `ok`, no `data`; payload key `timeline`. Error: `error` is string. |
| `GET /api/orders/[id]/payments` | GET | `paymentsList` (raw array) | `{ error: string }` | Success: returns raw array, no envelope at all. Error: string. |
| `GET /api/tables` | GET | `result` (raw array) | `{ error: string }` | Success: returns raw array. Error: string. |
| `GET /api/tables/[id]` | GET | `{ ...table, status }` (no ok, no data) | `{ error: string }` | Success: no envelope. Error: string. |
| `GET /api/reservations` | GET | `reservationsList` (raw array) | `{ error: string }` | Success: returns raw array. Error: string. |
| `GET /api/reservations/[id]` | GET | `reservation` (raw object) | `{ error: string }` | Success: returns raw object. Error: string. |

---

## Summary table

| Category | Count | Routes |
|----------|-------|--------|
| **Standard** | 19 | All mutation routes (POST/PUT/DELETE) that use posSuccess/posFailure; sessions fire/advance/close |
| **Partial** | 1 | GET /api/orders/[id] — uses NextResponse.json directly; mixed |
| **Legacy** | 7 | GET /api/orders, GET /api/orders/[id]/timeline, GET /api/orders/[id]/payments, GET /api/tables, GET /api/tables/[id], GET /api/reservations, GET /api/reservations/[id] |

---

## Per-route detail

### `GET /api/orders`
- **Success:** `{ orders: transformedOrders }`
- **Error:** `{ error: "string" }` (401, 400, 404, 403, 500)
- **Differs:** No `ok`, no `data`; `error` is string, not `{ code, message }`

### `POST /api/orders`
- **Success:** `{ ok: true, data: { order, orderId, sessionId, addedItemIds } }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `GET /api/orders/[id]`
- **Success:** `{ order: transformedOrder }`
- **Error:** `{ error: "string" }`
- **Differs:** No `ok`, no `data`; `error` is string

### `PUT /api/orders/[id]`
- **Success:** `{ ok: true, data: { order } }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `DELETE /api/orders/[id]`
- **Success:** `{ ok: true, data: { success: true, order } }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `POST /api/orders/[id]/items`
- **Success:** `{ ok: true, data: <orderItem> }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `PUT /api/orders/[id]/items/[itemId]`
- **Success:** `{ ok: true, data: updatedItem }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `DELETE /api/orders/[id]/items/[itemId]`
- **Success:** `{ ok: true, data: { success: true } }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `POST /api/orders/[id]/items/[itemId]/refire`
- **Success:** `{ ok: true, data: { success: true } }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `PUT /api/orders/[id]/status`
- **Success:** `{ ok: true, data: { order } }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `GET /api/orders/[id]/timeline`
- **Success:** `{ timeline: transformedTimeline }`
- **Error:** `{ error: "string" }`
- **Differs:** No `ok`, no `data`; `error` is string

### `GET /api/orders/[id]/payments`
- **Success:** `paymentsList` (raw array)
- **Error:** `{ error: "string" }`
- **Differs:** Success is raw array; error is string

### `POST /api/orders/[id]/payments`
- **Success:** `{ ok: true, data: newPayment }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `PUT /api/payments/[id]`
- **Success:** `{ ok: true, data: updatedPayment }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `POST /api/sessions/[sessionId]/waves/[waveNumber]/fire`
- **Success:** `{ ok: true, data: { sessionId, orderId, wave, firedAt, itemCount, affectedItems } }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `POST /api/sessions/[sessionId]/waves/[waveNumber]/advance`
- **Success:** `{ ok: true, data: { sessionId, orderId, wave, updatedItemIds, failed } }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `POST /api/sessions/[sessionId]/close`
- **Success:** `{ ok: true, data: { sessionId }, correlationId? }`
- **Error:** `{ ok: false, error: { code, message }, correlationId? }`
- **Standard:** Yes (only route using correlationId)

### `GET /api/tables`
- **Success:** `result` (raw array of tables)
- **Error:** `{ error: "string" }`
- **Differs:** Success is raw array; error is string

### `POST /api/tables`
- **Success:** `{ ok: true, data: { ...table } }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `GET /api/tables/[id]`
- **Success:** `{ ...table, status }`
- **Error:** `{ error: "string" }`
- **Differs:** No envelope on success; error is string

### `PUT /api/tables/[id]`
- **Success:** `{ ok: true, data: { ...table } }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `DELETE /api/tables/[id]`
- **Success:** `{ ok: true, data: { success: true } }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `GET /api/reservations`
- **Success:** `reservationsList` (raw array)
- **Error:** `{ error: "string" }`
- **Differs:** Success is raw array; error is string

### `POST /api/reservations`
- **Success:** `{ ok: true, data: { ...reservation } }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `GET /api/reservations/[id]`
- **Success:** `reservation` (raw object)
- **Error:** `{ error: "string" }`
- **Differs:** Success is raw object; error is string

### `PUT /api/reservations/[id]`
- **Success:** `{ ok: true, data: { ...updatedReservation } }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes

### `DELETE /api/reservations/[id]`
- **Success:** `{ ok: true, data: { success: true } }`
- **Error:** `{ ok: false, error: { code, message } }`
- **Standard:** Yes
