# Ops Server-Read Architecture Pattern

This document describes the server-read architecture adopted for ops pages (`/table/[id]`, `/floor-map`) and provides practical guidance for future ops pages.

---

## Why `/` felt fast

The home page and many dashboard routes load quickly because:

1. **Server renders first** — The initial HTML includes content or a clear shell.
2. **Progressive enhancement** — Client hydration and interactivity attach after paint.
3. **No fetch-then-render** — The user is not waiting on a separate API call before seeing anything.

---

## Why old client-fetch ops pages felt slower

The previous pattern for `/table/[id]` and `/floor-map` was:

1. Client mounts
2. Skeleton or placeholder renders
3. `useEffect` → `fetch` to an API route
4. API runs queries and returns JSON
5. Client replaces skeleton with real data

**Problems:**
- Time to first meaningful content = shell render + network RTT + API work.
- The skeleton helps perceived speed but still blocks useful content.
- Moving the same work to the server (RSC) made the full cost visible as a single render phase, which felt slower because there was no early shell while the server worked.

---

## Final pattern we adopted

### Server components for initial reads
- The ops page is a Server Component.
- It calls a server helper (`getTableView`, `getFloorMapView`) during RSC.
- The response HTML includes the full initial data.

### Direct server helpers for reads
- `getTableView(tableId)` — auth, merchant context, then `buildTableView`.
- `getFloorMapView(floorplanId?)` — auth, merchant context, then `buildFloorMapView`.
- These run in the RSC request; no extra client fetch for initial load.

### API / server actions for mutations
- Mutations (seat, close, add wave, etc.) use API routes or server actions.
- The client calls these and then refreshes or revalidates as needed.

### Client components for interactivity
- Client components handle:
  - Optimistic updates
  - Real-time events (SSE, polling)
  - Forms and interactive controls
  - Silent refresh after mutations

### Small client caches for revisits
- Client-side caching (e.g. SWR, React Query) for revisits and navigation.
- Initial data comes from the server; client cache is for subsequent fetches.

---

## Optimization sequence we followed

1. **Move initial read to server**  
   Replace client `fetch` on mount with a server helper invoked during RSC.

2. **Share logic between route and helper**  
   Use a single core function (e.g. `buildFloorMapView`, `buildTableView`) shared by:
   - The server helper (for RSC)
   - The API route (for client refresh / fallback)

3. **Measure**  
   Add dev-only timers around major steps to identify bottlenecks.

4. **Remove duplicate work**  
   - Avoid repeated auth/access checks (e.g. `verifyLocationAccess`).
   - Introduce trusted helpers used only after validation.

5. **Parallelize independent work**  
   - Use `Promise.all` for independent queries.
   - Run enrichment and current-server lookup in parallel.

---

## Practical guidance for future ops pages

### When adding a new ops page
1. Make the page a Server Component.
2. Create a server helper: `getXView(params)` → `{ data: X } | { error: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" }`.
3. Render the initial view from that data.
4. Use a Client Component for interactivity and mutations.
5. Provide an API route or server action for mutations and refreshes.

### Auth and access
- Validate auth and access once at the top of the server helper.
- Use trusted helpers (no `verifyLocationAccess`) for downstream steps to avoid duplicate checks.
- Use `getPosMerchantContext` (cached) for merchant/location context.

### Shared core
- Extract shared read logic into a `buildXView` (or equivalent) used by both the server helper and API route.
- Keep the API contract stable for client refresh and fallback.

### Timing (development only)
- Use dev-only timers (`NODE_ENV !== "production"`) for performance investigation.
- Do not log timing in production.
