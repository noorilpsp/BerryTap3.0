"use client"

import { useState } from "react"
import { Clock, Calendar, CalendarDays, CalendarRange, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const granularityOptions = [
  {
    id: "hourly",
    label: "Hourly",
    icon: Clock,
    description: "One row per hour (720 rows for 30 days)",
    bestFor: "Detailed analytics, peak time analysis"
  },
  {
    id: "daily",
    label: "Daily",
    icon: Calendar,
    description: "One row per day (30 rows for 30 days)",
    bestFor: "Standard reports, trends",
    recommended: true
  },
  {
    id: "weekly",
    label: "Weekly",
    icon: CalendarDays,
    description: "One row per week (4-5 rows for 30 days)",
    bestFor: "Weekly summaries, comparisons"
  },
  {
    id: "monthly",
    label: "Monthly",
    icon: CalendarRange,
    description: "One row per month (1 row for Nov 2024)",
    bestFor: "Long-term trends, year comparisons"
  },
  {
    id: "raw",
    label: "Raw / No Aggregation",
    icon: FileText,
    description: "Individual records (estimated ~2,847 rows)",
    bestFor: "Detailed analysis, auditing",
    warning: "May result in large file sizes"
  }
]

export function GranularitySelector() {
  const [granularity, setGranularity] = useState("daily")
  const selected = granularityOptions.find(opt => opt.id === granularity)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">3. Data Granularity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={granularity} onValueChange={setGranularity}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {granularityOptions.map(option => {
              const Icon = option.icon
              return (
                <SelectItem key={option.id} value={option.id}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {option.recommended && "✓ "}
                    {option.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        <p className="text-sm text-muted-foreground">
          Choose how to aggregate your data before export
        </p>

        {selected && (
          <div className="rounded-lg border border-muted bg-muted/30 p-3 space-y-2">
            <p className="text-xs font-medium">ℹ️  {selected.description}</p>
            <p className="text-xs text-muted-foreground">
              💡 Best for: {selected.bestFor}
            </p>
            {selected.warning && (
              <p className="text-xs text-warning">⚠️  {selected.warning}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
