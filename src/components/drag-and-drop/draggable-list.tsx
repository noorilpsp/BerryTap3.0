"use client"

import type React from "react"

import { type ReactNode, useState } from "react"
import { cn } from "@/lib/utils"
import { DragHandle } from "./drag-handle"
import { DropIndicator } from "./drop-indicator"

interface DraggableListProps<T> {
  items: T[]
  onReorder: (items: T[]) => void
  renderItem: (item: T, isDragging: boolean) => ReactNode
  keyExtractor: (item: T) => string
  disabled?: boolean
  className?: string
}

export function DraggableList<T>({
  items,
  onReorder,
  renderItem,
  keyExtractor,
  disabled = false,
  className,
}: DraggableListProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
  const [keyboardGrabbedIndex, setKeyboardGrabbedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    if (disabled) return
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    if (draggedIndex === null || dropTargetIndex === null) {
      setDraggedIndex(null)
      setDropTargetIndex(null)
      return
    }

    if (draggedIndex === dropTargetIndex) {
      setDraggedIndex(null)
      setDropTargetIndex(null)
      return
    }

    const newItems = [...items]
    const [removed] = newItems.splice(draggedIndex, 1)
    newItems.splice(dropTargetIndex, 0, removed)

    onReorder(newItems)
    setDraggedIndex(null)
    setDropTargetIndex(null)
  }

  const handleDragOver = (index: number) => {
    if (draggedIndex === null) return
    setDropTargetIndex(index)
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (disabled) return

    // Space to grab/drop
    if (e.key === " ") {
      e.preventDefault()
      if (keyboardGrabbedIndex === null) {
        setKeyboardGrabbedIndex(index)
      } else {
        // Drop at current position
        if (keyboardGrabbedIndex !== index) {
          const newItems = [...items]
          const [removed] = newItems.splice(keyboardGrabbedIndex, 1)
          newItems.splice(index, 0, removed)
          onReorder(newItems)
        }
        setKeyboardGrabbedIndex(null)
      }
    }

    // Escape to cancel
    if (e.key === "Escape") {
      setKeyboardGrabbedIndex(null)
    }

    // Arrow keys to move
    if (keyboardGrabbedIndex !== null) {
      if (e.key === "ArrowUp" && index > 0) {
        e.preventDefault()
        const newItems = [...items]
        const [removed] = newItems.splice(index, 1)
        newItems.splice(index - 1, 0, removed)
        onReorder(newItems)
        setKeyboardGrabbedIndex(index - 1)
      }
      if (e.key === "ArrowDown" && index < items.length - 1) {
        e.preventDefault()
        const newItems = [...items]
        const [removed] = newItems.splice(index, 1)
        newItems.splice(index + 1, 0, removed)
        onReorder(newItems)
        setKeyboardGrabbedIndex(index + 1)
      }
    }
  }

  return (
    <div className={cn("space-y-2", className)} role="list">
      {items.map((item, index) => {
        const isDragging = draggedIndex === index
        const isDropTarget = dropTargetIndex === index
        const isKeyboardGrabbed = keyboardGrabbedIndex === index

        return (
          <div
            key={keyExtractor(item)}
            className={cn(
              "relative group",
              "transition-all duration-300 ease-out",
              isDragging && "opacity-50 scale-[1.02] shadow-2xl z-10",
              isDropTarget && "bg-orange-50 border-t-2 border-orange-500",
              isKeyboardGrabbed && "ring-2 ring-orange-500 ring-dashed",
            )}
            draggable={!disabled}
            onDragStart={() => handleDragStart(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => {
              e.preventDefault()
              handleDragOver(index)
            }}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={disabled ? -1 : 0}
            role="listitem"
            aria-grabbed={isDragging || isKeyboardGrabbed}
          >
            <DropIndicator position="top" isActive={isDropTarget && draggedIndex !== null && draggedIndex < index} />

            <div className="flex items-center gap-2">
              <DragHandle isDragging={isDragging} disabled={disabled} />
              <div className="flex-1">{renderItem(item, isDragging)}</div>
            </div>

            <DropIndicator position="bottom" isActive={isDropTarget && draggedIndex !== null && draggedIndex > index} />
          </div>
        )
      })}
    </div>
  )
}
