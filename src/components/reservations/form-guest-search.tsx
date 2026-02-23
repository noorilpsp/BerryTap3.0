"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search, Star, AlertTriangle, X, UserPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  type GuestProfile,
  searchGuests,
} from "@/lib/reservation-form-data"

interface FormGuestSearchProps {
  value: string
  selectedGuest: GuestProfile | null
  onNameChange: (name: string) => void
  onSelectGuest: (guest: GuestProfile) => void
  onClearGuest: () => void
}

export function FormGuestSearch({
  value,
  selectedGuest,
  onNameChange,
  onSelectGuest,
  onClearGuest,
}: FormGuestSearchProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [results, setResults] = useState<GuestProfile[]>([])
  const [highlightIdx, setHighlightIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isFocused && value.length >= 2) {
      setResults(searchGuests(value))
      setHighlightIdx(-1)
    } else {
      setResults([])
    }
  }, [value, isFocused])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!results.length) return
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlightIdx((prev) => Math.min(prev + 1, results.length - 1))
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlightIdx((prev) => Math.max(prev - 1, 0))
      } else if (e.key === "Enter" && highlightIdx >= 0) {
        e.preventDefault()
        onSelectGuest(results[highlightIdx])
        setIsFocused(false)
      } else if (e.key === "Escape") {
        setIsFocused(false)
      }
    },
    [results, highlightIdx, onSelectGuest]
  )

  const showDropdown = isFocused && value.length >= 2

  return (
    <div className="relative">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5 block">
        Guest Name <span className="text-red-400">*</span>
      </label>

      {selectedGuest ? (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2.5 form-autofill-flash">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{selectedGuest.name}</span>
              {selectedGuest.visitCount >= 10 && (
                <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px] px-1.5 py-0">
                  <Star className="h-2.5 w-2.5 mr-0.5" />
                  VIP
                </Badge>
              )}
              {selectedGuest.visitCount <= 1 && (
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-400 text-[10px] px-1.5 py-0">
                  <UserPlus className="h-2.5 w-2.5 mr-0.5" />
                  New
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {selectedGuest.visitCount} visits
              {selectedGuest.avgSpend > 0 && <span> &middot; Avg ${selectedGuest.avgSpend}</span>}
              {selectedGuest.lastVisit && <span> &middot; Last: {selectedGuest.lastVisit}</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClearGuest}
            className="p-1 rounded-md hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear selected guest"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onNameChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder="Search guest name, phone, or email..."
            className="pl-9 bg-secondary/50 border-border/60 focus:border-primary/50 focus:ring-primary/20"
            aria-required="true"
            autoComplete="off"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="guest-search-results"
            aria-activedescendant={highlightIdx >= 0 ? `guest-${results[highlightIdx]?.id}` : undefined}
          />
        </div>
      )}

      {showDropdown && (
        <div
          ref={listRef}
          id="guest-search-results"
          role="listbox"
          className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-border/60 bg-popover shadow-xl form-dropdown-enter overflow-hidden"
        >
          {results.length > 0 ? (
            results.map((guest, idx) => (
              <button
                key={guest.id}
                id={`guest-${guest.id}`}
                role="option"
                aria-selected={idx === highlightIdx}
                className={`w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors ${
                  idx === highlightIdx
                    ? "bg-primary/10"
                    : "hover:bg-secondary/60"
                } ${idx < results.length - 1 ? "border-b border-border/30" : ""}`}
                onMouseDown={(e) => {
                  e.preventDefault()
                  onSelectGuest(guest)
                  setIsFocused(false)
                }}
                onMouseEnter={() => setHighlightIdx(idx)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {guest.visitCount >= 10 && <Star className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                    <span className="font-medium text-sm text-foreground">{guest.name}</span>
                    <span className="text-xs text-muted-foreground">
                      &mdash; {guest.visitCount} visit{guest.visitCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-2">
                    {guest.lastVisit && <span>Last: {guest.lastVisit}</span>}
                    {guest.avgSpend > 0 && <span>Avg: ${guest.avgSpend}</span>}
                  </div>
                  {(guest.allergies.length > 0 || guest.noShowCount >= 2) && (
                    <div className="flex items-center gap-2 mt-1">
                      {guest.allergies.map((a) => (
                        <span key={a} className="inline-flex items-center text-[10px] text-amber-400 bg-amber-400/10 rounded px-1.5 py-0.5">
                          {a}
                        </span>
                      ))}
                      {guest.noShowCount >= 2 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-red-400 bg-red-400/10 rounded px-1.5 py-0.5">
                          <AlertTriangle className="h-2.5 w-2.5" />
                          {guest.noShowCount} no-shows
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-muted-foreground">{'No matching guests found'}</p>
              <p className="text-xs text-muted-foreground/60 mt-1">{'A new guest profile will be created'}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
