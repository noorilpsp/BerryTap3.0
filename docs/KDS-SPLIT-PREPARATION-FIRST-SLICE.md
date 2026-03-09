# KDS Split Work-Groups — First Slice

## Overview

Split work-groups allow cooks to split order items into separate tickets in NEW and PREPARING, while keeping READY merged by order. This first slice adds the minimum UI and mutation flow to create and clear prep groups.

## Split-awareness by column

| Column   | Split-aware? | Behavior |
|----------|--------------|----------|
| **NEW**  | Yes          | One ticket per work-group with pending items |
| **PREPARING** | Yes     | One ticket per work-group with preparing items |
| **READY** | No          | Stays merged by order (one ticket per order) |

READY remains order-level by design in this version. Bump, completed, and recall stay order-level.

## Files Changed

| File | Change |
|------|--------|
| `src/app/api/orders/[id]/items/[itemId]/route.ts` | Add `prepGroup` to PUT body; update `order_items.prep_group` |
| `src/lib/hooks/useKdsMutations.ts` | Add `handleSplitToNewTicket`, `handleUnsplitToMain` |
| `src/components/kds/KDSTicket.tsx` | Item menu: Split/unsplit; split badge; unique layoutId for split work-groups (NEW layout fix) |
| `src/components/kds/KDSColumns.tsx` | Pass split/unsplit handlers; derive preparing entries with `["unassigned"]` when no substations |
| `src/components/kds/KDSColumn.tsx` | Pass split/unsplit props; READY: work-group–scoped item filter (ready/served items from ready/served groups only) |
| `src/components/kds/PreparingLanes.tsx` | Pass split/unsplit; no-lanes: lane entries + work-group–filtered fallback (no full-order fallback when no preparing work) |
| `src/app/kds/page.tsx` | Wire split/unsplit handlers from mutations |
| `src/lib/kds/derivePreparingLaneEntries.ts` | READY visibility: partition by (prepGroup, lane); include when any work-group ready; PREPARING no-lanes uses synthetic unassigned |
| `docs/KDS-SPLIT-PREPARATION-FIRST-SLICE.md` | This doc |

## Split / Unsplit Interaction

### How split is triggered

1. Long-press an item in NEW or PREPARING (same gesture as Re-fire / Void).
2. Item options popover opens.
3. Tap **"Split to new ticket"** (only when the ticket is the main group).
4. The item is assigned to a new prep group (`split` + timestamp).
5. After success, the view patches; NEW/PREPARING re-derive and show separate tickets.

### How unsplit is triggered

1. Long-press an item in a **split** ticket (one with the "Split ticket" badge).
2. Item options popover opens.
3. Tap **"Move back to main ticket"** (only when the ticket is a split group).
4. The item’s `prep_group` is cleared (null).
5. After success, the view patches; the item reappears in the main ticket.

### Visibility rules

- **"Split to new ticket"** appears only when the ticket is main (`prepGroup` null or `"main"`).
- **"Move back to main ticket"** appears only when the ticket is a split group (`prepGroup` set and not `"main"`).
- Split/unsplit actions are hidden in READY (merged column).

## Mutation / API Shape

### PUT /api/orders/[id]/items/[itemId]

Add `prepGroup` to the JSON body:

- **Split:** `{ prepGroup: "split" + Date.now().toString(36).slice(-6), eventSource: "kds" }`
- **Unsplit:** `{ prepGroup: null, eventSource: "kds" }`

`prepGroup` must be `null` or a non-empty string (max 50 chars). The API performs a direct `order_items.prep_group` update.

## How groups appear in NEW and PREPARING

### NEW

- `deriveNewWorkGroupEntries` partitions items by `prep_group ?? "main"`.
- One ticket per `(orderId, prepGroup)` with pending items at the active station.
- Split tickets show a "Split ticket" badge.
- **Start is item-scoped:** When `useWorkGroupKey` is true, each work-group ticket has a bound `onAction` that supplies that ticket’s item ids. Clicking Start updates only that group’s items; other split tickets from the same order remain in NEW.
- Non-split NEW tickets (single main group) behave unchanged: `groupItemIds` is all items, so Start still updates the whole order.

### PREPARING

- `derivePreparingLaneEntries` receives orders with order-level status "preparing".
- It partitions by `prepGroup`, then computes **group-level status** per work-group.
- **Only work-groups with group-level status "preparing"** (or beyond) are included; purely pending groups are skipped so they remain in NEW only.
- Lane entries are per `(orderId, prepGroup, lane)`.
- Split tickets show the "Split ticket" badge.
- **Stations without substations:** PREPARING is split-aware there too. When no substations are configured, derivation uses a synthetic `["unassigned"]` lane so one entry per `(orderId, prepGroup)` is produced. Each ticket shows only that work-group's items. If no entries are derived, full orders are passed as a fallback.

### READY

- **Stays merged by order.** One ticket per order; no work-group derivation.
- **Visibility:** An order appears in READY as soon as **any** split work-group is ready at the station. If Group A is ready and Group B is still preparing, the order shows as one merged READY ticket immediately.
- **Ticket body (work-group scoped):** Only items that are (a) ready or served, and (b) from work-groups whose group-level status is ready or served. Items from still-pending/preparing split groups do not appear. When those groups later become ready, their items join the same merged READY ticket.
- Readiness is computed per `(prepGroup, lane)`: a lane is "ready" if any work-group has that lane fully ready; "waiting" if any work-group still has work there. The substation summary shows Ready/Waiting lanes so expo knows which parts are done and which are still cooking.
- When all work-groups are ready, the same merged ticket updates (e.g. "✓ All Ready").
- Split/unsplit actions are not shown in READY.

## Ticket labeling

- Main tickets: no extra badge.
- Split tickets: "Split ticket" badge in the metadata area.

## Mutual exclusivity: NEW vs PREPARING

Previously, a work-group could appear in both NEW and PREPARING: PREPARING used order-level status and emitted all work-groups with pending or preparing items, so a still-pending main group leaked into PREPARING when a sibling split group had started. The fix: `derivePreparingLaneEntries` now computes **group-level status** and **skips work-groups whose group-level status is "pending"**. Only work-groups that are actually preparing (or ready) appear in PREPARING. Pending work-groups stay in NEW only.

**Final rule:**
- NEW: work-groups with group-level status `"pending"`
- PREPARING: work-groups with group-level status `"preparing"` (or ready; ready lanes are skipped for display)
- A work-group appears in exactly one column.

## Start on split NEW tickets

Previously, Start on a split NEW ticket updated all pending items for the order (both groups), because `onAction` was called without `itemIds`. The fix: when rendering work-group tickets (`useWorkGroupKey`), `KDSColumn` binds `onAction` to supply `order.items.map(i => i.id)` as the default `itemIds`. The mutation path (`runStatusUpdate`) already supported `itemIds`; it now receives them for split NEW tickets. Split NEW tickets now start independently; non-split NEW tickets are unchanged.

## PREPARING no-lanes split-awareness

PREPARING is split-aware for both stations with substations and stations without. Previously, no-lane stations passed full orders to the PREPARING column, so split work-groups appeared as one merged ticket. The fix: when no substations exist, still call `derivePreparingLaneEntries` with a synthetic `["unassigned"]` lane. That yields one entry per `(orderId, prepGroup)` with only that group's items. PreparingLanes converts these to order-like tickets and passes them to KDSColumn with `useWorkGroupKey`. READY remains unchanged.

## PREPARING no-lanes fallback fix

**Root cause:** When `laneEntries.length === 0` (e.g. main group is READY, split group is still NEW), PreparingLanes fell back to `allOrders`. That showed a full-order ticket in PREPARING even though the order had no preparing work-groups—order-level status was still "preparing" (mixed), so the order passed the filter.

**Fix:** When falling back, filter to only orders that have at least one work-group with group-level status `"preparing"`. Orders with only ready and pending work-groups are excluded. Example: ready main group + pending split group shows in READY and NEW only, not in PREPARING.

## NEW column layout fix for split work-groups

**Root cause:** Split work-group tickets from the same order shared the same Framer Motion `layoutId` (`orderId-columnAccent`). With `AnimatePresence mode="popLayout"`, the layout engine mispositioned tickets until a full page remount. The array order was correct; the bug was render/layout only.

**Fix:** Make `layoutId` unique for split work-group tickets in `KDSTicket.tsx`. When `prepGroup` is set and not `"main"`, use `orderId::prepGroup-columnAccent`; otherwise keep `orderId-columnAccent`. No changes to sorting logic or React keys.

## READY visibility and item rendering for split work-groups

**Visibility:** READY stays merged but now appears as soon as any work-group is ready. Previously, the order only appeared when all items at the station were ready; with split groups sharing lanes, one group could be ready while another was preparing, and the order would not show. The fix: partition by `(prepGroup, lane)` when computing readiness. Include the order in READY when any `(group, lane)` bucket is ready.

**Item body (work-group scoped):** The READY ticket body filters items by work-group: only items from work-groups whose group-level status is ready or served are shown, and only items that are individually ready or served. Items from still-pending/preparing split groups are excluded. When those groups become ready, their items appear in the same merged READY ticket. The substation summary (Ready/Waiting lanes) communicates that more work is pending.

## Out of scope (this slice)

- **READY split-awareness.** READY remains order-level merged (one ticket per order). Split-aware READY (one ticket per work-group) would require group-level bump/recall/completed; deferred to a future slice.
- Waiting-on at group level (still order-level).
- Group-level bump / completed / recall.
- Multi-item selection for split (one item at a time).
- Custom group names (split groups use auto-generated ids).
- Split/unsplit from POS or table page.
