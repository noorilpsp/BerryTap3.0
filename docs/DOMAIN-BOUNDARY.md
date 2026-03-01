# Domain Boundary (Current)

Minimal-diff centralization baseline:

- Public business-mutation surface: `src/domain/index.ts`
- UI should call `src/domain/*` for DB-writing business operations.
- POS API routes (`/api/orders*`, `/api/payments/[id]`, `/api/tables*`, `/api/reservations*`) delegate write operations via `src/domain/*`.

Event wrappers:

- `recordEventRaw(...)` delegates to `recordSessionEvent(...)`
- `recordEventWithSource(...)` delegates to `recordSessionEventWithSource(...)`

Kitchen wrapper:

- `checkKitchenDelays(...)` delegates to `detectKitchenDelays(...)`

Deprecated/legacy quarantine:

- `syncSessionOrderViaServiceLayer` remains deprecated and unexported from `src/domain/index.ts`.
- Additional unused paths are marked deprecated and not re-exported via `src/domain/index.ts`.

## Idempotency cleanup

- `cleanupIdempotencyKeys(days?: number)` in `src/domain/idempotency.ts` — deletes `pos_idempotency_keys` rows older than N days (default 30).
- Not scheduled automatically. Run periodically (cron, job runner, or manual script) to avoid unbounded table growth.

## Transactions

- `withTx(fn)` in `src/domain/tx.ts` — run multiple domain writes in a single DB transaction.
- Use when an operation requires several inserts/updates that must succeed or fail together (e.g. close session + add payment + update orders).
- The `tx` argument has the same API as `db` (insert, update, delete, query).
