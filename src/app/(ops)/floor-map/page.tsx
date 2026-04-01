import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getFloorMapView } from "@/lib/floor-map/getFloorMapView";
import { FloorMapPageSkeleton } from "@/components/floor-map/FloorMapPageSkeleton";
import { FloorMapClient } from "./FloorMapClient";

export const dynamic = "force-dynamic";

export default async function FloorMapPage({
  searchParams,
}: {
  searchParams: Promise<{ floorplan?: string }>;
}) {
  const sp = await searchParams;
  const floorplanParam = sp.floorplan?.trim() || null;
  const result = await getFloorMapView(floorplanParam);

  if (result.error === "UNAUTHORIZED" || result.error === "FORBIDDEN") {
    redirect("/login");
  }

  return (
    <Suspense fallback={<FloorMapPageSkeleton />}>
      <FloorMapClient initialFloorMapView={result.error === "NO_LOCATION" ? null : result.data} />
    </Suspense>
  );
}
