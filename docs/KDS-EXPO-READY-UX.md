# KDS Expo READY Column UX

## Overview

Improves the READY column presentation for expo/pass operators: clearer lane summaries, action labels, and scannable table/order numbers. No domain, routing, or lifecycle changes.

## READY Column Behavior

- **Merged ticket model:** One ticket per order. Kitchen: orders with at least one substation (lane) ready.
- **Lane summary:** For kitchen, shows which lanes are Ready vs Waiting. Non-kitchen stations do not use lanes.

## Lane Summary Model

From `deriveReadySubstationSummary`:
- **readyLanes:** Substations (grill, fryer, cold_prep, unassigned) where all items are ready.
- **waitingLanes:** Substations still pending or preparing.
- **allReady:** `waitingLanes.length === 0`.

## UX Rules for Expo

### Lane display

- **All ready:** Single row `✓ All Ready:` with green lane chips (Grill, Fryer, Cold Prep).
- **Partial ready:** Two rows — `Ready:` (green chips) and `Waiting:` (amber chips).
- Lane chips are pills with clear color: emerald for ready, amber for waiting.

### Action button labels

- **Partial ready:** `Complete remaining` — marks remaining lanes ready.
- **Full ready:** `BUMP` — sends to served.
- Other cases (e.g. waiting for other stations): `Complete` — unchanged.

### Scannable metadata

- Table / order line: `T-5 · #102` (dine-in) or `Customer · #102` (pickup).
- Order number always shown; font slightly larger for distance readability.

## Files Changed

| File | Change |
|------|--------|
| `src/components/kds/KDSTicket.tsx` | Lane chips, All Ready state, action labels, metadata emphasis |
| `docs/KDS-EXPO-READY-UX.md` | This doc |

## Render Stability

- Uses existing `readySubstationSummary` prop; no new derived arrays or effects.
- Lane chips use `.map()` over stable `readyLanes` / `waitingLanes` arrays.

## Limitations

- Non-kitchen stations do not show lane summaries (no substations).
- Layout remains compact; no zoom or accessibility modes.
