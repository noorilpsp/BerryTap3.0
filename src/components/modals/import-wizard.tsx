"use client"

import type React from "react"

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
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Upload,
  FileSpreadsheet,
  Check,
  AlertTriangle,
  X,
  Info,
  ChevronRight,
  ChevronDown,
  Download,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type { ImportFile, ColumnMapping, ValidationIssue, ImportProgress } from "@/types/import-export"

interface ImportWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MOCK_FILE: ImportFile = {
  name: "menu_items.xlsx",
  size: "2.4 MB",
  rows: 127,
  columns: ["Item Name", "Cost", "Type", "Extra Info", "Status", "Notes", "Photo URL", "Tags"],
  data: [
    { "Item Name": "Caesar Salad", Cost: "12.50", Type: "Salads", Status: "live" },
    { "Item Name": "Pepperoni Pizza", Cost: "18.99", Type: "Pizzas", Status: "live" },
    { "Item Name": "Spaghetti Carbonara", Cost: "15.50", Type: "Pasta", Status: "live" },
  ],
}

const MOCK_VALIDATION_ISSUES: ValidationIssue[] = [
  {
    row: 12,
    severity: "warning",
    item: "Special Pizza",
    issue: "Category 'Specials' doesn't exist",
    suggestion: "Create category or map to existing",
  },
  {
    row: 15,
    severity: "error",
    item: "Pasta Dish",
    issue: "Invalid price format: 'twelve dollars'",
    suggestion: "Enter numeric value",
  },
  {
    row: 23,
    severity: "warning",
    item: "Burger",
    issue: "Duplicate name in existing menu",
    suggestion: "Skip, rename, or overwrite",
  },
]

export function ImportWizard({ open, onOpenChange }: ImportWizardProps) {
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<ImportFile | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showRequirements, setShowRequirements] = useState(false)
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([])
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    current: 0,
    total: 0,
    status: "validating",
    message: "Validating data...",
    items: [],
  })
  const [isImporting, setIsImporting] = useState(false)

  const steps = [
    { number: 1, name: "Upload", completed: step > 1 },
    { number: 2, name: "Map", completed: step > 2 },
    { number: 3, name: "Validate", completed: step > 3 },
    { number: 4, name: "Import", completed: step > 4 },
  ]

  const handleFileSelect = (selectedFile: File) => {
    // Mock file processing
    setFile(MOCK_FILE)

    // Initialize column mappings
    const mappings: ColumnMapping[] = MOCK_FILE.columns.map((col) => {
      let targetField = "skip"
      if (col.toLowerCase().includes("name")) targetField = "name"
      else if (col.toLowerCase().includes("cost") || col.toLowerCase().includes("price")) targetField = "price"
      else if (col.toLowerCase().includes("type") || col.toLowerCase().includes("category")) targetField = "category"
      else if (col.toLowerCase().includes("description")) targetField = "description"
      else if (col.toLowerCase().includes("status")) targetField = "status"

      return {
        sourceColumn: col,
        targetField,
        preview: MOCK_FILE.data[0]?.[col] || "-",
      }
    })
    setColumnMappings(mappings)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleNext = () => {
    if (step === 2) {
      // Validate mappings
      const hasRequiredFields =
        columnMappings.some((m) => m.targetField === "name") &&
        columnMappings.some((m) => m.targetField === "price") &&
        columnMappings.some((m) => m.targetField === "category")

      if (!hasRequiredFields) {
        toast.error("Missing required fields", {
          description: "Please map Name, Price, and Category fields",
        })
        return
      }

      // Set validation issues
      setValidationIssues(MOCK_VALIDATION_ISSUES)
    }

    if (step === 3) {
      // Start import
      startImport()
      return
    }

    setStep(step + 1)
  }

  const startImport = async () => {
    setIsImporting(true)
    setStep(4)

    const total = 120
    const statuses = [
      "validating",
      "creating-categories",
      "importing-items",
      "processing-images",
      "finalizing",
      "complete",
    ] as const

    for (let i = 0; i < statuses.length; i++) {
      const status = statuses[i]
      setImportProgress({
        current: Math.floor((i / statuses.length) * total),
        total,
        status,
        message: getStatusMessage(status),
        items: [],
      })
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Add imported items
    const items = [
      { name: "Caesar Salad", status: "success" as const },
      { name: "Pepperoni Pizza", status: "success" as const },
      { name: "Spaghetti Carbonara", status: "success" as const },
      { name: "Special Item", status: "warning" as const, message: "Skipped (duplicate)" },
    ]

    setImportProgress({
      current: total,
      total,
      status: "complete",
      message: "Import complete!",
      items,
    })

    setIsImporting(false)

    toast.success("Import completed", {
      description: "118 items imported successfully, 2 items skipped",
    })
  }

  const getStatusMessage = (status: ImportProgress["status"]) => {
    const messages = {
      validating: "Validating data...",
      "creating-categories": "Creating categories...",
      "importing-items": "Importing items...",
      "processing-images": "Processing images...",
      finalizing: "Finalizing...",
      complete: "Import complete!",
      error: "Import failed",
    }
    return messages[status]
  }

  const readyCount = validationIssues.filter((i) => i.severity === "success").length + (127 - validationIssues.length)
  const warningCount = validationIssues.filter((i) => i.severity === "warning").length
  const errorCount = validationIssues.filter((i) => i.severity === "error").length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {step === 1 && "Upload Menu Data"}
            {step === 2 && "Map Your Columns"}
            {step === 3 && "Review Import"}
            {step === 4 && (importProgress.status === "complete" ? "Import Complete" : "Importing...")}
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Import items, categories, and customizations from a file"}
            {step === 2 && "Match your spreadsheet columns to menu fields"}
            {step === 3 && "Check for errors before importing"}
            {step === 4 &&
              (importProgress.status === "complete"
                ? "Your menu has been imported successfully"
                : "Please wait while we import your items")}
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 py-4">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    s.completed
                      ? "border-primary bg-primary text-primary-foreground"
                      : s.number === step
                        ? "border-primary text-primary"
                        : "border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  {s.completed ? <Check className="h-4 w-4" /> : s.number}
                </div>
                <span className="text-xs font-medium">{s.name}</span>
              </div>
              {index < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />}
            </div>
          ))}
        </div>

        <ScrollArea className="max-h-[50vh]">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-4">
              {!file ? (
                <>
                  <div
                    className={cn(
                      "border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/30 hover:border-muted-foreground/50",
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("file-input")?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Drag and drop your file here, or click to browse</p>
                    <p className="text-sm text-muted-foreground">Supports: XLSX, CSV (max 10MB)</p>
                    <input
                      id="file-input"
                      type="file"
                      accept=".xlsx,.csv"
                      className="hidden"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0]
                        if (selectedFile) handleFileSelect(selectedFile)
                      }}
                    />
                  </div>

                  <Collapsible open={showRequirements} onOpenChange={setShowRequirements}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full justify-between">
                        <span className="flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          File Requirements
                        </span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform", showRequirements && "rotate-180")} />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 pt-2">
                      <Alert>
                        <AlertDescription>
                          <p className="font-medium mb-2">Your file should include:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Item names (required)</li>
                            <li>Prices (required)</li>
                            <li>Categories (required)</li>
                            <li>Descriptions (optional)</li>
                            <li>Status (optional)</li>
                          </ul>
                        </AlertDescription>
                      </Alert>
                      <Button variant="outline" className="w-full bg-transparent">
                        <Download className="mr-2 h-4 w-4" />
                        Download Sample Template
                      </Button>
                    </CollapsibleContent>
                  </Collapsible>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <FileSpreadsheet className="h-10 w-10 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {file.size} • Found {file.columns.length} columns, {file.rows} rows
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                      Change File
                    </Button>
                  </div>

                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted px-4 py-2">
                      <p className="text-sm font-medium">Preview (first 3 rows)</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b">
                          <tr>
                            {file.columns.map((col) => (
                              <th key={col} className="px-4 py-2 text-left font-medium">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {file.data.slice(0, 3).map((row, i) => (
                            <tr key={i} className="border-b last:border-0">
                              {file.columns.map((col) => (
                                <td key={col} className="px-4 py-2">
                                  {row[col]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Map Columns */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-2">
                  <p className="text-sm font-medium">Column Mapping</p>
                </div>
                <div className="divide-y">
                  {columnMappings.map((mapping, index) => (
                    <div key={index} className="grid grid-cols-[1fr,auto,1fr,1fr] gap-4 items-center p-4">
                      <div>
                        <p className="font-medium text-sm">{mapping.sourceColumn}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      <Select
                        value={mapping.targetField}
                        onValueChange={(value) => {
                          const newMappings = [...columnMappings]
                          newMappings[index].targetField = value
                          setColumnMappings(newMappings)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Name *</SelectItem>
                          <SelectItem value="price">Price *</SelectItem>
                          <SelectItem value="category">Category *</SelectItem>
                          <SelectItem value="description">Description</SelectItem>
                          <SelectItem value="status">Status</SelectItem>
                          <SelectItem value="tags">Tags</SelectItem>
                          <SelectItem value="imageUrl">Image URL</SelectItem>
                          <SelectItem value="skip">Skip</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="text-sm text-muted-foreground truncate">{mapping.preview}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Validate */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Ready</span>
                  </div>
                  <p className="text-2xl font-bold">{readyCount}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Warnings</span>
                  </div>
                  <p className="text-2xl font-bold">{warningCount}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Errors</span>
                  </div>
                  <p className="text-2xl font-bold">{errorCount}</p>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Total</span>
                  </div>
                  <p className="text-2xl font-bold">127</p>
                </div>
              </div>

              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All (127)</TabsTrigger>
                  <TabsTrigger value="ready">Ready ({readyCount})</TabsTrigger>
                  <TabsTrigger value="warnings">Warnings ({warningCount})</TabsTrigger>
                  <TabsTrigger value="errors">Errors ({errorCount})</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-2">
                  {validationIssues.map((issue, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        {issue.severity === "error" && <X className="h-5 w-5 text-red-600 mt-0.5" />}
                        {issue.severity === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                        {issue.severity === "success" && <Check className="h-5 w-5 text-green-600 mt-0.5" />}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Row {issue.row}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm">{issue.item}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{issue.issue}</p>
                          <p className="text-sm text-blue-600">{issue.suggestion}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Fix
                        </Button>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Step 4: Import Progress */}
          {step === 4 && (
            <div className="space-y-4">
              {importProgress.status !== "complete" ? (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{importProgress.message}</span>
                      <span className="font-medium">
                        {Math.round((importProgress.current / importProgress.total) * 100)}%
                      </span>
                    </div>
                    <Progress value={(importProgress.current / importProgress.total) * 100} />
                  </div>

                  <div className="border rounded-lg p-4 max-h-[200px] overflow-y-auto">
                    <p className="text-sm font-medium mb-2">Import Log</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">{importProgress.message}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Import Complete!</h3>
                    <div className="text-center space-y-1">
                      <p className="text-sm">
                        <span className="font-medium text-green-600">118 items</span> imported successfully
                      </p>
                      <p className="text-sm">
                        <span className="font-medium text-yellow-600">2 items</span> skipped
                      </p>
                    </div>
                  </div>

                  <div className="border rounded-lg divide-y max-h-[200px] overflow-y-auto">
                    {importProgress.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3">
                        {item.status === "success" && <Check className="h-4 w-4 text-green-600" />}
                        {item.status === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                        {item.status === "error" && <X className="h-4 w-4 text-red-600" />}
                        <span className="text-sm flex-1">{item.name}</span>
                        {item.message && <span className="text-xs text-muted-foreground">{item.message}</span>}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          {step < 4 && (
            <>
              <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={!file && step === 1}>
                {step === 3 ? `Import ${readyCount} Items` : "Continue"}
              </Button>
            </>
          )}
          {step === 4 && importProgress.status === "complete" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Done
              </Button>
              <Button>View Imported Items</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
