# KDS Routing Implementation

Routing foundation for KDS/POS item-to-station assignment. Adds menu-item default station and persists resolved station on order items at creation.

## Files Changed

| File | Change |
|------|--------|
| `src/lib/db/schema/menus.ts` | Added `defaultStation` (varchar 50) to `items` table |
| `drizzle/0006_items_default_station.sql` | Migration: `ALTER TABLE items ADD COLUMN default_station` |
| `scripts/run-migration-0006.ts` | Script to run migration 0006 |
| `package.json` | Added `db:migrate:0006` script |
| `src/domain/serviceActions.ts` | Add `stationOverride` to `AddItemInput`; select `defaultStation` in menu query; resolve and persist station in `addItemsToOrder` and `createPickupDeliveryOrder` |
| `src/app/actions/orders.ts` | Add `stationOverride` to `PickupDeliveryLineItemInput` |
| `src/app/api/tables/[id]/pos/route.ts` | Add `stationOverride` to order_items columns for delay computation |

## Chosen Field Name

- **items.defaultStation** (TypeScript) / **items.default_station** (DB column)

## Routing Hierarchy Implemented

1. **Explicit item-level override** — `AddItemInput.stationOverride` when provided
2. **Menu item default station** — `items.default_station`
3. **Fallback** — `"kitchen"`

Order-level `orders.station` is not used for the default path; it remains for optional future fire-time overrides.

## Where Station Is Written

| Flow | Location | Logic |
|------|----------|-------|
| Dine-in (`addItemsToOrder`) | `src/domain/serviceActions.ts` ~line 765 | `resolvedStation = input.stationOverride ?? menuItem.defaultStation ?? "kitchen"` → `order_items.station_override` |
| Pickup/delivery (`createPickupDeliveryOrder`) | `src/domain/serviceActions.ts` ~line 450 | `resolvedStation = menuItem?.defaultStation ?? "kitchen"` → passed in `PickupDeliveryLineItemInput` → `createOrderWithItemsForPickupDelivery` inserts into `order_items.station_override` |

## How to Verify

1. **Run migration**
   ```bash
   npm run db:migrate:0006
   ```

2. **Assign a menu item to a station**
   - Update an item: `UPDATE items SET default_station = 'bar' WHERE id = '<item-uuid>';`
   - Or add UI/admin support for `defaultStation` (not in this slice).

3. **Create an order with that item**
   - Table page: add the item to a wave and Send.
   - Or pickup/delivery: create order including that item.

4. **Confirm KDS**
   - Open KDS for the location.
   - Switch to the "Bar" station tab; the item should appear there.
   - New order items with `default_station = 'bar'` will show under Bar; others fall back to Kitchen.

5. **Inspect DB**
   ```sql
   SELECT id, item_name, station_override FROM order_items WHERE created_at > NOW() - INTERVAL '1 hour' ORDER BY created_at DESC LIMIT 10;
   ```
