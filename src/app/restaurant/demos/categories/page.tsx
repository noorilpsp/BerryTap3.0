"use client"

import { useState } from "react"
import { CategoriesContent } from "@/components/categories-content"
import type { Category } from "@/types/category"
import { toast } from "sonner"

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Appetizers",
    emoji: "🥗",
    description: "Start your meal with these delicious options",
    order: 1,
    itemCount: 12,
    menuIds: ["lunch", "dinner"],
    menuNames: ["Lunch Menu", "Dinner Menu"],
  },
  {
    id: "2",
    name: "Salads",
    emoji: "🥬",
    description: "Fresh, healthy salads",
    order: 2,
    itemCount: 8,
    menuIds: ["lunch", "dinner"],
    menuNames: ["Lunch Menu", "Dinner Menu"],
  },
  {
    id: "3",
    name: "Pizzas",
    emoji: "🍕",
    description: "Wood-fired artisan pizzas",
    order: 3,
    itemCount: 15,
    menuIds: ["lunch", "dinner", "late-night"],
    menuNames: ["Lunch Menu", "Dinner Menu", "Late Night Menu"],
  },
  {
    id: "4",
    name: "Pasta",
    emoji: "🍝",
    description: "Traditional Italian pasta dishes",
    order: 4,
    itemCount: 10,
    menuIds: ["lunch", "dinner"],
    menuNames: ["Lunch Menu", "Dinner Menu"],
  },
  {
    id: "5",
    name: "Desserts",
    emoji: "🍰",
    description: "Sweet treats to finish your meal",
    order: 5,
    itemCount: 7,
    menuIds: ["lunch", "dinner"],
    menuNames: ["Lunch Menu", "Dinner Menu"],
  },
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [isLoading] = useState(false)

  const handleCreateCategory = () => {
    toast.success("Create category modal would open here")
  }

  const handleEditCategory = (id: string) => {
    const category = categories.find((c) => c.id === id)
    toast.success(`Edit category: ${category?.name}`)
  }

  const handleDeleteCategory = (id: string) => {
    const category = categories.find((c) => c.id === id)
    setCategories(categories.filter((c) => c.id !== id))
    toast.success(`Deleted category: ${category?.name}`)
  }

  const handleReorder = (reorderedCategories: Category[]) => {
    setCategories(reorderedCategories)
    toast.success("Categories reordered successfully")
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <CategoriesContent
        categories={categories}
        onCreateCategory={handleCreateCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
        onReorder={handleReorder}
        uncategorizedCount={12}
        isLoading={isLoading}
      />
    </div>
  )
}
