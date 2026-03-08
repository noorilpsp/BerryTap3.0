# Table Page Blueprint — Decisions

**Source:** `docs/TABLE-PAGE-ARCHITECTURE-TEARDOWN.md`  
**Purpose:** Turn the teardown into a practical project standard for future pages. Short, decision-focused.

---

## 1. What we should standardize everywhere

- **One GET = one full read model.** One endpoint returns everything the page needs in a single typed payload (e.g. `TableView`). *Why:* Predictable loading, one place to patch from mutations. *Example:* `src/app/api/tables/[id]/pos/route.ts` → `{ ok: true, data: TableView }`.

- **Envelope: `{ ok, data }` / `{ ok: false, error: { code, message } }`.** All POS-style routes use the same response shape. *Why:* Consistent client handling and error display. *Example:* `src/app/api/_lib/pos-envelope.ts` — `posSuccess`, `posFailure`.

- **Mutation routes return patch-sized payloads.** Success response contains only what the client needs to update the view (e.g. `{ waveNumber }`, `{ addedItems }`, `{ deletedSeatNumber }`), not the full view. *Why:* Enables onSuccessPatch without refetch. *Example:* `src/app/api/sessions/[sessionId]/waves/next/route.ts` → `data: { waveNumber }`.

- **Optimistic update → request → onSuccessPatch or silent refresh.** Pattern: apply optimistic state, call API, on success either patch view from response (no refetch) or run refresh in background. *Why:* Fast UI and fewer full reloads. *Example:* `fireAndReconcile` in `src/app/table/[id]/page.tsx` with `onSuccessPatch`.

- **Idempotency-Key on all mutations.** Client sends header; route uses it for replay protection. *Why:* Safe retries and duplicate submission handling. *Example:* `src/lib/pos/fetchPos.ts` (adds key), `requireIdempotencyKey` in `src/app/api/_lib/pos-envelope.ts`.

- **Domain does the work; routes validate and delegate.** Routes: auth, membership, idempotency, then call domain (e.g. `fireWave`, `advanceWaveStatus`). No business logic in route body. *Why:* Single place for rules and testability. *Example:* `src/app/api/sessions/[sessionId]/waves/[waveNumber]/fire/route.ts` → `fireWave` from `@/domain`.

- **Pure helpers for derived read data.** Values like “can close?” or “delays” are computed from already-fetched rows, not with extra DB in the GET. *Why:* Reuse same logic (e.g. close check) and keep GET fast. *Example:* `src/lib/pos/computeOutstanding.ts`, `src/lib/pos/computeKitchenDelays.ts` used in GET `/pos`.

- **Cache membership/context, not the full view.** Cache “user → merchant/location IDs” (e.g. 10 min); do not cache the page’s read model. *Why:* View stays fresh; membership changes slowly. *Example:* `src/lib/pos/posMerchantContext.ts` — `getPosMerchantContext(userId)` with `unstable_cache`.

- **Read-only auth fast path only on read-only GET.** A cookie-first auth path (e.g. getSession then getUser) is allowed only for GET endpoints that do not mutate. *Why:* Fewer auth server calls on hot read path; mutations must stay authoritative. *Example:* `src/lib/pos/posAuth.ts` — `getPosUserId` used only in GET `/api/tables/[id]/pos`.

---

## 2. What is specific to /table/[id] and should NOT be copied directly

- **Single ~3100-line page component.** The table page is one giant client component with dozens of handlers and all state in one file. *Why:* Hard to maintain and reuse; copy the *patterns* (view hook, mutation hook, patch) into a split structure, not the monolith.

- **Shared `rollbackSnapshotRef` for fire/advance/serve/void.** One ref holds the previous view for rollback; multiple mutation types overwrite it. *Why:* Concurrent clicks can corrupt rollback; this is a known gap. New pages should use per-mutation snapshots or a single mutation queue.

- **Inline `projectTableView` and wave/seat mapping in the page.** Table-specific logic (wave number → type, item status mapping, meal progress) lives in the page file. *Why:* That’s view projection and belongs in a view hook or lib, not duplicated in every page.

- **DEV-only timing scattered in handlers.** console.time/timeEnd and queueMicrotask logs inside individual handlers. *Why:* Noisy and page-specific. Standardize with a single DEV instrumentation layer (e.g. in the mutation hook or route), not per handler.

- **getPosUserId (getSession then getUser) on any mutation route.** Table page correctly uses it only for GET /pos. *Why:* Mutation routes must use authoritative auth (e.g. `getUser()` only); copying the fast path to a POST/PUT/DELETE would be a security mistake.

- **Optimistic overlays for “pending” entities (e.g. optimisticWavesAdded, optimisticSeatOps).** The exact shape (added/deleted/renamed for seats, added/deleted for waves) is table-domain specific. *Why:* Other pages will have different entities; copy the *idea* (track pending adds/removes, merge in useMemo), not the exact state shape.

---

## 3. What must be refactored before reuse

- **Giant page:** Extract a **view hook** (holds view state, refresh, patch, derived/optimistic state) and a **mutation hook** (fireAndReconcile, mutateThenRefresh, all handlers). Page shell should only compose hooks + presentational components. *Target:* Page file under ~300 lines; no 50+ handlers in one place.

- **Rollback strategy:** Replace single `rollbackSnapshotRef` with either (a) one snapshot per mutation type/key, or (b) a single “pending mutation” queue so only one mutation runs at a time and rollback is unambiguous. *Target:* No shared ref that multiple flows overwrite.

- **Auth shortcut guardrails:** (1) Document in code and in this doc: `getPosUserId` is **read-only GET only**. (2) Mutation routes must not import it; they must use `supabase.auth.getUser()`. (3) Consider a lint or comment in `src/lib/pos/posAuth.ts` that lists allowed call sites (e.g. GET `/api/tables/[id]/pos` only). *Target:* No accidental use of fast path on a mutation.

- **Type boundaries:** Table page uses both `TableView` (lib/pos) and `TableDetail` (lib/table-data); `projectTableView` maps one to the other. Decide: either one canonical view type for the page, or a clear “API view” vs “UI view” split with one mapping layer. *Target:* No duplicated or ambiguous types when new pages adopt the blueprint.

---

## 4. Standard page blueprint

- **Page shell:** Thin client component. Composes: view hook, mutation hook, presentational components. Handles route params (e.g. `id`), passes data and handlers down. No business logic or long handler definitions in the page file.

- **Read-model GET route:** One GET per “screen” or entity that returns a full view type (e.g. `KdsView`, `FloorView`). Uses envelope `{ ok, data }`. For read-only GETs, auth can use the fast path (getSession then getUser) if documented. Uses cached membership/context where applicable (e.g. getPosMerchantContext). Optional DEV query params (e.g. `explain=1`) for diagnostics.

- **View hook:** Owns: raw view state (e.g. `tableView`), `refresh(silent?)`, `patch(fn)`, and derived state (e.g. projected list, optimistic overlays merged in useMemo). Exposes: view, loading, error, derived values. Pure projection (e.g. projectTableView) lives here or in a lib called by the hook.

- **Mutation hook:** Owns: `fireAndReconcile`, `mutateThenRefresh`, and all mutation handlers (e.g. handleFireWave, handleAddSeat). Takes the view hook’s `patch` and `refresh` and optionally `ensureSession` (or equivalent). Exposes: handlers only. In-flight flags live here to prevent double submit.

- **Pure compute helpers:** In lib (e.g. `src/lib/pos/computeOutstanding.ts`). Used by the read-model GET and optionally by actions/routes for the same rules (e.g. closeability). No DB inside; accept already-loaded rows.

- **Domain layer:** All write flows and pure validators. Routes call domain (e.g. `fireWave`, `advanceWaveStatus`); domain uses serviceFlow validators and DB. No business logic in route handlers.

- **Patch-friendly mutation routes:** Each mutation returns a minimal success payload (e.g. `{ waveNumber }`, `{ addedItems, autoFiredWave? }`, `{ deletedSeatNumber }`). Client uses it in `onSuccessPatch` to update the view without refetch. Exception: flows that change “whole world” (e.g. close + navigate) use mutateThenRefresh.

---

## 5. Standard API blueprint

- **GET routes:** Return `{ ok: true, data: ViewType }` or `{ ok: false, error: { code, message } }`. No caching of the full view; cache only membership/context (e.g. by userId). Use `cache: "no-store"` (or equivalent) on the client for the GET. Optional `meta` for DEV (e.g. explain, indexes).

- **Mutation routes:** Require `Idempotency-Key` header. Validate auth with `getUser()` (never read-only fast path). Validate membership, then call domain. Return `{ ok: true, data: PatchPayload }` where PatchPayload is the minimal set of fields the client needs to patch the view (ids, status, counts). Use `posSuccess`/`posFailure` and `requireIdempotencyKey` from `src/app/api/_lib/pos-envelope.ts`.

- **Idempotency rules:** (1) Client sends Idempotency-Key on every mutation (e.g. via `fetchPos` from `src/lib/pos/fetchPos.ts`). (2) Route rejects if key missing. (3) Route uses domain idempotency (e.g. `getIdempotentResponse` / `saveIdempotentResponse` in `src/domain/idempotency.ts`) so replay returns the same response.

- **When to patch vs refresh:** **Patch:** When the mutation response contains everything needed to update the view (e.g. add one seat, update item status). Use `onSuccessPatch(result)` and do not refetch. **Refresh:** When the mutation changes too much to patch (e.g. close session, navigate away) or when there is no patch-friendly response. Use `mutateThenRefresh` and optionally navigate after.

---

## 6. Performance rules

- **What to measure:** Use DEV-only timing (e.g. `devTimer` in `src/lib/pos/devTimer.ts`) and optional explain query params (e.g. `?explain=1`) on the read-model GET. Measure: auth, context/membership load, main query(ies), and total request time. Log slow queries and row counts in DEV only.

- **When to cache:** Cache membership/context (e.g. merchant and location IDs by user) with ~10 min revalidate. Do not cache the full read-model response for POS-style pages. Use the same pattern as `getPosMerchantContext` in `src/lib/pos/posMerchantContext.ts`.

- **When to parallelize:** Run independent DB calls in parallel (e.g. seats + orders, then order items; then money agg + delays). Same as GET `/api/tables/[id]/pos`: two parallel blocks, then one dependent query, then another parallel block.

- **When to add indexes:** Only after EXPLAIN (or equivalent) shows a real bottleneck (e.g. sequential scan on a hot filter). Document the index and the query in a perf doc (e.g. `docs/POS-PERFORMANCE-SUMMARY.md`).

- **What not to optimize early:** Do not add indexes without profiling. Do not cache the full view. Do not move to a “refresh after every mutation” pattern when a patch-friendly response is possible. Do not add production logging or timing; keep explain/timing DEV-only.

---

## 7. Rollout recommendation

**First three places to adopt this blueprint:**

1. **KDS page**  
   - **Why:** Same POS concepts (waves, items, fire, advance, serve); natural fit for the same read-model + patch pattern.  
   - **Copy:** One GET that returns a KDS-style view (e.g. orders/items by station). Mutation routes (fire, advance, serve, void) return patch payloads. View hook + mutation hook; fireAndReconcile + onSuccessPatch. Reuse `getPosMerchantContext`, `fetchPos`, `pos-envelope`, domain `fireWave`/`advanceWaveStatus`/`serveItem`/`voidItem`.

2. **Floor map**  
   - **Why:** Uses table list and session state; needs a single source of truth for “floor state” and consistent mutation envelope.  
   - **Copy:** One GET for floor/tables state (e.g. tables with session summary). Patch-friendly responses for any mutation that updates table/session (e.g. ensure session, close). View hook for floor state; mutation hook for seat party / open table. Reuse envelope, idempotency, and domain (e.g. ensureSessionByTableUuid).

3. **Orders list / order detail**  
   - **Why:** Order-centric screens; same “one GET = full view” and patch-friendly mutations (e.g. update order status, add item) reduce round-trips.  
   - **Copy:** One GET per context (e.g. order list for location, order detail by id). Mutations return minimal payloads (e.g. `{ orderId, status }`, `{ addedItem }`). View hook + mutation hook; reuse envelope, idempotency, domain (e.g. createOrderFromApi, updateOrderStatus), and pure helpers where applicable.

For each: (1) Define the view type and GET route. (2) Add or reuse mutation routes with patch-sized responses. (3) Build view hook and mutation hook; page shell composes them. (4) Do not copy the table page’s single giant component or shared rollback ref; use the refactored pattern (per-mutation snapshot or queue, split hooks).
