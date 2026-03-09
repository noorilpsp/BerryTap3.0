"use client"

import { Skeleton } from "@/components/ui/skeleton"

/** Dark table-page skeleton for /table/[id]. Uses explicit dark colors so it renders
 * consistently from OpsProviders (no ops-tables-root) and from the table page. */
export function TablePageSkeleton() {
  return (
    <div className="flex min-h-dvh h-full flex-col bg-zinc-950 pb-14">
      {/* Top bar skeleton */}
      <header className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-3 py-2.5 md:px-4 md:py-3">
        <Skeleton className="h-9 w-9 shrink-0 rounded-md bg-zinc-700" />
        <Skeleton className="h-6 w-20 bg-zinc-700" />
        <Skeleton className="h-4 w-12 bg-zinc-700" />
        <Skeleton className="h-4 w-14 bg-zinc-700" />
        <Skeleton className="h-6 w-16 rounded-full bg-zinc-700" />
      </header>

      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex h-full min-w-0 flex-1 flex-col">
          {/* Mobile: table visual placeholder */}
          <div className="shrink-0 border-b border-zinc-800 bg-zinc-900 md:hidden">
            <div className="p-3">
              <Skeleton className="h-32 w-full rounded-lg bg-zinc-700" />
            </div>
          </div>

          {/* Main content placeholder */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-5">
            <div className="space-y-4">
              <Skeleton className="h-4 w-32 bg-zinc-700" />
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-md bg-zinc-700" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar skeleton (hidden on mobile) */}
        <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-zinc-800 bg-zinc-900 md:block lg:w-80">
          <div className="space-y-4 p-4">
            <Skeleton className="h-3 w-24 bg-zinc-700" />
            <Skeleton className="h-40 w-full rounded-lg bg-zinc-700" />
            <div className="space-y-2 pt-2">
              <Skeleton className="h-4 w-full bg-zinc-700" />
              <Skeleton className="h-4 w-3/4 bg-zinc-700" />
              <Skeleton className="h-4 w-1/2 bg-zinc-700" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
