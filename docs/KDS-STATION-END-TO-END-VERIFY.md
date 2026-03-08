# KDS Station End-to-End Verification

End-to-end routing chain and verification steps for station assignment.

## Routing Chain

```
location_stations (catalog)
    ↓
items.default_station (menu item default)
    ↓
order_items.station_override (persisted at insert)
    ↓
GET /api/kds/view (stations + orderItems)
    ↓
useKdsView / kdsViewToOrders (grouping)
    ↓
KDS page filteredOrders (filter by activeStationId)
```

### 1. `location_stations`

| Action | Where | Fallback |
|--------|-------|----------|
| **Read** | `getLocationStations(locationId)` in GET /api/kds/view | — |
| **Write** | Migration 0007 seeds kitchen, bar, dessert per location; future settings UI | — |

### 2. `items.default_station`

| Action | Where | Fallback |
|--------|-------|----------|
| **Read** | `addItemsToOrder` (dine-in), `createPickupDeliveryOrder` (pickup/delivery) | — |
| **Write** | Database/seed/admin (no UI yet) | — |
| **Resolution** | `menuItem.defaultStation ?? "kitchen"` when no input override | `"kitchen"` |

### 3. `order_items.station_override`

| Action | Where | Fallback |
|--------|-------|----------|
| **Read** | GET /api/kds/view, POS route, kitchen delays | — |
| **Write** | `addItemsToOrder` insert, `createOrderWithItemsForPickupDelivery` insert | — |
| **Resolution** | `input.stationOverride ?? menuItem.defaultStation ?? "kitchen"` | `"kitchen"` |

### 4. GET /api/kds/view

| Step | Logic |
|------|-------|
| Stations | `getLocationStations` → merge with order/item station keys → fallback `"kitchen"` if empty |
| Order items | Include `stationOverride` from DB |
| Grouping | Client: `item.stationOverride ?? order.station ?? "kitchen"` |

### 5. KDS Page Grouping/Filtering

| Step | Logic |
|------|-------|
| `kdsViewToOrders` | `stationId: i.stationOverride ?? o.station ?? "kitchen"` per item |
| `filteredOrders` | `order.items.filter(item => item.stationId === activeStationId)` |
| Station tabs | From `view.stations` (location_stations + orphans) |

## SQL Checks

### location_stations

```sql
-- Stations for a location
SELECT id, location_id, key, name, display_order, is_active
FROM location_stations
WHERE location_id = '<location-uuid>'
  AND is_active = true
ORDER BY display_order, key;
```

### items.default_station

```sql
-- Items with non-null default station
SELECT id, name, default_station, location_id
FROM items
WHERE location_id = '<location-uuid>'
  AND default_station IS NOT NULL;

-- Count by station
SELECT default_station, count(*)
FROM items
WHERE location_id = '<location-uuid>'
GROUP BY default_station;
```

### order_items.station_override

```sql
-- Recent order items and their station
SELECT oi.id, oi.order_id, oi.item_name, oi.station_override, oi.created_at
FROM order_items oi
JOIN orders o ON o.id = oi.order_id
WHERE o.location_id = '<location-uuid>'
  AND oi.voided_at IS NULL
ORDER BY oi.created_at DESC
LIMIT 20;
```

## Test Flow

1. **Run migration 0007** (if not done): `npm run db:migrate:0007`
2. **Assign menu item to bar**:
   ```sql
   UPDATE items SET default_station = 'bar' WHERE id = '<item-uuid>';
   ```
3. **Place a dine-in order**: Table page → add that item → Send wave 1.
4. **Place a pickup order**: Include that item via API or POS.
5. **Open KDS** for the location.
6. **Switch to Bar** tab: item should appear there.
7. **Check console** (DEV): see `[kds-routing]` logs.

## Expected DEV Logs

### addItemsToOrder (dine-in)

```
[kds-routing] addItemsToOrder insert {
  orderId: '...',
  itemId: '...',
  itemName: '...',
  resolvedStation: 'bar',
  source: 'menuItem'
}
```

If station is not in location_stations:

```
[kds-routing] station not in location_stations {
  locationId: '...',
  stationKey: 'bar',
  itemId: '...'
}
```

### createPickupDeliveryOrder (pickup/delivery)

```
[kds-routing] createPickupDeliveryOrder lineItem {
  itemId: '...',
  itemName: '...',
  resolvedStation: 'bar',
  source: 'menuItem'
}
```

### GET /api/kds/view

```
[kds-routing] GET /api/kds/view {
  locationId: '...',
  locationStationsFromDb: ['kitchen', 'bar', 'dessert'],
  distinctStationOverrideInItems: ['bar', 'kitchen'],
  finalStations: ['kitchen', 'bar', 'dessert']
}
```
