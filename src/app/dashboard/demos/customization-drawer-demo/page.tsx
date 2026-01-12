"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CustomizationDrawer } from "@/components/customization-drawer"
import type { CustomizationGroup } from "@/types/customization"
import { toast } from "sonner"
import { Plus, Edit } from "lucide-react"

const mockGroup: CustomizationGroup = {
  id: "1",
  name: "Pizza Size",
  customerInstructions: "Choose your pizza size",
  internalNotes: "Standard sizing for all pizzas",
  rules: {
    min: 1,
    max: 1,
    required: true,
  },
  options: [
    { id: "1a", name: 'Small (10")', priceDelta: 0, isDefault: true, order: 1 },
    { id: "1b", name: 'Medium (14")', priceDelta: 4, isDefault: false, order: 2 },
    { id: "1c", name: 'Large (18")', priceDelta: 8, isDefault: false, order: 3 },
  ],
  itemCount: 15,
  itemNames: ["Margherita Pizza", "Pepperoni Pizza", "BBQ Chicken Pizza"],
}

export default function CustomizationDrawerDemo() {
  const [isOpen, setIsOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<CustomizationGroup | null>(null)

  const handleCreate = () => {
    setEditingGroup(null)
    setIsOpen(true)
  }

  const handleEdit = () => {
    setEditingGroup(mockGroup)
    setIsOpen(true)
  }

  const handleSave = (group: CustomizationGroup) => {
    console.log("Saved group:", group)
    toast.success(editingGroup ? "Customization group updated!" : "Customization group created!")
    setIsOpen(false)
  }

  const handleDelete = (id: string) => {
    console.log("Deleted group:", id)
    toast.success("Customization group deleted")
    setIsOpen(false)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Customization Drawer Demo</h1>
          <p className="text-gray-600 mt-2">Test the customization group creation and editing drawer</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button onClick={handleCreate} size="lg" className="h-32 flex-col gap-3">
            <Plus className="w-8 h-8" />
            <div>
              <div className="font-semibold">Create New Group</div>
              <div className="text-sm opacity-90">Start from scratch</div>
            </div>
          </Button>

          <Button onClick={handleEdit} variant="outline" size="lg" className="h-32 flex-col gap-3 bg-transparent">
            <Edit className="w-8 h-8" />
            <div>
              <div className="font-semibold">Edit Existing Group</div>
              <div className="text-sm opacity-90">Modify Pizza Size group</div>
            </div>
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold mb-2">Features Included:</h3>
          <ul className="space-y-1 text-sm text-blue-900">
            <li>✓ Group name and customer instructions</li>
            <li>✓ Internal notes for staff</li>
            <li>✓ Selection rules (min/max/required)</li>
            <li>✓ Add/edit/delete/reorder options</li>
            <li>✓ Price adjustments per option</li>
            <li>✓ Set default option</li>
            <li>✓ Live customer preview</li>
            <li>✓ Form validation</li>
            <li>✓ Unsaved changes detection</li>
            <li>✓ Auto-reset on close</li>
          </ul>
        </div>
      </div>

      <CustomizationDrawer
        group={editingGroup}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  )
}
