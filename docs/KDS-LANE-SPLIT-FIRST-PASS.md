# KDS Lane Split – First Pass

## Current Problem

When a station-scoped order contains items belonging to different substations/lane buckets (e.g. grill + fryer + cold_prep), clicking **Start** on the ticket moves the whole ticket into a single lane based on the **first matching item**. This is wrong because:

- Grill items should appear in the GRILL lane
- Fryer items in the FRYER lane
- Cold prep items in the COLD PREP lane

Operators need to see and act on each substation’s items in the correct lane.

## Root Cause

1. **`resolveOrderSubStation`** in `src/app/kds/page.tsx` picks the first item that routes to the active station and uses its substation.
2. The order gets a single `subStation` (e.g. `"grill"`).
3. **PreparingLanes** groups orders by `order.subStation` and shows one ticket per order.
4. All items stay on that one ticket, so multi-lane orders are forced into a single lane.

## Chosen Compromise (Hybrid Model)

- **NEW** = merged: one ticket per order per station
- **PREPARING** = split: lane-specific entries (one per substation with work)
- **READY** = merged: one ticket per order per station, with substation progress summary

Expo/pass sees one READY ticket with clear visibility into which substations are ready and which are still waiting.

## Derived Lane-Entry Model

A **lane entry** is a derived view model computed from existing KDS view/order data:

| Field          | Description                                                |
|----------------|------------------------------------------------------------|
| `orderId`      | Parent order ID                                            |
| `lane`         | Substation: grill, fryer, cold_prep, unassigned            |
| `items`        | Items for that lane within the active station              |
| `orderNumber`  | For display                                                |
| `orderType`    | dine_in / pickup                                           |
| `tableNumber`  | For display                                                |
| `customerName` | For display                                                |
| `createdAt`    | For ordering / age                                         |
| `stationStatuses` | Per-station status; lane entry uses status of lane items |

Computation (`src/lib/kds/derivePreparingLaneEntries.ts`):

- Input: preparing orders (already filtered for station).
- For each order, group station items by substation (or `unassigned`).
- For each lane with at least one pending or preparing item, emit a lane entry.
- Lane entry shows all lane items; actions apply only to the items in that lane.

## Final Column Behavior

| Column | Behavior |
|--------|----------|
| **NEW** | Merged: one ticket per order per station |
| **PREPARING** (kitchen) | Split: separate lane entries (grill, fryer, cold_prep, unassigned) |
| **PREPARING** (bar/dessert) | Merged: single column, ticket-based |
| **READY** | Merged: one ticket per order, with substation summary for kitchen |

## Merged READY Summary Model

For kitchen READY tickets, a **substation summary** is derived:

| Field | Description |
|-------|-------------|
| `readyLanes` | Substations with all items ready (e.g. fryer, cold_prep) |
| `waitingLanes` | Substations with pending/preparing items (e.g. grill) |
| `allReady` | `waitingLanes.length === 0` |

**When does an order appear in READY (kitchen)?** Orders with at least one substation whose items are all ready. This allows partial-ready tickets (e.g. fryer + cold_prep done, grill still cooking).

**Display:** Ready: Fryer, Cold Prep | Waiting: Grill

For bar/dessert (no substations), READY = orders with station status "ready" (unchanged).

## PREPARING Behavior

1. Grill items appear in the GRILL lane.
2. Fryer items in the FRYER lane.
3. Cold prep items in the COLD PREP lane.
4. Items without a default substation in the UNASSIGNED lane.
5. One order can appear in multiple lanes.
6. **Start** and **Ready** act only on the items in that lane entry.

## READY Render Rule

- **Kitchen:** Orders with at least one substation whose items are all ready appear in READY (merged ticket with Ready/Waiting summary).
- **Other stations:** Orders with station status `"ready"` appear in READY (unchanged).
- One merged ticket per order; no duplicate tickets across lanes.

## READY Action Rule

Actions must only affect items in the correct status. Mutations filter by `fromStatus` (the status we are advancing from), so:

- **READY (Complete)** button: sends `newStatus: "ready"`. Backend updates only items that are currently **preparing** → ready. Pending items are never touched.
- **BUMP** button: sends `newStatus: "served"`. Backend updates only items that are currently **ready** → served. Preparing or pending items are never touched.

So a single READY/BUMP action never incorrectly advances unfinished (pending or still-preparing) items.

## Partial-Ready Tickets: What They Can and Cannot Do

- **Can:** Show progress (Ready: fryer, cold_prep | Waiting: grill). Show **READY** button to complete the remaining substations (preparing → ready). When all substations are ready, show **BUMP** to mark the station as served.
- **Cannot:** BUMP does not run until the ticket’s station status is fully ready (all substations done). Until then, the only action is READY (Complete), which only advances items that are already **preparing** to ready.
- Unfinished items (pending or preparing) are never advanced by the wrong action: the mutation only updates items whose current status matches the transition (`preparing` for Complete, `ready` for Bump).

## Files Changed

| File | Change |
|------|--------|
| `src/app/kds/page.tsx` | Add `status` to OrderItem; extend `handleAction` with optional `itemIds` |
| `src/lib/kds/derivePreparingLaneEntries.ts` | Lane entry derivation; add `deriveReadySubstationSummary`, `getOrdersForReadyColumn` |
| `src/lib/hooks/useKdsMutations.ts` | Extend mutations to accept optional `itemIds` |
| `src/components/kds/KDSColumns.tsx` | Use `getOrdersForReadyColumn` for READY; pass `getReadySubstationSummary`, `disableStatusFilter` |
| `src/components/kds/PreparingLanes.tsx` | Accept `laneEntries`; render lane-specific tickets and bound actions |
| `src/components/kds/KDSColumn.tsx` | Add `getReadySubstationSummary`, `disableStatusFilter`; pass summary to KDSTicket |
| `src/components/kds/KDSTicket.tsx` | Add `readySubstationSummary`; render Ready/Waiting badge; BUMP sends `served` (not `ready`); `ActionStatus` includes `served` |
| `src/lib/hooks/useKdsMutations.ts` | Comment: status filter ensures READY actions never advance wrong items |

## Current Limitations

- Station routing is unchanged.
- No realtime or item-level persistence changes.
- No full item-only KDS redesign
- Bar/dessert READY has no substation summary (single station, no lanes)

## Later Improvements
- Realtime updates
- Item-level status tracking if persistence changes.
- More advanced item-only KDS model.
