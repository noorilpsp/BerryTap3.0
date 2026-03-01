# POS GET Envelope Re-Audit

**Date:** 2026-03-01  
**Scope:** All GET routes under `src/app/api/**`. Checks whether each uses `posSuccess`/`posFailure` (standard envelope) or legacy raw `NextResponse.json`.

---

## POS & Menu GET Routes

| Endpoint | posSuccess/posFailure | Notes |
|----------|------------------------|-------|
| GET /api/orders | ✅ | `posSuccess({ orders })` |
| GET /api/orders/[id] | ✅ | `posSuccess({ order })` |
| GET /api/orders/[id]/timeline | ✅ | `posSuccess({ timeline })` |
| GET /api/orders/[id]/payments | ✅ | `posSuccess(paymentsList)` |
| GET /api/tables | ✅ | `posSuccess(result)` |
| GET /api/tables/[id] | ✅ | `posSuccess({ ...table, status })` |
| GET /api/reservations | ✅ | `posSuccess(reservationsList)` |
| GET /api/reservations/[id] | ✅ | `posSuccess(reservation)` |
| GET /api/kds/orders | ✅ | `posSuccess({ orders })` |
| GET /api/items | ✅ | `posSuccess(itemsList)` — normalized |
| GET /api/categories | ✅ | `posSuccess(categoriesList)` — normalized |
| GET /api/customizations | ✅ | `posSuccess(groups)` — normalized |

---

## Other GET Routes (non-POS)

| Endpoint | posSuccess/posFailure | Notes |
|----------|------------------------|-------|
| GET /api/items/[id] | ❌ legacy | Raw `NextResponse.json(item)` |
| GET /api/categories/[id] | ❌ legacy | Raw object |
| GET /api/tags | ❌ legacy | Raw array |
| GET /api/tags/[id] | ❌ legacy | Raw object |
| GET /api/allergens | ❌ legacy | Raw array |
| GET /api/menus | ❌ legacy | Raw (not audited in detail) |
| GET /api/menus/[id] | ❌ legacy | Raw |
| GET /api/locations | ❌ legacy | Raw |
| GET /api/locations/[id] | ❌ legacy | Raw |
| GET /api/customizations/[id] | ❌ legacy | Raw |
| GET /api/customers | ❌ legacy | Raw |
| GET /api/customers/[id] | ❌ legacy | Raw |
| GET /api/merchants/[id] | ❌ legacy | Raw |
| GET /api/auth/check-session | ❌ | Returns `{ hasSession }` |
| GET /api/auth/test-connection | ❌ | Auth-specific |
| GET /api/auth/exchange-code | ❌ | OAuth flow |
| GET /api/user/is-admin | ❌ | Raw |
| GET /api/user/permissions | ❌ | Raw |
| GET /api/session/permissions | ❌ | Raw |
| GET /api/invitations/[token] | ❌ | Raw |
| GET /api/admin/* | ❌ | Admin-specific |
| GET /api/debug/* | ❌ | Debug |
| GET /api/search | ❌ | Search |
| GET /api/test-email | ❌ | Test |
| GET /api/prefetch-images/[...rest] | ❌ | Image prefetch |

---

## Summary

- **POS core:** orders, tables, reservations, kds/orders — all use standard envelope.
- **Menu (table page):** items, categories, customizations — normalized to `posSuccess`; `useLocationMenu` parses `payload.data`.
- **Dashboard/menu builder:** items/[id], categories/[id], tags, allergens, etc. — legacy; out of scope.
