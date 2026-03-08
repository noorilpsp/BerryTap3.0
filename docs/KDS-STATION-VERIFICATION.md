# KDS Station Verification

Verification that persisted order-item station routing works end-to-end and minimal display cleanup.

## Files Checked

| File | Role |
|------|------|
| `src/app/api/kds/view/route.ts` | KDS GET: fetches `order_items.station_override` and `orders.station`, builds `stations` from actual data |
| `src/lib/hooks/useKdsView.ts` | `groupItemsByStation`: `item.stationOverride ?? orderIdToStation.get(item.orderId) ?? "kitchen"` |
| `src/app/kds/page.tsx` | `kdsViewToOrders`: `i.stationOverride ?? o.station ?? "kitchen"`; `filteredOrders` by `item.stationId` |
| `src/lib/kds/kdsView.ts` | Types: `KdsOrderItem.stationOverride`, `KdsStation` |
| `src/components/kds/PreparingLanes.tsx` | SUB_STATIONS (grill/fryer/cold_prep) – mock, order-ID hash only; not from routing |

## KDS Uses Real Persisted Station Values

**Yes.** The flow is:

1. **API** fetches `order_items.station_override` from the DB and includes it in `KdsOrderItem`.
2. **API** builds `view.stations` from distinct `order.station` and `item.stationOverride`.
3. **useKdsView** groups items by `item.stationOverride ?? order.station ?? "kitchen"` – `stationOverride` is the primary source.
4. **kdsViewToOrders** maps each item to `stationId: i.stationOverride ?? o.station ?? "kitchen"`.
5. **filteredOrders** filters by `item.stationId === activeStationId`, so the active station tab only shows items for that station.

Order items now have `station_override` set at insert (from `items.default_station` or fallback `"kitchen"`), so KDS reads persisted values.

## Remaining Fallback Logic (Kept)

| Location | Logic | Reason |
|----------|-------|--------|
| API `view/route.ts` L184 | `if (stationIds.size === 0) stationIds.add("kitchen")` | Ensures at least one station when there are no orders/items |
| `useKdsView.ts` L16 | `?? "kitchen"` | Fallback when item has no stationOverride and order has no station |
| `kdsViewToOrders` L110 | `?? o.station ?? "kitchen"` | Same resolution hierarchy |
| `page.tsx` `stationsFromView` | `DEFAULT_STATIONS` when `!view?.stations?.length` | Loading state before view is available |
| `page.tsx` sync effect | `STATIONS[0]?.id ?? "kitchen"` | Fallback when no stations exist |

These are valid fallbacks and remain in place.

## What Was Cleaned Up

- **STATIONS display**: Uses `view.stations` (real data) when available. Uses `KNOWN_STATION_DISPLAY` for icon/color on kitchen/bar/dessert; unknown stations get generic icon/color. No longer defaults to hardcoded kitchen/bar/dessert when real data exists.
- **activeStationId sync**: When stations change and the current selection is no longer in the list, switches to the first station. Prevents being stuck on "kitchen" when only "bar" has items.
- **DEFAULT_STATIONS**: Kept only as loading fallback and no longer used for the main station list once `view.stations` is available.

## What Still Blocks Substation Support

1. **No substation field** – No DB field on menu items or order items for substation (e.g. fryer, grill).
2. **PreparingLanes mock** – `assignSubStation(order)` uses order ID hash → grill/fryer/cold_prep. Purely UI, not based on item type or DB.
3. **No substation in KdsView** – `KdsOrderItem` and `KdsStation` have no substation-related fields.
4. **Station vs substation** – Station is a KDS screen (kitchen, bar). Substation would be a lane inside a station. Current model only supports station-level routing.
