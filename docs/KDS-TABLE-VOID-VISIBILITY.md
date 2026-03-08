# KDS & Table Page: Void Item Visibility Fix

## Summary

Voided items are now **visible** in both KDS and the table page, clearly labeled as voided, while remaining excluded from active workflow logic, totals, and billing.

## Files Changed

| File | Change |
|------|--------|
| `src/app/api/kds/view/route.ts` | Include voided items in view payload (already included; no filter on `voidedAt`) |
| `src/app/kds/page.tsx` | Include all items (voided + non-voided) in `order.items`; use only non-voided for status, stationStatuses, subStation; exclude all-voided orders (return null) |
| `src/components/kds/KDSTicket.tsx` | Add `voidedAt` to `OrderItem`; render voided items with strikethrough, muted style, VOIDED badge; disable refire/void for voided |
| `src/lib/kds/derivePreparingLaneEntries.ts` | Add `voidedAt` to `LaneEntryItem`; filter voided from lane logic (hasWork, statusFromItems, ageTimestamp, getOrdersForReadyColumn) |
| `src/components/table-detail/order-list.tsx` | Add "Voided" section in ByWaveView; show voided items with VOIDED badge; disable swipe actions for voided; block Mark Served for voided |
| `src/app/table/[id]/page.tsx` | Split mealProgress: `allItemsWithSeat` (display) includes voided; `activeItemsWithSeat` (workflow) excludes voided; `waveItemsById` uses display list |
| `src/components/table-detail/wave-timeline.tsx` | Render voided items in expanded list with strikethrough, muted style, VOIDED badge |

## Old Behavior

- **KDS**: Voided items were excluded from the view payload or filtered out early; tickets did not show them.
- **Table page**: Voided items were skipped in `ByWaveView` (not rendered) and had no dedicated section.

## New Behavior

### KDS

- **Payload**: Voided items are included in `orderItems` and in each order’s `items` array.
- **Status / lanes / actions**:
  - Order status, station statuses, subStation, lane derivation, and actions use only **non-voided** items.
- **Ticket display**:
  - Voided items are shown with:
    - Strikethrough text
    - Muted style (opacity)
    - "VOIDED" badge
  - Voided items are not actionable (no Re-fire, Void).
- **Orders with all voided items**: Excluded from KDS entirely (see below).

### All-Voided Orders (KDS)

Orders where every item is voided are **excluded from the KDS workflow**:

- They do **not** appear in any column (NEW, PREPARING, READY).
- They are **not** bumpable or actionable.
- They are **not** shown in KDS at all.
- This prevents them from appearing as “served” tickets with a BUMP button.

### Table Page

- **BySeatView**: Voided items appear in each seat’s list (no change; they were already shown).
- **ByWaveView**: Voided items appear in a new **Voided** section.
- **ItemCard**:
  - VOIDED badge on voided items
  - Swipe actions disabled (no Mark Served, no Void)
  - Existing `statusConfig` styling (strike, opacity) still applies

## Display vs Workflow Filtering (Table Page)

| Data Path | Includes Voided? | Purpose |
|-----------|------------------|---------|
| `waveItemsById` (for WaveTimeline display) | Yes | Show all items in expanded wave list |
| Wave status, chip count, `nextFireableWaveNumber` | No | Workflow logic |
| `activeItemsWithSeat` | No | `hasMealStarted`, status derivation |
| Bill, seat totals, close validation | No | Business logic |

## What Voided Items Are Still Excluded From

- Bill (payment-modal filters `item.status !== "void"`)
- Seat totals (`getSeatTotal` filters `i.status !== "void"`)
- KDS active workflow:
  - Status derivation
  - Station statuses
  - Lane derivation (hasWork, statusFromItems)
  - Actions (`computeKdsActions` skips voided)
- Wave progression and wave action buttons
- Close validation / outstanding logic (`restaurantStore` excludes voided)
- Kitchen delays (voided items skipped)

## Remaining Limitations

- Voided items are displayed but not editable.
- All-voided orders are not shown in KDS (excluded for workflow clarity).
- `BySeatView` does not have a separate "Voided" section; voided items appear inline with active items in each seat.
