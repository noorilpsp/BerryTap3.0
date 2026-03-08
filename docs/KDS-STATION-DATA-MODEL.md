# KDS Station Data Model

Data-model foundation for location-specific KDS stations. Menu item default stations and order item routing use station keys from the location's configured station set.

## Chosen Schema: Option B (location_stations table + items.default_station as key)

**Option A** (free-text only, validate in app): Rejected – no source of truth, no location-specific lists.  
**Option B** (location_stations + items store key): Chosen.  
**Option C** (location_stations + items FK to station id): Rejected for now – would need item schema changes and more migration work.

### Why Option B

- **Location-specific stations**: `location_stations` defines allowed stations per location.
- **Future KDS settings**: Settings UI will manage `location_stations` (add/edit/reorder/deactivate).
- **Validation path**: Future validation can ensure `items.default_station` is in `location_stations` for that location.
- **Backward compatible**: `items.default_station` and `order_items.station_override` stay as varchar (keys), no FK.
- **KDS grouping**: Uses `key` as the station id. Order items and KDS continue to work with string keys.

## Schema

### `location_stations`

| Column       | Type    | Description                                  |
|-------------|---------|----------------------------------------------|
| id          | uuid    | PK                                           |
| location_id | uuid    | FK → merchant_locations, cascade delete      |
| key         | varchar(50) | Stable id for routing (e.g. kitchen, bar) |
| name        | varchar(100) | Display name                            |
| display_order | integer | Order of KDS station tabs                 |
| is_active   | boolean | If false, hidden from KDS and menu assignment |
| created_at  | timestamptz |                                          |
| updated_at  | timestamptz |                                          |

**Unique**: `(location_id, key)`.

### `items.default_station`

- **Type**: `varchar(50)`, nullable.
- **Meaning**: Station key for default routing (e.g. `"kitchen"`, `"bar"`).
- **Constraint**: No FK. Future settings UI should validate against `location_stations` for the item’s location.

### `order_items.station_override`

- **Type**: `varchar(50)`, nullable.
- **Meaning**: Resolved station key persisted at insert.
- **Source**: From `AddItemInput.stationOverride` or `items.default_station` or fallback `"kitchen"`.

## How Location-Specific Stations Work

1. Each location has its own rows in `location_stations` (e.g. kitchen, bar, dessert).
2. Migration 0007 seeds `kitchen`, `bar`, `dessert` for every existing location.
3. `getLocationStations(locationId)` returns active stations for that location.
4. KDS view uses these stations as the primary list; any station keys from order/item data that are not in `location_stations` are still shown (legacy/orphan handling).
5. Station `key` is used as the KDS station id for grouping and filtering.

## Menu Item Routing

Routing hierarchy:

1. `AddItemInput.stationOverride`
2. `items.default_station`
3. Fallback `"kitchen"`

`addItemsToOrder` and `createPickupDeliveryOrder` resolve this and write the result to `order_items.station_override`. KDS groups items by `station_override` (with order-level fallbacks).

## KDS Resolution

- **Station list**: From `location_stations` for the location, plus any keys from orders/items.
- **Item station**: `item.stationOverride ?? order.station ?? "kitchen"`.
- **Grouping**: By station `key`; KDS station tabs use the key as id.
- **Display**: `id` = `key`, `name` from `location_stations` when available.

## Future KDS Settings UI

Settings UI will:

- List and edit `location_stations` for the current location.
- Add/remove stations.
- Reorder (display_order).
- Toggle `is_active`.

Menu item editor will:

- Use `location_stations` to restrict allowed default stations.
- Optionally validate `items.default_station` against that set.

## Migration Notes

- **0007**: Creates `location_stations` and seeds `kitchen`, `bar`, `dessert` per location.
- **Backfill**: Existing `items.default_station` values that match seeded keys continue to work.
- **New locations**: New locations need stations. Either seed on location creation or add a DB trigger. For now, run migration 0007 after adding locations, or add seed logic in the location-creation flow.
