import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface DragHandleProps {
  isDragging?: boolean
  disabled?: boolean
  className?: string
}

export function DragHandle({ isDragging, disabled, className }: DragHandleProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        "w-11 h-11 -ml-2", // 44px touch target
        "transition-all duration-150",
        "cursor-grab active:cursor-grabbing",
        disabled && "opacity-20 cursor-not-allowed",
        !disabled && !isDragging && "opacity-40 hover:opacity-100 hover:scale-110",
        isDragging && "opacity-100 cursor-grabbing",
        className,
      )}
      aria-label="Drag handle"
      role="button"
      tabIndex={disabled ? -1 : 0}
    >
      <GripVertical
        className={cn(
          "w-6 h-6 transition-colors",
          "text-gray-400",
          !disabled && "hover:text-gray-600",
          isDragging && "text-gray-900",
        )}
      />
    </div>
  )
}
