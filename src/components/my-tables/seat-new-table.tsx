"use client"

import { useState } from "react"
import { Plus, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8]

const AVAILABLE_TABLES = [
  { number: 3, seats: 4, suggested: true },
  { number: 5, seats: 2, suggested: false },
  { number: 8, seats: 6, suggested: false },
  { number: 15, seats: 4, suggested: false },
]

export function SeatNewTableButton() {
  const [open, setOpen] = useState(false)
  const [partySize, setPartySize] = useState<number | null>(null)
  const [selectedTable, setSelectedTable] = useState<number | null>(null)

  const suggestedTable = AVAILABLE_TABLES.find((t) => t.suggested)

  function handleSeat() {
    // In production, this would create a new table session
    setOpen(false)
    setPartySize(null)
    setSelectedTable(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Desktop / Tablet: full width button */}
      <DialogTrigger asChild>
        <div>
          <Button
            size="lg"
            className="hidden w-full gap-2 sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            Seat New Table
          </Button>

          {/* Mobile: FAB */}
          <Button
            size="icon"
            className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg sm:hidden"
            aria-label="Seat New Table"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            Seat New Party
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-5">
          {/* Party size */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Party size
            </label>
            <div className="flex flex-wrap gap-2">
              {PARTY_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPartySize(size)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold transition-colors",
                    partySize === size
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  )}
                >
                  {size === 8 ? "8+" : size}
                </button>
              ))}
            </div>
          </div>

          {/* Table selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              Table
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TABLES.map((t) => (
                <button
                  key={t.number}
                  type="button"
                  onClick={() => setSelectedTable(t.number)}
                  className={cn(
                    "relative flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors",
                    selectedTable === t.number
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-secondary"
                  )}
                >
                  T{t.number}
                  {selectedTable === t.number && (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Suggested table */}
          {suggestedTable && !selectedTable && (
            <div className="flex items-start gap-2 rounded-lg bg-primary/5 p-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Suggested: T{suggestedTable.number}
                </p>
                <p className="text-xs text-muted-foreground">
                  Available, your section, {suggestedTable.seats}-top
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1 bg-transparent"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={!partySize || !selectedTable}
              onClick={handleSeat}
            >
              Seat Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
