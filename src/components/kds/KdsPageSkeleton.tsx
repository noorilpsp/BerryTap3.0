"use client";

import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton ticket: top bar, item rows, footer. Mirrors KDSTicket structure. */
function SkeletonTicket({ itemRows = 3 }: { itemRows?: number }) {
  return (
    <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/50 overflow-hidden">
      <div className="px-3 py-2 border-b border-zinc-700/50">
        <Skeleton className="h-4 w-24 bg-zinc-700" />
      </div>
      <div className="px-3 py-2 space-y-2">
        {Array.from({ length: itemRows }).map((_, i) => (
          <Skeleton key={i} className="h-3.5 w-full bg-zinc-700" />
        ))}
      </div>
      <div className="px-3 py-2 border-t border-zinc-700/50">
        <Skeleton className="h-8 w-full rounded bg-zinc-700" />
      </div>
    </div>
  );
}

/** Dark KDS skeleton for /kds. Mirrors NEW / PREPARING / READY column layout. */
export function KdsPageSkeleton() {
  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Header bar (stations + controls) - matches KDSHeader */}
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 rounded-md bg-zinc-700" />
          <Skeleton className="h-9 w-20 rounded-md bg-zinc-700" />
          <Skeleton className="h-9 w-20 rounded-md bg-zinc-700" />
          <Skeleton className="h-9 w-20 rounded-md bg-zinc-700" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-md bg-zinc-700" />
          <Skeleton className="h-8 w-8 rounded-md bg-zinc-700" />
        </div>
      </header>

      {/* Columns - 20% NEW, 60% PREPARING, 20% READY (matches KDSColumns) */}
      <div className="flex flex-1 min-h-0 overflow-hidden divide-x-2 divide-zinc-800">
        {/* NEW - 20% */}
        <div className="w-[20%] shrink-0 flex flex-col min-h-0 bg-zinc-900/50">
          <div className="shrink-0 border-b border-zinc-800 px-4 py-2">
            <Skeleton className="h-5 w-14 bg-zinc-700" />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonTicket key={i} itemRows={i % 2 === 0 ? 2 : 3} />
            ))}
          </div>
        </div>

        {/* PREPARING - 60%, header has blue accent like real KDS */}
        <div className="w-[60%] shrink-0 flex flex-col min-h-0 bg-zinc-900/50">
          <div className="shrink-0 border-b-2 border-b-blue-500/50 px-4 py-2 bg-zinc-900">
            <Skeleton className="h-5 w-24 bg-zinc-700" />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonTicket key={i} itemRows={i <= 2 ? 4 : 3} />
            ))}
          </div>
        </div>

        {/* READY - 20% */}
        <div className="w-[20%] shrink-0 flex flex-col min-h-0 bg-zinc-900/30">
          <div className="shrink-0 border-b border-zinc-800 px-4 py-2">
            <Skeleton className="h-5 w-12 bg-zinc-700" />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonTicket key={i} itemRows={2} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
