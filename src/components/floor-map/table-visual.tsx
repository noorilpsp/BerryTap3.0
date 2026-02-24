"use client"

import React from "react"

import { cn } from "@/lib/utils"
import {
  NutOff,
  Leaf,
  LeafyGreen,
  Wheat,
  MilkOff,
  Shell,
  Cake,
  Gem,
  StickyNote,
} from "lucide-react"
import type {
  TableShape,
  Seat,
  SeatPosition,
  DietaryFlag,
} from "@/lib/table-detail-data"
import { tableShapeLayouts } from "@/lib/table-detail-data"

interface TableVisualProps {
  shape: TableShape
  tableNumber: number
  seats: Seat[]
  selectedSeat: number | null
  onSeatTap: (seatNumber: number) => void
  onTableCenterTap: () => void
  onEmptyTap: () => void
  status: string
}

const dietaryIcons: Record<DietaryFlag, any> = {
  nut_allergy: NutOff,
  vegetarian: Leaf,
  vegan: LeafyGreen,
  gluten_free: Wheat,
  dairy_free: MilkOff,
  shellfish_allergy: Shell,
}

function getSeatOffset(
  position: SeatPosition,
  tableW: number,
  tableH: number
): { x: number; y: number } {
  const seatSize = 48
  const gap = 16
  const cx = tableW / 2
  const cy = tableH / 2

  switch (position) {
    case "top":        return { x: cx - seatSize / 2, y: -(seatSize + gap) }
    case "bottom":     return { x: cx - seatSize / 2, y: tableH + gap }
    case "left":       return { x: -(seatSize + gap), y: cy - seatSize / 2 }
    case "right":      return { x: tableW + gap, y: cy - seatSize / 2 }
    case "top-left":   return { x: -(seatSize + gap), y: -(seatSize / 4) }
    case "top-center": return { x: cx - seatSize / 2, y: -(seatSize + gap) }
    case "top-right":  return { x: tableW + gap, y: -(seatSize / 4) }
    case "bottom-left":   return { x: -(seatSize + gap), y: tableH - seatSize + seatSize / 4 }
    case "bottom-center": return { x: cx - seatSize / 2, y: tableH + gap }
    case "bottom-right":  return { x: tableW + gap, y: tableH - seatSize + seatSize / 4 }
    default: return { x: 0, y: 0 }
  }
}

const statusTableStyles: Record<string, string> = {
  free: "border-dashed border-white/[0.08] bg-white/[0.02]",
  active: "border-amber-500/30 bg-amber-500/[0.04] shadow-amber-500/10 shadow-lg",
  urgent: "border-red-500/30 bg-red-500/[0.04] shadow-red-500/10 shadow-lg",
  billing: "border-blue-500/30 bg-blue-500/[0.04] shadow-blue-500/10 shadow-lg",
  closed: "border-dashed border-white/[0.06] bg-white/[0.01]",
}

export function TableVisual({
  shape,
  tableNumber,
  seats,
  selectedSeat,
  onSeatTap,
  onTableCenterTap,
  onEmptyTap,
  status,
}: TableVisualProps) {
  const dims = tableShapeLayouts[shape]

  return (
    <div
      className="relative mx-auto"
      style={{
        width: dims.width + 160,
        height: dims.height + 160,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onEmptyTap()
      }}
      role="group"
      aria-label={`Table ${tableNumber} seating layout`}
    >
      {/* Table surface */}
      <button
        type="button"
        onClick={onTableCenterTap}
        className={cn(
          "absolute border-2 transition-all hover:brightness-125",
          "backdrop-blur-sm",
          statusTableStyles[status] ?? "border-white/[0.06] bg-white/[0.02]",
          shape === "round" ? "rounded-full" : "",
          shape === "booth" ? "rounded-xl" : "",
          shape === "bar" ? "rounded-lg" : "rounded-xl",
        )}
        style={{
          left: 80,
          top: 80,
          width: dims.width,
          height: dims.height,
        }}
        aria-label={`Enter Table ${tableNumber} detail`}
      >
        <span className="text-lg font-bold font-mono text-white/20 tracking-wider">
          T{tableNumber}
        </span>
      </button>

      {/* Booth bench indicator */}
      {shape === "booth" && (
        <div
          className="absolute rounded-t-xl bg-white/[0.03] border border-b-0 border-white/[0.06]"
          style={{
            left: 76,
            top: 56,
            width: dims.width + 8,
            height: 28,
          }}
        />
      )}

      {/* Bar counter indicator */}
      {shape === "bar" && (
        <div
          className="absolute bg-white/[0.06] border-t border-white/[0.08]"
          style={{
            left: 76,
            top: 80 + dims.height + 4,
            width: dims.width + 8,
            height: 4,
          }}
        />
      )}

      {/* Seats */}
      {seats.map((seat, i) => {
        const offset = getSeatOffset(seat.position, dims.width, dims.height)
        const isSelected = selectedSeat === seat.number
        const hasItems = seat.itemCount > 0
        const dimOthers = selectedSeat !== null && !isSelected

        // Determine seat shape based on table shape and position
        const getSeatShapeClass = () => {
          if (shape === "round") {
            return "rounded-full"
          }
          if (shape === "bar") {
            // Bar stools are round
            return "rounded-full h-11 w-11"
          }
          if (shape === "booth") {
            // Booth seats are wider rectangles for bench seating
            if (seat.position.startsWith("top-")) {
              return "rounded-lg h-10 w-14"
            }
            return "rounded-xl"
          }
          // Rectangular and square tables have rounded square seats
          return "rounded-xl"
        }

        const seatShape = getSeatShapeClass()

        return (
          <button
            key={seat.number}
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSeatTap(seat.number)
            }}
            className={cn(
              "absolute flex flex-col items-center justify-center transition-all duration-200",
              "h-12 w-12",
              seatShape,
              "animate-seat-reveal gpu-layer",
              // Empty seat
              !seat.occupied && "border border-dashed border-white/[0.1] bg-transparent",
              // Occupied, no items
              seat.occupied && !hasItems && "border border-solid border-white/[0.12] bg-white/[0.04]",
              // Occupied with items
              seat.occupied && hasItems && "border border-solid border-white/[0.15] bg-white/[0.06]",
              // Selected glow
              isSelected && "!border-primary !border-2 bg-primary/10 scale-110 shadow-lg shadow-primary/20 ring-1 ring-primary/30",
              // Dimmed
              dimOthers && "opacity-30",
              // Hover
              !dimOthers && "hover:scale-105 hover:bg-white/[0.08] hover:border-white/[0.2] cursor-pointer",
              // Focus
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            )}
            style={{
              left: 80 + offset.x,
              top: 80 + offset.y,
              "--seat-index": i,
            } as React.CSSProperties}
            tabIndex={0}
            aria-label={`Seat ${seat.number}${seat.occupied ? ", occupied" : ", empty"}${seat.dietary.length > 0 ? `, ${seat.dietary.join(", ")}` : ""}${hasItems ? `, ${seat.itemCount} items ordered` : ""}`}
          >
            <span
              className={cn(
                "text-sm font-bold font-mono leading-none",
                !seat.occupied && "text-white/20",
                seat.occupied && !isSelected && "text-foreground",
                isSelected && "text-primary",
              )}
            >
              {seat.number}
            </span>

            {hasItems && (
              <span className="mt-0.5 text-[9px] text-muted-foreground/70 font-mono leading-none">
                {seat.itemCount}
              </span>
            )}
          </button>
        )
      })}

      {/* Badge icons floating near seats */}
      {seats.map((seat) => {
        const offset = getSeatOffset(seat.position, dims.width, dims.height)
        const badges: { icon: any; color: string; key: string }[] = []

        for (const d of seat.dietary) {
          const Icon = dietaryIcons[d]
          if (Icon) {
            badges.push({
              icon: Icon,
              color: d === "nut_allergy" ? "text-amber-400"
                : d === "shellfish_allergy" ? "text-red-400"
                : "text-emerald-400",
              key: d,
            })
          }
        }
        if (seat.specialOccasion) {
          badges.push({ icon: Cake, color: "text-pink-400", key: "special" })
        }
        if (seat.isVip) {
          badges.push({ icon: Gem, color: "text-violet-400", key: "vip" })
        }
        if (seat.notes.length > 0 && !seat.specialOccasion) {
          badges.push({ icon: StickyNote, color: "text-muted-foreground/60", key: "note" })
        }

        if (badges.length === 0) return null

        return (
          <div
            key={`badges-${seat.number}`}
            className="absolute flex gap-0.5 pointer-events-none"
            style={{
              left: 80 + offset.x + 48 + 2,
              top: 80 + offset.y - 2,
            }}
          >
            {badges.map((b) => {
              const BadgeIcon = b.icon
              return (
                <span key={b.key} className={cn("h-3.5 w-3.5", b.color)}>
                  <BadgeIcon className="h-3.5 w-3.5" />
                </span>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
