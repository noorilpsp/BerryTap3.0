# KDS Optimistic Updates

## Overview

KDS actions now apply optimistic updates first, then reconcile with the server—matching the architecture pattern used on `/table/[id]`. This makes actions feel immediate and reduces perceived latency, especially for multi-item operations.

## Old Behavior vs New Behavior

### Old (pre-refactor)

- **Patch on success only**: UI updated only after the server responded
- **Sequential multi-item requests**: Start / Ready / Bump / Recall awaited each item request one-by-one
- **No rollback**: Because there were no optimistic updates, nothing to roll back on failure
- **refresh(true)** used as primary recovery on failure

### New (post-refactor)

- **Optimistic patch first**: UI updates immediately when the user taps an action
- **Parallel multi-item requests**: Start / Ready / Bump / Recall send all item requests via `Promise.all`
- **Rollback on failure**: On any request failure, the view is restored to the pre-action snapshot and a toast is shown
- **refresh(true)** used only as fallback recovery (after rollback, to reconcile with server)

## Helper Pattern: `kdsFireAndReconcile`

A small helper in `useKdsMutations.ts` implements the optimistic flow, mirroring table page `fireAndReconcile`:

1. **Snapshot** current view (deep clone via `structuredClone`)
2. **Apply** optimistic patch immediately via `patch()`
3. **Fire** request(s)
4. **On success**: Optionally apply `onSuccessPatch` with server response
5. **On failure**: Rollback to snapshot via `patch(() => snapshot)`, toast, and call `refresh(true)`

```ts
async function kdsFireAndReconcile<T>(opts: {
  snapshot: KdsView;
  optimisticPatch: (prev: KdsView) => KdsView;
  patch: (updater: (prev: KdsView) => KdsView) => void;
  requestFn: () => Promise<T>;
  onSuccessPatch?: (result: T) => (prev: KdsView) => KdsView;
  onSuccess?: () => void;
  onFailure: () => void;
}): Promise<T | null>
```

## Action-by-Action Optimistic Strategy

| Action | Optimistic patch | Multi-item? | Parallel? | Rollback |
|--------|------------------|-------------|-----------|----------|
| **Start** (pending → preparing) | Status + actions for all items | Yes | Yes | Yes |
| **Ready** (preparing → ready) | Status + actions for all items | Yes | Yes | Yes |
| **Bump** (ready → served) | Status + actions for all items | Yes | Yes | Yes |
| **Recall** (served → ready) | Status + actions for all station items | Yes | Yes | Yes |
| **Split** | `prepGroup` for item | No | — | Yes |
| **Unsplit** | `prepGroup: null` for item | No | — | Yes |
| **Refire** | status→pending, timestamps cleared, refiredAt set | No | — | Yes |
| **Void** | `voidedAt`, actions cleared | No | — | Yes |
| **Snooze** | `snoozedAt`, `snoozeUntil`, `isSnoozed` on order | No | — | Yes |
| **Wake** | `snoozedAt`/`snoozeUntil` null, `wasSnoozed: true` | No | — | Yes |

All actions now optimistic; all support rollback on failure.

## Multi-Item Request Behavior

**Start, Ready, Bump, Recall**:

- Compute the set of items to update (same logic as before: status filter, station filter, optional itemIds)
- Apply a single optimistic patch for **all** affected items
- Send requests via `Promise.all` (parallel)
- If **any** request fails: rollback the entire optimistic patch, toast, `refresh(true)`
- If all succeed: keep optimistic state; optionally `onOrderServed` for Bump

**Why parallel is safe**: Each request targets a different item (`/api/orders/:id/items/:itemId`). There are no cross-item dependencies or ordering constraints in the API.

## Rollback Approach

- Snapshot = `structuredClone(view)` taken before the optimistic patch
- Rollback = `patch(() => snapshot)` — replaces the view with the pre-action state
- Occurs only when `requestFn` throws (network error, !res.ok, !p?.ok)
- After rollback: toast with error message, then `refresh(true)` to reconcile with server

## Unchanged Behavior

The following are **not** changed by this refactor:

- split-work-group rules
- READY merged behavior
- completed / recall semantics
- waiting-on logic
- ticket derivation architecture
- `onLocalAction` suppression of modification toasts
- `onOrderServed` callback for Bump

## Remaining Limitations

- **No real-time sync**: Optimistic updates are local; another device will not see changes until refresh/poll
- **Snapshot cost**: `structuredClone` copies the full view; for very large views this could add minor latency (negligible for typical KDS usage)
- **Snooze/Wake with null view**: When `view` is null (e.g. before first load), Snooze/Wake skip optimistic flow and use request-then-patch
- **Partial failure on multi-item**: If any item request fails, the entire batch rolls back; there is no partial-success handling
