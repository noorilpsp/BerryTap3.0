/**
 * POS auth: fast path for the read-only GET /api/tables/[id]/pos route only.
 *
 * Uses getSession() first (reads from auth cookie, no network), then falls back to
 * getUser() (validates with Supabase Auth server) when no session is in the cookie.
 *
 * Security tradeoff vs getUser() alone:
 * - getUser(): Every request hits the Auth server; session is authoritative (revocation,
 *   logout elsewhere, etc. are reflected immediately).
 * - getSession(): Returns whatever is in the cookie; no server check. A just-revoked
 *   session can still be accepted for one request. Acceptable here because this helper
 *   is used only for the read-only POS table view; full merchant/location checks still
 *   run, and we do not use it for any mutation or privileged write path.
 *
 * Do not import this helper in mutation routes (POST/PATCH/DELETE, session close,
 * payments, etc.). Those must use supabase.auth.getUser() for authoritative auth.
 */

type AuthClient = {
  getSession(): Promise<{ data: { session: { user?: { id: string } } | null } }>;
  getUser(): Promise<{
    data: { user: { id: string } | null };
    error: unknown;
  }>;
};

export type PosAuthResult =
  | { ok: true; userId: string; mode: "getSession" | "getUser" }
  | { ok: false; reason: "unauthorized" };

/**
 * Returns the authenticated user id for the read-only POS route. Tries getSession()
 * first (cookie, no network), then getUser() if no valid session. Do not use in
 * mutation routes. Authorization behavior unchanged: unauthenticated => 401.
 */
export async function getPosUserId(supabase: {
  auth: AuthClient;
}): Promise<PosAuthResult> {
  const { data: sessionData } = await supabase.auth.getSession();
  const sessionUser = sessionData?.session?.user;
  if (sessionUser?.id) {
    return { ok: true, userId: sessionUser.id, mode: "getSession" };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return { ok: false, reason: "unauthorized" };
  }
  return { ok: true, userId: user.id, mode: "getUser" };
}
