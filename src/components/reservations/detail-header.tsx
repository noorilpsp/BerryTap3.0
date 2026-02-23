"use client"

import { Star, X, Phone, MessageSquare, Edit, MoreHorizontal, Utensils, CreditCard, RotateCcw, UserX, Send, Eye, Ban, Receipt } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  type DetailReservation,
  type DetailStatus,
  statusConfig,
  formatTime12h,
  formatDateFull,
} from "@/lib/detail-modal-data"
import { cn } from "@/lib/utils"

interface DetailHeaderProps {
  reservation: DetailReservation
  onClose: () => void
}

function StatusBadge({ status }: { status: DetailStatus }) {
  const cfg = statusConfig[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        cfg.bg,
        cfg.border,
        cfg.color,
        cfg.pulse && "detail-status-pulse",
        cfg.strikethrough && "line-through"
      )}
      aria-label={`Status: ${cfg.label}`}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          status === "confirmed" && "bg-blue-400",
          status === "arriving" && "bg-amber-400",
          status === "seated" && "bg-emerald-400",
          status === "late" && "bg-rose-400",
          status === "completed" && "bg-zinc-400",
          status === "no_show" && "bg-rose-500",
          status === "cancelled" && "bg-zinc-500",
          cfg.pulse && "animate-pulse"
        )}
      />
      {cfg.label}
      {status === "late" && " (14 min late)"}
    </span>
  )
}

function ConfirmedActions({ reservation }: { reservation: DetailReservation }) {
  return (
    <>
      <Button size="sm" className="bg-emerald-600 text-emerald-50 hover:bg-emerald-500" aria-label={`Seat ${reservation.guestName} at Table ${reservation.table} now`}>
        <Utensils className="mr-1.5 h-3.5 w-3.5" /> Seat Now
      </Button>
      <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100">
        <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Text Guest
      </Button>
      <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100" asChild>
        <Link href={`?action=edit&id=${reservation.id}`}><Edit className="mr-1.5 h-3.5 w-3.5" /> Edit</Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-zinc-700 bg-zinc-900 text-zinc-200">
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100"><Phone className="mr-2 h-3.5 w-3.5" /> Call Guest</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Change Table</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Change Time</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Assign Server</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Move to Waitlist</DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-700" />
          <DropdownMenuItem className="text-rose-400 focus:bg-zinc-800 focus:text-rose-300"><UserX className="mr-2 h-3.5 w-3.5" /> Mark No-Show</DropdownMenuItem>
          <DropdownMenuItem className="text-rose-400 focus:bg-zinc-800 focus:text-rose-300"><Ban className="mr-2 h-3.5 w-3.5" /> Cancel Reservation</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

function ArrivingActions({ reservation }: { reservation: DetailReservation }) {
  return (
    <>
      <Button size="sm" className="bg-emerald-600 text-emerald-50 hover:bg-emerald-500" aria-label={`Seat ${reservation.guestName} now`}>
        <Utensils className="mr-1.5 h-3.5 w-3.5" /> Seat Now
      </Button>
      <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100">
        <Send className="mr-1.5 h-3.5 w-3.5" /> Text: Ready
      </Button>
      <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100" asChild>
        <Link href={`?action=edit&id=${reservation.id}`}><Edit className="mr-1.5 h-3.5 w-3.5" /> Edit</Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-zinc-700 bg-zinc-900 text-zinc-200">
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100"><Phone className="mr-2 h-3.5 w-3.5" /> Call Guest</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Text: Running Late?</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Extend Hold (+15 min)</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Change Table</DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-700" />
          <DropdownMenuItem className="text-rose-400 focus:bg-zinc-800 focus:text-rose-300"><UserX className="mr-2 h-3.5 w-3.5" /> Mark No-Show</DropdownMenuItem>
          <DropdownMenuItem className="text-rose-400 focus:bg-zinc-800 focus:text-rose-300"><Ban className="mr-2 h-3.5 w-3.5" /> Cancel</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

function SeatedActions() {
  return (
    <>
      <Button size="sm" className="bg-blue-600 text-blue-50 hover:bg-blue-500">
        <Eye className="mr-1.5 h-3.5 w-3.5" /> View Order
      </Button>
      <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100">
        <Utensils className="mr-1.5 h-3.5 w-3.5" /> Fire Next
      </Button>
      <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100">
        <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Print Check
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-zinc-700 bg-zinc-900 text-zinc-200">
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Move Table</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Add to Order</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Split Check</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Comp Item</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Add Note</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Alert Server</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

function CompletedActions() {
  return (
    <>
      <Button size="sm" className="bg-emerald-600 text-emerald-50 hover:bg-emerald-500">
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Rebook Guest
      </Button>
      <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100">
        <Send className="mr-1.5 h-3.5 w-3.5" /> Send Thank You
      </Button>
      <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100">
        <Receipt className="mr-1.5 h-3.5 w-3.5" /> View Receipt
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-zinc-700 bg-zinc-900 text-zinc-200">
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Add Review Note</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Flag Issue</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">View Guest Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

function NoShowActions() {
  return (
    <>
      <Button size="sm" className="bg-emerald-600 text-emerald-50 hover:bg-emerald-500">
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reinstate
      </Button>
      <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100">
        <Phone className="mr-1.5 h-3.5 w-3.5" /> Contact Guest
      </Button>
      <Button size="sm" variant="outline" className="border-rose-700/50 bg-rose-900/20 text-rose-300 hover:bg-rose-900/30 hover:text-rose-200">
        <Ban className="mr-1.5 h-3.5 w-3.5" /> Block Guest
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100">
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border-zinc-700 bg-zinc-900 text-zinc-200">
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Waive No-Show Fee</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Charge Deposit</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">Add to Blacklist</DropdownMenuItem>
          <DropdownMenuItem className="focus:bg-zinc-800 focus:text-zinc-100">View Guest Profile</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

function CancelledActions() {
  return (
    <>
      <Button size="sm" className="bg-emerald-600 text-emerald-50 hover:bg-emerald-500">
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Rebook
      </Button>
      <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100">
        <Eye className="mr-1.5 h-3.5 w-3.5" /> View Reason
      </Button>
      <Button size="sm" variant="outline" className="border-zinc-700 bg-zinc-800/50 text-zinc-200 hover:bg-zinc-700 hover:text-zinc-100">
        <Phone className="mr-1.5 h-3.5 w-3.5" /> Contact Guest
      </Button>
    </>
  )
}

export function DetailHeader({ reservation, onClose }: DetailHeaderProps) {
  const isVip = reservation.tags.includes("vip")

  return (
    <div className="sticky top-0 z-10 flex flex-col gap-3 border-b border-zinc-800/50 bg-zinc-950/95 px-5 py-4 backdrop-blur-xl">
      {/* Top row: Name + Close */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isVip && <Star className="h-4 w-4 flex-shrink-0 fill-amber-400 text-amber-400" />}
            <h2 className="truncate text-lg font-bold text-foreground">{reservation.guestName}</h2>
          </div>
          <p className="mt-0.5 text-sm text-zinc-400">
            Party of {reservation.partySize} &middot; {formatDateFull(reservation.date)} &middot; {formatTime12h(reservation.time)}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Status badge */}
      <StatusBadge status={reservation.status} />

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {(reservation.status === "confirmed") && <ConfirmedActions reservation={reservation} />}
        {(reservation.status === "arriving" || reservation.status === "late") && <ArrivingActions reservation={reservation} />}
        {reservation.status === "seated" && <SeatedActions />}
        {reservation.status === "completed" && <CompletedActions />}
        {reservation.status === "no_show" && <NoShowActions />}
        {reservation.status === "cancelled" && <CancelledActions />}
      </div>
    </div>
  )
}
