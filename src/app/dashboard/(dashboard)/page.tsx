"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingCart,
  Users,
  Calendar,
  CreditCard,
  CheckCircle,
  User,
  ChefHat,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CardGrid } from "@/components/ui/card-grid"
import { ProgressBar } from "@/components/ui/progress-bar"
import { ChartCard } from "@/components/ui/chart-card"
import { AlertBanner } from "@/components/ui/alert-banner"
import { SkeletonBlock } from "@/components/ui/skeleton-block"
import { StatusBadge } from "@/components/ui/status-badge"
import { DashboardToolbar } from "@/components/dashboard-toolbar"
import {
  mockOrders,
  mockRevenue,
  mockOrdersByHour,
  mockTableUtilization,
  mockSparklineData,
  mockActivityFeed,
  mockAlerts,
} from "@/lib/mockData"
import { useRestaurantStore } from "@/store/restaurantStore"
import { CHART_COLORS } from "@/lib/constants"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"
import RevenueTrend from "@/components/charts/RevenueTrend"
import OrdersByHour from "@/components/charts/OrdersByHour"
import TableUtilization from "@/components/charts/TableUtilization"

export default function DashboardPage() {
  const reservations = useRestaurantStore((s) => s.reservations)
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("today")
  const [showComparison, setShowComparison] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activityTab, setActivityTab] = useState("all")
  const [showActivityFeed, setShowActivityFeed] = useState(true)

  // KPI data with sparklines
  const kpiData = [
    {
      label: "Revenue Today",
      value: "$3,240",
      current: 3240,
      goal: 4000,
      change: "+12.5%",
      trend: "up" as const,
      icon: DollarSign,
      sparkline: mockSparklineData,
      link: "/analytics?metric=revenue",
      sparklineLabel: "Last 7 days trend",
    },
    {
      label: "Orders in Progress",
      value: "8",
      current: 8,
      goal: 10,
      change: "+2",
      trend: "up" as const,
      icon: ShoppingCart,
      sparkline: mockSparklineData.map((d) => ({ value: d.value * 0.8 })),
      link: "/orders?status=active",
      sparklineLabel: "Last 7 days trend",
    },
    {
      label: "Tables Occupied",
      value: "12/25",
      current: 12,
      goal: 25,
      change: "-5%",
      trend: "down" as const,
      icon: Users,
      sparkline: mockSparklineData.map((d) => ({ value: d.value * 0.6 })),
      link: "/tables",
      sparklineLabel: "Last 7 days trend",
    },
    {
      label: "Guests Served",
      value: "142",
      current: 142,
      goal: 200,
      change: "+18",
      trend: "up" as const,
      icon: Users,
      sparkline: mockSparklineData.map((d) => ({ value: d.value * 0.9 })),
      link: "/analytics?metric=guests",
      sparklineLabel: "Last 7 days trend",
    },
  ]

  const activityIcons = {
    "shopping-cart": ShoppingCart,
    calendar: Calendar,
    "credit-card": CreditCard,
    "check-circle": CheckCircle,
    user: User,
    users: Users,
    "chef-hat": ChefHat,
  }

  const filteredActivity =
    activityTab === "all" ? mockActivityFeed : mockActivityFeed.filter((item) => item.type === activityTab)

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-4 md:px-4 md:py-4">
      <main className="flex flex-col gap-4 md:gap-6">
        {/* Header Section */}
        <div className="px-6 pt-8 pb-6 border-b border-border">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-2">Live snapshot of your restaurant operations</p>
        </div>

        {/* Toolbar Section */}
        <div className="px-6">
          <DashboardToolbar
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            showComparison={showComparison}
            onToggleComparison={() => setShowComparison(!showComparison)}
          />
        </div>

        {/* KPI Section */}
        <section className="px-6">
          <CardGrid columns={4}>
            {kpiData.map((kpi) => {
              const Icon = kpi.icon
              return (
                <Link key={kpi.label} href={kpi.link}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full min-h-[96px]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-baseline gap-2">
                        <div className="text-2xl font-bold">{kpi.value}</div>
                        <div
                          className={cn(
                            "flex items-center text-xs font-medium",
                            kpi.trend === "up" ? "text-green-600" : "text-red-600",
                          )}
                        >
                          {kpi.trend === "up" ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {kpi.change}
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-1">{kpi.sparklineLabel}</div>
                        <div className="h-12">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={kpi.sparkline}>
                              <defs>
                                <linearGradient id={`gradient-${kpi.label}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                                  <stop offset="100%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <Line
                                type="monotone"
                                dataKey="value"
                                stroke={CHART_COLORS[0]}
                                strokeWidth={2.5}
                                fill={`url(#gradient-${kpi.label})`}
                                dot={false}
                                activeDot={{ r: 4, fill: CHART_COLORS[0] }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </CardGrid>

          <div className="mt-4">
            {(() => {
              const current = 3000
              const goal = 4000
              const pctNum = goal > 0 ? Math.round((current / goal) * 100) : 0
              return (
                <ProgressBar
                  current={current}
                  goal={goal}
                  label="Daily Revenue Goal"
                  showPercentage
                  className="max-w-2xl"
                />
              )
            })()}
          </div>
        </section>

        {/* Alerts Section */}
        <section className="space-y-3 px-6">
          {mockAlerts.map((alert) => (
            <AlertBanner
              key={alert.id}
              variant={alert.variant}
              message={alert.message}
              action={alert.action}
              dismissible
            />
          ))}
        </section>

        {/* Live Operations Section */}
        <section className="grid gap-4 md:gap-6 lg:grid-cols-[3fr_2fr] px-6">
          {/* Active Orders */}
          <Card className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-balance">Active Orders</CardTitle>
                  <CardDescription>Orders currently being prepared</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/orders?status=active">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-hidden">
              {isLoading ? (
                <SkeletonBlock variant="table" rows={5} />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-background">
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Order #</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockOrders.slice(0, 5).map((order) => {
                        const urgency =
                          order.time.includes("15") || order.time.includes("30")
                            ? "red"
                            : order.time.includes("10")
                              ? "yellow"
                              : "green"

                        return (
                          <TableRow
                            key={order.id}
                            className="cursor-pointer hover:bg-muted/40 transition-colors"
                            onClick={() => {
                              console.log("[v0] Open order drawer for", order.id)
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <TableCell>
                              <div
                                className={cn(
                                  "w-1 h-8 rounded-full",
                                  urgency === "red" && "bg-red-500",
                                  urgency === "yellow" && "bg-yellow-500",
                                  urgency === "green" && "bg-green-500",
                                )}
                              />
                            </TableCell>
                            <TableCell className="font-medium">#{order.id}</TableCell>
                            <TableCell>{order.table}</TableCell>
                            <TableCell className="text-muted-foreground">{order.time}</TableCell>
                            <TableCell>${order.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <StatusBadge status={order.status.toLowerCase()} label={order.status} size="sm" />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Reservations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-balance">Upcoming Reservations</CardTitle>
                  <CardDescription>Next reservations today</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/reservations?date=today">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <SkeletonBlock variant="list" rows={5} />
              ) : (
                <div className="space-y-4">
                  {reservations.slice(0, 5).map((reservation) => (
                    <div
                      key={reservation.id}
                      className="flex items-start justify-between gap-3 pb-3 border-b last:border-0 last:pb-0 cursor-pointer hover:bg-muted/20 -mx-2 px-2 py-1 rounded transition-colors"
                      onClick={() => {
                        console.log("[v0] Open reservation drawer for", reservation.id)
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{reservation.guestName}</div>
                        <div className="text-sm text-muted-foreground">
                          {reservation.time} • {reservation.partySize} guests
                        </div>
                      </div>
                      <StatusBadge status={reservation.status.toLowerCase()} label={reservation.status} size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Charts Section */}
        <section className="grid gap-4 md:gap-6 lg:grid-cols-3 px-6">
          {/* Orders by Hour */}
          <ChartCard title="Orders by Hour" description="Order volume today" className="lg:col-span-3">
            <OrdersByHour data={mockOrdersByHour.map((d) => ({ hour: d.hour, count: d.orders }))} />
          </ChartCard>
          {/* Revenue Trend */}
          <ChartCard title="Revenue Trend" description="Hourly revenue today" className="lg:col-span-2">
            <RevenueTrend data={mockRevenue} />
          </ChartCard>

          {/* Table Utilization */}
          <ChartCard title="Table Utilization" description="Current status">
            <TableUtilization data={mockTableUtilization} />
          </ChartCard>
        </section>

        {/* Activity Feed Section */}
        <section className="px-6">
          <Card className="min-h-[600px] flex flex-col">
            <CardHeader className="p-3 md:p-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm md:text-base text-balance">Recent Activity</CardTitle>
                  <CardDescription className="text-xs md:text-sm">Latest updates from your restaurant</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActivityFeed(!showActivityFeed)}
                  className="md:hidden"
                >
                  {showActivityFeed ? "Hide" : "Show"}
                </Button>
              </div>
            </CardHeader>
            {showActivityFeed && (
              <CardContent className="p-3 md:p-4 pt-0 flex-1 flex flex-col min-h-0">
                <Tabs value={activityTab} onValueChange={setActivityTab} className="flex-1 flex flex-col min-h-0">
                  <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0 mb-4 flex-shrink-0">
                    <TabsList className="w-full md:w-auto inline-flex min-w-max gap-1">
                      <TabsTrigger value="all" className="whitespace-nowrap px-3">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="order" className="whitespace-nowrap px-3">
                        Orders
                      </TabsTrigger>
                      <TabsTrigger value="reservation" className="whitespace-nowrap px-3">
                        Reservations
                      </TabsTrigger>
                      <TabsTrigger value="payment" className="whitespace-nowrap px-3">
                        Payments
                      </TabsTrigger>
                      <TabsTrigger value="staff" className="whitespace-nowrap px-3">
                        Staff
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent value={activityTab} className="mt-0 flex-1 overflow-y-auto min-h-0">
                    {isLoading ? (
                      <SkeletonBlock variant="list" rows={5} />
                    ) : (
                      <div className="space-y-3 pb-2">
                        {filteredActivity.slice(0, showActivityFeed ? 10 : 5).map((activity) => {
                          const Icon = activityIcons[activity.icon as keyof typeof activityIcons] || AlertCircle
                          return (
                            <div key={activity.id} className="flex items-start gap-3">
                              <div className="rounded-full bg-muted p-2 flex-shrink-0">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm">{activity.message}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}
          </Card>
        </section>
      </main>
    </div>
  )
}
