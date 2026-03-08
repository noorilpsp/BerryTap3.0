# KDS Completed Orders / Recall First Slice

## Overview

Provides a "Completed" dropdown of recently bumped orders. Per-order **Recall** un-serves station-scoped items (served → ready), returns the order to READY for that station, and highlights the ticket.

## Files Changed

| File | Change |
|------|--------|
| `src/domain/serviceFlow.ts` | Add `canUnserveItem` (served → ready) |
| `src/app/actions/order-item-lifecycle.ts` | Add `markItemUnserved` |
| `src/app/actions/session-events.ts` | Add `item_recalled` event type |
| `src/domain/serviceActions.ts` | Add `unserveItem` |
| `src/domain/index.ts` | Export `unserveItem` |
| `src/app/api/orders/[id]/items/[itemId]/route.ts` | Handle `status: "ready", recall: true` |
| `src/lib/hooks/useKdsMutations.ts` | Add `handleRecallOrder` |
| `src/app/kds/page.tsx` | Derive completed from view; wire handleRecall |
| `src/components/kds/KDSHeader.tsx` | Recall button (real action) |
| `docs/KDS-RECALL-FIRST-SLICE.md` | This doc |

## Completed List Behavior

### Old (in-memory only)

- Completed list was stored in React state.
- Added on bump via effect when `justBumpedOrderId` was set.
- Refresh or navigation cleared the list.

### New (derived from KDS view)

- Completed list is **derived** from `view.orders` and `view.orderItems` (same data as GET `/api/kds/view`).
- Survives refresh, remount, polling, and visibility refresh.
- No new API or DB; reuses existing KDS view data.

### Completed definition

An order is **completed for a station** when all non-voided items for that order and that station are `status === "served"`. Multi-station orders can have one completed entry per station.

### bumpedAt derivation

`bumpedAt` = `max(servedAt)` across the served items for that order/station. If no `servedAt`, falls back to `new Date().toISOString()`.

### Display rules

- 4-hour cutoff (older entries excluded)
- Sorted by bumpedAt desc
- Cap at 20 entries

## Status Transition Rule

| From | To | Action |
|------|----|--------|
| ready | served | Bump (existing) |
| served | ready | Recall (new; `PUT` with `status: "ready", recall: true`) |

## What Is Supported

| Feature | Behavior |
|---------|----------|
| **Station-scoped recall** | Only items for `bumpedFromStationId` are un-served |
| **Refresh-safe** | Completed list derived from view; survives refresh |
| **Display filter** | Only orders bumped within last 4 hours |
| **Sorting** | Most recent first (bumpedAt desc) |
| **Recall** | Un-serve → ready; list updates on next render (derived) |
| **Duplicate protection** | One entry per (order, station) pair |

## Limitations

- No cross-device sync (view is per-session).
- Stale cutoff is display-only (computed at render time).
