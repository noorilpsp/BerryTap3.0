"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { MenuItem } from "@/types/menu-item"
import type { Category } from "@/types/category"
import type { CustomizationGroup } from "@/types/customization"
import type { Menu } from "@/types/menu"
import { toast } from "sonner"

// Mock data
const mockItems: MenuItem[] = [
  {
    id: "1",
    name: "Caesar Salad",
    description: "Fresh romaine lettuce, parmesan cheese, croutons, Caesar dressing",
    price: 12.5,
    currency: "USD",
    image: "/caesar-salad.png",
    status: "live",
    categories: ["salads", "lunch-specials"],
    tags: ["popular", "chef-pick"],
    dietaryTags: ["vegetarian"],
    customizationGroups: ["salad-dressing", "protein-add-ons"],
    availabilityMode: "menu-hours",
    nutrition: {
      calories: 350,
      allergens: ["dairy", "gluten"],
    },
  },
  {
    id: "2",
    name: "Margherita Pizza",
    description: "Classic tomato sauce, fresh mozzarella, and basil",
    price: 14.99,
    currency: "USD",
    image: "/margherita-pizza.png",
    status: "live",
    categories: ["pizzas", "lunch-specials"],
    tags: ["vegetarian", "popular"],
    dietaryTags: ["vegetarian"],
    customizationGroups: ["pizza-size", "toppings"],
    availabilityMode: "menu-hours",
  },
  {
    id: "3",
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
    id: "4",
    name: "Spaghetti Carbonara",
    description: "Pasta with eggs, cheese, pancetta, and black pepper",
    price: 15.99,
    currency: "USD",
    image: "/spaghetti-carbonara.png",
    status: "draft",
    categories: ["pasta", "lunch-specials"],
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

const mockCategories: Category[] = [
  {
    id: "appetizers",
    name: "Appetizers",
    emoji: "🥗",
    description: "Start your meal with these delicious options",
    order: 1,
    itemCount: 12,
    menuIds: ["lunch", "dinner"],
    menuNames: ["Lunch Menu", "Dinner Menu"],
  },
  {
    id: "salads",
    name: "Salads",
    emoji: "🥬",
    description: "Fresh, healthy salads",
    order: 2,
    itemCount: 8,
    menuIds: ["lunch", "dinner"],
    menuNames: ["Lunch Menu", "Dinner Menu"],
  },
  {
    id: "pizzas",
    name: "Pizzas",
    emoji: "🍕",
    description: "Wood-fired artisan pizzas",
    order: 3,
    itemCount: 15,
    menuIds: ["lunch", "dinner", "late-night"],
    menuNames: ["Lunch Menu", "Dinner Menu", "Late Night Menu"],
  },
  {
    id: "pasta",
    name: "Pasta",
    emoji: "🍝",
    description: "Traditional Italian pasta dishes",
    order: 4,
    itemCount: 10,
    menuIds: ["lunch", "dinner"],
    menuNames: ["Lunch Menu", "Dinner Menu"],
  },
  {
    id: "desserts",
    name: "Desserts",
    emoji: "🍰",
    description: "Sweet treats to finish your meal",
    order: 5,
    itemCount: 7,
    menuIds: ["lunch", "dinner"],
    menuNames: ["Lunch Menu", "Dinner Menu"],
  },
  {
    id: "lunch-specials",
    name: "Lunch Specials",
    emoji: "🍽️",
    description: "Special lunch menu items",
    order: 6,
    itemCount: 5,
    menuIds: ["lunch"],
    menuNames: ["Lunch Menu"],
  },
]

const mockCustomizationGroups: CustomizationGroup[] = [
  {
    id: "pizza-size",
    name: "Pizza Size",
    customerInstructions: "Choose your pizza size",
    rules: { min: 1, max: 1, required: true },
    options: [
      { id: "small", name: 'Small (10")', priceDelta: 0, isDefault: true, order: 1 },
      { id: "medium", name: 'Medium (14")', priceDelta: 4, isDefault: false, order: 2 },
      { id: "large", name: 'Large (18")', priceDelta: 8, isDefault: false, order: 3 },
    ],
    itemCount: 15,
    itemNames: ["Margherita Pizza", "Pepperoni Pizza", "BBQ Chicken Pizza"],
  },
  {
    id: "toppings",
    name: "Toppings",
    customerInstructions: "Add extra toppings",
    rules: { min: 0, max: 5, required: false },
    options: [
      { id: "mushrooms", name: "Mushrooms", priceDelta: 2, isDefault: false, order: 1 },
      { id: "olives", name: "Olives", priceDelta: 2, isDefault: false, order: 2 },
      { id: "extra-cheese", name: "Extra Cheese", priceDelta: 3, isDefault: false, order: 3 },
    ],
    itemCount: 12,
    itemNames: ["Margherita Pizza", "Veggie Pizza"],
  },
]

const mockMenus: Menu[] = [
  {
    id: "lunch",
    name: "Lunch Menu",
    schedule: [
      {
        days: [1, 2, 3, 4, 5],
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
    id: "dinner",
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

interface MenuContextType {
  // State
  items: MenuItem[]
  categories: Category[]
  customizationGroups: CustomizationGroup[]
  menus: Menu[]

  // Items CRUD
  createItem: (item: Partial<MenuItem>) => void
  updateItem: (id: string, updates: Partial<MenuItem>) => void
  deleteItem: (id: string) => void
  bulkUpdateItems: (ids: string[], updates: Partial<MenuItem>) => void
  bulkDeleteItems: (ids: string[]) => void
  reorderItems: (items: MenuItem[]) => void

  // Categories CRUD
  createCategory: (category: Omit<Category, "id" | "itemCount">) => void
  updateCategory: (id: string, updates: Partial<Category>) => void
  deleteCategory: (id: string) => void
  reorderCategories: (categories: Category[]) => void

  // Customization Groups CRUD
  createCustomizationGroup: (group: Omit<CustomizationGroup, "id" | "itemCount" | "itemNames">) => void
  updateCustomizationGroup: (id: string, updates: Partial<CustomizationGroup>) => void
  deleteCustomizationGroup: (id: string) => void
  duplicateCustomizationGroup: (id: string) => void

  // Menus CRUD
  createMenu: (menu: Omit<Menu, "id" | "categoryCount" | "itemCount">) => void
  updateMenu: (id: string, updates: Partial<Menu>) => void
  deleteMenu: (id: string) => void
  toggleMenuActive: (id: string) => void
  duplicateMenu: (id: string) => void
}

const MenuContext = createContext<MenuContextType | undefined>(undefined)

export function MenuProvider({ children }: { children: React.ReactNode }) {
  // Start with mock data to avoid hydration mismatch
  const [items, setItems] = useState<MenuItem[]>(mockItems)
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [customizationGroups, setCustomizationGroups] = useState<CustomizationGroup[]>(mockCustomizationGroups)
  const [menus, setMenus] = useState<Menu[]>(mockMenus)
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage after hydration
  React.useEffect(() => {
    const loadFromStorage = () => {
      try {
        const savedItems = localStorage.getItem("menu-items")
        if (savedItems) {
          setItems(JSON.parse(savedItems))
        }

        const savedCategories = localStorage.getItem("menu-categories")
        if (savedCategories) {
          setCategories(JSON.parse(savedCategories))
        }

        const savedCustomizationGroups = localStorage.getItem("menu-customization-groups")
        if (savedCustomizationGroups) {
          setCustomizationGroups(JSON.parse(savedCustomizationGroups))
        }

        const savedMenus = localStorage.getItem("menu-menus")
        if (savedMenus) {
          setMenus(JSON.parse(savedMenus))
        }
      } catch (error) {
        console.error("Error loading from localStorage:", error)
      }
      setIsHydrated(true)
    }

    loadFromStorage()
  }, [])

  // Items CRUD
  const createItem = useCallback((item: Partial<MenuItem>) => {
    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: item.name || "New Item",
      description: item.description,
      price: item.price || 0,
      currency: item.currency || "USD",
      image: item.image,
      status: item.status || "draft",
      categories: item.categories || [],
      tags: item.tags || [],
      dietaryTags: item.dietaryTags || [],
      customizationGroups: item.customizationGroups || [],
      availabilityMode: item.availabilityMode || "menu-hours",
      nutrition: item.nutrition,
      soldOutUntil: item.soldOutUntil,
    }
    setItems((prev) => {
      const updated = [...prev, newItem]
      if (isHydrated) {
        localStorage.setItem("menu-items", JSON.stringify(updated))
      }
      return updated
    })
    toast.success(`${newItem.name} created successfully`)
  }, [])

  const updateItem = useCallback(
    (id: string, updates: Partial<MenuItem>) => {
      setItems((prev) => {
        const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
        if (isHydrated) {
          localStorage.setItem("menu-items", JSON.stringify(updated))
        }
        return updated
      })
      toast.success("Item updated successfully")
    },
    [isHydrated],
  )

  const deleteItem = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id)
      setItems((prev) => {
        const updated = prev.filter((item) => item.id !== id)
        if (isHydrated) {
          localStorage.setItem("menu-items", JSON.stringify(updated))
        }
        return updated
      })
      toast.success(`${item?.name || "Item"} deleted`)
    },
    [items, isHydrated],
  )

  const bulkUpdateItems = useCallback(
    (ids: string[], updates: Partial<MenuItem>) => {
      setItems((prev) => {
        const updated = prev.map((item) => (ids.includes(item.id) ? { ...item, ...updates } : item))
        if (isHydrated) {
          localStorage.setItem("menu-items", JSON.stringify(updated))
        }
        return updated
      })
      toast.success(`${ids.length} items updated`)
    },
    [isHydrated],
  )

  const bulkDeleteItems = useCallback(
    (ids: string[]) => {
      setItems((prev) => {
        const updated = prev.filter((item) => !ids.includes(item.id))
        if (isHydrated) {
          localStorage.setItem("menu-items", JSON.stringify(updated))
        }
        return updated
      })
      toast.success(`${ids.length} items deleted`)
    },
    [isHydrated],
  )

  const reorderItems = useCallback(
    (reorderedItems: MenuItem[]) => {
      setItems(reorderedItems)
      if (isHydrated) {
        localStorage.setItem("menu-items", JSON.stringify(reorderedItems))
      }
      toast.success("Items reordered")
    },
    [isHydrated],
  )

  // Categories CRUD
  const createCategory = useCallback(
    (category: Omit<Category, "id" | "itemCount">) => {
      const newCategory: Category = {
        ...category,
        id: Date.now().toString(),
        itemCount: 0,
      }
      setCategories((prev) => {
        const updated = [...prev, newCategory]
        if (isHydrated) {
          localStorage.setItem("menu-categories", JSON.stringify(updated))
        }
        return updated
      })
      toast.success(`${newCategory.name} created`)
    },
    [isHydrated],
  )

  const updateCategory = useCallback(
    (id: string, updates: Partial<Category>) => {
      setCategories((prev) => {
        const updated = prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
        if (isHydrated) {
          localStorage.setItem("menu-categories", JSON.stringify(updated))
        }
        return updated
      })
      toast.success("Category updated")
    },
    [isHydrated],
  )

  const deleteCategory = useCallback(
    (id: string) => {
      const category = categories.find((c) => c.id === id)
      setCategories((prev) => {
        const updated = prev.filter((cat) => cat.id !== id)
        if (isHydrated) {
          localStorage.setItem("menu-categories", JSON.stringify(updated))
        }
        return updated
      })
      toast.success(`${category?.name || "Category"} deleted`)
    },
    [categories, isHydrated],
  )

  const reorderCategories = useCallback(
    (reorderedCategories: Category[]) => {
      setCategories(reorderedCategories)
      if (isHydrated) {
        localStorage.setItem("menu-categories", JSON.stringify(reorderedCategories))
      }
      toast.success("Categories reordered")
    },
    [isHydrated],
  )

  // Customization Groups CRUD
  const createCustomizationGroup = useCallback((group: Omit<CustomizationGroup, "id" | "itemCount" | "itemNames">) => {
    const newGroup: CustomizationGroup = {
      ...group,
      id: Date.now().toString(),
      itemCount: 0,
      itemNames: [],
    }
    setCustomizationGroups((prev) => [...prev, newGroup])
    toast.success(`${newGroup.name} created`)
  }, [])

  const updateCustomizationGroup = useCallback((id: string, updates: Partial<CustomizationGroup>) => {
    setCustomizationGroups((prev) => prev.map((group) => (group.id === id ? { ...group, ...updates } : group)))
    toast.success("Customization group updated")
  }, [])

  const deleteCustomizationGroup = useCallback(
    (id: string) => {
      const group = customizationGroups.find((g) => g.id === id)
      setCustomizationGroups((prev) => prev.filter((group) => group.id !== id))
      toast.success(`${group?.name || "Group"} deleted`)
    },
    [customizationGroups],
  )

  const duplicateCustomizationGroup = useCallback(
    (id: string) => {
      const group = customizationGroups.find((g) => g.id === id)
      if (group) {
        const newGroup: CustomizationGroup = {
          ...group,
          id: Date.now().toString(),
          name: `${group.name} (Copy)`,
        }
        setCustomizationGroups((prev) => [...prev, newGroup])
        toast.success(`${group.name} duplicated`)
      }
    },
    [customizationGroups],
  )

  // Menus CRUD
  const createMenu = useCallback((menu: Omit<Menu, "id" | "categoryCount" | "itemCount">) => {
    const newMenu: Menu = {
      ...menu,
      id: Date.now().toString(),
      categoryCount: 0,
      itemCount: 0,
    }
    setMenus((prev) => [...prev, newMenu])
    toast.success(`${newMenu.name} created`)
  }, [])

  const updateMenu = useCallback((id: string, updates: Partial<Menu>) => {
    setMenus((prev) => prev.map((menu) => (menu.id === id ? { ...menu, ...updates } : menu)))
    toast.success("Menu updated")
  }, [])

  const deleteMenu = useCallback(
    (id: string) => {
      const menu = menus.find((m) => m.id === id)
      setMenus((prev) => prev.filter((menu) => menu.id !== id))
      toast.success(`${menu?.name || "Menu"} deleted`)
    },
    [menus],
  )

  const toggleMenuActive = useCallback((id: string) => {
    setMenus((prev) =>
      prev.map((menu) => {
        if (menu.id === id) {
          toast.success(`${menu.name} ${menu.isActive ? "deactivated" : "activated"}`)
          return { ...menu, isActive: !menu.isActive }
        }
        return menu
      }),
    )
  }, [])

  const duplicateMenu = useCallback(
    (id: string) => {
      const menu = menus.find((m) => m.id === id)
      if (menu) {
        const newMenu: Menu = {
          ...menu,
          id: Date.now().toString(),
          name: `${menu.name} (Copy)`,
        }
        setMenus((prev) => [...prev, newMenu])
        toast.success(`${menu.name} duplicated`)
      }
    },
    [menus],
  )

  const value: MenuContextType = {
    items,
    categories,
    customizationGroups,
    menus,
    createItem,
    updateItem,
    deleteItem,
    bulkUpdateItems,
    bulkDeleteItems,
    reorderItems,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    createCustomizationGroup,
    updateCustomizationGroup,
    deleteCustomizationGroup,
    duplicateCustomizationGroup,
    createMenu,
    updateMenu,
    deleteMenu,
    toggleMenuActive,
    duplicateMenu,
  }

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
}

export function useMenu() {
  const context = useContext(MenuContext)
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider")
  }
  return context
}
