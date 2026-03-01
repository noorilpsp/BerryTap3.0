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
