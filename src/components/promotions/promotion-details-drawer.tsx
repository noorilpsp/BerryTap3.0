"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, X, Edit, MoreVertical, Download, Share2, Copy, Trash2, Save, TrendingUp, TrendingDown, ArrowUp, Users, Target, Euro, Calendar, Clock, BarChart3, Star, AlertCircle, CheckCircle, FileText, Play, Pause, Plus, Award, AlertTriangle, Info } from 'lucide-react'
import { cn } from "@/lib/utils"
import { PromotionDetails, AuditLogEvent, mockPromotionDetails, mockAuditLog } from "@/lib/promotion-details-data"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface PromotionDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  promotionId?: string
}

export function PromotionDetailsDrawer({ open, onOpenChange, promotionId }: PromotionDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditMode, setIsEditMode] = useState(false)
  const [promotion, setPromotion] = useState<PromotionDetails>(mockPromotionDetails)
  const { toast } = useToast()

  const handleSave = () => {
    setIsEditMode(false)
    toast({ title: "Changes saved successfully" })
  }

  const handleExport = (format: string) => {
    toast({ title: `Exporting as ${format.toUpperCase()}...` })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[90vw] sm:max-w-[800px] p-0 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        aria-describedby="drawer-description"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b bg-card">
          <SheetHeader className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Go back">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex-1 min-w-0">
                  <SheetTitle id="drawer-title" className="text-xl truncate">
                    {promotion.name}
                  </SheetTitle>
                  <p id="drawer-description" className="sr-only">
                    Detailed view and analytics for {promotion.name}. Use tab to navigate between sections.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isEditMode ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditMode(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExport("csv")}>
                          <Download className="mr-2 h-4 w-4" />
                          Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport("pdf")}>
                          <FileText className="mr-2 h-4 w-4" />
                          Export as PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport("json")}>
                          <FileText className="mr-2 h-4 w-4" />
                          Export as JSON
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
                <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} aria-label="Close drawer">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Status Bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <Badge
                variant={promotion.statusColor === "green" ? "default" : "secondary"}
                className={cn(
                  "gap-1",
                  promotion.statusColor === "green" && "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                  promotion.statusColor === "blue" && "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                  promotion.statusColor === "yellow" && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                  promotion.statusColor === "red" && "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                )}
              >
                {promotion.statusDot} {promotion.statusLabel}
              </Badge>
              <span className="text-sm text-muted-foreground">• {promotion.statusSubtext}</span>
            </div>
            <span className="text-sm text-muted-foreground">Last updated: 2m ago</span>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b rounded-none">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="analytics" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="customers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  Customers
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  Settings
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                  History
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            <Tabs value={activeTab} className="w-full">
              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Quick Stats */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-1">Redemptions</div>
                        <div className="text-2xl font-bold">
                          {promotion.limits.currentRedemptions} / {promotion.limits.maxRedemptions}
                        </div>
                        <Progress value={promotion.limits.redemptionPercent} className="mt-2 h-2" />
                        <div className="text-xs text-muted-foreground mt-1">{promotion.limits.redemptionPercent.toFixed(0)}%</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-1">Revenue Lift</div>
                        <div className="text-2xl font-bold text-green-600">+€{promotion.performance.revenueLift.toFixed(0)}</div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                          <ArrowUp className="h-3 w-3" />
                          {promotion.performance.revenueLiftPercent}%
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-1">Avg Discount</div>
                        <div className="text-2xl font-bold">€{promotion.performance.avgDiscountAmount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground mt-2">per order</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-1">ROI</div>
                        <div className="text-2xl font-bold">{promotion.performance.roi.toFixed(1)}x</div>
                        <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          +{promotion.performance.roiDelta.toFixed(1)}x
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                {/* Promotion Details */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">Promotion Details</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Type:</span> {promotion.typeLabel} ({promotion.discountValue}
                      {promotion.discountUnit} off)
                    </div>
                    <div>
                      <span className="font-medium">Target:</span> {promotion.target.type === "category" ? "Category → " : ""}
                      {promotion.target.categoryName} ({promotion.target.itemCount} items)
                      {promotion.target.items && (
                        <div className="mt-2 ml-4 text-muted-foreground">
                          • {promotion.target.items.map((item) => item.name).join(", ")}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Schedule:</span> {promotion.schedule.recurringType}, {promotion.schedule.timeWindows[0].start} -{" "}
                      {promotion.schedule.timeWindows[0].end}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {promotion.schedule.startDate} - {promotion.schedule.endDate} ({promotion.schedule.durationDays} days)
                    </div>
                    <div>
                      <span className="font-medium">Days active:</span> {promotion.schedule.daysElapsed} days elapsed, {promotion.schedule.daysRemaining} days remaining
                    </div>
                  </div>
                </section>

                {/* Limits & Constraints */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">Limits & Constraints</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>
                        Max redemptions: {promotion.limits.maxRedemptions} total ({promotion.limits.currentRedemptions} used, {promotion.limits.remainingRedemptions}{" "}
                        remaining)
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>
                        Per customer: {promotion.limits.perCustomerLimit} per {promotion.limits.perCustomerPeriod}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>
                        Budget cap: €{promotion.limits.budgetCap} (€{promotion.limits.budgetUsed.toFixed(0)} used, €{promotion.limits.budgetRemaining.toFixed(0)} remaining)
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>•</span>
                      <span>Status: {promotion.limits.autoPauseOnBudget ? "Will auto-pause at budget limit" : "No auto-pause"}</span>
                    </div>
                  </div>
                </section>

                {/* Hourly Pattern */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">Hourly Redemption Pattern (Last 7 Days)</h3>
                  <div className="space-y-2">
                    {promotion.hourlyPattern.map((hour) => (
                      <div key={hour.hour} className="flex items-center gap-4">
                        <span className="text-sm font-medium w-12">{hour.hourLabel}</span>
                        <div className="flex-1">
                          <Progress value={(hour.redemptions / 67) * 100} className="h-4" />
                        </div>
                        <span className="text-sm text-muted-foreground w-32">
                          {hour.redemptions} redemptions
                        </span>
                        <span className="text-xs text-muted-foreground w-24">avg {hour.avgPerDay}/day</span>
                        {hour.isPeak && <span className="text-xs">🔥 Peak</span>}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Top Items */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">Top Redeemed Items</h3>
                  <div className="space-y-4">
                    {promotion.topItems.map((item) => (
                      <div key={item.itemId} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">
                              {item.rank}. {item.itemName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.redemptions} redemptions • €{item.revenueLift.toFixed(0)} revenue lift • €{item.avgOrderValue.toFixed(2)} avg per order
                            </div>
                          </div>
                        </div>
                        <Progress value={item.percentOfTotal} className="h-2" />
                        <div className="text-xs text-muted-foreground">{item.percentOfTotal.toFixed(1)}% of total</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Customer Segments */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">Customer Segments</h3>
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>🆕</span>
                          <span className="font-medium">New Customers:</span>
                        </div>
                        <span className="font-semibold">
                          {promotion.customerSegments.newCustomers.count} ({promotion.customerSegments.newCustomers.percent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>🔄</span>
                          <span className="font-medium">Returning Customers:</span>
                        </div>
                        <span className="font-semibold">
                          {promotion.customerSegments.returningCustomers.count} ({promotion.customerSegments.returningCustomers.percent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>⭐</span>
                          <span className="font-medium">VIP/Loyalty Members:</span>
                        </div>
                        <span className="font-semibold">
                          {promotion.customerSegments.vipMembers.count} ({promotion.customerSegments.vipMembers.percent.toFixed(1)}%)
                        </span>
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        View Segment Details →
                      </Button>
                    </CardContent>
                  </Card>
                </section>

                {/* Performance Score */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">
                    Performance Score: {promotion.scoreBreakdown.total}/{promotion.scoreBreakdown.max} {"⭐".repeat(promotion.performance.rating)}{" "}
                    {promotion.performance.ratingLabel}
                  </h3>
                  <div className="space-y-3">
                    {promotion.scoreBreakdown.components.map((component) => (
                      <div key={component.name} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{component.name}:</span>
                          <span className="font-medium">
                            {component.score}/{component.max} pts ({component.percent.toFixed(0)}%)
                          </span>
                        </div>
                        <Progress value={component.percent} className="h-2" />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Metadata */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">Metadata</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Created by:</span> {promotion.createdBy.name} on{" "}
                      {new Date(promotion.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div>
                      <span className="font-medium">Last modified:</span> {promotion.lastModifiedBy.name} on{" "}
                      {new Date(promotion.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div>
                      <span className="font-medium">Promotion ID:</span> {promotion.id}
                    </div>
                    <div>
                      <span className="font-medium">Tags:</span>{" "}
                      <div className="inline-flex gap-2 mt-1">
                        {promotion.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => handleExport("pdf")}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Report
                  </Button>
                  <Button variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                  {promotion.status === "active" ? (
                    <Button variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause Promotion
                    </Button>
                  ) : (
                    <Button variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Activate Promotion
                    </Button>
                  )}
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="mt-0 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Button variant="outline" size="sm">
                    Last 7 Days
                  </Button>
                  <Button variant="outline" size="sm">
                    Last 30 Days
                  </Button>
                  <Button variant="default" size="sm">
                    All Time
                  </Button>
                  <Button variant="outline" size="sm">
                    Custom Range
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Daily Redemptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={promotion.dailyPerformance}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })} />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="redemptions" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>By Day of Week</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {promotion.dayOfWeekBreakdown.map((day) => (
                        <div key={day.day} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{day.day.substring(0, 3)}</span>
                            <span className="font-medium">
                              €{day.revenue.toFixed(0)} {day.isPeak && "🔥"}
                            </span>
                          </div>
                          <Progress value={(day.revenue / 218) * 100} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>By Time of Day</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {promotion.timeOfDayBreakdown.map((time) => (
                        <div key={time.hour} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{time.time}</span>
                            <span className="font-medium">
                              €{time.revenue.toFixed(0)} {time.isPeak && "🔥"}
                            </span>
                          </div>
                          <Progress value={time.percent} className="h-2" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Conversion Funnel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {promotion.conversionFunnel.map((stage, index) => (
                      <div key={stage.stage} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>{stage.stage}:</span>
                          <span className="font-medium">
                            {stage.count.toLocaleString()} customers
                            {index > 0 && <span className="text-muted-foreground ml-2">{stage.percent.toFixed(1)}%</span>}
                          </span>
                        </div>
                        <Progress value={stage.percent} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Comparative Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">vs Previous Period ({promotion.comparison.previousPeriod.dateRange})</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Redemptions:</span>
                          <span className="flex items-center gap-2 text-green-600">
                            +{promotion.comparison.previousPeriod.deltaRedemptions.toFixed(1)}%
                            <span className="text-muted-foreground">
                              ({promotion.performance.redemptions} vs {promotion.comparison.previousPeriod.redemptions})
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Revenue:</span>
                          <span className="flex items-center gap-2 text-green-600">
                            +{promotion.comparison.previousPeriod.deltaRevenue.toFixed(1)}%
                            <span className="text-muted-foreground">
                              (€{promotion.performance.revenueLift.toFixed(0)} vs €{promotion.comparison.previousPeriod.revenue.toFixed(0)})
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>ROI:</span>
                          <span className="flex items-center gap-2 text-green-600">
                            +{promotion.comparison.previousPeriod.deltaROI.toFixed(1)}%
                            <span className="text-muted-foreground">
                              ({promotion.performance.roi.toFixed(1)}x vs {promotion.comparison.previousPeriod.roi.toFixed(1)}x)
                            </span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">vs Similar Promotions</h4>
                      <div className="space-y-2 text-sm">
                        <div>• {promotion.comparison.similarPromotions.deltaRedemptionRate.toFixed(0)}% above average redemption rate</div>
                        <div>• {promotion.comparison.similarPromotions.deltaRevenueLift.toFixed(0)}% above average revenue lift</div>
                        <div>• Top {100 - promotion.comparison.similarPromotions.percentile}% in category performance</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Customers Tab */}
              <TabsContent value="customers" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Customer Segments</CardTitle>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Rules
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Currently targeting: All Customers</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>🆕</span>
                          <span className="font-semibold">New Customers</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {promotion.customerSegments.newCustomers.count} customers ({promotion.customerSegments.newCustomers.percent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>Avg order value: €{promotion.customerSegments.newCustomers.avgOrderValue.toFixed(2)}</div>
                        <div>Avg redemptions: {promotion.customerSegments.newCustomers.avgRedemptions.toFixed(1)} per customer</div>
                        <div>Total revenue: €{promotion.customerSegments.newCustomers.totalRevenue.toFixed(0)}</div>
                      </div>
                      <Button variant="link" className="px-0 mt-2">
                        View Customer List
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>🔄</span>
                          <span className="font-semibold">Returning Customers</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {promotion.customerSegments.returningCustomers.count} customers ({promotion.customerSegments.returningCustomers.percent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>Avg order value: €{promotion.customerSegments.returningCustomers.avgOrderValue.toFixed(2)}</div>
                        <div>Avg redemptions: {promotion.customerSegments.returningCustomers.avgRedemptions.toFixed(1)} per customer</div>
                        <div>Total revenue: €{promotion.customerSegments.returningCustomers.totalRevenue.toFixed(0)}</div>
                      </div>
                      <Button variant="link" className="px-0 mt-2">
                        View Customer List
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>⭐</span>
                          <span className="font-semibold">VIP/Loyalty Members</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {promotion.customerSegments.vipMembers.count} customers ({promotion.customerSegments.vipMembers.percent.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div>Avg order value: €{promotion.customerSegments.vipMembers.avgOrderValue.toFixed(2)}</div>
                        <div>Avg redemptions: {promotion.customerSegments.vipMembers.avgRedemptions.toFixed(1)} per customer</div>
                        <div>Total revenue: €{promotion.customerSegments.vipMembers.totalRevenue.toFixed(0)}</div>
                      </div>
                      <Button variant="link" className="px-0 mt-2">
                        View Customer List
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Segment Builder</CardTitle>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Segment
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">Create custom audience for this promotion</p>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                      <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No custom segments configured</p>
                      <p className="text-sm">Create rules to target specific customer groups</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Customers (by redemption)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Rank</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Redemp.</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Avg Order</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {promotion.topCustomers.map((customer) => (
                          <TableRow key={customer.customerId}>
                            <TableCell>{customer.rank}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{customer.name}</div>
                                <div className="text-xs text-muted-foreground">{customer.segment}</div>
                              </div>
                            </TableCell>
                            <TableCell>{customer.redemptions} times</TableCell>
                            <TableCell>€{customer.revenue.toFixed(0)}</TableCell>
                            <TableCell>€{customer.avgOrderValue.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button variant="link" className="w-full mt-4">
                      View All Customers
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-0 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="promo-name">Name *</Label>
                      <Input id="promo-name" value={promotion.name} disabled={!isEditMode} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promo-description">Description</Label>
                      <Textarea id="promo-description" value={promotion.description} disabled={!isEditMode} rows={3} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Discount Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={promotion.type} disabled={!isEditMode}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage Discount</SelectItem>
                          <SelectItem value="fixed">Fixed Discount</SelectItem>
                          <SelectItem value="bogo">BOGO</SelectItem>
                          <SelectItem value="happy_hour">Happy Hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="discount-value">Amount</Label>
                      <div className="flex gap-2">
                        <Input id="discount-value" type="number" value={promotion.discountValue} disabled={!isEditMode} className="flex-1" />
                        <Select value={promotion.discountUnit} disabled={!isEditMode}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="%">%</SelectItem>
                            <SelectItem value="€">€</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Visibility</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="visibility-menu-boards">Show on digital menu boards</Label>
                      <Switch id="visibility-menu-boards" checked={promotion.settings.visibility.menuBoards} disabled={!isEditMode} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="visibility-mobile-app">Display on mobile app</Label>
                      <Switch id="visibility-mobile-app" checked={promotion.settings.visibility.mobileApp} disabled={!isEditMode} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="visibility-email">Include in email marketing</Label>
                      <Switch id="visibility-email" checked={promotion.settings.visibility.emailMarketing} disabled={!isEditMode} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="visibility-push">Push notification to customers</Label>
                      <Switch id="visibility-push" checked={promotion.settings.visibility.pushNotifications} disabled={!isEditMode} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="visibility-featured">Featured promotion (hero banner)</Label>
                      <Switch id="visibility-featured" checked={promotion.settings.visibility.featuredPromotion} disabled={!isEditMode} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif-budget">Notify when 80% of budget used</Label>
                      <Switch id="notif-budget" checked={promotion.settings.notifications.budget80Percent} disabled={!isEditMode} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif-redemptions">Notify when 80% of redemptions used</Label>
                      <Switch id="notif-redemptions" checked={promotion.settings.notifications.redemptions80Percent} disabled={!isEditMode} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif-daily">Daily performance summary</Label>
                      <Switch id="notif-daily" checked={promotion.settings.notifications.dailySummary} disabled={!isEditMode} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="notif-low-perf">Alert on low performance</Label>
                      <Switch id="notif-low-perf" checked={promotion.settings.notifications.lowPerformance} disabled={!isEditMode} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={promotion.settings.priority} disabled={!isEditMode}>
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <div className="flex flex-wrap gap-2">
                        {promotion.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                        {isEditMode && (
                          <Button variant="outline" size="sm">
                            + Add Tag
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="advanced-stackable">Stackable with other promotions</Label>
                      <Switch id="advanced-stackable" checked={promotion.settings.advanced.stackable} disabled={!isEditMode} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="advanced-loyalty">Exclude from loyalty points</Label>
                      <Switch id="advanced-loyalty" checked={promotion.settings.advanced.excludeFromLoyalty} disabled={!isEditMode} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="advanced-approval">Require manager approval for redemptions</Label>
                      <Switch id="advanced-approval" checked={promotion.settings.advanced.requireApproval} disabled={!isEditMode} />
                    </div>
                  </CardContent>
                </Card>

                {isEditMode && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditMode(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleSave} className="flex-1">
                      Save Changes
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="mt-0 space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Select defaultValue="all-events">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-events">All Events</SelectItem>
                      <SelectItem value="edits">Edits Only</SelectItem>
                      <SelectItem value="alerts">Alerts Only</SelectItem>
                      <SelectItem value="milestones">Milestones Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all-users">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-users">All Users</SelectItem>
                      <SelectItem value="sarah">Sarah Johnson</SelectItem>
                      <SelectItem value="mike">Mike Chen</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex-1" />
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Log
                  </Button>
                </div>

                <div className="space-y-4">
                  {mockAuditLog.map((event) => (
                    <Card key={event.id} className="border-l-4" style={{ borderLeftColor: event.color }}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          {event.user && (
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={event.user.avatar || "/placeholder.svg"} alt={event.user.name} />
                              <AvatarFallback>{event.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          )}
                          {event.system && (
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                              <AlertCircle className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h4 className="font-semibold flex items-center gap-2">
                                  {event.type === "promotion_edited" && <Edit className="h-4 w-4" />}
                                  {event.type === "alert_triggered" && <AlertTriangle className="h-4 w-4" />}
                                  {event.type === "milestone_reached" && <Award className="h-4 w-4" />}
                                  {event.type === "report_generated" && <FileText className="h-4 w-4" />}
                                  {event.type === "promotion_activated" && <Play className="h-4 w-4" />}
                                  {event.type === "promotion_created" && <Plus className="h-4 w-4" />}
                                  {event.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {event.user ? `${event.user.name} ${event.description.toLowerCase()}` : event.description}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">{event.timeAgo}</p>
                              </div>
                            </div>
                            {event.changes && event.changes.length > 0 && (
                              <div className="mt-3 space-y-1 text-sm">
                                <p className="font-medium">Changes:</p>
                                {event.changes.map((change, idx) => (
                                  <p key={idx} className="text-muted-foreground">
                                    • {change.field}: {typeof change.oldValue === "number" ? `€${change.oldValue}` : change.oldValue} →{" "}
                                    {typeof change.newValue === "number" ? `€${change.newValue}` : change.newValue}
                                    {change.delta && ` (+€${change.delta})`}
                                  </p>
                                ))}
                                {event.reason && <p className="text-muted-foreground mt-1">Reason: "{event.reason}"</p>}
                              </div>
                            )}
                            {event.details && typeof event.details === "object" && "budgetUsed" in event.details && (
                              <div className="mt-3 space-y-1 text-sm">
                                <p className="font-medium">Details:</p>
                                <p className="text-muted-foreground">
                                  • Budget used: €{event.details.budgetUsed} of €{event.details.budgetTotal} ({event.details.budgetPercent}%)
                                </p>
                                <p className="text-muted-foreground">• Email sent to: {event.details.emailsSent.join(", ")}</p>
                              </div>
                            )}
                            {event.details && typeof event.details === "object" && "milestone" in event.details && (
                              <div className="mt-3 space-y-1 text-sm">
                                <p className="font-medium">Achievement:</p>
                                <p className="text-muted-foreground">• {event.details.milestone} redemptions milestone</p>
                                <p className="text-muted-foreground">• Revenue lift: €{event.details.revenueLift}</p>
                                <p className="text-muted-foreground">• Days to reach: {event.details.daysToMilestone}</p>
                              </div>
                            )}
                            {event.downloadUrl && (
                              <Button variant="link" className="px-0 mt-2">
                                <Download className="h-4 w-4 mr-2" />
                                Download Report
                              </Button>
                            )}
                            {event.statusChange && (
                              <div className="mt-3 text-sm">
                                <p className="text-muted-foreground">Status: {event.statusChange.from} → {event.statusChange.to}</p>
                              </div>
                            )}
                            {event.initialConfig && (
                              <div className="mt-3 space-y-1 text-sm">
                                <p className="font-medium">Initial Configuration:</p>
                                <p className="text-muted-foreground">• Type: {event.initialConfig.type} ({event.initialConfig.discount}%)</p>
                                <p className="text-muted-foreground">• Target: {event.initialConfig.target}</p>
                                <p className="text-muted-foreground">• Schedule: {event.initialConfig.schedule}</p>
                                <p className="text-muted-foreground">• Budget: €{event.initialConfig.budget}</p>
                                <Button variant="link" className="px-0 mt-2">
                                  View Full Details
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button variant="outline" className="w-full">
                  Load More Events
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
