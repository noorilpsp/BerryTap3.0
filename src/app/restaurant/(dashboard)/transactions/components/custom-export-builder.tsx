"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { GripVertical, Search } from "lucide-react"
import { availableColumns, type ColumnOption } from "../types/export-types-enhanced"

interface CustomExportBuilderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filteredCount: number
  selectedCount: number
}

type Step = 1 | 2 | 3 | 4

export function CustomExportBuilder({ open, onOpenChange, filteredCount, selectedCount }: CustomExportBuilderProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [dataScope, setDataScope] = useState<"current" | "selected" | "all">("current")
  const [selectedColumns, setSelectedColumns] = useState<ColumnOption[]>(availableColumns.filter((col) => col.enabled))
  const [fileFormat, setFileFormat] = useState<"csv" | "xlsx" | "pdf" | "json">("csv")
  const [exportTiming, setExportTiming] = useState<"now" | "schedule">("now")
  const [columnSearch, setColumnSearch] = useState("")
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [templateName, setTemplateName] = useState("")

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((currentStep + 1) as Step)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as Step)
  }

  const handleToggleColumn = (column: ColumnOption) => {
    if (selectedColumns.find((c) => c.field === column.field)) {
      setSelectedColumns(selectedColumns.filter((c) => c.field !== column.field))
    } else {
      setSelectedColumns([...selectedColumns, column])
    }
  }

  const getEstimatedRows = () => {
    if (dataScope === "selected") return selectedCount
    if (dataScope === "current") return filteredCount
    return 15432 // all
  }

  const getEstimatedSize = () => {
    return Math.floor(getEstimatedRows() * 0.2) + " KB"
  }

  const filteredAvailableColumns = availableColumns.filter(
    (col) =>
      col.label.toLowerCase().includes(columnSearch.toLowerCase()) ||
      col.category.toLowerCase().includes(columnSearch.toLowerCase()),
  )

  const categories = Array.from(new Set(availableColumns.map((col) => col.category)))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Custom Export Builder</DialogTitle>
            <Button variant="outline" size="sm">
              Save Template
            </Button>
          </div>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 py-4">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep === step
                      ? "border-primary bg-primary text-primary-foreground"
                      : currentStep > step
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step ? "✓" : step}
                </div>
                <span
                  className={`text-sm font-medium ${
                    currentStep === step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step === 1 && "Data Range"}
                  {step === 2 && "Columns"}
                  {step === 3 && "Format"}
                  {step === 4 && "Delivery"}
                </span>
              </div>
              {step < 4 && <div className="h-px bg-border flex-1 ml-2" />}
            </div>
          ))}
        </div>

        <Separator />

        <ScrollArea className="flex-1 -mx-6 px-6">
          {/* Step 1: Data Range */}
          {currentStep === 1 && (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Data Range</h3>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Date Range:</Label>
                    <RadioGroup defaultValue="current">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="current" id="current" />
                        <Label htmlFor="current" className="font-normal cursor-pointer">
                          Use current filters (Last 30 days)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label htmlFor="custom" className="font-normal cursor-pointer">
                          Custom date range
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Data Scope:</Label>
                    <RadioGroup value={dataScope} onValueChange={(v: any) => setDataScope(v)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="current" id="scope-current" />
                        <Label htmlFor="scope-current" className="font-normal cursor-pointer">
                          All transactions matching filters ({filteredCount.toLocaleString()} rows)
                        </Label>
                      </div>
                      {selectedCount > 0 && (
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="selected" id="scope-selected" />
                          <Label htmlFor="scope-selected" className="font-normal cursor-pointer">
                            Selected transactions only ({selectedCount} rows)
                          </Label>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="all" id="scope-all" />
                        <Label htmlFor="scope-all" className="font-normal cursor-pointer">
                          All transactions (no filters)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated rows:</span>
                        <span className="font-medium">{getEstimatedRows().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated file size:</span>
                        <span className="font-medium">{getEstimatedSize()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Columns */}
          {currentStep === 2 && (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Columns</h3>

                <div className="flex gap-2 mb-4">
                  <Button variant="outline" size="sm">
                    All Columns
                  </Button>
                  <Button variant="outline" size="sm">
                    Standard
                  </Button>
                  <Button variant="outline" size="sm">
                    Accounting
                  </Button>
                  <Button variant="outline" size="sm">
                    Reconciliation
                  </Button>
                  <Button variant="outline" size="sm">
                    Minimal
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Available Columns */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Available Columns</Label>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search columns..."
                        className="pl-8"
                        value={columnSearch}
                        onChange={(e) => setColumnSearch(e.target.value)}
                      />
                    </div>

                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {categories.map((category) => {
                          const categoryColumns = filteredAvailableColumns.filter((col) => col.category === category)
                          if (categoryColumns.length === 0) return null

                          return (
                            <div key={category}>
                              <div className="text-xs font-semibold text-muted-foreground mb-2">{category}:</div>
                              <div className="space-y-2">
                                {categoryColumns.map((column) => (
                                  <div key={column.field} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={column.field}
                                      checked={!!selectedColumns.find((c) => c.field === column.field)}
                                      onCheckedChange={() => handleToggleColumn(column)}
                                    />
                                    <Label htmlFor={column.field} className="text-sm font-normal cursor-pointer flex-1">
                                      {column.label}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </ScrollArea>
                  </div>

                  {/* Selected Columns */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Selected Columns ({selectedColumns.length})</Label>
                    </div>

                    <div className="text-xs text-muted-foreground">Reorder with drag & drop</div>

                    <ScrollArea className="h-[340px]">
                      <div className="space-y-2">
                        {selectedColumns.map((column) => (
                          <div key={column.field} className="flex items-center gap-2 p-2 bg-muted/50 rounded border">
                            <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                            <span className="text-sm flex-1">{column.label}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => handleToggleColumn(column)}
                            >
                              ✕
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="headers" defaultChecked />
                    <Label htmlFor="headers" className="text-sm font-normal">
                      Include column headers
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="summary" defaultChecked />
                    <Label htmlFor="summary" className="text-sm font-normal">
                      Include summary row (totals)
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Format */}
          {currentStep === 3 && (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Format & Options</h3>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">File Format:</Label>
                    <RadioGroup value={fileFormat} onValueChange={(v: any) => setFileFormat(v)}>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3 p-3 border rounded-lg">
                          <RadioGroupItem value="csv" id="format-csv" className="mt-0.5" />
                          <div className="flex-1">
                            <Label htmlFor="format-csv" className="font-normal cursor-pointer">
                              <div className="font-medium">CSV (Comma-separated values)</div>
                              <div className="text-sm text-muted-foreground">
                                Best for spreadsheets, data analysis, imports
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">File size: ~{getEstimatedSize()}</div>
                            </Label>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3 border rounded-lg">
                          <RadioGroupItem value="xlsx" id="format-xlsx" className="mt-0.5" />
                          <div className="flex-1">
                            <Label htmlFor="format-xlsx" className="font-normal cursor-pointer">
                              <div className="font-medium">Excel (XLSX)</div>
                              <div className="text-sm text-muted-foreground">
                                Best for advanced Excel features, formulas
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                File size: ~{Math.floor(getEstimatedRows() * 0.26)} KB
                              </div>
                            </Label>
                            {fileFormat === "xlsx" && (
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="excel-formatting" />
                                  <Label htmlFor="excel-formatting" className="text-sm font-normal">
                                    Include formatting
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox id="excel-summary" />
                                  <Label htmlFor="excel-summary" className="text-sm font-normal">
                                    Add summary sheet
                                  </Label>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3 border rounded-lg">
                          <RadioGroupItem value="pdf" id="format-pdf" className="mt-0.5" />
                          <div className="flex-1">
                            <Label htmlFor="format-pdf" className="font-normal cursor-pointer">
                              <div className="font-medium">PDF</div>
                              <div className="text-sm text-muted-foreground">Best for printing, archiving, sharing</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                File size: ~{Math.floor(getEstimatedRows() * 0.15)} KB
                              </div>
                            </Label>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Date/Time Format:</Label>
                      <Select defaultValue="iso">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="iso">YYYY-MM-DD HH:mm:ss</SelectItem>
                          <SelectItem value="us">MM/DD/YYYY hh:mm A</SelectItem>
                          <SelectItem value="eu">DD/MM/YYYY HH:mm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Timezone:</Label>
                      <Select defaultValue="malta">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="malta">Europe/Malta (CET)</SelectItem>
                          <SelectItem value="utc">UTC</SelectItem>
                          <SelectItem value="ny">America/New_York (EST)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">Privacy & Compliance:</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="privacy-cards" />
                        <Label htmlFor="privacy-cards" className="text-sm font-normal">
                          Redact full card numbers (show last 4 only)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="privacy-emails" />
                        <Label htmlFor="privacy-emails" className="text-sm font-normal">
                          Redact customer emails
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="privacy-metadata" defaultChecked />
                        <Label htmlFor="privacy-metadata" className="text-sm font-normal">
                          Include export metadata (date, user, filters)
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Delivery */}
          {currentStep === 4 && (
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">Delivery & Scheduling</h3>

                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Export Timing:</Label>
                    <RadioGroup value={exportTiming} onValueChange={(v: any) => setExportTiming(v)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="now" id="timing-now" />
                        <Label htmlFor="timing-now" className="font-normal cursor-pointer">
                          Export Now - Generate export immediately
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="schedule" id="timing-schedule" />
                        <Label htmlFor="timing-schedule" className="font-normal cursor-pointer">
                          Schedule Export - Generate and send automatically on a schedule
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Delivery Method:</Label>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <Checkbox id="delivery-download" defaultChecked />
                        <div className="flex-1">
                          <Label htmlFor="delivery-download" className="text-sm font-normal cursor-pointer">
                            Download from Download Center
                          </Label>
                          <p className="text-xs text-muted-foreground">File will be available for 30 days</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox id="delivery-email" defaultChecked />
                        <div className="flex-1">
                          <Label htmlFor="delivery-email" className="text-sm font-normal cursor-pointer">
                            Email to me (sarah.johnson@berrytap.com)
                          </Label>
                          <p className="text-xs text-muted-foreground">Send download link via email</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox id="delivery-additional" />
                        <div className="flex-1 space-y-2">
                          <Label htmlFor="delivery-additional" className="text-sm font-normal cursor-pointer">
                            Email to additional recipients:
                          </Label>
                          <Input placeholder="accountant@berrytap.com; owner@berrytap.com" />
                          <p className="text-xs text-muted-foreground">Separate multiple emails with semicolons</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="save-template"
                        checked={saveAsTemplate}
                        onCheckedChange={(checked) => setSaveAsTemplate(checked as boolean)}
                      />
                      <Label htmlFor="save-template" className="text-sm font-medium cursor-pointer">
                        Save this configuration as a template
                      </Label>
                    </div>

                    {saveAsTemplate && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-sm">Template Name:</Label>
                          <Input
                            placeholder="Daily Reconciliation Export"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Description (optional):</Label>
                          <Textarea placeholder="Export for daily accounting reconciliation with payouts" rows={2} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-sm font-semibold mb-2">Export Summary</div>
                    <div className="text-sm space-y-1">
                      <div>• Data: {getEstimatedRows().toLocaleString()} transactions</div>
                      <div>• Columns: {selectedColumns.length} selected</div>
                      <div>• Format: {fileFormat.toUpperCase()}</div>
                      <div>• Delivery: Download + Email</div>
                      <div>• Estimated size: {getEstimatedSize()}</div>
                      <div>• Estimated time: &lt; 5 seconds</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack}>
              ← Back
            </Button>
          )}
          {currentStep < 4 ? (
            <Button onClick={handleNext}>
              Next: {currentStep === 1 ? "Columns" : currentStep === 2 ? "Format" : "Delivery"} →
            </Button>
          ) : (
            <Button onClick={() => onOpenChange(false)}>Generate Export</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
