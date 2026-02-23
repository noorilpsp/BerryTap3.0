"use client"

import {
  Check,
  Download,
  MessageSquare,
  Table2,
  UserCog,
  MapPin,
  X,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface ListBulkActionsProps {
  count: number
  onDeselectAll: () => void
}

export function ListBulkActions({ count, onDeselectAll }: ListBulkActionsProps) {
  if (count < 2) return null

  return (
    <div className="list-bulk-bar fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 px-4 pb-2 lg:px-6">
      <div className="glass-surface-strong mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-medium text-foreground">
            <span className="tabular-nums">{count}</span> selected
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant="outline" className="h-7 border-zinc-700 text-[10px] text-zinc-300 hover:bg-zinc-700/60">
            <MessageSquare className="mr-1 h-3 w-3" /> Send Reminder
          </Button>
          <Button size="sm" variant="outline" className="h-7 border-zinc-700 text-[10px] text-zinc-300 hover:bg-zinc-700/60">
            <UserCog className="mr-1 h-3 w-3" /> Change Server
          </Button>
          <Button size="sm" variant="outline" className="h-7 border-zinc-700 text-[10px] text-zinc-300 hover:bg-zinc-700/60">
            <MapPin className="mr-1 h-3 w-3" /> Change Zone
          </Button>
          <Button size="sm" variant="outline" className="h-7 border-zinc-700 text-[10px] text-zinc-300 hover:bg-zinc-700/60">
            <Table2 className="mr-1 h-3 w-3" /> Assign Tables
          </Button>
          <Button size="sm" variant="outline" className="h-7 border-zinc-700 text-[10px] text-zinc-300 hover:bg-zinc-700/60">
            <Download className="mr-1 h-3 w-3" /> Export
          </Button>
          <Button size="sm" variant="outline" className="h-7 border-rose-700/30 text-[10px] text-rose-400 hover:bg-rose-500/10">
            <XCircle className="mr-1 h-3 w-3" /> Cancel All
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-[10px] text-zinc-500 hover:text-foreground"
            onClick={onDeselectAll}
          >
            <X className="mr-1 h-3 w-3" /> Deselect
          </Button>
        </div>
      </div>
    </div>
  )
}
