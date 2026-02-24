"use client"

import { cn } from "@/lib/utils"
import { Wine, UtensilsCrossed, CakeSlice, Check, Pause, ChevronRight } from "lucide-react"
import type { Wave, WaveType } from "@/lib/table-detail-data"
import { minutesAgo } from "@/lib/floor-map-data"

interface MealProgressProps {
  waves: Wave[]
  className?: string
}

const waveIcons: Record<WaveType, typeof Wine> = {
  drinks: Wine,
  food: UtensilsCrossed,
  dessert: CakeSlice,
}

const waveLabels: Record<WaveType, string> = {
  drinks: "Drinks",
  food: "Food",
  dessert: "Dessert",
}

function getSubLabel(wave: Wave): string {
  if (wave.status === "served" && wave.completedAt) {
    return `${minutesAgo(wave.completedAt)}m ago`
  }
  if (wave.status === "ready") return "Ready now"
  if (wave.status === "cooking") return "In kitchen"
  if (wave.status === "held") return "Held"
  return ""
}

export function MealProgress({ waves, className }: MealProgressProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.06] p-4",
        "bg-[hsl(225,15%,9%)]/80 backdrop-blur-sm",
        className,
      )}
      role="region"
      aria-label="Meal progress"
    >
      <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        Meal Progress
      </h3>

      <div className="flex items-start justify-center gap-1">
        {waves.map((wave, i) => {
          const Icon = waveIcons[wave.type]
          const isLast = i === waves.length - 1

          return (
            <div key={wave.type} className="flex items-start gap-1">
              {/* Wave node */}
              <div className="flex flex-col items-center gap-1.5 w-20">
                <div
                  className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all",
                    wave.status === "served" && "border-emerald-500/60 bg-emerald-500/10",
                    wave.status === "ready" && "border-red-400/60 bg-red-500/10",
                    wave.status === "cooking" && "border-amber-400/60 bg-amber-500/10",
                    wave.status === "held" && "border-muted-foreground/30 bg-muted/50",
                    wave.status === "not_started" && "border-dashed border-white/[0.08]",
                  )}
                >
                  {/* Glow ring for active states */}
                  {(wave.status === "ready" || wave.status === "cooking") && (
                    <span
                      className={cn(
                        "absolute inset-0 rounded-full animate-pulse-ring",
                        wave.status === "ready" && "border-2 border-red-400/30",
                        wave.status === "cooking" && "border-2 border-amber-400/20",
                      )}
                    />
                  )}
                  {wave.status === "served" ? (
                    <Check className="h-4.5 w-4.5 text-emerald-400" />
                  ) : (
                    <Icon
                      className={cn(
                        "h-4.5 w-4.5",
                        wave.status === "ready" && "text-red-400",
                        wave.status === "cooking" && "text-amber-400",
                        wave.status === "held" && "text-muted-foreground",
                        wave.status === "not_started" && "text-white/20",
                      )}
                    />
                  )}
                </div>

                <span className="text-xs font-medium text-foreground">
                  {waveLabels[wave.type]}
                </span>

                <span className={cn(
                  "text-[10px] leading-tight font-mono",
                  wave.status === "served" && "text-emerald-400/70",
                  wave.status === "ready" && "text-red-400/70",
                  wave.status === "cooking" && "text-amber-400/70",
                  wave.status === "held" && "text-muted-foreground/70",
                  wave.status === "not_started" && "text-white/20",
                )}>
                  {wave.status === "served" && "Served"}
                  {wave.status === "ready" && "Ready"}
                  {wave.status === "cooking" && "Cooking"}
                  {wave.status === "held" && (
                    <span className="flex items-center gap-0.5">
                      <Pause className="h-2.5 w-2.5" />
                      Held
                    </span>
                  )}
                  {wave.status === "not_started" && "---"}
                </span>

                {(wave.completedAt || wave.readyAt) && (
                  <span className="text-[9px] text-muted-foreground/60 font-mono">
                    {getSubLabel(wave)}
                  </span>
                )}
              </div>

              {/* Connector */}
              {!isLast && (
                <div className="flex items-center pt-4">
                  <div className={cn(
                    "h-px w-4",
                    wave.status === "served" ? "bg-emerald-500/30" : "bg-white/[0.06]"
                  )} />
                  <ChevronRight className={cn(
                    "h-3 w-3 -ml-1",
                    wave.status === "served" ? "text-emerald-500/40" : "text-white/10"
                  )} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
