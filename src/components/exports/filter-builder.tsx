"use client"

import { useState } from "react"
import { Filter, Plus, X, DollarSign, Calendar, Hash, ShoppingBag, CheckCircle, CreditCard, User, LayoutGrid, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { filterableFields, type ActiveFilter } from "@/app/dashboard/(dashboard)/exports/data"

const iconMap = {
  DollarSign,
  Calendar,
  Hash,
  ShoppingBag,
  CheckCircle,
  CreditCard,
  User,
  LayoutGrid,
  MapPin
}

export function FilterBuilder() {
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([
    {
      filterId: "filter_001",
      field: "channel",
      fieldLabel: "Channel",
      operator: "=",
      operatorLabel: "Is (any of)",
      value: ["dine_in", "takeout"],
      valueLabel: "Dine In, Takeout",
      type: "enum"
    },
    {
      filterId: "filter_002",
      field: "total",
      fieldLabel: "Total Amount",
      operator: "≥",
      operatorLabel: "Greater than or equal",
      value: 50.00,
      valueLabel: "$50.00",
      type: "currency"
    },
    {
      filterId: "filter_003",
      field: "status",
      fieldLabel: "Status",
      operator: "=",
      operatorLabel: "Is (any of)",
      value: ["completed"],
      valueLabel: "Completed",
      type: "enum"
    }
  ])
  const [showAddFilter, setShowAddFilter] = useState(false)

  const removeFilter = (filterId: string) => {
    setActiveFilters(activeFilters.filter(f => f.filterId !== filterId))
  }

  const clearAllFilters = () => {
    setActiveFilters([])
  }

  const groupedFields = {
    financial: filterableFields.filter(f => f.category === "financial"),
    status: filterableFields.filter(f => f.category === "status"),
    dates: filterableFields.filter(f => f.category === "dates"),
    location: filterableFields.filter(f => f.category === "location"),
    pii: filterableFields.filter(f => f.category === "pii")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base font-medium">5. Add Filters (Optional)</CardTitle>
          </div>
          <Popover open={showAddFilter} onOpenChange={setShowAddFilter}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <div className="p-3 border-b">
                <Input placeholder="Search fields..." className="h-9" />
              </div>
              <div className="max-h-96 overflow-y-auto">
                {/* Financial */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">FINANCIAL</span>
                  </div>
                  <div className="space-y-1">
                    {groupedFields.financial.map(field => (
                      <button
                        key={field.key}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-sm"
                        onClick={() => setShowAddFilter(false)}
                      >
                        <span>{field.label}</span>
                        <Badge variant="secondary" className="text-xs">{field.type}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
                <Separator />
                {/* Status & Channel */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">STATUS & CHANNEL</span>
                  </div>
                  <div className="space-y-1">
                    {groupedFields.status.map(field => (
                      <button
                        key={field.key}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-sm"
                        onClick={() => setShowAddFilter(false)}
                      >
                        <span>{field.label}</span>
                        <Badge variant="secondary" className="text-xs">{field.type}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
                <Separator />
                {/* Dates & Times */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">DATES & TIMES</span>
                  </div>
                  <div className="space-y-1">
                    {groupedFields.dates.map(field => (
                      <button
                        key={field.key}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-sm"
                        onClick={() => setShowAddFilter(false)}
                      >
                        <span>{field.label}</span>
                        <Badge variant="secondary" className="text-xs">{field.type}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
                <Separator />
                {/* Location & Service */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">LOCATION & SERVICE</span>
                  </div>
                  <div className="space-y-1">
                    {groupedFields.location.map(field => (
                      <button
                        key={field.key}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-sm"
                        onClick={() => setShowAddFilter(false)}
                      >
                        <span>{field.label}</span>
                        <Badge variant="secondary" className="text-xs">{field.type}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
                <Separator />
                {/* PII Fields */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-muted-foreground">PII FIELDS (requires permission)</span>
                  </div>
                  <div className="space-y-1">
                    {groupedFields.pii.map(field => (
                      <button
                        key={field.key}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-sm"
                        onClick={() => setShowAddFilter(false)}
                      >
                        <span className="flex items-center gap-2">
                          {field.label}
                          <span className="text-xs">🔒</span>
                        </span>
                        <Badge variant="secondary" className="text-xs">{field.type}</Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeFilters.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Filters ({activeFilters.length})</span>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
            <div className="space-y-2" role="list" aria-label="Active export filters">
              {activeFilters.map((filter, index) => (
                <div key={filter.filterId}>
                  <div className="flex items-center gap-2 p-3 rounded-lg border bg-card" role="listitem">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-sm font-medium min-w-32">{filter.fieldLabel}</span>
                      <Badge variant="secondary" className="text-xs">{filter.operatorLabel}</Badge>
                      <span className="text-sm flex-1">{filter.valueLabel}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFilter(filter.filterId)}
                      aria-label={`Remove filter for ${filter.fieldLabel}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  {index < activeFilters.length - 1 && (
                    <div className="flex items-center justify-center py-1">
                      <span className="text-xs font-medium text-muted-foreground">AND</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Add Another Filter
            </Button>
          </div>
        )}
        
        <div className="rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 p-3">
          <div className="flex gap-2">
            <span className="text-lg">💡</span>
            <div className="space-y-1 text-sm">
              <p className="text-blue-900 dark:text-blue-100">
                Filters will reduce the number of exported records
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                Current estimate with filters: ~1,847 records (down from 2,847)
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
