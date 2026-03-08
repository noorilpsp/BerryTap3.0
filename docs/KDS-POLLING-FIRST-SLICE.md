# KDS Polling First Slice

## Overview

Adds a lightweight auto-refresh (polling) strategy to the KDS view so notification detection can run periodically without realtime. Polling runs while the tab is visible, pauses when hidden, and avoids overlapping with local patch flows.

## Files Changed

| File | Change |
|------|--------|
| `src/lib/hooks/useKdsView.ts` | Add 10s poll interval, visibility check, patch cooldown |
| `docs/KDS-POLLING-FIRST-SLICE.md` | This doc |

## Current Refresh Triggers (Before + After)

| Trigger | Behavior |
|---------|----------|
| Initial mount | `refresh()` (loading state) |
| Tab becomes visible | `refresh(true)` silent |
| Poll tick (new) | `refresh(true)` every 10s while visible |
| Manual (Retry, Recall, Clear Modified) | `refresh()` or `refresh(true)` |
| Mutation failure | `refresh(true)` from useKdsMutations |

## Polling Behavior

- **Interval:** 10 seconds.
- **Visibility:** Only fires when `document.visibilityState === "visible"`. When the tab is hidden, the interval still runs but the callback returns immediately without calling refresh.
- **Silent:** Always uses `refresh(true)` so no loading overlay.
- **Overlap prevention:** `refresh` uses `refreshInFlightRef`; if a refresh is already running, the call returns `false` and does nothing. No stacked refreshes.
- **Patch cooldown:** If `patch()` was called within the last 2 seconds, the poll tick skips. Avoids overwriting optimistic updates with server data before the mutation has landed.

## Limitations vs Realtime

- 10s delay before external changes are seen.
- Poll runs even when idle; some API calls could be avoided with realtime.
- Hidden tabs don’t poll (by design), so returning to the tab triggers a single visibility refresh, not a full catch-up history.

## What Will Change When Realtime Is Added

- Polling can be disabled or reduced to a fallback heartbeat.
- Realtime events would drive view updates; polling becomes a safety net.
