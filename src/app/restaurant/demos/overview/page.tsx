"use client"

import { useState } from "react"
import { OverviewContent } from "@/components/overview-content"
import { MenuTabs } from "@/components/menu-tabs"
import { Toolbar } from "@/components/toolbar"
import type { MenuItem, Category } from "@/types/menu-item"

// Mock Data
const mockCategories: Category[] = [
  { id: "1", name: "Appetizers", emoji: "🥗", itemCount: 12, order: 1, isExpanded: true },
  { id: "2", name: "Pizzas", emoji: "🍕", itemCount: 9, order: 2, isExpanded: true },
  { id: "3", name: "Desserts", emoji: "🍰", itemCount: 7, order: 3, isExpanded: false },
  { id: "4", name: "Beverages", emoji: "🥤", itemCount: 15, order: 4, isExpanded: false },
]

const mockItems: MenuItem[] = [
  {
    id: "1",
    name: "Caesar Salad",
    description: "Fresh romaine lettuce, parmesan cheese, croutons, Caesar dressing",
    price: 12.5,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
    status: "live",
    tags: [
      { label: "Vegetarian", variant: "dietary" },
      { label: "Popular", variant: "attribute" },
    ],
    category: "Appetizers",
    categoryId: "1",
    customizationCount: 3,
  },
  {
    id: "2",
    name: "Bruschetta",
    description: "Toasted bread topped with fresh tomatoes, basil, and olive oil",
    price: 9.99,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400",
    status: "live",
    tags: [
      { label: "Vegan", variant: "dietary" },
      { label: "Gluten-Free Option", variant: "attribute" },
    ],
    category: "Appetizers",
    categoryId: "1",
  },
  {
    id: "3",
    name: "Margherita Pizza",
    description: "Classic pizza with tomato sauce, mozzarella, and fresh basil",
    price: 16.99,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
    status: "live",
    tags: [
      { label: "Vegetarian", variant: "dietary" },
      { label: "Chef's Special", variant: "attribute" },
    ],
    category: "Pizzas",
    categoryId: "2",
    customizationCount: 5,
  },
  {
    id: "4",
    name: "Pepperoni Pizza",
    description: "Loaded with pepperoni and mozzarella cheese",
    price: 18.99,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
    status: "live",
    tags: [{ label: "Popular", variant: "attribute" }],
    category: "Pizzas",
    categoryId: "2",
    customizationCount: 4,
  },
  {
    id: "5",
    name: "Tiramisu",
    description: "Classic Italian dessert with coffee-soaked ladyfingers and mascarpone",
    price: 8.99,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400",
    status: "draft",
    tags: [{ label: "Contains Alcohol", variant: "attribute" }],
    category: "Desserts",
    categoryId: "3",
  },
  {
    id: "6",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten center, served with vanilla ice cream",
    price: 9.99,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400",
    status: "soldout",
    tags: [
      { label: "Vegetarian", variant: "dietary" },
      { label: "Popular", variant: "attribute" },
    ],
    category: "Desserts",
    categoryId: "3",
    soldOutUntil: new Date("2025-01-20"),
  },
  {
    id: "7",
    name: "Caprese Salad",
    description: "Fresh mozzarella, tomatoes, and basil with balsamic glaze",
    price: 11.99,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=400",
    status: "live",
    tags: [
      { label: "Vegetarian", variant: "dietary" },
      { label: "Gluten-Free", variant: "dietary" },
    ],
    category: "Appetizers",
    categoryId: "1",
  },
  {
    id: "8",
    name: "Garlic Bread",
    description: "Toasted bread with garlic butter and herbs",
    price: 5.99,
    currency: "USD",
    status: "live",
    tags: [{ label: "Vegetarian", variant: "dietary" }],
    category: "Appetizers",
    categoryId: "1",
  },
  {
    id: "9",
    name: "BBQ Chicken Pizza",
    description: "BBQ sauce, grilled chicken, red onions, and cilantro",
    price: 19.99,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
    status: "live",
    tags: [{ label: "Spicy", variant: "attribute" }],
    category: "Pizzas",
    categoryId: "2",
    customizationCount: 6,
  },
  {
    id: "10",
    name: "Veggie Supreme Pizza",
    description: "Bell peppers, mushrooms, onions, olives, and tomatoes",
    price: 17.99,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=400",
    status: "hidden",
    tags: [
      { label: "Vegetarian", variant: "dietary" },
      { label: "Vegan Option", variant: "dietary" },
    ],
    category: "Pizzas",
    categoryId: "2",
  },
  {
    id: "11",
    name: "Panna Cotta",
    description: "Creamy Italian dessert with berry compote",
    price: 7.99,
    currency: "USD",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
    status: "live",
    tags: [
      { label: "Vegetarian", variant: "dietary" },
      { label: "Gluten-Free", variant: "dietary" },
    ],
    category: "Desserts",
    categoryId: "3",
  },
  {
    id: "12",
    name: "Iced Coffee",
    description: "Cold brew coffee served over ice",
    price: 4.99,
    currency: "USD",
    status: "live",
    tags: [
      { label: "Vegan", variant: "dietary" },
      { label: "Contains Caffeine", variant: "attribute" },
    ],
    category: "Beverages",
    categoryId: "4",
  },
  // Uncategorized items
  {
    id: "13",
    name: "Mystery Dish",
    description: "A special dish that needs to be categorized",
    price: 15.99,
    currency: "USD",
    status: "draft",
    tags: [{ label: "New", variant: "attribute" }],
    category: "",
    categoryId: "",
  },
]

export default function OverviewPage() {
  const [categories, setCategories] = useState(mockCategories)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleCategoryToggle = (id: string) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, isExpanded: !cat.isExpanded } : cat)))
  }

  const handleItemClick = (id: string) => {
    console.log("[v0] Item clicked:", id)
  }

  const handleAddItemToCategory = (categoryId: string) => {
    console.log("[v0] Add item to category:", categoryId)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log("[v0] Search query:", query)
  }

  const handleViewChange = (newView: "grid" | "list") => {
    setView(newView)
  }

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
    setCategories((prev) => prev.map((cat) => ({ ...cat, isExpanded: !isCollapsed })))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Menu Manager</h1>
          <MenuTabs activeTab={selectedTab} onTabChange={setSelectedTab} />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-[120px] z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <Toolbar
            searchQuery={searchQuery}
            onSearchChange={handleSearch}
            selectedView={view}
            onViewChange={handleViewChange}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            onAddItem={() => console.log("[v0] Add new item")}
            isCollapsed={isCollapsed}
            onToggleCollapse={handleToggleCollapse}
            totalItems={mockItems.length}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <OverviewContent
          categories={categories}
          items={mockItems}
          view={view}
          isLoading={isLoading}
          onItemClick={handleItemClick}
          onCategoryToggle={handleCategoryToggle}
          onAddItemToCategory={handleAddItemToCategory}
        />
      </div>

      {/* Toggle Loading State Button (for demo) */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setIsLoading(!isLoading)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg shadow-lg hover:bg-orange-700 transition-colors"
        >
          {isLoading ? "Hide Loading" : "Show Loading"}
        </button>
      </div>
    </div>
  )
}
