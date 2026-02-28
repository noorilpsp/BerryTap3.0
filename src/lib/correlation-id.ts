import { randomUUID } from "node:crypto";

/** Generate a unique ID to correlate events triggered by the same user action. */
export function generateCorrelationId(): string {
  return randomUUID();
}
