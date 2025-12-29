# Next.js Prefetch Authentication Problem - Detailed Context

## Project Overview

**Tech Stack:**
- Next.js 16.0.10 (App Router)
- React 19.2.3
- Supabase (@supabase/ssr 0.8.0) for authentication
- TypeScript
- Custom middleware (`src/proxy.ts`) for route protection

**Project Structure:**
- Custom Link component at `src/components/ui/link.tsx`
- Middleware/proxy at `src/proxy.ts` (exported as `proxy` function)
- Supabase server client at `src/lib/supabaseServer.ts`
- Protected routes: `/admin/*` and `/dashboard/*`
- Public routes: `/login`, `/signup`, `/forgot-password`, `/reset-password`

## Authentication System

### How Authentication Works

1. **Supabase SSR Setup:**
   - Uses `@supabase/ssr` package
   - Auth cookies follow pattern: `sb-<project-id>-auth-token` or similar
   - Cookies are set with `sameSite: 'lax'`
   - Server client created via `createServerClient()` with cookie handlers

2. **Middleware Authentication:**
   - Located in `src/proxy.ts`
   - Runs on every request matching the matcher config
   - Creates Supabase client using `request.cookies` (middleware context)
   - Calls `supabase.auth.getUser()` to verify authentication
   - For `/admin/*` routes, also checks platform admin status via `isPlatformAdmin()`

3. **Cookie Detection:**
   ```typescript
   // Current implementation checks for:
   - Cookie names containing 'sb-'
   - Cookie names containing 'supabase'
   ```

4. **Route Protection Levels:**
   - `/dashboard/*`: Requires authentication only
   - `/admin/*`: Requires authentication + platform admin role
   - Auth pages: Redirect authenticated users to dashboard

## Custom Link Component

### Location: `src/components/ui/link.tsx`

**Key Features:**
1. **Wraps Next.js Link** with custom prefetching logic
2. **Disables default prefetch**: `prefetch={false}` on NextLink
3. **Manual prefetching** via `router.prefetch()` on:
   - `onMouseEnter` (hover)
   - IntersectionObserver (when link enters viewport)

**Critical Code Sections:**

```typescript
// Line 86: Disables Next.js default prefetch
<NextLink prefetch={false} ...>

// Line 88: Manual prefetch on hover
onMouseEnter={() => {
  router.prefetch(String(props.href));
  // ... also prefetches images
}}

// Line 54: Prefetch when link enters viewport
router.prefetch(String(props.href));
```

**What `router.prefetch()` Does:**
- Makes a GET request to the target route
- Fetches the page's JavaScript bundle and data
- **Problem**: This request often doesn't include:
  - Auth cookies
  - Referer headers
  - Explicit prefetch headers (sometimes)

## Middleware/Proxy Implementation

### Location: `src/proxy.ts`

**Current Logic Flow:**

1. **Skip API routes** (line 18-20)
2. **Detect prefetch requests** (lines 22-55):
   ```typescript
   const isPrefetch =
     nextRouterPrefetch === '1' ||
     purpose === 'prefetch' ||
     secPurpose === 'prefetch' ||
     (secFetchDest === 'empty' && secFetchMode === 'cors' && hasNextUrl) ||
     // PROBLEMATIC LINE:
     (!hasAuthCookies && request.method === 'GET' && 
      (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')))
   ```
3. **If prefetch detected**: Allow through without auth check
4. **Otherwise**: Create Supabase client and authenticate
5. **Route-specific checks**: Redirect unauthenticated users to `/login`

**Matcher Configuration:**
```typescript
export const config = {
  matcher: [
    '/login', '/login/:path*',
    '/signup', '/signup/:path*',
    '/forgot-password', '/forgot-password/:path*',
    '/reset-password', '/reset-password/:path*',
    '/dashboard', '/dashboard/:path*',
    '/admin', '/admin/:path*',
  ],
}
```

## The Core Problem

### Goal:
1. ✅ Allow prefetching to work (when hovering over links)
2. ❌ Block direct navigation from logged-out users to protected routes

### The Challenge:

**Prefetch requests (`router.prefetch()`) often don't send:**
- ❌ Auth cookies (Supabase session cookies)
- ❌ Referer headers
- ❌ Explicit prefetch headers (inconsistent)

**Direct navigation from logged-out user also has:**
- ❌ No cookies (not logged in)
- ❌ No referer (typing URL directly)

**Result:** Prefetches and direct navigation look identical in middleware - both have zero cookies and no reliable headers.

## Observed Behavior

### Terminal Logs Show:

**Successful authenticated navigation:**
```
[proxy] route protection check { path: '/dashboard' }
[proxy] dashboard access granted { userId: 'fe23ad36-870a-4518-ac0b-a9fafcf50de4' }
GET /dashboard 200
```

**Prefetch request (zero cookies):**
```
[proxy] route protection check { path: '/admin/merchants/1514ad5c-e3ab-4481-b9cf-99fcbf7dba04' }
[proxy] auth error - cookies found {
  error: 'Auth session missing!',
  totalCookies: 0,
  supabaseCookies: []
}
[proxy] admin access denied - not authenticated
GET /login 200 (redirect)
```

**The Issue:**
- Prefetch to `/admin/merchants/[id]` has zero cookies
- Gets blocked and redirected to `/login`
- This breaks prefetching functionality

## Attempted Solutions

### Attempt 1: Check Explicit Prefetch Headers
```typescript
const isPrefetch = 
  nextRouterPrefetch === '1' ||
  purpose === 'prefetch' ||
  secPurpose === 'prefetch'
```
**Problem:** `router.prefetch()` doesn't always send these headers
**Result:** Prefetches blocked ❌

### Attempt 2: Check for Referer
```typescript
const referer = request.headers.get('referer')
const isPrefetch = referer && referer.includes(origin)
```
**Problem:** `router.prefetch()` doesn't always send referer
**Result:** Prefetches blocked ❌

### Attempt 3: Check Authentication First
```typescript
// Check auth first, then allow prefetches if authenticated
const user = await supabase.auth.getUser()
if (isPrefetch && user) { allow }
```
**Problem:** Auth check fails when cookies aren't sent
**Result:** Prefetches blocked ❌

### Attempt 4: Allow Requests Without Cookies
```typescript
if (!hasAuthCookies && request.method === 'GET') { allow }
```
**Problem:** Too permissive - allows logged-out direct navigation
**Result:** Security broken ❌

### Attempt 5: Cookie + Referer Detection
```typescript
if (!hasAuthCookies && hasReferer) { allow }
```
**Problem:** `router.prefetch()` doesn't always send referer
**Result:** Prefetches still blocked or security broken ❌

### Attempt 6: Check Authentication First, Then Allow Prefetches
```typescript
// Get user first
const user = await supabase.auth.getUser()
// Then check if prefetch
if (isPrefetch && user) { allow }
```
**Problem:** Auth check fails when cookies aren't sent
**Result:** Prefetches blocked ❌

### Attempt 7: Allow All GET Requests + Page-Level Checks
**Problem:** Page-level checks cause 307 redirects on prefetches
**Result:** 307 errors on prefetches ❌

### Attempt 8: Page-Level Checks with Prefetch Detection
**Problem:** Prefetch detection fails (no reliable headers)
**Result:** Still getting 307s ❌

### Attempt 9: Cookie Detection in Page Components
**Problem:** Too permissive - allows logged-out users
**Result:** Security broken ❌

### Attempt 10: Cookie + Referer Detection
**Problem:** `router.prefetch()` doesn't always send referer
**Result:** Prefetches still blocked or security broken ❌

### Current Attempt (Line 49):
```typescript
(!hasAuthCookies && request.method === 'GET' && 
 (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')))
```
**Problem:** Allows logged-out users to access protected routes
**Result:** Security broken ❌

## Why We Keep Going in Circles

1. **`router.prefetch()` is inconsistent:**
   - Sometimes sends headers, sometimes doesn't
   - Never sends cookies (by design for privacy)
   - Doesn't always send referer

2. **Any rule that allows prefetches also allows direct navigation:**
   - Both have zero cookies
   - Both are GET requests
   - Both may lack headers

3. **Any rule that blocks direct navigation also blocks prefetches:**
   - They look identical to middleware

## Possible Solutions

### Option A: Accept Imperfect Prefetching
- Block all unauthenticated GET requests in middleware
- Prefetches from authenticated users work (they have cookies)
- Prefetches from unauthenticated users fail (acceptable trade-off)
- **Pros:** Secure, simple
- **Cons:** Prefetching doesn't work for logged-out users

### Option B: Custom Prefetch Mechanism
- Don't rely on `router.prefetch()`
- Implement custom prefetch that always sends a special header (e.g., `X-Prefetch: true`)
- Check for that header in middleware
- **Pros:** Reliable detection
- **Cons:** Requires changing Link component, more complex

### Option C: Client-Side Route Protection
- Allow all GET requests in middleware
- Use client-side checks to hide/redirect on protected pages
- **Pros:** Simple
- **Cons:** Less secure (HTML sent before check), SEO issues

### Option D: Accept 307 Redirects
- Allow prefetches to get 307s
- They're harmless (just a redirect, no data exposed)
- Real navigation still works
- **Pros:** Simple, secure
- **Cons:** Prefetch warnings in console, wasted requests

### Option E: Check for ANY Cookies (Not Just Auth)
- `router.prefetch()` sends zero cookies
- Real navigation has at least some cookies (tracking, session, etc.)
- Logic:
  - If request has zero cookies → likely prefetch → allow
  - If request has cookies but no auth → direct navigation → block
  - If request has auth cookies → allow
- **Pros:** Most promising, doesn't break security
- **Cons:** Edge case: user with cookies disabled might be blocked

### Option F: Use Next.js Middleware `request.nextUrl` vs `request.url`
- Check if request is from same origin with proper headers
- **Pros:** Uses Next.js built-in detection
- **Cons:** May not work if headers are missing

### Option G: Two-Step Prefetch Detection
1. Check if request has zero cookies AND is GET to protected route → likely prefetch
2. For prefetches: Return a lightweight response (no auth check)
3. For real navigation: Full auth check
- **Pros:** Allows prefetches, blocks direct navigation
- **Cons:** Need to ensure prefetch responses don't expose sensitive data

## Recommended Approach: Option E + Option G Hybrid

**Logic:**
```typescript
// Step 1: Check cookie count
const allCookies = request.cookies.getAll()
const hasAnyCookies = allCookies.length > 0
const hasAuthCookies = allCookies.some(c => 
  c.name.includes('sb-') || c.name.includes('supabase')
)

// Step 2: Detect prefetch
const isLikelyPrefetch = 
  // Explicit prefetch headers
  (nextRouterPrefetch === '1' || purpose === 'prefetch' || ...) ||
  // Zero cookies on GET to protected route = prefetch
  (!hasAnyCookies && request.method === 'GET' && isProtectedRoute)

// Step 3: Handle accordingly
if (isLikelyPrefetch) {
  // Allow prefetch - it's just HTML, no sensitive data
  return response
}

// Step 4: Authenticate real navigation
if (!hasAuthCookies) {
  // No auth cookies = not logged in = block
  return redirect('/login')
}
```

**Why This Works:**
- Prefetches have zero cookies → allowed
- Direct navigation from logged-out user has zero cookies → BUT wait, this is the problem!

**The Real Issue:**
We can't distinguish between:
- Prefetch (zero cookies) → should allow
- Direct navigation from logged-out user (zero cookies) → should block

**Potential Solution:**
Check if the request is coming from a browser that has cookies set for the domain (even if not sent). But this isn't possible in middleware.

**Alternative:**
Accept that prefetches might fail for logged-out users, but ensure they work for logged-in users (who have cookies).

## Additional Context

### How Next.js Prefetching Works

1. **`router.prefetch(href)`:**
   - Makes a GET request to the route
   - Fetches React Server Component payload
   - Caches it for instant navigation
   - **Does NOT send cookies by default** (privacy/security)

2. **Actual Navigation:**
   - User clicks link
   - `router.push()` or `router.replace()`
   - **DOES send cookies** (full browser request)

### Supabase Cookie Behavior

- Cookies are set with `sameSite: 'lax'`
- Should be sent on same-site navigation
- May not be sent on programmatic fetch (like `router.prefetch()`)

### Current Link Component Behavior

- Line 88: `onMouseEnter` calls `router.prefetch()`
- This triggers a GET request without cookies
- Middleware sees zero cookies
- Current logic treats it as prefetch (line 49)
- But this also allows logged-out direct navigation

## Questions for Solution

1. **Is it acceptable for prefetches to fail for logged-out users?**
   - If yes: Block all zero-cookie requests
   - If no: Need different approach

2. **Can we modify the Link component to send a custom header?**
   - If yes: Custom prefetch detection becomes possible
   - If no: Must rely on heuristics

3. **Is it acceptable to send a lightweight response for prefetches?**
   - If yes: Can return minimal HTML without auth check
   - If no: Need full page even for prefetches

4. **Can we check if user is logged in via a different method?**
   - Client-side check before prefetching?
   - Check localStorage/sessionStorage?

## Files to Review

1. `src/proxy.ts` - Middleware implementation
2. `src/components/ui/link.tsx` - Custom Link component
3. `src/lib/supabaseServer.ts` - Supabase client setup
4. `src/lib/permissions.ts` - Admin permission checks

## Test Cases to Consider

1. ✅ Logged-in user hovers over `/admin/merchants/[id]` link → should prefetch
2. ❌ Logged-out user types `/admin/merchants/[id]` in URL → should redirect to login
3. ✅ Logged-in user clicks `/admin/merchants/[id]` link → should navigate
4. ❌ Logged-out user hovers over `/admin/merchants/[id]` link → currently fails, but is this acceptable?

## Next Steps

Please provide a solution that:
1. Allows prefetching for logged-in users
2. Blocks direct navigation for logged-out users
3. Works reliably (doesn't depend on inconsistent headers)
4. Maintains security (doesn't expose sensitive data)

The core challenge is: **How to distinguish prefetch requests from direct navigation when both have zero cookies?**


