import type React from "react"
import { cn } from "@/lib/utils"

interface CardGridProps {
  children: React.ReactNode
  className?: string
  columns?: 1 | 2 | 3 | 4
}

export function CardGrid({ children, className, columns = 4 }: CardGridProps) {
  return (
    <div
      className={cn(
        "grid gap-4",
        {
          "grid-cols-1": columns === 1,
          "grid-cols-1 md:grid-cols-2": columns === 2,
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-3": columns === 3,
          "grid-cols-1 md:grid-cols-2 lg:grid-cols-4": columns === 4,
        },
        className,
      )}
    >
      {children}
    </div>
  )
}
