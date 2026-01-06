"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CategoryDrawer } from "@/components/category-drawer"
import type { Category } from "@/types/category"
import { toast } from "sonner"
import { Plus, Edit } from "lucide-react"

const mockCategory: Category = {
  id: "1",
  name: "Appetizers",
  emoji: "🥗",
  description: "Start your meal with these delicious options",
  order: 1,
  itemCount: 12,
  menuIds: ["1", "2"],
  menuNames: ["Lunch Menu", "Dinner Menu"],
}

export default function CategoryDrawerDemo() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  const handleCreateNew = () => {
    setSelectedCategory(null)
    setIsDrawerOpen(true)
  }

  const handleEdit = () => {
    setSelectedCategory(mockCategory)
    setIsDrawerOpen(true)
  }

  const handleSave = (category: Category) => {
    console.log("Saving category:", category)
    toast.success(selectedCategory ? "Category updated successfully!" : "Category created successfully!")
    setIsDrawerOpen(false)
  }

  const handleDelete = (id: string) => {
    console.log("Deleting category:", id)
    toast.success("Category deleted successfully!")
    setIsDrawerOpen(false)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Category Drawer Demo</h1>
          <p className="text-gray-600">Test the category creation and editing drawer</p>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleCreateNew} className="bg-orange-600 hover:bg-orange-700">
            <Plus className="w-4 h-4 mr-2" />
            Create New Category
          </Button>
          <Button onClick={handleEdit} variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Existing Category
          </Button>
        </div>

        <div className="border rounded-lg p-6 bg-gray-50">
          <h2 className="font-semibold mb-4">Features:</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Create new categories with name, emoji, and description</li>
            <li>✓ Edit existing categories</li>
            <li>✓ Select which menus include the category</li>
            <li>✓ Emoji picker with initials fallback (up to 2 characters)</li>
            <li>✓ Form validation for required fields</li>
            <li>✓ Unsaved changes warning</li>
            <li>✓ Auto-reset on drawer close</li>
            <li>✓ Delete confirmation dialog</li>
            <li>✓ Responsive design for mobile, tablet, and desktop</li>
          </ul>
        </div>
      </div>

      <CategoryDrawer
        category={selectedCategory}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
