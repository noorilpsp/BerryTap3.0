# POS-style data model (sessions + orders/waves)

## Overview

The restaurant data model is refactored to align with professional POS systems:

- **tables** – Physical table layout (section, shape, position, capacity). See [Tables](#tables) for status semantics.
- **service_periods** – Time windows per location (e.g. Breakfast 08:00–11:00, Lunch 14:00–17:00). Columns: location_id, name, start_time, end_time. Sessions get `service_period_id` assigned at creation based on current time (for analytics).
- **sessions** – One dining visit per table. **At most one open session per table** (enforced by partial unique index). Holds: locationId, tableId, serverId, guestCount, **servicePeriodId** (optional), openedAt, closedAt, status, source.
- **session_events** – Operational events per session. Columns: session_id, type, created_at, **actor_type** (server | kitchen | system | runner | customer), **actor_id** (uuid), meta (jsonb). Indexes: (session_id, type), (session_id, actor_type), (actor_id).
- **seats** – One row per guest position in a session. Columns: session_id, seat_number, status (active | removed), guest_name (nullable). Unique (session_id, seat_number). Removed seats are never deleted if order_items reference them.
- **orders** – Waves/fires within a session. Each order has sessionId, wave number, status, firedAt, completedAt, station (for KDS).
- **order_items** – Line items per order (wave), with timing: **seat_id** (primary for seat assignment), legacy **seat** (fallback), sentToKitchenAt, startedAt, readyAt, servedAt, **voidedAt**, **refiredAt**, **station_override** (e.g. "grill", "fryer", "bar" for multi-station tickets). Kitchen timestamps validated (CHECK). seat_id session constraint: seat must match order’s session.
- **payments** – Tied to **sessionId** (and optionally legacy orderId). amount, tip, method, paidAt.
- **reservations** – Can attach **sessionId** once seated.

## Design Principles

- **Sessions are the source of truth** – Table status, guest count, and dining state flow from sessions. Tables are layout; sessions hold operational state.
- **Orders represent waves / kitchen tickets** – Each order is a fire event. Once fired, it becomes an immutable kitchen ticket; new items create a new wave.
- **order_items represent the lifecycle of food** – Line items carry timing (sentToKitchenAt, startedAt, readyAt, servedAt) and state (voidedAt, refiredAt). Seat assignment lives here.
- **Events provide analytics and audit history** – session_events record what happened (items_added, order_sent, payment_completed, etc.) with optional actor and meta. Use for funnel analytics, debugging, and audit.
- **Service layer enforces operational correctness** – All mutations flow through serviceActions → serviceFlow (validators) → DB actions. UI never mutates orders/items directly. Validators block invalid transitions before any write.

## Tables

POS table status is derived from sessions via **computeTableStatus(tableId)**: no open session → available; open session → occupied; session closed within last 5 min → cleaning; else → available.

**tables.status is legacy** and should not be used as the source of truth for whether a table is occupied. The authoritative state is the **sessions** table.

## Rules

1. A table can have at most one active (open) session (DB-enforced).
2. Table status is derived from whether an open session exists.
3. A session can have multiple orders (waves).
4. Orders contain order_items.
5. Tables are mostly layout; session/orders hold operational state.
6. Timestamps support analytics and kitchen timing.
7. **Items cannot be added to fired waves.** New items must create a new wave. Kitchen tickets must remain immutable once fired to avoid confusion in the kitchen.

## Indexes (realtime and analytics)

- **sessions**: (location_id, status), (table_id), partial unique (table_id) WHERE status = 'open'
- **service_periods**: (location_id)
- **orders**: (session_id), (location_id), (status)
- **order_items**: (order_id), (status)
- **session_events**: (session_id), (session_id, type), (created_at), ((meta->>'orderItemId'))
- **seats**: (session_id), unique (session_id, seat_number)

## Architecture

Lifecycle mutations flow through these layers:

```
UI
 ↓
serviceActions
 ↓
serviceFlow (validators)
 ↓
DB actions
 ↓
database
```

- **UI** – Table page, KDS, API routes. Call service layer for mutations; never mutate orders/items directly.
- **serviceActions** (`src/domain/serviceActions.ts`) – Orchestration. Loads context, calls validators, invokes DB actions, records events, returns structured results.
- **serviceFlow** (`src/domain/serviceFlow.ts`) – Pure validators. No DB. Return `{ ok }` or `{ ok: false, reason }`. Enforce allowed transitions before any write.
- **DB actions** (`src/app/actions/`) – orders, order-item-lifecycle, seat-management, etc. Perform actual inserts/updates/deletes.
- **database** – Postgres. Source of truth for sessions, orders, order_items, payments.

All order-related mutations (add items, create wave, fire wave, seat logic, totals) go through this single path: **UI → serviceActions → serviceFlow (validators) → DB actions**; there is no legacy bypass (e.g. no direct sync from store to DB).

**Sessions are required** for all table operations. There is no order-by-table lookup without a session; `getOrderForTable` and `closeOrderForTable` operate only on open sessions.

**Mutations use sessionId.** tableId is allowed only for: (1) locating the open session (e.g. `getOpenSessionIdForTable`), (2) floor map display, (3) analytics. All write operations (close session, advance wave status, add items, etc.) are keyed by sessionId. `closeSession(sessionId, ...)` is the canonical close; `closeOrderForTable` uses tableId only to find the session, then delegates to `closeSession`.

## Canonical mutation flow

All POS mutations must go through the service layer:

```
UI
 → serviceActions
 → validators
 → DB actions
 → database
```

The following functions are canonical:

- addItemsToOrder
- sendWaveToKitchen
- serveItem
- voidItem
- refireItem
- closeSessionService

Legacy bulk mutation helpers such as syncSessionOrderViaServiceLayer are deprecated and will be removed.

## Order channels

- **Dine-in POS (table page):** Uses `addItemsToOrder` via service layer. Session → waves → order_items.
- **Pickup / delivery / external dine-in:** Use `POST /api/orders` (separate order channel). No session for pickup/delivery; dine-in resolves session via tableId. See [POST-API-ORDERS-ANALYSIS.md](./POST-API-ORDERS-ANALYSIS.md).

## Realtime-friendly helpers

Use `src/lib/db/realtime-pos.ts`: `getSessionById`, `getOrdersBySessionId`, `getOrderItemsByOrderId`, `getSessionWithOrdersAndItems`. Queries use indexed columns for efficient refetch after realtime events.

## Debugging tools

**GET `/api/debug/session/[sessionId]`** – Development-only endpoint to inspect the full POS state for a session. Returns a structured JSON payload with:

- **session** – Session row (table, server, location)
- **seats** – Seats for the session
- **orders** – Orders (waves) for the session, with order items and customizations
- **items** – Flattened list of all order items
- **payments** – Payments tied to the session
- **events** – Session events ordered by `created_at` ascending

Useful for understanding the complete lifecycle of a table visit during development. Read-only; no mutations.

## Session events

- **recordSessionEvent(locationId, sessionId, type, meta?)** – log when you have sessionId.
- **recordSessionEventByTable(locationId, tableId, type, meta?)** – look up open session by table and log (use when you only have table id).
- **recordSessionEventWithSource(locationId, sessionId, type, source, meta?, actor?, correlationId?)** – log with a standardized `meta.source` (use to avoid repeating source logic at call sites). Pass `correlationId` to group events from the same user action.

**meta.source** – Indicates where the action originated. Use for debugging and analytics when multiple devices interact.

| Source       | Meaning                          |
|--------------|----------------------------------|
| `table_page` | Table UI (server/front-of-house) |
| `kds`        | Kitchen display                  |
| `api`        | API route (e.g. external KDS)    |
| `system`     | Internal automated logic         |

**meta.correlationId** – Groups events triggered by the same user action. Use `generateCorrelationId()` once per operation and pass the same ID to all events emitted in that operation.

Example event:

```json
{
  "type": "items_added",
  "meta": {
    "source": "table_page",
    "correlationId": "550e8400-e29b-41d4-a716-446655440000",
    "itemCount": 3,
    "orderId": "...",
    "wave": 1
  }
}
```

**Choosing the correct event helper**

- Use **recordSessionEvent(locationId, sessionId, ...)** when the caller already has sessionId.
- Use **recordSessionEventByTable(locationId, tableId, ...)** only when sessionId is unknown.

Examples: Table page (loads and stores sessionId) → `recordSessionEvent`. Floor map (taps tables by tableId, no session in context) → `recordSessionEventByTable`.

**Event types** (enum `session_event_type`):

| Type | Wired in app | Example meta |
|------|----------------|--------------|
| session_opened | — | `{ tableId, guestCount }` |
| guest_seated | ✓ | `{ guestCount }` |
| items_added | ✓ | `{ orderId, addedItemIds, wave, itemCount, seatBreakdown }` |
| order_sent | ✓ | `{ wave: 1 }` |
| item_ready | ✓ | `{ waveNumber }` |
| served | ✓ | `{ waveNumber }` |
| bill_requested | ✓ | — |
| payment_completed | ✓ | — |
| payment_attempted | — | `{ amount, method }` |
| payment_failed | — | `{ amount, method, reason }` |
| refund_issued | — | `{ amount, paymentId }` |
| bill_split | — | `{ originalAmount, splitCount }` |
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

**session_opened** – Explicitly track the start of a dining session for analytics and debugging. Meta: `{ tableId, guestCount }`.

**Actor tracking**: optional `actor_type` (server | kitchen | system | runner | customer) and `actor_id` – e.g. server fired course, kitchen marked item ready. Pass via `recordSessionEvent(..., meta?, actor?)`. Indexes: (session_id, actor_type), (actor_id).

**Financial event types** – For payment and refund tracking:

| Event | Purpose | Example meta |
|-------|---------|--------------|
| **payment_attempted** | Log when a payment is initiated (before success/failure). Use for funnel analytics and audit trail. | `{ amount, method }` |
| **payment_failed** | Log when a payment attempt fails. Captures reason for debugging and reconciliation. | `{ amount, method, reason }` |
| **refund_issued** | Log when a refund is processed. Links to original payment for audit. | `{ amount, paymentId }` |
| **bill_split** | Log when a bill is split (e.g. across multiple cards or parties). Tracks split configuration. | `{ originalAmount, splitCount }` |

**items_added event** – Recorded when items are added via `addItemsToOrder`. Meta includes:
- `orderId` – Order the items were added to
- `addedItemIds` – IDs of inserted order_items
- `wave` – Wave number
- `itemCount` – Total quantity of items added
- `seatBreakdown` – `{ [seatId]: count }` or `{ shared: count }` for seat-less items. Computed from the items being inserted for analytics.

## Session lifecycle phases

These are logical phases derived from events, not a database column. Use for analytics and UI (e.g. table status, turn-time metrics).

| Phase   | Description                 | Derived from                          |
|---------|-----------------------------|---------------------------------------|
| **seated**   | Guests seated at table      | `guest_seated`                        |
| **ordering** | Guests adding items         | `items_added`                         |
| **eating**   | Food in kitchen / being served | `course_fired`, `served`, `item_ready` |
| **billing**  | Bill requested, awaiting payment | `bill_requested`                  |
| **paid**     | Payment completed           | `payment_completed`                   |
| **closed**   | Session closed              | session `status = closed`             |

## Sessions required

**Sessions are the source of truth** for all order operations. The system requires a session for table activity.

- **getOrderForTable** – Returns order data only when an open session exists for the table. Returns `null` otherwise (no order to load).
- **closeOrderForTable** – Uses tableId only to locate the open session (allowed). Delegates to **closeSession(sessionId, payment?, options?)** for all mutations.
- **closeSession(sessionId, payment?, options?)** – Canonical close; all mutations keyed by sessionId. Called by closeSessionService and by closeOrderForTable after session lookup.

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

## Kitchen tickets

An order wave functions as a kitchen ticket. Kitchens think in tickets: each fired wave is a discrete unit of work that the kitchen receives and tracks.

- **Each order wave represents a fire event.** When the server presses "Send", the wave is fired (`fired_at` set) and becomes a kitchen ticket.
- **Station routing** determines which kitchen station handles the ticket:
  - `orders.station` – primary station for the entire ticket (e.g. "grill", "fryer", "bar")
  - `order_items.station_override` – per-item override when an item goes to a different station (e.g. a drink on a food ticket routed to the bar)

**Example ticket:**

```
Ticket
Table 12
Wave 2
Station: grill

Items:
• Steak
• Burger
```

## Order waves

**createNextWave(sessionId)** – Creates the next order wave for a session. Finds the highest wave number, creates a new order with wave = highest + 1, status = pending, fired_at = null, station = null. Returns the created order.

**fireWave(orderId)** – Fires a wave: sets fired_at = now, status = confirmed, updates order_items.sent_to_kitchen_at if not set, and records session event `course_fired` with meta `{ wave }`.

**getOrderIdForSessionAndWave(sessionId, waveNumber)** – Returns the order id for a session and wave. Used to wire fireWave from the table page.

**advanceOrderWaveStatusBySession(sessionId, waveNumber, status)** – Advances all non-voided items in a wave to preparing/ready/served. Mutations keyed by sessionId. Call **advanceWaveStatus(sessionId, waveNumber, status)** from the service layer when you have sessionId.

**Integration:** The table page uses the single mutation path: **UI → serviceActions → validators → DB actions**. It calls `addItemsToOrder` when the user adds items and clicks Send, `createNextWave` when the user adds a wave (+ button), and `fireWave` when the user fires a wave from the timeline.

## Table status derivation

**computeTableStatus(tableId)** – Derives table status from sessions (ignores `tables.status`):

- No open session → available
- Open session → occupied
- Session closed within last 5 minutes → cleaning
- Cleaning finished → available

`getTablesForLocation` and `getTablesForFloorPlan` use this logic internally via a batch helper.

## Domain service flow

**src/domain/serviceFlow.ts** – Centralized validation for allowed transitions. Pure functions (no DB). Return `{ ok: boolean; reason?: string }` for UI-friendly errors. All actions call these before mutating.

- **canFireWave(order)** – `wave_already_fired` when fired
- **canAddItems(session)** – `session_not_open` when closed
- **canServeItem(item)** – `item_not_ready` (no skipping states)
- **canMarkItemPreparing / canMarkItemReady** – `item_not_pending` / `item_not_preparing`
- **canCloseSession(ctx)** – `session_not_open` | `unfinished_items` | `kitchen_mid_fire` | `payment_in_progress` | `unpaid_balance`
- **canVoidItem(item)** – `item_already_voided`
- **canRefireItem(item)** – `item_already_refired`

## Service layer

**src/domain/serviceActions.ts** – Orchestration layer. See [Architecture](#architecture) for the full flow.

Service functions return `{ ok: boolean; reason?: string; data?: unknown }` for UI-friendly errors.

| Service | Orchestration |
|---------|---------------|
| **fireWave(sessionId, options?)** | Validates with canFireWave, finds order (by waveNumber or next unfired), calls fireWave action, optionally sets station |
| **serveItem(orderItemId)** | Calls markItemServed (validates canServeItem, updates servedAt, records served) |
| **markItemReady(orderItemId)** | Calls markItemReady action (validates, sets readyAt, records item_ready) |
| **voidItem(orderItemId, reason)** | Calls voidItem action (validates canVoidItem, sets voidedAt, records item_voided) |
| **refireItem(orderItemId, reason)** | Validates canRefireItem, calls refireItem action, resets item to pending |
| **closeSessionService(sessionId, payment?, options?)** | Calls canCloseSession, then closeSession(sessionId, ...); single place that closes sessions. All mutations keyed by sessionId. |
| **addItemsToOrder(sessionId, items)** | Validates canAddItems. Finds order where firedAt IS NULL; if none → createNextWave. Never attaches items to fired waves (defensive: if order was fired since query, creates new wave). Validates seatId, inserts order_items, recalculates totals, records items_added. Returns `{ sessionId, orderId, wave, addedItemIds, itemCount, sessionStatus, orderStatus }`. |
| **sendWaveToKitchen(sessionId, waveNumber)** | Canonical "Send" operation. Validates session open, canFireWave, at least one non-voided item (empty_wave otherwise). Updates order only when fired_at IS NULL (prevents race: returns wave_already_fired if another request fired first), sets sentToKitchenAt on items where null, records course_fired. Returns `{ sessionId, orderId, wave, firedAt, itemCount }`. Errors: order_not_found, wave_already_fired, session_not_open, empty_wave. |

## Totals recalculation layer

**src/domain/orderTotals.ts** – Helpers to derive totals from order_items (no schema changes).

> **Warning:** Stored totals on `orders` (subtotal, total, taxAmount, etc.) are **cache values**. Source of truth is always **order_items**. Totals must be recalculated using `recalculateOrderTotals` and `recalculateSessionTotals` after any change that affects line items (add, void, refire). This prevents data drift when items change without the cache being updated.

- **recalculateOrderTotals(orderId)** – Sum non-voided order_items.lineTotal, update order.subtotal and order.total. Order totals should always be derived from order_items.
- **recalculateSessionTotals(sessionId)** – Recalculates each order in the session, returns `{ subtotal, total, paid, remaining }`. Session total = sum of orders; paid = sum of completed payments; remaining = total - paid.

**Wired in:** addItemsToOrder (after items), voidItem (after void), refireItem (after refire), closeSessionService (before validation), closeSession (before validation; after payment insert). Ensures payment validation uses correct numbers.

**Why this matters:** UI does not directly mutate orders. All flows pass through the same lifecycle logic. Future realtime updates remain consistent.

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

- `closeSession(sessionId, payment?, { force: true })` – skips validation, voids remaining unfinished items, records a session event with meta `{ forced_close: true, reason: "manager_override" }`, then closes. Use with care for auditability.
- `closeOrderForTable(locationId, tableId, payment?, { force: true })` – locates session by table, then calls closeSession with force. Use when caller only has tableId.

## Concurrency and idempotency

POS systems often send duplicate requests due to network retries or multiple tablets. Critical operations must be idempotent so that replaying the same request produces the same result without side effects:

- **addItemsToOrder** – duplicate add could insert items twice
- **sendWaveToKitchen** – has race protection (`fired_at IS NULL` in update), but no client idempotency
- **closeSessionService** – duplicate close could cause issues
- **Payment creation** – duplicate payment could be charged twice

Future support may include an **Idempotency-Key** header. Possible implementation:

- `idempotency_keys` table (key, operation, request_hash, response, created_at)
- Request hashing to detect identical payloads
- Request replay prevention (return cached response for same key)

## Table analytics

Useful metrics derived from sessions, payments, and order_items:

| Metric | Formula | Tables |
|--------|---------|--------|
| **table_turn_time** | `closedAt - openedAt` per session | `sessions` (openedAt, closedAt, tableId) |
| **revenue_per_seat** | `SUM(payments.amount) / guestCount` for session (or table over period) | `sessions` (guestCount), `payments` (amount, sessionId, status = completed) |
| **guests_per_hour** | `SUM(sessions.guestCount)` for closed sessions in time window ÷ hours | `sessions` (guestCount, closedAt, locationId) |
| **average_dining_duration** | `AVG(closedAt - openedAt)` for closed sessions | `sessions` (openedAt, closedAt) |

Revenue can also be derived from `order_items.line_total` (non-voided) summed via orders for the session, when payments are not yet completed. For completed sessions, `payments` is the source of paid revenue.

## App behavior

- **Table detail / POS** – When a session is created, seats are auto-created and **service_period_id** is set from current time if periods exist. **getSeatsForSession**, **getOrderForTable** (session-only; prefers seat_id), **closeOrderForTable** (locates session by table), **closeSession** (canonical close by sessionId), **advanceOrderWaveStatusBySession** / **advanceWaveStatus** (service layer) – see prior sections. **recordSessionEvent** / **recordSessionEventByTable** accept optional `actor?: { actorType, actorId }` for audit.
- **KDS** – Uses **orders + order_items only** (no table-based order lookup). GET `/api/kds/orders?locationId=` returns active orders (status pending/preparing/ready) with full order_items; table number comes from session or order. Status changes are persisted via PUT `/api/orders/[id]/items/[itemId]` (which sets startedAt/readyAt/servedAt when status changes).
- **Analytics** – Use `sessions` (openedAt, closedAt, guestCount, source), `orders` (firedAt, completedAt), and `order_items` timing columns.
