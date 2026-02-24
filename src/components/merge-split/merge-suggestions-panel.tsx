"use client"

import { Zap, Check, AlertTriangle, Star, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { MergeSuggestion } from "@/lib/merge-split-data"

interface MergeSuggestionsPanelProps {
  suggestions: MergeSuggestion[]
  onApplyMerge: (tables: string[]) => void
}

export function MergeSuggestionsPanel({ suggestions, onApplyMerge }: MergeSuggestionsPanelProps) {
  if (suggestions.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Zap className="h-3.5 w-3.5 text-amber-400" />
        Suggested Merges
      </h2>

      {suggestions.map((suggestion, sIdx) => (
        <Card key={sIdx} className="glass-surface overflow-hidden border-amber-500/15 bg-amber-500/5 p-0">
          <div className="p-3">
            {/* Party header */}
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15">
                <Users className="h-3 w-3 text-amber-400" />
              </div>
              <span className="text-xs font-semibold text-foreground">
                For: {suggestion.party.guest} ({suggestion.party.partySize}p)
              </span>
              <Badge variant="outline" className="h-4 border-border/40 px-1 text-[9px] text-muted-foreground">
                {suggestion.party.source === "waitlist" ? "Waitlist" : "Reservation"}
              </Badge>
            </div>

            {suggestion.party.waitingSince && (
              <div className="mt-1 flex items-center gap-1.5 pl-7 text-[10px] text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                Waiting since{" "}
                {new Date(suggestion.party.waitingSince).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </div>
            )}

            <Separator className="my-2.5 bg-border/30" />

            {/* Options */}
            <div className="flex flex-col gap-3">
              {suggestion.options.map((option, oIdx) => (
                <div
                  key={oIdx}
                  className={`rounded-lg border p-2.5 ${
                    option.recommended
                      ? "border-emerald-500/25 bg-emerald-500/5"
                      : "border-border/30 bg-secondary/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground">
                        Option {String.fromCharCode(65 + oIdx)}:
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {option.tables.join(" + ")} = {option.combinedSeats} seats
                      </span>
                    </div>
                    {option.recommended && (
                      <Badge className="h-4 gap-0.5 bg-emerald-500/15 px-1 text-[9px] text-emerald-400">
                        <Star className="h-2.5 w-2.5" />
                        Best
                      </Badge>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-col gap-0.5">
                    {option.pros.map((pro, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] text-emerald-400/80">
                        <Check className="h-2.5 w-2.5 shrink-0" />
                        {pro}
                      </div>
                    ))}
                    {option.warnings.map((warn, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] text-amber-400/80">
                        <AlertTriangle className="h-2.5 w-2.5 shrink-0" />
                        {warn}
                      </div>
                    ))}
                  </div>

                  <div className="mt-1 text-[10px] text-muted-foreground">
                    Impact: {option.impact}
                  </div>

                  <Button
                    size="sm"
                    variant={option.recommended ? "default" : "outline"}
                    className={`mt-2 h-6 w-full text-[10px] ${
                      option.recommended
                        ? ""
                        : "border-border/40"
                    }`}
                    onClick={() => onApplyMerge(option.tables)}
                  >
                    Apply This Merge
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
