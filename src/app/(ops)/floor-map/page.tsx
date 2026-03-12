import { redirect } from "next/navigation";
import { getFloorMapView } from "@/lib/floor-map/getFloorMapView";
import { FloorMapClient } from "./FloorMapClient";

export const dynamic = "force-dynamic";

export default async function FloorMapPage() {
  const result = await getFloorMapView();

  if (result.error === "UNAUTHORIZED" || result.error === "FORBIDDEN") {
    redirect("/login");
  }

  return <FloorMapClient initialFloorMapView={result.error === "NO_LOCATION" ? null : result.data} />;
}
