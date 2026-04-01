/** Ops floor map route with optional plan id (must stay in sync with FloorMapClient search param). */
export function floorMapPath(floorPlanId?: string | null): string {
  const id = floorPlanId?.trim();
  if (id) {
    return `/floor-map?floorplan=${encodeURIComponent(id)}`;
  }
  return "/floor-map";
}
