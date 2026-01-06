"use client"

import { useState } from "react"
import { GripVertical, Eye, Trash2, Plus, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { availableDatasets } from "@/app/restaurant/(dashboard)/exports/data"

export function ColumnChooser() {
  const dataset = availableDatasets[0] // Orders dataset
  const [selectedColumns, setSelectedColumns] = useState([
    "orderId", "placedAt", "amount", "tax", "tip", "total", "channel", "status"
  ])
  const [searchQuery, setSearchQuery] = useState("")

  const availableColumns = dataset.fields.filter(
    field => !selectedColumns.includes(field.key)
  )

  const selectedFields = dataset.fields.filter(field => 
    selectedColumns.includes(field.key)
  )

  const toggleColumn = (key: string) => {
    setSelectedColumns(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const removeColumn = (key: string) => {
    setSelectedColumns(prev => prev.filter(k => k !== key))
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'string': return 'default'
      case 'currency':
      case 'number': return 'secondary'
      case 'datetime': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            4. Select Columns <span className="text-destructive">*</span>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedColumns(dataset.fields.map(f => f.key))}>
              Select All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Columns */}
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Selected Columns ({selectedColumns.length} of {dataset.fields.length})
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedColumns([])}
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {selectedFields.map(field => (
                  <div
                    key={field.key}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 hover:bg-muted/50 transition-colors"
                  >
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                    <Checkbox checked={true} onCheckedChange={() => toggleColumn(field.key)} />
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-sm font-medium">{field.label}</span>
                      <Badge variant={getTypeBadgeVariant(field.type)} className="text-xs">
                        {field.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={() => removeColumn(field.key)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {selectedColumns.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No columns selected. Add columns from the available list below.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Columns */}
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-sm font-medium">
                Available Columns ({availableColumns.length})
              </CardTitle>
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {availableColumns
                  .filter(field => 
                    field.label.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(field => (
                    <div
                      key={field.key}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox checked={false} onCheckedChange={() => toggleColumn(field.key)} />
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-sm">{field.label}</span>
                        <Badge variant={getTypeBadgeVariant(field.type)} className="text-xs">
                          {field.type}
                        </Badge>
                        {field.pii && (
                          <Badge variant="secondary" className="text-xs">
                            PII
                          </Badge>
                        )}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 gap-1"
                        onClick={() => toggleColumn(field.key)}
                      >
                        <Plus className="h-3 w-3" />
                        Add
                      </Button>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex gap-2">
            <span className="text-lg">💡</span>
            <p className="text-xs text-muted-foreground">
              Drag columns to reorder. Columns appear in export in this order.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
