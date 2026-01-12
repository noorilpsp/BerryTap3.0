"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  FileText,
  FilePen,
  Package,
  Truck,
  AlertCircle,
  Search,
  Plus,
  Mail,
  Download,
  Inbox,
  X,
  Phone,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Bell,
  FileCheck,
  Send,
} from "lucide-react"
import { CreatePODrawer } from "@/components/inventory/create-po-drawer"
import Link from "next/link"

// Mock data
const poSummary = {
  totalOpen: 12,
  totalOpenValue: 14280,
  draft: { count: 3, value: 2340 },
  ordered: { count: 5, value: 6890 },
  inTransit: { count: 4, value: 5050 },
  overdue: { count: 2, value: 1890 },
}

const purchaseOrders = [
  {
    poId: "po_1847",
    poNumber: "1847",
    status: "overdue",
    supplier: {
      id: "sup_freshfarms",
      name: "Fresh Farms",
      email: "orders@freshfarms.com",
      phone: "+31 20 555 1234",
      preferred: true,
    },
    location: { id: "loc_main", name: "Main Kitchen" },
    itemCount: 15,
    totalValue: 1240,
    currency: "EUR",
    createdAt: "2024-11-10T09:00:00Z",
    createdBy: { id: "user_john", name: "John D." },
    expectedAt: "2024-11-12T10:00:00Z",
    daysOverdue: 3,
    previewItems: [
      { emoji: "🥚", name: "Eggs", qty: "300pc" },
      { emoji: "🥛", name: "Milk", qty: "20L" },
      { emoji: "🧈", name: "Butter", qty: "5kg" },
    ],
    remainingItems: 12,
  },
  {
    poId: "po_1843",
    poNumber: "1843",
    status: "overdue",
    supplier: {
      id: "sup_meatmasters",
      name: "Meat Masters",
      email: "orders@meatmasters.com",
      phone: "+31 20 555 5678",
      preferred: true,
    },
    location: { id: "loc_main", name: "Main Kitchen" },
    itemCount: 6,
    totalValue: 650,
    currency: "EUR",
    createdAt: "2024-11-09T14:00:00Z",
    createdBy: { id: "user_sarah", name: "Sarah M." },
    expectedAt: "2024-11-13T10:00:00Z",
    daysOverdue: 2,
    previewItems: [
      { emoji: "🥩", name: "Beef Tenderloin", qty: "8kg" },
      { emoji: "🍗", name: "Chicken", qty: "15kg" },
    ],
    remainingItems: 4,
  },
  {
    poId: "po_1852",
    poNumber: "1852",
    status: "in_transit",
    supplier: {
      id: "sup_seafoodking",
      name: "Seafood King",
      email: "orders@seafoodking.com",
      phone: "+31 20 555 9012",
      preferred: true,
    },
    location: { id: "loc_main", name: "Main Kitchen" },
    itemCount: 8,
    totalValue: 890,
    currency: "EUR",
    createdAt: "2024-11-13T10:00:00Z",
    createdBy: { id: "user_john", name: "John D." },
    orderedAt: "2024-11-13T10:30:00Z",
    shippedAt: "2024-11-14T08:00:00Z",
    expectedAt: "2024-11-16T10:00:00Z",
    arrivalLabel: "Tomorrow",
    timeline: [
      { step: "ordered", label: "Ordered", date: "Nov 13", completed: true },
      { step: "shipped", label: "Shipped", date: "Nov 14", completed: true },
      { step: "in_transit", label: "In Transit", date: "Now", completed: true, current: true },
      { step: "arriving", label: "Arriving Tomorrow", completed: false },
    ],
    previewItems: [
      { emoji: "🐟", name: "Salmon", qty: "8kg" },
      { emoji: "🦐", name: "Prawns", qty: "3kg" },
      { emoji: "🦞", name: "Lobster", qty: "2kg" },
    ],
    remainingItems: 5,
  },
  {
    poId: "po_1853",
    poNumber: "1853",
    status: "in_transit",
    supplier: {
      id: "sup_meatmasters",
      name: "Meat Masters",
      email: "orders@meatmasters.com",
      phone: "+31 20 555 5678",
      preferred: true,
    },
    location: { id: "loc_main", name: "Main Kitchen" },
    itemCount: 8,
    totalValue: 2340,
    currency: "EUR",
    createdAt: "2024-11-12T11:00:00Z",
    createdBy: { id: "user_sarah", name: "Sarah M." },
    orderedAt: "2024-11-12T11:30:00Z",
    shippedAt: "2024-11-14T14:00:00Z",
    expectedAt: "2024-11-17T10:00:00Z",
    arrivalLabel: "in 2 days",
    timeline: [
      { step: "ordered", label: "Ordered", completed: true },
      { step: "shipped", label: "Shipped", completed: true },
      { step: "in_transit", label: "In Transit", completed: true, current: true },
      { step: "arriving", label: "Arriving in 2 days", completed: false },
    ],
    previewItems: [
      { emoji: "🥩", name: "Ribeye", qty: "10kg" },
      { emoji: "🍗", name: "Chicken", qty: "20kg" },
    ],
    remainingItems: 6,
  },
  {
    poId: "po_1855",
    poNumber: "1855",
    status: "ordered",
    supplier: {
      id: "sup_dairydirect",
      name: "Dairy Direct",
      email: "orders@dairydirect.com",
      phone: "+31 20 555 3456",
      preferred: false,
    },
    location: { id: "loc_main", name: "Main Kitchen" },
    itemCount: 12,
    totalValue: 1890,
    currency: "EUR",
    createdAt: "2024-11-15T08:00:00Z",
    createdBy: { id: "user_john", name: "John D." },
    orderedAt: "2024-11-15T08:30:00Z",
    expectedAt: "2024-11-18T10:00:00Z",
    previewItems: [
      { emoji: "🧀", name: "Mozzarella", qty: "20pc" },
      { emoji: "🥛", name: "Cream", qty: "15L" },
      { emoji: "🧈", name: "Butter", qty: "8kg" },
    ],
    remainingItems: 9,
  },
  {
    poId: "po_1856",
    poNumber: "1856",
    status: "draft",
    supplier: {
      id: "sup_freshfarms",
      name: "Fresh Farms",
      email: "orders@freshfarms.com",
      phone: "+31 20 555 1234",
      preferred: true,
    },
    location: { id: "loc_main", name: "Main Kitchen" },
    itemCount: 8,
    totalValue: 1456,
    currency: "EUR",
    createdAt: "2024-11-15T12:00:00Z",
    createdBy: { id: "user_john", name: "John D." },
    timeLabel: "2 hours ago",
    previewItems: [
      { emoji: "🥚", name: "Eggs", qty: "500pc" },
      { emoji: "🥬", name: "Lettuce", qty: "10kg" },
      { emoji: "🍅", name: "Tomatoes", qty: "15kg" },
    ],
    remainingItems: 5,
  },
]

const completedPOs = [
  {
    poId: "po_1851",
    poNumber: "1851",
    supplier: "Dairy Direct",
    itemCount: 15,
    totalValue: 567,
    receivedAt: "2024-11-13",
    variance: 0,
  },
  {
    poId: "po_1850",
    poNumber: "1850",
    supplier: "Fresh Farms",
    itemCount: 12,
    totalValue: 892,
    receivedAt: "2024-11-12",
    variance: -12,
  },
  {
    poId: "po_1849",
    popoNumber: "1849",
    supplier: "Meat Masters",
    itemCount: 8,
    totalValue: 1450,
    receivedAt: "2024-11-11",
    variance: 0,
  },
  {
    poId: "po_1848",
    poNumber: "1848",
    supplier: "Grain Co",
    itemCount: 6,
    totalValue: 234,
    receivedAt: "2024-11-10",
    variance: 8,
  },
]

function getStatusConfig(status: string) {
  const configs = {
    overdue: { color: "destructive", icon: AlertCircle, label: "Overdue" },
    in_transit: { color: "secondary", icon: Truck, label: "In Transit" },
    ordered: { color: "default", icon: Package, label: "Ordered" },
    draft: { color: "outline", icon: FilePen, label: "Draft" },
    received: { color: "default", icon: FileCheck, label: "Received" },
  } as const

  return configs[status as keyof typeof configs] || configs.draft
}

function POTimeline({ timeline }: { timeline: any[] }) {
  return (
    <div className="flex items-center gap-1 text-xs my-2">
      {timeline.map((step, idx) => (
        <div key={step.step} className="flex items-center">
          {idx > 0 && <div className={`h-px w-8 ${step.completed ? "bg-primary" : "bg-muted"}`} />}
          <div
            className={`h-2 w-2 rounded-full ${
              step.completed ? "bg-primary" : "border-2 border-muted-foreground"
            } ${step.current ? "animate-pulse" : ""}`}
          />
        </div>
      ))}
      <div className="ml-2 text-muted-foreground">{timeline.find((s) => s.current)?.label}</div>
    </div>
  )
}

function POCard({ po, onSelect, isSelected }: { po: any; onSelect: (id: string) => void; isSelected: boolean }) {
  const statusConfig = getStatusConfig(po.status)
  const StatusIcon = statusConfig.icon

  return (
    <Card
      className={`border-l-4 ${
        po.status === "overdue"
          ? "border-l-destructive bg-destructive/5"
          : po.status === "in_transit"
            ? "border-l-purple-500"
            : po.status === "ordered"
              ? "border-l-blue-500"
              : "border-l-muted border-dashed"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect(po.poId)}
            aria-label={`Select PO ${po.poNumber}`}
          />

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={statusConfig.color} className="gap-1">
                    <StatusIcon className="h-3 w-3" />
                    {po.status === "overdue" ? "Overdue" : statusConfig.label}
                  </Badge>
                  <span className="font-semibold">PO #{po.poNumber}</span>
                  {po.status === "draft" && <span className="text-sm text-muted-foreground">(Draft)</span>}
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium">{po.supplier.name}</span>
                  {po.status === "overdue" && (
                    <span className="text-destructive font-medium">
                      Expected:{" "}
                      {new Date(po.expectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} (
                      {po.daysOverdue} days overdue)
                    </span>
                  )}
                  {po.status === "in_transit" && (
                    <span className="text-muted-foreground">Arriving: {po.arrivalLabel}</span>
                  )}
                  {po.status === "ordered" && (
                    <span className="text-muted-foreground">
                      Expected:{" "}
                      {new Date(po.expectedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                  {po.status === "draft" && <span className="text-muted-foreground">Created: {po.timeLabel}</span>}
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{po.itemCount} items</span>
                  <span>€{po.totalValue.toLocaleString()}</span>
                  <span>{po.location.name}</span>
                </div>
              </div>
            </div>

            {po.timeline && <POTimeline timeline={po.timeline} />}

            <div className="flex flex-wrap gap-2">
              {po.previewItems.map((item: any, idx: number) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {item.emoji} {item.name} ({item.qty})
                </Badge>
              ))}
              {po.remainingItems > 0 && (
                <Badge variant="outline" className="text-xs">
                  +{po.remainingItems} more
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {po.status === "overdue" && (
                <>
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Phone className="h-3 w-3" />
                    Contact Supplier
                  </Button>
                  <Button size="sm" className="gap-2">
                    <Inbox className="h-3 w-3" />
                    Mark Received
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </>
              )}

              {po.status === "in_transit" && (
                <>
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Bell className="h-3 w-3" />
                    Set Reminder
                  </Button>
                  <Button size="sm" className="gap-2">
                    <Inbox className="h-3 w-3" />
                    Mark Received
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2">
                    <Eye className="h-3 w-3" />
                    View
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </>
              )}

              {po.status === "ordered" && (
                <>
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Mail className="h-3 w-3" />
                    Email Supplier
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2">
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive">
                    <X className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </>
              )}

              {po.status === "draft" && (
                <>
                  <Button size="sm" className="gap-2">
                    <Edit className="h-3 w-3" />
                    Continue Editing
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                    <Send className="h-3 w-3" />
                    Send to Supplier
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedSupplier, setSelectedSupplier] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [activeFilters, setActiveFilters] = useState<string[]>(["ordered", "in_transit", "Fresh Farms"])
  const [selectedPOs, setSelectedPOs] = useState<string[]>([])
  const [createPOOpen, setCreatePOOpen] = useState(false)

  const togglePOSelection = (poId: string) => {
    setSelectedPOs((prev) => (prev.includes(poId) ? prev.filter((id) => id !== poId) : [...prev, poId]))
  }

  const removeFilter = (filter: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filter))
  }

  const overduePOs = purchaseOrders.filter((po) => po.status === "overdue")
  const inTransitPOs = purchaseOrders.filter((po) => po.status === "in_transit")
  const orderedPOs = purchaseOrders.filter((po) => po.status === "ordered")
  const draftPOs = purchaseOrders.filter((po) => po.status === "draft")

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/inventory" className="hover:text-foreground">
              Inventory
            </Link>
            <span>/</span>
            <span className="text-foreground">Purchase Orders</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">Manage supplier orders and track deliveries</p>
        </div>
        <Button onClick={() => setCreatePOOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New PO
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Open POs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{poSummary.totalOpen}</div>
            <p className="text-xs text-muted-foreground">€{poSummary.totalOpenValue.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <FilePen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{poSummary.draft.count}</div>
            <p className="text-xs text-muted-foreground">€{poSummary.draft.value.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ordered</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{poSummary.ordered.count}</div>
            <p className="text-xs text-muted-foreground">€{poSummary.ordered.value.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{poSummary.inTransit.count}</div>
            <p className="text-xs text-muted-foreground">€{poSummary.inTransit.value.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{poSummary.overdue.count}</div>
            <p className="text-xs text-muted-foreground">€{poSummary.overdue.value.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search POs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft (3)</SelectItem>
              <SelectItem value="ordered">Ordered (5)</SelectItem>
              <SelectItem value="in_transit">In Transit (4)</SelectItem>
              <SelectItem value="overdue">Overdue (2)</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              <SelectItem value="freshfarms">Fresh Farms</SelectItem>
              <SelectItem value="meatmasters">Meat Masters</SelectItem>
              <SelectItem value="seafoodking">Seafood King</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="main">Main Kitchen</SelectItem>
              <SelectItem value="bar">Bar</SelectItem>
              <SelectItem value="prep">Prep Station</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <Card>
            <CardContent className="flex items-center gap-2 p-4">
              <span className="text-sm font-medium">Active Filters:</span>
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="gap-1">
                  {filter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter(filter)} />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setActiveFilters([])} className="ml-auto">
                Clear All
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardContent className="flex flex-wrap gap-2 p-4">
            <Button variant="outline" className="gap-2 bg-transparent">
              <FileText className="h-4 w-4" />
              Create from Suggestions (5)
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Inbox className="h-4 w-4" />
              Receive Multiple
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Mail className="h-4 w-4" />
              Email All
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Section */}
      {overduePOs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <h2 className="text-lg font-semibold">OVERDUE ({overduePOs.length})</h2>
          </div>
          {overduePOs.map((po) => (
            <POCard key={po.poId} po={po} onSelect={togglePOSelection} isSelected={selectedPOs.includes(po.poId)} />
          ))}
        </div>
      )}

      {/* In Transit Section */}
      {inTransitPOs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold">IN TRANSIT ({inTransitPOs.length})</h2>
          </div>
          {inTransitPOs.map((po) => (
            <POCard key={po.poId} po={po} onSelect={togglePOSelection} isSelected={selectedPOs.includes(po.poId)} />
          ))}
        </div>
      )}

      {/* Ordered Section */}
      {orderedPOs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold">ORDERED (Awaiting Shipment) ({orderedPOs.length})</h2>
          </div>
          <POCard
            po={orderedPOs[0]}
            onSelect={togglePOSelection}
            isSelected={selectedPOs.includes(orderedPOs[0].poId)}
          />
          {orderedPOs.length > 1 && (
            <Button variant="ghost" className="w-full">
              + {orderedPOs.length - 1} more ordered POs... <span className="ml-auto">Show All →</span>
            </Button>
          )}
        </div>
      )}

      {/* Drafts Section */}
      {draftPOs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FilePen className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">DRAFTS ({draftPOs.length})</h2>
          </div>
          <POCard po={draftPOs[0]} onSelect={togglePOSelection} isSelected={selectedPOs.includes(draftPOs[0].poId)} />
          {draftPOs.length > 1 && (
            <Button variant="ghost" className="w-full">
              + {draftPOs.length - 1} more drafts... <span className="ml-auto">Show All →</span>
            </Button>
          )}
        </div>
      )}

      {/* Recently Completed */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5" />
            RECENTLY COMPLETED
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedPOs.map((po) => (
                <TableRow key={po.poId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-green-500" />#{po.poNumber}
                    </div>
                  </TableCell>
                  <TableCell>{po.supplier}</TableCell>
                  <TableCell>{po.itemCount} items</TableCell>
                  <TableCell>€{po.totalValue}</TableCell>
                  <TableCell>
                    {new Date(po.receivedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <span className={po.variance === 0 ? "" : po.variance < 0 ? "text-green-600" : "text-orange-600"}>
                      {po.variance === 0 ? "€0" : po.variance < 0 ? `−€${Math.abs(po.variance)}` : `+€${po.variance}`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button variant="link" className="w-full mt-4">
            View All Completed POs →
          </Button>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <span className="text-sm text-muted-foreground">Showing {poSummary.totalOpen} open POs</span>
          <div className="flex items-center gap-4">
            <Select defaultValue="25">
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25/page</SelectItem>
                <SelectItem value="50">50/page</SelectItem>
                <SelectItem value="100">100/page</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">Page 1/1</span>
          </div>
        </CardContent>
      </Card>

      {/* Create PO Drawer */}
      <CreatePODrawer open={createPOOpen} onOpenChange={setCreatePOOpen} />
    </div>
  )
}
