# Menu Item Station Assignment — First Slice Plan

## Overview

Allow a location's menu items to assign `default_station` from the active `location_stations` catalog. This first slice adds the UI and validation while keeping the existing routing model unchanged.

## Files Changed

| File | Changes |
|------|---------|
| `src/types/menu-item.ts` | Add `defaultStation?: string \| null` to `MenuItem` |
| `src/components/item-drawer.tsx` | Add station select UI, schema field, `useStationSettingsView` |
| `src/app/dashboard/(dashboard)/menu/menu-context.tsx` | `transformItem` defaultStation, `createItem`/`updateItem` payload |
| `src/app/api/items/route.ts` | POST: accept and validate `defaultStation`, insert into items |
| `src/app/api/items/[id]/route.ts` | PUT: accept and validate `defaultStation`, update items |

## Route / Form Flow

1. **Create flow**: User opens Item Drawer → fills form → selects Prep Station (optional) → Save → `createItem` → POST `/api/items` with `defaultStation` → API validates against active `location_stations` → inserts item with `default_station`.
2. **Edit flow**: User opens Item Drawer for existing item → form loads with `defaultStation` → user changes station or clears → Save → `updateItem` → PUT `/api/items/[id]` with `defaultStation` → API validates → updates item.

## Validation Rules

- `defaultStation` must be `null`, empty string, or a valid **active** station key from `location_stations` for the item's location.
- Max length: 50 characters.
- No arbitrary free-text values; UI only offers active stations or "None".
- API rejects unknown or inactive station keys with 400.

## Downstream Routing

The menu assignment does **not** change routing logic. Order routing continues:

1. `order_items.station_override` (valid) → use it
2. `items.default_station` (valid) → use it
3. First active station key → fallback
4. `"kitchen"` if no active stations

See `getActiveStationKeysForRouting` and order creation/add-items flows for details.

## What This Slice Supports

- Menu items can assign a default KDS/prep station from active `location_stations`.
- Station select in Item Drawer (create/edit).
- Only active stations are selectable.
- Inactive/invalid current station shown with warning; user can pick active or None.
- No active stations: clear message; unset allowed.
- Validation on create and update; no free-text station keys.

## What Remains for Later

- Substations
- Advanced routing rules (e.g. by modifier)
- Bulk station assignment
- Migration tooling for existing items

## Risks and Cleanup

- **API response shape**: Items and categories use `posSuccess`; menu context may expect raw arrays. If items fail to load, check whether extraction of `data` is needed.
- **Select display**: Radix Select with an inactive value but no matching `SelectItem` may show the raw value; UX is acceptable.
- **Caching**: Item GET uses `Cache-Control: no-store`; `defaultStation` should be fresh.
