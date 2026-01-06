"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ChevronLeft,
  Plus,
  Search,
  ChevronDown,
  MoreVertical,
  Calculator,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Play,
  Eye,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { CreateCountModal } from "@/components/inventory/create-count-modal"
import { CountingModeDrawer } from "@/components/inventory/counting-mode-drawer"
import { ReconciliationDrawer } from "@/components/inventory/reconciliation-drawer"

// Mock Data
const summaryStats = {
  countsThisMonth: 12,
  skusCountedThisMonth: 847,
  inProgress: 2,
  inProgressDetails: "Proteins, Bar",
  completedThisWeek: 5,
  completedVariance: 2340,
  pendingReconcile: 3,
  accuracyRate: 94.2,
  accuracyChange: 1.8,
}

const scheduledCounts = [
  {
    id: "sched_1",
    urgency: "today",
    dueTime: "6:00 PM",
    section: "Proteins Section",
    emoji: "🥩",
    location: "Main Kitchen",
    frequency: "Weekly count",
    skuCount: 45,
    lastCount: "7 days ago",
  },
  {
    id: "sched_2",
    urgency: "tomorrow",
    section: "Dairy & Refrigerated",
    emoji: "🧀",
    location: "Main Kitchen",
    frequency: "Weekly count",
    skuCount: 38,
    lastCount: "6 days ago",
  },
  {
    id: "sched_3",
    urgency: "upcoming",
    date: "Nov 20 (Wednesday)",
    section: "Bar Inventory",
    emoji: "🍷",
    location: "Bar",
    frequency: "Weekly count",
    skuCount: 67,
    lastCount: "5 days ago",
  },
]

const inProgressCounts = [
  {
    id: "cs_2024_089",
    countNumber: "CS-2024-089",
    section: "Proteins Section",
    emoji: "🥩",
    location: "Main Kitchen",
    startedAt: "Today 2:30 PM",
    startedBy: "Maria L.",
    progress: { counted: 32, total: 45, percent: 71 },
    variances: { count: 4, value: 127.5 },
  },
  {
    id: "cs_2024_088",
    countNumber: "CS-2024-088",
    section: "Bar Inventory",
    emoji: "🍷",
    location: "Bar",
    startedAt: "Yesterday 4:00 PM",
    startedBy: "John D.",
    progress: { counted: 58, total: 67, percent: 87 },
    variances: { count: 7, value: 234.8 },
  },
]

const pendingReconciliation = [
  {
    id: "cs_2024_087",
    countNumber: "CS-2024-087",
    section: "Produce Section",
    emoji: "🥬",
    location: "Main Kitchen",
    completedAt: "Nov 14, 5:45 PM",
    completedBy: "Sarah M.",
    results: {
      matched: 52,
      variances: 6,
      varianceValue: 156.3,
    },
    topVariances: [
      { name: "Roma Tomatoes", emoji: "🍅", system: "15kg", counted: "12kg", diff: "-€10.50" },
      { name: "Romaine Lettuce", emoji: "🥬", system: "8kg", counted: "5kg", diff: "-€8.40" },
      { name: "Carrots", emoji: "🥕", system: "10kg", counted: "12kg", diff: "+€2.40" },
    ],
  },
]

const completedCounts = [
  {
    id: "cs_086",
    number: "CS-086",
    section: "🌾 Dry Goods",
    location: "Dry Storage",
    date: "Nov 13",
    accuracy: 98.5,
    variance: -45,
    by: "John",
  },
  {
    id: "cs_085",
    number: "CS-085",
    section: "🥩 Proteins",
    location: "Main Kitchen",
    date: "Nov 10",
    accuracy: 92.3,
    variance: -234,
    by: "Maria",
  },
  {
    id: "cs_084",
    number: "CS-084",
    section: "🧀 Dairy",
    location: "Main Kitchen",
    date: "Nov 9",
    accuracy: 96.1,
    variance: -89,
    by: "Sarah",
  },
  {
    id: "cs_083",
    number: "CS-083",
    section: "🍷 Bar",
    location: "Bar",
    date: "Nov 8",
    accuracy: 94.7,
    variance: -156,
    by: "John",
  },
  {
    id: "cs_082",
    number: "CS-082",
    section: "📦 Full Count",
    location: "All",
    date: "Nov 1",
    accuracy: 95.2,
    variance: -1240,
    by: "Team",
  },
]

const varianceByCategory = [
  { category: "Proteins", emoji: "🥩", variance: -892, percent: 49 },
  { category: "Produce", emoji: "🥬", variance: -456, percent: 25 },
  { category: "Dairy", emoji: "🧀", variance: -234, percent: 13 },
  { category: "Bar", emoji: "🍷", variance: -189, percent: 10 },
  { category: "Dry Goods", emoji: "🌾", variance: -67, percent: 3 },
]

const accuracyTrend = [
  { date: "Oct 15", accuracy: 92.5 },
  { date: "Oct 22", accuracy: 93.8 },
  { date: "Oct 29", accuracy: 91.2 },
  { date: "Nov 5", accuracy: 95.1 },
  { date: "Nov 12", accuracy: 94.2 },
]

export default function StockCountsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCountingMode, setShowCountingMode] = useState(false)
  const [selectedCount, setSelectedCount] = useState<any>(null)
  const [showReconciliation, setShowReconciliation] = useState(false)

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case "today":
        return { badge: "bg-red-100 text-red-700 border-red-200", border: "border-l-4 border-l-red-500" }
      case "tomorrow":
        return { badge: "bg-yellow-100 text-yellow-700 border-yellow-200", border: "border-l-4 border-l-yellow-500" }
      default:
        return { badge: "bg-green-100 text-green-700 border-green-200", border: "border-l-4 border-l-green-500" }
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/inventory" className="hover:text-foreground">
              <ChevronLeft className="h-4 w-4 inline" />
              Inventory
            </Link>
            <span>/</span>
            <span>Stock Counts</span>
          </div>
          <h1 className="text-2xl font-semibold">Stock Counts</h1>
          <p className="text-sm text-muted-foreground">Physical inventory verification and reconciliation</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Count Sheet
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calculator className="h-4 w-4" />
              <span>COUNTS THIS MONTH</span>
            </div>
            <div className="text-2xl font-bold">{summaryStats.countsThisMonth}</div>
            <div className="text-xs text-muted-foreground">{summaryStats.skusCountedThisMonth} SKUs</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span>IN PROGRESS</span>
            </div>
            <div className="text-2xl font-bold">{summaryStats.inProgress}</div>
            <div className="text-xs text-muted-foreground">{summaryStats.inProgressDetails}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span>COMPLETED THIS WEEK</span>
            </div>
            <div className="text-2xl font-bold">{summaryStats.completedThisWeek}</div>
            <div className="text-xs text-muted-foreground">€{summaryStats.completedVariance.toLocaleString()} var.</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <AlertCircle className="h-4 w-4" />
              <span>PENDING RECONCILE</span>
            </div>
            <div className="text-2xl font-bold">{summaryStats.pendingReconcile}</div>
            <div className="text-xs text-muted-foreground">Review req.</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span>ACCURACY RATE</span>
            </div>
            <div className="text-2xl font-bold">{summaryStats.accuracyRate}%</div>
            <div className="text-xs text-green-600">▲ +{summaryStats.accuracyChange}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search counts..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Status <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            Location <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            Category <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            Date <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Scheduled Counts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Upcoming Scheduled Counts</CardTitle>
          </div>
          <Button variant="ghost" size="sm">
            Manage Rules <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {scheduledCounts.map((count) => {
            const styles = getUrgencyStyles(count.urgency)
            return (
              <Card key={count.id} className={styles.border}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className={styles.badge}>
                      {count.urgency === "today" && `🔴 TODAY by ${count.dueTime}`}
                      {count.urgency === "tomorrow" && "🟡 TOMORROW"}
                      {count.urgency === "upcoming" && `🟢 ${count.date}`}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{count.emoji}</span>
                        <span className="font-medium">{count.section}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{count.location}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {count.frequency} • {count.skuCount} SKUs • Last count: {count.lastCount}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {count.urgency === "today" ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedCount(count)
                            setShowCountingMode(true)
                          }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start Count
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" size="sm">
                            Schedule
                          </Button>
                          <Button variant="outline" size="sm">
                            Start Early
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </CardContent>
      </Card>

      {/* In Progress */}
      <Card>
        <CardHeader>
          <CardTitle>In Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {inProgressCounts.map((count) => (
            <Card key={count.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">COUNT #{count.countNumber}</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    <Clock className="h-3 w-3 mr-1" />
                    In Progress
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{count.emoji}</span>
                      <span className="font-medium">{count.section}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{count.location}</span>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Started: {count.startedAt} • By: {count.startedBy}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-medium">
                        {count.progress.counted} of {count.progress.total} SKUs ({count.progress.percent}%)
                      </span>
                    </div>
                    <Progress value={count.progress.percent} className="h-2" />
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Variances found: {count.variances.count} items (€{count.variances.value.toFixed(2)} value)
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedCount(count)
                        setShowCountingMode(true)
                      }}
                    >
                      Continue Counting
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      View Progress
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Pause Count</DropdownMenuItem>
                        <DropdownMenuItem>Export Progress</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Cancel Count</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Pending Reconciliation */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Reconciliation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingReconciliation.map((count) => (
            <Card key={count.id} className="border-orange-200 bg-orange-50/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">COUNT #{count.countNumber}</span>
                  </div>
                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Needs Review
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{count.emoji}</span>
                      <span className="font-medium">{count.section}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{count.location}</span>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Completed: {count.completedAt} • By: {count.completedBy}
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-lg border">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">✅ Matched</div>
                      <div className="font-medium">{count.results.matched} items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">⚠️ Variances</div>
                      <div className="font-medium">{count.results.variances} found</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">💰 Value Diff</div>
                      <div className="font-medium text-red-600">-€{count.results.varianceValue}</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-sm font-medium">Top variances:</div>
                    {count.topVariances.map((variance, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">
                        • {variance.emoji} {variance.name}: System {variance.system} → Counted {variance.counted} (
                        {variance.diff})
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedCount(count)
                        setShowReconciliation(true)
                      }}
                    >
                      Review & Reconcile
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Export Report</DropdownMenuItem>
                        <DropdownMenuItem>Reassign</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="link" className="w-full">
            + 2 more pending reconciliation... <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Recently Completed */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Completed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">COUNT #</th>
                  <th className="px-4 py-3 text-left font-medium">SECTION</th>
                  <th className="px-4 py-3 text-left font-medium">LOCATION</th>
                  <th className="px-4 py-3 text-left font-medium">DATE</th>
                  <th className="px-4 py-3 text-left font-medium">ACCURACY</th>
                  <th className="px-4 py-3 text-left font-medium">VAR.</th>
                  <th className="px-4 py-3 text-left font-medium">BY</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {completedCounts.map((count) => (
                  <tr key={count.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{count.number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{count.section}</td>
                    <td className="px-4 py-3">{count.location}</td>
                    <td className="px-4 py-3">{count.date}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {count.accuracy}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-red-600">-€{Math.abs(count.variance)}</td>
                    <td className="px-4 py-3">{count.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button variant="link" className="w-full mt-3">
            View All Completed Counts <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Variance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Variance by Category (30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {varianceByCategory.map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{item.emoji}</span>
                      <span>{item.category}</span>
                    </div>
                    <span className="font-medium text-red-600">-€{Math.abs(item.variance)}</span>
                  </div>
                  <Progress value={item.percent} className="h-2" />
                </div>
              ))}
              <Separator className="my-4" />
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span className="text-red-600">-€1,838</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accuracy Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={accuracyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[85, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Modals/Drawers */}
      <CreateCountModal open={showCreateModal} onOpenChange={setShowCreateModal} />
      <CountingModeDrawer open={showCountingMode} onOpenChange={setShowCountingMode} count={selectedCount} />
      <ReconciliationDrawer open={showReconciliation} onOpenChange={setShowReconciliation} count={selectedCount} />
    </div>
  )
}
