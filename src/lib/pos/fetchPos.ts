export function makeIdempotencyKey(): string {
  return crypto.randomUUID();
}

export type FetchPosOptions = { idempotencyKey?: string };

export async function fetchPos(
  input: RequestInfo | URL,
  init?: RequestInit,
  opts?: FetchPosOptions
): Promise<Response> {
  const key = opts?.idempotencyKey ?? makeIdempotencyKey();
  const headers = new Headers(init?.headers ?? {});
  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Idempotency-Key", key);
  headers.set("X-Client-Request-Id", key);
  return fetch(input, { ...init, headers });
}
