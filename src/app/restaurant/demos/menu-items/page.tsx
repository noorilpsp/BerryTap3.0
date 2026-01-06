"use client"

import { useState } from "react"
import { ItemCard } from "@/components/item-card"
import type { MenuItem } from "@/types/menu-item"
import type { Category } from "@/types/category"

const mockItems: MenuItem[] = [
  {
    id: "1",
    name: "Caesar Salad",
    description: "Fresh romaine lettuce, parmesan cheese, croutons, and house-made Caesar dressing",
    price: 12.5,
    currency: "$",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
    status: "live",
    categories: ["salads"],
    tags: [
      { label: "Vegetarian", variant: "dietary" },
      { label: "Popular", variant: "attribute" },
    ],
    customizationCount: 3,
  },
  {
    id: "2",
    name: "Margherita Pizza",
    description: "Classic pizza with fresh mozzarella, tomatoes, and basil",
    price: 16.99,
    currency: "$",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400",
    status: "soldout",
    categories: ["pizzas"],
    tags: [
      { label: "Vegetarian", variant: "dietary" },
      { label: "Chef's Special", variant: "attribute" },
    ],
    soldOutUntil: new Date("2025-10-20"),
  },
  {
    id: "3",
    name: "Grilled Salmon",
    description: "Atlantic salmon with lemon butter sauce, served with seasonal vegetables",
    price: 24.5,
    currency: "$",
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
    status: "live",
    tags: [
      { label: "Gluten-Free", variant: "dietary" },
      { label: "High Protein", variant: "attribute" },
      { label: "Omega-3", variant: "custom" },
    ],
    categories: ["seafood"],
    customizationCount: 5,
  },
  {
    id: "4",
    name: "Chicken Tacos",
    description: "Three soft tacos with grilled chicken, salsa, and guacamole",
    price: 13.99,
    currency: "$",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
    status: "draft",
    tags: [
      { label: "Spicy", variant: "attribute" },
      { label: "New", variant: "custom" },
    ],
    categories: ["mexican"],
    customizationCount: 2,
  },
  {
    id: "5",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten center, served with vanilla ice cream",
    price: 8.99,
    currency: "$",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400",
    status: "live",
    tags: [
      { label: "Dessert", variant: "custom" },
      { label: "Popular", variant: "attribute" },
    ],
    categories: ["desserts"],
  },
  {
    id: "6",
    name: "Greek Salad",
    description: "Fresh vegetables with feta cheese, olives, and olive oil dressing",
    price: 11.5,
    currency: "$",
    image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400",
    status: "hidden",
    tags: [
      { label: "Vegan Option", variant: "dietary" },
      { label: "Light", variant: "attribute" },
    ],
    categories: ["salads"],
  },
]

const mockCategories: Category[] = [
  {
    id: "salads",
    name: "Salads",
    emoji: "🥬",
    description: "Fresh, healthy salads",
    order: 1,
    itemCount: 3,
    menuIds: ["lunch", "dinner"],
    menuNames: ["Lunch Menu", "Dinner Menu"],
  },
  {
    id: "pizzas",
    name: "Pizzas",
    emoji: "🍕",
    description: "Wood-fired artisan pizzas",
    order: 2,
    itemCount: 2,
    menuIds: ["lunch", "dinner", "late-night"],
    menuNames: ["Lunch Menu", "Dinner Menu", "Late Night Menu"],
  },
  {
    id: "desserts",
    name: "Desserts",
    emoji: "🍰",
    description: "Sweet treats to finish your meal",
    order: 3,
    itemCount: 1,
    menuIds: ["lunch", "dinner"],
    menuNames: ["Lunch Menu", "Dinner Menu"],
  },
  {
    id: "seafood",
    name: "Seafood",
    emoji: "🐟",
    description: "Fresh seafood dishes",
    order: 4,
    itemCount: 1,
    menuIds: ["lunch", "dinner"],
    menuNames: ["Lunch Menu", "Dinner Menu"],
  },
  {
    id: "mexican",
    name: "Mexican",
    emoji: "🌮",
    description: "Authentic Mexican cuisine",
    order: 5,
    itemCount: 1,
    menuIds: ["lunch", "dinner"],
    menuNames: ["Lunch Menu", "Dinner Menu"],
  },
]

export default function MenuItemsPage() {
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const handleSelect = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleClick = (id: string) => {
    console.log("[v0] Item clicked:", id)
  }

  const handleQuickAction = (id: string, action: string) => {
    console.log("[v0] Quick action:", action, "on item:", id)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Menu Items</h1>
          <p className="text-gray-600">Showcasing ItemCard component with grid, list, and mobile variants</p>
        </div>

        {/* Grid Variant Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Grid Variant</h2>
            <p className="text-sm text-gray-600">Desktop view (≥1024px) - 300px cards with hover effects</p>
          </div>
          <div className="flex flex-wrap gap-6">
            {mockItems.slice(0, 3).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                variant="grid"
                categories={mockCategories}
                isSelected={selectedItems.includes(item.id)}
                onSelect={handleSelect}
                onClick={handleClick}
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
        </section>

        {/* List Variant Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">List Variant</h2>
            <p className="text-sm text-gray-600">Tablet view (768-1023px) - Horizontal layout with compact info</p>
          </div>
          <div className="space-y-3 max-w-4xl">
            {mockItems.slice(0, 4).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                variant="list"
                categories={mockCategories}
                isSelected={selectedItems.includes(item.id)}
                onSelect={handleSelect}
                onClick={handleClick}
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
        </section>

        {/* List Large Variant Section with bigger images */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">List Large Variant</h2>
            <p className="text-sm text-gray-600">
              Horizontal layout with larger images (128-160px) for better visual impact
            </p>
          </div>
          <div className="space-y-3 max-w-5xl">
            {mockItems.slice(0, 4).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                variant="list-large"
                isSelected={selectedItems.includes(item.id)}
                onSelect={handleSelect}
                onClick={handleClick}
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
        </section>

        {/* Mobile Variant Section */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Mobile Variant</h2>
            <p className="text-sm text-gray-600">Mobile view (&lt;768px) - Full width with large touch targets</p>
          </div>
          <div className="space-y-4 max-w-md">
            {mockItems.slice(0, 3).map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                variant="mobile"
                categories={mockCategories}
                isSelected={selectedItems.includes(item.id)}
                onSelect={handleSelect}
                onClick={handleClick}
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
        </section>

        {/* All States Demo */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">All States Demo</h2>
            <p className="text-sm text-gray-600">Live, Draft, Hidden, and Sold Out states</p>
          </div>
          <div className="flex flex-wrap gap-6">
            {mockItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                variant="grid"
                categories={mockCategories}
                isSelected={selectedItems.includes(item.id)}
                onSelect={handleSelect}
                onClick={handleClick}
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>
        </section>

        {/* Selected Items Info */}
        {selectedItems.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-orange-600 text-white px-6 py-3 rounded-lg shadow-lg">
            {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected
          </div>
        )}
      </div>
    </div>
  )
}
