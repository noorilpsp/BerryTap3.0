"use client"
import { useRouter } from "next/navigation"
import {
  Package,
  PackagePlus,
  ClipboardList,
  Calculator,
  Upload,
  Download,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { InventoryKPICard } from "@/components/inventory/kpi-card"

export default function InventoryLandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="mx-auto w-full max-w-screen-2xl px-4 py-4 md:px-6 md:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Inventory</h1>
              <p className="text-sm text-muted-foreground mt-1">Overview & Quick Actions • Last synced 2 mins ago</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <PackagePlus className="w-4 h-4 mr-2" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/inventory/skus?action=new")}>New SKU</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/inventory/purchase-orders?action=new")}>
                  New Purchase Order
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/inventory/stockcounts?action=new")}>
                  Start Count
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/inventory/settings?tab=import-export&action=import")}>
                  Import CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/inventory/settings?tab=import-export&action=export")}>
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/inventory/settings")}>
                  Inventory Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-screen-2xl px-4 py-4 md:px-6 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <InventoryKPICard
                icon={Package}
                label="TOTAL SKUS"
                value="847"
                subtext="Active items"
                sparklineData={[780, 795, 812, 828, 835, 842, 847]}
              />
              <InventoryKPICard
                icon={AlertCircle}
                label="LOW STOCK"
                value="23"
                badge="5 new"
                subtext="🔴 Critical"
                variant="warning"
              />
              <InventoryKPICard
                icon={TrendingUp}
                label="STOCK VALUE"
                value="€47,832"
                trend="+2.3%"
                subtext="vs last month"
                sparklineData={[42000, 44500, 46200, 45800, 47100, 47832]}
              />
              <InventoryKPICard
                icon={TrendingDown}
                label="CONSUMPTION"
                value="€12,450"
                subtext="This week"
                trend="-8% vs LW"
                sparklineData={[15000, 14200, 13800, 13200, 12800, 12450]}
              />
              <InventoryKPICard
                icon={ClipboardList}
                label="OPEN POs"
                value="7"
                subtext="€8,340 pending"
                detail="3 overdue"
                variant="warning"
              />
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-4 gap-2 bg-transparent"
                    onClick={() => router.push("/inventory/skus?action=new")}
                  >
                    <Package className="w-5 h-5" />
                    <span className="text-xs">New SKU</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-4 gap-2 bg-transparent"
                    onClick={() => router.push("/inventory/purchase-orders?action=new")}
                  >
                    <ClipboardList className="w-5 h-5" />
                    <span className="text-xs">New PO</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-4 gap-2 bg-transparent"
                    onClick={() => router.push("/inventory/stockcounts?action=new")}
                  >
                    <Calculator className="w-5 h-5" />
                    <span className="text-xs">Count Sheet</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-4 gap-2 bg-transparent"
                    onClick={() => router.push("/inventory/settings?tab=import-export&action=export")}
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-xs">Export CSV</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-4 gap-2 bg-transparent"
                    onClick={() => router.push("/inventory/settings?tab=import-export&action=import")}
                  >
                    <Download className="w-5 h-5" />
                    <span className="text-xs">Import CSV</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-auto py-4 gap-2 bg-transparent"
                    onClick={() => router.push("/inventory/transfers?action=new")}
                  >
                    <ArrowLeftRight className="w-5 h-5" />
                    <span className="text-xs">Transfer</span>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                  <Button variant="ghost" size="sm" onClick={() => router.push("/inventory/skus")}>
                    Adjust Stock
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/inventory/reports")}>
                    View Reports
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => router.push("/inventory/settings")}>
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Inventory Health */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Inventory Health</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push("/inventory/skus")}>
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall Health Bar */}
                <div className="space-y-2">
                  <div className="flex h-4 w-full overflow-hidden rounded-full">
                    <div className="bg-success" style={{ width: "81%" }} />
                    <div className="bg-warning" style={{ width: "15%" }} />
                    <div className="bg-orange-500" style={{ width: "3%" }} />
                    <div className="bg-destructive" style={{ width: "1%" }} />
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs text-center">
                    <div>
                      <div className="font-semibold">689 (81%)</div>
                      <div className="text-muted-foreground">Healthy</div>
                    </div>
                    <div>
                      <div className="font-semibold">127 (15%)</div>
                      <div className="text-muted-foreground">Low</div>
                    </div>
                    <div>
                      <div className="font-semibold">23 (3%)</div>
                      <div className="text-muted-foreground">Critical</div>
                    </div>
                    <div>
                      <div className="font-semibold">8 (1%)</div>
                      <div className="text-muted-foreground">Out</div>
                    </div>
                  </div>
                </div>

                {/* By Category */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">By Category:</h4>
                  <div className="space-y-2">
                    {[
                      { name: "Proteins", percent: 78 },
                      { name: "Produce", percent: 92 },
                      { name: "Dairy", percent: 62 },
                      { name: "Dry Goods", percent: 98 },
                      { name: "Beverages", percent: 85 },
                    ].map((category) => (
                      <div key={category.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{category.name}</span>
                          <span className="font-medium">{category.percent}% healthy</span>
                        </div>
                        <Progress value={category.percent} className="h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Consumed Items */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Top Consumed Items (7 days)</CardTitle>
                <Button
                  variant="ghost"
                  className="w-full mt-4"
                  onClick={() => router.push("/inventory/reports?tab=consumption")}
                >
                  View All Consumption <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { rank: 1, name: "Eggs (Free-range)", value: "2,847 units", trend: "+12%", percent: 100, up: true },
                    { rank: 2, name: "All-purpose Flour", value: "45.2 kg", trend: "-3%", percent: 78, up: false },
                    { rank: 3, name: "Chicken Breast", value: "38.5 kg", trend: "+8%", percent: 72, up: true },
                    { rank: 4, name: "Olive Oil (Extra Virgin)", value: "12.8 L", trend: "0%", percent: 45, up: null },
                    { rank: 5, name: "Heavy Cream", value: "28.4 L", trend: "+23%", percent: 52, up: true },
                  ].map((item) => (
                    <div key={item.rank} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {item.rank}. {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={item.percent} className="h-2 flex-1" />
                        <span className="text-sm font-medium min-w-[80px] text-right">{item.value}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {item.up === true && <TrendingUp className="w-3 h-3 text-success" />}
                        {item.up === false && <TrendingDown className="w-3 h-3 text-destructive" />}
                        <span
                          className={
                            item.up === true
                              ? "text-success"
                              : item.up === false
                                ? "text-destructive"
                                : "text-muted-foreground"
                          }
                        >
                          {item.trend} vs last week
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expiry Calendar */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Expiry Calendar</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => router.push("/inventory/skus?filter=expiring")}>
                  Full Calendar <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "TODAY",
                      urgency: "critical",
                      items: 3,
                      value: 89,
                      details: ["Cream 2L", "Basil 200g", "Prawns 1kg"],
                    },
                    {
                      label: "TOMORROW",
                      urgency: "warning",
                      items: 5,
                      value: 234,
                      details: ["Salmon 4kg", "Milk 8L", "Spinach 1kg"],
                    },
                    {
                      label: "IN 3 DAYS",
                      urgency: "caution",
                      items: 8,
                      value: 156,
                      details: ["Yogurt 6pc", "Berries 2kg", "+6 more"],
                    },
                    {
                      label: "IN 7 DAYS",
                      urgency: "ok",
                      items: 12,
                      value: 445,
                      details: ["Butter 4kg", "Cheese 2kg", "+10 more"],
                    },
                  ].map((day) => (
                    <Card
                      key={day.label}
                      className={`${
                        day.urgency === "critical"
                          ? "border-destructive"
                          : day.urgency === "warning"
                            ? "border-orange-500"
                            : day.urgency === "caution"
                              ? "border-warning"
                              : "border-success"
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          {day.urgency === "critical" && "🔴"}
                          {day.urgency === "warning" && "🟠"}
                          {day.urgency === "caution" && "🟡"}
                          {day.urgency === "ok" && "🟢"}
                          {day.label}
                        </CardTitle>
                        <div className="text-2xl font-bold">{day.items} items</div>
                      </CardHeader>
                      <CardContent className="space-y-1 text-sm">
                        {day.details.map((item, i) => (
                          <div key={i} className="text-muted-foreground">
                            • {item}
                          </div>
                        ))}
                        <div className="font-medium pt-2 border-t mt-2">€{day.value} at risk</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent PO Activity */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Recent PO Activity</CardTitle>
                <Button variant="ghost" className="w-full" onClick={() => router.push("/inventory/purchase-orders")}>
                  View All POs <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    number: "1854",
                    status: "Draft",
                    supplier: "Fresh Farms",
                    items: 12,
                    value: 1456,
                    time: "Just now",
                    variant: "outline" as const,
                  },
                  {
                    number: "1853",
                    status: "Ordered",
                    supplier: "Meat Masters",
                    items: 8,
                    value: 2340,
                    time: "2 hours ago",
                    variant: "default" as const,
                  },
                  {
                    number: "1852",
                    status: "In Transit",
                    supplier: "Seafood King",
                    items: 8,
                    value: 890,
                    time: "Yesterday",
                    variant: "secondary" as const,
                  },
                  {
                    number: "1851",
                    status: "Received",
                    supplier: "Dairy Direct",
                    items: 15,
                    value: 567,
                    time: "Nov 13",
                    variant: "secondary" as const,
                  },
                ].map((po) => (
                  <div
                    key={po.number}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">📋 PO #{po.number}</span>
                        <Badge variant={po.variant}>{po.status}</Badge>
                        <span className="text-xs text-muted-foreground">{po.time}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {po.supplier} • {po.items} items • €{po.value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Alerts & Suggestions */}
          <div className="space-y-6">
            {/* Priority Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Priority Alerts</CardTitle>
                <p className="text-sm text-muted-foreground">12 items need attention</p>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" defaultValue={["critical", "warning"]} className="w-full">
                  {/* Critical Alerts */}
                  <AccordionItem value="critical">
                    <AccordionTrigger className="text-red-500 hover:no-underline">🔴 CRITICAL</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {[
                          {
                            emoji: "⚠️",
                            title: "Out of Stock: Salmon Fillet",
                            description: "3 recipes affected • Used in: Sushi Platter, Teriyaki Bowl, Poke Bowl",
                            action: "order",
                            link: "/inventory/purchase-orders?action=new&sku=salmon-fillet",
                          },
                          {
                            emoji: "📅",
                            title: "Expired: Greek Yogurt",
                            description: "12 units • €36.00 • Expired 2 days ago • Location: Walk-in Fridge",
                            action: "order",
                            link: "/inventory/skus?sku=greek-yogurt",
                          },
                          {
                            emoji: "🔴",
                            title: "Critical: Chicken Breast",
                            description: "Only 2.5 kg left • Below minimum: 10 kg • High usage: 15 kg/day",
                            action: "order",
                            link: "/inventory/purchase-orders?action=new&sku=chicken-breast",
                          },
                        ].map((alert, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 border-l-4 border-red-500 rounded bg-red-500/5"
                          >
                            <div className="flex-1">
                              <div className="font-medium">
                                <span className="mr-2">{alert.emoji}</span>
                                {alert.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">{alert.description}</div>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => router.push(alert.link)}>
                              Order <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Warning Alerts */}
                  <AccordionItem value="warning">
                    <AccordionTrigger className="text-orange-500 hover:no-underline">🟠 WARNING</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {[
                          {
                            emoji: "📋",
                            title: "PO #1847 Overdue",
                            description: "Expected Nov 12 • Supplier: Fresh Farms • €1,240 • 15 items",
                            action: "view",
                            link: "/inventory/purchase-orders/1847",
                          },
                          {
                            emoji: "🧮",
                            title: "Weekly count scheduled",
                            description: "Proteins section • Due today by 6:00 PM • Last count: 7 days ago",
                            action: "start",
                            link: "/inventory/stockcounts?action=new&section=proteins",
                          },
                        ].map((alert, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 border-l-4 border-orange-500 rounded bg-orange-500/5"
                          >
                            <div className="flex-1">
                              <div className="font-medium">
                                <span className="mr-2">{alert.emoji}</span>
                                {alert.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">{alert.description}</div>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => router.push(alert.link)}>
                              {alert.action === "view" ? "View" : "Start"} <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Info Alerts */}
                  <AccordionItem value="info">
                    <AccordionTrigger className="text-blue-500 hover:no-underline">🔵 INFO</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {[
                          {
                            emoji: "🚚",
                            title: "Transfer in transit",
                            description: "12 items • From Downtown → Uptown • Expected: Today 3:00 PM",
                            link: "/inventory/transfers?filter=in-transit",
                          },
                        ].map((alert, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 border-l-4 border-blue-500 rounded bg-blue-500/5"
                          >
                            <div className="flex-1">
                              <div className="font-medium">
                                <span className="mr-2">{alert.emoji}</span>
                                {alert.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">{alert.description}</div>
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => router.push(alert.link)}>
                              Track <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            {/* Smart Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Smart Suggestions
                </CardTitle>
                <p className="text-sm text-muted-foreground">AI-powered recommendations</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      emoji: "💡",
                      title: "Optimize reorder point",
                      description: "Tomatoes • Current: 20kg → Suggested: 15kg • Save €120/month",
                      type: "cost",
                      link: "/inventory/skus?sku=tomatoes",
                    },
                    {
                      emoji: "📦",
                      title: "Bulk order opportunity",
                      description: "Olive oil • 10% discount for 24+ units • Valid until Nov 30",
                      type: "saving",
                      link: "/inventory/purchase-orders?action=new&sku=olive-oil&bulk=true",
                    },
                    {
                      emoji: "⏰",
                      title: "Adjust par levels",
                      description: "Basil • Usage dropped 30% this month • Reduce par to avoid waste",
                      type: "waste",
                      link: "/inventory/settings?tab=stock-levels&sku=basil",
                    },
                  ].map((suggestion, i) => (
                    <div key={i} className="p-3 rounded-lg border bg-gradient-to-br from-purple-500/5 to-blue-500/5">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            <span>{suggestion.emoji}</span>
                            {suggestion.title}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">{suggestion.description}</div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {suggestion.type === "cost" && "💰 Cost Savings"}
                              {suggestion.type === "saving" && "🎯 Deal"}
                              {suggestion.type === "waste" && "♻️ Waste Reduction"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" onClick={() => router.push(suggestion.link)}>
                          {i === 1 ? "Create PO" : i === 2 ? "Review" : "Apply"} <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
