"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Send, Edit, Copy, Archive, Trash2, CheckCircle, ArrowLeft, Download } from "lucide-react"
import { mockActivityData } from "./activity-mock-data"

export default function ActivityLogPage() {
  const [actionFilter, setActionFilter] = useState("all")

  const { activities } = mockActivityData

  const filteredActivities = actionFilter === "all" ? activities : activities.filter((a) => a.type === actionFilter)

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Campaign Activity Log</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="duplicated">Duplicated</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-3">
        {filteredActivities.map((activity, index) => (
          <Card key={activity.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                  <ActivityIcon type={activity.type} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{activity.userInitials}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{activity.userName}</span>
                        <ActivityBadge type={activity.type} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description} <strong>"{activity.campaignName}"</strong>
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>

                  {/* Additional Details */}
                  {activity.details && (
                    <div className="mt-2 p-3 bg-muted/30 rounded-lg text-sm space-y-1">
                      {activity.details.map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-muted-foreground">•</span>
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activity.comment && (
                    <div className="mt-2 p-3 bg-primary/5 rounded-lg text-sm">
                      <span className="text-muted-foreground">Comment:</span> "{activity.comment}"
                    </div>
                  )}

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-3">
                    <Button variant="ghost" size="sm">
                      View Campaign
                    </Button>
                    {activity.type === "sent" && (
                      <Button variant="ghost" size="sm">
                        View Report
                      </Button>
                    )}
                    {activity.type === "archived" && (
                      <Button variant="ghost" size="sm">
                        Restore
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <Button variant="outline">Load More Activity</Button>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-4">Showing last 30 days of activity</p>
    </div>
  )
}

function ActivityIcon({ type }: { type: string }) {
  const icons = {
    created: FileText,
    submitted: Send,
    approved: CheckCircle,
    sent: Send,
    duplicated: Copy,
    archived: Archive,
    deleted: Trash2,
    edited: Edit,
  }

  const Icon = icons[type as keyof typeof icons] || FileText

  return <Icon className="w-5 h-5 text-primary" />
}

function ActivityBadge({ type }: { type: string }) {
  const config = {
    created: { label: "Created", variant: "secondary" as const },
    submitted: { label: "Submitted", variant: "default" as const },
    approved: { label: "Approved", variant: "default" as const },
    sent: { label: "Sent", variant: "default" as const },
    duplicated: { label: "Duplicated", variant: "secondary" as const },
    archived: { label: "Archived", variant: "secondary" as const },
    deleted: { label: "Deleted", variant: "destructive" as const },
    edited: { label: "Edited", variant: "secondary" as const },
  }

  const { label, variant } = config[type as keyof typeof config] || config.created

  return (
    <Badge variant={variant} className="text-xs">
      {label}
    </Badge>
  )
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
