"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Dark floor map skeleton for /floor-map. Mirrors map/grid layout for smooth transition. */
export function FloorMapPageSkeleton() {
  return (
    <div className="flex h-full flex-col bg-zinc-950 text-zinc-100 pb-14">
      {/* Top bar skeleton */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md bg-zinc-700" />
          <Skeleton className="h-8 w-20 rounded-md bg-zinc-700" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-md bg-zinc-700" />
          <Skeleton className="h-8 w-8 rounded-md bg-zinc-700" />
        </div>
      </header>

      {/* Stats bar skeleton */}
      <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 bg-zinc-900/80 px-4 py-2 md:px-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-16 rounded-md bg-zinc-700" />
        ))}
      </div>

      {/* Map/grid content area */}
      <div className="flex flex-1 min-h-0 p-4">
        <div className="flex w-full gap-4">
          {/* Grid of table cards */}
          <div className="flex flex-1 flex-wrap gap-3 content-start">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                className="h-28 w-[140px] md:w-[180px] rounded-xl bg-zinc-700"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
