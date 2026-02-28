import { eq, and, isNull, gt } from "drizzle-orm";
import { db } from "@/db";
import { orders as ordersTable } from "@/lib/db/schema/orders";

export type OpenWaveOrder = {
  id: string;
  wave: number;
  firedAt: Date | null;
  locationId: string;
  status: string;
  station?: string | null;
};

/**
 * Find the open (unfired) wave for a session.
 * Returns the first order where session_id = sessionId AND fired_at IS NULL, ordered by wave.
 * When waveNumber is provided, returns the unfired order for that wave if it exists.
 * When minWave is provided (and waveNumber is not), returns the first unfired order with wave > minWave.
 */
export async function getOpenWave(
  sessionId: string,
  waveNumber?: number,
  minWave?: number
): Promise<OpenWaveOrder | null> {
  const conditions = [
    eq(ordersTable.sessionId, sessionId),
    isNull(ordersTable.firedAt),
    ...(waveNumber != null ? [eq(ordersTable.wave, waveNumber)] : []),
    ...(minWave != null && waveNumber == null ? [gt(ordersTable.wave, minWave)] : []),
  ];

  const [order] = await db
    .select({
      id: ordersTable.id,
      wave: ordersTable.wave,
      firedAt: ordersTable.firedAt,
      locationId: ordersTable.locationId,
      status: ordersTable.status,
      station: ordersTable.station,
    })
    .from(ordersTable)
    .where(and(...conditions))
    .orderBy(ordersTable.wave)
    .limit(1);

  return order ?? null;
}
