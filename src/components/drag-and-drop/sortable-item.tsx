"use client"

import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"
import { DragHandle } from "./drag-handle"

interface SortableItemProps {
  id: string
  children: (isDragging: boolean) => React.ReactNode
  data?: any
}

export function SortableItem({ id, children, data }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group transition-all duration-200",
        isDragging && "opacity-50 scale-[1.02] shadow-2xl z-20",
      )}
    >
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners}>
          <DragHandle isDragging={isDragging} />
        </div>
        <div className="flex-1">{children(isDragging)}</div>
      </div>
    </div>
  )
}
