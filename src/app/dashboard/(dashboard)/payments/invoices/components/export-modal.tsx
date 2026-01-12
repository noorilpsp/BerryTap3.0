"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, FileSpreadsheet, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Invoice } from "../types"

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentViewCount: number
  totalCount: number
  selectedInvoices?: Invoice[]
}

export function ExportModal({ open, onOpenChange, currentViewCount, totalCount, selectedInvoices }: ExportModalProps) {
  const { toast } = useToast()
  const [exporting, setExporting] = useState(false)
  const [dataScope, setDataScope] = useState<"current" | "all" | "selected">(
    selectedInvoices && selectedInvoices.length > 0 ? "selected" : "current",
  )
  const [format, setFormat] = useState<"csv" | "excel">("csv")
  const [includeColumns, setIncludeColumns] = useState({
    invoiceDate: true,
    invoiceNumber: true,
    type: true,
    status: true,
    subtotal: true,
    tax: true,
    total: true,
    paid: true,
    balance: true,
    paymentMethod: true,
    dueDate: true,
    reviewed: true,
    lineItems: false,
    billingAddress: false,
    vatId: false,
  })
  const [includeLineItems, setIncludeLineItems] = useState(false)
  const [includePaymentHistory, setIncludePaymentHistory] = useState(false)

  const getExportCount = () => {
    if (dataScope === "selected") return selectedInvoices?.length || 0
    if (dataScope === "current") return currentViewCount
    return totalCount
  }

  const getEstimatedSize = () => {
    const count = getExportCount()
    const baseSize = count * 0.25 // 0.25 KB per row
    const multiplier = includeLineItems || includePaymentHistory ? 2 : 1
    return Math.round(baseSize * multiplier)
  }

  const handleExport = async () => {
    setExporting(true)

    // Simulate export process
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setExporting(false)
    onOpenChange(false)

    const filename = `invoices_${new Date().getFullYear()}.${format}`
    const size = getEstimatedSize()

    toast({
      title: "Export Complete",
      description: (
        <div className="space-y-2">
          <div className="font-medium">{filename}</div>
          <div className="text-sm text-muted-foreground">
            {size} KB • {getExportCount()} rows
          </div>
          <div className="text-sm">Your download is ready!</div>
        </div>
      ),
      duration: 5000,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Invoices</DialogTitle>
          <DialogDescription>Configure your invoice export settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Data to Export */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Data to Export</Label>
            <RadioGroup value={dataScope} onValueChange={(value: any) => setDataScope(value)}>
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="current" id="current" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="current" className="font-medium cursor-pointer">
                    Current view ({currentViewCount} invoices)
                  </Label>
                  <p className="text-sm text-muted-foreground">Export visible filtered results</p>
                </div>
              </div>

              {selectedInvoices && selectedInvoices.length > 0 && (
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="selected" id="selected" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="selected" className="font-medium cursor-pointer">
                      Selected invoices ({selectedInvoices.length} invoices)
                    </Label>
                    <p className="text-sm text-muted-foreground">Export only selected rows</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <RadioGroupItem value="all" id="all" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="all" className="font-medium cursor-pointer">
                    All invoices ({totalCount} invoices)
                  </Label>
                  <p className="text-sm text-muted-foreground">Export complete invoice history</p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Format Options */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Format Options</Label>
            <RadioGroup value={format} onValueChange={(value: any) => setFormat(value)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="cursor-pointer flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CSV
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="cursor-pointer flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel
                </Label>
              </div>
            </RadioGroup>

            <div className="space-y-2 pt-2">
              <Label className="text-sm font-medium">Include columns:</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(includeColumns).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      checked={value}
                      onCheckedChange={(checked) =>
                        setIncludeColumns((prev) => ({ ...prev, [key]: checked as boolean }))
                      }
                      id={key}
                    />
                    <Label htmlFor={key} className="text-sm cursor-pointer">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Detailed Export */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Detailed Export</Label>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox
                  checked={includeLineItems}
                  onCheckedChange={(checked) => setIncludeLineItems(checked as boolean)}
                  id="lineItems"
                />
                <div className="flex-1">
                  <Label htmlFor="lineItems" className="cursor-pointer font-medium">
                    Include line items breakdown
                  </Label>
                  <p className="text-sm text-muted-foreground">(Creates a larger file with all item details)</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  checked={includePaymentHistory}
                  onCheckedChange={(checked) => setIncludePaymentHistory(checked as boolean)}
                  id="paymentHistory"
                />
                <div className="flex-1">
                  <Label htmlFor="paymentHistory" className="cursor-pointer font-medium">
                    Include payment history
                  </Label>
                  <p className="text-sm text-muted-foreground">(Shows all payment attempts and transactions)</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Export Summary */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-1">
            <Label className="text-base font-semibold">Export Summary</Label>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>{getExportCount()} invoices</li>
              <li>Estimated file size: ~{getEstimatedSize()} KB</li>
              <li>Estimated time: &lt; 1 second</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Download className="h-4 w-4 mr-2" />
            Download {format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
