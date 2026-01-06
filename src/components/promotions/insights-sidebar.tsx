"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { AlertCircle, AlertTriangle, TrendingUp, TrendingDown, Clock, Award, Target, Sparkles, MoreVertical, Settings, Eye, ArrowRight, ActivityIcon, Pause, Play, Edit, Plus, CheckCircle, Info, RefreshCw, Zap, Menu } from 'lucide-react'
import { cn } from "@/lib/utils"
import { activeAlerts, topPerformers, recommendations, recentActivity, liveMetrics, quickStats } from "@/lib/insights-data"
import { useIsMobile } from "@/hooks/use-mobile"

const alertIcons = {
  budget_critical: AlertCircle,
  low_performance: TrendingDown,
  expiring_soon: Clock,
  high_redemption: TrendingUp,
  conflict_detected: AlertTriangle,
  milestone_reached: Award,
  cannibalization_risk: TrendingDown,
}

const alertBadges = {
  urgent: { emoji: "🔴", label: "URGENT", color: "destructive" },
  warning: { emoji: "🟡", label: "WARNING", color: "warning" },
  info: { emoji: "🟠", label: "INFO", color: "default" },
  success: { emoji: "✅", label: "SUCCESS", color: "success" },
}

export function InsightsSidebar() {
  const [alerts, setAlerts] = useState(activeAlerts)
  const [showAllAlerts, setShowAllAlerts] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState([30])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const isMobile = useIsMobile()

  const visibleAlerts = showAllAlerts ? alerts : alerts.slice(0, 3)
  const remainingAlerts = alerts.length - 3

  const handleDismissAlert = (alertId: string) => {
    setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, status: "dismissed" as const } : a)))
  }

  const handleSnoozeAlert = (alertId: string) => {
    setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, status: "snoozed" as const } : a)))
  }

  const handleMarkRead = (alertId: string) => {
    setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, status: "read" as const } : a)))
  }

  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      setIsRefreshing(true)
      setTimeout(() => setIsRefreshing(false), 300)
    }, refreshInterval[0] * 1000)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval])

  const SidebarContent = () => (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-6 border-b">
        <div className="flex items-center gap-2">
          <ActivityIcon className="h-5 w-5 text-chart-1" />
          <h2 className="text-lg font-semibold">Insights</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setSettingsOpen(true)} aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Live Metrics */}
          <section role="region" aria-labelledby="live-metrics-title">
            <div className="flex items-center justify-between mb-3">
              <h3 id="live-metrics-title" className="text-sm font-semibold text-muted-foreground">
                LIVE METRICS
              </h3>
              <RefreshCw className={cn("h-3 w-3 text-muted-foreground", isRefreshing && "animate-spin")} />
            </div>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                    </div>
                    <span className="text-sm font-medium">Live Now</span>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    {liveMetrics.activePromotions}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">Active promotions running</p>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-chart-3" />
                    <span className="text-sm font-medium">Hot Streak</span>
                  </div>
                  <p className="text-xl font-bold">{liveMetrics.liveRedemptions.last10min} redemptions</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">in last 10 min</span>
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {liveMetrics.liveRedemptions.vsAverage}% vs avg
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Alerts */}
          <section role="region" aria-labelledby="alerts-title">
            <div className="flex items-center justify-between mb-3">
              <h3 id="alerts-title" className="text-sm font-semibold text-muted-foreground">
                ALERTS ({alerts.filter((a) => a.status !== "dismissed").length})
              </h3>
            </div>

            <div className="space-y-3">
              {visibleAlerts
                .filter((alert) => alert.status !== "dismissed")
                .map((alert) => {
                  const AlertIcon = alertIcons[alert.type]
                  const badge = alertBadges[alert.priority]

                  return (
                    <Card
                      key={alert.id}
                      className={cn(
                        "transition-all duration-150 hover:shadow-md",
                        alert.status === "unread" && "bg-primary/5 border-l-4 border-l-primary",
                        alert.status === "read" && "border-l-4 border-l-border",
                        alert.status === "snoozed" && "opacity-60 bg-muted/50"
                      )}
                      role="alert"
                      aria-live={alert.priority === "urgent" ? "assertive" : "polite"}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            <AlertIcon className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: badge.color === "destructive" ? "hsl(var(--destructive))" : "inherit" }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge variant={badge.color as any} className="text-xs">
                                  {badge.emoji} {badge.label}
                                </Badge>
                              </div>
                              <h4 className={cn("text-sm mb-1", alert.status === "unread" && "font-semibold")}>{alert.title}</h4>
                              <p className="text-xs text-muted-foreground">{alert.message}</p>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" aria-label="Alert actions">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleMarkRead(alert.id)}>Mark as Read</DropdownMenuItem>
                              {alert.snoozable && (
                                <>
                                  <DropdownMenuItem onClick={() => handleSnoozeAlert(alert.id)}>Snooze for 1 hour</DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleSnoozeAlert(alert.id)}>Snooze for 1 day</DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem onClick={() => handleDismissAlert(alert.id)}>Dismiss</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>View Full Details</DropdownMenuItem>
                              <DropdownMenuItem>Share with Team</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {alert.actions.map((action, idx) => (
                            <Button key={idx} variant={action.variant} size="sm" className="text-xs h-7">
                              {action.label}
                            </Button>
                          ))}
                        </div>

                        <p className="text-xs text-muted-foreground">{alert.timeAgo}</p>
                      </CardContent>
                    </Card>
                  )
                })}

              {remainingAlerts > 0 && !showAllAlerts && (
                <Button variant="ghost" className="w-full" onClick={() => setShowAllAlerts(true)}>
                  View All Alerts ({remainingAlerts} more)
                </Button>
              )}
            </div>
          </section>

          {/* Top Performers */}
          <section role="region" aria-labelledby="top-performers-title">
            <div className="flex items-center justify-between mb-3">
              <h3 id="top-performers-title" className="text-sm font-semibold text-muted-foreground">
                TOP PERFORMERS
              </h3>
            </div>

            <div className="space-y-2">
              {topPerformers.map((performer) => (
                <Card key={`performer-${performer.rank}-${performer.promotionId}`} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl flex-shrink-0">{performer.medal}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold truncate">{performer.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span>Revenue: +€{performer.metrics.revenueLift.toFixed(0)}</span>
                              <span>•</span>
                              <span>ROI: {performer.metrics.roi}x</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 px-2" aria-label={`View ${performer.name} details`}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <Progress value={performer.score} max={performer.scoreMax} className="h-2" />
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {performer.score}/{performer.scoreMax}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {performer.badge}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Recommendations */}
          <section role="region" aria-labelledby="recommendations-title">
            <div className="flex items-center justify-between mb-3">
              <h3 id="recommendations-title" className="text-sm font-semibold text-muted-foreground">
                RECOMMENDATIONS
              </h3>
            </div>

            <div className="space-y-3">
              {recommendations.map((rec) => {
                const Icon = rec.icon === "Sparkles" ? Sparkles : Target
                return (
                  <Card key={rec.id} className="border-chart-4/30 bg-gradient-to-br from-chart-4/5 to-transparent">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <Icon className="h-4 w-4 mt-0.5 text-chart-4" />
                        <div className="flex-1">
                          <Badge variant="secondary" className="text-xs mb-2">
                            {rec.type === "ai_suggestion" ? "💡 AI Suggestion" : "🎯 Optimization"}
                          </Badge>
                          <h4 className="text-sm font-semibold mb-1">{rec.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium">Projected: +{rec.impact.estimate}{rec.impact.unit}</span>
                            <Badge variant="outline" className="text-xs">
                              {rec.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {rec.actions.map((action, idx) => (
                          <Button key={idx} variant={action.variant} size="sm" className="text-xs h-7">
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* Recent Activity */}
          <section role="region" aria-labelledby="activity-title">
            <div className="flex items-center justify-between mb-3">
              <h3 id="activity-title" className="text-sm font-semibold text-muted-foreground">
                RECENT ACTIVITY
              </h3>
            </div>

            <Card>
              <CardContent className="p-0">
                {recentActivity.map((activity, idx) => {
                  const Icon = activity.icon === "Pause" ? Pause : activity.icon === "Award" ? Award : activity.icon === "Edit" ? Edit : activity.icon === "Plus" ? Plus : AlertTriangle

                  return (
                    <div key={activity.id} className={cn("px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer", idx !== recentActivity.length - 1 && "border-b")}>
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <Icon className="h-4 w-4" style={{ color: activity.iconColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.timeAgo}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Button variant="ghost" className="w-full mt-2">
              View All Activity
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </section>

          {/* Quick Stats */}
          <section role="region" aria-labelledby="quick-stats-title">
            <div className="flex items-center justify-between mb-3">
              <h3 id="quick-stats-title" className="text-sm font-semibold text-muted-foreground">
                QUICK STATS
              </h3>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Today's Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Redemptions</span>
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />+{quickStats.today.redemptionsDelta}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">{quickStats.today.redemptions}</p>
                  <p className="text-xs text-muted-foreground">vs yesterday</p>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Revenue Impact</span>
                    <Badge variant="secondary" className="text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />+€{quickStats.today.revenueDelta}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">€{quickStats.today.revenue}</p>
                  <p className="text-xs text-muted-foreground">vs yesterday</p>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Active Now</span>
                    <span className="font-semibold">{quickStats.today.activePromotions} promotions</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Peak hour</span>
                    <span className="font-semibold">
                      {quickStats.today.peakHour} ({quickStats.today.peakRedemptions} redemptions)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )

  // Mobile: Render as Sheet
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50">
            <ActivityIcon className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: Render as sticky sidebar
  return (
    <>
      <aside className="w-[400px] border-l bg-background sticky top-0 h-screen flex-shrink-0 flex flex-col" role="complementary" aria-label="Insights sidebar">
        <SidebarContent />
      </aside>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Insights Settings</DialogTitle>
            <DialogDescription>Configure how insights and alerts are displayed</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Notifications</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="browser-notifications">Browser notifications</Label>
                  <Switch id="browser-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-alerts">Email alerts</Label>
                  <Switch id="email-alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-alerts">SMS for urgent alerts</Label>
                  <Switch id="sms-alerts" />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Refresh Rate</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-refresh">Auto-refresh</Label>
                  <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
                </div>
                {autoRefresh && (
                  <div className="space-y-2">
                    <Label>Every {refreshInterval[0]} seconds</Label>
                    <Slider value={refreshInterval} onValueChange={setRefreshInterval} min={10} max={120} step={10} className="w-full" />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Display</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-live-metrics">Show live metrics</Label>
                  <Switch id="show-live-metrics" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-recommendations">Show recommendations</Label>
                  <Switch id="show-recommendations" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-activity">Show recent activity</Label>
                  <Switch id="show-activity" defaultChecked />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setSettingsOpen(false)}>Save Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
