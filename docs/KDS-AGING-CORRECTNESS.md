# KDS Aging Correctness

Timers, urgency colors, sorting, and queue numbering use stage-appropriate timestamps so dine-in (fired) orders age correctly.

## Old vs New Timestamp Model

| Aspect | Old (incorrect) | New (correct) |
|--------|-----------------|---------------|
| **NEW column aging** | `order.createdAt` | `order.firedAt ?? order.createdAt` |
| **PREPARING column aging** | `order.createdAt` | Earliest `startedAt` of station items, else earliest `sentToKitchenAt`, else arrival |
| **READY column aging** | `order.createdAt` | Earliest `readyAt` of station items |
| **Queue numbering** | Mixed (createdAt for NEW, different for READY) | Single rule: arrival order by `firedAt ?? createdAt` for all columns |
| **Lane entries (PREPARING)** | `order.createdAt` | Earliest `startedAt` or `sentToKitchenAt` of lane items, else `firedAt ?? createdAt` |

### Why `firedAt ?? createdAt`?

- **Dine-in**: Order is placed, then fired. Age should reflect time since kitchen received it (`firedAt`), not when it was created.
- **Pickup/delivery**: No fire step; `firedAt` is null. Use `createdAt` (equivalent to "when kitchen received it").

## Timestamp Source per Column

| Column | Age timestamp source |
|--------|----------------------|
| **NEW** | `order.firedAt ?? order.createdAt` |
| **PREPARING** | Earliest `startedAt` of station items; fallback earliest `sentToKitchenAt`; fallback arrival |
| **READY** | Earliest `readyAt` of station items; fallback `createdAt` |
| **Lane entries (grill/fryer/etc.)** | Earliest `startedAt`/`sentToKitchenAt` of lane items; fallback `firedAt ?? createdAt` |

## Sorting Rule

Oldest-first, using the stage-appropriate timestamp:

- **NEW**: sort by `firedAt ?? createdAt`
- **PREPARING**: sort by preparing timestamp (same as age)
- **READY**: sort by `readyAt` (same as age)
- **Lane entries**: sort by `ageTimestamp` (lane-level preparing timestamp)

## Queue Numbering Rule

**Single rule for all columns**:

> Queue position = global station-visible arrival order by `firedAt ?? createdAt` (ascending).

- Same rule for NEW, PREPARING, and READY.
- READY no longer uses a different numbering scheme than NEW/PREPARING.

## Thresholds

Unchanged:

- Yellow: 5 minutes
- Red: 10 minutes

Thresholds apply to the stage-appropriate age (time since the relevant timestamp).

## Implementation

- `src/lib/kds/agingHelpers.ts`: `getArrivalTimestamp`, `getAgeTimestampForColumn`
- `src/lib/kds/derivePreparingLaneEntries.ts`: `ageTimestamp` per lane entry
- `src/components/kds/KDSColumn.tsx`: sorting and queue use stage timestamps; passes `ageTimestamp` to `KDSTicket`
- `src/components/kds/KDSTicket.tsx`: timer/urgency use `ageTimestamp ?? order.createdAt`
- `src/components/kds/PreparingLanes.tsx`: lane entries use `ageTimestamp`; non-lane orders use `getAgeTimestampForColumn`; queue uses `getArrivalTimestamp`

## Remaining Limitations

1. **No item-level granularity in NEW column**  
   NEW shows order-level age; there is no per-item "arrival" before first touch. Acceptable: NEW items haven’t been touched yet.

2. **READY fallback**  
   If no item has `readyAt` (shouldn’t happen for normal READY orders), we fall back to `order.createdAt`. Defensive only.

3. **Polling-based**  
   Timestamps update when the view is refreshed; no realtime push.

4. **Snooze/wake**  
   Snooze still uses the same age timestamp semantics. No change to snooze behavior.
