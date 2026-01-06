"use client"

import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"

interface DashboardToolbarProps {
  timeRange: "today" | "week" | "month"
  onTimeRangeChange: (range: "today" | "week" | "month") => void
  showComparison: boolean
  onToggleComparison: () => void
}

export function DashboardToolbar({
  timeRange,
  onTimeRangeChange,
  showComparison,
  onToggleComparison,
}: DashboardToolbarProps) {
  return (
    <div className="bg-background border border-border rounded-lg p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground w-full sm:w-auto">
          <Button
            variant={timeRange === "today" ? "default" : "ghost"}
            size="sm"
            onClick={() => onTimeRangeChange("today")}
            className="flex-1 sm:flex-none h-7 px-3"
          >
            Today
          </Button>
          <Button
            variant={timeRange === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => onTimeRangeChange("week")}
            className="flex-1 sm:flex-none h-7 px-3"
          >
            Week
          </Button>
          <Button
            variant={timeRange === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => onTimeRangeChange("month")}
            className="flex-1 sm:flex-none h-7 px-3"
          >
            Month
          </Button>
        </div>

        <Button variant={showComparison ? "default" : "outline"} size="sm" onClick={onToggleComparison}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Compare
        </Button>
      </div>
    </div>
  )
}
