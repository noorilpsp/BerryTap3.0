"use client"

import { useState } from "react"
import { CustomizationsContent } from "@/components/customizations-content"
import type { CustomizationGroup } from "@/types/customization"
import { toast } from "sonner"

const mockGroups: CustomizationGroup[] = [
  {
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
    itemNames: ["Margherita Pizza", "Pepperoni Pizza", "BBQ Chicken Pizza", "Veggie Pizza", "Hawaiian Pizza"],
  },
  {
    id: "2",
    name: "Toppings",
    customerInstructions: "Add extra toppings",
    rules: {
      min: 0,
      max: 5,
      required: false,
    },
    options: [
      { id: "2a", name: "Mushrooms", priceDelta: 2, isDefault: false, order: 1 },
      { id: "2b", name: "Olives", priceDelta: 2, isDefault: false, order: 2 },
      { id: "2c", name: "Extra Cheese", priceDelta: 3, isDefault: false, order: 3 },
      { id: "2d", name: "Pepperoni", priceDelta: 3, isDefault: false, order: 4 },
      { id: "2e", name: "Jalapeños", priceDelta: 2, isDefault: false, order: 5 },
    ],
    itemCount: 12,
    itemNames: ["Margherita Pizza", "Veggie Pizza", "Custom Pizza"],
  },
  {
    id: "3",
    name: "Salad Dressing",
    customerInstructions: "Choose your dressing",
    rules: {
      min: 1,
      max: 1,
      required: true,
    },
    options: [
      { id: "3a", name: "Ranch", priceDelta: 0, isDefault: true, order: 1 },
      { id: "3b", name: "Caesar", priceDelta: 0, isDefault: false, order: 2 },
      { id: "3c", name: "Balsamic Vinaigrette", priceDelta: 0, isDefault: false, order: 3 },
      { id: "3d", name: "Blue Cheese", priceDelta: 1, isDefault: false, order: 4 },
    ],
    itemCount: 8,
    itemNames: ["Caesar Salad", "Garden Salad", "Greek Salad", "Cobb Salad"],
  },
  {
    id: "4",
    name: "Cook Temperature",
    customerInstructions: "How would you like it cooked?",
    rules: {
      min: 1,
      max: 1,
      required: true,
    },
    options: [
      { id: "4a", name: "Rare", priceDelta: 0, isDefault: false, order: 1 },
      { id: "4b", name: "Medium Rare", priceDelta: 0, isDefault: false, order: 2 },
      { id: "4c", name: "Medium", priceDelta: 0, isDefault: true, order: 3 },
      { id: "4d", name: "Medium Well", priceDelta: 0, isDefault: false, order: 4 },
      { id: "4e", name: "Well Done", priceDelta: 0, isDefault: false, order: 5 },
    ],
    itemCount: 6,
    itemNames: ["Ribeye Steak", "NY Strip", "Burger", "Filet Mignon"],
  },
]

export default function CustomizationsPage() {
  const [groups, setGroups] = useState<CustomizationGroup[]>(mockGroups)

  const handleCreateGroup = () => {
    toast.success("Create group modal would open here")
  }

  const handleEditGroup = (id: string) => {
    const group = groups.find((g) => g.id === id)
    toast.success(`Edit ${group?.name} modal would open here`)
  }

  const handleDeleteGroup = (id: string) => {
    setGroups(groups.filter((g) => g.id !== id))
    toast.success("Customization group deleted")
  }

  const handleDuplicateGroup = (id: string) => {
    const group = groups.find((g) => g.id === id)
    if (group) {
      const newGroup = {
        ...group,
        id: `${Date.now()}`,
        name: `${group.name} (Copy)`,
      }
      setGroups([...groups, newGroup])
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <CustomizationsContent
        groups={groups}
        onCreateGroup={handleCreateGroup}
        onEditGroup={handleEditGroup}
        onDeleteGroup={handleDeleteGroup}
        onDuplicateGroup={handleDuplicateGroup}
      />
    </div>
  )
}
