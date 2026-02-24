"use client"

import React from "react"
import { cn } from "@/lib/utils"
import type { PlacedElement } from "@/lib/floorplan-types"

interface FloorplanElementsProps {
  elements: PlacedElement[]
  scale: number
  offset: { x: number; y: number }
}

// Element rendering - matches the builder's visual style
function ElementRenderer({ element }: { element: PlacedElement }) {
  const baseClasses = "absolute pointer-events-none"
  
  // Style based on element properties
  const elementStyle: React.CSSProperties = {
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    transform: `rotate(${element.rotation || 0}deg)`,
    opacity: element.opacity,
  }

  // Determine element appearance based on category and type
  const getElementClasses = () => {
    const { category, subtype, color } = element

    // Base styling
    let classes = baseClasses

    if (category === "walls") {
      classes += " bg-border border border-border/50"
    } else if (category === "furniture") {
      if (subtype === "chair") {
        classes += " bg-secondary border border-border rounded-md"
      } else if (subtype === "couch") {
        classes += " bg-secondary border border-border rounded-lg"
      } else if (subtype === "plant") {
        classes += " bg-emerald-500/20 border border-emerald-500/30 rounded-full"
      }
    } else if (category === "decorations") {
      if (subtype === "plant") {
        classes += " bg-emerald-500/20 border border-emerald-500/30 rounded-full"
      } else if (subtype === "artwork") {
        classes += " bg-primary/10 border border-primary/30 rounded"
      } else {
        classes += " bg-muted border border-border rounded"
      }
    } else if (category === "bar") {
      classes += " bg-amber-500/20 border-2 border-amber-500/40 rounded-lg"
    } else if (category === "service") {
      if (subtype === "kitchen-door") {
        classes += " bg-red-500/20 border-2 border-red-500/40 rounded"
      } else if (subtype === "server-station") {
        classes += " bg-blue-500/20 border-2 border-blue-500/40 rounded-lg"
      } else if (subtype === "pos-terminal") {
        classes += " bg-purple-500/20 border-2 border-purple-500/40 rounded"
      } else {
        classes += " bg-muted border border-border rounded"
      }
    } else if (category === "tables") {
      // Tables are rendered separately as interactive elements
      return null
    }

    // Add custom color if specified
    if (color) {
      classes += " [&]:border-current"
    }

    return classes
  }

  const elementClasses = getElementClasses()
  if (!elementClasses) return null

  return (
    <div
      className={elementClasses}
      style={{
        ...elementStyle,
        ...(element.color && { borderColor: element.color, backgroundColor: `${element.color}20` }),
      }}
      aria-hidden="true"
    >
      {/* Optional: Add labels for non-table elements */}
      {element.customLabel && element.category !== "tables" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] text-muted-foreground font-medium truncate px-1">
            {element.customLabel}
          </span>
        </div>
      )}
    </div>
  )
}

export function FloorplanElements({ elements, scale, offset }: FloorplanElementsProps) {
  // Filter out table elements (they're rendered separately as interactive nodes)
  const nonTableElements = elements.filter(el => el.category !== "tables")

  if (nonTableElements.length === 0) return null

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        transformOrigin: "0 0",
      }}
    >
      {nonTableElements.map((element) => (
        <ElementRenderer key={element.id} element={element} />
      ))}
    </div>
  )
}
