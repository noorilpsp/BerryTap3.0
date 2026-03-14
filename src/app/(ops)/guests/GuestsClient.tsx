"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  sortGuests,
  filterBySegment,
  searchGuests,
} from "@/lib/guests-data"
import type { GuestSegment, SortOption, ViewMode } from "@/lib/guests-data"
import { toGuestProfile } from "@/lib/guests/toGuestProfile"
import type { GuestsView } from "@/lib/guests/guestsView"
import { GuestTopBar } from "@/components/guests/guest-top-bar"
import { GuestList } from "@/components/guests/guest-list"
import { GuestProfileDetail } from "@/components/guests/guest-profile-detail"
import { GuestAnalyticsSidebar } from "@/components/guests/guest-analytics-sidebar"
import { AddGuestDialog } from "@/components/guests/add-guest-dialog"
import { EditGuestDialog } from "@/components/guests/edit-guest-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface GuestsClientProps {
  initialGuestsView: GuestsView | null
}

function GuestsNoLocationState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
      <p className="text-base font-medium">No location selected</p>
      <p className="text-sm">Select a store in POS or settings.</p>
    </div>
  )
}

export function GuestsClient({ initialGuestsView }: GuestsClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [segment, setSegment] = useState<GuestSegment | "all">("all")
  const [sort, setSort] = useState<SortOption>("last_visit")
  const [view, setView] = useState<ViewMode>("list")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false)

  const handleRefresh = useCallback(
    (createdId?: string) => {
      if (createdId) setSelectedId(createdId)
      router.refresh()
    },
    [router]
  )

  const isDesktop = useMediaQuery("(min-width: 1280px)")
  const isTablet = useMediaQuery("(min-width: 768px)")

  const guestProfiles = useMemo(() => {
    if (!initialGuestsView?.guests) return []
    return initialGuestsView.guests.map(toGuestProfile)
  }, [initialGuestsView])

  const filtered = useMemo(() => {
    let list = filterBySegment(guestProfiles, segment)
    list = searchGuests(list, search)
    list = sortGuests(list, sort)
    return list
  }, [guestProfiles, segment, search, sort])

  const selectedGuest = useMemo(
    () => guestProfiles.find((g) => g.id === selectedId) ?? filtered.find((g) => g.id === selectedId) ?? null,
    [guestProfiles, filtered, selectedId]
  )

  const handleSelectGuest = useCallback(
    (id: string) => {
      setSelectedId(id)
      if (!isTablet) setMobileProfileOpen(true)
    },
    [isTablet]
  )

  const handleBack = useCallback(() => {
    setMobileProfileOpen(false)
  }, [])

  useEffect(() => {
    if (selectedId === null && filtered.length > 0) {
      setSelectedId(filtered[0].id)
    }
  }, [selectedId, filtered])

  if (!initialGuestsView) {
    return <GuestsNoLocationState />
  }

  const segmentCounts = initialGuestsView.segmentCounts

  const topBar = (
    <GuestTopBar
      search={search}
      onSearchChange={setSearch}
      segment={segment}
      onSegmentChange={setSegment}
      sort={sort}
      onSortChange={setSort}
      view={view}
      onViewChange={setView}
      onAddGuest={() => setAddOpen(true)}
      filteredCount={filtered.length}
      segmentCounts={segmentCounts}
    />
  )

  const list = (
    <GuestList
      guests={filtered}
      selectedId={selectedId}
      onSelect={handleSelectGuest}
      view={view}
    />
  )

  /* ── DESKTOP: 3-column ─────────────────────────────────────── */
  if (isDesktop) {
    return (
      <div className="flex h-full flex-col">
        {topBar}
        <div className="flex min-h-0 flex-1">
          <div className="w-[380px] shrink-0 border-r border-border/30">
            {list}
          </div>
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden border-r border-border/30">
            {selectedGuest ? (
              <div key={selectedGuest.id} className="h-full min-h-0 overflow-hidden guest-profile-enter">
                <GuestProfileDetail guest={selectedGuest} onEdit={() => setEditOpen(true)} onRefresh={handleRefresh} />
              </div>
            ) : (
              <EmptyProfile />
            )}
          </div>
          <div className="w-[320px] shrink-0">
            {selectedGuest ? (
              <ScrollArea className="h-full">
                <div key={selectedGuest.id} className="guest-analytics-enter">
                  <GuestAnalyticsSidebar guest={selectedGuest} />
                </div>
              </ScrollArea>
            ) : (
              <EmptyAnalytics />
            )}
          </div>
        </div>
        <AddGuestDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          locationId={initialGuestsView.locationId}
          onSuccess={(id) => handleRefresh(id)}
        />
        <EditGuestDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          guest={selectedGuest}
          onSuccess={(id) => handleRefresh(id)}
        />
      </div>
    )
  }

  /* ── TABLET: 2-column ──────────────────────────────────────── */
  if (isTablet) {
    return (
      <div className="flex h-full flex-col">
        {topBar}
        <div className="flex min-h-0 flex-1">
          <div className="w-[40%] shrink-0 border-r border-border/30">{list}</div>
          <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
            {selectedGuest ? (
              <div key={selectedGuest.id} className="h-full min-h-0 overflow-hidden guest-profile-enter">
                <GuestProfileDetail guest={selectedGuest} onEdit={() => setEditOpen(true)} onRefresh={handleRefresh} showAnalyticsTab />
              </div>
            ) : (
              <EmptyProfile />
            )}
          </div>
        </div>
        <AddGuestDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          locationId={initialGuestsView.locationId}
          onSuccess={(id) => handleRefresh(id)}
        />
        <EditGuestDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          guest={selectedGuest}
          onSuccess={(id) => handleRefresh(id)}
        />
      </div>
    )
  }

  /* ── MOBILE: Single column ─────────────────────────────────── */
  return (
    <div className="flex h-full flex-col">
      {topBar}
      <div className="min-h-0 flex-1">{list}</div>
      <Sheet open={mobileProfileOpen} onOpenChange={setMobileProfileOpen}>
        <SheetContent side="bottom" className="h-[92dvh] rounded-t-2xl border-border/30 bg-background p-0">
          {selectedGuest && (
            <GuestProfileDetail
              guest={selectedGuest}
              onBack={handleBack}
              onEdit={() => setEditOpen(true)}
              onRefresh={handleRefresh}
              showAnalyticsTab
            />
          )}
        </SheetContent>
      </Sheet>
      <AddGuestDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        locationId={initialGuestsView.locationId}
        onSuccess={(id) => handleRefresh(id)}
      />
      <EditGuestDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        guest={selectedGuest}
        onSuccess={(id) => handleRefresh(id)}
      />
    </div>
  )
}

function EmptyProfile() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
      <div className="rounded-2xl bg-secondary/30 p-5">
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="24" cy="18" r="8" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/40" />
          <path
            d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-muted-foreground/40"
          />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-foreground">Select a Guest</h3>
      <p className="max-w-xs text-xs text-muted-foreground">
        Choose a guest from the list to view their full profile, visit history, and insights
      </p>
    </div>
  )
}

function EmptyAnalytics() {
  return (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <p className="text-xs text-muted-foreground">Select a guest to view analytics</p>
    </div>
  )
}
