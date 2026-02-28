# Database Writes Audit

**Date:** 2025-02-24

**Scope:** All database writes (`db.insert`, `db.update`, `db.delete`, `tx.insert`, `tx.update`, `tx.delete`)

**Classification:**
- **SAFE** — inside domain layer (`src/domain/`)
- **QUESTIONABLE** — inside actions (`src/app/actions/`)
- **DANGEROUS** — inside UI or API routes

---

## SAFE — Domain Layer

| File | Line(s) | Operation | Table(s) |
|------|---------|-----------|----------|
| `src/domain/serviceActions.ts` | 489 | update | order_items |
| `src/domain/serviceActions.ts` | 527 | update | order_items |
| `src/domain/serviceActions.ts` | 700, 718 | insert | order_items, order_item_customizations |
| `src/domain/serviceActions.ts` | 949, 965 | update | orders, order_items |
| `src/domain/serviceActions.ts` | 1081 | update | order_items |
| `src/domain/serviceActions.ts` | 1248 | update | order_items |
| `src/domain/serviceActions.ts` | 1500, 1504 | update | orders, reservations |
| `src/domain/serviceActions.ts` | 1822 | update | order_items |
| `src/domain/orderTotals.ts` | 27, 85 | update | orders |

---

## QUESTIONABLE — Actions Layer

| File | Line(s) | Operation | Table(s) |
|------|---------|-----------|----------|
| `src/app/actions/session-events.ts` | 80 | insert | session_events |
| `src/app/actions/orders.ts` | 112 | insert | sessions |
| `src/app/actions/orders.ts` | 244 | insert | orders |
| `src/app/actions/orders.ts` | 302, 319 | update | orders, order_items |
| `src/app/actions/orders.ts` | 616 | update | order_items |
| `src/app/actions/orders.ts` | 633, 645, 650 | insert/update | payments, sessions, orders |
| `src/app/actions/orders.ts` | 739, 767, 777, 786 | insert | orders, order_items, order_item_customizations, order_timeline |
| `src/app/actions/orders.ts` | 825, 845, 849 | update/insert | orders, order_timeline |
| `src/app/actions/orders.ts` | 858 | update | tables |
| `src/app/actions/orders.ts` | 894, 911 | insert | order_items, order_item_customizations |
| `src/app/actions/orders.ts` | 940, 941 | update/insert | orders, order_timeline |
| `src/app/actions/orders.ts` | 974, 1001 | insert/update | payments, orders |
| `src/app/actions/orders.ts` | 1030, 1044 | update | payments, orders |
| `src/app/actions/order-item-lifecycle.ts` | 67, 92, 132, 173, 222 | update | order_items |
| `src/app/actions/seat-management.ts` | 109 | delete | seats |
| `src/app/actions/tables.ts` | 271 | update | tables |
| `src/app/actions/reservations.ts` | 159, 226 | insert, update | reservations |
| `src/app/actions/floor-plans.ts` | 184, 207, 239, 245, 286, 367, 376 | update, insert, delete | floor_plans, tables |
| `src/app/actions/merchants.ts` | 99, 117, 226, 248, 263 | insert, update | merchants, merchant_locations |
| `src/app/actions/waitlist.ts` | 46, 71, 91 | insert, delete, update | waitlist |
| `src/app/actions/auth.ts` | 70, 300 | insert | users |

---

## DANGEROUS — API Routes

| File | Line(s) | Operation | Table(s) |
|------|---------|-----------|----------|
| `src/app/api/menus/route.ts` | 189 | insert | menus |
| `src/app/api/menus/[id]/route.ts` | 207, 298 | update, delete | menus |
| `src/app/api/categories/route.ts` | 222 | insert | menu_categories |
| `src/app/api/categories/[id]/route.ts` | 208, 216, 230, 350 | update, delete, insert | categories, menu_categories |
| `src/app/api/categories/reorder/route.ts` | 36 | update | categories |
| `src/app/api/items/route.ts` | 228, 245, 255, 264, 273 | insert | items, category_items, item_tags, item_allergens, item_customizations |
| `src/app/api/items/[id]/route.ts` | 219, 224, 227, 238, 240, 250, 252, 262, 264, 387 | update, delete, insert | items, category_items, item_tags, item_allergens, item_customizations |
| `src/app/api/customizations/route.ts` | 249, 274, 296, 351, 390, 462, 491 | insert, update | customization_groups, customization_options, conditional_prices, conditional_quantities, secondary_group_rules |
| `src/app/api/customizations/[id]/route.ts` | 186, 209, 215, 233, 251, 316, 327, 379, 389, 507, 572, 672 | update, delete, insert | customization_groups, customization_options, conditional_prices, conditional_quantities, secondary_group_rules |
| `src/app/api/tags/route.ts` | 176 | insert | tags |
| `src/app/api/tags/[id]/route.ts` | 81 | delete | tags |
| `src/app/api/allergens/route.ts` | 176 | insert | allergens |
| `src/app/api/allergens/[id]/route.ts` | 81 | delete | allergens |
| `src/app/api/customers/route.ts` | 168 | insert | customers |
| `src/app/api/customers/[id]/route.ts` | 161, 243 | update, delete | customers |
| `src/app/api/locations/route.ts` | 190 | insert | merchant_locations |
| `src/app/api/locations/[id]/route.ts` | 290 | update | merchant_locations |
| `src/app/api/merchants/[id]/route.ts` | 321 | update | merchants |
| `src/app/api/tables/route.ts` | 195 | insert | tables |
| `src/app/api/tables/[id]/route.ts` | 178, 260 | update, delete | tables |
| `src/app/api/reservations/[id]/route.ts` | 178, 260 | update, delete | reservations |
| `src/app/api/admin/merchants/route.ts` | 227, 309, 318 | insert | merchants, merchant_locations, invitations |
| `src/app/api/admin/promote/route.ts` | 35 | insert | platform_personnel |
| `src/app/api/invitations/[token]/accept/route.ts` | 132, 148, 160 | update, insert | invitations, merchant_users |

---

## UI / Components

**No direct database writes.** All `.delete()` calls in components are in-memory (Map/Set, e.g. `next.delete()`, `newSelected.delete()`).

---

## Excluded

| Category | Notes |
|----------|-------|
| **scripts/** | Migration, seed, fill, cleanup scripts — one-off operations |
| **docs/** | Documentation references only |
| **lib/** | `queries.ts` sql`` used in .where() (reads); `permissions.ts` cache.delete (in-memory); `supabaseServer.ts` cookieStore.delete; `schema.ts` sql`` for indexes |
| **proxy.ts** | response.cookies.delete (HTTP, not DB) |

---

## Summary

| Classification | Count |
|----------------|-------|
| SAFE (domain) | 10 mutation sites |
| QUESTIONABLE (actions) | 52 mutation sites |
| DANGEROUS (API routes) | 45 mutation sites |
| **Total** | **107** |
