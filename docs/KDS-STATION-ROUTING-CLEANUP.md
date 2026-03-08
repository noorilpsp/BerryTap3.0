# KDS Station Routing Cleanup

## Summary

Routing was updated so new order items resolve to a station key from the location’s active `location_stations` when possible. KDS tabs now use only active `location_stations` (no orphan tabs).

---

## Old behavior

### Resolution order (before)

1. Explicit input `stationOverride` (addItemsToOrder only)
2. Menu item `defaultStation`
3. **Hardcoded `"kitchen"`** when neither was set

So items without a menu default (or with no override) were always persisted with `station_override = "kitchen"`. If the location had no "kitchen" in `location_stations`, those items had no matching tab unless we added **orphan tabs** (tabs for keys that appear in order/item data but not in the catalog). Orphan logic (and later “skip kitchen/bar/dessert when catalog has stations”) was there so new tickets still showed up.

---

## Current resolution order (catalog-safe)

1. **Explicit input** `stationOverride` — only if it is a valid active station for that location
2. **Menu item** `defaultStation` — only if it is a valid active station for that location
3. **First active station** from `location_stations` (by `display_order`)
4. **`"kitchen"`** only when the location has **no active stations**

If explicit override or menu default is not in the active catalog (invalid, inactive, or removed), we **do not** persist it; we fall through to the next valid step.

### New validation rule

Before using `input.stationOverride` or `menuItem.defaultStation`, we check that the key exists in the active `location_stations` set for that location. Validation uses `getActiveStationKeysForRouting(locationId)`, which loads active station keys once per request/flow to avoid repeated DB queries.

### Why invalid menu defaults are no longer persisted

Previously, if a menu item had `defaultStation = "bar"` but "bar" was deactivated or removed from `location_stations`, we still persisted `"bar"`. Those items had no matching KDS tab. Now we reject invalid defaults and fall through to the first active station (or "kitchen" if none), so persisted values always match an active tab.

---

## Why orphan tabs were needed before

- Routing used `"kitchen"` (and sometimes other defaults) when there was no menu default.
- Many locations don’t have a station with key `"kitchen"` in `location_stations`.
- Without orphan tabs, those items would have had no tab to show under.
- Orphan tabs (and the “skip built-in defaults” rule) were a workaround so tickets still appeared.

---

## Why they are no longer needed after the fix

- New items are resolved to the **first active station** (or "kitchen" only when there are zero active stations).
- So `station_override` is almost always a key that exists in `location_stations`.
- Tabs can be built solely from active `location_stations`; no need to merge in keys from order/item data.

---

## Edge cases

### Zero active stations

- `getActiveStationKeysForRouting(locationId).firstKey` returns `null`.
- We fall back to `"kitchen"` so items still get a key.
- KDS view adds a single `"kitchen"` tab when the catalog is empty, so those items still show.
- **Recommendation:** Configure at least one active station per location so routing uses a real catalog key.

### Menu item defaultStation not in catalog (now handled)

- We **validate** that `menuItem.defaultStation` is in active `location_stations` before using it.
- If an item’s default is a deactivated or removed station, we reject it and use first active station (or "kitchen"). Invalid menu defaults are no longer persisted. - 
### Legacy items with non-catalog keys

- Existing order items may have `station_override` set to keys that are no longer (or never were) in the catalog.
- Those items do not match any station tab; they won’t show in the KDS column view.
- They remain in the database; order totals and history are unchanged. No data migration was done.
- **New items** will always get a catalog-safe key after this fix.

---

## Rename behavior (unchanged)

- Station **name** can change in settings.
- Station **key** is stable; routing and `station_override` refer to the key.
- Renaming only updates display; no change to resolution or tabs logic.
