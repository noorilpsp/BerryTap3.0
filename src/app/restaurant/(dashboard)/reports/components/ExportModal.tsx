"use client"

import { useState } from "react"
import { Download, FileText, FileSpreadsheet, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { ReportsData, ReportsFilters } from "../types/reports.types"

interface ExportModalProps {
  open: boolean
  onClose: () => void
  data?: ReportsData
  filters: ReportsFilters
}

export function ExportModal({ open, onClose, data, filters }: ExportModalProps) {
  const [format, setFormat] = useState<"csv" | "pdf" | "excel">("pdf")
  const [includes, setIncludes] = useState({
    kpis: true,
    charts: true,
    table: true,
    staff: false,
    items: false,
  })

  const handleExport = () => {
    console.log("[v0] Exporting report", { format, includes })
    // Implementation would generate and download the file
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>Choose your export format and what to include</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Format</Label>
            <RadioGroup value={format} onValueChange={(value: any) => setFormat(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center gap-2 font-normal cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV (Spreadsheet)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center gap-2 font-normal cursor-pointer">
                  <FileText className="h-4 w-4" />
                  PDF (Summary Report)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center gap-2 font-normal cursor-pointer">
                  <File className="h-4 w-4" />
                  Excel (Advanced)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Include Options */}
          <div className="space-y-3">
            <Label>Include</Label>
            <div className="space-y-2">
              {Object.entries({
                kpis: "KPI Summary",
                charts: "Charts & Visualizations",
                table: "Detailed Data Table",
                staff: "Staff Performance",
                items: "Item Breakdown",
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={includes[key as keyof typeof includes]}
                    onCheckedChange={(checked) => setIncludes({ ...includes, [key]: checked })}
                  />
                  <Label htmlFor={key} className="font-normal cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          <div className="space-y-2">
            <Label>Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Last 30 Days</Badge>
              {filters.channels?.map((channel) => (
                <Badge key={channel} variant="secondary">
                  {channel}
                </Badge>
              ))}
            </div>
          </div>

          {/* Estimate */}
          <div className="rounded-lg bg-muted p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Size:</span>
              <span className="font-medium">~2.4 MB</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-muted-foreground">Estimated Time:</span>
              <span className="font-medium">{"<"} 5 seconds</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Generate Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
