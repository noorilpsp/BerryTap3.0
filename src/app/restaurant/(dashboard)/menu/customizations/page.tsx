"use client"

import { useState, useCallback } from "react"
import { CustomizationsContent } from "@/components/customizations-content"
import { CustomizationDrawer } from "@/components/customization-drawer"
import { CustomizationsToolbar } from "@/components/customizations-toolbar"
import { useMenu } from "../menu-context"
import { toast } from "sonner"
import type { CustomizationGroup } from "@/types/customization"

export default function MenuCustomizationsPage() {
  const {
    customizationGroups,
    createCustomizationGroup,
    updateCustomizationGroup,
    deleteCustomizationGroup,
    duplicateCustomizationGroup,
  } = useMenu()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<CustomizationGroup | null>(null)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [pendingClose, setPendingClose] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleCreateGroup = useCallback(() => {
    setEditingGroup(null)
    setDrawerOpen(true)
  }, [])

  const handleEditGroup = useCallback(
    (id: string) => {
      const group = customizationGroups.find((g) => g.id === id)
      if (!group) return

      setEditingGroup(group)
      setDrawerOpen(true)
    },
    [customizationGroups],
  )

  const handleSaveGroup = useCallback(
    (groupData: CustomizationGroup) => {
      if (editingGroup) {
        updateCustomizationGroup(editingGroup.id, groupData)
        toast.success("Customization group updated")
      } else {
        createCustomizationGroup(groupData)
        toast.success("Customization group created")
      }
      setDrawerOpen(false)
      setEditingGroup(null)
    },
    [editingGroup, updateCustomizationGroup, createCustomizationGroup],
  )

  const handleDeleteGroup = useCallback(
    (id: string) => {
      const group = customizationGroups.find((g) => g.id === id)
      if (!group) return

      // Check if group is being used by items
      if (group.itemCount > 0) {
        const confirmDelete = confirm(
          `This customization group is used by ${group.itemCount} items. Deleting it will remove it from all items. Continue?`,
        )
        if (!confirmDelete) return
      }

      deleteCustomizationGroup(id)
      toast.success(`${group.name} deleted`)
    },
    [customizationGroups, deleteCustomizationGroup],
  )

  const handleDuplicateGroup = useCallback(
    (id: string) => {
      const group = customizationGroups.find((g) => g.id === id)
      if (!group) return

      duplicateCustomizationGroup(id)
      toast.success(`${group.name} duplicated`)
    },
    [customizationGroups, duplicateCustomizationGroup],
  )

  const handleDrawerClose = () => {
    setDrawerOpen(false)
    setEditingGroup(null)
  }

  const filteredGroups = customizationGroups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="px-6 pt-8 pb-6 border-b border-border">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Customizations</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Manage customization groups that customers can use to personalize items
          </p>
        </div>

        <div className="p-6 space-y-6">
          <CustomizationsToolbar
            onCreateGroup={handleCreateGroup}
            onSearch={setSearchQuery}
            totalGroups={customizationGroups.length}
          />

          <CustomizationsContent
            groups={filteredGroups}
            onCreateGroup={handleCreateGroup}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
            onDuplicateGroup={handleDuplicateGroup}
          />
        </div>
      </div>

      <CustomizationDrawer
        group={editingGroup}
        isOpen={drawerOpen}
        onClose={handleDrawerClose}
        onSave={handleSaveGroup}
        onDelete={handleDeleteGroup}
        availableGroups={customizationGroups}
      />
    </div>
  )
}
