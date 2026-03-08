# Table Page: Wave Readiness Semantics

## Summary

A wave on `/table/[id]` is only "ready" when **all** non-void items in that wave are ready or served. Partial station readiness (e.g. kitchen done, bar still preparing) must not promote the whole wave to ready.

## Rule

| Status | Condition |
|--------|-----------|
| **served** | All active non-void items have status `served` |
| **ready** | All active non-void items are `ready` or `served`, and at least one is `ready` |
| **preparing** | At least one active item is `cooking` (preparing) |
| **fired** | At least one active item is `sent`, none cooking |
| **held** | All active items are `held` (or no active items) |

The critical fix: previously, "ready" used `activeItems.some(item => item.status === "ready")`, which promoted the wave when **any** item was ready. Now it requires `allReadyOrServed && someReady`.

## Files Changed

| File | Change |
|------|--------|
| `src/app/table/[id]/page.tsx` | `getMealWaveStatus`: ready only when all active items are ready or served |
| `src/app/api/tables/[id]/pos/route.ts` | `mapWaveStatus`: same rule for POS wave status |
| `src/components/table-detail/order-list.tsx` | `getWaveProgressStatus`: same rule for wave action buttons |

## KDS Unchanged

KDS derives readiness per station and per order. Partial station readiness remains visible in KDS (e.g. kitchen lane ready, bar lane still preparing). This fix affects only the **table page** whole-wave semantics.
