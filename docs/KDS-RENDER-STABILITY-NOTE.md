# KDS Render Stability Note

## Root Cause of the Freeze

The KDS page was freezing because of an **infinite effect loop** in the PREPARING column:

1. **Unstable derived values**  
   `newOrders`, `preparingOrders`, and (inside PreparingLanes) `ordersWithSubStations` were recreated on every render (new array/object references).

2. **Effect that set state**  
   The “empty lane” effect in `PreparingLanes` depended on `laneEntries` and `ordersWithSubStations`. Because those were new references every time, the effect ran on every render.

3. **Repeated setState**  
   Inside that effect, `setShowEmptyByLane` was called up to four times (once per SUB_STATION). That triggered re-renders.

4. **Loop**  
   Re-render → new `ordersWithSubStations` / `laneEntries` refs → effect runs again → setState → re-render → …

So the loop was: **render → new refs → effect runs → setState → render → …**

## What Was Memoized

| Location | What | Purpose |
|----------|------|--------|
| **KDSColumns** | `newOrders` | `useMemo` so the “pending” filter result is stable when `orders` / `currentStationId` are unchanged. |
| **KDSColumns** | `preparingOrders` | Same for “preparing” filter; keeps `preparingLaneEntries` stable. |
| **KDSColumns** | `getReadySubstationSummary` | `useCallback` so READY column and tickets don’t get a new callback every render. |
| **PreparingLanes** | `ordersWithSubStations` | `useMemo([orders])` so we don’t create a new array every render. |
| **PreparingLanes** | `countByLaneKey` | `useMemo` of per-lane counts joined as a string; stable “key” for the empty-lane effect. |
| **PreparingLanes** | `laneTicketIdsByLane` | `useMemo([useLaneEntries, laneEntries])` so `useLayoutEffect` doesn’t see a new object every time. |

## Effect Dependency Change That Broke the Loop

- **Before:**  
  Empty-lane effect depended on `[useLaneEntries, laneEntries, ordersWithSubStations]`.  
  `laneEntries` and `ordersWithSubStations` were new references every render → effect ran every time → setState → loop.

- **After:**  
  Effect depends on `[useLaneEntries, countByLaneKey]`.  
  `countByLaneKey` is a string (e.g. `"0,2,1,0"`) that only changes when per-lane counts actually change. So the effect runs only when lane counts change, not on every render. The effect body still uses `laneEntries` and `ordersWithSubStations` from the closure; they are the correct values for the render that produced this `countByLaneKey`.

## What to Watch For in Future KDS Changes

1. **Effects that set state**  
   Any `useEffect` that calls `setState` must not depend on values that are recreated every render (e.g. `orders.filter(...)`, `items.map(...)`, inline objects). Prefer:
   - `useMemo` for derived arrays/objects, and
   - primitive or stable keys (e.g. `countByLaneKey`, `ids.join(",")`) in the dependency array when the effect only needs to react to “something changed” rather than the exact reference.

2. **Callbacks passed to children**  
   Inline callbacks like `(order) => deriveReadySubstationSummary(order, id)` create a new function every render and can cause unnecessary re-renders of columns/tickets. Use `useCallback` when the callback is passed as a prop.

3. **Default prop values**  
   `transitioningTickets = new Map()` in props gives a new `Map` every render when the prop is omitted. Prefer a stable default (e.g. from a module-level constant or ref) if that value is used in effect deps.

4. **DEV check**  
   In development, `[KDS PreparingLanes] empty-lane effect ran` logs when the empty-lane effect runs. It should run only when lane counts change (e.g. order moves in/out of preparing), not on every render. If it logs constantly, look for new unstable refs in the chain (orders → preparingOrders → laneEntries → countByLaneKey).

## Files Touched for the Freeze Fix (Stability Pass)

- `src/components/kds/KDSColumns.tsx` – memoized `newOrders`, `preparingOrders`; `useCallback` for `getReadySubstationSummary`.
- `src/components/kds/PreparingLanes.tsx` – memoized `ordersWithSubStations`, `countByLaneKey`, `laneTicketIdsByLane`; empty-lane effect deps changed to `[useLaneEntries, countByLaneKey]`; DEV-only log when the empty-lane effect runs.
- `docs/KDS-RENDER-STABILITY-NOTE.md` – this note.

## Remaining Low-Risk Patterns

- **KDSColumn** builds `filteredOrders` and `columnOrders` each render; the effects that use them depend on primitives (`status`, `filteredOrders` only for READY where it is the same as `orders`, and `columnOrders.length`), so no loop.
- **PreparingLanes** staging effect depends on `[orders, laneEntries, useLaneEntries, transitioningTickets]`; `orders` and `laneEntries` are now stable from parent memoization, so this effect only runs when data or transition state actually changes.
- **Default `transitioningTickets = new Map()`** in KDSColumns is only used when the prop is omitted; the page always passes a state-backed Map, so no instability in practice.

## Safe to Build On?

Yes. With the memoization and the dependency change, the PREPARING column no longer has an effect loop. Remaining effect deps use either primitives or memoized values. Continuing to add features is safe as long as new derived data used in effects is memoized or represented by a stable key and new callbacks passed to KDS columns/tickets are wrapped in `useCallback` where appropriate.
