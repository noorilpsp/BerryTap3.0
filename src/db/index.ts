import * as schema from "./schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";

// Lazy initialization: only create connection when DATABASE_URL is available
// This prevents build-time errors when env vars aren't set during static generation
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (!_db) {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error(
        "DATABASE_URL is not set. Please ensure it's configured in your environment variables."
      );
    }
    const sql = neon(databaseUrl);
    _db = drizzle({ client: sql, schema });
  }
  return _db;
}

// Export a Proxy that lazily initializes the database
// This ensures neon() is only called when db is actually used, not at module load time
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    const dbInstance = getDb();
    const value = dbInstance[prop as keyof typeof dbInstance];
    // Preserve function context
    if (typeof value === 'function') {
      return value.bind(dbInstance);
    }
    return value;
  },
});
