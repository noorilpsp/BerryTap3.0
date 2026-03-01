import {
  detectKitchenDelays,
  type DetectKitchenDelaysOptions,
  type KitchenDelayItem,
} from "@/app/actions/kitchen-delay-detection";

export type { DetectKitchenDelaysOptions, KitchenDelayItem };

/**
 * Domain wrapper for kitchen delay detection.
 */
export async function checkKitchenDelays(
  sessionId: string,
  options?: DetectKitchenDelaysOptions
): Promise<KitchenDelayItem[]> {
  return detectKitchenDelays(sessionId, options);
}
