"use client"

import { useState } from "react"
import { MenuTabs } from "@/components/menu-tabs"
import { Toolbar } from "@/components/toolbar"

export default function NavigationDemoPage() {
  const [currentPath, setCurrentPath] = useState("/menu/items")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedView, setSelectedView] = useState<"grid" | "list">("grid")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleAddItem = () => {
    console.log("[v0] Add new item clicked")
    alert("Add new item clicked!")
  }

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
    console.log("[v0] Collapse toggled:", !isCollapsed)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Menu Tabs */}
      <MenuTabs currentPath={currentPath} />

      {/* Toolbar */}
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedView={selectedView}
        onViewChange={setSelectedView}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
        selectedTags={selectedTags}
        onTagsChange={setSelectedTags}
        onAddItem={handleAddItem}
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        totalItems={127}
      />

      {/* Demo Content */}
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Navigation & Controls Demo</h1>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Current State:</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 font-mono text-sm">
                <div>
                  <span className="text-gray-600">Current Path:</span>{" "}
                  <span className="text-orange-600">{currentPath}</span>
                </div>
                <div>
                  <span className="text-gray-600">Search Query:</span>{" "}
                  <span className="text-orange-600">{searchQuery || "(empty)"}</span>
                </div>
                <div>
                  <span className="text-gray-600">View:</span> <span className="text-orange-600">{selectedView}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>{" "}
                  <span className="text-orange-600">{selectedStatus}</span>
                </div>
                <div>
                  <span className="text-gray-600">Categories:</span>{" "}
                  <span className="text-orange-600">
                    {selectedCategories.length > 0 ? selectedCategories.join(", ") : "(none)"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Tags:</span>{" "}
                  <span className="text-orange-600">
                    {selectedTags.length > 0 ? selectedTags.join(", ") : "(none)"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Collapsed:</span>{" "}
                  <span className="text-orange-600">{isCollapsed ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Features:</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Horizontal tab navigation with icons (MenuTabs)</li>
                <li>Responsive toolbar with search, filters, and actions</li>
                <li>Debounced search input (250ms delay)</li>
                <li>Keyboard shortcut: Cmd+K to focus search</li>
                <li>Multi-select filters for categories and tags</li>
                <li>Filter count badges</li>
                <li>View toggle (grid/list)</li>
                <li>Collapse toggle button</li>
                <li>Clear all filters button (appears when filters are active)</li>
                <li>Fully responsive: Desktop, Tablet, and Mobile layouts</li>
                <li>Horizontal scrolling on mobile with snap scroll</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Try It:</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                <li>Click different tabs to see active state</li>
                <li>Type in the search box (debounced)</li>
                <li>Press Cmd+K (or Ctrl+K) to focus search</li>
                <li>Select filters and see count badges</li>
                <li>Toggle between grid and list view</li>
                <li>Click "Clear all" to reset filters</li>
                <li>Resize your browser to see responsive layouts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
