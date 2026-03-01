# POS System Status Report

**Branch:** current  
**Generated:** 2026-03-01  
**Scope:** Point-of-sale flows, architecture, API surface, data model, known failures.

---

## 1. Golden Flows and Current Health

### Table Flow: ensure session → add items → fire wave → advance wave → close session

| Step | Status | File + Route/Function | Notes |
|------|--------|-----------------------|-------|
| **Ensure session** | ✅ working | `src/app/table/[id]/page.tsx` → `fetchPos("/api/sessions/ensure")` | Seat party and add-items flows both use `fetchPos` with Idempotency-Key. **Requires staff:** user must have an active `staff` row for the location; otherwise returns 403 "You are not staff at this location". Run `npm run seed:staff` to create staff for merchant users. |
| **Add items** | ✅ working | `src/app/table/[id]/page.tsx:1481` → `fetchPos("/api/orders")` | Table page uses `fetchPos` (adds Idempotency-Key). API delegates to `createOrderFromApi` → `addItemsToOrder` in `src/domain/serviceActions.ts`. |
| **Fire wave** | ✅ working | `src/app/table/[id]/page.tsx:1103` → `fetchPos("/api/sessions/{sid}/waves/{waveNumber}/fire")` | Uses `fetchPos`. Route → `fireWave` in `src/domain/serviceActions.ts`. |
| **Advance wave** | ✅ working | `src/app/table/[id]/page.tsx:1272` → `fetchPos("/api/sessions/{sid}/waves/{waveNumber}/advance")` | Uses `fetchPos`. Response parsing fixed to use `payload.data.failed`. |
| **Close session** | ✅ working | `src/app/table/[id]/page.tsx:1605` → `fetchPos("/api/sessions/{sid}/close")` | Uses `fetchPos`. Route → `closeSessionService` in `src/domain/serviceActions.ts`. |
| **Add next wave** | ✅ working | `src/app/table/[id]/page.tsx` → `fetchPos("/api/sessions/{sid}/waves/next")` | Uses `fetchPos` with Idempotency-Key.

---

### KDS Flow: list orders → mark preparing/ready/served → refire

| Step | Status | File + Route/Function | Notes |
|------|--------|-----------------------|-------|
| **List orders** | ✅ working | `src/app/kds/page.tsx` → `fetch("/api/kds/orders?locationId=...")` | Uses standard envelope `{ ok, data: { orders } }` / `{ ok: false, error }`. |
| **Mark preparing/ready/served** | ✅ working | `src/app/kds/page.tsx` → `fetchPos("/api/orders/.../items/...", { method: "PUT" })` | Uses `fetchPos` with Idempotency-Key and `eventSource: "kds"`. |
| **Refire** | ✅ working | `src/app/kds/page.tsx` → `fetchPos("/api/orders/.../items/.../refire", { method: "POST" })` | Uses `fetchPos` with Idempotency-Key and `eventSource: "kds"`. |

---

## 2. Current Architecture Map (Actual)

### Mutation call chains

**Table page (UI → API):**

| Action | UI Call | API Route | Domain/DB |
|--------|---------|-----------|-----------|
| Ensure session (add flow) | `fetchPos("/api/sessions/ensure")` | `POST /api/sessions/ensure` | `ensureSessionByTableUuid` → `getOrCreateSessionForTable` |
| Ensure session (seat party) | `fetchPos("/api/sessions/ensure")` | `POST /api/sessions/ensure` | Same as add flow |
| Add items | `fetchPos("/api/orders")` | `POST /api/orders` | `createOrderFromApi` → `addItemsToOrder` |
| Fire wave | `fetchPos("/api/sessions/.../fire")` | `POST /api/sessions/[sessionId]/waves/[waveNumber]/fire` | `fireWave` |
| Advance wave | `fetchPos("/api/sessions/.../advance")` | `POST /api/sessions/[sessionId]/waves/[waveNumber]/advance` | `advanceWaveStatus` |
| Close session | `fetchPos("/api/sessions/.../close")` | `POST /api/sessions/[sessionId]/close` | `closeSessionService` |
| Add wave | `fetchPos("/api/sessions/.../waves/next")` | `POST /api/sessions/[sessionId]/waves/next` | `createNextWaveForSession` |
| Mark item served | `fetchPos("/api/orders/.../items/...")` | `PUT /api/orders/[id]/items/[itemId]` | `serveItem` |
| Persist layout | `fetchPos("/api/tables/.../layout")` | `PUT /api/tables/[id]/layout` | `updateTableLayout` |
| Rename seat | `fetchPos("/api/sessions/.../seats/.../rename")` | `PUT /api/sessions/.../seats/.../rename` | `renameSeat` |
| Remove seat | `fetchPos("/api/sessions/.../seats/...")` | `DELETE /api/sessions/.../seats/...` | `removeSeatByNumber` |
| Record event | `fetchPos("/api/sessions/.../events")` | `POST /api/sessions/.../events` | `recordEventWithSource` |

**KDS page (UI → API):**

| Action | UI Call | API Route | Domain/DB |
|--------|---------|-----------|-----------|
| List orders | `fetch("/api/kds/orders")` | `GET /api/kds/orders` | Direct `db.query` in route |
| Mark status | `fetchPos("/api/orders/.../items/...")` | `PUT` | `markItemPreparing/markItemReady/serveItem` |
| Refire | `fetchPos("/api/orders/.../items/.../refire")` | `POST` | `refireItem` |

**API routes → domain layer:**  
All POS mutation routes use `posSuccess`/`posFailure` and delegate to domain (`serviceActions`, `orders`, `order-item-lifecycle`). No direct DB writes in route handlers.

### Screens that still call domain directly (reads only; no writes)

| Screen | Domain Calls | Purpose |
|--------|--------------|---------|
| **Table page** | `getOrderForTable`, `getOrderIdForSessionAndWave`, `getOpenSessionIdForTable`, `getSeatsForSession`, `getSessionOutstandingItems`, `checkKitchenDelays` | Reads only; all writes via POS API |
| **Floor map** | None | All writes via POS API |
| **KDS** | None | Uses API only |

**Zero UI domain writes:** Layout, seats, events all go through POS API routes. See `check:pos-no-domain-writes`.

---

## 3. API Surface Inventory (POS Only)

### GET endpoints

| Endpoint | posSuccess/posFailure | Idempotency-Key | Direct DB in route |
|----------|------------------------|-----------------|---------------------|
| `GET /api/orders` | ✅ (posSuccess) | N/A | No (db.query only) |
| `GET /api/orders/[id]` | ✅ (posSuccess) | N/A | No |
| `GET /api/orders/[id]/timeline` | ✅ (posSuccess) | N/A | No |
| `GET /api/orders/[id]/payments` | ✅ (posSuccess) | N/A | No |
| `GET /api/tables` | ✅ (posSuccess) | N/A | No |
| `GET /api/tables/[id]` | ✅ (posSuccess) | N/A | No |
| `GET /api/reservations` | ✅ (posSuccess) | N/A | No |
| `GET /api/reservations/[id]` | ✅ (posSuccess) | N/A | No |
| `GET /api/kds/orders` | ✅ (posSuccess/posFailure) | N/A | No (db.query only) |
| `GET /api/items` | ✅ (posSuccess) | N/A | No |
| `GET /api/categories` | ✅ (posSuccess) | N/A | No |
| `GET /api/customizations` | ✅ (posSuccess) | N/A | No |

### POST/PUT/DELETE endpoints (mutations)

| Endpoint | posSuccess/posFailure | Idempotency-Key | Direct DB in route |
|----------|------------------------|-----------------|---------------------|
| `POST /api/sessions/ensure` | ✅ | Yes | No |
| `POST /api/sessions/[sessionId]/waves/next` | ✅ | Yes | No |
| `POST /api/sessions/[sessionId]/waves/[waveNumber]/fire` | ✅ | Yes | No |
| `POST /api/sessions/[sessionId]/waves/[waveNumber]/advance` | ✅ | Yes | No |
| `PUT /api/sessions/[sessionId]/seats/[seatNumber]/rename` | ✅ | Yes | No |
| `DELETE /api/sessions/[sessionId]/seats/[seatNumber]` | ✅ | Yes | No |
| `POST /api/sessions/[sessionId]/events` | ✅ | Yes | No |
| `POST /api/sessions/[sessionId]/close` | ✅ | Yes | No |
| `POST /api/orders` | ✅ | Yes | No |
| `PUT /api/orders/[id]` | ✅ | Yes | No |
| `DELETE /api/orders/[id]` | ✅ | Yes | No |
| `PUT /api/orders/[id]/status` | ✅ | Yes | No |
| `POST /api/orders/[id]/items` | ✅ | Yes | No |
| `PUT /api/orders/[id]/items/[itemId]` | ✅ | Yes | No |
| `DELETE /api/orders/[id]/items/[itemId]` | ✅ | Yes | No |
| `POST /api/orders/[id]/items/[itemId]/refire` | ✅ | Yes | No |
| `POST /api/orders/[id]/payments` | ✅ | Yes | No |
| `PUT /api/payments/[id]` | ✅ | Yes | No |
| `POST /api/tables` | ✅ | Yes | No |
| `PUT /api/tables/[id]` | ✅ | Yes | No |
| `PUT /api/tables/[id]/layout` | ✅ | Yes | No |
| `DELETE /api/tables/[id]` | ✅ | Yes | No |
| `POST /api/reservations` | ✅ | Yes | No |
| `PUT /api/reservations/[id]` | ✅ | Yes | No |
| `DELETE /api/reservations/[id]` | ✅ | Yes | No |

---

## 4. Data-Model Integrity Checks

### Likely required seed records for a working POS demo

| Record Type | Purpose | Schema / Check |
|-------------|---------|----------------|
| **Location** | Base for tables, menu, staff | `merchant_locations` |
| **Tables** | Tables with UUID + display/table_number | `tables` (`id` uuid, `table_number`, `display_id`, `location_id`) |
| **Staff** | Maps user → location; required for `ensureSession` | `staff` (`user_id`, `location_id`, `is_active`). Run `npm run seed:staff` to create staff for merchant users (idempotent). |
| **Menu items** | Items for add-to-order | `items` (`location_id`) |
| **Merchant user** | Access to merchant | `merchant_users` (`merchant_id`, `user_id`, `is_active`) |
| **Service period** | Optional for session creation | `service_periods` (can be null) |

### Table ID vs UUID

- `ensureSessionByTableUuid` and `getOpenSessionIdForTable` both accept:
  - **UUID** (`tables.id`) — exact match
  - **display_id** — case-insensitive
  - **table_number** — case-insensitive
- Examples: `getOpenSessionIdForTable("t6")`, `getOpenSessionIdForTable("<uuid>")`, `getOpenSessionIdForTable("T6")` all resolve correctly.

### Quick existence checks (SQL-ish / Drizzle)

```sql
-- Location exists
SELECT id FROM merchant_locations LIMIT 1;

-- Tables with UUID + table_number
SELECT id, table_number, display_id, location_id FROM tables WHERE location_id = ?;

-- Staff for current user
SELECT s.id FROM staff s
JOIN merchant_locations ml ON s.location_id = ml.id
WHERE s.user_id = :userId AND s.location_id = :locationId AND s.is_active = true;

-- Menu items
SELECT id, name FROM items WHERE location_id = ? LIMIT 5;

-- Merchant user membership
SELECT id FROM merchant_users WHERE merchant_id = ? AND user_id = ? AND is_active = true;
```

```ts
// Drizzle equivalents (from app/actions/orders.ts pattern)
const staffId = await db.query.staff.findFirst({
  where: and(
    eq(staff.userId, userId),
    eq(staff.locationId, locationId),
    eq(staff.isActive, true)
  ),
  columns: { id: true },
});
```

---

## 5. Known Current Failures

### Runtime / POS route behavior

| Issue | Cause | Impact |
|-------|-------|--------|
| **Sessions require staff** | `ensureSessionByTableUuid` → `getStaffIdForUser`; if no active `staff` row for (userId, locationId), returns 403 "You are not staff at this location" | Seating and add-items fail with user-visible error (table: `setWarningDialog`; floor map: `toast.error`). Run `npm run seed:staff` to fix. |
| **sessions.server_id FK** | `sessions.serverId` references `staff.id`. `getOrCreateSessionForTable` sets `serverId: staffId ?? null`, so null is fine. No FK violation if staff exists. | Low risk if staff is seeded. |
| **Idempotency-Key missing** | ~~Seating, add-wave, KDS PUT/refire~~ — Fixed: all now use `fetchPos`. | — |

### Build output

- **Build:** Succeeds (`npm run build` completes).
- **Warnings:** `baseline-browser-mapping` outdated, `metadataBase` not set, `next-image-unconfigured-qualities` — not POS-related.
- **POS-related build failures:** None observed.

---

## 6. Prioritized Fix List (max 10)

| # | Why it matters | Smallest fix | Exact file(s) | Verification |
|---|----------------|--------------|---------------|--------------|
| ~~1–4~~ | ~~Seat Party, Add Wave, KDS status, KDS refire~~ | — | — | **Done:** all now use `fetchPos`. |
| ~~5~~ | ~~Staff mapping required~~ | — | — | **Done:** `npm run seed:staff` creates staff for merchant users. 403 surfaced in table/floor map UI. |
| ~~6~~ | ~~Table ID mismatch~~ | — | — | **Done:** `getOpenSessionIdForTable` now supports UUID, display_id, table_number (case-insensitive). |
| ~~7~~ | ~~GET /api/kds/orders envelope~~ | — | — | **Done:** Uses `posSuccess`/`posFailure`; KDS page parses `payload.data.orders`. |
| ~~8~~ | ~~Seeding for demo~~ | — | — | **Done:** `npm run seed:menu` (items), `npm run seed:staff`, `npm run seed:orders` |
| ~~9~~ | ~~Legacy GET envelope~~ | — | — | **Done:** items, categories, customizations normalized. See `docs/POS-GET-ENVELOPE-RECHECK.md`. |
| 10 | **baseline-browser-mapping** | `npm i baseline-browser-mapping@latest -D` | `package.json` | Reduces build warnings |

---

*Report reflects current state of the codebase. No redesign or architectural changes applied.*
