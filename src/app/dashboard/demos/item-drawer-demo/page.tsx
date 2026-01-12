"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { ItemDrawer } from "@/components/item-drawer"
import type { MenuItem } from "@/types/menu-item"

const mockItem: MenuItem = {
  id: "1",
  name: "Caesar Salad",
  description:
    "Fresh romaine lettuce with parmesan cheese, croutons, and house-made Caesar dressing. Served with garlic bread.",
  price: 12.5,
  currency: "USD",
  image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
  status: "live",
  categories: ["salads", "lunch-specials"],
  tags: ["popular", "chef-pick"],
  dietaryTags: ["vegetarian"],
  customizationGroups: ["salad-dressing", "protein-add-ons", "toppings"],
  availabilityMode: "menu-hours",
  nutrition: {
    calories: 350,
    allergens: ["dairy", "gluten"],
  },
}

export default function ItemDrawerDemo() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null)

  const handleSave = (item: MenuItem) => {
    console.log("[v0] Saving item:", item)
    setIsOpen(false)
  }

  const handleDelete = (id: string) => {
    console.log("[v0] Deleting item:", id)
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">ItemDrawer Demo</h1>
        <p className="text-gray-600">Comprehensive drawer component for editing menu items with three tabs</p>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => {
            setSelectedItem(mockItem)
            setIsOpen(true)
          }}
        >
          Edit Existing Item
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            setSelectedItem(null)
            setIsOpen(true)
          }}
        >
          Create New Item
        </Button>
      </div>

      <ItemDrawer
        item={selectedItem}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
