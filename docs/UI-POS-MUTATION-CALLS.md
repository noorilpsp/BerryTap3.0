# UI POS Mutation Calls Audit

**Scanned:** `src/app/table/[id]/page.tsx`, `src/app/kds/page.tsx`, `src/app/floor-map/page.tsx`  
**Purpose:** Catalog every write/mutation action, transport (fetch vs domain), response parsing, Idempotency-Key, and eventSource. Reflects current code (aligned with docs/POS-STATUS-REPORT.md).

---

## 1. Table Page (`src/app/table/[id]/page.tsx`)

### Mutations via API (fetchPos)

| Action | Endpoint | Method | Idempotency-Key | eventSource | Response parsing | ok:false handling |
|--------|----------|--------|-----------------|-------------|------------------|-------------------|
| **Ensure session** (add-items flow) | `/api/sessions/ensure` | POST | ✅ (fetchPos) | ✅ `table_page` | `payload.data.sessionId` | Throws → `setWarningDialog` "Failed to create session" |
| **Ensure session** (seat party) | `/api/sessions/ensure` | POST | ✅ (fetchPos) | ✅ `table_page` | `payload.data.sessionId` | Throws → `setWarningDialog` "Failed to seat party" |
| **Add items** | `/api/orders` | POST | ✅ (opts) | ✅ `table_page` | `payload.data` (sessionId, orderId, addedItemIds) | No optimistic mutations pre-response; concurrency guard prevents double submit; `setWarningDialog` on fail |
| **Fire wave** | `/api/sessions/{sid}/waves/{n}/fire` | POST | ✅ (fetchPos) | ✅ `table_page` | None | Revert + `setWarningDialog` "Failed to fire wave" |
| **Advance wave status** | `/api/sessions/{sid}/waves/{n}/advance` | POST | ✅ (fetchPos) | ✅ `table_page` | `payload.data.failed` for rollback | Restores failed item statuses; no toast |
| **Mark item served** | `/api/orders/{orderId}/items/{itemId}` | PUT | ✅ (fetchPos) | ✅ `table_page` | None | Revert + `setWarningDialog` "Failed to mark served" |
| **Void item** | `/api/orders/{orderId}/items/{itemId}` | DELETE | ✅ (fetchPos) | ✅ `table_page` | None | Revert + `setWarningDialog` "Failed to void item" |
| **Close session** | `/api/sessions/{sid}/close` | POST | ✅ (opts) | ✅ `table_page` | `payload.ok`, `payload.reason`, `payload.error` | `setWarningDialog` with context-specific message |
| **Add wave** | `/api/sessions/{sid}/waves/next` | POST | ✅ (fetchPos) | ✅ `table_page` | `payload.data` | Revert wave count + `setWarningDialog` "Failed to add wave" |
| **Persist table layout** | `/api/tables/{id}/layout` | PUT | ✅ (fetchPos) | — | — | Fire-and-forget; `.catch` logs only |
| **Rename seat** | `/api/sessions/{sid}/seats/{n}/rename` | PUT | ✅ (fetchPos) | ✅ `table_page` | — | `setWarningDialog` on fail |
| **Remove seat** | `/api/sessions/{sid}/seats/{n}` | DELETE | ✅ (fetchPos) | ✅ `table_page` | — | `setWarningDialog` on fail |
| **Record event** (guest_seated, item_ready, served, payment_completed, bill_requested) | `/api/sessions/{sid}/events` | POST | ✅ (fetchPos) | ✅ `table_page` | — | Fire-and-forget; dev-only `console.warn` on failure |

### Local-only (no DB)

| Action | Behavior |
|--------|----------|
| `handleDeleteWave` | Local state only |
| `handleAddSeat` | Local state only |
| `closeOrder` (store) | Client store only |

---

## 2. KDS Page (`src/app/kds/page.tsx`)

### Reads via API (fetch)

| Action | Endpoint | Method | Response parsing | ok:false handling |
|--------|----------|--------|------------------|-------------------|
| **List orders** | `/api/kds/orders?locationId=...` | GET | `payload.data.orders` | Falls back to `[]` when `!payload.ok` |

### Mutations via API (fetchPos)

| Action | Endpoint | Method | Idempotency-Key | eventSource | Response parsing | ok:false handling |
|--------|----------|--------|-----------------|-------------|------------------|-------------------|
| **Mark item status** (preparing/ready/served) | `/api/orders/{id}/items/{itemId}` | PUT | ✅ (fetchPos) | ✅ `kds` | Checks `res.ok && p?.ok` | Revert orders + `toast.error` "Failed to update item status" |
| **Refire item** | `/api/orders/{id}/items/{itemId}/refire` | POST | ✅ (fetchPos) | ✅ `kds` | Checks `res.ok && p?.ok` | Remove remake + `toast.error` "Failed to refire item" |

---

## 3. Floor Map (`src/app/floor-map/page.tsx`)

### Mutations via API (fetchPos)

| Action | Endpoint | Method | Idempotency-Key | eventSource | Response parsing | ok:false handling |
|--------|----------|--------|-----------------|-------------|------------------|-------------------|
| **Ensure session** | `/api/sessions/ensure` | POST | ✅ (fetchPos) | ✅ `table_page` | `payload.data.sessionId` | Throws → `toast.error` |
| **Record event** (guest_seated) | `/api/sessions/{sid}/events` | POST | ✅ (fetchPos) | ✅ `table_page` | — | Fire-and-forget; dev-only `console.warn` on failure |

### Client Store Only (no DB)

| Action | Behavior |
|--------|----------|
| `store.updateTable` | Client store |
| `store.openOrderForTable` | Client store |

---

## 4. Response Parsing Summary

| Caller | Expects | API shape |
|--------|---------|-----------|
| Table ensure (add flow) | `payload.data.sessionId` | `{ ok, data: { sessionId, tableUuid } }` ✅ |
| Table ensure (seat party) | `payload.data.sessionId` | Same ✅ |
| Table add items | `data.sessionId`, `data.orderId`, `data.addedItemIds` | `{ ok, data: { order, orderId, sessionId, addedItemIds } }` ✅ |
| Table advance wave | `payload.data.failed` | `{ ok, data: { failed } }` ✅ |
| Table close | `payload.ok`, `payload.reason`, `payload.error` | `{ ok, data }` / `{ ok: false, error: { code, message } }` ✅ |
| KDS list | `payload.data.orders` | `{ ok, data: { orders } }` ✅ |
| KDS PUT/refire | `res.ok`, `p?.ok` | `{ ok, data }` / `{ ok: false, error }` — checked, revert on fail ✅ |

---

## 5. Consistency Notes

### All mutations use fetchPos (Idempotency-Key)

- Table page: ensure, add items, fire wave, advance wave, mark served, void, close, add wave — all use `fetchPos` → Idempotency-Key added automatically.
- Floor map: ensure session — uses `fetchPos` → Idempotency-Key added automatically.
- KDS: mark status, refire — both use `fetchPos`.

### ok:false handling

- Table: fire wave, mark served, void, close, add wave, ensure (both flows), add items — revert optimistic state and show `setWarningDialog` on failure.
- KDS: mark status, refire — revert and `toast.error`.
- Floor map: ensure session via `POST /api/sessions/ensure` — `toast.error` on `ok: false`.

### Domain reads only (no domain writes from UI)

| Caller | Domain fn | Purpose |
|--------|-----------|---------|
| Table | `getOrderForTable`, `getOrderIdForSessionAndWave`, `getOpenSessionIdForTable`, `getSeatsForSession`, `getSessionOutstandingItems`, `checkKitchenDelays` | Reads, session resolution |
| Floor map | (none) | All writes via API |

**Zero UI domain writes:** Table page and floor map perform no direct domain write calls. All writes go through POS API routes (fetchPos). See `check:pos-no-domain-writes`.

### Recent reliability updates

- **Add items** — no optimistic mutations pre-response; `addItemsInFlightRef` prevents double submit; on failure returns early with `setWarningDialog`, no partial state.
- **Ensure session** — add-items flow sends `eventSource: "table_page"` (consistent with seat-party and floor map).
- **Telemetry** — events via `POST /api/sessions/{sid}/events`; fire-and-forget; dev-only `console.warn` on failure.
- **Seed** — `npm run seed:pos` runs staff → menu → orders without shell; stops on first failure.
- **Zero domain writes** — layout, seats, events all via POS API; `check:pos-no-domain-writes` enforces.
