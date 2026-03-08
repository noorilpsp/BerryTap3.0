# KDS Snooze First Slice

Snooze and wake are now operationally real: persisted, sorted, and expiry-aware.

## Files Changed

| File | Change |
|------|--------|
| `src/lib/db/schema/orders.ts` | Added snoozedAt, snoozeUntil, wasSnoozed |
| `drizzle/0009_orders_snooze.sql` | Migration adding snooze columns |
| `scripts/run-migration-0009.ts` | Migration runner |
| `package.json` | Added db:migrate:0009 script |
| `src/app/api/orders/[id]/snooze/route.ts` | PATCH endpoint for snooze/wake |
| `src/app/api/kds/view/route.ts` | Returns snooze fields, derives isSnoozed |
| `src/lib/kds/kdsView.ts` | KdsOrder: snoozedAt, snoozeUntil, isSnoozed, wasSnoozed |
| `src/app/kds/page.tsx` | kdsViewToOrders maps snooze; uses real handleSnooze/handleWakeUp |
| `src/lib/hooks/useKdsMutations.ts` | handleSnooze, handleWakeUp call API and patch view |
| `src/components/kds/KDSColumn.tsx` | Snoozed tickets at bottom for PREPARING/READY |
| `src/components/kds/PreparingLanes.tsx` | Snoozed at bottom in lane and non-lane sorts |

## Persistence Model

Snooze state lives on `orders`:

| Column | Type | Meaning |
|--------|------|---------|
| `snoozed_at` | timestamp (nullable) | When snooze was triggered |
| `snooze_until` | timestamp (nullable) | When it expires |
| `was_snoozed` | boolean (default false) | Set on wake; prevents re-snooze |

**Apply migration:** `npm run db:migrate:0009`

## What Snooze Does

1. **Snooze action**
   - PATCH `/api/orders/[id]/snooze` with `{ durationSeconds }` (1–3600)
   - Sets `snoozed_at = now`, `snooze_until = now + durationSeconds`
   - Patches KDS view immediately; next poll returns same state

2. **Wake action**
   - PATCH with `{ wake: true }`
   - Sets `snoozed_at = null`, `snooze_until = null`, `was_snoozed = true`
   - Ticket is no longer snoozed and cannot be snoozed again

3. **Expiry**
   - `isSnoozed` is derived: `snooze_until != null && snooze_until > now`
   - When `snooze_until` passes, the next view fetch returns `isSnoozed: false`
   - Ticket appears awake; DB still has snooze values until next wake/action
   - No background job; expiry is computed on each view load

## Sorting Rule

All columns place snoozed tickets at the bottom:

- **NEW** (already did): sortByUrgency pushes snoozed to bottom
- **PREPARING** (KDSColumn): snoozed at bottom, then by stage timestamp
- **READY**: snoozed at bottom, then by readyAt
- **PreparingLanes**: lane entries and non-lane orders both put snoozed at bottom

Within snoozed and non-snoozed groups, order uses stage timestamps (firedAt, startedAt, readyAt).

## Aging Rule

Snooze does not change aging:

- Timer/urgency continue to use `ageTimestamp` (stage-based)
- Queue numbering continues to use `firedAt ?? createdAt`
- No age reset on snooze or wake

## Wake / Expiry Behavior

- **Manual wake**: Clears snooze, sets wasSnoozed. Ticket returns to normal position by age.
- **Expiry**: No DB write. Next poll returns `isSnoozed: false`. Ticket behaves as awake.

## Remaining Limitations

1. **wasSnoozed blocks re-snooze** – Once woken, an order cannot be snoozed again.
2. **Polling-based** – Snooze state updates on poll or manual action; no realtime.
3. **Expired snooze not cleared in DB** – `snoozed_at` / `snooze_until` remain until wake or another update.
4. **Order-level only** – Snooze applies to the whole order, not per-station or per-lane.
