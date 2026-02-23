"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { restaurantConfig, type ServicePeriod } from "@/lib/reservations-data"
import { toast } from "sonner"

interface TopBarProps {
  servicePeriod: ServicePeriod
  onServicePeriodChange: (period: ServicePeriod) => void
}

export function TopBar({ servicePeriod, onServicePeriodChange }: TopBarProps) {
  const [currentTime, setCurrentTime] = useState(restaurantConfig.currentTime)
  const [currentDate, setCurrentDate] = useState(() => {
    const parsed = new Date(restaurantConfig.currentDate)
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed
  })

  useEffect(() => {
    // Simulate live clock from mock start time
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const [h, m] = prev.split(":").map(Number)
        const newM = m + 1
        if (newM >= 60) {
          return `${(h + 1).toString().padStart(2, "0")}:00`
        }
        return `${h.toString().padStart(2, "0")}:${newM.toString().padStart(2, "0")}`
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const activePeriod = restaurantConfig.servicePeriods.find(
    (p) => p.id === servicePeriod
  )

  const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number)
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
    const ampm = h >= 12 ? "PM" : "AM"
    return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`
  }

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    })

  const shiftDate = (days: number) => {
    setCurrentDate((prev) => {
      const next = new Date(prev)
      next.setDate(next.getDate() + days)
      toast.message(`Showing ${formatDate(next)}`)
      return next
    })
  }

  return (
    <header className="sticky top-0 z-50 glass-surface-strong">
      <div className="flex items-center justify-between px-4 py-3 lg:px-6">
        {/* Left: Date navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-foreground">
              {formatDate(currentDate)}
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              aria-label="Previous day"
              onClick={() => shiftDate(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              aria-label="Next day"
              onClick={() => shiftDate(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Center: Service period + Time (hidden on mobile) */}
        <div className="hidden items-center gap-4 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 bg-zinc-800/60 text-foreground hover:bg-zinc-700/60"
              >
                {activePeriod?.label ?? "Dinner"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              className="border-zinc-700 bg-zinc-900"
            >
              {restaurantConfig.servicePeriods.map((p) => (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => onServicePeriodChange(p.id)}
                  className="text-foreground focus:bg-zinc-800 focus:text-foreground"
                >
                  {p.label} ({formatTime(p.start)} - {formatTime(p.end)})
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="tabular-nums font-mono text-foreground">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>

        {/* Right: CTA */}
        <Button
          size="sm"
          className="hidden bg-emerald-600 text-emerald-50 hover:bg-emerald-500 md:flex"
          asChild
        >
          <Link href="?action=new">
            <Plus className="mr-1.5 h-4 w-4" />
            New Reservation
          </Link>
        </Button>
      </div>

      {/* Mobile: Service + time row */}
      <div className="flex items-center justify-between border-t border-zinc-800/50 px-4 py-2 md:hidden">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {activePeriod?.label}
          </span>
          <span>
            {formatTime(activePeriod?.start ?? "17:00")} -{" "}
            {formatTime(activePeriod?.end ?? "23:00")}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="tabular-nums font-mono text-foreground">
            {formatTime(currentTime)}
          </span>
        </div>
      </div>

      {/* Mobile FAB */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-emerald-600 shadow-lg shadow-emerald-900/40 hover:bg-emerald-500 md:hidden"
        aria-label="New Reservation"
        asChild
      >
        <Link href="?action=new">
          <Plus className="h-6 w-6 text-emerald-50" />
        </Link>
      </Button>
    </header>
  )
}
