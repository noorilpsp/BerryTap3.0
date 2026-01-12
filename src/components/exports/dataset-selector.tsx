"use client"

import { useState } from "react"
import { Database, ChevronDown, Lock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { availableDatasets, type Dataset } from "@/app/dashboard/(dashboard)/exports/data"

const categoryLabels: Record<string, { label: string; emoji: string }> = {
  transactions: { label: "TRANSACTIONS", emoji: "📊" },
  workforce: { label: "WORKFORCE", emoji: "👥" },
  menu: { label: "MENU", emoji: "🍽️" },
  reservations: { label: "RESERVATIONS", emoji: "📅" },
  operations: { label: "OPERATIONS", emoji: "📍" },
  customers: { label: "CUSTOMERS", emoji: "💰" },
  reports: { label: "REPORTS", emoji: "📈" },
  inventory: { label: "INVENTORY (Phase 2)", emoji: "📦" },
}

export function DatasetSelector() {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("orders")
  const [searchQuery, setSearchQuery] = useState("")

  const selectedDataset = availableDatasets.find(d => d.id === selectedDatasetId)
  const piiFields = selectedDataset?.fields.filter(f => f.pii) || []
  const piiCount = piiFields.length

  const groupedDatasets = availableDatasets.reduce((acc, dataset) => {
    if (!acc[dataset.category]) {
      acc[dataset.category] = []
    }
    acc[dataset.category].push(dataset)
    return acc
  }, {} as Record<string, Dataset[]>)

  const getLastExportedLabel = (isoDate: string | null) => {
    if (!isoDate) return "Never"
    const date = new Date(isoDate)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours} hours ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    const diffWeeks = Math.floor(diffDays / 7)
    if (diffWeeks === 1) return "1 week ago"
    return `${diffWeeks} weeks ago`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          1. Select Dataset <span className="text-destructive">*</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedDatasetId} onValueChange={setSelectedDatasetId}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 pb-2">
              <Input
                placeholder="Search datasets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
              />
            </div>
            {Object.entries(groupedDatasets).map(([category, datasets]) => {
              const categoryInfo = categoryLabels[category]
              return (
                <SelectGroup key={category}>
                  <SelectLabel className="text-xs font-semibold text-muted-foreground">
                    {categoryInfo.emoji} {categoryInfo.label}
                  </SelectLabel>
                  {datasets
                    .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(dataset => (
                      <SelectItem 
                        key={dataset.id} 
                        value={dataset.id}
                        disabled={!dataset.enabled}
                      >
                        <div className="flex items-center gap-2 w-full">
                          <span>{dataset.enabled ? "✓" : "•"}</span>
                          <span className="flex-1">{dataset.name}</span>
                          <span className="text-xs text-muted-foreground">{dataset.rowCountLabel}</span>
                          {dataset.popularity >= 85 && <span>⭐</span>}
                          {piiFields.length > 0 && <Lock className="h-3 w-3" />}
                        </div>
                      </SelectItem>
                    ))}
                </SelectGroup>
              )
            })}
          </SelectContent>
        </Select>

        {selectedDataset && (
          <div className="text-sm text-muted-foreground">
            {selectedDataset.rowCountLabel} records • {selectedDataset.fields.length} fields • Last exported {getLastExportedLabel(selectedDataset.lastExported)}
          </div>
        )}

        {/* Dataset Preview */}
        {selectedDataset && (
          <Card className="border-muted">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Dataset Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Available Fields ({selectedDataset.fields.length}):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDataset.fields.map(field => (
                    <Badge 
                      key={field.key} 
                      variant={field.pii ? "secondary" : "outline"}
                      className="text-xs gap-1"
                    >
                      {field.pii && <Lock className="h-2.5 w-2.5" />}
                      {field.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {piiCount > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-warning/50 bg-warning/10 p-3">
                  <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-warning-foreground">
                    {piiCount} field{piiCount > 1 ? 's' : ''} contain{piiCount === 1 ? 's' : ''} PII (personally identifiable information)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
