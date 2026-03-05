# Caching Audit — NextFaster

Read-only audit of all caching patterns. No implementation changes.

---

## 1) Places We Cache (grouped by type)

### A) Auth / session caching

| Location | What | Key | Value | TTL / Invalidation | Scope | Multi-instance safe? |
|----------|------|-----|-------|--------------------|-------|----------------------|
| **`src/lib/supabaseServer.ts`** | Supabase server client (uses auth cookies) | Request (React `cache()`) | `createServerClient` instance | Per-request | Server | ✅ Yes (request-scoped) |
| **`src/lib/session.ts`** | Legacy JWT session | Cookie `session` | JWT token | 1 day | Server (reads via `cookies()`) | ✅ Yes (cookies) |
| **`src/proxy.ts`** | Admin check uses `getAdminStatusFromCookie` | Cookie `bt_admin_status` | `userId:isAdmin:timestamp` | 30 min | Server (middleware) | ✅ Yes (cookies) |

**Excerpt — Supabase client per-request cache:**

```typescript
// src/lib/supabaseServer.ts (lines 5-7, 43-46)
const getCachedSupabaseClient = cache(async () => {
  // ...
  let cookieStore: Awaited<ReturnType<typeof cookies>>
  try {
    cookieStore = await cookies()
  } catch (error) {
    // During prerendering...
  }
  return createServerClient(supabaseUrl, supabaseAnonKey, { cookies: { get, set, remove } })
})
```

**Excerpt — Session cookie read:**

```typescript
// src/lib/session.ts (lines 39-43)
export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await verifyToken(session);
}
```

---

### B) Permissions / memberships caching

| Location | What | Key | Value | TTL | Scope | Multi-instance safe? |
|----------|------|-----|-------|-----|-------|----------------------|
| **`src/lib/permissions/getSessionPermissions.ts`** | Merchant memberships | `['session-memberships', userId]` | `MerchantMembership[]` | 10 min (revalidate: 600) | Server | ✅ Yes (unstable_cache) |
| **`src/lib/permissions.ts`** | Platform admin | `['platform-personnel', userId]` + in-memory Map | `boolean` | 2 hr (unstable_cache) + 30 min (Map) | Server | ⚠️ Map: No (per-instance) |
| **`src/lib/permissions.ts`** | `getUserRole` | `['merchant-user-role', userId, merchantId]` | `{ role, isActive }` | 2 hr (7200) | Server | ✅ Yes |
| **`src/lib/permissions.ts`** | `canAccessLocation` (location + merchant-user) | `['location-merchant', locationId]`, `['merchant-user-location-access', userId, merchantId]` | Location merchantId; user role + locationAccess | 2 hr | Server | ✅ Yes |

**Excerpt — Memberships cache:**

```typescript
// src/lib/permissions/getSessionPermissions.ts (lines 25-64)
  const getCachedMemberships = unstable_cache(
    async () => {
      const result = await db.select(...)
        .from(merchantUsers)
        .innerJoin(merchants, eq(merchants.id, merchantUsers.merchantId))
        .where(and(eq(merchantUsers.userId, userId), eq(merchantUsers.isActive, true)))
      return result.map((r): MerchantMembership => ({ ... }))
    },
    ['session-memberships', userId],
    { revalidate: 600 } // 10 minutes
  )
  let merchantMemberships = await getCachedMemberships()
```

**Excerpt — Platform admin in-memory + unstable_cache:**

```typescript
// src/lib/permissions.ts (lines 146-151, 262-305)
const platformAdminCache = new Map<string, { result: boolean; expiresAt: number }>()
const PLATFORM_ADMIN_CACHE_TTL = 30 * 60 * 1000 // 30 min

// In isPlatformAdmin():
  const cached = platformAdminCache.get(userId)
  if (cached && cached.expiresAt > now) return cached.result
  // ... then unstable_cache(query, ['platform-personnel', userId], { revalidate: 7200 })
  platformAdminCache.set(userId, { result: isAdmin, expiresAt: now + PLATFORM_ADMIN_CACHE_TTL })
```

---

### C) Merchant / location context caching

| Location | What | Key | Value | TTL | Scope | Multi-instance safe? |
|----------|------|-----|-------|-----|-------|----------------------|
| **`src/app/api/merchants/[id]/route.ts`** | Merchant access check | `['merchant-access', user.id, merchantId]` | `boolean` | 10 min | Server | ✅ Yes |
| **`src/app/api/merchants/[id]/route.ts`** | Merchant data | `['merchant-data', merchantId]` | `Merchant` | 10 min | Server | ✅ Yes |
| **`src/app/api/locations/route.ts`** | Locations list | `["merchant-locations-list", merchantId]` | `MerchantLocation[]` | 10 min | Server | ✅ Yes |
| **`src/app/api/categories/route.ts`** | Categories list | `["categories-list", locationId]` | Categories + item count | 5 min | Server | ✅ Yes |
| **`src/app/api/categories/[id]/route.ts`** | Single category | `["category", categoryId]` | Category | 5 min | Server | ✅ Yes |
| **`src/app/api/menus/route.ts`** | Menus list | `["menus-list", locationId]` | Menus + category count | 5 min | Server | ✅ Yes |

**Excerpt — Locations cache:**

```typescript
// src/app/api/locations/route.ts (lines 65-77)
    const getCachedLocations = unstable_cache(
      async () => {
        const locations = await db.query.merchantLocations.findMany({
          where: eq(merchantLocations.merchantId, merchantId),
          orderBy: (locations, { desc }) => [desc(locations.createdAt)],
        })
        return locations
      },
      ["merchant-locations-list", merchantId],
      { revalidate: 600 } // 10 minutes
    )
```

---

### D) POS / TableView caching

| Location | What | Key | Value | TTL | Scope | Multi-instance safe? |
|----------|------|-----|-------|-----|-------|----------------------|
| **`src/app/table/[id]/page.tsx`** | TableView state | Client `useState` | `TableView` | Until unmount/refresh | Client | N/A |
| **`src/lib/pos/fetchPos.ts`** | No caching | — | — | — | — | — |
| **`GET /api/tables/[id]/pos`** | No caching | — | — | — | Server | — |

**Excerpt — TableView fetch (no cache):**

```typescript
// src/app/table/[id]/page.tsx (lines 595-599)
      const endpoint = `/api/tables/${encodeURIComponent(id)}/pos`
      const res = await fetch(endpoint, { cache: "no-store" })
```

- `/pos` returns `Cache-Control` implicitly from `posSuccess` (none set); no server-side caching.
- No `unstable_cache` or request-scoped cache for merchant/location context inside `/pos`.

---

### E) Generic cache utilities

| Location | What | Key | Value | TTL | Scope | Multi-instance safe? |
|----------|------|-----|-------|-----|-------|----------------------|
| **`src/lib/unstable-cache.ts`** | Wrapper over Next `unstable_cache` + React `cache()` | Caller-provided `key: string[]` | Callback result | Caller `revalidate` | Server | ✅ Yes (Next.js Data Cache) |
| **`src/lib/timeline-data.ts`** | Non-overlapping blocks | Module-level Map | `Map<tableId, TimelineBlock[]>` | Forever (static seed data) | Server | ⚠️ Per-instance |
| **`src/components/ui/link.tsx`** | Route prefetch + image prefetch | `Set<string>` (hrefs), `Map<string, PrefetchImage[]>` | RSC prefetch status, image URLs | Until tab close | Client | N/A |
| **`src/domain/idempotency.ts`** | Mutation replay | DB `posIdempotencyKeys.key` | `{ requestHash, responseJson }` | Manual cleanup (e.g. 30 days) | Server (DB) | ✅ Yes (DB-backed) |
| **`src/app/layout.tsx`** | Root layout revalidate | — | — | 86400 (1 day) | Server | ✅ Yes |
| **`POST /api/admin/clear-cache`** | Cache invalidation | — | — | — | Server | Clears in-memory + `revalidatePath` |

**Excerpt — unstable_cache wrapper:**

```typescript
// src/lib/unstable-cache.ts
import { unstable_cache as next_unstable_cache } from "next/cache";
import { cache } from "react";

// next_unstable_cache doesn't handle deduplication, so we wrap it in React's cache
export const unstable_cache = <Inputs extends unknown[], Output>(
  callback: (...args: Inputs) => Promise<Output>,
  key: string[],
  options: { revalidate: number },
) => cache(next_unstable_cache(callback, key, options));
```

**Excerpt — Idempotency (DB cache):**

```typescript
// src/domain/idempotency.ts (lines 58-75)
export async function getIdempotentResponse(params): Promise<IdempotentResult | null> {
  const [row] = await db.select().from(posIdempotencyKeys)
    .where(eq(posIdempotencyKeys.key, key))
    .limit(1);
  if (!row) return null;
  if (row.requestHash !== requestHash) return { ok: false, code: IDEMPOTENCY_CONFLICT };
  return { ok: true, response: row.responseJson };
}
```

**Excerpt — Link prefetch caches (client):**

```typescript
// src/components/ui/link.tsx (lines 64-66, 87-88, 102-104)
const seen = new Set<string>();
const imageCache = new Map<string, PrefetchImage[]>();
const routePrefetchCache = new Set<string>();
// ...
if (!routePrefetchCache.has(href)) {
  routePrefetchCache.add(href);
  // ... prefetch
}
if (!imageCache.has(href)) {
  void prefetchImages(href).then((images) => imageCache.set(href, images));
}
```

---

## 2) Specific checks

### `next/headers` `cookies()`

- `src/lib/supabaseServer.ts` — reads cookies for Supabase client
- `src/lib/session.ts` — reads/writes `session` cookie
- `src/app/actions/auth.ts` — writes `bt_admin_status` cookie
- `src/app/actions/location.ts` — reads cookies for location
- `src/app/api/debug/route.ts` — reads all cookies

### Next.js data cache

- **`unstable_cache`**: Used via `src/lib/unstable-cache.ts` in:
  - `getSessionPermissions`, `getUserRole`, `canAccessLocation`, `isPlatformAdmin` (permissions)
  - `getCurrentUser` (profile)
  - `GET /api/merchants/[id]`, `/api/locations`, `/api/categories`, `/api/categories/[id]`, `/api/menus`
- **`revalidatePath`**: `POST /api/admin/clear-cache` → `revalidatePath('/api/user/permissions')`
- **`revalidate`**: `src/app/layout.tsx` → `export const revalidate = 86400`

### React `cache()`

- `src/lib/unstable-cache.ts` — wraps `unstable_cache` for request deduplication
- `src/lib/supabaseServer.ts` — `getCachedSupabaseClient` (per-request Supabase client)

### `useSessionPermissions` + fetching

- `src/lib/hooks/useSessionPermissions.ts` — `fetch('/api/session/permissions', { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } })`
- `src/lib/contexts/PermissionsContext.tsx` — wraps `useSessionPermissions`, provides `sessionPermissions` + `getUserRole`
- Server: `GET /api/session/permissions` → `getSessionPermissions(user.id)` → `unstable_cache(['session-memberships', userId], { revalidate: 600 })`

### Supabase auth helpers

- `supabaseServer()` — creates Supabase client from cookies (cached per request)
- `supabase.auth.getUser()` — used everywhere; no local caching (Supabase handles token refresh)

### Middleware attaching user/merchant context

- `src/proxy.ts` — uses Supabase `getUser()`; for `/admin` uses in-memory + cookie + DB admin check
- No middleware that attaches merchant/location context; that happens in each route.

---

## 3) Recommendation

### Reuse for `/pos` merchant context

The repo already uses a clear pattern for merchant/location caching:

1. **`unstable_cache`** from `src/lib/unstable-cache.ts` (React `cache` + Next.js `unstable_cache`)
2. Keys like `['merchant-locations-list', merchantId]`, `['merchant-access', userId, merchantId]`
3. TTLs: 5–10 min for data, 2 hr for permissions
4. No browser cache; `Cache-Control: no-store` for auth-sensitive responses

`/pos` does **not** cache:

- `merchantUsers.findMany` (merchant IDs)
- `merchantLocations.findMany` (location IDs)
- `tables.findFirst`
- `sessions.findFirst`
- etc.

`/api/locations` and `/api/merchants/[id]` cache by `merchantId`; `/pos` resolves `merchantIds` → `locationIds` → `table` → `session` in a different flow (user → memberships → locations → table → session).

### Proposed new cache helper

Create a small helper for the **merchant-context chain** used by `/pos`:

- **File:** `src/lib/pos/merchantContextCache.ts` (or `src/lib/cache/posMerchantContext.ts`)
- **Purpose:** Cache the chain `userId` → `merchantIds` → `locationIds` (and optionally `table` / `session` by `tableId` / `sessionId`) via `unstable_cache`
- **Keys:** e.g. `['pos-merchant-ids', userId]`, `['pos-location-ids', merchantIds.join(',')]` — or a single `['pos-merchant-context', userId]` for the full chain
- **TTL:** 10 min, consistent with `/api/locations` and `/api/merchants`
- **Reuse:** Same `unstable_cache` import from `@/lib/unstable-cache`
- **Invalidation:** Time-based only; no tag-based revalidation exists today (would need Next.js cache tags if added)

Alternative: add caching directly inside `GET /api/tables/[id]/pos` for:

1. `merchantUsers.findMany` by `userId` → `['pos-merchant-users', userId]`
2. `merchantLocations.findMany` by `merchantIds` → `['pos-merchant-locations', sorted merchantIds]`

Both approaches fit the existing patterns; a dedicated helper keeps the POS route simpler and makes reuse easier for other POS-related endpoints.
