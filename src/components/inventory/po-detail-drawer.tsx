"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  X,
  Mail,
  Phone,
  MapPin,
  FileText,
  Printer,
  Package,
  Edit,
  AlertTriangle,
  Download,
  Eye,
  Upload,
} from "lucide-react"
import { ReceiveOrderDrawer } from "./receive-order-drawer"
import { cn } from "@/lib/utils"

interface PODetailDrawerProps {
  poId: string
  open?: boolean
  onClose?: () => void
}

export function PODetailDrawer({ poId, open = true, onClose }: PODetailDrawerProps) {
  const [isReceiveDrawerOpen, setIsReceiveDrawerOpen] = useState(false)
  const [showAllActivity, setShowAllActivity] = useState(false)

  // Mock data - In production, fetch based on poId
  const po = getMockPOData(poId)

  const currentStep = po.timeline.findIndex((step) => step.current)
  const progressPercentage = ((currentStep + 1) / po.timeline.length) * 100

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
          <div className="sticky top-0 bg-background border-b px-6 py-4 z-10">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <SheetTitle>Purchase Order #{po.poNumber}</SheetTitle>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Timeline */}
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Status</h3>

              {/* Timeline */}
              <div className="relative mb-6">
                <div className="flex justify-between items-start mb-2">
                  {po.timeline.map((step, index) => (
                    <div key={step.step} className="flex-1 relative">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center relative z-10",
                            step.completed
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground border-2",
                          )}
                        >
                          {step.completed ? (
                            <span className="text-sm">✓</span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </div>
                        <div className="text-xs font-medium mt-2 text-center">{step.label}</div>
                        <div className="text-xs text-muted-foreground text-center">{step.date}</div>
                        {step.time && <div className="text-xs text-muted-foreground text-center">{step.time}</div>}
                      </div>
                      {index < po.timeline.length - 1 && (
                        <div
                          className={cn(
                            "absolute top-4 left-1/2 w-full h-0.5 -z-0",
                            step.completed ? "bg-primary" : "bg-muted border-t-2 border-dashed",
                          )}
                          style={{ width: "calc(100% - 2rem)", marginLeft: "1rem" }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Message */}
              <div className={cn("p-4 rounded-lg", getStatusColor(po.status))}>
                <div className="flex items-start gap-2">
                  <Package className="h-5 w-5 mt-0.5" />
                  <div>
                    <div className="font-medium">{getStatusLabel(po.status)}</div>
                    <div className="text-sm mt-1">{po.statusMessage}</div>
                    {po.tracking && (
                      <div className="text-sm mt-2 space-y-1">
                        <div>📦 Tracking: {po.tracking.carrier}</div>
                        <div>🚛 {po.tracking.lastUpdate}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Receiving Summary (Partial) */}
            {po.receivingSummary && (
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Receiving Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Received</div>
                    <div className="text-2xl font-bold mt-1">{po.receivingSummary.receivedItems}</div>
                    <div className="text-sm text-muted-foreground">{po.receivingSummary.receivedPercent}%</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Pending</div>
                    <div className="text-2xl font-bold mt-1">{po.receivingSummary.pendingItems}</div>
                    <div className="text-sm text-muted-foreground">{po.receivingSummary.pendingPercent}%</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Received Value</div>
                    <div className="text-2xl font-bold mt-1">€{po.receivingSummary.receivedValue.toFixed(2)}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Outstanding</div>
                    <div className="text-2xl font-bold mt-1">€{po.receivingSummary.outstandingValue.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Info */}
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Order Info</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">🏪 SUPPLIER</div>
                  <div className="space-y-2">
                    <div className="font-medium">{po.supplier.name}</div>
                    <div className="text-sm text-muted-foreground">{po.supplier.email}</div>
                    <div className="text-sm text-muted-foreground">{po.supplier.phone}</div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="text-sm font-medium mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> DELIVERY
                  </div>
                  <div className="space-y-2">
                    <div className="font-medium">{po.location.name}</div>
                    <div className="text-sm text-muted-foreground">{po.location.address}</div>
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-sm font-medium">Expected: {po.dates.expectedLabel}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t text-sm text-muted-foreground space-y-1">
                <div>
                  Created by: {po.createdBy.name} • {formatDate(po.dates.createdAt)}
                </div>
                {po.dates.orderedAt && <div>Sent to supplier: {formatDate(po.dates.orderedAt)}</div>}
              </div>
            </div>

            {/* Line Items */}
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Line Items ({po.lines.length})</h3>

              {po.receivingSummary && (
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" size="sm">
                    All Items
                  </Button>
                  <Button variant="ghost" size="sm">
                    ✅ Received ({po.receivingSummary.receivedItems})
                  </Button>
                  <Button variant="ghost" size="sm">
                    ⏳ Pending ({po.receivingSummary.pendingItems})
                  </Button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left text-sm">
                      <th className="pb-2 font-medium">#</th>
                      <th className="pb-2 font-medium">Item</th>
                      <th className="pb-2 font-medium">SKU</th>
                      <th className="pb-2 font-medium text-right">Ordered</th>
                      {po.receivingSummary && <th className="pb-2 font-medium text-right">Received</th>}
                      {po.receivingSummary && <th className="pb-2 font-medium text-right">Pending</th>}
                      <th className="pb-2 font-medium">Unit</th>
                      <th className="pb-2 font-medium text-right">Price</th>
                      <th className="pb-2 font-medium text-right">Total</th>
                      {po.receivingSummary && <th className="pb-2 font-medium">Status</th>}
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {po.lines.slice(0, 5).map((line, index) => (
                      <tr key={line.lineId} className="border-b">
                        <td className="py-3">{index + 1}</td>
                        <td className="py-3">
                          {line.emoji} {line.name}
                          {line.receivedDate && (
                            <div className="text-xs text-muted-foreground mt-1">Received {line.receivedDate}</div>
                          )}
                        </td>
                        <td className="py-3 text-muted-foreground">{line.code}</td>
                        <td className="py-3 text-right">{line.orderedQty}</td>
                        {po.receivingSummary && (
                          <td className="py-3 text-right">{line.receivedQty !== undefined ? line.receivedQty : "-"}</td>
                        )}
                        {po.receivingSummary && (
                          <td className="py-3 text-right">{line.pendingQty !== undefined ? line.pendingQty : "-"}</td>
                        )}
                        <td className="py-3">{line.unit}</td>
                        <td className="py-3 text-right">€{line.unitPrice.toFixed(2)}</td>
                        <td className="py-3 text-right">€{line.lineTotal.toFixed(2)}</td>
                        {po.receivingSummary && (
                          <td className="py-3">
                            {line.receiveStatus && (
                              <Badge variant={getReceiveStatusVariant(line.receiveStatus)}>{line.receiveStatus}</Badge>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t">
                    <tr>
                      <td colSpan={po.receivingSummary ? 8 : 7} className="pt-3 text-right font-medium">
                        Subtotal:
                      </td>
                      <td className="pt-3 text-right font-medium">€{po.totals.subtotal.toFixed(2)}</td>
                      {po.receivingSummary && <td></td>}
                    </tr>
                    <tr>
                      <td colSpan={po.receivingSummary ? 8 : 7} className="pt-1 text-right font-medium">
                        Delivery:
                      </td>
                      <td className="pt-1 text-right font-medium">€{po.totals.delivery.toFixed(2)}</td>
                      {po.receivingSummary && <td></td>}
                    </tr>
                    <tr className="border-t">
                      <td colSpan={po.receivingSummary ? 8 : 7} className="pt-3 text-right font-bold">
                        TOTAL:
                      </td>
                      <td className="pt-3 text-right font-bold">€{po.totals.total.toFixed(2)}</td>
                      {po.receivingSummary && <td></td>}
                    </tr>
                  </tfoot>
                </table>
              </div>

              {po.lines.length > 5 && (
                <Button variant="link" className="mt-2">
                  + {po.lines.length - 5} more items... Show All Items
                </Button>
              )}
            </div>

            {/* Notes */}
            {(po.notes.supplier || po.notes.internal) && (
              <div className="border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Notes</h3>
                {po.notes.supplier && (
                  <div className="mb-4">
                    <div className="text-sm font-medium mb-1">📝 Supplier Notes:</div>
                    <div className="text-sm text-muted-foreground">{po.notes.supplier}</div>
                  </div>
                )}
                {po.notes.internal && (
                  <div>
                    <div className="text-sm font-medium mb-1">🔒 Internal Notes:</div>
                    <div className="text-sm text-muted-foreground">{po.notes.internal}</div>
                  </div>
                )}
              </div>
            )}

            {/* Documents */}
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Documents</h3>
              <div className="space-y-3">
                {po.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{doc.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {doc.type === "po" && (
                        <>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Invoice
                </Button>
              </div>
            </div>

            {/* Activity Log */}
            <div className="border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Activity Log</h3>
              <div className="space-y-3">
                {po.activityLog.slice(0, showAllActivity ? undefined : 3).map((activity, index) => (
                  <div key={index} className="flex items-start justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">{formatDate(activity.timestamp)}</span>
                      <span className="mx-2">•</span>
                      <span>{activity.action}</span>
                    </div>
                    <span className="text-muted-foreground">{activity.user}</span>
                  </div>
                ))}
              </div>
              {po.activityLog.length > 3 && !showAllActivity && (
                <Button variant="link" className="mt-2" onClick={() => setShowAllActivity(true)}>
                  Show All Activity
                </Button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {po.status === "draft" && (
                <>
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Order
                  </Button>
                  <Button variant="outline">Send to Supplier</Button>
                </>
              )}
              {po.status === "ordered" && (
                <>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Order
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Resend Email
                  </Button>
                  <Button variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button variant="outline" className="text-destructive bg-transparent">
                    <X className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                  <Button onClick={() => setIsReceiveDrawerOpen(true)}>
                    <Package className="h-4 w-4 mr-2" />
                    Receive
                  </Button>
                </>
              )}
              {po.status === "in_transit" && (
                <>
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Supplier
                  </Button>
                  <Button variant="outline">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Set Reminder
                  </Button>
                  <Button variant="outline">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </Button>
                  <Button onClick={() => setIsReceiveDrawerOpen(true)}>
                    <Package className="h-4 w-4 mr-2" />
                    Receive Order
                  </Button>
                </>
              )}
              {po.status === "partial" && (
                <>
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Supplier
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View Receipts
                  </Button>
                  <Button onClick={() => setIsReceiveDrawerOpen(true)}>
                    <Package className="h-4 w-4 mr-2" />
                    Receive Remaining Items
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ReceiveOrderDrawer po={po} open={isReceiveDrawerOpen} onClose={() => setIsReceiveDrawerOpen(false)} />
    </>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case "draft":
      return "bg-muted"
    case "ordered":
      return "bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-100"
    case "in_transit":
      return "bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-100"
    case "partial":
      return "bg-orange-50 dark:bg-orange-950 text-orange-900 dark:text-orange-100"
    case "received":
      return "bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100"
    default:
      return "bg-muted"
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "draft":
      return "DRAFT • Order not yet sent"
    case "ordered":
      return "ORDERED • Awaiting shipment from supplier"
    case "in_transit":
      return "IN TRANSIT • Arriving soon"
    case "partial":
      return "PARTIALLY RECEIVED • Some items outstanding"
    case "received":
      return "RECEIVED • Order complete"
    default:
      return status
  }
}

function getReceiveStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Complete":
      return "default"
    case "Partial":
      return "secondary"
    case "Pending":
      return "outline"
    default:
      return "outline"
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getMockPOData(poId: string) {
  // Mock data based on different states
  if (poId.includes("1852")) {
    return {
      poId: "po_1852",
      poNumber: "1852",
      status: "in_transit",
      statusMessage: "Arriving tomorrow (Nov 16) before 10:00 AM",
      supplier: {
        id: "sup_seafoodking",
        name: "Seafood King",
        email: "orders@seafoodking.com",
        phone: "+31 20 555 9012",
      },
      location: {
        id: "loc_main",
        name: "Main Kitchen",
        address: "123 Restaurant Street, Amsterdam, 1012 AB",
      },
      dates: {
        createdAt: "2024-11-13T10:00:00Z",
        orderedAt: "2024-11-13T10:30:00Z",
        shippedAt: "2024-11-14T08:00:00Z",
        expectedAt: "2024-11-16T10:00:00Z",
        expectedLabel: "Nov 16, 2024 before 10:00 AM",
      },
      createdBy: { id: "user_john", name: "John D." },
      timeline: [
        { step: "created", label: "Created", date: "Nov 13", time: "10:00 AM", completed: true },
        { step: "ordered", label: "Ordered", date: "Nov 13", time: "10:30 AM", completed: true },
        { step: "shipped", label: "Shipped", date: "Nov 14", time: "8:00 AM", completed: true },
        { step: "in_transit", label: "In Transit", date: "Now", completed: true, current: true },
        { step: "received", label: "Received", date: "Tomorrow", completed: false },
      ],
      tracking: {
        carrier: "Supplier Delivery",
        lastUpdate: "Left distribution center at 6:00 AM today",
      },
      lines: [
        {
          lineId: "line_1",
          skuId: "sku_salmon",
          code: "SAL001",
          name: "Atlantic Salmon",
          emoji: "🐟",
          orderedQty: 8,
          unit: "kg",
          unitPrice: 18.5,
          lineTotal: 148,
        },
        {
          lineId: "line_2",
          skuId: "sku_prawns",
          code: "PRW001",
          name: "Tiger Prawns",
          emoji: "🦐",
          orderedQty: 3,
          unit: "kg",
          unitPrice: 28,
          lineTotal: 84,
        },
        {
          lineId: "line_3",
          skuId: "sku_lobster",
          code: "LOB001",
          name: "Lobster Tails",
          emoji: "🦞",
          orderedQty: 2,
          unit: "kg",
          unitPrice: 65,
          lineTotal: 130,
        },
        {
          lineId: "line_4",
          skuId: "sku_seabass",
          code: "SBS001",
          name: "Sea Bass Fillet",
          emoji: "🐟",
          orderedQty: 4,
          unit: "kg",
          unitPrice: 22,
          lineTotal: 88,
        },
        {
          lineId: "line_5",
          skuId: "sku_calamari",
          code: "CAL001",
          name: "Calamari Tubes",
          emoji: "🦑",
          orderedQty: 2,
          unit: "kg",
          unitPrice: 15,
          lineTotal: 30,
        },
        {
          lineId: "line_6",
          skuId: "sku_oysters",
          code: "OYS001",
          name: "Fresh Oysters",
          emoji: "🦪",
          orderedQty: 24,
          unit: "pc",
          unitPrice: 2.5,
          lineTotal: 60,
        },
        {
          lineId: "line_7",
          skuId: "sku_tuna",
          code: "TUN001",
          name: "Tuna Steak",
          emoji: "🐟",
          orderedQty: 3,
          unit: "kg",
          unitPrice: 32,
          lineTotal: 96,
        },
        {
          lineId: "line_8",
          skuId: "sku_crab",
          code: "CRB001",
          name: "Crab Meat",
          emoji: "🦀",
          orderedQty: 1,
          unit: "kg",
          unitPrice: 45,
          lineTotal: 45,
        },
      ],
      totals: {
        subtotal: 681,
        delivery: 25,
        total: 706,
      },
      notes: {
        supplier: "Please deliver before 10 AM. Call when 30 mins away.",
        internal: "Seafood for weekend specials menu.",
      },
      documents: [
        { id: "doc_1", name: "PO-1852-BerryTap.pdf", type: "po", createdAt: "2024-11-13T10:30:00Z" },
        { id: "doc_2", name: "Email confirmation", type: "email", createdAt: "2024-11-13T10:30:00Z" },
      ],
      activityLog: [
        { action: "Shipped by supplier", timestamp: "2024-11-14T08:00:00Z", user: "System" },
        { action: "Order sent to supplier via email", timestamp: "2024-11-13T10:30:00Z", user: "John D." },
        { action: "Order approved", timestamp: "2024-11-13T10:15:00Z", user: "John D." },
        { action: "Order created", timestamp: "2024-11-13T10:00:00Z", user: "John D." },
      ],
    }
  }

  // Default mock data
  return {
    poId: "po_1855",
    poNumber: "1855",
    status: "ordered",
    statusMessage: "Awaiting shipment from supplier",
    supplier: {
      id: "sup_dairydirect",
      name: "Dairy Direct",
      email: "orders@dairydirect.com",
      phone: "+31 20 555 3456",
    },
    location: {
      id: "loc_main",
      name: "Main Kitchen",
      address: "123 Restaurant Street, Amsterdam, 1012 AB",
    },
    dates: {
      createdAt: "2024-11-15T08:00:00Z",
      orderedAt: "2024-11-15T08:30:00Z",
      expectedAt: "2024-11-18T10:00:00Z",
      expectedLabel: "Nov 18, 2024 before 10:00 AM",
    },
    createdBy: { id: "user_john", name: "John D." },
    timeline: [
      { step: "created", label: "Created", date: "Nov 15", time: "8:00 AM", completed: true },
      { step: "ordered", label: "Ordered", date: "Nov 15", time: "8:30 AM", completed: true, current: true },
      { step: "shipped", label: "Shipped", date: "Pending", completed: false },
      { step: "in_transit", label: "In Transit", date: "Pending", completed: false },
      { step: "received", label: "Received", date: "Pending", completed: false },
    ],
    lines: [
      {
        lineId: "line_1",
        code: "MOZ001",
        name: "Mozzarella Fresh",
        emoji: "🧀",
        orderedQty: 20,
        unit: "pc",
        unitPrice: 3.2,
        lineTotal: 64,
      },
      {
        lineId: "line_2",
        code: "CRM001",
        name: "Heavy Cream",
        emoji: "🥛",
        orderedQty: 15,
        unit: "L",
        unitPrice: 4.5,
        lineTotal: 67.5,
      },
      {
        lineId: "line_3",
        code: "BUT001",
        name: "Butter (Unsalted)",
        emoji: "🧈",
        orderedQty: 8,
        unit: "kg",
        unitPrice: 8,
        lineTotal: 64,
      },
      {
        lineId: "line_4",
        code: "PAR001",
        name: "Parmesan Reggiano",
        emoji: "🧀",
        orderedQty: 3,
        unit: "kg",
        unitPrice: 24,
        lineTotal: 72,
      },
      {
        lineId: "line_5",
        code: "MLK001",
        name: "Whole Milk",
        emoji: "🥛",
        orderedQty: 20,
        unit: "L",
        unitPrice: 1.2,
        lineTotal: 24,
      },
    ],
    totals: {
      subtotal: 567.5,
      delivery: 12,
      total: 579.5,
    },
    notes: {
      supplier: "Please deliver before 10 AM. Call 30 mins before arrival.",
      internal: "Extra mozzarella for weekend pizza special.",
    },
    documents: [
      { id: "doc_1", name: "PO-1855-BerryTap.pdf", type: "po", createdAt: "2024-11-15T08:30:00Z" },
      { id: "doc_2", name: "Email confirmation sent Nov 15", type: "email", createdAt: "2024-11-15T08:30:00Z" },
    ],
    activityLog: [
      { action: "Order sent to supplier via email", timestamp: "2024-11-15T08:30:00Z", user: "John D." },
      { action: "Order approved", timestamp: "2024-11-15T08:15:00Z", user: "John D." },
      { action: "Order created", timestamp: "2024-11-15T08:00:00Z", user: "John D." },
    ],
  }
}
