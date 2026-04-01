"use client"

import { useState, useEffect } from "react"
import { Link } from "@/components/ui/link"
import { ArrowLeft, Clock, Info, Loader2, MessageSquare, MoreHorizontal, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { TableDetail } from "@/lib/table-data"
import { tableStatusConfig, minutesAgo } from "@/lib/table-data"
import { floorMapPath } from "@/lib/floor-map/floorMapNav"

interface TopBarProps {
  table: TableDetail
  onToggleInfo: () => void
  /** Called when closing table. Pass { force: true } for manager override. */
  onCloseTable?: (options?: { force?: boolean }) => void
  closePendingLabel?: string | null
}

export function TopBar({
  table,
  onToggleInfo,
  onCloseTable,
  closePendingLabel = null,
}: TopBarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const statusCfg = tableStatusConfig[table.status]
  const elapsed = mounted ? minutesAgo(table.seatedAt) : 0
  const lastCheck = mounted ? minutesAgo(table.lastCheckIn) : 0

  const backToFloorMapHref = floorMapPath(table.floorPlanId)

  return (
    <header className="flex items-center gap-2 border-b border-border bg-card px-3 py-2.5 md:px-4 md:py-3">
      {/* Back button */}
      <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Back to Floor Plan" asChild>
        <Link prefetch={true} href={backToFloorMapHref}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>

      {/* Table number */}
      <h1 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
        {"T-"}
        {table.number}
      </h1>

      {/* Guest count */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        <span>{table.guestCount}</span>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Clock className="h-3.5 w-3.5" />
        <span>{elapsed}m</span>
      </div>

      {/* Status badge */}
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
          statusCfg.bgClass,
          statusCfg.colorClass,
          statusCfg.pulse && "animate-pulse-ring"
        )}
      >
        {statusCfg.label}
      </span>

      {/* Attention warning */}
      {lastCheck > 10 && (
        <span className="hidden items-center gap-1 text-xs font-medium text-red-500 sm:inline-flex">
          {"No check-in "}
          {lastCheck}m
        </span>
      )}

      <div className="flex-1" />

      {closePendingLabel && (
        <span className="hidden items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 sm:inline-flex">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {closePendingLabel}
        </span>
      )}

      {/* Kitchen message */}
      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Message kitchen">
        <MessageSquare className="h-4 w-4" />
      </Button>

      {/* Info toggle (tablet/mobile) */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 lg:hidden"
        onClick={onToggleInfo}
        aria-label="Toggle info panel"
      >
        <Info className="h-4 w-4" />
      </Button>

      {/* More menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            aria-label="More options"
            data-testid="table-more-options"
            disabled={closePendingLabel !== null}
          >
            {closePendingLabel ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link prefetch={true} href={`/fire-control/${table.id}`}>Fire Control</Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>Move Table</DropdownMenuItem>
          <DropdownMenuItem disabled>Transfer Server</DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link prefetch={true} href="/merge-split">Merge Tables</Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>Split Table</DropdownMenuItem>
          {table.status !== "available" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                data-testid="table-close-session"
                className="cursor-pointer"
                onSelect={() => onCloseTable?.()}
              >
                Close Table
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-amber-400 focus:text-amber-400"
                onSelect={() => onCloseTable?.({ force: true })}
              >
                Force Close (Manager Override)
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
