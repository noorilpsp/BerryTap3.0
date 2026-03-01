/**
 * Transaction helper for POS domain operations.
 * Uses neon-serverless + Pool for transaction support (neon-http does not support transactions).
 */

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@/db/schema";
import { db } from "@/db";

if (typeof globalThis.WebSocket === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const ws = require("ws");
  neonConfig.webSocketConstructor = ws;
}

let _txDb: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getTransactionDb() {
  if (!_txDb) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is not set");
    }
    const pool = new Pool({ connectionString: databaseUrl });
    _txDb = drizzle(pool, { schema });
  }
  return _txDb;
}

/**
 * Run a callback inside a database transaction.
 * Use when a domain operation requires multiple writes that must succeed or fail together.
 *
 * @param fn - Callback receiving a transaction client with the same insert/update/delete/query API as db
 * @returns The result of the callback
 */
export async function withTx<T>(fn: (tx: typeof db) => Promise<T>): Promise<T> {
  const txDb = getTransactionDb();
  return txDb.transaction(fn);
}
