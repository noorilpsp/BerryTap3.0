import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const posIdempotencyKeys = pgTable("pos_idempotency_keys", {
  key: text("key").primaryKey(),
  userId: text("user_id").notNull(),
  route: text("route").notNull(),
  requestHash: text("request_hash").notNull(),
  responseJson: jsonb("response_json").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PosIdempotencyKey = typeof posIdempotencyKeys.$inferSelect;
export type NewPosIdempotencyKey = typeof posIdempotencyKeys.$inferInsert;
