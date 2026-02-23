"use client"

import { cn } from "@/lib/utils"
import type { Category } from "@/lib/take-order-data"

interface CategoryNavProps {
  categories: Category[]
  selectedCategory: string
  selectedCategories?: string[]
  onSelectCategory: (categoryId: string) => void
  variant?: "horizontal" | "vertical"
}

export function CategoryNav({
  categories,
  selectedCategory,
  selectedCategories,
  onSelectCategory,
  variant = "horizontal",
}: CategoryNavProps) {
  if (variant === "vertical") {
    return (
      <nav className="flex flex-col gap-1 p-4">
        {categories.map((category) => {
          const isSelected = selectedCategories
            ? selectedCategories.includes(category.id)
            : category.id === selectedCategory

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <span className="text-xl leading-none">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          )
        })}
      </nav>
    )
  }

  return (
    <div className="border-b border-border bg-card px-4">
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-px">
        {categories.map((category) => {
          const isSelected = selectedCategories
            ? selectedCategories.includes(category.id)
            : category.id === selectedCategory

          return (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                isSelected
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-lg leading-none">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
