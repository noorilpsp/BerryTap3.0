# KDS Substation / Kitchen Lane — First Slice

## Overview

Allow menu items in the primary station (typically kitchen) to be grouped into substation lanes (grill, fryer, cold prep) within the KDS preparing view. Substation is a lane/bucket inside a station, not a separate KDS screen.

## Chosen Model

- **items.default_substation** (nullable varchar): Fixed set `grill`, `fryer`, `cold_prep`. null = unassigned.
- **Derivation**: Order item substation comes from menu item via `order_items.item_id` → `items.default_substation`. No persistence on order_items in this slice.
- **Station** remains the top-level routing key; substation is optional and scoped to the primary station.

## Lane-Capable Station Rule

**Only `kitchen` supports lanes currently.** Other stations (bar, dessert, custom) use a single-column preparing view.

- **Item drawer**: Lane picker shown only when `defaultStation === "kitchen"`.
- **KDS**: Lanes (grill/fryer/cold_prep/unassigned) only when `activeStationId === "kitchen"`; otherwise normal column layout.
- **Future**: Per-location lane configuration will allow other stations to support lanes.

## Lane Resolution Rule

**Rule**: Lane = first item that routes to the current tab's station (activeStationId), use its substation. Applies only when station is kitchen.

- **Station-scoped**: subStation is computed per active tab. Only kitchen uses lanes; bar/dessert get single column.
- **Fallback station**: When `order.station` and `item.stationOverride` are null, use the location's first active station (by display_order), not a hardcoded `"kitchen"`.
- **UNASSIGNED** when: no item routes to the current station, item has no `default_substation`, or `item_id` is null.

## Why First-Item Strategy

- One order can span multiple stations (kitchen + bar). We assign the whole ticket to a single lane for the *current* tab.
- Using the first matching item is simple, deterministic, and stable.
- Future: per-item lanes or multi-lane orders would need schema and UI changes.

## Files Changed

| File | Changes |
|------|---------|
| `src/lib/db/schema/menus.ts` | Add `defaultSubstation` column |
| `drizzle/0008_items_default_substation.sql` | Migration |
| `scripts/run-migration-0008.ts` | Migration runner |
| `package.json` | `db:migrate:0008` script |
| `src/types/menu-item.ts` | Add `defaultSubstation` |
| `src/components/item-drawer.tsx` | Lane select (when station = kitchen) |
| `src/app/dashboard/(dashboard)/menu/menu-context.tsx` | `transformItem`, create/update payloads |
| `src/app/api/items/route.ts` | POST: validate & insert `defaultSubstation` |
| `src/app/api/items/[id]/route.ts` | PUT: validate & update `defaultSubstation` |
| `src/lib/kds/kdsView.ts` | Add `substation` to `KdsOrderItem` |
| `src/app/api/kds/view/route.ts` | Join items, include substation per order item |
| `src/app/kds/page.tsx` | Compute `order.subStation` from activeStationId; location-agnostic fallback |
| `src/components/kds/PreparingLanes.tsx` | Use real `order.subStation`, add unassigned lane, remove hash |

## Data Flow

1. **Menu item edit**: User sets `defaultStation` = kitchen and optionally `defaultSubstation` = grill/fryer/cold_prep.
2. **Order creation**: Order items reference menu items via `item_id`. Substation is derived at read time.
3. **KDS view**: `GET /api/kds/view` loads order items with `item.defaultSubstation`, returns `substation` per order item.
4. **kdsViewToOrders(view, activeStationId)**: For each order, `subStation` = first item matching activeStationId → substation; else `"unassigned"`. Uses `view.stations[0]?.id` as fallback when station is null.
5. **PreparingLanes**: Groups orders by `order.subStation` into grill, fryer, cold_prep, unassigned.

## KDS Lane Grouping

- Four lanes in derivation: GRILL, FRYER, COLD PREP, UNASSIGNED.
- **UNASSIGNED** remains in derivation as a fallback bucket so tickets with missing/invalid substations never disappear.
- **UNASSIGNED is hidden in the UI when empty** (UI polish only). When it has entries, it displays normally.
- Lanes only when `activeStationId === "kitchen"`; bar/dessert use single-column preparing view.

## What Works in This Slice

- Menu items with kitchen station can select a lane (grill, fryer, cold prep).
- KDS kitchen preparing view groups orders by real substation.
- Orders with no substation appear in UNASSIGNED.
- Validation: only `grill`, `fryer`, `cold_prep` allowed.

## Configurable Substations (Implemented)

- Substations are now configurable per station via `location_substations`.
- KDS settings: add, edit, delete, reorder lanes per station.
- Item drawer: lane picker shows lanes for the selected station (from configured substations).
- KDS preparing view: lanes rendered from configured substations for the active station.
- Migration 0010 seeds `grill`, `fryer`, `cold_prep` for kitchen stations (backward compatibility).

## Limitations (Current Model)

- One lane per order per tab; no per-item lanes or multi-lane orders.

## Future Model

- Per-location lane configuration (custom stations can support lanes).
- `order_items.substation_override` for overrides.
- Advanced routing (e.g. by modifier).
- Bulk lane assignment.

## Migration

```bash
npm run db:migrate:0008
```

## Why UNASSIGNED Stays in Derivation (UI-Hidden When Empty)

- **UNASSIGNED is kept in derivation** so tickets with missing/invalid substations (no item, null `defaultSubstation`, etc.) never disappear from PREPARING.
- **It is hidden in the UI when empty** so the KDS does not show an empty UNASSIGNED lane when all orders are correctly assigned.
- Removing UNASSIGNED from derivation would cause those tickets to become invisible; keeping it hidden only in render preserves safety.

## Risks / Cleanup

- **Migration required**: Run `npm run db:migrate:0008` before using substation features.
- **Order items without itemId**: Legacy items (itemId null) have `substation = null` → UNASSIGNED.
- **API fallback**: When a location has no active stations, KDS view falls back to `"kitchen"`; admin should add stations.
- **DEV safeguard**: If an item has `defaultSubstation` but its station is not kitchen, substation is ignored and a DEV warning is logged.
