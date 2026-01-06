"use client"

import { useState } from "react"
import { MenusContent } from "@/components/menus-content"
import type { Menu, HolidayHours } from "@/types/menu"
import { toast } from "sonner"

const mockMenus: Menu[] = [
  {
    id: "1",
    name: "Breakfast Menu",
    schedule: [
      {
        days: [1, 2, 3, 4, 5], // Mon-Fri
        startTime: "07:00",
        endTime: "11:00",
      },
      {
        days: [0, 6], // Sun, Sat
        startTime: "08:00",
        endTime: "12:00",
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
        days: [0, 1, 2, 3, 4, 5, 6], // Every day
        startTime: "11:00",
        endTime: "16:00",
      },
    ],
    orderTypes: ["delivery", "pickup", "dine-in"],
    categoryCount: 8,
    itemCount: 45,
    isActive: true,
  },
  {
    id: "3",
    name: "Dinner Menu",
    schedule: [
      {
        days: [0, 1, 2, 3, 4, 5, 6],
        startTime: "16:00",
        endTime: "23:00",
      },
    ],
    orderTypes: ["delivery", "pickup", "dine-in"],
    categoryCount: 10,
    itemCount: 52,
    isActive: true,
  },
]

const mockHolidays: HolidayHours[] = [
  { id: "1", date: "2025-12-25", status: "closed" },
  { id: "2", date: "2025-12-31", status: "modified", hours: "17:00-23:00" },
  { id: "3", date: "2026-01-01", status: "modified", hours: "10:00-18:00" },
]

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>(mockMenus)
  const [holidayHours, setHolidayHours] = useState<HolidayHours[]>(mockHolidays)

  const handleCreateMenu = () => {
    toast.info("Create menu modal would open here")
  }

  const handleEditMenu = (id: string) => {
    const menu = menus.find((m) => m.id === id)
    toast.info(`Edit menu: ${menu?.name}`)
  }

  const handleDeleteMenu = (id: string) => {
    setMenus(menus.filter((m) => m.id !== id))
    toast.success("Menu deleted successfully")
  }

  const handleToggleActive = (id: string) => {
    setMenus(menus.map((m) => (m.id === id ? { ...m, isActive: !m.isActive } : m)))
  }

  const handleDuplicateMenu = (id: string) => {
    const menu = menus.find((m) => m.id === id)
    if (menu) {
      const newMenu = {
        ...menu,
        id: `${Date.now()}`,
        name: `${menu.name} (Copy)`,
      }
      setMenus([...menus, newMenu])
      toast.success(`${menu.name} duplicated`)
    }
  }

  const handleViewItems = (id: string) => {
    const menu = menus.find((m) => m.id === id)
    toast.info(`View items for: ${menu?.name}`)
  }

  const handleAddHoliday = () => {
    toast.info("Add holiday hours modal would open here")
  }

  const handleEditHoliday = (id: string) => {
    const holiday = holidayHours.find((h) => h.id === id)
    toast.info(`Edit holiday: ${holiday?.date}`)
  }

  const handleDeleteHoliday = (id: string) => {
    setHolidayHours(holidayHours.filter((h) => h.id !== id))
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <MenusContent
        menus={menus}
        holidayHours={holidayHours}
        onCreateMenu={handleCreateMenu}
        onEditMenu={handleEditMenu}
        onDeleteMenu={handleDeleteMenu}
        onToggleActive={handleToggleActive}
        onDuplicateMenu={handleDuplicateMenu}
        onViewItems={handleViewItems}
        onAddHoliday={handleAddHoliday}
        onEditHoliday={handleEditHoliday}
        onDeleteHoliday={handleDeleteHoliday}
      />
    </div>
  )
}
