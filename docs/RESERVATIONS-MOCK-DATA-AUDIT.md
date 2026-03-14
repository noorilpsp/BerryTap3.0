# Reservations Mock / Demo Data Audit

**Audit date:** 2025-03-06  
**Goal:** Identify all remaining mock or demo data used in production Reservations UI so it can be removed subsystem by subsystem.

---

## Summary by Subsystem

| Subsystem | Mock items | Production impact | Priority |
|-----------|------------|-------------------|----------|
| Capacity | capacitySlots | High — timeline, overview | P1 |
| Capacity | paceMetrics | High — overview pace strip | P1 |
| Waitlist | elapsedWait, waiting-time logic | High — waitlist panel, overview | P1 |
| Overview | hero stats (walkIns, capacityNow) | Medium — overview | P1 |
| Config | restaurantConfig fallback | Medium — config when no real config | P2 |
| Detail modal | static demo records, serviceStatus fallback | Medium — detail panel | P2 |
| Guest data | guestDatabase fallback | Medium — form autofill | P2 |
| Turn tracker | occupiedTables | High — overview turn tracker | P1 |

---

## 1. Capacity Subsystem

### 1.1 capacitySlots

| Field | Value |
|-------|-------|
| **File** | `src/lib/reservations-data.ts` (lines 541–555) |
| **Used in production** | Yes |
| **Files that consume** | `src/lib/timeline-data.ts` (L4, L215), `src/components/reservations/timeline-capacity-strip.tsx` (L12, L64–78), `src/components/reservations/reservations-shell-layout.tsx` (L36, L279–284), `src/lib/reservations-data.ts` getHeroStats (L657–661) |
| **Real data source** | Compute from real data: reservations (date/time), sessions, table layout. Aggregate occupancy per 30‑min slot (seatsOccupied, totalSeats, occupancyPct), arrivals (reservations in that slot), predictedTurns (from session close estimates). |
| **Complexity** | High — needs aggregation by time range, table capacity, seated sessions, and optional turn-time model. |

### 1.2 paceMetrics

| Field | Value |
|-------|-------|
| **File** | `src/lib/reservations-data.ts` (lines 558–565) |
| **Used in production** | Yes |
| **Files that consume** | `src/components/reservations/pace-strip.tsx` (L13, L117, L149–170) |
| **Real data source** | POS/orders: revenue (today), covers (seated parties), avg turn (from session durations), kitchen tickets/load. Requires integrations with orders, sessions, and optionally kitchen. |
| **Complexity** | High — needs new APIs or domain logic for revenue, covers, turn time, and kitchen metrics. |

---

## 2. Waitlist Subsystem

### 2.1 elapsedWait (waiting-time logic)

| Field | Value |
|-------|-------|
| **File** | `src/lib/reservations-data.ts` (lines 184–194), function `storeWaitlistToWaitlistParty` |
| **Used in production** | Yes |
| **What’s wrong** | `elapsedWait` is hardcoded to `0`. Real elapsed should be derived from `addedAt`. |
| **Files that consume** | `mapReservationsViewToData`, `useReservationsFromStore` → WaitlistPanel, WaitlistCard, WaitlistView, getWaitTimerStatus. |
| **Real data source** | `addedAt` in WaitlistEntry (from DB). Compute `elapsedWait = Math.floor((now - new Date(addedAt)) / 60000)`. |
| **Complexity** | Low — single line change, add elapsed calc in `storeWaitlistToWaitlistParty`. |

### 2.2 waitlist-data mock (bestMatch, NOW_MINUTES, activeWaitlist)

| Field | Value |
|-------|-------|
| **File** | `src/lib/waitlist-data.ts` (lines 91–96, 117–795+) |
| **Used in production** | Yes, for waitlist view that expects `bestMatch`, `altMatches`. |
| **What’s mock** | `waitlistPartyToWaitlistEntry` uses `NOW_MINUTES - quotedWait` for joinedAt; `activeWaitlist` is full mock. `bestMatch`/`altMatches` come from mock table-match logic. |
| **Real data source** | Joined time from `addedAt`; table matches from real floor/session state (tables, sessions, course stages). |
| **Complexity** | Medium–High — table-matching logic must be built from real sessions/tables. |

---

## 3. Overview / Hero Stats Subsystem

### 3.1 Hero stats (covers, reserved, seated, etc.)

| Field | Value |
|-------|-------|
| **File** | `src/lib/reservations-data.ts`, `getHeroStats` (lines 643–694) |
| **Used in production** | Yes |
| **Page** | `src/app/(ops)/reservations/overview/page.tsx` (L16–18) → HeroStats |
| **What’s real** | covers, reserved, seated, waitlist, noShows, noShowPct, upcoming2h — all from `allReservations` and `waitlistPartiesList`. |
| **What’s mock** | `walkIns: 8` (L670), `capacityNow` (L656–661, L686–690) from `capacitySlots` and `restaurantConfig.totalSeats`. |
| **Real data source** | Walk-ins: count sessions/reservations with no prior reservation. capacityNow: derive from current seated sessions + table capacity (or real capacity slots). |
| **Complexity** | Medium — walk-ins need a clear definition; capacityNow depends on capacity-slots replacement. |

---

## 4. Config Subsystem

### 4.1 restaurantConfig fallback

| Field | Value |
|-------|-------|
| **File** | `src/lib/reservations-data.ts` (lines 128–145), `src/lib/floorplan-data.ts` (lines 137–149) |
| **Used in production** | Yes, when real config is missing. |
| **Files that consume** | `src/lib/reservations/reservationsDataContext.tsx` (L53, L117–128), `src/components/reservations/reservation-form-view.tsx` (L20 fallbackRestaurantConfig), `src/lib/reservation-form-data.ts` (L2, L646), `src/lib/reservations-data.ts` (L648, L658) |
| **Real data source** | `ReservationsView.config` from `buildReservationsView` (location name, seating capacity, number of tables, service periods). |
| **Complexity** | Low — fallback only when `initialReservationsView?.config` is null; ensure API always returns config. |

---

## 5. Detail Modal Subsystem

### 5.1 Static demo records (sarahChen, completedBase, noShowBase, cancelledBase)

| Field | Value |
|-------|-------|
| **File** | `src/lib/detail-modal-data.ts` (lines 125–547) |
| **Used in production** | Yes, as fallback when `getReservationById(id)` finds no match in real reservations (L686–687). Also as base templates in `buildDetailFromOverview` via `getReservationByStatus` (L590, L694–711). |
| **Files that consume** | `getReservationById` → `reservations-shell-layout.tsx` (L351) → ReservationDetailPanel |
| **Real data source** | Primary path uses `buildDetailFromOverview(overviewMatch)` when id matches a real reservation. Static records only for unknown ids or as template fields. |
| **Complexity** | Medium — reduce reliance on templates: map all fields from StoreReservation/API; remove or narrow static fallback usage. |

### 5.2 serviceStatus and other fallbacks in buildDetailFromOverview

| Field | Value |
|-------|-------|
| **File** | `src/lib/detail-modal-data.ts` (lines 588–676) |
| **Used in production** | Yes |
| **What’s mock** | `serviceStatus` for seated: `base.serviceStatus ?? sarahChen.serviceStatus` (L666). `createdAt`, `confirmedAt`, `finalCheck`, `actualDuration`, `rating`, `noShowHistory`, etc. come from base (sarahChen/completedBase/etc.). |
| **Real data source** | Orders/sessions: course status, items, subtotal, table time. Reservations: createdAt, confirmedAt. No-show history from reservation/guest history. |
| **Complexity** | High — serviceStatus needs live order/session data; history needs audit/history APIs. |

---

## 6. Guest Data Subsystem

### 6.1 guestDatabase fallback

| Field | Value |
|-------|-------|
| **File** | `src/lib/reservation-form-data.ts` (lines 152–538) |
| **Used in production** | Yes |
| **Files that consume** | `src/components/reservations/reservation-form-view.tsx` (L38, L613–632), `src/components/reservations/reservations-shell-layout.tsx` (L40, L223–226) |
| **Purpose** | Autofill guest by id, phone, or name when editing/creating reservation. |
| **Real data source** | Customers/guests table or CRM; or reservation history (phone/name/visit count). |
| **Complexity** | Medium — needs customer/guest API or derived data from past reservations. |

---

## 7. Turn Tracker Subsystem

### 7.1 occupiedTables

| Field | Value |
|-------|-------|
| **File** | `src/lib/reservations-data.ts` (lines 528–537) |
| **Used in production** | Yes |
| **Files that consume** | `src/components/reservations/turn-tracker.tsx` (L8, L64–68) |
| **Real data source** | Sessions joined with tables; course/stage from orders. Map sessions to OccupiedTable (tableNumber, partySize, courseStage, predictedTurnMin, mealProgressPct, seatedAt). |
| **Complexity** | High — needs session + order + table data and course/turn-time logic. |

---

## 8. Timeline Subsystem

### 8.1 getTimelineCapacity → capacitySlots

| Field | Value |
|-------|-------|
| **File** | `src/lib/timeline-data.ts` (lines 214–216) |
| **Used in production** | Yes |
| **Behavior** | Returns static `capacitySlots` directly. |
| **Real data source** | Same as capacitySlots — computed capacity per slot from reservations + sessions. |
| **Complexity** | Same as capacitySlots — High. |

---

## Recommended Removal Order

1. **Low:** elapsedWait in storeWaitlistToWaitlistParty — quick fix.
2. **Low:** restaurantConfig fallback — ensure API always returns config.
3. **Medium:** guestDatabase — add customer lookup or reservation-history search.
4. **Medium:** detail modal static fallbacks — narrow to real-id-only; map more fields from API.
5. **Medium:** hero stats walkIns and capacityNow — define walk-ins; tie capacity to real capacity.
6. **High:** capacitySlots — build real capacity aggregation.
7. **High:** occupiedTables — build session → turn-tracker pipeline.
8. **High:** paceMetrics — build POS/kitchen metrics pipeline.
9. **High:** waitlist bestMatch/table matching — build real table-match logic.

---

## Files Reference

| File | Mock data |
|------|-----------|
| `src/lib/reservations-data.ts` | restaurantConfig, capacitySlots, paceMetrics, occupiedTables, reservations, waitlistParties, getHeroStats (walkIns, capacityNow), storeWaitlistToWaitlistParty (elapsedWait: 0) |
| `src/lib/detail-modal-data.ts` | sarahChen, completedBase, noShowBase, cancelledBase, buildDetailFromOverview fallbacks |
| `src/lib/reservation-form-data.ts` | guestDatabase, restaurantConfig |
| `src/lib/waitlist-data.ts` | activeWaitlist, waitlistPartyToWaitlistEntry (bestMatch, joinedAt), NOW_MINUTES |
| `src/lib/timeline-data.ts` | capacitySlots, restaurantConfig |
| `src/lib/floorplan-data.ts` | restaurantConfig |
| `src/lib/reservations/reservationsDataContext.tsx` | restaurantConfig fallback |
