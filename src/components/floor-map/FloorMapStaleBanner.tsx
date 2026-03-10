"use client";

import { Button } from "@/components/ui/button";

interface FloorMapStaleBannerProps {
  message: string;
  onRetry: () => void;
}

/** Shown when silent refresh fails but view exists. Keep showing content, offer Retry. */
export function FloorMapStaleBanner({ message, onRetry }: FloorMapStaleBannerProps) {
  return (
    <div
      className="shrink-0 px-4 py-2 flex items-center justify-center gap-3 text-sm bg-amber-500/20 text-amber-800 dark:bg-amber-500/25 dark:text-amber-200"
      role="alert"
    >
      <span>{message}</span>
      <Button size="sm" variant="outline" onClick={onRetry} className="shrink-0 border-current">
        Retry
      </Button>
    </div>
  );
}
