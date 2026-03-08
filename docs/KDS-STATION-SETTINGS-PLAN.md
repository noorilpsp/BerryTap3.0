# KDS Station Settings – First Slice Plan

## Overview

First slice of the KDS station settings system: manage `location_stations` rows from the app. No menu item station editing, no substations.

---

## Files Added / Changed

### Added

| File | Purpose |
|------|---------|
| `src/app/api/kds/stations/route.ts` | GET (read model), POST (create station) |
| `src/app/api/kds/stations/[id]/route.ts` | PATCH (rename, activate/deactivate) |
| `src/app/api/kds/stations/reorder/route.ts` | PUT (reorder) |
| `src/lib/kds/stationSettingsView.ts` | View type + `isStationSettingsView` guard |
| `src/lib/hooks/useStationSettingsView.ts` | View hook (fetch + patch) |
| `src/lib/hooks/useStationSettingsMutations.ts` | Mutations hook (create, update, reorder) |
| `src/app/kds/settings/page.tsx` | Settings page (thin shell + UI) |
| `docs/KDS-STATION-SETTINGS-PLAN.md` | This document |

### Changed

| File | Change |
|------|--------|
| `src/components/kds/KDSHeader.tsx` | Optional `settingsHref` prop; Settings icon link |
| `src/app/kds/page.tsx` | Pass `settingsHref="/kds/settings"` to KDSHeader |

---

## Route Map

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/kds/stations?locationId=<uuid>` | Read model (location + stations) |
| POST | `/api/kds/stations` | Create station (body: `{ locationId, name }`) |
| PATCH | `/api/kds/stations/[id]` | Update station (body: `{ name?, isActive? }`) |
| PUT | `/api/kds/stations/reorder?locationId=<uuid>` | Reorder (body: `{ stations: [{ id, displayOrder }] }`) |

---

## Data Flow

1. **Page** resolves `locationId` via `getCurrentLocationId()`
2. **useStationSettingsView** fetches GET `/api/kds/stations`, returns `{ view, loading, error, refresh, patch }`
3. **useStationSettingsMutations** takes `{ locationId, view, patch, refresh }`, returns `{ createStation, updateStation, reorderStations }`
4. Mutations call fetchPosEnvelope, patch local view on success, refresh on failure
5. **Settings page** composes hooks, renders list, add form, inline rename, move up/down, active toggle

---

## What This Slice Supports

- List stations (all, active + inactive) ordered by `displayOrder`
- Add station (name → auto key, unique per location)
- Rename station (display name only; key unchanged)
- Reorder stations (up/down → update `displayOrder`)
- Activate/deactivate stations (toggle `isActive`)
- Auth: `verifyLocationAccess` for GET/POST/reorder; `getUser` + membership check for PATCH
- Response envelope: `posSuccess` / `posFailure` for all routes

---

## What Remains for Later

- Menu item station assignment (items.default_station)
- Substations
- Delete station (with validation: no active orders/items referencing)
- Bulk operations
- Station icons / colors (currently from `KNOWN_STATION_DISPLAY` in KDS page)

---

## Risks / Follow-up Cleanup

1. **Key normalization** – `normalizeStationKey` produces keys like `grill`, `pastry_2` when duplicated. Keys are stable; renaming only changes display name.
2. **Reorder UX** – Current up/down buttons; drag-and-drop can be added later.
3. **Idempotency** – Mutations send `Idempotency-Key` via fetchPos; API does not enforce. Add if needed for critical paths.
4. **Caching** – GET has no cache headers; suitable for settings. Add cache if needed for high traffic.
