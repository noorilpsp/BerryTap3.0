"use client"

import { useState } from "react"
import { FileDown, Settings, Save, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DatasetSelector } from "./dataset-selector"
import { DateRangePicker } from "./date-range-picker"
import { GranularitySelector } from "./granularity-selector"
import { ColumnChooser } from "./column-chooser"
import { FilterBuilder } from "./filter-builder"
import { FormatSelector } from "./format-selector"
import { DestinationSelector } from "./destination-selector"
import { ExportSummary } from "./export-summary"
import { ExportActions } from "./export-actions"

export function ExportBuilder() {
  const [showInfoBanner, setShowInfoBanner] = useState(true)

  return (
    <div className="space-y-6">
      {/* Export Builder Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <FileDown className="h-5 w-5 text-primary" />
                <CardTitle>Export Builder</CardTitle>
              </div>
              <CardDescription>
                Configure your export with dataset, date range, columns, and filters
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2">
                <Save className="h-4 w-4" />
                Save Template
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Reset Builder</DropdownMenuItem>
                  <DropdownMenuItem>Import Config</DropdownMenuItem>
                  <DropdownMenuItem>Export Config JSON</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        {showInfoBanner && (
          <CardContent>
            <div className="relative rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 p-3">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 h-6 w-6"
                onClick={() => setShowInfoBanner(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <div className="flex gap-2 pr-6">
                <span className="text-lg">💡</span>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Quick Tip</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    Exports under 5,000 rows download immediately. Larger exports become server jobs with progress tracking.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Section 1: Dataset Selector */}
      <DatasetSelector />

      {/* Section 2: Date Range & Timezone */}
      <DateRangePicker />

      {/* Section 3: Granularity Selector */}
      <GranularitySelector />

      {/* Section 4: Column Chooser */}
      <ColumnChooser />

      {/* Section 5: Filter Builder */}
      <FilterBuilder />

      {/* Section 6: Format Selector */}
      <FormatSelector />

      {/* Section 7: Destination Selector */}
      <DestinationSelector />

      {/* Export Summary */}
      <ExportSummary />

      {/* Action Buttons */}
      <ExportActions />
    </div>
  )
}
