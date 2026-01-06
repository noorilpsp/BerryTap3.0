"use client"

import { useState } from "react"
import { Calendar, Clock, Mail, Globe, Info, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

interface CreateScheduleModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateScheduleModal({ open, onOpenChange }: CreateScheduleModalProps) {
  const [name, setName] = useState("Monthly Sales Report - Automated")
  const [frequency, setFrequency] = useState("monthly")
  const [time, setTime] = useState("09:00")
  const [timezone, setTimezone] = useState("Europe/Skopje")
  const [recipients, setRecipients] = useState("sarah@berrytap.com; accounting@berrytap.com")
  const [dayOfMonth, setDayOfMonth] = useState("1")
  const [selectedDays, setSelectedDays] = useState<string[]>(["monday"])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create Scheduled Export
          </DialogTitle>
          <DialogDescription>
            Set up a recurring export that runs automatically
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Schedule Name */}
          <div className="space-y-2">
            <Label htmlFor="schedule-name">
              Schedule Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="schedule-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter schedule name"
            />
          </div>

          {/* Template Selection */}
          <div className="space-y-2">
            <Label htmlFor="template">Template (Optional)</Label>
            <Select defaultValue="tmpl_001">
              <SelectTrigger id="template">
                <SelectValue placeholder="Select template or configure manually" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tmpl_001">Monthly Sales Report</SelectItem>
                <SelectItem value="tmpl_002">Staff Performance Summary</SelectItem>
                <SelectItem value="tmpl_007">Daily Sales Summary</SelectItem>
                <SelectItem value="none">None - Configure manually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Frequency */}
          <div className="space-y-3">
            <Label>Frequency <span className="text-destructive">*</span></Label>
            <RadioGroup value={frequency} onValueChange={setFrequency} className="space-y-3">
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="daily" id="daily" />
                <div className="flex-1">
                  <Label htmlFor="daily" className="font-normal cursor-pointer">Daily</Label>
                  <p className="text-xs text-muted-foreground">Run every day at a specific time</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="weekly" id="weekly" />
                <div className="flex-1">
                  <Label htmlFor="weekly" className="font-normal cursor-pointer">Weekly</Label>
                  <p className="text-xs text-muted-foreground">Run once a week on specific day(s)</p>
                  {frequency === "weekly" && (
                    <div className="mt-2 flex gap-2">
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                        <Button
                          key={day}
                          variant={selectedDays.includes(day.toLowerCase()) ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-12 text-xs"
                          onClick={() => {
                            const dayLower = day.toLowerCase()
                            setSelectedDays(prev =>
                              prev.includes(dayLower)
                                ? prev.filter(d => d !== dayLower)
                                : [...prev, dayLower]
                            )
                          }}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="monthly" id="monthly" />
                <div className="flex-1">
                  <Label htmlFor="monthly" className="font-normal cursor-pointer">Monthly</Label>
                  <p className="text-xs text-muted-foreground">Run once a month on a specific day</p>
                  {frequency === "monthly" && (
                    <div className="mt-2">
                      <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              Day {day} of every month
                            </SelectItem>
                          ))}
                          <SelectItem value="last">Last day of month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="custom" id="custom" />
                <div className="flex-1">
                  <Label htmlFor="custom" className="font-normal cursor-pointer">Custom (Cron Expression)</Label>
                  <p className="text-xs text-muted-foreground">Advanced scheduling using cron syntax</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Time & Timezone */}
          <div className="space-y-3">
            <Label>Time & Timezone</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time" className="text-sm">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-sm">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Skopje">Europe/Skopje</SelectItem>
                    <SelectItem value="America/New_York">America/New York</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los Angeles</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Recipients */}
          <div className="space-y-2">
            <Label htmlFor="recipients">
              Recipients <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="recipients"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="email1@example.com; email2@example.com"
              rows={2}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Info className="h-3 w-3" />
              Separate multiple emails with semicolons (max 10)
            </p>
          </div>

          <Separator />

          {/* Configuration Summary */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <h4 className="text-sm font-semibold">Configuration Summary</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Dataset: Orders (from template)</li>
              <li>• Columns: 12 selected (from template)</li>
              <li>• Filters: 3 active (from template)</li>
              <li>• Format: CSV</li>
              <li>• Date Range: Last 30 days (dynamic)</li>
            </ul>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Edit Configuration
            </Button>
          </div>

          {/* Next Run Preview */}
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Next Run Preview
            </h4>
            <ul className="text-sm space-y-1">
              <li>📅 First run: Dec 1, 2024 at 9:00 AM (Europe/Skopje)</li>
              <li>📅 Second run: Jan 1, 2025 at 9:00 AM</li>
              <li>📅 Third run: Feb 1, 2025 at 9:00 AM</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="secondary">
            Preview
          </Button>
          <Button onClick={() => {
            console.log("[v0] Creating schedule:", { name, frequency, time, timezone, recipients })
            onOpenChange(false)
          }}>
            Create Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
