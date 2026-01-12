"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BarChart3, FileText, Plus, MoreVertical, Play, Pause, Eye, Edit, Calendar } from "lucide-react"
import { mockScheduledExports } from "../transactions/data/export-data"
import { formatDistanceToNow } from "date-fns"

export default function FinancialReportsPage() {
  const activeSchedules = mockScheduledExports.filter((s) => s.status === "active")
  const pausedSchedules = mockScheduledExports.filter((s) => s.status === "paused")

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">Financial Reports</h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
          <Button variant="outline" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Quick Reports</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Daily Reconciliation
              </CardTitle>
              <CardDescription>All transactions • Today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <div>234 transactions</div>
                <div>€12,345.80 total</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  Generate Report
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Schedule Daily
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Summary
              </CardTitle>
              <CardDescription>Revenue breakdown • This month</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <div>€87,456.50 total</div>
                <div>1,234 transactions</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  Generate Report
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Schedule Monthly
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tax Report (VAT)
              </CardTitle>
              <CardDescription>VAT-eligible • This quarter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <div>€15,741.17 VAT</div>
                <div>1,123 transactions</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1">
                  Generate Report
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Schedule Quarterly
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scheduled Reports */}
      {activeSchedules.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Scheduled Reports ({activeSchedules.length})</h2>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Schedule New Report
            </Button>
          </div>

          {activeSchedules.map((schedule) => (
            <Card key={schedule.scheduleId}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Calendar className="h-3 w-3 mr-1" />
                          {schedule.schedule.frequency}
                        </Badge>
                        <span className="font-medium">{schedule.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {schedule.schedule.frequency.charAt(0).toUpperCase() + schedule.schedule.frequency.slice(1)} at{" "}
                        {schedule.schedule.time} • Email to{" "}
                        {schedule.configuration.delivery.email?.recipients[0] || "recipients"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last sent: {formatDistanceToNow(new Date(schedule.lastRun!.runAt))} ago • Next:{" "}
                        {new Date(schedule.nextRun!).toLocaleDateString()} at {schedule.schedule.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Last Report
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Schedule
                    </Button>
                    <Button variant="outline" size="sm">
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Paused Schedules */}
      {pausedSchedules.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Paused Schedules ({pausedSchedules.length})</h2>

          {pausedSchedules.map((schedule) => (
            <Card key={schedule.scheduleId} className="border-muted">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Paused</Badge>
                        <span className="font-medium">{schedule.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Status: Paused by {schedule.pausedBy} on {new Date(schedule.pausedAt!).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Reason: "{schedule.pauseReason}"</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Last run: {formatDistanceToNow(new Date(schedule.lastRun!.runAt))} ago • Status: ✓ Success
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Would run next: {new Date(schedule.nextRun!).toLocaleDateString()} at {schedule.schedule.time}{" "}
                        (if resumed)
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Play className="mr-2 h-4 w-4" />
                      Resume
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
