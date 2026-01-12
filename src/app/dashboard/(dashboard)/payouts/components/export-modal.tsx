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
import { AlertCircle, Download, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

interface ExportModalProps {
  open: boolean
  onClose: () => void
  payoutsCount: number
  dateRange?: string
}

export function ExportModal({ open, onClose, payoutsCount, dateRange }: ExportModalProps) {
  const [dataRange, setDataRange] = useState<"current" | "all" | "custom">("current")
  const [format, setFormat] = useState<"csv" | "excel">("csv")
  const [includeTransactions, setIncludeTransactions] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [showWarning, setShowWarning] = useState(false)

  const [selectedColumns, setSelectedColumns] = useState({
    date: true,
    payoutId: true,
    status: true,
    gross: true,
    fees: true,
    net: true,
    location: true,
    transactionCount: true,
    bankArrival: true,
    reconciled: true,
    reconcileNote: false,
    bankDetails: false,
  })

  const estimatedSize = includeTransactions ? payoutsCount * 50 : payoutsCount * 0.3
  const isLargeExport = payoutsCount > 500

  const handleExport = async () => {
    if (isLargeExport && includeTransactions) {
      setShowWarning(true)
      return
    }

    setIsExporting(true)
    setExportProgress(0)

    // Simulate export progress
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsExporting(false)
            setExportProgress(0)
            onClose()
            // Show success toast
          }, 500)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Payouts</DialogTitle>
          <DialogDescription>Configure your export settings and download payout data.</DialogDescription>
        </DialogHeader>

        {!isExporting && !showWarning && (
          <div className="space-y-6 py-4">
            {/* Data Range */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">DATA TO EXPORT</Label>
              <RadioGroup value={dataRange} onValueChange={(value: any) => setDataRange(value)}>
                <div className="flex items-start space-x-3 space-y-0 rounded-md border p-3">
                  <RadioGroupItem value="current" id="current" />
                  <div className="flex-1">
                    <Label htmlFor="current" className="font-medium cursor-pointer">
                      Current view ({payoutsCount} payouts)
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">Export visible filtered results</p>
                    {dateRange && <p className="text-xs text-muted-foreground mt-1">Date range: {dateRange}</p>}
                  </div>
                </div>

                <div className="flex items-start space-x-3 space-y-0 rounded-md border p-3">
                  <RadioGroupItem value="all" id="all" />
                  <div className="flex-1">
                    <Label htmlFor="all" className="font-medium cursor-pointer">
                      All payouts (128 payouts)
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">Export complete payout history</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Format */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">FORMAT OPTIONS</Label>
              <RadioGroup value={format} onValueChange={(value: any) => setFormat(value)}>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="csv" id="csv" />
                  <Label htmlFor="csv" className="font-normal cursor-pointer">
                    CSV
                  </Label>
                  <RadioGroupItem value="excel" id="excel" />
                  <Label htmlFor="excel" className="font-normal cursor-pointer">
                    Excel
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Columns */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">INCLUDE COLUMNS</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries({
                  date: "Date & Time",
                  payoutId: "Payout ID",
                  status: "Status",
                  gross: "Gross Amount",
                  fees: "Fees",
                  net: "Net Amount",
                  location: "Location",
                  transactionCount: "Transaction Count",
                  bankArrival: "Bank Arrival Date",
                  reconciled: "Reconciled Status",
                  reconcileNote: "Reconciliation Note",
                  bankDetails: "Bank Account Details",
                }).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={selectedColumns[key as keyof typeof selectedColumns]}
                      onCheckedChange={(checked) => setSelectedColumns((prev) => ({ ...prev, [key]: checked }))}
                    />
                    <Label htmlFor={key} className="text-sm font-normal cursor-pointer">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction Details */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">DETAILED EXPORT</Label>
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-3">
                <Checkbox
                  id="transactions"
                  checked={includeTransactions}
                  onCheckedChange={(checked) => setIncludeTransactions(!!checked)}
                />
                <div className="flex-1">
                  <Label htmlFor="transactions" className="font-medium cursor-pointer">
                    Include transaction breakdown for each payout
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Creates a larger file with all transaction details
                  </p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <p className="text-sm font-semibold">EXPORT SUMMARY</p>
              <p className="text-sm text-muted-foreground">• {payoutsCount} payouts</p>
              <p className="text-sm text-muted-foreground">• Estimated file size: ~{estimatedSize.toFixed(1)} KB</p>
              <p className="text-sm text-muted-foreground">
                • Estimated time: {isLargeExport ? "5-10 seconds" : "< 1 second"}
              </p>
            </div>
          </div>
        )}

        {/* Export Progress */}
        {isExporting && (
          <div className="space-y-4 py-8">
            <div className="text-center space-y-2">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
              <p className="text-sm font-medium">Preparing Export...</p>
            </div>
            <Progress value={exportProgress} className="w-full" />
            <p className="text-xs text-center text-muted-foreground">
              Processing {Math.floor((exportProgress / 100) * payoutsCount)} of {payoutsCount} payouts...
            </p>
            <p className="text-xs text-center text-muted-foreground">This may take a few moments.</p>
          </div>
        )}

        {/* Large Export Warning */}
        {showWarning && (
          <div className="space-y-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-semibold mb-2">Large Export Warning</p>
                <p className="text-sm mb-3">You're about to export {payoutsCount} payouts with transaction details.</p>
                <p className="text-sm mb-1">Estimated file size: ~{estimatedSize.toFixed(1)} MB</p>
                <p className="text-sm mb-3">Estimated time: 5-10 seconds</p>
                <p className="text-sm">The download will begin automatically when ready.</p>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter>
          {!isExporting && !showWarning && (
            <>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Download {format.toUpperCase()}
              </Button>
            </>
          )}
          {showWarning && (
            <>
              <Button variant="outline" onClick={() => setShowWarning(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport}>Continue Export</Button>
            </>
          )}
          {isExporting && (
            <Button variant="outline" onClick={() => setIsExporting(false)}>
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
