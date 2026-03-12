/**
 * Server helper for fetching TableView. Used by the table page for initial server render.
 * Auth via supabaseServer + getPosUserId; merchant context via getPosMerchantContext.
 */

import { supabaseServer } from "@/lib/supabaseServer";
import { getPosMerchantContext } from "@/lib/pos/posMerchantContext";
import { getPosUserId } from "@/lib/pos/posAuth";
import { buildTableView } from "@/lib/pos/buildTableView";
import type { TableView } from "@/lib/pos/tableView";

export type GetTableViewResult =
  | { data: TableView }
  | { error: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" };

/**
 * Fetch TableView for server-side render. Returns data or error.
 * Caller should redirect on UNAUTHORIZED/FORBIDDEN and notFound() on NOT_FOUND.
 */
export async function getTableView(
  tableId: string
): Promise<GetTableViewResult> {
  const supabase = await supabaseServer();
  const authResult = await getPosUserId(supabase);
  if (!authResult.ok) {
    return { error: "UNAUTHORIZED" };
  }

  const ctx = await getPosMerchantContext(authResult.userId);
  if (ctx.merchantIds.length === 0 || ctx.locationIds.length === 0) {
    return { error: "FORBIDDEN" };
  }

  const tableView = await buildTableView(tableId, ctx.locationIds);
  if (!tableView) {
    return { error: "NOT_FOUND" };
  }

  return { data: tableView };
}
