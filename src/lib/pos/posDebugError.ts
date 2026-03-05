import { getPosCorrelationId } from "@/lib/pos/fetchPos";

type PosDebugInput = {
  label: string;
  endpoint: string;
  payload?: unknown;
  res?: Response | null;
};

export function posDebugError({ label, endpoint, payload, res }: PosDebugInput) {
  if (process.env.NODE_ENV === "production") return;
  const correlationId = getPosCorrelationId(payload, res);
  console.warn("[POS_DEBUG]", {
    label,
    endpoint,
    correlationId: correlationId ?? null,
    status: res?.status ?? null,
    ok: res?.ok ?? null,
    payload: payload ?? null,
  });
}
