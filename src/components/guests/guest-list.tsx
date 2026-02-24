"use client"

import { useCallback, useRef, useEffect } from "react"
import { Star, AlertTriangle, Clock, Sparkles, Heart } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { GuestProfile, ViewMode } from "@/lib/guests-data"
import {
  getInitials, getAvatarColor, getSegmentLabel, getSegmentColor,
  getRelativeDate, formatCurrency,
} from "@/lib/guests-data"

interface GuestListProps {
  guests: GuestProfile[]
  selectedId: string | null
  onSelect: (id: string) => void
  view: ViewMode
}

function SegmentIcon({ segment }: { segment: GuestProfile["segment"] }) {
  switch (segment) {
    case "vip": return <Star className="h-3 w-3 text-amber-400" />
    case "at_risk": return <Clock className="h-3 w-3 text-amber-400" />
    case "flagged": return <AlertTriangle className="h-3 w-3 text-rose-400" />
    case "new": return <Sparkles className="h-3 w-3 text-zinc-400" />
    default: return null
  }
}

function getTagIcon(tag: string): string | null {
  if (tag.includes("shellfish") || tag.includes("Shellfish")) return "shellfish"
  if (tag.includes("nut")) return "nut"
  if (tag.includes("dairy")) return "dairy"
  if (tag.includes("gluten")) return "gluten"
  if (tag.includes("anniversary")) return "ring"
  if (tag.includes("birthday")) return "cake"
  if (tag.includes("vegetarian")) return "leaf"
  if (tag.includes("first-timer")) return "new"
  if (tag.includes("high-value")) return "crown"
  if (tag.includes("window")) return "window"
  if (tag.includes("no-show") || tag.includes("high-risk")) return "warning"
  if (tag.includes("at-risk") || tag.includes("was-regular")) return "clock"
  return null
}

function TagDisplay({ tags, limit = 3 }: { tags: string[]; limit?: number }) {
  const display = tags.slice(0, limit)
  const remaining = tags.length - limit
  return (
    <div className="flex flex-wrap items-center gap-1">
      {display.map((tag) => {
        const icon = getTagIcon(tag)
        return (
          <span key={tag} className="inline-flex items-center gap-0.5 rounded-full bg-secondary/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {icon === "warning" && <AlertTriangle className="h-2.5 w-2.5 text-rose-400" />}
            {icon === "ring" && <Heart className="h-2.5 w-2.5 text-pink-400" />}
            {icon === "clock" && <Clock className="h-2.5 w-2.5 text-amber-400" />}
            {tag.replace(/-/g, " ")}
          </span>
        )
      })}
      {remaining > 0 && (
        <span className="text-[10px] text-muted-foreground">+{remaining}</span>
      )}
    </div>
  )
}

/* ── List Row ───────────────────────────────────────────────── */
function GuestRow({ guest, isSelected, onSelect, index }: {
  guest: GuestProfile; isSelected: boolean; onSelect: () => void; index: number
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "guest-row-stagger flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all",
        isSelected
          ? "border-primary/30 bg-primary/8 shadow-[0_0_12px_rgba(0,210,210,0.08)]"
          : "border-transparent hover:bg-secondary/40"
      )}
      style={{ "--row-i": index } as React.CSSProperties}
      aria-current={isSelected ? "true" : undefined}
    >
      {/* Avatar */}
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold", getAvatarColor(guest.segment))}>
        {getInitials(guest.name)}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <SegmentIcon segment={guest.segment} />
          <span className="truncate text-sm font-medium text-foreground">{guest.name}</span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
          <span>Last: {getRelativeDate(guest.lastVisit)}</span>
          {guest.noShows > 0 && (
            <span className="text-rose-400">{guest.noShows} no-shows</span>
          )}
        </div>
        {guest.tags.length > 0 && (
          <div className="mt-1">
            <TagDisplay tags={guest.tags} limit={2} />
          </div>
        )}
      </div>

      {/* Right stats */}
      <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{guest.totalVisits} visits</span>
          <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-medium", getSegmentColor(guest.segment))}>
            {getSegmentLabel(guest.segment)}
          </span>
        </div>
        <span className="text-xs font-medium text-foreground">LTV: {formatCurrency(guest.lifetimeValue)}</span>
        <span className="text-[10px] text-muted-foreground">Avg: {formatCurrency(guest.avgSpend)}</span>
      </div>
    </button>
  )
}

/* ── Card View ──────────────────────────────────────────────── */
function GuestCard({ guest, isSelected, onSelect, index }: {
  guest: GuestProfile; isSelected: boolean; onSelect: () => void; index: number
}) {
  const maxAvg = 310
  const barWidth = Math.min(100, (guest.avgSpend / maxAvg) * 100)

  return (
    <button
      onClick={onSelect}
      className={cn(
        "guest-row-stagger flex w-full flex-col gap-2.5 rounded-xl border p-4 text-left transition-all",
        isSelected
          ? "border-primary/30 bg-primary/8 shadow-[0_0_12px_rgba(0,210,210,0.08)]"
          : "border-border/30 bg-card/50 hover:border-border/50 hover:bg-card/80"
      )}
      style={{ "--row-i": index } as React.CSSProperties}
      aria-current={isSelected ? "true" : undefined}
    >
      <div className="flex items-start gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold", getAvatarColor(guest.segment))}>
          {getInitials(guest.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <SegmentIcon segment={guest.segment} />
            <span className="truncate text-sm font-medium text-foreground">{guest.name}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>{guest.totalVisits} visits</span>
            <span className="text-border">|</span>
            <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-medium", getSegmentColor(guest.segment))}>
              {getSegmentLabel(guest.segment)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-foreground">LTV: {formatCurrency(guest.lifetimeValue)}</span>
        <span className="text-muted-foreground">Last: {getRelativeDate(guest.lastVisit)}</span>
      </div>

      {guest.tags.length > 0 && <TagDisplay tags={guest.tags} limit={2} />}

      {/* Mini spend bar */}
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-secondary/50">
          <div
            className="h-full rounded-full bg-primary/50 guest-card-bar"
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground">{formatCurrency(guest.avgSpend)} avg</span>
      </div>
    </button>
  )
}

/* ── Main Guest List ────────────────────────────────────────── */
export function GuestList({ guests: guestList, selectedId, onSelect, view }: GuestListProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const selectedIndex = guestList.findIndex(g => g.id === selectedId)

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()
      const next = e.key === "ArrowDown"
        ? Math.min(selectedIndex + 1, guestList.length - 1)
        : Math.max(selectedIndex - 1, 0)
      if (guestList[next]) onSelect(guestList[next].id)
    }
  }, [selectedIndex, guestList, onSelect])

  useEffect(() => {
    if (selectedId && listRef.current) {
      const el = listRef.current.querySelector(`[aria-current="true"]`)
      if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" })
    }
  }, [selectedId])

  if (guestList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <div className="rounded-xl bg-secondary/40 p-4">
          <Sparkles className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No guests found</p>
        <p className="text-xs text-muted-foreground/60">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div
        ref={listRef}
        className={cn(
          view === "cards"
            ? "grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2"
            : "flex flex-col gap-1 p-2"
        )}
        role="listbox"
        aria-label="Guest list"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {guestList.map((guest, i) => (
          view === "cards" ? (
            <GuestCard
              key={guest.id}
              guest={guest}
              isSelected={selectedId === guest.id}
              onSelect={() => onSelect(guest.id)}
              index={i}
            />
          ) : (
            <GuestRow
              key={guest.id}
              guest={guest}
              isSelected={selectedId === guest.id}
              onSelect={() => onSelect(guest.id)}
              index={i}
            />
          )
        ))}
      </div>

      <div className="border-t border-border/30 px-4 py-3 text-center text-xs text-muted-foreground">
        Showing 1-{guestList.length} of {guestList.length} guests
      </div>
    </ScrollArea>
  )
}
