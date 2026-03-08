# KDS Notification First Slice

## Overview

Wires the existing notification UX (toasts, recall list) to detection logic that runs on view changes. No realtime/websockets; detection happens when `view` updates (refresh, patch, visibility change).

## Files Changed

| File | Change |
|------|--------|
| `src/app/kds/page.tsx` | New order detection, modification detection, completed order recall, self-toast suppression (`handleLocalAction`), duplicate protection (mod toasts + recall) |
| `src/lib/hooks/useKdsMutations.ts` | Add `onOrderServed`, `onLocalAction`; call both after patch |
| `docs/KDS-NOTIFICATION-FIRST-SLICE.md` | This doc |

## What Notifications Are Now Live

| Feature | Trigger | UI |
|---------|---------|-----|
| **New order toasts** | Order appears for current station (pending) after view change | KDSToastContainer |
| **Modification toasts** | Existing order content changes (items added, voided/removed) — not lifecycle status | KDSModificationToastContainer |
| **Completed list** | Order fully served for station (Bump) | KDSHeader Completed dropdown — see `docs/KDS-RECALL-FIRST-SLICE.md` |

## How New Orders Are Detected

1. `orderIdsForStation` = set of order IDs that have at least one item for the current station.
2. `useEffect` runs when `orderIdsForStation` or `orders` change.
3. Skip first run (initialize `prevOrderIdsRef` only).
4. Compare current IDs with previous. Newly appeared IDs = orders that were not in `prevOrderIdsRef` but are now in `orderIdsForStation`.
5. For each newly appeared order, if it has pending items for the station, call `addToast(order)`.
6. Update `prevOrderIdsRef` for the next run.
7. When the station changes, reset prev and skip toasts (avoids spurious toasts from station switch). Avoids duplicates: only orders that cross the threshold (weren’t in prev, are in current) get a toast. Same order will not toast twice.

## How Modifications Are Detected

1. `viewSnapshot` = station-scoped snapshot of `orderItems` per order: `orderId:itemId:status,...` for items at the current station.
2. `useEffect` runs when `viewSnapshot` or `view` changes.
3. When station changes, reset prev snapshot and skip. Skip first run and when snapshot is unchanged.
4. Parse previous snapshot into `prevByOrder` (orderId → Map of itemId → status).
5. Build `currentByOrder` from the current view (station items only).
6. For each order in `currentByOrder` that also exists in `prevByOrder`, diff item IDs (only):
   - **Added:** item in current but not prev.
   - **Removed:** item in prev but not current (voided).
   - Status changes are **not** treated as modifications (see below).
7. Push to `modificationToasts` with `ModificationToastData` (orderId, orderNumber, changes), unless suppressed (see below).

## What Counts as a Modification

| Change | Triggers modification toast? |
|--------|------------------------------|
| Item added | Yes |
| Item removed / voided | Yes |
| Status change (pending→preparing, preparing→ready, ready→served, served→ready recall) | No |
| Quantity / notes / customization change | Not yet detected (snapshot is status-only) |

## Self-Toast Suppression Rules

- **Purpose:** Avoid modification toasts that reflect the current client’s own actions (ready, bump, void).
- **Mechanism:** `useKdsMutations` calls `onLocalAction(orderId)` after each successful patch. The page stores that orderId in `suppressModificationForOrderIdsRef` and clears it after 1.5s.
- **Effect:** The modification-detection effect skips pushing a toast for any order in that set. Only external changes (POS, other KDS, refresh from elsewhere) produce modification toasts.

## Duplicate Protection Rules

- **Modification toasts:** Before pushing, compute a key `orderId:added:X,modified:Y,removed:Z` (item IDs). If this exact key was used within the last 8 seconds, skip. Prevents repeated toasts for the same change when refreshes or batched updates re-trigger detection.
- **Recall list:** When adding a completed order, replace any existing entry for that `orderId` instead of appending. At most one recall entry per order.

## Limitations

- **Quantity / notes / customization:** Not detected (snapshot is itemId:status only). Future: extend snapshot to detect these.
- **Realtime:** Detection runs only when `view` changes (manual refresh, patch, visibility change, or poll — see `docs/KDS-POLLING-FIRST-SLICE.md`).
- Multiple rapid refreshes can produce multiple toasts if the changes differ (dedup is per exact change key, 8s window).

## What Will Change When Realtime Is Added

- New order events can trigger `addToast` directly instead of diffing on refresh.
- Modification events can push to `modificationToasts` when the server pushes changes.
- Bump/served events can still use `onOrderServed` or be driven by realtime.
- The current detection logic can be kept as a fallback when realtime is unavailable.
