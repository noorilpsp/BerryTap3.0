import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { merchantUsers } from "@/lib/db/schema/merchant-users";
import { merchantLocations } from "@/lib/db/schema/merchant-locations";
import { unstable_cache } from "@/lib/unstable-cache";

const DEV = process.env.NODE_ENV !== "production";

// Module-scope fetchers (DB logic not recreated per call)
async function fetchMerchantUsersDb(userId: string) {
  return db.query.merchantUsers.findMany({
    where: and(
      eq(merchantUsers.userId, userId),
      eq(merchantUsers.isActive, true),
    ),
    columns: {
      id: true,
      merchantId: true,
    },
  });
}

async function fetchMerchantLocationsDb(merchantIds: string[]) {
  return db.query.merchantLocations.findMany({
    where: inArray(merchantLocations.merchantId, merchantIds),
    columns: {
      id: true,
      merchantId: true,
    },
  });
}

export type PosMerchantContext = {
  merchantUserIds: string[];
  merchantIds: string[];
  locationIds: string[];
};

/**
 * Cached helper for resolving merchant and location context used by POS routes.
 * - Caches merchantUsers by userId (10 minutes)
 * - Caches merchantLocations by sorted merchantIds (10 minutes)
 */
export async function getPosMerchantContext(userId: string): Promise<PosMerchantContext> {
  const merchantUsersHit = { value: true };
  const getCachedMerchantUsers = unstable_cache(
    async () => {
      merchantUsersHit.value = false;
      if (DEV) {
        // eslint-disable-next-line no-console
        console.time("[pos][ctx] merchantUsers DB");
      }
      const rows = await fetchMerchantUsersDb(userId);
      if (DEV) {
        // eslint-disable-next-line no-console
        console.timeEnd("[pos][ctx] merchantUsers DB");
      }
      return rows;
    },
    ["pos-merchant-users", userId],
    { revalidate: 600 },
  );

  const merchantUserRows = await getCachedMerchantUsers();
  if (DEV) {
    // eslint-disable-next-line no-console
    console.log("[pos][ctx] merchantUsers", merchantUsersHit.value ? "HIT" : "MISS", merchantUserRows.length, "rows");
  }
  const merchantIds = Array.from(
    new Set(merchantUserRows.map((row) => row.merchantId)),
  );

  if (merchantIds.length === 0) {
    return {
      merchantUserIds: [],
      merchantIds: [],
      locationIds: [],
    };
  }

  const merchantIdsSorted = [...merchantIds].sort();
  const merchantKey = merchantIdsSorted.join(",");

  const merchantLocationsHit = { value: true };
  const getCachedLocations = unstable_cache(
    async () => {
      merchantLocationsHit.value = false;
      if (DEV) {
        // eslint-disable-next-line no-console
        console.time("[pos][ctx] merchantLocations DB");
      }
      const rows = await fetchMerchantLocationsDb(merchantIdsSorted);
      if (DEV) {
        // eslint-disable-next-line no-console
        console.timeEnd("[pos][ctx] merchantLocations DB");
      }
      return rows;
    },
    ["pos-merchant-locations", merchantKey],
    { revalidate: 600 },
  );

  const locationRows = await getCachedLocations();
  if (DEV) {
    // eslint-disable-next-line no-console
    console.log("[pos][ctx] merchantLocations", merchantLocationsHit.value ? "HIT" : "MISS", locationRows.length, "rows");
  }
  const locationIds = locationRows.map((row) => row.id);

  return {
    merchantUserIds: merchantUserRows.map((row) => row.id),
    merchantIds,
    locationIds,
  };
}

