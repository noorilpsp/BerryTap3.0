/**
 * Prefetch table data from /api/tables/[id]/pos and populate the table cache.
 * Used for floor map table intent (pointer enter/down) so the table page can render immediately.
 */

import { getTableCache, setTableCache } from "@/lib/view-cache";
import { isTableView } from "@/lib/pos/tableView";

const prefetchedTableIds = new Set<string>();

export function prefetchTableData(tableId: string): void {
  if (prefetchedTableIds.has(tableId)) return;
  prefetchedTableIds.add(tableId);

  const endpoint = `/api/tables/${encodeURIComponent(tableId)}/pos`;
  fetch(endpoint, {
    credentials: "include",
    cache: "no-store",
  })
    .then((res) => res.json().catch(() => null))
    .then((payload) => {
      if (!payload?.ok || !isTableView(payload?.data)) return;
      const data = payload.data;
      const matches =
        data.table?.id === tableId ||
        (data.table?.displayId != null &&
          data.table.displayId.toLowerCase() === tableId.toLowerCase());
      if (!matches) return;
      setTableCache(tableId, data);
    })
    .catch(() => {
      prefetchedTableIds.delete(tableId);
    });
}

