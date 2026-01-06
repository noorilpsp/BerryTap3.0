"use client"

import * as React from "react"
import {
  Search,
  Download,
  MoreHorizontal,
  X,
  Plus,
  CreditCard,
  AlertCircle,
  Flame,
  Wallet,
  ClipboardList,
  Edit,
  Trash2,
  Copy,
  Send,
  Printer,
  LayoutGrid,
  LayoutList,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Eye,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Drawer } from "@/components/ui/drawer"
import { StatusBadge } from "@/components/ui/status-badge"
import { SkeletonBlock } from "@/components/ui/skeleton-block"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SidebarPanel } from "@/components/ui/sidebar-panel"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ConnectedRecords from "@/components/connected/ConnectedRecords"
import { motion, AnimatePresence } from "framer-motion"

import { mockDetailedOrders, mockStaffWorkload, mockRecentOrderActivity, mockOrdersPerformance } from "@/lib/mockData"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { StaffFilterProvider, useStaffFilter } from "./context/StaffFilterContext"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

const fullColumns = ["orderNumber", "table", "customer", "items", "total", "time", "status", "staff", "actions"]
const compactDesktopColumns = ["orderNumber", "table", "total", "time", "status"]
const compactMobileColumns = ["orderNumber", "table", "total", "status"]

function OrdersPageContent() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [viewMode, setViewMode] = React.useState<"table" | "card">("table")
  const [statusFilter, setStatusFilter] = React.useState("All")
  const [needsAttention, setNeedsAttention] = React.useState(false)

  const [windowWidth, setWindowWidth] = React.useState(typeof window !== "undefined" ? window.innerWidth : 1024)

  const [containerWidth, setContainerWidth] = React.useState(0)
  const controlsContainerRef = React.useRef<HTMLDivElement>(null)
  const mainColumnRef = React.useRef<HTMLDivElement>(null)
  const sidebarRef = React.useRef<HTMLDivElement>(null)
  const [sidebarHeight, setSidebarHeight] = React.useState<number | null>(null)

  React.useEffect(() => {
    if (!controlsContainerRef.current) return

    let timeoutId: NodeJS.Timeout

    const resizeObserver = new ResizeObserver((entries) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width)
        }
      }, 50)
    })

    resizeObserver.observe(controlsContainerRef.current)

    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
    }
  }, [])

  const [isCompact, setIsCompact] = React.useState(() => {
    if (typeof window !== "undefined") {
      // Phase-2: User preferences will be loaded from backend
      const saved = localStorage.getItem("berrytap.orders.compact")
      if (saved !== null) return JSON.parse(saved)
      // Default to compact on mobile (<768px)
      if (window.innerWidth < 768) return true
    }
    return false
  })

  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedOrder, setSelectedOrder] = React.useState<(typeof mockDetailedOrders)[0] | null>(null)
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  const [newOrderModalOpen, setNewOrderModalOpen] = React.useState(false)
  const [rightSidebarOpen, setRightSidebarOpen] = React.useState(
    () => (typeof window !== "undefined" ? window.innerWidth >= 1024 : true),
  )
  const [isInsightsCollapsed, setIsInsightsCollapsed] = React.useState(false)
  const [showCollapseButton, setShowCollapseButton] = React.useState(false)

  const { selectedStaff, setSelectedStaff } = useStaffFilter()
  const isMobileViewport = useIsMobile()

  const searchParams = useSearchParams()
  const sessionId = searchParams.get("sessionId") ?? undefined

  const { toast } = useToast()

  const hasActiveFilters = React.useMemo(() => {
    return searchQuery !== "" || statusFilter !== "All" || needsAttention || selectedStaff !== "all"
  }, [searchQuery, statusFilter, needsAttention, selectedStaff])

  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("All")
    setNeedsAttention(false)
    setSelectedStaff("all")
  }

  React.useEffect(() => {
    localStorage.setItem("berrytap.orders.compact", JSON.stringify(isCompact))
  }, [isCompact])

  React.useEffect(() => {
    if (rightSidebarOpen) {
      const timer = setTimeout(() => {
        setShowCollapseButton(true)
      }, 275)

      return () => clearTimeout(timer)
    }

    setShowCollapseButton(false)
  }, [rightSidebarOpen])

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const showButtonText = containerWidth >= 700

  const visibleColumns = React.useMemo(() => {
    if (windowWidth < 640) return compactMobileColumns
    return isCompact ? compactDesktopColumns : fullColumns
  }, [windowWidth, isCompact])

  const showCompactToggle = windowWidth >= 640

  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    const savedView = localStorage.getItem("ordersViewMode")
    if (savedView === "table" || savedView === "card") {
      setViewMode(savedView)
    }
  }, [])

  const handleViewModeChange = (mode: "table" | "card") => {
    setViewMode(mode)
    localStorage.setItem("ordersViewMode", mode)
  }

  const handleOrderClick = (order: (typeof mockDetailedOrders)[0]) => {
    setSelectedOrder(order)
    setDrawerOpen(true)
  }

  const handleMarkPaid = (order: typeof selectedOrder) => {
    if (!order) return

    toast({
      title: "✅ Payment received",
      description: (
        <div className="space-y-2">
          <p>Payment received for Order #{order.id}. Clear table?</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                toast({
                  title: "Table cleared",
                  description: `Table ${order.table} is now available.`,
                })
              }}
            >
              Yes, Clear
            </Button>
            <Button size="sm" variant="outline">
              Still Dining
            </Button>
          </div>
        </div>
      ),
    })
  }

  const filteredOrders = React.useMemo(() => {
    return mockDetailedOrders.filter((order) => {
      if (statusFilter !== "All" && order.status !== statusFilter) return false
      if (needsAttention && order.urgency !== "delayed" && order.urgency !== "warning") return false

      if (selectedStaff === "all") {
        // Show all orders
      } else if (selectedStaff === "me") {
        // Show only orders assigned to "You" (staffId S1)
        if (order.staffId !== "S1") return false
      } else {
        // Show orders for specific staff member
        if (order.staff !== selectedStaff) return false
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          order.id.toLowerCase().includes(query) ||
          order.customer.toLowerCase().includes(query) ||
          order.table.toLowerCase().includes(query)
        )
      }
      return true
    })
  }, [statusFilter, needsAttention, selectedStaff, searchQuery])

  React.useEffect(() => {
    if (!rightSidebarOpen || isMobileViewport) {
      setSidebarHeight(null)
      return
    }

    const updateSidebarHeight = () => {
      if (!mainColumnRef.current) return
      const mainHeight = mainColumnRef.current.getBoundingClientRect().height
      const viewportOffset =
        typeof window !== "undefined"
          ? Math.min(Math.max(Math.round(window.innerHeight * 0.22), 160), 360)
          : 200
      const height = Math.max(mainHeight + viewportOffset - 4, 280)
      setSidebarHeight(height)
    }

    const timer = setTimeout(updateSidebarHeight, 100)
    updateSidebarHeight()

    const observer = new ResizeObserver(updateSidebarHeight)
    if (mainColumnRef.current) {
      observer.observe(mainColumnRef.current)
    }

    window.addEventListener("resize", updateSidebarHeight)

    return () => {
      clearTimeout(timer)
      observer.disconnect()
      window.removeEventListener("resize", updateSidebarHeight)
    }
  }, [rightSidebarOpen, isMobileViewport, filteredOrders, viewMode, isCompact, isLoading])

  const stats = {
    active: mockDetailedOrders.filter((o) => o.status === "In Progress" || o.status === "Ready").length,
    pending: mockDetailedOrders.filter((o) => o.status === "Pending").length,
    ready: mockDetailedOrders.filter((o) => o.status === "Ready").length,
    completed: mockDetailedOrders.filter((o) => o.status === "Completed").length,
    cancelled: mockDetailedOrders.filter((o) => o.status === "Cancelled").length,
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "on-time":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "delayed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "text-green-600"
      case "Pending":
        return "text-yellow-600"
      case "Failed":
      case "Refunded":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getLoadPercentage = (load: string) => {
    switch (load) {
      case "high":
        return 85
      case "medium":
        return 55
      case "low":
        return 25
      default:
        return 0
    }
  }

  const InsightsContent = ({ className }: { className?: string }) => (
    <div
      className={cn(
        "space-y-4",
        className,
      )}
    >
      {/* Quick Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
            <AlertCircle className="h-4 w-4 mr-2 text-red-500" />
            Needs Attention
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
            <Flame className="h-4 w-4 mr-2 text-orange-500" />
            Rush Orders
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
            <Wallet className="h-4 w-4 mr-2 text-yellow-500" />
            Unpaid
          </Button>
          <Button variant="outline" className="w-full justify-start bg-transparent" size="sm">
            <ClipboardList className="h-4 w-4 mr-2 text-blue-500" />
            My Orders
          </Button>
        </CardContent>
      </Card>

      {/* Performance Snapshot */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg Prep Time</span>
              <div className="flex items-center gap-1">
                <span className="font-semibold">18 min</span>
                <TrendingUp className="h-3 w-3 text-red-500" />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Avg Order Value</span>
              <span className="font-semibold">$42.50</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Orders per Hour</span>
              <span className="font-semibold">7.2</span>
            </div>
          </div>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockOrdersPerformance}>
                <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Staff Workload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Staff Workload</CardTitle>
        </CardHeader>
        <CardContent className="max-h-64 overflow-y-auto pr-2.5 space-y-2">
          {mockStaffWorkload.map((staff) => (
            <div
              key={staff.id}
              onClick={() => setSelectedStaff(staff.name)}
              className={`flex items-center justify-between border rounded-lg p-2 cursor-pointer transition-all hover:bg-muted/50 ${
                selectedStaff === staff.name ? "ring-2 ring-primary bg-muted/30" : ""
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs">
                    {staff.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{staff.name}</p>
                  <p className="text-xs text-muted-foreground">{staff.role}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {staff.activeOrders} {staff.activeOrders === 1 ? "order" : "orders"}
                </span>
                <Progress value={getLoadPercentage(staff.load)} className="w-16 h-1.5" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Table Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Table Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Occupied</span>
              <span className="font-semibold">12 / 20</span>
            </div>
            <div className="grid grid-cols-10 gap-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-6 rounded ${i < 12 ? "bg-red-500" : i < 17 ? "bg-green-500" : "bg-yellow-500"}`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockRecentOrderActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
              <div className="flex-1 space-y-1">
                <p className="text-sm">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  const isMobileCardView = windowWidth < 480

  return (
    <div className="relative h-full">
      <div
        className={cn(
          "mx-auto w-full max-w-screen-2xl",
          "grid gap-6 transition-all duration-300 px-4 py-4 md:px-6 md:py-6",
          "grid-cols-1",
          rightSidebarOpen ? "lg:grid-cols-[1fr_minmax(200px,22vw)]" : "lg:grid-cols-1",
        )}
      >
        <section className="flex flex-col gap-6 min-w-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRightSidebarOpen((prev) => !prev)}
                  className="lg:hidden"
                >
                  <ChevronDown
                    className={cn("h-5 w-5 transition-transform", rightSidebarOpen ? "rotate-180" : "")}
                  />
                </Button>
                {!rightSidebarOpen && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="hidden md:flex h-10 w-10 lg:h-12 lg:w-12 rounded-full shadow-lg bg-transparent border-2 shrink-0"
                    onClick={() => {
                      setRightSidebarOpen(true)
                      setIsInsightsCollapsed(false)
                    }}
                  >
                    <ChevronDown className="h-4 w-4 lg:h-5 lg:w-5 -rotate-90" />
                  </Button>
                )}
                <Button variant="outline" size="sm" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "cursor-pointer px-3 py-1 lg:px-2.5 lg:py-0.5 text-sm rounded-full",
              statusFilter === "In Progress"
                ? "bg-blue-500 text-white border-blue-500 dark:bg-blue-500 dark:text-white dark:border-blue-500"
                : "hover:bg-blue-100 dark:hover:bg-blue-900",
            )}
            onClick={() => setStatusFilter(statusFilter === "In Progress" ? "All" : "In Progress")}
          >
            {stats.active} Active
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              "cursor-pointer px-3 py-1 lg:px-2.5 lg:py-0.5 text-sm rounded-full",
              statusFilter === "Pending"
                ? "bg-gray-300 text-gray-900 border-gray-400 dark:bg-gray-600 dark:text-white dark:border-gray-600"
                : "hover:bg-gray-200 dark:hover:bg-gray-700",
            )}
            onClick={() => setStatusFilter(statusFilter === "Pending" ? "All" : "Pending")}
          >
            {stats.pending} Pending
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              "cursor-pointer px-3 py-1 lg:px-2.5 lg:py-0.5 text-sm rounded-full",
              statusFilter === "Ready"
                ? "bg-green-500 text-white border-green-500 dark:bg-green-500 dark:text-white dark:border-green-500"
                : "hover:bg-green-100 dark:hover:bg-green-900",
            )}
            onClick={() => setStatusFilter(statusFilter === "Ready" ? "All" : "Ready")}
          >
            {stats.ready} Ready
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              "cursor-pointer px-3 py-1 lg:px-2.5 lg:py-0.5 text-sm rounded-full",
              statusFilter === "Completed"
                ? "bg-slate-500 text-white border-slate-500 dark:bg-slate-500 dark:text-white dark:border-slate-500"
                : "hover:bg-slate-200 dark:hover:bg-slate-700",
            )}
            onClick={() => setStatusFilter(statusFilter === "Completed" ? "All" : "Completed")}
          >
            {stats.completed} Completed Today
          </Badge>
          <Badge
            variant="secondary"
            className={cn(
              "cursor-pointer px-3 py-1 lg:px-2.5 lg:py-0.5 text-sm rounded-full",
              statusFilter === "Cancelled"
                ? "bg-red-600 text-white border-red-600 dark:bg-red-600 dark:text-white dark:border-red-600"
                : "hover:bg-red-100 dark:hover:bg-red-900",
            )}
            onClick={() => setStatusFilter(statusFilter === "Cancelled" ? "All" : "Cancelled")}
          >
            {stats.cancelled} Cancelled
          </Badge>
          {hasActiveFilters && (
            <Badge
              variant="secondary"
              className="cursor-pointer px-3 py-1 lg:px-2.5 lg:py-0.5 text-sm rounded-full bg-orange-500 text-white hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 border-orange-500 dark:border-orange-600"
              onClick={handleResetFilters}
            >
              <X className="h-3 w-3 mr-1" />
              Reset
            </Badge>
          )}
        </div>

        {/* Controls */}
        <div ref={controlsContainerRef} className="flex flex-wrap items-center gap-2 w-full">
          {/* Search bar - full width on mobile, flexible on desktop */}
          <div className="relative w-full md:min-w-[120px] md:max-w-[240px] md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Status dropdown - flexible on mobile, fixed on desktop */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="flex-1 md:w-[120px] md:flex-none shrink-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="All">All Status</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Ready">Ready</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Staff dropdown - flexible on mobile, fixed on desktop */}
          <Select value={selectedStaff} onValueChange={setSelectedStaff}>
            <SelectTrigger className="flex-1 md:w-[120px] md:flex-none shrink-0">
              <SelectValue placeholder="Staff" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all">All Staff</SelectItem>
              <SelectItem value="me">You (My Orders)</SelectItem>
              <SelectItem value="John Smith">John Smith</SelectItem>
              <SelectItem value="Maria Garcia">Maria Garcia</SelectItem>
              <SelectItem value="David Lee">David Lee</SelectItem>
            </SelectContent>
          </Select>

          {/* Needs Attention - adapts based on container width */}
          <Button
            variant={needsAttention ? "secondary" : "outline"}
            size="sm"
            onClick={() => setNeedsAttention(!needsAttention)}
            className={cn(
              "shrink-0 overflow-hidden",
              "transition-all duration-300 ease-in-out",
              showButtonText ? "min-w-[140px] px-3 justify-start" : "w-9 h-9 px-0 justify-center",
              needsAttention &&
                "bg-yellow-100 text-yellow-700 border-yellow-400 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-600 dark:hover:bg-yellow-900/40",
            )}
          >
            <div className="flex items-center justify-center gap-0">
              <AlertTriangle
                className={cn(
                  "h-4 w-4 shrink-0 transition-all duration-300 ease-in-out",
                  showButtonText && "mr-2",
                  needsAttention && "text-yellow-600 dark:text-yellow-400",
                )}
              />
              <span
                className={cn(
                  "whitespace-nowrap overflow-hidden",
                  "transition-all duration-300 ease-in-out",
                  showButtonText ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0",
                )}
              >
                Needs Attention
              </span>
            </div>
          </Button>

          {/* Compact toggle */}
          {viewMode === "table" && (
            <div className="flex max-sm:hidden items-center gap-2 px-3 py-1.5 h-12 lg:h-9 border rounded-md shrink-0">
              <Switch id="compact-view" checked={isCompact} onCheckedChange={setIsCompact} />
              <Label htmlFor="compact-view" className="text-sm cursor-pointer">
                Compact
              </Label>
            </div>
          )}

          {/* View mode toggle */}
          <div className="flex max-sm:hidden items-center gap-1 border rounded-md shrink-0">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => handleViewModeChange("table")}
              className="h-9 w-9"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => handleViewModeChange("card")}
              className="h-9 w-9"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

        {/* Main Content - Only table/card view */}
        <div className="min-w-0" ref={mainColumnRef}>
          {/* Orders View */}
          {isLoading ? (
            <SkeletonBlock rows={8} />
          ) : filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search" : "Create your first order to get started"}
                </p>
                <Button onClick={() => setNewOrderModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Order
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div>
              {viewMode === "table" ? (
                isMobileCardView ? (
                  <div className="space-y-2">
                    <AnimatePresence mode="popLayout">
                      {filteredOrders.slice(0, 10).map((order) => (
                        <motion.div
                          key={order.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => handleOrderClick(order)}
                          className="rounded-xl border p-3 shadow-sm bg-card text-sm flex flex-col gap-2 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all"
                        >
                          <div className="flex justify-between items-start font-medium">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-8 rounded-full ${getUrgencyColor(order.urgency)}`} />
                              <span className="font-semibold">#{order.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={order.status} />
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full hover:bg-muted transition-colors h-8 w-8"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  side="top"
                                  className="min-w-[180px] sm:min-w-[200px]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem disabled>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Order
                                  </DropdownMenuItem>
                                  <DropdownMenuItem disabled>
                                    <Copy className="mr-2 h-4 w-4" />
                                    Duplicate
                                  </DropdownMenuItem>
                                  <DropdownMenuItem disabled>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Receipt
                                  </DropdownMenuItem>
                                  <DropdownMenuItem disabled>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Order
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-base">Table {order.table}</span>
                            <span className="font-bold text-base">${order.total.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>{order.customer}</span>
                            <span>{order.time}</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Card className="overflow-hidden">
                    <div className="w-full overflow-x-auto md:overflow-visible">
                      <Table
                        className={cn(
                          "w-full border-separate border-spacing-0 text-sm",
                          "[&_th]:py-4 [&_th]:align-middle",
                          "[&_td]:py-4 [&_td]:align-middle",
                          isCompact && "table-fixed",
                          windowWidth < 640 && "[&>tbody>tr>td]:py-1 [&>thead>tr>th]:py-1 text-xs",
                        )}
                      >
                        <colgroup>
                          {visibleColumns.map((_, i) => (
                            <col key={i} style={{ width: `${100 / visibleColumns.length}%` }} />
                          ))}
                        </colgroup>
                        <TableHeader className="bg-muted/50">
                          <TableRow className="[&>th:first-child]:rounded-tl-lg [&>th:last-child]:rounded-tr-lg">
                            {visibleColumns.includes("orderNumber") && (
                              <TableHead className="align-middle text-center">Order #</TableHead>
                            )}
                            {visibleColumns.includes("table") && (
                              <TableHead className="align-middle text-center">Table</TableHead>
                            )}
                            {visibleColumns.includes("customer") && (
                              <TableHead className="align-middle text-center">Customer</TableHead>
                            )}
                            {visibleColumns.includes("items") && (
                              <TableHead className="align-middle text-center">Items</TableHead>
                            )}
                            {visibleColumns.includes("total") && (
                              <TableHead className="align-middle text-center">Total</TableHead>
                            )}
                            {visibleColumns.includes("time") && (
                              <TableHead className="align-middle text-center">Time</TableHead>
                            )}
                            {visibleColumns.includes("status") && (
                              <TableHead className="align-middle text-center">Status</TableHead>
                            )}
                            {visibleColumns.includes("staff") && (
                              <TableHead className="align-middle text-center">Staff</TableHead>
                            )}
                            {visibleColumns.includes("actions") && (
                              <TableHead className="text-center align-middle">Actions</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrders.slice(0, 10).map((order) => (
                            <TableRow
                              key={order.id}
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => handleOrderClick(order)}
                            >
                              {visibleColumns.includes("orderNumber") && (
                                <TableCell className="font-medium align-middle">
                                  <div className="flex items-center gap-2 justify-center">
                                    <div className={`w-1 h-8 rounded-full ${getUrgencyColor(order.urgency)}`} />
                                    <span className="whitespace-normal break-words">{order.id}</span>
                                  </div>
                                </TableCell>
                              )}
                              {visibleColumns.includes("table") && (
                                <TableCell className="whitespace-normal break-words align-middle text-center">
                                  Table {order.table}
                                </TableCell>
                              )}
                              {visibleColumns.includes("customer") && (
                                <TableCell className="whitespace-normal break-words align-middle text-center">
                                  {order.customer}
                                </TableCell>
                              )}
                              {visibleColumns.includes("items") && (
                                <TableCell
                                  className={cn("align-middle", order.specialNotes ? "text-right" : "text-center")}
                                >
                                  <div
                                    className={cn(
                                      "flex items-center gap-2",
                                      order.specialNotes ? "justify-end" : "justify-center",
                                    )}
                                  >
                                    {order.items.length}
                                    {order.specialNotes && (
                                      <Badge variant="outline" className="text-xs">
                                        Note
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                              )}
                              {visibleColumns.includes("total") && (
                                <TableCell className="whitespace-normal break-words align-middle text-center">
                                  ${order.total.toFixed(2)}
                                </TableCell>
                              )}
                              {visibleColumns.includes("time") && (
                                <TableCell className="text-muted-foreground whitespace-normal break-words align-middle text-center">
                                  {order.time}
                                </TableCell>
                              )}
                              {visibleColumns.includes("status") && (
                                <TableCell className="align-middle text-center">
                                  <StatusBadge status={order.status} />
                                </TableCell>
                              )}
                              {visibleColumns.includes("staff") && (
                                <TableCell className="align-middle text-center">
                                  <div className="flex items-center gap-2 justify-center">
                                    <Avatar className="h-6 w-6">
                                      <AvatarFallback className="text-xs">
                                        {order.staff
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm whitespace-normal break-words">
                                      {order.staff.split(" ")[0]}
                                    </span>
                                  </div>
                                </TableCell>
                              )}
                              {visibleColumns.includes("actions") && (
                                <TableCell className="text-center align-middle">
                                  <div className="flex justify-center">
                                    <div className="flex items-center gap-2">
                                      <CreditCard className={`h-4 w-4 ${getPaymentStatusColor(order.paymentStatus)}`} />
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full hover:bg-muted transition-colors h-8 w-8"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                          align="end"
                                          side={isMobileViewport ? "top" : "bottom"}
                                          className="min-w-[180px] sm:min-w-[200px]"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <DropdownMenuItem>
                                            <Eye className="mr-2 h-4 w-4" />
                                            View Details
                                          </DropdownMenuItem>
                                          <DropdownMenuItem disabled>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Order
                                          </DropdownMenuItem>
                                          <DropdownMenuItem disabled>
                                            <Copy className="mr-2 h-4 w-4" />
                                            Duplicate
                                          </DropdownMenuItem>
                                          <DropdownMenuItem disabled>
                                            <Printer className="mr-2 h-4 w-4" />
                                            Print Receipt
                                          </DropdownMenuItem>
                                          <DropdownMenuItem disabled>
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Cancel Order
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                )
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  {filteredOrders.slice(0, 6).map((order) => (
                    <Card
                      key={order.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleOrderClick(order)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getUrgencyColor(order.urgency)}`} />
                              <CardTitle className="text-lg">{order.id}</CardTitle>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Table {order.table}</span>
                              <span>•</span>
                              <span>{order.time}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={order.status} />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="rounded-full hover:bg-muted transition-colors h-8 w-8"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                side={isMobileViewport ? "top" : "bottom"}
                                className="min-w-[180px] sm:min-w-[200px]"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Order
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled>
                                  <Printer className="mr-2 h-4 w-4" />
                                  Print Receipt
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled>
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Cancel Order
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">{order.customer}</span>
                          <span className="font-semibold">${order.total.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{order.items.length} items</span>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {order.staff
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{order.staff.split(" ")[0]}</span>
                          </div>
                        </div>
                        {order.specialNotes && (
                          <Badge variant="outline" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Special request
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        </section>

        {rightSidebarOpen && (
          <aside
            ref={sidebarRef}
            className="hidden lg:block transition-all duration-300 min-w-[200px] max-w-[22vw] w-full flex-shrink-0 self-start"
            style={sidebarHeight ? { height: sidebarHeight, maxHeight: sidebarHeight } : undefined}
          >
            <SidebarPanel
              title="Insights"
              collapsible
              isCollapsed={isInsightsCollapsed}
              onToggle={() => {
                const newCollapsed = !isInsightsCollapsed
                setIsInsightsCollapsed(newCollapsed)
                if (newCollapsed) {
                  setRightSidebarOpen(false)
                }
              }}
              className="h-full w-full"
              contentClassName="flex flex-col h-full min-h-0"
              bodyClassName="flex-1 min-h-0 overflow-y-auto pr-2 md:pr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <InsightsContent />
            </SidebarPanel>
          </aside>
        )}
      </div>

      {isMobileViewport && rightSidebarOpen && (
        <Sheet open={rightSidebarOpen} onOpenChange={setRightSidebarOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-md overflow-y-auto px-4 [&>button]:sm:hidden [&>button]:lg:block [&>button]:!top-1 pointer-events-auto"
          >
            <div className="pointer-events-auto">
              <SheetHeader className="pb-2">
                <SheetTitle className="leading-none">Insights</SheetTitle>
              </SheetHeader>
              <Separator className="mt-1.5 mb-0" />
              <InsightsContent className="pt-4 pb-6" />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {isMobileViewport && showCollapseButton && (
        <Button
          variant="outline"
          onClick={() => setRightSidebarOpen(false)}
          className="hidden sm:flex lg:hidden !h-7 !w-7 rounded-full !p-0 !min-w-0 !min-h-0 shrink-0 items-center justify-center fixed top-[12px] right-[434px] z-[999] shadow-lg bg-white pointer-events-auto transition-all duration-200 animate-in fade-in-0 zoom-in-95 border-0"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>
      )}

      {/* Order Details Drawer */}
      {selectedOrder && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={selectedOrder.id}
          subtitle={`Placed: ${selectedOrder.timestamp} • ${selectedOrder.time}`}
        >
          <div className="space-y-6 px-4">
            <Select value={selectedOrder.status} disabled>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Connected Records */}
            <ConnectedRecords
              order={{ id: selectedOrder.id, total: selectedOrder.total }}
              table={{ id: selectedOrder.table, label: `Table ${selectedOrder.table}` }}
              reservation={
                selectedOrder.customer !== "Walk-in"
                  ? { id: "RSV-2847", name: selectedOrder.customer, time: selectedOrder.time }
                  : undefined
              }
              sessionId={sessionId}
            />

            {/* Order Info */}
            <div className="space-y-3">
              <h3 className="font-semibold">Order Information</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Table</p>
                  <p className="font-medium">Table {selectedOrder.table}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Customer</p>
                  <p className="font-medium">{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Order Type</p>
                  <p className="font-medium">{selectedOrder.orderType}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Assigned Staff</p>
                  <p className="font-medium">{selectedOrder.staff}</p>
                </div>
              </div>
              {selectedOrder.specialNotes && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Special Notes
                  </p>
                  <p className="text-sm mt-1">{selectedOrder.specialNotes}</p>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Items</h3>
                <Button variant="ghost" size="sm" disabled>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-start justify-between p-3 border rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        <span className="text-muted-foreground">x{item.qty}</span>
                      </div>
                      {item.mods && <p className="text-sm text-muted-foreground mt-1">{item.mods}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-2 pt-3 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tax</span>
                <span>${selectedOrder.tax.toFixed(2)}</span>
              </div>
              {selectedOrder.service > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Service Charge</span>
                  <span>${selectedOrder.service.toFixed(2)}</span>
                </div>
              )}
              {selectedOrder.tip > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tip</span>
                  <span>${selectedOrder.tip.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>${selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="space-y-3">
              <h3 className="font-semibold">Payment</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className={`font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                    {selectedOrder.paymentStatus}
                  </p>
                </div>
                {selectedOrder.paymentMethod && (
                  <div>
                    <p className="text-muted-foreground">Method</p>
                    <p className="font-medium">{selectedOrder.paymentMethod}</p>
                  </div>
                )}
              </div>
              {selectedOrder.transactionId && (
                <div>
                  <p className="text-sm text-muted-foreground text-sm">Transaction ID</p>
                  <p className="font-mono text-sm">{selectedOrder.transactionId}</p>
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleMarkPaid(selectedOrder)}>
                  Mark Paid
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Refund
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Split
                </Button>
                <Button variant="outline" size="sm" disabled>
                  Send Invoice
                </Button>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <h3 className="font-semibold">Timeline</h3>
              <div className="space-y-3">
                {selectedOrder.timeline.map((event, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{event.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.event}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{event.user}</span>
                        <span>•</span>
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t space-y-2">
              <div className="flex gap-2">
                <Button className="flex-1" disabled>
                  Mark as Ready
                </Button>
                <Button variant="outline" disabled>
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="outline" disabled>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" disabled>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" disabled>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button variant="outline" size="sm" className="flex-1 bg-transparent" disabled>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Drawer>
      )}

      {/* New Order Modal */}
      <Dialog open={newOrderModalOpen} onOpenChange={setNewOrderModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Order</DialogTitle>
            <DialogDescription>Create a new order for a table</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Table</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select table" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Table 1</SelectItem>
                    <SelectItem value="2">Table 2</SelectItem>
                    <SelectItem value="3">Table 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dine-in">Dine-in</SelectItem>
                    <SelectItem value="takeout">Takeout</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input placeholder="Enter customer name" />
            </div>
            <div className="space-y-2">
              <Label>Menu Items</Label>
              <div className="border rounded-md p-4 space-y-2">
                <Input placeholder="Search menu items..." />
                <p className="text-sm text-muted-foreground">Select items to add to order</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Special Instructions</Label>
              <Input placeholder="Any special requests or notes..." />
            </div>
            <div className="space-y-2">
              <Label>Assigned Staff</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="You" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="you">You</SelectItem>
                  <SelectItem value="john">John Smith</SelectItem>
                  <SelectItem value="maria">Maria Garcia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOrderModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="outline" disabled>
              Save as Draft
            </Button>
            <Button disabled>Save & Send to Kitchen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <StaffFilterProvider>
      <OrdersPageContent />
    </StaffFilterProvider>
  )
}
