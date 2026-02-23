"use client"

import { useState, useCallback, useMemo } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ListTopBar, type StatusTab, type ActiveFilter } from "./list-top-bar"
import { ListDataTable } from "./list-data-table"
import { ListMobileCards } from "./list-mobile-cards"
import { ListDetailPanel } from "./list-detail-panel"
import { ListBulkActions } from "./list-bulk-actions"
import { ListKeyboardShortcuts } from "./list-keyboard-shortcuts"
import {
  type ListReservation,
  type ListReservationStatus,
  type GroupByOption,
  listReservations,
  getListSummary,
} from "@/lib/listview-data"
import { useMediaQuery } from "@/hooks/use-media-query"

export function ListView() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const startOfDay = useCallback((date: Date) => {
    const next = new Date(date)
    next.setHours(0, 0, 0, 0)
    return next
  }, [])

  const getCurrentMinutes = useCallback(() => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  }, [])

  // State
  const [searchQuery, setSearchQuery] = useState("")
  const [activeStatuses, setActiveStatuses] = useState<ListReservationStatus[]>([])
  const [groupBy, setGroupBy] = useState<GroupByOption>("status")
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [detailReservation, setDetailReservation] = useState<ListReservation | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()))

  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Filtering logic
  const filteredReservations = useMemo(() => {
    let result = [...listReservations]

    // Status filter
    if (activeStatuses.length > 0) {
      result = result.filter((r) => (
        activeStatuses.some((status) => (
          status === "confirmed"
            ? r.status === "confirmed" || r.status === "unconfirmed"
            : r.status === status
        ))
      ))
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.guestName.toLowerCase().includes(q) ||
          r.phone?.toLowerCase().includes(q) ||
          r.notes?.toLowerCase().includes(q) ||
          r.table?.toLowerCase().includes(q) ||
          r.server?.toLowerCase().includes(q) ||
          r.tags.some((t) => t.label.toLowerCase().includes(q) || t.detail?.toLowerCase().includes(q))
      )
    }

    // Advanced filters
    for (const filter of activeFilters) {
      switch (filter.category) {
        case "party-size": {
          const range = filter.value
          result = result.filter((r) => {
            if (range === "1-2") return r.partySize <= 2
            if (range === "3-4") return r.partySize >= 3 && r.partySize <= 4
            if (range === "5-6") return r.partySize >= 5 && r.partySize <= 6
            if (range === "7+") return r.partySize >= 7
            return true
          })
          break
        }
        case "time": {
          const nowMin = getCurrentMinutes()
          result = result.filter((r) => {
            const [h, m] = r.time.split(":").map(Number)
            const resMin = h * 60 + m
            if (filter.value === "Next 30min") return resMin >= nowMin && resMin <= nowMin + 30
            if (filter.value === "Next 1hr") return resMin >= nowMin && resMin <= nowMin + 60
            if (filter.value === "Next 2hr") return resMin >= nowMin && resMin <= nowMin + 120
            return true
          })
          break
        }
        case "zone":
          result = result.filter((r) => r.zone === filter.value)
          break
        case "tags":
          result = result.filter((r) =>
            r.tags.some((t) => t.type.toLowerCase().replace("-", " ") === filter.value.toLowerCase())
          )
          break
        case "risk":
          result = result.filter((r) => r.risk === filter.value.toLowerCase())
          break
        case "server":
          result = result.filter((r) => r.server === filter.value)
          break
        case "channel":
          result = result.filter((r) => r.bookedVia === filter.value)
          break
      }
    }

    return result
  }, [activeFilters, activeStatuses, getCurrentMinutes, searchQuery])

  const summary = useMemo(() => getListSummary(listReservations), [])
  const filteredSummary = useMemo(() => getListSummary(filteredReservations), [filteredReservations])

  // Handlers
  const handleAddFilter = useCallback((filter: ActiveFilter) => {
    setActiveFilters((prev) => {
      const exists = prev.some((f) => f.category === filter.category && f.value === filter.value)
      if (exists) return prev.filter((f) => !(f.category === filter.category && f.value === filter.value))
      return [...prev, filter]
    })
  }, [])

  const handleRemoveFilter = useCallback((filter: ActiveFilter) => {
    setActiveFilters((prev) => prev.filter((f) => !(f.category === filter.category && f.value === filter.value)))
  }, [])

  const handleClearFilters = useCallback(() => setActiveFilters([]), [])
  const handleStatusFilter = useCallback((status: StatusTab) => {
    setActiveStatuses((prev) => {
      if (status === "all") return []
      if (prev.includes(status)) {
        return prev.filter((item) => item !== status)
      }
      return [...prev, status]
    })
  }, [])

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  const handleDeselectAll = useCallback(() => setSelectedIds(new Set()), [])

  const handleOpenDetail = useCallback((reservation: ListReservation) => {
    setDetailReservation(reservation)
    setDetailOpen(true)
  }, [])

  const handleExport = useCallback(() => {
    const csv = [
      ["Time", "Guest", "Party", "Table", "Status", "Risk", "Server", "Zone", "Tags", "Notes"].join(","),
      ...filteredReservations.map((r) =>
        [
          r.time,
          `"${r.guestName}"`,
          r.partySize,
          r.table ?? "",
          r.status,
          r.risk,
          r.server ?? "",
          r.zone ?? "",
          `"${r.tags.map((t) => t.label).join(", ")}"`,
          `"${r.notes ?? ""}"`,
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "reservations-export.csv"
    a.click()
    URL.revokeObjectURL(url)
  }, [filteredReservations])

  const handleOpenNewReservation = useCallback(() => {
    const next = new URLSearchParams(searchParams.toString())
    const y = selectedDate.getFullYear()
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0")
    const d = String(selectedDate.getDate()).padStart(2, "0")

    next.set("action", "new")
    next.set("date", `${y}-${m}-${d}`)
    next.delete("id")
    next.delete("detail")

    const query = next.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [pathname, router, searchParams, selectedDate])

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {isDesktop ? (
        <>
          <ListTopBar
            totalReservations={filteredSummary.totalRes}
            totalCovers={filteredSummary.totalCovers}
            statusCounts={summary.statusCounts}
            selectedDate={selectedDate}
            onSelectedDateChange={(date) => setSelectedDate(startOfDay(date))}
            onSearchChange={setSearchQuery}
            onStatusFilter={handleStatusFilter}
            activeStatuses={activeStatuses}
            onGroupByChange={setGroupBy}
            activeGroupBy={groupBy}
            activeFilters={activeFilters}
            onAddFilter={handleAddFilter}
            onRemoveFilter={handleRemoveFilter}
            onClearFilters={handleClearFilters}
            onExport={handleExport}
            onNewReservation={handleOpenNewReservation}
          />
          <ListDataTable
            reservations={filteredReservations}
            groupBy={groupBy}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
            onOpenDetail={handleOpenDetail}
            focusedRowId={focusedRowId}
            onFocusRow={setFocusedRowId}
          />
          <ListBulkActions
            count={selectedIds.size}
            onDeselectAll={handleDeselectAll}
          />
        </>
      ) : (
        <ListMobileCards
          reservations={filteredReservations}
          groupBy={groupBy}
          onSearchChange={setSearchQuery}
          activeStatuses={activeStatuses}
          onStatusFilter={handleStatusFilter}
          onOpenDetail={handleOpenDetail}
        />
      )}

      <ListDetailPanel
        reservation={detailReservation}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      />

      <ListKeyboardShortcuts
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
    </div>
  )
}
