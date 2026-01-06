"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ReceiveOrderDrawerProps {
  po: any
  open: boolean
  onClose: () => void
}

export function ReceiveOrderDrawer({ po, open, onClose }: ReceiveOrderDrawerProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [receivingData, setReceivingData] = useState({
    receivedBy: "",
    deliveryNoteNumber: "",
    lines: po.lines.map((line: any) => ({
      ...line,
      receivedQty: line.orderedQty,
      actualUnitPrice: line.unitPrice,
      batch: "",
      expiryDate: "",
      checked: false,
    })),
    storageLocation: "loc_main_cold",
    missingItemAction: "cancel",
    missingItemReason: "out_of_stock",
  })

  const steps = [
    {
      number: 1,
      label: "Verify Items",
      status: currentStep === 1 ? "current" : currentStep > 1 ? "complete" : "pending",
    },
    {
      number: 2,
      label: "Enter Details",
      status: currentStep === 2 ? "current" : currentStep > 2 ? "complete" : "pending",
    },
    { number: 3, label: "Review", status: currentStep === 3 ? "current" : currentStep > 3 ? "complete" : "pending" },
    { number: 4, label: "Confirm", status: currentStep === 4 ? "current" : "pending" },
  ]

  const summary = calculateSummary(receivingData.lines, po)

  const handleReceiveAll = () => {
    setReceivingData({
      ...receivingData,
      lines: receivingData.lines.map((line: any) => ({
        ...line,
        receivedQty: line.orderedQty,
        checked: true,
      })),
    })
  }

  const handleLineChange = (lineId: string, field: string, value: any) => {
    setReceivingData({
      ...receivingData,
      lines: receivingData.lines.map((line: any) => (line.lineId === lineId ? { ...line, [field]: value } : line)),
    })
  }

  const handleContinue = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    } else {
      // Complete receiving
      console.log("[v0] Completing receive order:", receivingData)
      onClose()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
        <div className="sticky top-0 bg-background border-b px-6 py-4 z-10">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>Receive Order - PO #{po.poNumber}</SheetTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress */}
          <div className="border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Progress</h3>
            <div className="flex justify-between items-start">
              {steps.map((step, index) => (
                <div key={step.number} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center relative z-10 text-sm font-medium",
                        step.status === "complete"
                          ? "bg-primary text-primary-foreground"
                          : step.status === "current"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground border-2",
                      )}
                    >
                      {step.status === "complete" ? "✓" : step.number}
                    </div>
                    <div className="text-xs font-medium mt-2 text-center">{step.label}</div>
                    <div className="text-xs text-muted-foreground text-center">
                      {step.status === "complete" ? "✓ Complete" : step.status === "current" ? "Current" : "Pending"}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "absolute top-4 left-1/2 w-full h-0.5",
                        step.status === "complete" ? "bg-primary" : "bg-muted",
                      )}
                      style={{ width: "calc(100% - 2rem)", marginLeft: "1rem" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t-4 my-6" />

          {/* Step 1: Verify Items */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">STEP 1: VERIFY DELIVERED ITEMS</h2>

              {/* Delivery Info */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Delivery Info</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium">Supplier:</span> {po.supplier.name}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Expected:</span> {po.dates.expectedLabel}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm">
                      <span className="font-medium">PO Total:</span> €{po.totals.total.toFixed(2)} ({po.lines.length}{" "}
                      items)
                    </div>
                    <div className="mt-2">
                      <Label htmlFor="receivedBy">Received by:</Label>
                      <Input
                        id="receivedBy"
                        value={receivingData.receivedBy}
                        onChange={(e) => setReceivingData({ ...receivingData, receivedBy: e.target.value })}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="mt-2">
                      <Label htmlFor="deliveryNote">Delivery Note #:</Label>
                      <Input
                        id="deliveryNote"
                        value={receivingData.deliveryNoteNumber}
                        onChange={(e) => setReceivingData({ ...receivingData, deliveryNoteNumber: e.target.value })}
                        placeholder="DN-12345"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="flex gap-2">
                  <Button onClick={handleReceiveAll}>✅ Receive All as Ordered</Button>
                  <Button variant="outline">📷 Scan Items</Button>
                  <Button variant="outline">⚠️ Report Issue</Button>
                </div>
              </div>

              {/* Line Items */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Line Items</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Check items as you verify them. Adjust quantities if different from ordered.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left text-sm">
                        <th className="pb-2"></th>
                        <th className="pb-2 font-medium">Item</th>
                        <th className="pb-2 font-medium text-right">Ordered</th>
                        <th className="pb-2 font-medium text-right">Received</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {receivingData.lines.map((line: any) => {
                        const variance = line.receivedQty - line.orderedQty
                        const varianceType =
                          variance === 0
                            ? "match"
                            : variance < 0
                              ? line.receivedQty === 0
                                ? "missing"
                                : "short"
                              : "over"

                        return (
                          <tr key={line.lineId} className="border-b">
                            <td className="py-4">
                              <Checkbox
                                checked={line.checked}
                                onCheckedChange={(checked) => handleLineChange(line.lineId, "checked", checked)}
                              />
                            </td>
                            <td className="py-4">
                              <div>
                                {line.emoji} {line.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {line.code} • €{line.unitPrice.toFixed(2)}/{line.unit}
                              </div>
                            </td>
                            <td className="py-4 text-right">
                              <div>
                                {line.orderedQty} {line.unit}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                €{(line.orderedQty * line.unitPrice).toFixed(2)}
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-2 justify-end">
                                <Input
                                  type="number"
                                  value={line.receivedQty}
                                  onChange={(e) =>
                                    handleLineChange(line.lineId, "receivedQty", Number.parseFloat(e.target.value) || 0)
                                  }
                                  className="w-20 text-right"
                                  step="0.1"
                                />
                                <span>{line.unit}</span>
                              </div>
                              <div className="text-xs text-muted-foreground text-right">
                                €{(line.receivedQty * line.unitPrice).toFixed(2)}
                              </div>
                              {variance !== 0 && (
                                <div className="text-xs text-right text-muted-foreground">
                                  {variance > 0 ? "+" : ""}€{(variance * line.unitPrice).toFixed(2)}
                                </div>
                              )}
                            </td>
                            <td className="py-4">
                              <Badge
                                variant={
                                  varianceType === "match"
                                    ? "default"
                                    : varianceType === "missing"
                                      ? "destructive"
                                      : "secondary"
                                }
                              >
                                {varianceType === "match" && "✓ Match"}
                                {varianceType === "short" && `⚠️ Short`}
                                {varianceType === "over" && `⚡ Over`}
                                {varianceType === "missing" && `❌ Missing`}
                              </Badge>
                              {variance !== 0 && varianceType !== "missing" && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {variance > 0 ? "+" : ""}
                                  {variance.toFixed(1)} {line.unit}
                                </div>
                              )}
                              {varianceType === "missing" && (
                                <div className="text-xs text-muted-foreground mt-1">Not delivered</div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Receiving Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="border rounded-lg p-3">
                    <div className="text-sm text-muted-foreground">Ordered</div>
                    <div className="text-xl font-bold">€{summary.orderedTotal.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">{summary.orderedItems} items</div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="text-sm text-muted-foreground">Receiving</div>
                    <div className="text-xl font-bold">€{summary.receivingTotal.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">{summary.receivingItems} items</div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="text-sm text-muted-foreground">Variance</div>
                    <div
                      className={cn("text-xl font-bold", summary.variance < 0 ? "text-orange-600" : "text-green-600")}
                    >
                      {summary.variance > 0 ? "+" : ""}€{summary.variance.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {summary.variancePercent > 0 ? "+" : ""}
                      {summary.variancePercent.toFixed(1)}%
                    </div>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="text-sm text-muted-foreground">Missing</div>
                    <div className="text-xl font-bold">{summary.missingItems}</div>
                    <div className="text-sm text-muted-foreground">€{summary.missingValue.toFixed(2)}</div>
                  </div>
                </div>

                {(summary.missingItems > 0 || summary.shortItems > 0 || summary.overItems > 0) && (
                  <div className="mt-3 text-sm text-orange-600 flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    {summary.missingItems > 0 && `${summary.missingItems} item missing`}
                    {summary.shortItems > 0 && ` • ${summary.shortItems} item short`}
                    {summary.overItems > 0 && ` • ${summary.overItems} item over`}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Enter Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">STEP 2: ENTER RECEIVING DETAILS</h2>

              {/* Cost Verification */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Cost Verification</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Verify or update unit costs from the delivery note/invoice:
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-2 font-medium">Item</th>
                        <th className="pb-2 font-medium text-right">Qty Rcv</th>
                        <th className="pb-2 font-medium text-right">Expected</th>
                        <th className="pb-2 font-medium text-right">Actual</th>
                        <th className="pb-2 font-medium">Variance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receivingData.lines
                        .filter((line: any) => line.receivedQty > 0)
                        .map((line: any) => {
                          const priceVariance = line.actualUnitPrice - line.unitPrice
                          return (
                            <tr key={line.lineId} className="border-b">
                              <td className="py-3">
                                {line.emoji} {line.name}
                              </td>
                              <td className="py-3 text-right">
                                {line.receivedQty} {line.unit}
                              </td>
                              <td className="py-3 text-right">
                                €{line.unitPrice.toFixed(2)}/{line.unit}
                              </td>
                              <td className="py-3">
                                <Input
                                  type="number"
                                  value={line.actualUnitPrice}
                                  onChange={(e) =>
                                    handleLineChange(
                                      line.lineId,
                                      "actualUnitPrice",
                                      Number.parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className="w-24 text-right"
                                  step="0.01"
                                />
                              </td>
                              <td className="py-3">
                                <Badge variant={priceVariance === 0 ? "default" : "secondary"}>
                                  {priceVariance === 0
                                    ? "✓ Match"
                                    : `⚠️ ${priceVariance > 0 ? "+" : ""}€${priceVariance.toFixed(2)}`}
                                </Badge>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Batch & Expiry */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Batch & Expiry Tracking</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter batch numbers and expiry dates for perishable items:
                </p>

                <div className="space-y-3">
                  {receivingData.lines
                    .filter((line: any) => line.receivedQty > 0)
                    .map((line: any) => (
                      <div key={line.lineId} className="border rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">
                              {line.emoji} {line.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {line.receivedQty} {line.unit}
                            </div>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`batch-${line.lineId}`}>Batch #</Label>
                            <Input
                              id={`batch-${line.lineId}`}
                              value={line.batch}
                              onChange={(e) => handleLineChange(line.lineId, "batch", e.target.value)}
                              placeholder="e.g., SK-2024-1115"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`expiry-${line.lineId}`}>Expiry Date</Label>
                            <Input
                              id={`expiry-${line.lineId}`}
                              type="date"
                              value={line.expiryDate}
                              onChange={(e) => handleLineChange(line.lineId, "expiryDate", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Storage Location */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Storage Location</h3>
                <Label htmlFor="storage">Store received items in:</Label>
                <Select
                  value={receivingData.storageLocation}
                  onValueChange={(value) => setReceivingData({ ...receivingData, storageLocation: value })}
                >
                  <SelectTrigger id="storage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loc_main_cold">Main Kitchen - Cold Storage</SelectItem>
                    <SelectItem value="loc_main_dry">Main Kitchen - Dry Storage</SelectItem>
                    <SelectItem value="loc_bar_cold">Bar - Cold Storage</SelectItem>
                    <SelectItem value="loc_prep">Prep Station</SelectItem>
                    <SelectItem value="loc_freezer">Freezer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Missing Item Handling */}
              {summary.missingItems > 0 && (
                <div className="border rounded-lg p-4 bg-orange-50 dark:bg-orange-950">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Missing Item Handling
                  </h3>
                  <p className="text-sm mb-4">
                    {summary.missingItems} item(s) not delivered (€{summary.missingValue.toFixed(2)})
                  </p>

                  <div className="space-y-3">
                    <Label>How would you like to handle this?</Label>
                    <RadioGroup
                      value={receivingData.missingItemAction}
                      onValueChange={(value) => setReceivingData({ ...receivingData, missingItemAction: value })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="backorder" id="backorder" />
                        <Label htmlFor="backorder">Keep on order (await back-order delivery)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="cancel" id="cancel" />
                        <Label htmlFor="cancel">Cancel missing item (remove from this PO)</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="new_po" id="new_po" />
                        <Label htmlFor="new_po">Create new PO for missing item</Label>
                      </div>
                    </RadioGroup>

                    <div>
                      <Label htmlFor="reason">Reason:</Label>
                      <Select
                        value={receivingData.missingItemReason}
                        onValueChange={(value) => setReceivingData({ ...receivingData, missingItemReason: value })}
                      >
                        <SelectTrigger id="reason">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="out_of_stock">Supplier out of stock</SelectItem>
                          <SelectItem value="damaged">Damaged in transit</SelectItem>
                          <SelectItem value="wrong_item">Wrong item delivered</SelectItem>
                          <SelectItem value="short_ship">Short shipment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">STEP 3: REVIEW & CONFIRM</h2>

              {/* Summary Cards */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
                  <div className="text-sm text-muted-foreground">Items Received</div>
                  <div className="text-3xl font-bold">{summary.receivingItems}</div>
                  <div className="text-sm">of {summary.orderedItems} ordered</div>
                </div>
                <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950">
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="text-3xl font-bold">€{summary.receivingTotal.toFixed(2)}</div>
                  <div className="text-sm">of €{summary.orderedTotal.toFixed(2)}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-muted-foreground">Variance</div>
                  <div
                    className={cn("text-3xl font-bold", summary.variance < 0 ? "text-orange-600" : "text-green-600")}
                  >
                    {summary.variance > 0 ? "+" : ""}€{summary.variance.toFixed(2)}
                  </div>
                  <div className="text-sm">{summary.variancePercent.toFixed(1)}%</div>
                </div>
              </div>

              {/* Stock Impact Preview */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Stock Impact Preview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-2 font-medium">Item</th>
                        <th className="pb-2 font-medium text-right">Current</th>
                        <th className="pb-2 font-medium text-center">+</th>
                        <th className="pb-2 font-medium text-right">Receiving</th>
                        <th className="pb-2 font-medium text-center">=</th>
                        <th className="pb-2 font-medium text-right">New Stock</th>
                        <th className="pb-2 font-medium">Status Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receivingData.lines
                        .filter((line: any) => line.receivedQty > 0)
                        .map((line: any) => {
                          const current = Math.random() * 5 // Mock current stock
                          const newStock = current + line.receivedQty
                          return (
                            <tr key={line.lineId} className="border-b">
                              <td className="py-3">
                                {line.emoji} {line.name}
                              </td>
                              <td className="py-3 text-right">
                                {current.toFixed(1)} {line.unit}
                              </td>
                              <td className="py-3 text-center text-muted-foreground">+</td>
                              <td className="py-3 text-right font-medium">
                                {line.receivedQty} {line.unit}
                              </td>
                              <td className="py-3 text-center text-muted-foreground">=</td>
                              <td className="py-3 text-right font-bold">
                                {newStock.toFixed(1)} {line.unit}
                              </td>
                              <td className="py-3">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary">Low</Badge>
                                  <TrendingUp className="h-4 w-4 text-green-600" />
                                  <Badge>Good</Badge>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Confirmation */}
              <div className="border rounded-lg p-4 bg-muted">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">Ready to Complete Receiving</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Stock levels will be updated and the PO will be marked as received. This action cannot be undone.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && (
            <div className="space-y-6 text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Order Received Successfully!</h2>
                <p className="text-muted-foreground">
                  PO #{po.poNumber} has been received and stock levels have been updated.
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="border rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-600">{summary.receivingItems}</div>
                  <div className="text-sm text-muted-foreground">Items Received</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-3xl font-bold">€{summary.receivingTotal.toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-600">✓</div>
                  <div className="text-sm text-muted-foreground">Stock Updated</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={currentStep === 4}>
              {currentStep === 1 ? "Cancel" : "← Back"}
            </Button>
            <Button onClick={handleContinue}>
              {currentStep === 4 ? "Close" : currentStep === 3 ? "Complete Receiving" : "Continue to Details →"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function calculateSummary(lines: any[], po: any) {
  const orderedItems = lines.length
  const receivingItems = lines.filter((l: any) => l.receivedQty > 0).length
  const missingItems = lines.filter((l: any) => l.receivedQty === 0).length
  const shortItems = lines.filter((l: any) => l.receivedQty > 0 && l.receivedQty < l.orderedQty).length
  const overItems = lines.filter((l: any) => l.receivedQty > l.orderedQty).length

  const orderedTotal = lines.reduce((sum: number, l: any) => sum + l.orderedQty * l.unitPrice, 0)
  const receivingTotal = lines.reduce((sum: number, l: any) => sum + l.receivedQty * l.actualUnitPrice, 0)
  const missingValue = lines
    .filter((l: any) => l.receivedQty === 0)
    .reduce((sum: number, l: any) => sum + l.orderedQty * l.unitPrice, 0)

  const variance = receivingTotal - orderedTotal
  const variancePercent = orderedTotal > 0 ? (variance / orderedTotal) * 100 : 0

  return {
    orderedItems,
    receivingItems,
    missingItems,
    shortItems,
    overItems,
    orderedTotal,
    receivingTotal,
    missingValue,
    variance,
    variancePercent,
  }
}
