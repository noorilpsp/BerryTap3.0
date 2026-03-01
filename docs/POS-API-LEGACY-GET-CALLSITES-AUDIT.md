# Legacy GET Endpoint Callsites Audit

**Date:** 2025-02-24

**Scope:** Callsites in `src/` that fetch or request the legacy GET endpoints:
- GET /api/orders
- GET /api/orders/[id]
- GET /api/orders/[id]/timeline
- GET /api/orders/[id]/payments
- GET /api/tables
- GET /api/tables/[id]
- GET /api/reservations
- GET /api/reservations/[id]

---

## Summary

**None of the legacy GET endpoints have any callsites in `src/`.** The app does not fetch these endpoints via `fetch()` or any other HTTP client.

Data is loaded via:
- **Server actions** (direct DB): `getTablesForLocation`, `getTablesForFloorPlan`, `getReservationsForLocation`, `getOrderForTable`, `getSeatsForSession`, etc. — used by `useRestaurantHydration`, table page, floor map.
- **Separate KDS endpoint**: `GET /api/kds/orders` (not `/api/orders`).

---

## Per-Endpoint Results

| Endpoint | Callsites in src/ | Notes |
|----------|-------------------|-------|
| GET /api/orders | **0** | No fetch calls found |
| GET /api/orders/[id] | **0** | No fetch calls found |
| GET /api/orders/[id]/timeline | **0** | No fetch calls found |
| GET /api/orders/[id]/payments | **0** | No fetch calls found |
| GET /api/tables | **0** | No fetch calls found |
| GET /api/tables/[id] | **0** | No fetch calls found |
| GET /api/reservations | **0** | No fetch calls found |
| GET /api/reservations/[id] | **0** | No fetch calls found |

---

## Related Fetches (Non-Legacy / Different Endpoints)

| File | Line | Endpoint | Method | Response parsing |
|------|------|----------|--------|------------------|
| `src/app/table/[id]/page.tsx` | 1469 | `/api/orders` | **POST** | Expects `payload.sessionId`, `payload.orderId`, `payload.addedItemIds` at root. Standard envelope would put these under `payload.data`. |
| `src/app/table/[id]/page.tsx` | 1175, 1321 | `/api/orders/${id}/items/${itemId}` | PUT, DELETE | No response body parsing (fire-and-forget) |
| `src/app/kds/page.tsx` | 627 | `/api/kds/orders?locationId=...` | GET | Expects `payload.data.orders` (standard `{ ok, data: { orders } }` envelope) |
| `src/app/kds/page.tsx` | 775, 922 | `/api/orders/.../items/...` | PUT, POST | No response body parsing |

---

## Implication for Normalization

Because there are **no callsites** for the legacy GET endpoints in `src/`, normalizing them to the standard envelope will **not require any client updates** in this codebase.

The endpoints may still be used by:
- External clients (mobile apps, kiosks, integrations)
- Future internal features
- Manual API testing

When normalizing, update the route handlers to use `posSuccess`/`posFailure`; no callsite changes are needed in `src/`.
