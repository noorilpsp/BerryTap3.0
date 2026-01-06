"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react"

const mockVariances = [
  {
    id: 1,
    sku: "TOM001",
    name: "Roma Tomatoes",
    emoji: "🍅",
    systemQty: 15,
    countedQty: 12,
    unit: "kg",
    variance: -3,
    systemValue: 52.5,
    countedValue: 42.0,
    varianceValue: -10.5,
  },
  {
    id: 2,
    sku: "LET001",
    name: "Romaine Lettuce",
    emoji: "🥬",
    systemQty: 8,
    countedQty: 5,
    unit: "kg",
    variance: -3,
    systemValue: 22.4,
    countedValue: 14.0,
    varianceValue: -8.4,
  },
  {
    id: 3,
    sku: "CAR001",
    name: "Carrots",
    emoji: "🥕",
    systemQty: 10,
    countedQty: 12,
    unit: "kg",
    variance: 2,
    systemValue: 12.0,
    countedValue: 14.4,
    varianceValue: 2.4,
  },
]

const adjustmentReasons = [
  { id: "waste", label: "Waste / Spoilage", emoji: "🗑️" },
  { id: "theft", label: "Theft / Shrinkage", emoji: "🚨" },
  { id: "receiving_error", label: "Receiving error (PO not entered)", emoji: "📦" },
  { id: "consumption_error", label: "Consumption not recorded", emoji: "🍽️" },
  { id: "transfer_error", label: "Transfer not recorded", emoji: "🔄" },
  { id: "count_error_prev", label: "Previous count error", emoji: "🧮" },
  { id: "measurement_error", label: "Measurement/weighing error", emoji: "⚖️" },
  { id: "unknown", label: "Unknown / Admin adjustment", emoji: "❓" },
]

interface ReconciliationDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  count: any
}

export function ReconciliationDrawer({ open, onOpenChange, count }: ReconciliationDrawerProps) {
  const [varianceData, setVarianceData] = useState(
    mockVariances.map((v) => ({
      ...v,
      reason: v.id === 1 ? "waste" : "",
      note: v.id === 1 ? "Found 3kg spoiled in back of cooler - disposed" : "",
      approved: v.id === 1 || v.id === 3,
    })),
  )

  const updateVariance = (id: number, field: string, value: any) => {
    setVarianceData((prev) => prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)))
  }

  const summary = {
    totalItems: 58,
    matched: 52,
    variances: 6,
    varianceValue: -156.3,
  }

  const reconciliationSummary = varianceData.reduce((acc, v) => {
    if (!v.reason) return acc
    const reason = adjustmentReasons.find((r) => r.id === v.reason)
    const existing = acc.find((r) => r.reason === v.reason)
    if (existing) {
      existing.items++
      existing.qtyImpact += v.variance
      existing.valueImpact += v.varianceValue
    } else {
      acc.push({
        reason: v.reason,
        label: reason?.label || "",
        emoji: reason?.emoji || "",
        items: 1,
        qtyImpact: v.variance,
        valueImpact: v.varianceValue,
      })
    }
    return acc
  }, [] as any[])

  const totalReconciled = reconciliationSummary.reduce((sum, r) => sum + r.valueImpact, 0)
  const unassignedCount = varianceData.filter((v) => !v.reason).length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Reconcile Count #{count?.countNumber || "CS-2024-087"}</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Count Summary */}
          <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
            <div className="text-sm text-muted-foreground">
              🥬 Produce Section • Main Kitchen • Counted by Sarah M. on Nov 14
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <div className="text-xs text-muted-foreground mb-1">📦 TOTAL</div>
                <div className="font-bold">{summary.totalItems} items</div>
                <div className="text-xs text-muted-foreground">counted</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">✅ MATCHED</div>
                <div className="font-bold">{summary.matched} items</div>
                <div className="text-xs text-muted-foreground">89.7%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">⚠️ VARIANCES</div>
                <div className="font-bold">{summary.variances} items</div>
                <div className="text-xs text-muted-foreground">10.3%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">💰 VALUE DIFF</div>
                <div className="font-bold text-red-600">-€{Math.abs(summary.varianceValue).toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">inventory loss</div>
              </div>
            </div>
          </div>

          {/* Variance Items */}
          <div className="space-y-4">
            <div className="font-medium">Review each variance and select an adjustment reason:</div>
            {varianceData.map((variance, idx) => (
              <div key={variance.id} className="p-4 rounded-lg border space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">
                      {variance.emoji} {variance.name}
                    </div>
                    <div className="text-sm text-muted-foreground">{variance.sku}</div>
                  </div>
                  <Badge variant={variance.approved ? "secondary" : "outline"}>
                    {variance.approved ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
                    {variance.approved ? "Approved" : "Pending"}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="flex-1 p-3 rounded-lg bg-muted/50 text-center">
                    <div className="text-muted-foreground mb-1">SYSTEM</div>
                    <div className="font-medium">
                      {variance.systemQty} {variance.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">€{variance.systemValue.toFixed(2)}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 p-3 rounded-lg bg-muted/50 text-center">
                    <div className="text-muted-foreground mb-1">COUNTED</div>
                    <div className="font-medium">
                      {variance.countedQty} {variance.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">€{variance.countedValue.toFixed(2)}</div>
                  </div>
                  <span className="text-lg">=</span>
                  <div
                    className={`flex-1 p-3 rounded-lg text-center ${variance.variance < 0 ? "bg-red-50" : "bg-blue-50"}`}
                  >
                    <div className="text-muted-foreground mb-1">VARIANCE</div>
                    <div className={`font-medium ${variance.variance < 0 ? "text-red-600" : "text-blue-600"}`}>
                      {variance.variance > 0 ? "+" : ""}
                      {variance.variance} {variance.unit}
                    </div>
                    <div className={`text-xs ${variance.variance < 0 ? "text-red-600" : "text-blue-600"}`}>
                      {variance.varianceValue > 0 ? "+" : ""}€{variance.varianceValue.toFixed(2)}
                    </div>
                  </div>
                </div>

                {variance.variance > 0 && (
                  <div className="flex items-center gap-2 p-2 rounded bg-blue-50 border border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">Positive variance - verify before approving</span>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Adjustment Reason:</label>
                  <Select
                    value={variance.reason}
                    onValueChange={(value) => updateVariance(variance.id, "reason", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {adjustmentReasons.map((reason) => (
                        <SelectItem key={reason.id} value={reason.id}>
                          {reason.emoji} {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {variance.note && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Note:</label>
                    <div className="text-sm text-muted-foreground p-2 bg-muted/30 rounded">{variance.note}</div>
                  </div>
                )}

                {variance.reason && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={variance.approved}
                      onCheckedChange={(checked) => updateVariance(variance.id, "approved", !!checked)}
                    />
                    <label className="text-sm">Approve adjustment</label>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Reconciliation Summary */}
          <div className="p-4 rounded-lg border bg-muted/30 space-y-3">
            <div className="font-medium">Adjustments to be made:</div>
            <div className="rounded-lg border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left">REASON</th>
                    <th className="px-4 py-2 text-left">ITEMS</th>
                    <th className="px-4 py-2 text-left">QTY IMPACT</th>
                    <th className="px-4 py-2 text-left">VALUE IMPACT</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {reconciliationSummary.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2">
                        {item.emoji} {item.label}
                      </td>
                      <td className="px-4 py-2">{item.items}</td>
                      <td className="px-4 py-2">
                        {item.qtyImpact > 0 ? "+" : ""}
                        {item.qtyImpact.toFixed(1)} kg
                      </td>
                      <td className={`px-4 py-2 ${item.valueImpact < 0 ? "text-red-600" : "text-green-600"}`}>
                        {item.valueImpact > 0 ? "+" : ""}€{item.valueImpact.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr className="font-medium bg-muted/30">
                    <td className="px-4 py-2">TOTAL</td>
                    <td className="px-4 py-2">{summary.variances}</td>
                    <td className="px-4 py-2">-8.5 kg</td>
                    <td className={`px-4 py-2 ${totalReconciled < 0 ? "text-red-600" : "text-green-600"}`}>
                      {totalReconciled > 0 ? "+" : ""}€{totalReconciled.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            {unassignedCount > 0 && (
              <div className="flex items-center gap-2 p-3 rounded bg-orange-50 border border-orange-200">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-700">
                  {unassignedCount} item{unassignedCount !== 1 ? "s" : ""} still need{unassignedCount === 1 ? "s" : ""}{" "}
                  a reason assigned
                </span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex gap-2 sticky bottom-0 bg-background p-4 border-t">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={unassignedCount > 0}
              onClick={() => {
                onOpenChange(false)
                // Show success state
              }}
            >
              Apply Adjustments
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
