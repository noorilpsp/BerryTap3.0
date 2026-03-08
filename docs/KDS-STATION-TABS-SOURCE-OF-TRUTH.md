# KDS Station Tabs – Source of Truth

## Rules

### Primary source: `location_stations`

- KDS tabs use **active** rows from `location_stations` as the main source of truth.
- Only rows with `is_active = true` appear as normal station tabs.
- Tabs are ordered by `display_order`, then `key`.

### No orphan tabs

- Tabs come **only** from active `location_stations`. No merge of order/item station keys.
- Routing uses first active station (or "kitchen" when none) so new items get a catalog key; orphan tabs are not needed.
- **Legacy items**: If an order item has `station_override` set to a key not in the catalog (e.g. from before routing was fixed), that item will not match any station tab filter and will not appear in the KDS column view until the order is completed or the item is updated.

### Fallback

- `"kitchen"` is only added when the location has **no active stations** (brand-new location).
- Hardcoded `DEFAULT_STATIONS` is used only before the view loads (loading state). It does not override real API data.

---

## Rename behavior

- Renaming a station changes **only** the `name` column.
- The `key` stays the same for routing and order/item references.
- KDS tabs show the updated display name from `location_stations` after refresh.

---

## After settings changes

When changes are made in `/kds/settings`:

1. **Navigate back to /kds** – Page remounts and re-fetches; tabs reflect the new catalog.
2. **Return via tab switch** – `visibilitychange` triggers a silent refresh when the tab becomes visible.
3. **Active station sync** – If the current tab station is removed or deactivated, the active station is reset to the first remaining active station.
4. **No active stations** – If there are no active stations (and no orphans), `activeStationId` becomes `""` and the UI shows an empty tab area.

---

## Data flow

1. **GET /api/kds/view**  
   - Fetches active stations via `getLocationStations(locationId)`.  
   - Builds tabs from `location_stations` only (no orphan merge).  
   - Uses `"kitchen"` fallback only when there are no active stations.

2. **stationsFromView(view)**  
   - Uses `view.stations` when `view` exists (including empty arrays).  
   - Uses `DEFAULT_STATIONS` only when `view` is null/undefined (loading).

3. **activeStationId sync**  
   - If the current station is no longer in the list, it switches to the first station.  
   - If there are no stations, it uses `""`.
