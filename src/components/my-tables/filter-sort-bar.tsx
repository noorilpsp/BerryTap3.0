"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { FilterOption, SortOption } from "@/lib/my-tables-data"

interface FilterSortBarProps {
  filter: FilterOption
  sort: SortOption
  onFilterChange: (filter: FilterOption) => void
  onSortChange: (sort: SortOption) => void
}

export function FilterSortBar({
  filter,
  sort,
  onFilterChange,
  onSortChange,
}: FilterSortBarProps) {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2.5 md:px-6">
      <Select
        value={filter}
        onValueChange={(v) => onFilterChange(v as FilterOption)}
      >
        <SelectTrigger className="h-8 w-auto min-w-[120px] gap-1.5 text-xs">
          <SelectValue placeholder="All Tables" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tables</SelectItem>
          <SelectItem value="urgent">Needs Attention</SelectItem>
          <SelectItem value="food_ready">Food Ready</SelectItem>
          <SelectItem value="active">In Progress</SelectItem>
          <SelectItem value="good">All Served</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sort}
        onValueChange={(v) => onSortChange(v as SortOption)}
      >
        <SelectTrigger className="h-8 w-auto min-w-[160px] gap-1.5 text-xs">
          <SelectValue placeholder="Needs Attention First" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="attention">Attention First</SelectItem>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="table_number">Table Number</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
