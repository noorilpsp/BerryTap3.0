# POS-style data model (sessions + orders/waves)

## Overview

The restaurant data model is refactored to align with professional POS systems:

- **tables** – Physical table layout (section, shape, position, capacity). **Table status is derived from sessions** via `computeTableStatus(tableId)`: no open session → available; open session → occupied; session closed within last 5 min → cleaning; else → available. The `tables.status` column is a legacy cache; source of truth is sessions.
- **service_periods** – Time windows per location (e.g. Breakfast 08:00–11:00, Lunch 14:00–17:00). Columns: location_id, name, start_time, end_time. Sessions get `service_period_id` assigned at creation based on current time (for analytics).
- **sessions** – One dining visit per table. **At most one open session per table** (enforced by partial unique index). Holds: locationId, tableId, serverId, guestCount, **servicePeriodId** (optional), openedAt, closedAt, status, source.
- **session_events** – Operational events per session. Columns: session_id, type, created_at, **actor_type** (server | kitchen | system | runner | customer), **actor_id** (uuid), meta (jsonb). Indexes: (session_id, type), (session_id, actor_type), (actor_id).
- **seats** – One row per guest position in a session. Columns: session_id, seat_number, status (active | removed), guest_name (nullable). Unique (session_id, seat_number). Removed seats are never deleted if order_items reference them.
- **orders** – Waves/fires within a session. Each order has sessionId, wave number, status, firedAt, completedAt, station (for KDS).
- **order_items** – Line items per order (wave), with timing: **seat_id** (primary for seat assignment), legacy **seat** (fallback), sentToKitchenAt, startedAt, readyAt, servedAt, **voidedAt**, **refiredAt**, **station_override** (e.g. "grill", "fryer", "bar" for multi-station tickets). Kitchen timestamps validated (CHECK). seat_id session constraint: seat must match order’s session.
- **payments** – Tied to **sessionId** (and optionally legacy orderId). amount, tip, method, paidAt.
- **reservations** – Can attach **sessionId** once seated.

## Rules

1. A table can have at most one active (open) session (DB-enforced).
2. Table status is derived from whether an open session exists.
3. A session can have multiple orders (waves).
4. Orders contain order_items.
5. Tables are mostly layout; session/orders hold operational state.
6. Timestamps support analytics and kitchen timing.

## Indexes (realtime and analytics)

- **sessions**: (location_id, status), (table_id), partial unique (table_id) WHERE status = 'open'
- **service_periods**: (location_id)
- **orders**: (session_id), (location_id), (status)
- **order_items**: (order_id), (status)
- **session_events**: (session_id), (session_id, type), (created_at), ((meta->>'orderItemId'))
- **seats**: (session_id), unique (session_id, seat_number)

## Realtime-friendly helpers

Use `src/lib/db/realtime-pos.ts`: `getSessionById`, `getOrdersBySessionId`, `getOrderItemsByOrderId`, `getSessionWithOrdersAndItems`. Queries use indexed columns for efficient refetch after realtime events.

## Session events

- **recordSessionEvent(locationId, sessionId, type, meta?)** – log when you have sessionId.
- **recordSessionEventByTable(locationId, tableId, type, meta?)** – look up open session by table and log (use when you only have table id).

**Event types** (enum `session_event_type`):

| Type | Wired in app | Example meta |
|------|----------------|--------------|
| guest_seated | ✓ | `{ guestCount }` |
| order_sent | ✓ | `{ wave: 1 }` |
| item_ready | ✓ | `{ waveNumber }` |
| served | ✓ | `{ waveNumber }` |
| bill_requested | ✓ | — |
| payment_completed | ✓ | — |
| course_fired | — | `{ wave: number, course: "starter" }` |
| course_completed | — | — |
| item_refired | — | `{ orderItemId: string, reason: string }` |
| item_voided | — | — |
| runner_assigned | — | `{ runnerId: string }` |
| table_cleaned | — | — |
| kitchen_delay | — | `{ orderItemId: string, minutesLate: number }` |
| guest_added | — | `{ previous, new, reason }` |
| guest_removed | — | `{ previous, new, reason }` |
| guest_count_adjusted | — | `{ previous, new, reason }` |

**Actor tracking**: optional `actor_type` (server | kitchen | system | runner | customer) and `actor_id` – e.g. server fired course, kitchen marked item ready. Pass via `recordSessionEvent(..., meta?, actor?)`. Indexes: (session_id, actor_type), (actor_id).

## Legacy / deprecation

Order lookup by **table_id** without session (in `getOrderForTable` and `closeOrderForTable`) is deprecated and will be removed once all data is migrated to the session-based model.

## Migration

1. **Schema**  
   Run:

   ```bash
   npm run db:push
   ```

   This adds: `sessions` table, `seats` table, new enums (`session_status`, `session_source`, `order_wave_status`), and new columns on `orders` (sessionId, wave, firedAt, station), `order_items` (seat, seat_id FK to seats.id, sentToKitchenAt, startedAt, readyAt, servedAt), `payments` (sessionId; orderId nullable), `reservations` (sessionId).

2. **Reservations FK**  
   If your DB doesn’t create it from the schema (e.g. circular ref), add the FK manually:

   ```sql
   ALTER TABLE reservations
   ADD CONSTRAINT reservations_session_id_fkey
   FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL;
   ```

3. **Data backfill (sessions)**  
   For existing rows that have `orders.table_id` but no `orders.session_id`, create a session per order and set `order.session_id` and `order.wave = 1`:

   ```bash
   npx tsx scripts/migrate-orders-to-sessions.ts
   ```

4. **Data backfill (seat_id)**  
   After adding the `seats` table and `order_items.seat_id`, backfill `seat_id` from legacy `order_items.seat` (and create missing seat rows per session as needed):

   ```bash
   npx tsx scripts/backfill-order-items-seat-id.ts
   ```

   Later, the legacy `order_items.seat` column can be removed.

5. **Seat-session constraint** (optional, defense in depth)  
   Ensure `order_items.seat_id` references a seat in the same session as the order:

   ```bash
   npx tsx scripts/add-order-items-seat-session-constraint.ts
   ```

6. **Service periods** (optional)  
   Create `service_periods` rows per location (e.g. Breakfast 08:00–11:00). When a session is created, the current period is assigned automatically based on time. Seed via app or migration.

## Seat management

**syncSeatsWithGuestCount(sessionId, guestCount)** – Syncs seats with guest count: creates seats 1..guestCount if missing; when count decreases, marks excess seats as `removed` (never deletes seats with order_items). Reactivates removed seats when count increases. Seat numbers remain unique per session.

**addSeatToSession(sessionId, seatNumber?)** – Adds a seat. Uses next available seat_number (max + 1) unless `seatNumber` is provided. Maintains unique (session_id, seat_number).

**removeSeatFromSession(seatId)** – Marks seat as `removed` if `order_items` reference it; otherwise deletes it. Preserves `seat_id` references.

**removeSeatBySessionAndNumber(sessionId, seatNumber)** – Convenience wrapper: looks up seat by session + number, then calls `removeSeatFromSession`.

**renameSeat(seatId, newSeatNumber)** – Changes seat_number. Updates legacy `order_items.seat` for items that reference this seat via `seat_id`.

**Integration:** `ensureSeatsForSession` (used by sync) calls `syncSeatsWithGuestCount` when guest count changes. The table page calls `removeSeatBySessionAndNumber` when the user deletes a seat.

## Order waves

**createNextWave(sessionId)** – Creates the next order wave for a session. Finds the highest wave number, creates a new order with wave = highest + 1, status = pending, fired_at = null, station = null. Returns the created order.

**fireWave(orderId)** – Fires a wave: sets fired_at = now, status = confirmed, updates order_items.sent_to_kitchen_at if not set, and records session event `course_fired` with meta `{ wave }`.

**getOrderIdForSessionAndWave(sessionId, waveNumber)** – Returns the order id for a session and wave. Used to wire fireWave from the table page.

**Integration:** The table page calls `createNextWave` when the user adds a wave (+ button) and `fireWave` when the user fires a wave from the timeline. `syncOrderToDb` distributes items by wave: it groups lines by `waveNumber` and syncs each wave’s items to its corresponding order.

## Table status derivation

**computeTableStatus(tableId)** – Derives table status from sessions (ignores `tables.status`):

- No open session → available
- Open session → occupied
- Session closed within last 5 minutes → cleaning
- Cleaning finished → available

`getTablesForLocation` and `getTablesForFloorPlan` use this logic internally via a batch helper.

## Session close validation

Before a session can be closed, the system verifies the table is in a safe state. Use `canCloseSession(sessionId)` to check.

**Validation rules** (all must pass):

1. **Session must exist and be open** – block if `status !== "open"` → `reason: "session_not_open"`.
2. **No unfinished kitchen items** – all non-voided order items must have `status` in `served` or `voided_at` set. Block on `pending`, `preparing`, `ready` → `reason: "unfinished_items"` with `items: [...]`.
3. **No unpaid balance** – `remaining = session_total - payments_total`; block if `remaining > 0` → `reason: "unpaid_balance"`, `remaining: number`.
4. **No active payment** – block if any payment has `status = "pending"` → `reason: "payment_in_progress"`.
5. **Kitchen mid-fire** – block if any item has `sent_to_kitchen_at IS NOT NULL` and `started_at IS NULL` → `reason: "kitchen_mid_fire"`.

**Helpers:**

- `canCloseSession(sessionId)` – returns `{ ok: true }` or `{ ok: false, reason, items?, remaining? }`.
- `getSessionOutstandingItems(sessionId)` – returns what is still blocking closure (for UI display).

## Kitchen delay detection

**detectKitchenDelays(sessionId, options?)** – Helper (not auto-run) that finds order items with `sent_to_kitchen_at` set, `ready_at` null, and elapsed time exceeding threshold. Default thresholds: 10 min warning, 20 min critical. Returns `[{ orderItemId, minutesLate, station }]` and records `kitchen_delay` session events per item.

**Force close (manager override):**

- `closeOrderForTable(locationId, tableId, payment?, { force: true })` – skips validation, voids remaining unfinished items, records a session event with meta `{ forced_close: true, reason: "manager_override" }`, then closes. Use with care for auditability.

## App behavior

- **Table detail / POS** – When a session is created, seats are auto-created and **service_period_id** is set from current time if periods exist. **getSeatsForSession**, **getOrderForTable** (prefers seat_id), **closeOrderForTable** (with optional `{ force: true }`), **advanceOrderWaveStatus** – see prior sections. **recordSessionEvent** / **recordSessionEventByTable** accept optional `actor?: { actorType, actorId }` for audit.
- **KDS** – Uses **orders + order_items only** (no table-based order lookup). GET `/api/kds/orders?locationId=` returns active orders (status pending/preparing/ready) with full order_items; table number comes from session or order. Status changes are persisted via PUT `/api/orders/[id]/items/[itemId]` (which sets startedAt/readyAt/servedAt when status changes).
- **Analytics** – Use `sessions` (openedAt, closedAt, guestCount, source), `orders` (firedAt, completedAt), and `order_items` timing columns.
