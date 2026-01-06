"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Plus,
  Search,
  ChevronDown,
  Package,
  Send,
  Download,
  Truck,
  CheckCircle,
  MoreVertical,
  ClipboardList,
  Phone,
} from "lucide-react"
import { CreateTransferDrawer } from "@/components/inventory/create-transfer-drawer"
import { PickingListDrawer } from "@/components/inventory/picking-list-drawer"
import { ReceiveTransferDrawer } from "@/components/inventory/receive-transfer-drawer"
import Link from "next/link"

// Mock data
const transferSummary = {
  activeTransfers: { count: 8, value: 4230 },
  outgoingPending: { count: 3, locations: ["Main Kitchen"] },
  incomingToReceive: { count: 2, locations: ["Bar", "Prep"] },
  inTransit: { count: 3, value: 1890 },
  completedThisWeek: { count: 12, value: 8450 },
}

const incomingTransfers = [
  {
    transferId: "tr_2024_156",
    transferNumber: "TR-2024-156",
    status: "ready_to_receive",
    fromLocation: { name: "Main Kitchen", emoji: "🍳" },
    toLocation: { name: "Bar", emoji: "🍷" },
    itemCount: 8,
    totalValue: 345.0,
    shippedAt: "Today 2:30 PM",
    shippedBy: "Maria L.",
    previewItems: [
      { emoji: "🍷", name: "House Red", qty: "6 btl" },
      { emoji: "🍾", name: "Prosecco", qty: "4 btl" },
      { emoji: "🥃", name: "Whiskey", qty: "2 btl" },
    ],
    remainingItems: 5,
  },
  {
    transferId: "tr_2024_155",
    transferNumber: "TR-2024-155",
    status: "ready_to_receive",
    fromLocation: { name: "Main Kitchen", emoji: "🍳" },
    toLocation: { name: "Prep Station", emoji: "🔪" },
    itemCount: 5,
    totalValue: 127.5,
    shippedAt: "Yesterday",
    shippedBy: "John D.",
    previewItems: [
      { emoji: "🥩", name: "Beef Portions", qty: "4kg" },
      { emoji: "🍗", name: "Chicken", qty: "3kg" },
      { emoji: "🐟", name: "Salmon", qty: "2kg" },
    ],
    remainingItems: 0,
  },
]

const outgoingTransfers = [
  {
    transferId: "tr_2024_158",
    transferNumber: "TR-2024-158",
    status: "pending_pickup",
    fromLocation: { name: "Main Kitchen", emoji: "🍳" },
    toLocation: { name: "Bar", emoji: "🍷" },
    itemCount: 12,
    totalValue: 567.8,
    createdAt: "Today 10:15 AM",
    createdBy: "Sarah M.",
    requestedBy: "Bar Manager (Low stock alert)",
  },
]

const inTransitTransfers = [
  {
    transferId: "tr_2024_157",
    transferNumber: "TR-2024-157",
    status: "in_transit",
    fromLocation: { name: "Main Kitchen", emoji: "🍳" },
    toLocation: { name: "Catering Van", emoji: "🚐" },
    destination: "Hilton Conference Room B",
    itemCount: 15,
    totalValue: 892.0,
    shippedAt: "Today 11:00 AM",
    expectedArrival: "~3:00 PM",
    driver: { name: "Mike R.", phone: "+31 6 1234 5678" },
    progress: 65,
  },
]

const completedTransfers = [
  {
    transferNumber: "TR-154",
    route: "Main Kitchen → Bar",
    itemCount: 10,
    value: 234,
    date: "Nov 14",
    status: "complete",
  },
  {
    transferNumber: "TR-153",
    route: "Bar → Main Kitchen",
    itemCount: 3,
    value: 89,
    date: "Nov 14",
    status: "complete",
  },
  {
    transferNumber: "TR-152",
    route: "Main Kitchen → Prep",
    itemCount: 8,
    value: 156,
    date: "Nov 13",
    status: "complete",
  },
  {
    transferNumber: "TR-151",
    route: "Main Kitchen → Catering",
    itemCount: 12,
    value: 445,
    date: "Nov 13",
    status: "partial",
  },
  {
    transferNumber: "TR-150",
    route: "Dry Storage → Main",
    itemCount: 15,
    value: 312,
    date: "Nov 12",
    status: "complete",
  },
]

export default function TransfersPage() {
  const [activeTab, setActiveTab] = useState<"all" | "outgoing" | "incoming" | "transit">("all")
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false)
  const [pickingDrawerOpen, setPickingDrawerOpen] = useState(false)
  const [receiveDrawerOpen, setReceiveDrawerOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<any>(null)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link href="/inventory">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Transfers</h1>
              <p className="text-sm text-muted-foreground">Move stock between locations</p>
            </div>
          </div>
          <Button onClick={() => setCreateDrawerOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Transfer
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Transfers</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transferSummary.activeTransfers.count}</div>
              <p className="text-xs text-muted-foreground">
                €{transferSummary.activeTransfers.value.toLocaleString()} value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outgoing Pending</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transferSummary.outgoingPending.count}</div>
              <p className="text-xs text-muted-foreground">{transferSummary.outgoingPending.locations[0]}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Incoming to Receive</CardTitle>
              <Download className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transferSummary.incomingToReceive.count}</div>
              <p className="text-xs text-muted-foreground">{transferSummary.incomingToReceive.locations.join(", ")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transferSummary.inTransit.count}</div>
              <p className="text-xs text-muted-foreground">€{transferSummary.inTransit.value.toLocaleString()} value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed this Week</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transferSummary.completedThisWeek.count}</div>
              <p className="text-xs text-muted-foreground">
                €{transferSummary.completedThisWeek.value.toLocaleString()} value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search transfers..." className="pl-9" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Status <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              From <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              To <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              Date <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("all")}
            className="rounded-b-none"
          >
            All Transfers ({transferSummary.activeTransfers.count})
          </Button>
          <Button
            variant={activeTab === "outgoing" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("outgoing")}
            className="rounded-b-none"
          >
            <Send className="mr-2 h-4 w-4" />
            Outgoing ({transferSummary.outgoingPending.count})
          </Button>
          <Button
            variant={activeTab === "incoming" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("incoming")}
            className="rounded-b-none"
          >
            <Download className="mr-2 h-4 w-4" />
            Incoming ({transferSummary.incomingToReceive.count})
          </Button>
          <Button
            variant={activeTab === "transit" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("transit")}
            className="rounded-b-none"
          >
            <Truck className="mr-2 h-4 w-4" />
            In Transit ({transferSummary.inTransit.count})
          </Button>
        </div>

        {/* Needs Action - Incoming */}
        {(activeTab === "all" || activeTab === "incoming") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Download className="h-5 w-5" />
                INCOMING - Ready to Receive
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {incomingTransfers.map((transfer) => (
                <Card key={transfer.transferId} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Checkbox />
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Package className="h-5 w-5 text-muted-foreground" />
                              <span className="font-semibold">{transfer.transferNumber}</span>
                            </div>
                            <Badge variant="default" className="bg-green-500">
                              <Download className="mr-1 h-3 w-3" />
                              Ready to Receive
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <span className="font-medium">
                                {transfer.fromLocation.emoji} {transfer.fromLocation.name}
                              </span>
                              <span className="mx-2">→</span>
                              <span className="font-medium">
                                {transfer.toLocation.emoji} {transfer.toLocation.name}
                              </span>
                            </div>
                            <div className="text-right text-muted-foreground">
                              <div>Shipped: {transfer.shippedAt}</div>
                              <div>By: {transfer.shippedBy}</div>
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {transfer.itemCount} items • €{transfer.totalValue.toFixed(2)}
                          </div>

                          <div className="flex flex-wrap gap-2 text-sm">
                            {transfer.previewItems.map((item, idx) => (
                              <span key={idx}>
                                {item.emoji} {item.name} ({item.qty})
                              </span>
                            ))}
                            {transfer.remainingItems > 0 && (
                              <span className="text-muted-foreground">+{transfer.remainingItems}</span>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedTransfer(transfer)
                                setReceiveDrawerOpen(true)
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Receive Transfer
                            </Button>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Needs Action - Outgoing */}
        {(activeTab === "all" || activeTab === "outgoing") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Send className="h-5 w-5" />
                OUTGOING - Pending Pickup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {outgoingTransfers.map((transfer) => (
                <Card key={transfer.transferId} className="border-l-4 border-l-yellow-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <Checkbox />
                        <div className="space-y-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Package className="h-5 w-5 text-muted-foreground" />
                              <span className="font-semibold">{transfer.transferNumber}</span>
                            </div>
                            <Badge variant="secondary" className="bg-yellow-500 text-white">
                              <Send className="mr-1 h-3 w-3" />
                              Pending Pickup
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <span className="font-medium">
                                {transfer.fromLocation.emoji} {transfer.fromLocation.name}
                              </span>
                              <span className="mx-2">→</span>
                              <span className="font-medium">
                                {transfer.toLocation.emoji} {transfer.toLocation.name}
                              </span>
                            </div>
                            <div className="text-right text-muted-foreground">
                              <div>Created: {transfer.createdAt}</div>
                              <div>By: {transfer.createdBy}</div>
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {transfer.itemCount} items • €{transfer.totalValue.toFixed(2)}
                          </div>

                          <div className="text-sm text-muted-foreground">Requested by: {transfer.requestedBy}</div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTransfer(transfer)
                                setPickingDrawerOpen(true)
                              }}
                            >
                              <ClipboardList className="mr-2 h-4 w-4" />
                              View Picking List
                            </Button>
                            <Button size="sm">
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Shipped
                            </Button>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">+ 2 more pending pickup...</p>
                <Button variant="link" size="sm">
                  Show All →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* In Transit */}
        {(activeTab === "all" || activeTab === "transit") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Truck className="h-5 w-5" />
                IN TRANSIT
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {inTransitTransfers.map((transfer) => (
                <Card key={transfer.transferId} className="border-l-4 border-l-purple-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Checkbox />
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-muted-foreground" />
                            <span className="font-semibold">{transfer.transferNumber}</span>
                          </div>
                          <Badge variant="secondary" className="bg-purple-500 text-white">
                            <Truck className="mr-1 h-3 w-3" />
                            In Transit
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium">
                              {transfer.fromLocation.emoji} {transfer.fromLocation.name}
                            </span>
                            <span className="mx-2">→</span>
                            <span className="font-medium">
                              {transfer.toLocation.emoji} {transfer.toLocation.name}
                            </span>
                          </div>
                          <div className="text-right text-muted-foreground">
                            <div>Shipped: {transfer.shippedAt}</div>
                            <div>Driver: {transfer.driver.name}</div>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {transfer.itemCount} items • €{transfer.totalValue.toFixed(2)}
                        </div>

                        {/* Progress Timeline */}
                        <Card className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Picked up</span>
                                <span>In Transit</span>
                                <span>Arriving {transfer.expectedArrival}</span>
                              </div>
                              <div className="relative">
                                <div className="h-2 w-full rounded-full bg-muted">
                                  <div
                                    className="h-2 rounded-full bg-purple-500 transition-all"
                                    style={{ width: `${transfer.progress}%` }}
                                  />
                                </div>
                                <div className="absolute left-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-purple-500" />
                                <div
                                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-purple-500"
                                  style={{ left: `${transfer.progress}%` }}
                                />
                                <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-purple-500 bg-background" />
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium">{transfer.shippedAt}</span>
                                <span className="font-medium">Now</span>
                                <span className="font-medium">{transfer.expectedArrival}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {transfer.destination && (
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {transfer.destination}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Phone className="mr-2 h-4 w-4" />
                            Contact Driver
                          </Button>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">+ 2 more in transit...</p>
                <Button variant="link" size="sm">
                  Show All →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recently Completed */}
        <Card>
          <CardHeader>
            <CardTitle>Recently Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                    <th className="pb-3">TRANSFER #</th>
                    <th className="pb-3">ROUTE</th>
                    <th className="pb-3">ITEMS</th>
                    <th className="pb-3">VALUE</th>
                    <th className="pb-3">DATE</th>
                    <th className="pb-3">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {completedTransfers.map((transfer) => (
                    <tr key={transfer.transferNumber} className="border-b last:border-0">
                      <td className="py-3">
                        {transfer.status === "complete" ? (
                          <CheckCircle className="mr-2 inline h-4 w-4 text-green-500" />
                        ) : (
                          <span className="mr-2 inline text-yellow-500">⚠️</span>
                        )}
                        {transfer.transferNumber}
                      </td>
                      <td className="py-3">{transfer.route}</td>
                      <td className="py-3">{transfer.itemCount}</td>
                      <td className="py-3">€{transfer.value}</td>
                      <td className="py-3">{transfer.date}</td>
                      <td className="py-3">
                        {transfer.status === "complete" ? (
                          <Badge variant="default" className="bg-green-500">
                            Complete
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-500 text-white">
                            Partial
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <Button variant="link" size="sm">
                View All Transfer History →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drawers */}
      <CreateTransferDrawer open={createDrawerOpen} onOpenChange={setCreateDrawerOpen} />
      <PickingListDrawer open={pickingDrawerOpen} onOpenChange={setPickingDrawerOpen} transfer={selectedTransfer} />
      <ReceiveTransferDrawer open={receiveDrawerOpen} onOpenChange={setReceiveDrawerOpen} transfer={selectedTransfer} />
    </div>
  )
}
