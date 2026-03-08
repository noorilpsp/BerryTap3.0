# KDS Refire (Remake) First Slice

## Overview

Refire allows kitchen staff to remake an item that was already sent. The item moves back to pending, timers reset. Refire is item-level; only the refired item shows the REMAKE indicator.

## Files Changed

| File | Change |
|------|--------|
| `src/app/api/orders/[id]/items/[itemId]/refire/route.ts` | Accept `eventSource: "kds"` from body |
| `src/app/api/kds/view/route.ts` | Add `refiredAt` to orderItems response |
| `src/lib/kds/kdsView.ts` | Add `refiredAt` to KdsOrderItem type |
| `src/lib/hooks/useKdsMutations.ts` | Add `handleRefireItem` |
| `src/app/kds/page.tsx` | Wire `handleRefire`; derive `isRemake`, `isFullRemake`; add `refiredAt` to items |
| `src/lib/kds/derivePreparingLaneEntries.ts` | Mixed-state `statusFromItems`; `isFullRemake`, `refiredAt` on items |
| `src/components/kds/KDSTicket.tsx` | Item-level REMAKE badge; ticket-level only when `isFullRemake` |
| `src/components/kds/PreparingLanes.tsx` | Pass `isFullRemake` through |
| `docs/KDS-REFIRE-FIRST-SLICE.md` | This doc |

## Backend Behavior

### POST /api/orders/[id]/items/[itemId]/refire

- Body: `{ reason: string, eventSource?: "kds" | "api" }`
- Validates item exists, not voided, not already refired
- Sets `refiredAt = now`, records `item_refired` event
- Sets `status = "pending"`, clears `startedAt`, `readyAt`, `servedAt`
- Recalculates totals

## Ticket Status: Mixed-State Rule

`statusFromItems` (page.tsx, derivePreparingLaneEntries.ts):

- all pending → `"pending"` (NEW)
- any pending + any ready/preparing → `"preparing"` (PREPARING)
- any preparing → `"preparing"`
- any ready and none pending/preparing → `"ready"` (READY)
- else → `"served"`

When one item is refired (pending) and others are ready, the ticket moves to **PREPARING**, not NEW.

## KDS Behavior After Refire

1. User long-presses item → Refire dialog → selects reason → confirms
2. `handleRefire` calls `handleRefireItem(orderId, itemId, reason)`
3. On success: patches view; item status → pending, timestamps cleared, `refiredAt` set
4. Ticket moves to **PREPARING** if other items are ready/preparing; to NEW only if all items pending
5. Ticket highlights briefly, scrolls into view

## REMAKE Indicator

- **Item-level:** Each item with `refiredAt != null` shows a REMAKE badge next to the item
- **Ticket-level:** REMAKE badge at top of ticket only when `isFullRemake` (all non-voided items refired)
- **Sorting:** `isRemake` (any item refired) keeps remake tickets prioritized in columns
- **canRefire:** Only items without `refiredAt` can be refired (one refire per item)

## Column Behavior After Refire

| Scenario | Column |
|----------|--------|
| All items pending (all refired or new) | NEW |
| 1 refired (pending) + others ready/preparing | PREPARING |
| All items ready | READY |

## Remaining Limitations

- No `remakeReason` displayed (reason stored in session event only)
- Refire once per item
- No cross-device real-time update
