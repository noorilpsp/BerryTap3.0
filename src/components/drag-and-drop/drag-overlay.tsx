import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface DragOverlayProps {
  children: ReactNode
  className?: string
}

export function DragOverlay({ children, className }: DragOverlayProps) {
  return (
    <div
      className={cn(
        "fixed z-[9999] pointer-events-none",
        "opacity-90 shadow-2xl",
        "rotate-[-2deg]",
        "transition-transform duration-[16ms]",
        className,
      )}
      style={{
        transform: "translate(20px, 10px)",
      }}
    >
      {children}
    </div>
  )
}
