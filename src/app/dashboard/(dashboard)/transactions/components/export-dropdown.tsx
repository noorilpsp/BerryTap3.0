"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Download, FileText, FileSpreadsheet, File, ChevronDown, Settings, Calendar, FolderDown } from "lucide-react"
import { mockReportTemplates } from "../data/export-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ExportDropdownProps {
  filteredCount: number
  selectedCount: number
  onExport: (format: "csv" | "xlsx" | "pdf", scope: "current" | "selected") => void
  onOpenCustomBuilder: () => void
  onOpenDownloadCenter: () => void
  onOpenScheduleExport: () => void
}

export function ExportDropdown({
  filteredCount,
  selectedCount,
  onExport,
  onOpenCustomBuilder,
  onOpenDownloadCenter,
  onOpenScheduleExport,
}: ExportDropdownProps) {
  const [showExportSuccess, setShowExportSuccess] = useState(false)
  const [lastExport, setLastExport] = useState<{ filename: string; size: string; rows: number } | null>(null)

  const handleQuickExport = (format: "csv" | "xlsx" | "pdf", scope: "current" | "selected") => {
    const rows = scope === "selected" ? selectedCount : filteredCount
    const filename = `transactions_${new Date().toISOString().split("T")[0]}.${format}`
    const size = Math.floor(rows * 0.2) + " KB"

    setLastExport({ filename, size, rows })
    setShowExportSuccess(true)
    onExport(format, scope)
  }

  const handleTemplateExport = (templateName: string) => {
    const filename = `${templateName.toLowerCase().replace(/ /g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`
    setLastExport({ filename, size: "456 KB", rows: 1234 })
    setShowExportSuccess(true)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[400px]">
          <DropdownMenuLabel className="text-xs font-semibold uppercase text-muted-foreground">
            Quick Export
          </DropdownMenuLabel>

          <div className="p-2 space-y-3">
            <div>
              <div className="text-sm font-medium mb-2">
                Current View ({filteredCount.toLocaleString()} transactions)
              </div>
              <div className="text-xs text-muted-foreground mb-2">Export visible filtered results</div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleQuickExport("csv", "current")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleQuickExport("xlsx", "current")}
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-transparent"
                  onClick={() => handleQuickExport("pdf", "current")}
                >
                  <File className="mr-2 h-4 w-4" />
                  PDF
                </Button>
              </div>
            </div>

            {selectedCount > 0 && (
              <>
                <DropdownMenuSeparator />
                <div>
                  <div className="text-sm font-medium mb-2">Selected Only ({selectedCount} transactions)</div>
                  <div className="text-xs text-muted-foreground mb-2">Export only selected rows</div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleQuickExport("csv", "selected")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleQuickExport("xlsx", "selected")}
                    >
                      <FileSpreadsheet className="mr-2 h-4 w-4" />
                      Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      onClick={() => handleQuickExport("pdf", "selected")}
                    >
                      <File className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs font-semibold uppercase text-muted-foreground">
            Export Templates
          </DropdownMenuLabel>

          {mockReportTemplates.map((template) => (
            <DropdownMenuItem key={template.templateId} className="flex items-start gap-2 p-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{template.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">{template.description}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleTemplateExport(template.name)}>
                Export →
              </Button>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={onOpenCustomBuilder}>
            <Settings className="mr-2 h-4 w-4" />
            Custom Export Builder
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenScheduleExport}>
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Export
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onOpenDownloadCenter}>
            <FolderDown className="mr-2 h-4 w-4" />
            Download Center
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Export Success Dialog */}
      <Dialog open={showExportSuccess} onOpenChange={setShowExportSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Complete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Your export is ready!</p>
            {lastExport && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">File:</span>
                  <span className="font-medium">{lastExport.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span>{lastExport.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rows:</span>
                  <span>{lastExport.rows.toLocaleString()}</span>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Email to Me
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
