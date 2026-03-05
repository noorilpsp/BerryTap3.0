export function makeIdempotencyKey(): string {
  return crypto.randomUUID();
}

export type FetchPosOptions = { idempotencyKey?: string };
export type FetchPosEnvelope<T = unknown> = {
  res: Response;
  payload: T | null;
  correlationId?: string;
};

export function getPosCorrelationId(
  payload: unknown,
  res?: Response | null
): string | undefined {
  if (payload && typeof payload === "object") {
    const correlationId = (payload as { correlationId?: unknown }).correlationId;
    if (typeof correlationId === "string" && correlationId.trim()) {
      return correlationId;
    }
  }
  const headerValue = res?.headers.get("x-correlation-id");
  if (headerValue && headerValue.trim()) return headerValue;
  return undefined;
}

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

export async function fetchPosEnvelope<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit,
  opts?: FetchPosOptions
): Promise<FetchPosEnvelope<T>> {
  const res = await fetchPos(input, init, opts);
  const payload = (await res.json().catch(() => null)) as T | null;
  return {
    res,
    payload,
    correlationId: getPosCorrelationId(payload, res),
  };
}
