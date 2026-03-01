# POS Verification

## Automated Checks

### `npm run check:pos` (runs all POS checks)

- `check:pos-api-writes` — no direct DB writes in scoped routes
- `check:pos-idempotency` — Idempotency-Key usage
- `check:pos-add-items-safety` — table page add-items has concurrency guard + failure dialog
- `check:pos-no-domain-writes` — table page and floor map use zero direct domain writes (all via API)

```
check-pos-api-no-db-writes: PASS
check-pos-add-items-safety: PASS
check-pos-no-domain-writes: PASS
```

### `npm run build`

```
✓ Compiled successfully in 18.6s
✓ Generating static pages using 9 workers (168/168)
```

Build completed successfully. Warnings about `baseline-browser-mapping` and `metadataBase` are pre-existing and unrelated to POS changes.

---

## Manual Smoke Checklist

**Prerequisites:** Run once before smoke test:
- `npm run seed:pos` — seeds staff, menu, and orders data (idempotent; skips if items exist)

Run the app (`npm run dev`), then verify:

| Step | Action | Expected |
|------|--------|----------|
| 1 | **Ensure session** | From floor map or table page, seat a party. Session is created; no error. If user has no staff row: table shows "Failed to create session" / "You are not staff at this location"; floor map shows toast. |
| 2 | **Add items** | Add menu items to the order. Items appear. Double-click—second ignored while in-flight. On fail, dialog; no partial update. |
| 3 | **Fire wave** | Click "Fire wave" on wave 1. Wave moves to in-progress; no error. |
| 4 | **Advance wave** | Mark items ready or served. Status updates; no error. |
| 5 | **Close session** | Pay/close the session. Session ends; no error. |
| 6 | **KDS status updates** | On KDS, change item status (pending → preparing → ready). Status persists; on API failure, toast "Failed to update item status" and UI reverts. |
| 7 | **KDS refire** | On KDS, refire an item with a reason. Remake appears; on API failure, toast "Failed to refire item" and remake is removed. |

On backend failure (e.g. API down, `ok: false`), the UI should surface an error (toast or warning dialog) and revert optimistic updates—no silent success.

**Failure-mode checks:** Double-click "Add items" quickly—second click ignored while first in-flight. On API failure, dialog shown; no partial table/order state.

### Seeding for fresh DB

| Seed | Purpose | Idempotent |
|------|---------|------------|
| `npm run seed:pos` | Staff, menu, and orders (runs staff → menu → orders; no shell; stops on first failure) | Yes — skips existing |
| `npm run seed:staff` | Staff rows only | Yes — skips if staff exists |
| `npm run seed:menu` | Menu items only | Yes — skips if items exist |
| `npm run seed:orders` | Sample orders only | Yes |

Staff default PIN: `1234`.
