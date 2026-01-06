"use client"

import { useState } from "react"
import { DraggableList } from "@/components/drag-and-drop/draggable-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MoreVertical, Undo2 } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  emoji: string
  itemCount: number
  order: number
}

interface MenuItem {
  id: string
  name: string
  categoryId: string
  order: number
}

interface CustomizationOption {
  id: string
  name: string
  price: number
  order: number
}

export default function DragAndDropDemo() {
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "Appetizers", emoji: "🥗", itemCount: 12, order: 1 },
    { id: "2", name: "Salads", emoji: "🥬", itemCount: 8, order: 2 },
    { id: "3", name: "Pizzas", emoji: "🍕", itemCount: 9, order: 3 },
    { id: "4", name: "Desserts", emoji: "🍰", itemCount: 6, order: 4 },
  ])

  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: "1", name: "Caesar Salad", categoryId: "salads", order: 1 },
    { id: "2", name: "Greek Salad", categoryId: "salads", order: 2 },
    { id: "3", name: "Garden Salad", categoryId: "salads", order: 3 },
    { id: "4", name: "Cobb Salad", categoryId: "salads", order: 4 },
  ])

  const [options, setOptions] = useState<CustomizationOption[]>([
    { id: "1", name: "Small", price: 0, order: 1 },
    { id: "2", name: "Medium", price: 2, order: 2 },
    { id: "3", name: "Large", price: 4, order: 3 },
    { id: "4", name: "Extra Large", price: 6, order: 4 },
  ])

  const [history, setHistory] = useState<{
    categories: Category[]
    menuItems: MenuItem[]
    options: CustomizationOption[]
  } | null>(null)

  const handleCategoriesReorder = (newCategories: Category[]) => {
    setHistory({ categories, menuItems, options })
    setCategories(newCategories)
    toast.success("Categories reordered", {
      action: {
        label: "Undo",
        onClick: () => {
          if (history) {
            setCategories(history.categories)
            setHistory(null)
          }
        },
      },
      duration: 5000,
    })
  }

  const handleMenuItemsReorder = (newItems: MenuItem[]) => {
    setHistory({ categories, menuItems, options })
    setMenuItems(newItems)
    toast.success("Items reordered", {
      action: {
        label: "Undo",
        onClick: () => {
          if (history) {
            setMenuItems(history.menuItems)
            setHistory(null)
          }
        },
      },
      duration: 5000,
    })
  }

  const handleOptionsReorder = (newOptions: CustomizationOption[]) => {
    setHistory({ categories, menuItems, options })
    setOptions(newOptions)
    toast.success("Options reordered", {
      action: {
        label: "Undo",
        onClick: () => {
          if (history) {
            setOptions(history.options)
            setHistory(null)
          }
        },
      },
      duration: 5000,
    })
  }

  const handleUndo = () => {
    if (history) {
      setCategories(history.categories)
      setMenuItems(history.menuItems)
      setOptions(history.options)
      setHistory(null)
      toast.success("Changes undone")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Drag & Drop System</h1>
            <p className="text-gray-600 mt-1">Reorder categories, items, and options with smooth animations</p>
          </div>
          {history && (
            <Button onClick={handleUndo} variant="outline" size="sm">
              <Undo2 className="w-4 h-4 mr-2" />
              Undo
            </Button>
          )}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">
                Mouse
              </Badge>
              <p>Click and drag the handle (☰) to reorder items</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">
                Keyboard
              </Badge>
              <p>Tab to item, Space to grab, Arrow keys to move, Space to drop, Escape to cancel</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="mt-0.5">
                Touch
              </Badge>
              <p>Long press the handle to start dragging (300ms)</p>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="items">Menu Items</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reorder Categories</CardTitle>
                <CardDescription>Drag categories to change their display order in the menu</CardDescription>
              </CardHeader>
              <CardContent>
                <DraggableList
                  items={categories}
                  onReorder={handleCategoriesReorder}
                  keyExtractor={(item) => item.id}
                  renderItem={(item, isDragging) => (
                    <Card className={isDragging ? "shadow-2xl" : ""}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.emoji}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.itemCount} items</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Items Tab */}
          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reorder Menu Items</CardTitle>
                <CardDescription>Drag items to change their order within the Salads category</CardDescription>
              </CardHeader>
              <CardContent>
                <DraggableList
                  items={menuItems}
                  onReorder={handleMenuItemsReorder}
                  keyExtractor={(item) => item.id}
                  renderItem={(item, isDragging) => (
                    <Card className={isDragging ? "shadow-2xl" : ""}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🥗</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600">Salads</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Options Tab */}
          <TabsContent value="options" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reorder Customization Options</CardTitle>
                <CardDescription>Drag options to change their display order (e.g., pizza sizes)</CardDescription>
              </CardHeader>
              <CardContent>
                <DraggableList
                  items={options}
                  onReorder={handleOptionsReorder}
                  keyExtractor={(item) => item.id}
                  renderItem={(item, isDragging) => (
                    <Card className={isDragging ? "shadow-2xl" : ""}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600">
                              {item.price === 0 ? "Base price" : `+$${item.price.toFixed(2)}`}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Visual States Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Visual States</CardTitle>
            <CardDescription>Examples of different drag states</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Normal State</p>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="w-6 h-6 text-gray-400 opacity-40">☰</div>
                  <span className="text-2xl">🍕</span>
                  <span className="font-semibold">Pizzas</span>
                  <span className="text-sm text-gray-600">(9 items)</span>
                </CardContent>
              </Card>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Dragging State</p>
              <Card className="opacity-50 scale-[1.02] shadow-2xl">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="w-6 h-6 text-gray-900">☰</div>
                  <span className="text-2xl">🍕</span>
                  <span className="font-semibold">Pizzas</span>
                  <span className="text-sm text-gray-600">(9 items)</span>
                </CardContent>
              </Card>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Drop Target State</p>
              <Card className="bg-orange-50 border-t-2 border-orange-500">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="w-6 h-6 text-gray-400 opacity-40">☰</div>
                  <span className="text-2xl">🥗</span>
                  <span className="font-semibold">Salads</span>
                  <span className="text-sm text-gray-600">(8 items)</span>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
