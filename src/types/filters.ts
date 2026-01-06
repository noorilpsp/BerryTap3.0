export interface FilterState {
  status: string[]
  categories: string[]
  tags: string[]
  priceRange: { min: number; max: number }
  dateRange: { start: Date | null; end: Date | null }
  hasPhoto: boolean | null
  hasCustomizations: boolean | null
  searchQuery: string
}

export interface FilterPreset {
  id: string
  name: string
  icon: string
  filters: Partial<FilterState>
}

export interface AdvancedFiltersProps {
  isOpen: boolean
  onClose: () => void
  currentFilters: FilterState
  onFiltersChange: (filters: FilterState) => void
  resultCount: number
  presets: FilterPreset[]
  onSavePreset: (name: string, filters: FilterState) => void
}
