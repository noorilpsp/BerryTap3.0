import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface SkeletonBlockProps {
  variant?: "card" | "table" | "chart" | "list"
  rows?: number
  className?: string
}

export function SkeletonBlock({ variant = "card", rows = 3, className }: SkeletonBlockProps) {
  if (variant === "card") {
    return (
      <div className={cn("rounded-lg border bg-card p-4 md:p-6 space-y-4 animate-pulse", className)}>
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    )
  }

  if (variant === "table") {
    return (
      <div className={cn("space-y-3 animate-pulse", className)}>
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (variant === "chart") {
    return (
      <div className={cn("rounded-lg border bg-card p-4 md:p-6 space-y-4 animate-pulse", className)}>
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  if (variant === "list") {
    return (
      <div className={cn("space-y-3 animate-pulse", className)}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return null
}
