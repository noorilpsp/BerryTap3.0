"use client"

import { Users, Clock, AlertTriangle, Split, ChevronRight, Zap, Link2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { ActiveMerge, MergeSuggestion, CompatibleCombination } from "@/lib/merge-split-data"

interface MobileMergeListProps {
  activeMerges: ActiveMerge[]
  suggestions: MergeSuggestion[]
  combinations: CompatibleCombination[]
  onSplit: (mergeId: string) => void
  onApplyMerge: (tables: string[]) => void
  onSelectCombination: (tables: string[]) => void
  onViewHistory: () => void
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

export function MobileMergeList({
  activeMerges,
  suggestions,
  combinations,
  onSplit,
  onApplyMerge,
  onSelectCombination,
  onViewHistory,
}: MobileMergeListProps) {
  const available = combinations.filter((c) => c.available)

  return (
    <div className="flex flex-col gap-4 p-3">
      {/* Active Merges */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Active Merges ({activeMerges.length})
        </h2>
        <div className="flex flex-col gap-2">
          {activeMerges.map((merge) => (
            <Card key={merge.id} className="glass-surface overflow-hidden border-emerald-500/20 bg-emerald-500/5 p-0">
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-400">
                    {merge.tables.join(" + ")} -- {merge.combinedSeats} seats
                  </span>
                  <Badge
                    variant="secondary"
                    className={
                      merge.status === "in_use"
                        ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                        : "border-blue-500/30 bg-blue-500/15 text-blue-400"
                    }
                  >
                    {merge.status === "in_use" ? "In use" : "Reserved"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{merge.zone}</p>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  {merge.reservation.guest} ({merge.reservation.partySize}p)
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {merge.reservation.seatedAt
                    ? `Since ${formatTime(merge.reservation.seatedAt)}`
                    : formatTime(merge.reservation.reservedFor!)}{" "}
                  -- {formatTime(merge.reservation.estimatedEnd)}
                </div>
                {merge.conflictNote && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    Auto-split at {formatTime(merge.autoSplitAt)}
                  </div>
                )}
                <div className="mt-2.5 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1 border-rose-500/30 text-xs text-rose-400 hover:bg-rose-500/10"
                    onClick={() => onSplit(merge.id)}
                  >
                    <Split className="h-3 w-3" />
                    Split
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs border-border/40">
                    Extend
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs">
                    Details <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <section>
          <h2 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Zap className="h-3 w-3 text-amber-400" />
            Suggestions
          </h2>
          <div className="flex flex-col gap-2">
            {suggestions.map((suggestion, idx) => {
              const best = suggestion.options.find((o) => o.recommended) || suggestion.options[0]
              return (
                <Card key={idx} className="glass-surface overflow-hidden border-amber-500/15 bg-amber-500/5 p-0">
                  <div className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">
                        For {suggestion.party.guest} ({suggestion.party.partySize}p,{" "}
                        {suggestion.party.source})
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {best.tables.join(" + ")} = {best.combinedSeats} seats
                      </span>
                      {best.recommended && (
                        <Badge className="h-4 gap-0.5 bg-emerald-500/15 px-1 text-[9px] text-emerald-400">
                          <Star className="h-2.5 w-2.5" />
                          Best
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="mt-2 h-7 w-full text-xs"
                      onClick={() => onApplyMerge(best.tables)}
                    >
                      Merge for {suggestion.party.guest}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        </section>
      )}

      {/* Available Combos */}
      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Available Combos ({available.length})
        </h2>
        <div className="grid grid-cols-2 gap-1.5">
          {available.map((combo, i) => (
            <button
              key={i}
              className="flex items-center gap-1.5 rounded-lg border border-border/30 bg-secondary/20 px-2.5 py-2 text-left transition-colors hover:border-border/50 hover:bg-secondary/40"
              onClick={() => onSelectCombination(combo.tables)}
            >
              <Link2 className="h-3 w-3 shrink-0 text-cyan-400/60" />
              <span className="text-xs text-foreground">{combo.tables.join("+")}</span>
              <span className="text-[10px] text-muted-foreground">= {combo.combined}p</span>
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60">
          Tap any to start merge
        </p>
      </section>

      <Button variant="outline" className="h-9 gap-2 border-border/40" onClick={onViewHistory}>
        View Merge History
      </Button>
    </div>
  )
}
