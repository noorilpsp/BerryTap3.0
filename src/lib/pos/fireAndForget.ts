/**
 * Fire-and-forget helper for non-blocking POS calls (e.g. layout persist, events).
 * Logs failures with console.warn in development only; no UX impact.
 */
export function fireAndForget(
  promise: Promise<unknown>,
  label: string
): void {
  promise.catch((err) => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[${label}] failed`, err);
    }
  });
}
