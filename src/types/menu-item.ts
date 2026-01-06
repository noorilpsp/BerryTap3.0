export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  currency: string
  image?: string
  status: "live" | "draft" | "hidden" | "soldout"
  categories: string[]
  tags: string[]
  dietaryTags: Array<"vegetarian" | "vegan" | "gluten-free">
  customizationGroups: string[]
  availabilityMode: "menu-hours" | "custom"
  customSchedule?: Array<{
    days: number[]
    startTime: string
    endTime: string
  }>
  soldOutUntil?: Date | null
  nutrition?: {
    calories?: number
    allergens?: string[]
  }
  // Legacy fields for backward compatibility
  category?: string
  categoryId?: string
  customizationCount?: number
}

export interface Category {
  id: string
  name: string
  emoji?: string
  itemCount: number
  order: number
  isExpanded: boolean
}
