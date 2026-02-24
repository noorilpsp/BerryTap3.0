"use client"

import React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Search,
  X,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  AlertTriangle,
  Clock,
  Command,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { FloorTable, SectionId, SearchHistoryEntry } from "@/lib/floor-map-data"
import {
  sectionConfig,
  searchTables,
  floorStatusConfig,
  minutesAgo,
  getQuickSearchActions,
  defaultSearchHistory,
} from "@/lib/floor-map-data"
import { useIsMobile } from "@/hooks/use-mobile"

interface CommandSearchProps {
  tables: FloorTable[]
  ownTableIds: string[]
  onSelect: (tableId: string) => void
  onStatusFilter?: (status: string) => void
}

export function CommandSearch({
  tables,
  ownTableIds,
  onSelect,
  onStatusFilter,
}: CommandSearchProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [recentHistory] = useState<SearchHistoryEntry[]>(defaultSearchHistory)

  const results = query ? searchTables(tables, query).slice(0, 10) : []
  const quickActions = !query ? getQuickSearchActions(tables) : []
  const recentTables = !query
    ? recentHistory
        .map((h) => tables.find((t) => t.id === h.tableId))
        .filter(Boolean) as FloorTable[]
    : []

  // Total navigable items
  const totalItems = query ? results.length : quickActions.length + recentTables.length

  // Cmd+K global shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery("")
      setSelectedIndex(0)
    }
  }, [open])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const close = useCallback(() => {
    setOpen(false)
    setQuery("")
  }, [])

  const handleSelectResult = useCallback(
    (tableId: string) => {
      onSelect(tableId)
      close()
    },
    [onSelect, close]
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault()
      close()
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, totalItems - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (query && results[selectedIndex]) {
        handleSelectResult(results[selectedIndex].id)
      } else if (!query) {
        const qIdx = selectedIndex
        if (qIdx < quickActions.length) {
          // Quick action
          if (onStatusFilter && quickActions[qIdx].filter.status) {
            onStatusFilter(quickActions[qIdx].filter.status![0])
          }
          close()
        } else {
          const recentIdx = qIdx - quickActions.length
          if (recentTables[recentIdx]) {
            handleSelectResult(recentTables[recentIdx].id)
          }
        }
      }
    }
  }

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const items = listRef.current.querySelectorAll("[data-search-item]")
      items[selectedIndex]?.scrollIntoView({ block: "nearest" })
    }
  }, [selectedIndex])

  // -- Trigger button --
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border/50 bg-secondary/40 transition-all hover:border-primary/30 hover:bg-secondary/60",
          isMobile ? "h-8 w-8 justify-center" : "h-8 px-3"
        )}
        aria-label="Search tables"
      >
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        {!isMobile && (
          <>
            <span className="text-xs text-muted-foreground/70">Jump to table...</span>
            <kbd className="ml-auto hidden rounded border border-border/60 bg-secondary/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/70 lg:inline-flex">
              <Command className="mr-0.5 h-2.5 w-2.5" />K
            </kbd>
          </>
        )}
      </button>
    )
  }

  // -- Mobile: full-screen bottom sheet --
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background animate-zoom-in">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
          <button
            type="button"
            onClick={close}
            className="text-sm text-muted-foreground"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/60" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search tables, sections..."
              className="h-10 w-full rounded-lg border border-border/50 bg-secondary/40 pl-10 pr-4 font-mono text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground/50 focus:border-primary/40 focus:ring-1"
              aria-label="Search tables"
            />
          </div>
        </div>

        {/* Results */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 scrollbar-none">
          {query ? (
            results.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Tables
                </p>
                {results.map((t, i) => (
                  <SearchResultItem
                    key={t.id}
                    table={t}
                    isOwn={ownTableIds.includes(t.id)}
                    isSelected={selectedIndex === i}
                    onClick={() => handleSelectResult(t.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyResults query={query} />
            )
          ) : (
            <>
              {quickActions.length > 0 && (
                <div className="mb-4 flex flex-col gap-1.5">
                  <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Suggestions
                  </p>
                  {quickActions.map((action, i) => (
                    <button
                      key={action.label}
                      type="button"
                      data-search-item
                      onClick={() => {
                        if (onStatusFilter && action.filter.status) {
                          onStatusFilter(action.filter.status[0])
                        }
                        close()
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                        selectedIndex === i
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-accent/50"
                      )}
                    >
                      <AlertTriangle className={cn("h-4 w-4 shrink-0", action.color)} />
                      <span>{action.label}</span>
                      <span className="ml-auto font-mono text-xs text-muted-foreground/70">
                        ({action.count})
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {recentTables.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="mb-1 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Recent
                  </p>
                  {recentTables.map((t, i) => (
                    <SearchResultItem
                      key={t.id}
                      table={t}
                      isOwn={ownTableIds.includes(t.id)}
                      isSelected={selectedIndex === quickActions.length + i}
                      onClick={() => handleSelectResult(t.id)}
                      showTimestamp
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // -- Desktop: command palette overlay --
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm animate-fade-slide-in"
        onClick={close}
        aria-hidden="true"
      />

      {/* Palette */}
      <div className="fixed left-1/2 top-[15%] z-50 w-full max-w-lg -translate-x-1/2 animate-zoom-in">
        <div className="glass-surface-strong rounded-2xl shadow-2xl shadow-primary/5 overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-primary/60" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Jump to table, section, or status..."
              className="h-7 flex-1 bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
              aria-label="Search tables"
              role="combobox"
              aria-expanded={true}
              aria-activedescendant={`search-item-${selectedIndex}`}
            />
            <button
              type="button"
              onClick={close}
              className="rounded-md p-1 text-muted-foreground/60 hover:text-foreground"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Results list */}
          <div ref={listRef} className="max-h-80 overflow-y-auto scrollbar-none py-2">
            {query ? (
              results.length > 0 ? (
                <div className="flex flex-col">
                  <p className="mb-1 px-4 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Tables
                  </p>
                  {results.map((t, i) => (
                    <SearchResultItem
                      key={t.id}
                      table={t}
                      isOwn={ownTableIds.includes(t.id)}
                      isSelected={selectedIndex === i}
                      onClick={() => handleSelectResult(t.id)}
                      id={`search-item-${i}`}
                    />
                  ))}
                </div>
              ) : (
                <EmptyResults query={query} />
              )
            ) : (
              <>
                {quickActions.length > 0 && (
                  <div className="mb-1">
                    <p className="mb-1 px-4 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                      Quick Actions
                    </p>
                    {quickActions.map((action, i) => (
                      <button
                        key={action.label}
                        type="button"
                        data-search-item
                        onClick={() => {
                          if (onStatusFilter && action.filter.status) {
                            onStatusFilter(action.filter.status[0])
                          }
                          close()
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors",
                          selectedIndex === i
                            ? "bg-primary/10 text-foreground"
                            : "text-muted-foreground hover:bg-accent/40"
                        )}
                      >
                        <AlertTriangle className={cn("h-3.5 w-3.5 shrink-0", action.color)} />
                        <span className="text-xs">{action.label}</span>
                        <span className="ml-auto rounded-md bg-secondary/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {action.count}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
                {recentTables.length > 0 && (
                  <div className="border-t border-border/30 pt-2">
                    <p className="mb-1 px-4 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                      Recent
                    </p>
                    {recentTables.map((t, i) => (
                      <SearchResultItem
                        key={t.id}
                        table={t}
                        isOwn={ownTableIds.includes(t.id)}
                        isSelected={selectedIndex === quickActions.length + i}
                        onClick={() => handleSelectResult(t.id)}
                        showTimestamp
                        id={`search-item-${quickActions.length + i}`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer hints */}
          <div className="flex items-center gap-4 border-t border-border/30 px-4 py-2">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
              <ArrowUp className="h-2.5 w-2.5" />
              <ArrowDown className="h-2.5 w-2.5" />
              navigate
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
              <CornerDownLeft className="h-2.5 w-2.5" />
              select
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
              esc close
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Subcomponents ────────────────────────────────────────────────────────────

function SearchResultItem({
  table,
  isOwn,
  isSelected,
  onClick,
  showTimestamp,
  id,
}: {
  table: FloorTable
  isOwn: boolean
  isSelected: boolean
  onClick: () => void
  showTimestamp?: boolean
  id?: string
}) {
  const cfg = floorStatusConfig[table.status]
  const seatedMins = table.seatedAt ? minutesAgo(table.seatedAt) : null

  return (
    <button
      id={id}
      type="button"
      data-search-item
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left transition-colors",
        isSelected ? "bg-primary/10" : "hover:bg-accent/40"
      )}
      role="option"
      aria-selected={isSelected}
    >
      {/* Status dot */}
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
      />

      {/* Info */}
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-foreground">T{table.number}</span>
          <span className="text-xs text-muted-foreground/70">{sectionConfig[table.section].name}</span>
          {table.guests > 0 && (
            <span className="text-xs text-muted-foreground/70">{table.guests} guests</span>
          )}
          {isOwn && (
            <span className="rounded bg-primary/15 px-1 py-0.5 font-mono text-[9px] font-semibold text-primary">
              YOURS
            </span>
          )}
        </div>
        {(showTimestamp || seatedMins !== null) && seatedMins !== null && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
            <Clock className="h-2.5 w-2.5" />
            Seated {seatedMins}m ago
          </div>
        )}
      </div>

      {/* Status badge */}
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold",
          table.status === "free" && "bg-emerald-500/15 text-emerald-400",
          table.status === "active" && "bg-amber-500/15 text-amber-400",
          table.status === "urgent" && "bg-red-500/15 text-red-400",
          table.status === "billing" && "bg-blue-500/15 text-blue-400",
          table.status === "closed" && "bg-secondary text-muted-foreground"
        )}
      >
        {cfg.label}
      </span>

      {/* Alerts */}
      {table.alerts && table.alerts.length > 0 && (
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-400" />
      )}
    </button>
  )
}

function EmptyResults({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <Search className="h-8 w-8 text-muted-foreground/30" />
      <p className="text-sm text-muted-foreground">
        No tables found for{" "}
        <span className="font-mono font-semibold text-foreground/70">{`"${query}"`}</span>
      </p>
      <p className="text-xs text-muted-foreground/50">
        Try a table number, section name, or status
      </p>
    </div>
  )
}
