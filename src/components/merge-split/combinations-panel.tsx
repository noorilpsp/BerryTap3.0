"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Link2, Unlink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { CompatibleCombination } from "@/lib/merge-split-data"

interface CombinationsPanelProps {
  combinations: CompatibleCombination[]
  onSelectCombination: (tables: string[]) => void
}

export function CombinationsPanel({ combinations, onSelectCombination }: CombinationsPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const available = combinations.filter((c) => c.available)
  const unavailable = combinations.filter((c) => !c.available)
  const displayItems = expanded ? combinations : available.slice(0, 6)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Compatible Combinations
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 px-2 text-[10px] text-muted-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <>
              Show Less <ChevronUp className="h-3 w-3" />
            </>
          ) : (
            <>
              Show All <ChevronDown className="h-3 w-3" />
            </>
          )}
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        {/* Adjacent pairs header */}
        <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
          Adjacent Pairs (can merge)
        </div>

        {(expanded ? available : available.slice(0, 6)).map((combo, i) => (
          <button
            key={i}
            className="group flex items-center justify-between rounded-md border border-transparent px-2 py-1.5 text-left transition-colors hover:border-border/30 hover:bg-secondary/30"
            onClick={() => onSelectCombination(combo.tables)}
          >
            <div className="flex items-center gap-2">
              <Link2 className="h-3 w-3 text-cyan-400/60" />
              <span className="text-xs text-foreground">
                {combo.tables.join(" + ")}
              </span>
              <span className="text-[10px] text-muted-foreground">
                = {combo.combined} seats
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground/60">
                ({combo.seats.join("+")}, {combo.zone.replace("Main Dining", "Main")})
              </span>
              {combo.reason && (
                <Badge variant="secondary" className="h-4 px-1 text-[8px] text-emerald-400">
                  ACTIVE
                </Badge>
              )}
            </div>
          </button>
        ))}

        {/* Unavailable section */}
        {expanded && unavailable.length > 0 && (
          <>
            <div className="mb-1 mt-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60">
              Currently Unavailable
            </div>
            {unavailable.map((combo, i) => (
              <div
                key={`unavail-${i}`}
                className="flex items-center justify-between px-2 py-1.5 opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Unlink className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground">
                    {combo.tables.join(" + ")}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60">
                    = {combo.combined} seats
                  </span>
                </div>
                <span className="text-[10px] text-rose-400/60">{combo.reason}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
