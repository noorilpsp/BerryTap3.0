const DEV = process.env.NODE_ENV !== "production";

export function devTimer(label: string, start: number, rowCount?: number): void {
  if (!DEV) return;
  const ms = Math.round(performance.now() - start);
  const rowPart = rowCount !== undefined ? ` rows=${rowCount}` : "";
  // eslint-disable-next-line no-console
  console.log(`[pos] ${label} ${ms}ms${rowPart}`);
}

/** Start a console.time for a DB call (DEV only). Pair with devTimeEnd. */
export function devTimeStart(label: string): void {
  if (!DEV) return;
  // eslint-disable-next-line no-console
  console.time(label);
}

/** End console.time and optionally log row count (DEV only). */
export function devTimeEnd(label: string, rowCount?: number): void {
  if (!DEV) return;
  // eslint-disable-next-line no-console
  console.timeEnd(label);
  if (rowCount !== undefined) {
    // eslint-disable-next-line no-console
    console.log(`[pos] ${label} rows=${rowCount}`);
  }
}

export function devSqlLog(endpoint: string, label: string, sql: string, params: unknown[]): void {
  if (!DEV) return;
  // eslint-disable-next-line no-console
  console.log(`[pos] ${endpoint} slowest: ${label}`, { sql, params });
}

/**
 * Run EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) for the given SQL and params.
 * DEV only; requires DATABASE_URL. Returns plan text or error string.
 */
export async function runExplain(querySql: string, params: unknown[]): Promise<string> {
  if (!DEV || process.env.NODE_ENV === "production") return "";
  try {
    const { neon } = await import("@neondatabase/serverless");
    const client = neon(process.env.DATABASE_URL!);
    const explainSql = `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) ${querySql}`;
    const rows = (await client.query(explainSql, params)) as { "QUERY PLAN"?: string }[];
    return Array.isArray(rows)
      ? rows.map((r) => r["QUERY PLAN"] ?? String(r)).join("\n")
      : String(rows);
  } catch (err) {
    return `EXPLAIN failed: ${err instanceof Error ? err.message : String(err)}`;
  }
}

export { DEV };
