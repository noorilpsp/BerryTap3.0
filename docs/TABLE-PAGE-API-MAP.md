# Table Page API Interaction Map

**Source:** `src/app/table/[id]/page.tsx`  
**Refresh:** `GET /api/tables/[id]/pos` — runs on mount, after every mutation (via `mutateThenRefresh`), and every 60s when session open and no modal/mutation.

---

## User Action → Endpoint(s) → Refresh

| Action | Endpoint(s) | Then |
|--------|-------------|------|
| **Page load / navigate** | `GET /api/tables/[id]/pos` | — |
| **Retry (error bar)** | `GET /api/tables/[id]/pos` | — |
| **Seat party** | `POST /api/sessions/ensure` → `POST /api/sessions/[sid]/events` (guest_seated) | ✓ refresh |
| **Add wave** | `POST /api/sessions/[sid]/waves/next` | ✓ refresh |
| **Delete wave** | `DELETE /api/sessions/[sid]/waves/[n]` | ✓ refresh |
| **Fire wave** | `POST /api/sessions/[sid]/waves/[n]/fire` | ✓ refresh |
| **Add seat** | `POST /api/sessions/[sid]/seats` | ✓ refresh |
| **Delete seat** | `DELETE /api/sessions/[sid]/seats/[n]` | ✓ refresh |
| **Rename seat** | `PUT /api/sessions/[sid]/seats/[n]/rename` | ✓ refresh |
| **Add items (Send)** | `POST /api/sessions/ensure` (if no session) → `POST /api/orders` → `POST /api/sessions/[sid]/waves/1/fire` (if wave 1 held) | ✓ refresh |
| **Mark item served** | `PUT /api/orders/[orderId]/items/[itemId]` (status: served) | ✓ refresh |
| **Void item** | `DELETE /api/orders/[orderId]/items/[itemId]` | ✓ refresh |
| **Advance wave** (cooking/ready/served) | `POST /api/sessions/[sid]/waves/[n]/advance` → `POST /api/sessions/[sid]/events` (item_ready or served) | ✓ refresh |
| **Close table** | `POST /api/sessions/[sid]/close` → `POST /api/sessions/[sid]/events` (payment_completed) | ✓ refresh |

---

## Session ensure (internal)

Before most mutations, `ensureSessionForMutations()` may call `POST /api/sessions/ensure` to create/open a session. On success it stores `sessionId` in Zustand for the table.

---

## Events (fire-and-forget)

`POST /api/sessions/[sid]/events` — records `guest_seated`, `item_ready`, `served`, `payment_completed`. No await; no refresh.

---

## UI mode (furniture vs session)

`GET /api/tables/[id]/pos` returns:

- `table.status`: furniture status (active | maintenance | disabled). Normalized from DB; "available" → "active".
- `uiMode`: service state (blocked | needs_seating | in_service):
  - `blocked` — furniture maintenance/disabled
  - `needs_seating` — no session; show "Seat Party Here"
  - `in_service` — session open; show order/waves UI

Use `uiMode` for seating/ordering gates, not `table.status`.
