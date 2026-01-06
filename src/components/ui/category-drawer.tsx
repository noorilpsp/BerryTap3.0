"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, MoreVertical, AlertCircle } from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Category } from "@/types/category"
import { EmojiInputField } from "@/components/emoji-input-field"
import { CategorySelector } from "@/components/category-selector"

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  description: z.string().optional(),
  emoji: z.string().max(2, "Maximum 2 characters").optional(),
  menuIds: z.array(z.string()).min(1, "Select at least one menu"),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryDrawerProps {
  category: Category | null
  isOpen: boolean
  onClose: () => void
  onSave: (category: Category) => void
  onDelete: (id: string) => void
}

const mockMenus = [
  { id: "1", name: "Breakfast Menu" },
  { id: "2", name: "Lunch Menu" },
  { id: "3", name: "Dinner Menu" },
  { id: "4", name: "Late Night Menu" },
]

export function CategoryDrawer({ category, isOpen, onClose, onSave, onDelete }: CategoryDrawerProps) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? {
          name: category.name,
          description: category.description || "",
          emoji: category.emoji || "",
          menuIds: category.menuIds,
        }
      : {
          name: "",
          description: "",
          emoji: "",
          menuIds: [],
        },
  })

  const {
    formState: { isDirty, errors },
  } = form

  React.useEffect(() => {
    if (!isOpen) {
      // Reset form to default values when drawer closes
      form.reset({
        name: "",
        description: "",
        emoji: "",
        menuIds: [],
      })
      setShowDeleteConfirm(false)
    }
  }, [isOpen, form])

  React.useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        description: category.description || "",
        emoji: category.emoji || "",
        menuIds: category.menuIds,
      })
    }
  }, [category, form])

  const handleClose = () => {
    if (isDirty) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to close?")
      if (!confirmed) return
    }
    onClose()
  }

  const handleSave = async () => {
    const isValid = await form.trigger()

    if (!isValid) {
      alert("Please fix all required fields before saving.")
      return
    }

    setIsSaving(true)
    try {
      const values = form.getValues()
      const categoryData: Category = {
        id: category?.id || `${Date.now()}`,
        name: values.name,
        description: values.description,
        emoji: values.emoji,
        menuIds: values.menuIds,
        menuNames: mockMenus.filter((m) => values.menuIds.includes(m.id)).map((m) => m.name),
        order: category?.order || 0,
        itemCount: category?.itemCount || 0,
      }
      await onSave(categoryData)
      form.reset(values)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (category) {
      onDelete(category.id)
      onClose()
    }
  }

  const nameValue = form.watch("name")
  const descriptionValue = form.watch("description")
  const emojiValue = form.watch("emoji")
  const menuIdsValue = form.watch("menuIds")

  const toggleMenu = (menuId: string) => {
    const newMenuIds = menuIdsValue.includes(menuId)
      ? menuIdsValue.filter((id) => id !== menuId)
      : [...menuIdsValue, menuId]
    form.setValue("menuIds", newMenuIds, { shouldValidate: true })
  }

  const menuCategories = mockMenus.map((menu) => ({
    id: menu.id,
    label: menu.name,
  }))

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className={cn("w-full p-0 sm:max-w-[480px]", "md:w-[480px]", "max-md:h-[85vh] max-md:rounded-t-3xl")}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-white dark:bg-slate-950">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleClose} className="size-8">
                <X className="size-4" />
              </Button>
              <SheetTitle className="text-lg font-semibold">{category ? "Edit Category" : "New Category"}</SheetTitle>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Duplicate Category</DropdownMenuItem>
                <DropdownMenuItem>View Items</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => setShowDeleteConfirm(true)}>
                  Delete Category
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Unsaved Changes Banner */}
          {isDirty && (
            <div className="flex items-center gap-3 border-b border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-900 px-6 py-3">
              <AlertCircle className="size-4 text-amber-600 dark:text-amber-500" />
              <span className="flex-1 text-sm text-amber-900 dark:text-amber-200">You have unsaved changes</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => form.reset()}>
                  Discard
                </Button>
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Single Scrollable Form */}
        <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Category Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Category Information</h3>

              {/* Emoji Picker */}
              <div className="space-y-2">
                <Label htmlFor="emoji">Icon/Emoji</Label>
                <EmojiInputField
                  value={emojiValue || ""}
                  onChange={(value) => form.setValue("emoji", value, { shouldValidate: true })}
                  placeholder="Type initials or select emoji"
                  className={cn(errors.emoji && "border-red-500")}
                />
                {errors.emoji && <p className="text-xs text-red-500">{errors.emoji.message}</p>}
                <p className="text-xs text-gray-500">
                  Choose an emoji or type up to 2 letters (e.g., AP for Appetizers)
                </p>
              </div>

              {/* Name Input */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="e.g., Appetizers, Main Courses, Desserts"
                    {...form.register("name")}
                    className={cn(errors.name && "border-red-500 focus-visible:ring-red-500 pr-10")}
                  />
                  {errors.name && (
                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-red-500" />
                  )}
                </div>
                <div className="flex justify-between text-xs">
                  {errors.name && (
                    <div className="flex items-center gap-1 text-red-500 font-medium">
                      <AlertCircle className="size-3" />
                      <span>{errors.name.message}</span>
                    </div>
                  )}
                  <span className={cn("ml-auto", errors.name ? "text-red-500" : "text-gray-500")}>
                    {nameValue?.length || 0}/50
                  </span>
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Internal notes about this category (not shown to customers)"
                  rows={3}
                  {...form.register("description")}
                  className={cn(errors.description && "border-red-500")}
                />
                <div className="flex justify-between text-xs">
                  {errors.description && <span className="text-red-500 font-medium">{errors.description.message}</span>}
                  <span className={cn("ml-auto text-gray-500")}>{descriptionValue?.length || 0} characters</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Stats (if editing existing category) */}
            {category && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold">Category Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4">
                      <div className="text-2xl font-bold">{category.itemCount}</div>
                      <div className="text-xs text-muted-foreground">Items</div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-2xl font-bold">{category.menuNames.length}</div>
                      <div className="text-xs text-muted-foreground">Menus</div>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Menu Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Add to Menus *</h3>
                <p className="text-sm text-gray-600 mt-1">Select which menus should include this category</p>
              </div>

              <div className={cn(errors.menuIds && "rounded-lg border-2 border-red-500 p-3 bg-red-50/50")}>
                <CategorySelector
                  categories={menuCategories}
                  selected={menuIdsValue}
                  onChange={(selectedIds) => form.setValue("menuIds", selectedIds, { shouldValidate: true })}
                  placeholder="Search menus..."
                />
              </div>

              {errors.menuIds && (
                <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
                  <AlertCircle className="size-4" />
                  <span>{errors.menuIds.message}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Preview */}
            <div className="space-y-4 bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
              <h3 className="font-semibold">Preview</h3>
              <div className="flex items-center gap-3">
                {emojiValue && <span className="text-3xl">{emojiValue}</span>}
                <div>
                  <p className="font-semibold">{nameValue || "Category Name"}</p>
                  {descriptionValue && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{descriptionValue}</p>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Appears in: {menuIdsValue.length > 0 ? `${menuIdsValue.length} menu(s)` : "No menus selected"}
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="sticky bottom-0 border-t bg-white dark:bg-slate-950 p-4">
          <div className="flex w-full gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : category ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </SheetFooter>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-950 rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-2">Delete Category?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{category?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
