# Reservations Mock-to-Real Conversion Audit

**Goal:** Recommend the single highest-value next mock area to replace with real data, and design the conversion.

**Context:** Phase 1 and Phase 2 complete (server-read layout, view refresh path, no duplicate hydration).

---

## A. Exact Files Inspected

| Mock Area | Primary Files | Supporting Files |
|-----------|---------------|------------------|
| **restaurantConfig** | `lib/reservations-data.ts` (definition) | `top-bar.tsx`, `floorplan-top-bar.tsx`, `timeline-view.tsx`, `timeline-top-bar.tsx`, `capacity-bar.tsx`, `upcoming-reservations.tsx`, `reservations-shell-layout.tsx`, `reservation-form-view.tsx`, `reservation-form-data.ts`, `timeline-data.ts`, `floorplan-data.ts` |
| **detail modal / getReservationById** | `lib/detail-modal-data.ts` | `reservations-shell-layout.tsx` |
| **guestDatabase** | `lib/reservation-form-data.ts` | `reservation-form-view.tsx`, `reservations-shell-layout.tsx` |
| **capacitySlots** | `lib/reservations-data.ts` | `reservations-shell-layout.tsx`, `timeline-capacity-strip.tsx`, `capacity-bar.tsx`, `timeline-data.ts`, `getHeroStats` |
| **occupiedTables** | `lib/reservations-data.ts` | `turn-tracker.tsx` |
| **paceMetrics** | `lib/reservations-data.ts` | `pace-strip.tsx` |
| **edit redirect res_001** | `app/(ops)/reservations/edit/page.tsx` | — |

**DB schema checked:** `merchant-locations.ts`, `orders.ts` (servicePeriods, customers, tables, sessions)

---

## B. What Each Mock Area Currently Controls in the UI

| Mock | UI / Behavior Controlled |
|------|--------------------------|
| **restaurantConfig** | Location name in welcome text; total seats/tables for capacity; zones (Main/Patio/Private); service periods (Lunch/Dinner/etc) for timeline/top-bar filters; `currentTime` / `currentDate` for "now" in capacity bar, hero stats, upcoming reservations, and lens metrics; service-period inference for form prefill |
| **detail modal static** | Detail panel content when `?detail=` has no matching reservation (fallback to sarahChen); demo states (confirmed, arriving, seated, etc.) via `getReservationByStatus`; edit form prefill when opening from shell for a given id (uses `getReservationById` + buildDetailFromOverview for real reservations) |
| **guestDatabase** | Guest search in reservation form; prefill by id/phone/name when editing; conflict/risk warnings based on guest no-show history |
| **capacitySlots** | 30‑min occupancy slots in shell lens metrics, timeline capacity strip, capacity bar; hero stats `capacityNow` (pct, occupied, total); "now" indicator positioning |
| **occupiedTables** | Turn tracker (turning soon, recently sat); table course-stage display |
| **paceMetrics** | Pace strip (revenue, covers, turn times, kitchen load) |
| **edit redirect res_001** | `/reservations/edit` redirects to `?action=edit&id=res_001` (hardcoded mock id) |

---

## C. Impact on Real Restaurant Operations

| Mock | Impact | Notes |
|------|--------|------|
| **restaurantConfig** | **Highest** | Used across many surfaces. Wrong time/date breaks "now" calculations. Wrong service periods break timeline/day filters. Wrong capacity breaks hero stats and capacity bars. Location-specific config should drive everything. |
| **detail modal static** | **Medium** | Real reservations from store already work via `buildDetailFromOverview`. Static fallbacks only when no id or id not in list (e.g. demo, broken link). Most real use cases covered. |
| **guestDatabase** | **High** | Real guest lookup and history improve form UX and no-show risk. Without it, every guest is treated as new; no prefill from past visits. |
| **capacitySlots** | **Medium** | Affects capacity visualization and hero stats. Can be computed from reservations + tables once config is real. |
| **occupiedTables** | **Lower** | Turn tracker only. Depends on session/order data and course-stage logic. |
| **paceMetrics** | **Lower** | Analytics display; needs order/session aggregation. |
| **edit redirect res_001** | **Trivial** | One redirect; easy to fix with proper id handling. |

---

## D. Single Best Next Target: **restaurantConfig**

**Recommendation:** Replace **restaurantConfig** with real location/merchant data as the next target.

**Rationale:**

1. **Foundational** — Many other mocks (capacitySlots, getHeroStats, service period filters) depend on it.
2. **DB support** — `merchantLocations` (name, seatingCapacity, numberOfTables) and `servicePeriods` (name, startTime, endTime per location) exist.
3. **Broad usage** — ~12+ components; changes here improve multiple flows at once.
4. **Clear sources** — Name and capacity from location; service periods from `servicePeriods`; `currentTime` / `currentDate` from `new Date()`.
5. **Zones** — Can be derived from floor plans or left as location-based defaults in a first pass.

guestDatabase is a strong second, but is more isolated and can follow once location context and config are real.

---

## E. Proposed Architecture for restaurantConfig

### 1. Extend ReservationsView with config

Add to `ReservationsView`:

```ts
// In reservationsView.ts
config: {
  locationId: string;
  locationName: string;
  totalSeats: number;
  totalTables: number;
  servicePeriods: Array<{ id: string; name: string; start: string; end: string }>;
  zones?: Array<{ id: string; name: string; tables: number }>;  // optional first pass
};
```

`currentTime` and `currentDate` are derived on the client from `new Date()` — no server value needed.

### 2. Add config to buildReservationsView

- Load location: `merchantLocations` by `locationId` → `name`, `seatingCapacity`, `numberOfTables`
- Load service periods: `servicePeriods` by `locationId` (ordered by start)
- Zones: optional, from floor plan sections or static per-location defaults; can start as empty/fallback

### 3. Provide config to consumers

- **Server:** Include `config` in `ReservationsView`; layout passes it through.
- **Client:** `ReservationsDataProvider` exposes `config` in context (or via a hook) for shell, top-bars, timeline, form, etc.
- **Fallback:** If `servicePeriods` is empty, use a minimal default (e.g. Lunch 11:30–14:30, Dinner 17:00–23:00) so UI does not break.

### 4. Time/date handling

- Replace `restaurantConfig.currentTime` with `getCurrentLocalTime24()` (or equivalent) using `new Date()`.
- Replace `restaurantConfig.currentDate` with `new Date()`.
- Remove static `currentTime` / `currentDate` from config; keep only structure from DB.

### 5. Migration path

- Add `config` to ReservationsView; keep `restaurantConfig` as a fallback.
- Components: read from `config` when present, else `restaurantConfig`.
- After all consumers use `config`, remove `restaurantConfig`.

---

## F. Implementation Size and Risk

| Factor | Estimate |
|--------|----------|
| **Size** | Medium — extend view + build, update ~10 consumers |
| **Complexity** | Low–medium — straightforward DB reads, clear shape |
| **Risk** | Low — additive; fallback keeps behavior if config missing |
| **DB work** | None — `merchantLocations`, `servicePeriods` exist |
| **Data quality** | Some locations may lack `servicePeriods` or `seatingCapacity`; need fallbacks |

**Phased approach:**

1. Add `config` to `ReservationsView` and `buildReservationsView`.
2. Add `getLocationConfig(locationId)` (or inline in build) for location + service periods.
3. Switch top-bars, shell, timeline, capacity bar, etc. to use `config` when present.
4. Replace `currentTime`/`currentDate` with real-time client values.
5. Deprecate `restaurantConfig` once all consumers migrated.
