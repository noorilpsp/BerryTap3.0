"use client"

import React from "react"
import { useState } from "react"
import {
  Circle,
  Square,
  RectangleHorizontal,
  Armchair,
  Sofa,
  Minus,
  TreePalm,
  Flower2,
  Flame,
  Droplets,
  Grid2X2,
  Wrench,
  DoorOpen,
  Coffee,
  CookingPot,
  Wine,
  Music,
  Shirt,
  Monitor,
  PanelTop,
  Gem,
  Lamp,
  Fish,
  Umbrella,
} from "lucide-react"
import {
  ELEMENT_TEMPLATES,
  CATEGORY_INFO,
  type ElementCategory,
  type FloorplanElementTemplate,
} from "@/lib/floorplan-types"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  circle: Circle,
  square: Square,
  "rectangle-horizontal": RectangleHorizontal,
  armchair: Armchair,
  sofa: Sofa,
  minus: Minus,
  "tree-palm": TreePalm,
  "flower-2": Flower2,
  flame: Flame,
  droplets: Droplets,
  "grid-2x2": Grid2X2,
  wrench: Wrench,
  "door-open": DoorOpen,
  coffee: Coffee,
  "cooking-pot": CookingPot,
  wine: Wine,
  music: Music,
  shirt: Shirt,
  monitor: Monitor,
  "panel-top": PanelTop,
  gem: Gem,
  lamp: Lamp,
  fish: Fish,
  umbrella: Umbrella,
}

const CATEGORY_ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "grid-2x2": Grid2X2,
  armchair: Armchair,
  wrench: Wrench,
  square: Square,
  "flower-2": Flower2,
}

interface ElementPaletteProps {
  /** Called when user clicks an element to hold it. Pass event so cursor position is known for ghost. */
  onPick: (template: FloorplanElementTemplate, e: React.MouseEvent) => void
}

export function ElementPalette({ onPick }: ElementPaletteProps) {
  const [activeCategory, setActiveCategory] =
    useState<ElementCategory>("tables")

  const categories = Object.entries(CATEGORY_INFO) as [
    ElementCategory,
    { label: string; icon: string },
  ][]

  const filteredElements = ELEMENT_TEMPLATES.filter(
    (t) => t.category === activeCategory
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-border/50">
        {categories.map(([key, info]) => {
          const Icon = CATEGORY_ICON_MAP[info.icon] ?? Square
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={cn(
                "flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150 whitespace-nowrap",
                activeCategory === key
                  ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_8px_hsl(var(--primary)/0.15)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50 border border-transparent"
              )}
            >
              <Icon className="h-3 w-3 shrink-0" />
              <span>{info.label}</span>
            </button>
          )
        })}
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="grid grid-cols-2 gap-1.5 p-2">
          {filteredElements.map((template) => {
            const Icon = ICON_MAP[template.icon] ?? Square
            return (
              <button
                key={template.id}
                className="group flex flex-col items-center gap-1.5 p-2.5 rounded-lg border border-border/40 bg-card/50 hover:border-primary/40 hover:bg-primary/5 transition-all duration-150 cursor-pointer"
                onClick={(e) => onPick(template, e)}
                title={template.label}
              >
                <div
                  className="flex items-center justify-center transition-colors duration-150"
                  style={{
                    width: Math.min(36, template.defaultWidth * 0.35),
                    height: Math.min(36, template.defaultHeight * 0.35),
                    minWidth: 24,
                    minHeight: 24,
                    background: `${template.color}`,
                    opacity: 0.7,
                    borderRadius:
                      template.shape === "circle" ? "50%" : "4px",
                  }}
                >
                  <Icon className="h-3 w-3 text-foreground/80" />
                </div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-medium text-foreground/80 group-hover:text-foreground leading-tight text-center line-clamp-1">
                    {template.label}
                  </span>
                  {template.seats && (
                    <span className="text-[9px] text-muted-foreground font-mono">
                      {template.seats} seats
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
