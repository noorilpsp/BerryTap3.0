"use client"

import { useState } from "react"
import { CalendarIcon, Globe } from 'lucide-react'
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const dateRangePresets = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "last_7_days", label: "Last 7 Days" },
  { id: "last_30_days", label: "Last 30 Days" },
  { id: "this_month", label: "This Month" },
  { id: "last_month", label: "Last Month" },
  { id: "this_year", label: "This Year" },
  { id: "custom", label: "Custom" },
]

const timezones = [
  { value: "Europe/Skopje", label: "Europe/Skopje (GMT+1, CET)", recommended: true },
  { value: "Europe/London", label: "Europe/London (GMT+0)" },
  { value: "Europe/Paris", label: "Europe/Paris (GMT+1)" },
  { value: "America/New_York", label: "America/New York (GMT-5)" },
  { value: "America/Los_Angeles", label: "America/Los Angeles (GMT-8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (GMT+9)" },
]

export function DateRangePicker() {
  const [startDate, setStartDate] = useState<Date>(new Date(2024, 10, 1))
  const [endDate, setEndDate] = useState<Date>(new Date(2024, 10, 30))
  const [timezone, setTimezone] = useState("Europe/Skopje")
  const [selectedPreset, setSelectedPreset] = useState("custom")

  const handlePresetClick = (presetId: string) => {
    setSelectedPreset(presetId)
    const today = new Date()
    
    switch (presetId) {
      case "today":
        setStartDate(today)
        setEndDate(today)
        break
      case "yesterday":
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        setStartDate(yesterday)
        setEndDate(yesterday)
        break
      case "last_7_days":
        const sevenDaysAgo = new Date(today)
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        setStartDate(sevenDaysAgo)
        setEndDate(today)
        break
      case "last_30_days":
        const thirtyDaysAgo = new Date(today)
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        setStartDate(thirtyDaysAgo)
        setEndDate(today)
        break
    }
  }

  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          2. Date Range & Time <span className="text-destructive">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(startDate, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">End Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  {format(endDate, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Timezone</label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timezones.map(tz => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.recommended && "✓ "}{tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Quick Ranges</label>
          <div className="flex flex-wrap gap-2">
            {dateRangePresets.map(preset => (
              <Button
                key={preset.id}
                variant={selectedPreset === preset.id ? "default" : "outline"}
                size="sm"
                onClick={() => handlePresetClick(preset.id)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div className="text-xs space-y-1">
              <p className="font-medium">
                Selected range: {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")} ({daysDiff} days) • {timezone}
              </p>
              <p className="text-muted-foreground">
                Estimated records: ~2,847 orders
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
