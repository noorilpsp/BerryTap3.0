import { cn } from "@/lib/utils"

interface DropIndicatorProps {
  position: "top" | "bottom"
  isActive: boolean
}

export function DropIndicator({ position, isActive }: DropIndicatorProps) {
  if (!isActive) return null

  return (
    <div
      className={cn(
        "absolute left-0 right-0 h-0.5",
        position === "top" ? "-top-px" : "-bottom-px",
        "bg-orange-500",
        "shadow-[0_0_8px_rgba(249,115,22,0.6)]",
        "animate-in fade-in zoom-in-95 duration-150",
        "origin-center",
      )}
      style={{
        animation: "scaleX 150ms ease-out",
      }}
    />
  )
}
