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
import { ItemCard } from "@/components/item-card"
import { CategoryDraggableList } from "@/components/drag-and-drop/category-draggable-list"
import { EmptyState } from "@/components/empty-state"
import { MoreVertical, ChevronDown, Package, Edit, ArrowUpDown, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MenuItem, Category } from "@/types/menu-item"

interface OverviewContentProps {
  categories: Category[]
  items: MenuItem[]
  view: "grid" | "list"
  isLoading?: boolean
  onItemClick: (id: string) => void
  onCategoryToggle: (id: string) => void
  onAddItemToCategory: (categoryId: string) => void
  onReorderCategories?: (categories: Category[]) => void
  onReorderItems?: (categoryId: string, items: MenuItem[]) => void
  onMoveItemToCategory?: (itemId: string, fromCategoryId: string, toCategoryId: string) => void
}

export function OverviewContent({
  categories,
  items,
  view,
  isLoading = false,
  onItemClick,
  onCategoryToggle,
  onAddItemToCategory,
  onReorderCategories,
  onReorderItems,
  onMoveItemToCategory,
}: OverviewContentProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  // Handle quick actions
  const handleQuickAction = (id: string, action: string) => {
    console.log(`Quick action: ${action} on item ${id}`)
  }

  const handleItemsReorder = useCallback(
    (categoryId: string, reorderedItems: MenuItem[]) => {
      onReorderItems?.(categoryId, reorderedItems)
    },
    [onReorderItems],
  )

  const handleMoveItem = useCallback(
    (itemId: string, fromCategoryId: string, toCategoryId: string) => {
      onMoveItemToCategory?.(itemId, fromCategoryId, toCategoryId)
    },
    [onMoveItemToCategory],
  )

  // Render category header (toggleable content only)
  const renderCategoryHeader = (category: Category) => (
    <div className="flex items-center gap-4 flex-1">
      {/* Emoji */}
      {category.emoji && <span className="text-2xl">{category.emoji}</span>}

      {/* Name */}
      <h2 className="text-xl font-semibold text-foreground">{category.name}</h2>

      {/* Item Count */}
      <span className="text-sm text-muted-foreground">
        ({items.filter((item) => item.categories?.includes(category.id)).length}{" "}
        {items.filter((item) => item.categories?.includes(category.id)).length === 1 ? "item" : "items"})
      </span>

      {/* Expand/Collapse Icon */}
      <ChevronDown
        className={cn(
          "w-5 h-5 text-muted-foreground transition-transform duration-300 ml-auto",
          !category.isExpanded && "rotate-180",
        )}
      />
    </div>
  )

  // Render category actions (dropdown menu)
  const renderCategoryActions = (category: Category) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          onClick={(e) => e.stopPropagation()}
          aria-label="Category actions"
        >
          <MoreVertical className="w-5 h-5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Edit className="w-4 h-4 mr-2" />
          Edit Category
        </DropdownMenuItem>
        <DropdownMenuItem>
          <ArrowUpDown className="w-4 h-4 mr-2" />
          Reorder Items
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 focus:text-red-600">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Category
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="px-6 py-4 bg-muted flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-5 w-20" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-6" />
              </div>
            </div>
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty State
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <EmptyState
          icon={<Package className="w-24 h-24" />}
          title="No items yet"
          description="Get started by adding your first menu item"
          action={{
            label: "+ Add First Item",
            onClick: () => console.log("Add first item clicked"),
          }}
          secondaryAction={{
            label: "Import from Spreadsheet",
            onClick: () => console.log("Import clicked"),
          }}
        />
      </div>
    )
  }

  return (
    <CategoryDraggableList
      categories={categories}
      items={items}
      onReorderCategories={(reorderedCategories) => onReorderCategories?.(reorderedCategories)}
      onMoveItemToCategory={handleMoveItem}
      onReorderItemsInCategory={handleItemsReorder}
      renderItem={(item, isDragging) => (
        <ItemCard
          item={item}
          variant="list-large"
          categories={categories}
          onClick={onItemClick}
          onQuickAction={handleQuickAction}
        />
      )}
      renderCategoryHeader={renderCategoryHeader}
      renderCategoryActions={renderCategoryActions}
      onCategoryToggle={onCategoryToggle}
      onAddItemToCategory={onAddItemToCategory}
    />
  )
}
