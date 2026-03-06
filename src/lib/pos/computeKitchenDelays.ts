import type { DetectKitchenDelaysOptions } from "@/app/actions/kitchen-delay-detection";

const DEV = process.env.NODE_ENV !== "production";

export type KitchenDelayItem = {
  orderItemId: string;
  minutesLate: number;
  station: string | null;
};

const DEFAULT_WARNING_MINUTES = 10;
const MS_PER_MINUTE = 60 * 1000;

function toMillis(value: Date | string | null | undefined): number | null {
  if (!value) return null;
  if (value instanceof Date) return value.getTime();
  const t = new Date(value as string).getTime();
  return Number.isFinite(t) ? t : null;
}

export function computeKitchenDelaysFromOrderItems(
  items: {
    id: string;
    orderId: string;
    sentToKitchenAt: Date | string | null;
    readyAt: Date | string | null;
    voidedAt: Date | string | null;
    stationOverride: string | null;
  }[],
  orderIdToStation: Map<string, string | null>,
  options?: DetectKitchenDelaysOptions
): KitchenDelayItem[] {
  const warningMinutes = options?.warningMinutes ?? DEFAULT_WARNING_MINUTES;
  const now = Date.now();
  const results: KitchenDelayItem[] = [];
  const extremeDelays: { orderItemId: string; minutesLate: number; sentToKitchenAt: string }[] = [];

  for (const item of items) {
    const sentAtMs = toMillis(item.sentToKitchenAt);
    const readyAtMs = toMillis(item.readyAt);
    const voidedAtMs = toMillis(item.voidedAt);

    // Not sent, already ready, or voided: not delayed
    if (sentAtMs === null || readyAtMs !== null || voidedAtMs !== null) continue;

    let elapsedMs = now - sentAtMs;
    if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
      elapsedMs = 0;
    }
    const minutesLate = Math.floor(elapsedMs / MS_PER_MINUTE);

    if (minutesLate < warningMinutes) continue;

    if (DEV && options?.warnExtremeDelays && minutesLate > 240) {
      const sentIso =
        item.sentToKitchenAt instanceof Date
          ? item.sentToKitchenAt.toISOString()
          : String(item.sentToKitchenAt);
      extremeDelays.push({
        orderItemId: item.id,
        minutesLate,
        sentToKitchenAt: sentIso,
      });
    }

    const orderStation = orderIdToStation.get(item.orderId) ?? null;
    const station = item.stationOverride ?? orderStation;

    results.push({
      orderItemId: item.id,
      minutesLate,
      station,
    });
  }

  if (DEV && options?.warnExtremeDelays && extremeDelays.length > 0) {
    // One per-request warning; only when warnExtremeDelays is set (e.g. ?debug_delays=1)
    // eslint-disable-next-line no-console
    console.warn("[pos][delays] minutesLate > 240", {
      serverNow: new Date().toISOString(),
      count: extremeDelays.length,
      sample: extremeDelays[0],
    });
  }

  return results;
}

