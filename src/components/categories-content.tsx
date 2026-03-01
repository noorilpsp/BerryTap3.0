"use client"

import { useState, useCallback } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Edit, Trash2, Plus } from "lucide-react"
import { CategoryDraggableList } from "@/components/drag-and-drop/category-draggable-list"
import type { Category } from "@/types/category"
import type { MenuItem } from "@/types/menu-item"

interface CategoriesContentProps {
  categories: Category[]
  items?: MenuItem[]
  onCreateCategory: () => void
  onEditCategory: (id: string) => void
  onDeleteCategory: (id: string) => void
  onReorder?: (categories: Category[]) => void
  uncategorizedCount?: number
  isLoading?: boolean
}

export function CategoriesContent({
  categories,
  items,
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onReorder,
  uncategorizedCount = 0,
  isLoading = false,
}: CategoriesContentProps) {
  const safeItems = items ?? []
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = useCallback(
    (categoryId: string) => {
      const newExpanded = new Set(expandedCategories)
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId)
      } else {
        newExpanded.add(categoryId)
      }
      setExpandedCategories(newExpanded)
    },
    [expandedCategories],
  )

  const handleCategoryClick = (category: Category) => {
    // Use the parent's onEditCategory to open the drawer in the page
    onEditCategory(category.id)
  }

  const handleDeleteClick = (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      onDeleteCategory(categoryId)
    }
  }

  const handleReorderCategories = (reorderedCategories: Category[]) => {
    onReorder?.(reorderedCategories)
  }

  const handleMoveItemToCategory = (itemId: string, fromCategoryId: string, toCategoryId: string) => {
    console.log(`Move item ${itemId} from ${fromCategoryId} to ${toCategoryId}`)
  }

  const handleReorderItemsInCategory = (categoryId: string, reorderedItems: MenuItem[]) => {
    console.log(`Reorder items in category ${categoryId}`, reorderedItems)
  }

  const handleAddItemToCategory = (categoryId: string) => {
    console.log(`Add item to category ${categoryId}`)
  }

  const renderCategoryHeader = (category: Category) => {
    const categoryItems = safeItems.filter((item) => item.categories && item.categories.includes(category.id))

    return (
      <div
        className="flex items-center justify-between flex-1 cursor-pointer"
        onClick={() => handleCategoryClick(category)}
      >
        {/* Left Side - Category Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {/* Emoji */}
          {category.emoji && <span className="text-2xl flex-shrink-0">{category.emoji}</span>}

          {/* Category Name */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-muted-foreground truncate mt-0.5">{category.description}</p>
            )}
          </div>

          {/* Item Count Badge */}
          <Badge variant="secondary" className="flex-shrink-0">
            {categoryItems.length} {categoryItems.length === 1 ? "item" : "items"}
          </Badge>

          {/* Menu Names Badges */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {(category.menuNames || []).slice(0, 2).map((menuName) => (
              <Badge key={menuName} variant="outline" className="text-xs">
                {menuName}
              </Badge>
            ))}
            {(category.menuNames || []).length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{(category.menuNames || []).length - 2}
              </Badge>
            )}
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors" aria-label="Category actions">
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleCategoryClick(category)} className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Category
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(category.id)}
                className="text-red-600 focus:text-red-600 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    )
  }

  const renderItem = (item: MenuItem, isDragging: boolean) => {
    return (
      <div
        className={`p-3 bg-card border border-border rounded-lg transition-all ${isDragging ? "opacity-50 shadow-lg" : ""}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{item.name}</p>
            {item.description && <p className="text-xs text-muted-foreground truncate mt-1">{item.description}</p>}
          </div>
          {item.price && <p className="text-sm font-semibold text-foreground flex-shrink-0">${item.price}</p>}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-6 w-6" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <CategoryDraggableList
        categories={categories.map((cat) => ({
          ...cat,
          isExpanded: expandedCategories.has(cat.id),
        }))}
        items={safeItems}
        onReorderCategories={handleReorderCategories}
        onMoveItemToCategory={handleMoveItemToCategory}
        onReorderItemsInCategory={handleReorderItemsInCategory}
        renderItem={renderItem}
        renderCategoryHeader={renderCategoryHeader}
        onCategoryToggle={() => {}}
        onAddItemToCategory={handleAddItemToCategory}
      />

      {/* Uncategorized Items Section */}
      {uncategorizedCount > 0 && (
        <div className="border border-yellow-200 dark:border-yellow-800 rounded-xl bg-yellow-50 dark:bg-yellow-950 px-6 py-4">
          <p className="text-yellow-900 dark:text-yellow-100 font-medium">
            {uncategorizedCount} uncategorized {uncategorizedCount === 1 ? "item" : "items"}
          </p>
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
            Assign these items to categories to organize your menu
          </p>
        </div>
      )}

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="flex items-center justify-center min-h-[60vh] border border-border rounded-xl bg-muted">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-foreground mb-2">No categories yet</h3>
            <p className="text-muted-foreground mb-6">Create your first category to organize your menu items</p>
            <Button onClick={onCreateCategory} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Category
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
