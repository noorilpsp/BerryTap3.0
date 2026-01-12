"use client"

import { useState } from "react"
import { MenuDrawer } from "@/components/menu-drawer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Edit } from "lucide-react"
import type { Menu } from "@/types/menu"
import { toast } from "sonner"

const mockMenus: Menu[] = [
  {
    id: "1",
    name: "Breakfast Menu",
    schedule: [
      {
        days: [1, 2, 3, 4, 5],
        startTime: "7:00 AM",
        endTime: "11:00 AM",
      },
    ],
    orderTypes: ["delivery", "pickup"],
    categoryCount: 5,
    itemCount: 28,
    isActive: true,
  },
  {
    id: "2",
    name: "Lunch Menu",
    schedule: [
      {
        days: [0, 1, 2, 3, 4, 5, 6],
        startTime: "11:00 AM",
        endTime: "4:00 PM",
      },
    ],
    orderTypes: ["delivery", "pickup", "dine-in"],
    categoryCount: 8,
    itemCount: 45,
    isActive: true,
  },
]

export default function MenuDrawerDemo() {
  const [menus, setMenus] = useState<Menu[]>(mockMenus)
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleCreateMenu = () => {
    setSelectedMenu(null)
    setIsDrawerOpen(true)
  }

  const handleEditMenu = (menu: Menu) => {
    setSelectedMenu(menu)
    setIsDrawerOpen(true)
  }

  const handleSaveMenu = (menu: Menu) => {
    if (selectedMenu) {
      // Update existing menu
      setMenus(menus.map((m) => (m.id === menu.id ? menu : m)))
      toast.success("Menu updated successfully!")
    } else {
      // Create new menu
      setMenus([...menus, menu])
      toast.success("Menu created successfully!")
    }
    setIsDrawerOpen(false)
  }

  const handleDeleteMenu = (id: string) => {
    setMenus(menus.filter((m) => m.id !== id))
    toast.success("Menu deleted successfully!")
    setIsDrawerOpen(false)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Menu Drawer Demo</h1>
          <p className="text-gray-600 mt-1">Create and edit menus with the right-side drawer</p>
        </div>
        <Button onClick={handleCreateMenu}>
          <Plus className="w-4 h-4 mr-2" />
          New Menu
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menus.map((menu) => (
          <Card key={menu.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{menu.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {menu.categoryCount} categories • {menu.itemCount} items
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleEditMenu(menu)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              {menu.schedule.map((block, index) => (
                <p key={index}>
                  {block.days.map((d) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ")}:{" "}
                  {block.startTime} - {block.endTime}
                </p>
              ))}
              <p className="text-gray-500">
                Available for: {menu.orderTypes.map((t) => (t === "dine-in" ? "Dine-in" : t)).join(", ")}
              </p>
            </div>

            <div className="mt-4">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  menu.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}
              >
                {menu.isActive ? "🟢 Active" : "⏸ Inactive"}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <MenuDrawer
        menu={selectedMenu}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSaveMenu}
        onDelete={handleDeleteMenu}
      />
    </div>
  )
}
