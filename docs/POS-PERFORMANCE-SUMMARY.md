# GET /api/tables/[id]/pos Performance Summary

## 1. EXPLAIN Mode Fix

**Problem:** The orderItems query produced invalid SQL: `WHERE order_id = ANY(($1,$2))` when using Drizzle's `inArray` with multiple IDs.

**Fix:** Run EXPLAIN with a query shaped as `WHERE order_id = ANY($1::uuid[])` and pass `[orderIds]` as a single array param. All explain modes now use this pattern.

## 2. DEV Logging Added

### getSessionOutstandingItems (via canCloseSession)
- Logs: `[pos] getSessionOutstandingItems/order_items` with `{ sql, params: [orderIds], rows }`
- SQL: `SELECT * FROM order_items WHERE order_id = ANY($1::uuid[]) AND voided_at IS NULL`

### checkKitchenDelays (via detectKitchenDelays)
- Logs: `[pos] checkKitchenDelays/order_items` with `{ sql, params: [orderIds], rows }`
- SQL: `SELECT * FROM order_items WHERE order_id = ANY($1::uuid[]) AND sent_to_kitchen_at IS NOT NULL AND ready_at IS NULL AND voided_at IS NULL`

## 3. Explain Modes (DEV only, ?explain=...)

| Param | Target | Returns |
|-------|--------|---------|
| `?explain=1` | Main orderItems (pos heaviest) | `meta.explain` |
| `?explain=outstanding` | getSessionOutstandingItems heaviest query | `meta.explain` |
| `?explain=delays` | checkKitchenDelays heaviest query | `meta.explain` |

## 4. Indexes (from logged SQL)

### getSessionOutstandingItems
- **Query:** `order_items WHERE order_id = ANY($1::uuid[]) AND voided_at IS NULL`
- **Index:** `order_items_order_id_voided_at_idx` on `(order_id, voided_at)` — already in 0002

### checkKitchenDelays
- **Query:** `order_items WHERE order_id = ANY($1::uuid[]) AND sent_to_kitchen_at IS NOT NULL AND ready_at IS NULL AND voided_at IS NULL`
- **Index:** `order_items_kitchen_delays_idx` — partial index on `(order_id)` WHERE `voided_at IS NULL AND sent_to_kitchen_at IS NOT NULL AND ready_at IS NULL`
- **Migration:** `drizzle/0003_pos_helper_indexes.sql`

### Apply migrations
```bash
# If using db:push for 0002 indexes:
npm run db:push

# Apply 0003 (partial index, no psql needed):
npm run db:migrate:0003
```

## 5. Before/After Deliverable Template

Run locally and capture:

### Before indexes
```bash
# 1. GET pos (main explain)
curl -s "http://localhost:3000/api/tables/{tableId}/pos?explain=1" -H "Cookie: ..." | jq .meta.explain

# 2. Outstanding explain
curl -s "http://localhost:3000/api/tables/{tableId}/pos?explain=outstanding" -H "Cookie: ..." | jq .meta.explain

# 3. Delays explain
curl -s "http://localhost:3000/api/tables/{tableId}/pos?explain=delays" -H "Cookie: ..." | jq .meta.explain

# 4. Server console: [pos] timers + getSessionOutstandingItems/order_items + checkKitchenDelays/order_items logs
```

### After indexes
- Apply 0002 + 0003
- Rerun same requests
- Paste:
  - **Worst query** (ms, buffers, rows from EXPLAIN)
  - **Index that fixes it**
  - **Rerun logs** (before/after timings)
