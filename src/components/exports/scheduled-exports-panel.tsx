"use client"

import { useState } from "react"
import { Calendar, Clock, Play, Pause, Edit, Trash2, Mail, CheckCircle2, XCircle, MoreVertical, Eye, Plus } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const scheduledExports = [
  {
    scheduleId: "sched_001",
    name: "Monthly Sales Report",
    status: "active",
    enabled: true,
    dataset: "Orders",
    format: "CSV",
    schedule: "Every 1st of month at 9:00 AM (Europe/Skopje)",
    recipients: ["sarah@berrytap.com", "accounting@berrytap.com"],
    nextRun: "Dec 1, 2024 at 9:00 AM",
    nextRunIn: "in 16 days",
    lastRun: {
      date: "Nov 1, 2024 at 9:02 AM",
      status: "success",
      rowCount: 2847,
    },
    templateName: "Monthly Sales Report",
    statistics: {
      totalRuns: 12,
      successfulRuns: 11,
      failedRuns: 1,
    },
  },
  {
    scheduleId: "sched_002",
    name: "Weekly Staff Metrics",
    status: "active",
    enabled: true,
    dataset: "Staff Metrics",
    format: "XLSX",
    schedule: "Every Monday at 8:00 AM (Europe/Skopje)",
    recipients: ["mike@berrytap.com", "hr@berrytap.com"],
    nextRun: "Nov 18, 2024 at 8:00 AM",
    nextRunIn: "in 3 days",
    lastRun: {
      date: "Nov 11, 2024 at 8:01 AM",
      status: "success",
      rowCount: 1247,
    },
    templateName: "Staff Performance Summary",
    statistics: {
      totalRuns: 28,
      successfulRuns: 28,
      failedRuns: 0,
    },
  },
  {
    scheduleId: "sched_003",
    name: "Daily Revenue Snapshot",
    status: "paused",
    enabled: false,
    dataset: "KPI Reports",
    format: "CSV",
    schedule: "Daily at 11:59 PM (Europe/Skopje)",
    recipients: ["sarah@berrytap.com"],
    pausedAt: "Nov 10, 2024",
    pausedBy: "Sarah Johnson",
    pauseReason: "Temporary suspension during system migration",
    lastRun: {
      date: "Nov 9, 2024 at 11:59 PM",
      status: "success",
      rowCount: 1,
    },
    templateName: "Daily Sales Summary",
    statistics: {
      totalRuns: 245,
      successfulRuns: 242,
      failedRuns: 3,
    },
  },
]

export function ScheduledExportsPanel() {
  const [activeTab, setActiveTab] = useState("active")
  
  const activeSchedules = scheduledExports.filter(s => s.status === "active")
  const pausedSchedules = scheduledExports.filter(s => s.status === "paused")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Scheduled Exports
          </h2>
          <p className="text-sm text-muted-foreground">Recurring automated exports</p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Schedule
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({activeSchedules.length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({pausedSchedules.length})</TabsTrigger>
          <TabsTrigger value="all">All ({scheduledExports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          {activeSchedules.map((schedule) => (
            <Card key={schedule.scheduleId} className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{schedule.name}</h3>
                      <Switch checked={schedule.enabled} />
                      <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span>📊 Dataset: {schedule.dataset}</span>
                        <span>•</span>
                        <span>{schedule.format}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{schedule.schedule}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        <span>Recipients: {schedule.recipients.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" />
                        Run Now
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Schedule
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Pause className="mr-2 h-4 w-4" />
                        Pause Schedule
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Schedule
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Separator />

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Next Run:</span>
                    <span className="font-medium">{schedule.nextRun} ({schedule.nextRunIn})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last Run:</span>
                    <div className="flex items-center gap-1.5">
                      <span>{schedule.lastRun.date}</span>
                      {schedule.lastRun.status === "success" && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      )}
                      <span className="text-muted-foreground">({schedule.lastRun.rowCount} rows)</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Template:</span>
                    <span>{schedule.templateName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">History:</span>
                    <span>{schedule.statistics.totalRuns} runs • {schedule.statistics.successfulRuns} successful • {schedule.statistics.failedRuns} failed</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Play className="h-3.5 w-3.5" />
                    Run Now
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2">
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2">
                    <Eye className="h-3.5 w-3.5" />
                    History
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="paused" className="space-y-4 mt-4">
          {pausedSchedules.map((schedule) => (
            <Card key={schedule.scheduleId} className="p-4 border-dashed">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{schedule.name}</h3>
                      <Switch checked={schedule.enabled} />
                      <Badge variant="outline" className="bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20">
                        <div className="h-2 w-2 rounded-full bg-gray-500 mr-1" />
                        Paused
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span>📊 Dataset: {schedule.dataset}</span>
                        <span>•</span>
                        <span>{schedule.format}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{schedule.schedule}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <div className="font-medium mb-1">⏸️ Paused on: {schedule.pausedAt} by {schedule.pausedBy}</div>
                  <div className="text-muted-foreground">Reason: "{schedule.pauseReason}"</div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-2">
                    <Play className="h-3.5 w-3.5" />
                    Resume
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2">
                    <Edit className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-4">
          {scheduledExports.map((schedule) => (
            <Card key={schedule.scheduleId} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{schedule.name}</h3>
                  <p className="text-sm text-muted-foreground">{schedule.schedule}</p>
                </div>
                <Badge variant={schedule.status === "active" ? "default" : "secondary"}>
                  {schedule.status}
                </Badge>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
