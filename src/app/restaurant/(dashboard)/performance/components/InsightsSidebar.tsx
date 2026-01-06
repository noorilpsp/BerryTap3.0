"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { X, Maximize2, Minimize2, ChevronDown, ChevronRight, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  activeAlerts, 
  topPerformers, 
  needsAttention, 
  currentShift, 
  previousShift, 
  dailyGoals, 
  activityFeed, 
  smartSuggestions 
} from "../lib/mockData"
import { cn } from "@/lib/utils"

type TabType = "alerts" | "top" | "needs" | "more"

export function InsightsSidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>("alerts")
  const [isOpen, setIsOpen] = useState(false)

  const tabs = [
    { id: "alerts" as const, label: "🚨 Alerts", badge: activeAlerts.length },
    { id: "top" as const, label: "🏆 Top", badge: null },
    { id: "needs" as const, label: "📉 Needs", badge: needsAttention.length },
    { id: "more" as const, label: "📊 More", badge: null }
  ]

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <h2 className="text-lg font-semibold">Insights & Analytics</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-1 border-b p-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            className="flex-1 text-xs"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.badge !== null && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                {tab.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {activeTab === "alerts" && <AlertsSection />}
          {activeTab === "top" && <TopPerformersSection />}
          {activeTab === "needs" && <NeedsAttentionSection />}
          {activeTab === "more" && <MoreSection />}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <>
      {/* Mobile Sheet Trigger */}
      <div className="fixed bottom-4 right-4 z-40 lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="h-14 w-14 rounded-full shadow-lg">
              <Menu className="h-6 w-6" />
              {activeAlerts.length > 0 && (
                <Badge className="absolute -right-1 -top-1 h-6 w-6 rounded-full p-0 text-xs">
                  {activeAlerts.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full p-0 sm:max-w-md">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden h-full border-l bg-background transition-all duration-300 lg:block",
          isExpanded ? "w-[500px]" : "w-[320px]"
        )}
      >
        <SidebarContent />
      </div>
    </>
  )
}

function AlertsSection() {
  const criticalCount = activeAlerts.filter((a) => a.severity === "high").length
  const mediumCount = activeAlerts.filter((a) => a.severity === "medium").length
  const lowCount = activeAlerts.filter((a) => a.severity === "low").length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">🚨 Active Alerts ({activeAlerts.length})</h3>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
          View All →
        </Button>
      </div>

      <div className="space-y-3">
        {activeAlerts.map((alert) => (
          <Alert key={alert.id} className="relative">
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <AlertTitle className="text-sm font-semibold">
                  {alert.severityIcon} {alert.severity.toUpperCase()} PRIORITY
                </AlertTitle>
              </div>
              <AlertDescription className="space-y-2">
                <p className="font-medium">{alert.title}</p>
                <p className="text-sm">{alert.message}</p>
                <p className="whitespace-pre-line text-xs text-muted-foreground">
                  {alert.details}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {alert.actions.map((action, idx) => (
                    <Button key={idx} variant="outline" size="sm" className="h-7 text-xs">
                      {action.label}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">📍 {alert.age}</p>
              </AlertDescription>
            </div>
          </Alert>
        ))}
      </div>

      <div className="flex gap-4 text-sm">
        <span>🔴 {criticalCount} Critical</span>
        <span>🟡 {mediumCount} Medium</span>
        <span>🟢 {lowCount} Low</span>
      </div>
    </div>
  )
}

function TopPerformersSection() {
  const medalEmoji = ["🥇", "🥈", "🥉"]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">🏆 Top Performers</h3>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
          View All →
        </Button>
      </div>

      <div className="space-y-3">
        {topPerformers.map((performer) => (
          <Card key={performer.staffId}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <img
                  src={performer.avatar || "/placeholder.svg"}
                  alt={performer.name}
                  className="h-12 w-12 rounded-full"
                />
                <div className="flex-1">
                  <CardTitle className="text-sm">
                    {medalEmoji[performer.rank - 1]} {performer.rank}. {performer.name}
                  </CardTitle>
                  <CardDescription className="text-xs">{performer.role}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              <div className="space-y-1 text-sm">
                <p>{performer.metrics}</p>
                {performer.detailedMetrics.tips !== undefined && (
                  <p>
                    ${performer.detailedMetrics.tips} tips • {performer.detailedMetrics.rating}⭐
                    rating
                  </p>
                )}
                {performer.detailedMetrics.hours !== undefined && (
                  <p>
                    {performer.detailedMetrics.hours} hours • $
                    {performer.detailedMetrics.revenuePerHour?.toFixed(2)}/hr revenue
                  </p>
                )}
                {performer.detailedMetrics.avgPrepTime && (
                  <p>
                    {performer.detailedMetrics.avgPrepTime} avg prep •{" "}
                    {performer.detailedMetrics.ordersPerHour} orders/hr
                  </p>
                )}
              </div>

              <Progress value={performer.score} className="h-2" />

              <div className="flex flex-wrap gap-1">
                {performer.badges.map((badge, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {badge}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-7 flex-1 text-xs">
                  View Profile
                </Button>
                <Button variant="outline" size="sm" className="h-7 flex-1 text-xs">
                  Send Kudos
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function NeedsAttentionSection() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">📉 Needs Attention</h3>
        <Button variant="link" size="sm" className="h-auto p-0 text-xs">
          View All →
        </Button>
      </div>

      <div className="space-y-3">
        {needsAttention.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {item.icon} {item.title}
              </CardTitle>
              <CardDescription className="text-xs">{item.metric}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pb-4">
              {item.details && (
                <div className="space-y-1 text-xs text-muted-foreground">
                  {typeof item.details === "object" &&
                    Object.entries(item.details)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <p key={key}>
                          {key}: {String(value)}
                        </p>
                      ))}
                </div>
              )}

              {item.suggestedActions && (
                <div className="space-y-1">
                  <p className="text-xs font-medium">💡 Suggested Actions:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {item.suggestedActions.map((action, idx) => (
                      <li key={idx}>• {action.action}</li>
                    ))}
                  </ul>
                </div>
              )}

              {item.rootCause && (
                <div className="space-y-1">
                  <p className="text-xs font-medium">💡 Root Cause Analysis:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {item.rootCause.map((cause, idx) => (
                      <li key={idx}>• {cause}</li>
                    ))}
                  </ul>
                </div>
              )}

              {item.recommendations && (
                <div className="space-y-1">
                  <p className="text-xs font-medium">💡 Recommended:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {item.recommendations.map((rec, idx) => (
                      <li key={idx}>• {rec.action}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {item.actions.map((action, idx) => (
                  <Button key={idx} variant="outline" size="sm" className="h-7 text-xs">
                    {action.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function MoreSection() {
  const [openSections, setOpenSections] = useState<string[]>(["shift", "goals"])

  const toggleSection = (section: string) => {
    setOpenSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    )
  }

  return (
    <div className="space-y-4">
      {/* Current Shift Overview */}
      <Collapsible open={openSections.includes("shift")} onOpenChange={() => toggleSection("shift")}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
            <h3 className="font-semibold">📊 Shift Highlights</h3>
            {openSections.includes("shift") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Current Shift: {currentShift.name}</CardTitle>
              <CardDescription className="text-xs">
                ⏰ {currentShift.startTime} - {currentShift.endTime}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>⏱️ Time Elapsed: {currentShift.elapsedLabel} / 6h 00m</span>
                  <span>{currentShift.progress}%</span>
                </div>
                <Progress value={currentShift.progress} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>
                    📦 Orders: {currentShift.ordersCompleted} / {currentShift.ordersTarget}
                  </span>
                  <span>{currentShift.ordersProgress}%</span>
                </div>
                <Progress value={currentShift.ordersProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">{currentShift.ordersPace}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>
                    💰 Revenue: ${currentShift.revenue.toFixed(2)} / $
                    {currentShift.revenueTarget?.toFixed(2)}
                  </span>
                  <span>{currentShift.revenueProgress}%</span>
                </div>
                <Progress value={currentShift.revenueProgress} className="h-2" />
                <p className="text-xs text-green-600">
                  Projection: ${currentShift.revenueProjection?.toFixed(2)} (
                  {currentShift.revenueProjectionPercent}% of target) ✅
                </p>
              </div>

              <div className="space-y-1 text-xs">
                <p>
                  👥 Active Staff: {currentShift.activeStaff} / {currentShift.scheduledStaff}{" "}
                  scheduled
                </p>
                <p>
                  • {currentShift.staffBreakdown?.servers} Servers •{" "}
                  {currentShift.staffBreakdown?.kitchen} Kitchen • {currentShift.staffBreakdown?.bar}{" "}
                  Bar
                </p>
                {currentShift.upcomingBreaks?.map((brk, idx) => (
                  <p key={idx}>
                    • {brk.staffName} (break in {brk.timeUntil})
                  </p>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>🎯 Shift Efficiency: {currentShift.efficiency}%</span>
                  <span>{currentShift.efficiency}%</span>
                </div>
                <Progress value={currentShift.efficiency} className="h-2" />
                <p className="text-xs text-green-600">
                  Above target ({currentShift.efficiencyTarget}%) by{" "}
                  {currentShift.efficiencyDelta} points 🎉
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-medium">Previous Shift: {previousShift.name}</p>
                <p className="text-xs text-muted-foreground">
                  {previousShift.startTime} - {previousShift.endTime}
                </p>
                <div className="space-y-1 text-xs">
                  <p>
                    ✅ Orders: {previousShift.ordersCompleted} completed (
                    {previousShift.ordersCompletionRate}% completion)
                  </p>
                  <p>
                    ✅ Revenue: ${previousShift.revenue.toFixed(2)} ({previousShift.revenuePercent}%
                    of target)
                  </p>
                  <p>
                    ✅ Efficiency: {previousShift.efficiency}% (
                    {previousShift.efficiency - previousShift.efficiencyTarget}% above target)
                  </p>
                  <p>
                    ⭐ Peak hour: {previousShift.peakHour?.time} ($
                    {previousShift.peakHour?.revenue} revenue)
                  </p>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full text-xs">
                View Full Shift Report →
              </Button>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {/* Daily Goals */}
      <Collapsible open={openSections.includes("goals")} onOpenChange={() => toggleSection("goals")}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
            <h3 className="font-semibold">🎯 Daily Goals</h3>
            {openSections.includes("goals") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-4">
          {dailyGoals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  {goal.icon} {goal.metric}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {goal.unit === "currency" && "$"}
                      {goal.current.toFixed(goal.unit === "currency" ? 0 : goal.unit === "rating" ? 1 : 0)}{" "}
                      / {goal.unit === "currency" && "$"}
                      {goal.target.toFixed(goal.unit === "currency" ? 0 : goal.unit === "rating" ? 1 : 0)}
                      {goal.unit === "percentage" && "%"}
                    </span>
                    <span>{goal.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>

                {goal.projectionLabel && (
                  <p className="text-xs text-green-600">📈 {goal.projectionLabel}</p>
                )}

                {goal.message && <p className="text-xs text-yellow-600">💡 {goal.message}</p>}

                {goal.remainingLabel && (
                  <p className="text-xs text-muted-foreground">📊 {goal.remainingLabel}</p>
                )}

                {goal.timeRemaining && (
                  <p className="text-xs text-muted-foreground">⏰ Time remaining: {goal.timeRemaining}</p>
                )}

                {goal.paceData && (
                  <p className="text-xs text-green-600">Pace: {goal.paceData.paceLabel} ✅</p>
                )}

                {goal.focusArea && (
                  <p className="text-xs text-muted-foreground">🎯 Focus: {goal.focusArea}</p>
                )}

                {goal.trendLabel && (
                  <p className="text-xs text-muted-foreground">Trend: {goal.trendLabel}</p>
                )}

                {goal.leaders && (
                  <p className="text-xs text-muted-foreground">🎯 {goal.leaders}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Activity Feed */}
      <Collapsible
        open={openSections.includes("activity")}
        onOpenChange={() => toggleSection("activity")}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
            <h3 className="font-semibold">📰 Recent Activity</h3>
            {openSections.includes("activity") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-4">
          {activityFeed.map((item) => (
            <div key={item.id} className="space-y-1 border-b pb-2 last:border-0">
              <p className="text-sm">
                {item.icon} {item.message}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.age} • {item.details}
              </p>
              {item.actions && (
                <div className="flex gap-2 pt-1">
                  {item.actions.map((action, idx) => (
                    <Button key={idx} variant="outline" size="sm" className="h-6 text-xs">
                      {action.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-between pt-2">
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Load More
            </Button>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Filter by Type ▼
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Smart Suggestions */}
      <Collapsible
        open={openSections.includes("suggestions")}
        onOpenChange={() => toggleSection("suggestions")}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 hover:bg-transparent">
            <h3 className="font-semibold">💡 Smart Suggestions</h3>
            {openSections.includes("suggestions") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-4">
          {smartSuggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm">
                    {suggestion.icon} {suggestion.title}
                  </CardTitle>
                  <Badge
                    variant={
                      suggestion.priority === "high"
                        ? "destructive"
                        : suggestion.priority === "medium"
                          ? "default"
                          : "secondary"
                    }
                    className="text-xs"
                  >
                    {suggestion.priority.toUpperCase()}
                  </Badge>
                </div>
                <CardDescription className="text-xs">{suggestion.analysis}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium">📊 Recommendation:</p>
                  <p className="text-xs text-muted-foreground">{suggestion.recommendation}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium">💰 Expected Impact:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {Object.entries(suggestion.expectedImpact)
                      .filter(([key]) => key.endsWith("Label"))
                      .map(([key, value]) => (
                        <li key={key}>• {String(value)}</li>
                      ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">💵 Cost:</p>
                    <p className="font-medium">{suggestion.costLabel}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">📈 ROI:</p>
                    <p className="font-medium">{suggestion.roiLabel}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {suggestion.actions.map((action, idx) => (
                    <Button key={idx} variant="outline" size="sm" className="h-7 text-xs">
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}
