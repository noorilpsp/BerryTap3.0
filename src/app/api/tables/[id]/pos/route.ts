import { NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { posFailure, posSuccess, toErrorMessage } from "@/app/api/_lib/pos-envelope";
import type { TableView } from "@/lib/pos/tableView";
import { getPosMerchantContext } from "@/lib/pos/posMerchantContext";
import { getPosUserId } from "@/lib/pos/posAuth";
import { buildTableView } from "@/lib/pos/buildTableView";

export const runtime = "nodejs";

const DEV = process.env.NODE_ENV !== "production";

function devTimer(label: string, start: number, rowCount?: number): void {
  if (!DEV) return;
  const ms = Math.round(performance.now() - start);
  const rowPart = rowCount !== undefined ? ` rows=${rowCount}` : "";
  // eslint-disable-next-line no-console
  console.log(`[pos] ${label} ${ms}ms${rowPart}`);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const totalStart = DEV ? performance.now() : 0
  try {
    const { id } = await params
    const explainParam = request.nextUrl.searchParams.get("explain")
    const explainMode = DEV && explainParam === "1"
    const explainOutstanding = DEV && explainParam === "outstanding"
    const explainDelays = DEV && explainParam === "delays"
    const explainTables = DEV && explainParam === "tables"
    const explainClose = DEV && explainParam === "close"
    const debugIndexes = DEV && request.nextUrl.searchParams.get("debug_indexes") === "1"

    const supabase = await supabaseServer()
    const t0 = DEV ? performance.now() : 0
    const authResult = await getPosUserId(supabase)
    if (DEV) {
      devTimer("auth", t0)
      // eslint-disable-next-line no-console
      console.log("[pos][auth] mode=" + (authResult.ok ? authResult.mode : "none"))
    }
    if (!authResult.ok) {
      return posFailure("UNAUTHORIZED", "Unauthorized - Please log in", { status: 401 });
    }

    const tCtx = DEV ? performance.now() : 0
    const ctx = await getPosMerchantContext(authResult.userId)
    if (DEV) {
      devTimer("ctx.total", tCtx)
      // eslint-disable-next-line no-console
      console.log("[pos] ctx rows", {
        merchantUsers: ctx.merchantUserIds.length,
        merchants: ctx.merchantIds.length,
        locations: ctx.locationIds.length,
      })
    }
    const { merchantIds, locationIds } = ctx;
    if (merchantIds.length === 0) {
      return posFailure("FORBIDDEN", "Forbidden - You don't have access to any location", {
        status: 403,
      });
    }
    if (locationIds.length === 0) {
      return posFailure("FORBIDDEN", "Forbidden - No locations available", { status: 403 });
    }

    const t3 = DEV ? performance.now() : 0;
    const warnExtremeDelays = DEV && request.nextUrl.searchParams.get("debug_delays") === "1";
    const tableView = await buildTableView(id, locationIds, { warnExtremeDelays });
    if (DEV) devTimer("buildTableView", t3, tableView ? 1 : 0);

    const runExplainQuery = async (baseSql: string, params: unknown[]) => {
      const explainFullSql = `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) ${baseSql}`;
      const { neon } = await import("@neondatabase/serverless");
      const client = neon(process.env.DATABASE_URL!);
      const rows = (await client.query(explainFullSql, params)) as { "QUERY PLAN"?: string }[];
      return Array.isArray(rows)
        ? rows.map((r) => r["QUERY PLAN"] ?? String(r)).join("\n")
        : String(rows);
    };

    let explainResult: string | undefined;
    const tableLookupMode = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
      ? "uuid"
      : "displayId";
    const displayIdForLookup = tableLookupMode === "displayId" ? id.trim().toUpperCase() : "";

    if (explainTables) {
      try {
        const tablesSql =
          tableLookupMode === "uuid"
            ? "SELECT 1 FROM tables WHERE id = $1 AND location_id = ANY($2::uuid[])"
            : "SELECT 1 FROM tables WHERE location_id = ANY($1::uuid[]) AND display_id = $2";
        const tablesParams =
          tableLookupMode === "uuid" ? [id, locationIds] : [locationIds, displayIdForLookup];
        explainResult = await runExplainQuery(tablesSql, tablesParams);
      } catch (err) {
        explainResult = `EXPLAIN tables failed: ${err instanceof Error ? err.message : String(err)}`;
      }
    }

    if (!tableView) {
      return posFailure("NOT_FOUND", "Table not found", { status: 404 });
    }

    const sessionId = tableView.openSession?.id ?? null;
    const orderIds = tableView.items
      ? [...new Set(tableView.items.map((i) => i.orderId))]
      : [];

    if (orderIds.length > 0) {
      if (explainMode) {
        try {
          explainResult = await runExplainQuery(
            "SELECT * FROM order_items WHERE order_id = ANY($1::uuid[]) ORDER BY created_at ASC",
            [orderIds]
          );
        } catch (err) {
          explainResult = `EXPLAIN failed: ${err instanceof Error ? err.message : String(err)}`;
        }
      }
      if (explainOutstanding) {
        try {
          explainResult = await runExplainQuery(
            "SELECT * FROM order_items WHERE order_id = ANY($1::uuid[]) AND voided_at IS NULL",
            [orderIds]
          );
        } catch (err) {
          explainResult = `EXPLAIN failed: ${err instanceof Error ? err.message : String(err)}`;
        }
      }
      if (explainDelays) {
        try {
          explainResult = await runExplainQuery(
            "SELECT * FROM order_items WHERE order_id = ANY($1::uuid[]) AND sent_to_kitchen_at IS NOT NULL AND ready_at IS NULL AND voided_at IS NULL",
            [orderIds]
          );
        } catch (err) {
          explainResult = `EXPLAIN failed: ${err instanceof Error ? err.message : String(err)}`;
        }
      }
    }

    let explainCloseResult: {
      pendingPayments: string;
      ordersTotal: string;
      paymentsTotal: string;
    } | undefined
    if (explainClose && sessionId) {
      const runExplain = async (baseSql: string, params: unknown[]) => {
        const fullSql = `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) ${baseSql}`
        const { neon } = await import("@neondatabase/serverless")
        const client = neon(process.env.DATABASE_URL!)
        const rows = (await client.query(fullSql, params)) as { "QUERY PLAN"?: string }[]
        return Array.isArray(rows)
          ? rows.map((r) => r["QUERY PLAN"] ?? String(r)).join("\n")
          : String(rows)
      }
      try {
        const [p, o, pay] = await Promise.all([
          runExplain(
            "SELECT count(*)::int FROM payments WHERE session_id = $1 AND status IN ('pending')",
            [sessionId],
          ),
          runExplain(
            "SELECT COALESCE(SUM(total),0)::numeric FROM orders WHERE session_id = $1 AND status != 'cancelled'",
            [sessionId],
          ),
          runExplain(
            "SELECT COALESCE(SUM(amount),0)::numeric FROM payments WHERE session_id = $1 AND status = 'completed'",
            [sessionId],
          ),
        ])
        explainCloseResult = {
          pendingPayments: p,
          ordersTotal: o,
          paymentsTotal: pay,
        }
      } catch (err) {
        explainCloseResult = {
          pendingPayments: String(err),
          ordersTotal: String(err),
          paymentsTotal: String(err),
        }
      }
    }

    if (DEV) devTimer("GET /pos total", totalStart);

    let meta: {
      explain?: string;
      explainClose?: { pendingPayments: string; ordersTotal: string; paymentsTotal: string };
      indexes?: { indexname: string; indexdef: string }[];
    } | undefined
    if (explainResult !== undefined) meta = { ...meta, explain: explainResult }
    if (explainCloseResult !== undefined) meta = { ...meta, explainClose: explainCloseResult }
    if (debugIndexes) {
      try {
        const { neon } = await import("@neondatabase/serverless")
        const client = neon(process.env.DATABASE_URL!)
        await client.query("ANALYZE order_items;")
        await client.query("ANALYZE orders;")
        await client.query("ANALYZE seats;")
        if (DEV) {
          // eslint-disable-next-line no-console
          console.log("[pos] ANALYZE order_items, orders, seats completed")
        }
        const indexRows = (await client.query(
          "SELECT indexname, indexdef FROM pg_indexes WHERE tablename IN ($1, $2, $3) ORDER BY tablename, indexname",
          ["order_items", "orders", "seats"]
        )) as { indexname: string; indexdef: string }[]
        meta = { ...meta, indexes: Array.isArray(indexRows) ? indexRows : [] }
      } catch (err) {
        meta = { ...meta, indexes: [] }
      }
    }

    if (meta !== undefined) {
      return new Response(
        JSON.stringify({
          ok: true,
        data: tableView,
          meta,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return posSuccess<TableView>(tableView);
  } catch (error) {
    return posFailure(
      "INTERNAL_ERROR",
      toErrorMessage(error, "Internal server error - Failed to load table POS view"),
      { status: 500 }
    );
  }
}
