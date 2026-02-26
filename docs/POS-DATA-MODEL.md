# POS-style data model (sessions + orders/waves)

## Overview

The restaurant data model is refactored to align with professional POS systems:

- **tables** – Physical table layout (section, shape, position, capacity). **Table status is derived from sessions**: if an open session exists for a table, the table is considered occupied. The `tables.status` column is a cache; source of truth is `sessions.status = 'open'` per table.
- **sessions** – One dining visit per table. **At most one open session per table** (enforced by partial unique index `sessions_one_open_per_table` on `table_id` WHERE `status = 'open'`). Holds: locationId, tableId, serverId, guestCount, openedAt, closedAt, status, source (walk_in, reservation, qr, pos).
- **session_events** – Operational events per session: guest_seated, order_sent, item_ready, served, bill_requested, payment_completed. Columns: session_id, type, created_at, meta (jsonb).
- **seats** – One row per guest position in a session. Columns: session_id, seat_number (1..guestCount), guest_name (nullable). Unique (session_id, seat_number). Created when a session is created.
- **orders** – Waves/fires within a session. Each order has sessionId, wave number, status, firedAt, completedAt, station (for KDS).
- **order_items** – Line items per order (wave), with timing: **seat_id** (FK to seats.id), legacy **seat** (number, kept for migration), sentToKitchenAt, startedAt, readyAt, servedAt. **Kitchen timestamps are validated**: sentToKitchenAt ≤ startedAt ≤ readyAt ≤ servedAt (CHECK constraint).
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
| kitchen_delay | — | `{ station: "grill", minutes: 5 }` |

Index `(session_id, type)` supports analytics queries by session and event type.

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

## App behavior

- **Table detail / POS** – When a session is created (seating or first sync), seats are auto-created for that session (seat_number 1..guestCount). **getSeatsForSession(sessionId)** returns seats for resolving seat_id. When adding items, `syncOrderToDb` maps POS seat number to `seat_id` and persists both `seat` (legacy) and `seat_id`. `syncOrderToDb` gets or creates a session (and ensures seats exist), then gets or creates an order (wave 1) and writes order_items with seat_id. `getOrderForTable` prefers an open session and aggregates items from all waves; it falls back to legacy (order by tableId) when there is no session. `closeOrderForTable(locationId, tableId, payment?)` records a payment row when payment is provided, then closes the session and marks its orders completed. Kitchen workflow: `advanceOrderWaveStatus` updates order_items status and timestamps; the table page records session events (item_ready, served).
- **KDS** – Uses **orders + order_items only** (no table-based order lookup). GET `/api/kds/orders?locationId=` returns active orders (status pending/preparing/ready) with full order_items; table number comes from session or order. Status changes are persisted via PUT `/api/orders/[id]/items/[itemId]` (which sets startedAt/readyAt/servedAt when status changes).
- **Analytics** – Use `sessions` (openedAt, closedAt, guestCount, source), `orders` (firedAt, completedAt), and `order_items` timing columns.
