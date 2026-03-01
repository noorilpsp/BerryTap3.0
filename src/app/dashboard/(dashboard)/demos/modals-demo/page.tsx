"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CreateItemModal } from "@/components/modals/create-item-modal"
import { CreateCategoryDrawer } from "@/components/drawers/create-category-drawer"
import { CreateMenuModal, type MenuSchedule } from "@/components/modals/create-menu-modal"
import { DeleteConfirmationDialog } from "@/components/modals/delete-confirmation-dialog"
import type { MenuItem } from "@/types/menu-item"

export default function ModalsDemo() {
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStrictDeleteDialogOpen, setIsStrictDeleteDialogOpen] = useState(false)

  const handleSaveItem = (item: Partial<MenuItem>) => {
    console.log("Item saved:", item)
  }

  const handleSaveCategory = (category: {
    name: string
    description?: string
    menuIds: string[]
    emoji?: string
  }) => {
    console.log("Category saved:", category)
  }

  const handleSaveMenu = (menu: MenuSchedule) => {
    console.log("Menu saved:", menu)
  }

  const handleDelete = () => {
    console.log("Item deleted")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Modal Suite Demo</h1>
          <p className="text-gray-600">Comprehensive modal system for creating and editing menu entities</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Modals</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => setIsItemModalOpen(true)}
              className="h-24 flex flex-col items-center justify-center gap-2"
            >
              <span className="text-2xl">🍕</span>
              <span>Create Item</span>
            </Button>

            <Button
              onClick={() => setIsCategoryModalOpen(true)}
              className="h-24 flex flex-col items-center justify-center gap-2"
            >
              <span className="text-2xl">📁</span>
              <span>Create Category</span>
            </Button>

            <Button
              onClick={() => setIsMenuModalOpen(true)}
              className="h-24 flex flex-col items-center justify-center gap-2"
            >
              <span className="text-2xl">📋</span>
              <span>Create Menu</span>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Delete Confirmation Dialogs</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="h-24 flex flex-col items-center justify-center gap-2"
            >
              <span className="text-2xl">🗑️</span>
              <span>Simple Delete</span>
            </Button>

            <Button
              variant="destructive"
              onClick={() => setIsStrictDeleteDialogOpen(true)}
              className="h-24 flex flex-col items-center justify-center gap-2"
            >
              <span className="text-2xl">⚠️</span>
              <span>Strict Delete</span>
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Features</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Form validation with react-hook-form and zod</li>
            <li>✓ Responsive design (desktop, tablet, mobile)</li>
            <li>✓ Toast notifications on success/error</li>
            <li>✓ Loading states during submission</li>
            <li>✓ Keyboard shortcuts (Escape to close)</li>
            <li>✓ Focus management and accessibility</li>
            <li>✓ Unsaved changes warnings</li>
          </ul>
        </div>
      </div>

      {/* Modals */}
      <CreateItemModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={handleSaveItem}
        onCreateCategory={() => {
          setIsItemModalOpen(false)
          setIsCategoryModalOpen(true)
        }}
      />

      <CreateCategoryDrawer
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />

      <CreateMenuModal isOpen={isMenuModalOpen} onClose={() => setIsMenuModalOpen(false)} onSave={handleSaveMenu} />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        itemType="item"
        itemName="Caesar Salad"
      />

      <DeleteConfirmationDialog
        isOpen={isStrictDeleteDialogOpen}
        onClose={() => setIsStrictDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        itemType="menu"
        itemName="Breakfast Menu"
        warningMessage="This menu has 24 items. They will be moved to 'Uncategorized'."
        requireConfirmation
      />
    </div>
  )
}
