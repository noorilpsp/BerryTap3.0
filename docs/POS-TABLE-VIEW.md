# POS TableView Contract

`GET /api/tables/[id]/pos` returns one canonical payload used by the table detail UI.

Source of truth type:

- `src/lib/pos/tableView.ts`
- `export type TableView`
- `export function isTableView(x: unknown): x is TableView`

## Response Envelope

The endpoint returns standard POS envelope:

- success: `{ ok: true, data: TableView }`
- failure: `{ ok: false, error: { code, message } }`

## TableView Shape (high level)

- `table`: table identity + layout fields
  - `table.status`: **furniture status** (active | maintenance | disabled). Normalized from DB; legacy values like "available" map to "active".
  - Other: `id`, `locationId`, `number`, `guests`, etc.
- `openSession`: open session info or `null`
- `seats`: active session seats
- `items`: canonical items across seats/shared with wave + status
- `waves`: canonical backend-computed wave rows with status + allowed transitions:
  - `waveNumber`, `itemCount`, `status`
  - `canFire`, `canAdvanceToPreparing`, `canAdvanceToReady`, `canAdvanceToServed`
  - no trailing fabricated empty waves (only waves with items or persisted DB waves)
- `actions`: backend action gates:
  - `canSend`, `canAddWave`, `canDeleteWave`, `canCloseSession`
- `bill`: subtotal/tax/total
- `outstanding`: close blockers (unfinished items, unpaid balance, etc.) or `null`
- `delays`: kitchen delay list or `null`
- `uiMode`: **service state** (blocked | needs_seating | in_service). Derived from furniture status + openSession. Use for seating/ordering UI gates.
- `serviceStage`: **display stage** (available | seated | ordering | in_kitchen | food_ready | served | bill_requested | needs_attention). Derived from items/waves. Use for header badge and TableVisual.

## Furniture vs service state

- **Furniture status** (`table.status`): physical table state (active, maintenance, disabled). Slow-changing. Normalized via `normalizeFurnitureStatus` in `src/lib/pos/tableStatus.ts`.
- **Service state** (`uiMode`): session-derived. `blocked` = furniture unavailable; `needs_seating` = no session; `in_service` = session open.

## Validation Rule

The route validates built payload using `isTableView` before returning success.
If validation fails, route returns:

- `posFailure("INTERNAL_ERROR", "Invalid TableView payload")`
