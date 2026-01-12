"use client"

import * as React from "react"
import { Utensils, Coffee, IceCream, Pizza, Salad, Sandwich, Soup, Cake, Wine, Beer } from "lucide-react"
import { CategorySelector, type Category } from "@/components/category-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const mockCategories: Category[] = [
  { id: "1", label: "Burgers", icon: Utensils },
  { id: "2", label: "Pizza", icon: Pizza },
  { id: "3", label: "Salads", icon: Salad },
  { id: "4", label: "Sandwiches", icon: Sandwich },
  { id: "5", label: "Soups", icon: Soup },
  { id: "6", label: "Desserts", icon: IceCream },
  { id: "7", label: "Cakes", icon: Cake },
  { id: "8", label: "Coffee", icon: Coffee },
  { id: "9", label: "Wine", icon: Wine },
  { id: "10", label: "Beer", icon: Beer },
  { id: "11", label: "Appetizers", icon: Utensils },
  { id: "12", label: "Pasta", icon: Utensils },
  { id: "13", label: "Seafood", icon: Utensils },
  { id: "14", label: "Steaks", icon: Utensils },
  { id: "15", label: "Vegetarian", icon: Salad },
]

export default function CategorySelectorDemo() {
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(["1", "2", "6"])

  const handleClearAll = () => {
    setSelectedCategories([])
  }

  const handleSelectAll = () => {
    setSelectedCategories(mockCategories.map((cat) => cat.id))
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Category Selector</h1>
          <p className="text-muted-foreground">
            A searchable, multi-select category filter component with chips and keyboard accessibility.
          </p>
        </div>

        {/* Demo Card */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Categories</CardTitle>
            <CardDescription>Search and select multiple categories to filter menu items</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CategorySelector
              categories={mockCategories}
              selected={selectedCategories}
              onChange={setSelectedCategories}
              placeholder="Search categories..."
            />

            {/* Action Buttons */}
            <div className="flex gap-2 demo-action-buttons">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearAll} 
                disabled={selectedCategories.length === 0}
                className="!py-1 px-2 text-xs sm:!py-1.5 sm:px-3 sm:text-sm"
              >
                Clear All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={selectedCategories.length === mockCategories.length}
                className="!py-1 px-2 text-xs sm:!py-1.5 sm:px-3 sm:text-sm"
              >
                Select All
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Selected Categories Display */}
        <Card>
          <CardHeader>
            <CardTitle>Selected Categories</CardTitle>
            <CardDescription>Currently selected category IDs (for debugging)</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories selected</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {selectedCategories.length} {selectedCategories.length === 1 ? "category" : "categories"} selected:
                </p>
                <code className="block p-3 bg-muted rounded-md text-xs">
                  {JSON.stringify(selectedCategories, null, 2)}
                </code>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features List */}
        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Real-time search filtering</li>
              <li>✓ Multi-select with checkboxes</li>
              <li>✓ Selected categories displayed as removable chips</li>
              <li>✓ Optional Lucide icons for each category</li>
              <li>✓ Scrollable list with custom height</li>
              <li>✓ Empty state when no results found</li>
              <li>✓ Keyboard accessible (Tab, Space, Enter)</li>
              <li>✓ Controlled component pattern</li>
              <li>✓ Responsive and mobile-friendly</li>
              <li>✓ Clean, compact design for dashboard panels</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
