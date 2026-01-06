"use client"

import { useState, useEffect } from "react"
import { ItemCard } from "@/components/item-card"
import { SelectionToolbar } from "@/components/selection-toolbar"
import { BulkActionModal } from "@/components/bulk-action-modal"
import { MenuTabs } from "@/components/menu-tabs"
import { Toolbar } from "@/components/toolbar"
import type { MenuItem } from "@/types/menu-item"
import { toast } from "sonner"

// Mock data
const mockItems: MenuItem[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    description: "Classic tomato sauce, fresh mozzarella, and basil",
    price: 14.99,
    currency: "USD",
    image: "/margherita-pizza.png",
    status: "live",
    categories: ["pizzas"],
    tags: ["vegetarian", "popular"],
    dietaryTags: ["vegetarian"],
    customizationGroups: ["pizza-size", "toppings"],
    availabilityMode: "menu-hours",
  },
  {
    id: "2",
    name: "Pepperoni Pizza",
    description: "Tomato sauce, mozzarella, and pepperoni",
    price: 16.99,
    currency: "USD",
    image: "/pepperoni-pizza.png",
    status: "live",
    categories: ["pizzas"],
    tags: ["popular", "spicy"],
    dietaryTags: [],
    customizationGroups: ["pizza-size", "toppings"],
    availabilityMode: "menu-hours",
  },
  {
    id: "3",
    name: "Caesar Salad",
    description: "Romaine lettuce, parmesan, croutons, and Caesar dressing",
    price: 9.99,
    currency: "USD",
    image: "/caesar-salad.png",
    status: "live",
    categories: ["salads"],
    tags: ["vegetarian"],
    dietaryTags: ["vegetarian"],
    customizationGroups: ["dressing"],
    availabilityMode: "menu-hours",
  },
  {
    id: "4",
    name: "Spaghetti Carbonara",
    description: "Pasta with eggs, cheese, pancetta, and black pepper",
    price: 15.99,
    currency: "USD",
    image: "/spaghetti-carbonara.png",
    status: "draft",
    categories: ["pasta"],
    tags: ["new"],
    dietaryTags: [],
    customizationGroups: [],
    availabilityMode: "menu-hours",
  },
  {
    id: "5",
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee and mascarpone",
    price: 7.99,
    currency: "USD",
    image: "/classic-tiramisu.png",
    status: "live",
    categories: ["desserts"],
    tags: ["popular"],
    dietaryTags: ["vegetarian"],
    customizationGroups: [],
    availabilityMode: "menu-hours",
  },
  {
    id: "6",
    name: "Chicken Wings",
    description: "Crispy wings with your choice of sauce",
    price: 12.99,
    currency: "USD",
    image: "/crispy-chicken-wings.png",
    status: "soldout",
    categories: ["appetizers"],
    tags: ["spicy"],
    dietaryTags: [],
    customizationGroups: ["wing-sauce"],
    availabilityMode: "menu-hours",
    soldOutUntil: new Date(Date.now() + 86400000),
  },
]

const availableTags = ["Vegan", "Vegetarian", "Gluten-Free", "Spicy", "Popular", "New", "Chef's Pick"]
const availableCategories = [
  { id: "appetizers", name: "Appetizers" },
  { id: "salads", name: "Salads" },
  { id: "pizzas", name: "Pizzas" },
  { id: "pasta", name: "Pasta" },
  { id: "desserts", name: "Desserts" },
  { id: "beverages", name: "Beverages" },
]

export default function BulkOperationsDemoPage() {
  const [items, setItems] = useState<MenuItem[]>(mockItems)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [view, setView] = useState<"grid" | "list">("grid")
  const [bulkActionModal, setBulkActionModal] = useState<{
    open: boolean
    action: "tags" | "change-status" | "categories" | "delete" | null
  }>({
    open: false,
    action: null,
  })

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedIds.length > 0) {
        setSelectedIds([])
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedIds])

  const handleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(items.map((item) => item.id))
    }
  }

  const handleClearSelection = () => {
    setSelectedIds([])
  }

  const handleQuickAction = async (action: string) => {
    console.log(`[v0] Quick action: ${action} on ${selectedIds.length} items`)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (action === "mark-live") {
      setItems((prev) =>
        prev.map((item) => (selectedIds.includes(item.id) ? { ...item, status: "live" as const } : item)),
      )
      toast.success(`${selectedIds.length} items marked as live`)
    } else if (action === "mark-soldout") {
      setItems((prev) =>
        prev.map((item) => (selectedIds.includes(item.id) ? { ...item, status: "soldout" as const } : item)),
      )
      toast.success(`${selectedIds.length} items marked as sold out`)
    } else if (action === "hide") {
      setItems((prev) =>
        prev.map((item) => (selectedIds.includes(item.id) ? { ...item, status: "hidden" as const } : item)),
      )
      toast.success(`${selectedIds.length} items hidden`)
    } else if (action === "duplicate") {
      toast.success(`${selectedIds.length} items duplicated`)
    }

    setSelectedIds([])
  }

  const handleMoreAction = (action: string) => {
    console.log(`[v0] More action: ${action}`)

    if (action.startsWith("status-")) {
      setBulkActionModal({ open: true, action: "change-status" })
    } else if (action === "tags") {
      setBulkActionModal({ open: true, action: "tags" })
    } else if (action === "categories") {
      setBulkActionModal({ open: true, action: "categories" })
    } else if (action === "delete") {
      setBulkActionModal({ open: true, action: "delete" })
    }
  }

  const handleBulkActionConfirm = async (data: any) => {
    console.log(`[v0] Bulk action confirmed:`, data)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (bulkActionModal.action === "tags") {
      toast.success(`Tags updated for ${selectedIds.length} items`)
    } else if (bulkActionModal.action === "change-status") {
      toast.success(`Status updated for ${selectedIds.length} items`)
    } else if (bulkActionModal.action === "categories") {
      toast.success(`Categories updated for ${selectedIds.length} items`)
    } else if (bulkActionModal.action === "delete") {
      setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)))
      toast.success(`${selectedIds.length} items deleted`)
    }

    setSelectedIds([])
  }

  const selectedItems = items.filter((item) => selectedIds.includes(item.id))

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Bulk Operations Demo</h1>
          <p className="text-gray-600">
            Select multiple items to perform bulk actions. Try selecting items and using the toolbar at the bottom.
          </p>
        </div>

        {/* Menu Tabs */}
        <MenuTabs
          tabs={[
            { id: "all", label: "All Items", icon: "🍽️", count: items.length },
            { id: "pizzas", label: "Pizzas", icon: "🍕", count: 2 },
            { id: "salads", label: "Salads", icon: "🥗", count: 1 },
            { id: "pasta", label: "Pasta", icon: "🍝", count: 1 },
          ]}
          activeTab="all"
          onTabChange={() => {}}
        />

        {/* Toolbar */}
        <Toolbar
          searchQuery=""
          onSearchChange={() => {}}
          selectedView={view}
          onViewChange={setView}
          selectedStatus={[]}
          onStatusChange={() => {}}
          selectedCategories={[]}
          onCategoriesChange={() => {}}
          selectedTags={[]}
          onTagsChange={() => {}}
          isCollapsed={false}
          onToggleCollapse={() => {}}
          onAddItem={() => {}}
        />

        {/* Items Grid */}
        <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              variant={view === "grid" ? "grid" : "list"}
              isSelected={selectedIds.includes(item.id)}
              selectionMode={selectedIds.length > 0}
              onSelect={handleSelect}
              onClick={() => console.log("Item clicked:", item.id)}
              onQuickAction={(id, action) => console.log("Quick action:", action, id)}
            />
          ))}
        </div>
      </div>

      {/* Selection Toolbar */}
      <SelectionToolbar
        selectedCount={selectedIds.length}
        totalCount={items.length}
        isAllSelected={selectedIds.length === items.length}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onQuickAction={handleQuickAction}
        onMoreAction={handleMoreAction}
      />

      {/* Bulk Action Modal */}
      <BulkActionModal
        open={bulkActionModal.open}
        onOpenChange={(open) => setBulkActionModal({ ...bulkActionModal, open })}
        action={bulkActionModal.action}
        selectedCount={selectedIds.length}
        selectedItems={selectedItems.map((item) => ({ id: item.id, name: item.name }))}
        availableTags={availableTags}
        availableCategories={availableCategories}
        onConfirm={handleBulkActionConfirm}
      />
    </div>
  )
}
