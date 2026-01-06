"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, Trash2, AlertCircle } from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { EmojiInputField } from "@/components/emoji-input-field"
import { MenuSelector } from "@/components/menu-selector"
import { UnsavedChangesModal } from "@/components/modals/unsaved-changes-modal"
import { mockMenus } from "@/lib/mockData"
import type { Category } from "@/types/category"

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
  menuIds: z.array(z.string()),
  emoji: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface EditCategoryDrawerProps {
  category: Category | null
  isOpen: boolean
  onClose: () => void
  onSave: (
    id: string,
    updates: {
      name: string
      description?: string
      menuIds: string[]
      emoji?: string
    },
  ) => void
  onDelete?: (id: string) => void
}

export function EditCategoryDrawer({ category, isOpen, onClose, onSave, onDelete }: EditCategoryDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      menuIds: [],
      emoji: "",
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset,
  } = form

  // Reset form when category changes
  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || "",
        menuIds: category.menuIds || [],
        emoji: category.emoji || "",
      })
    }
  }, [category, reset])

  const onSubmit = async (data: CategoryFormData) => {
    if (!category) return

    setIsSubmitting(true)
    try {
      await onSave(category.id, data)
      toast.success("Category updated successfully!")
      reset()
      onClose()
    } catch (error) {
      toast.error("Failed to update category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedModal(true)
      return
    }
    setIsClosing(true)
    onClose()
  }

  const handleDiscardChanges = () => {
    form.reset()
    setShowUnsavedModal(false)
    setIsClosing(true)
    onClose()
  }

  const handleSaveAndClose = async () => {
    setShowUnsavedModal(false)
    await handleSave("draft")
    setIsClosing(true)
    onClose()
  }

  const handleCancelUnsaved = () => {
    setShowUnsavedModal(false)
  }

  const handleSave = async (status: "draft" | "live") => {
    if (!category) return

    setIsSubmitting(true)
    try {
      const formData = form.getValues()
      const categoryData = {
        ...formData,
      }

      await onSave(category.id, categoryData)
      toast.success("Category updated successfully!")
      reset()
      onClose()
    } catch (error) {
      toast.error("Failed to update category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (category && onDelete) {
      onDelete(category.id)
      onClose()
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className={cn(
          "w-full p-0 gap-0 sm:max-w-[480px] flex flex-col h-full",
          "md:w-[480px]",
          "max-md:h-screen max-md:rounded-none",
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-white dark:bg-slate-950">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleClose} className="size-8">
                <X className="size-4" />
              </Button>
              <SheetTitle className="text-lg font-semibold">Edit Category</SheetTitle>
            </div>

            {onDelete && category && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                className="size-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
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
                <Button size="sm" onClick={() => handleSave("draft")} disabled={isSubmitting}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="px-6 pt-6 pb-20 space-y-6">
              {/* Icon/Emoji */}
              <div className="space-y-2">
                <Label>Icon/Emoji (optional)</Label>
                <EmojiInputField
                  value={watch("emoji") || ""}
                  onChange={(value) => setValue("emoji", value, { shouldDirty: true, shouldValidate: true })}
                  placeholder="Or type emoji here..."
                  forcePortal={true}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Choose an emoji or type initials to represent this category
                </p>
              </div>

              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Category Name <span className="text-red-500">*</span>
                </Label>
                <Input id="name" placeholder="e.g., Appetizers" autoFocus {...register("name")} />
                <p className="text-xs text-gray-500 dark:text-gray-400">Choose a clear, descriptive name</p>
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Internal notes about this category..."
                  {...register("description")}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Not shown to customers</p>
              </div>

              {/* Add to Menus */}
              <div className="space-y-2">
                <Label>Add to Menus (optional)</Label>
                <MenuSelector
                  menus={mockMenus.map((menu) => ({
                    id: menu.id,
                    label: menu.name,
                  }))}
                  selected={watch("menuIds") || []}
                  onChange={(selectedIds) =>
                    setValue("menuIds", selectedIds, { shouldDirty: true, shouldValidate: true })
                  }
                  placeholder="Search menus..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select which menus this category should appear in
                </p>
              </div>
            </div>
          </div>

          <SheetFooter className="sticky bottom-0 border-t bg-white dark:bg-slate-950 p-4">
            <div className="flex w-full gap-2">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Category"}
              </Button>
            </div>
          </SheetFooter>
        </form>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
            <div className="bg-white dark:bg-slate-950 rounded-lg p-6 max-w-md mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Delete Category</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{category?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Unsaved Changes Modal */}
        <UnsavedChangesModal
          open={showUnsavedModal}
          onOpenChange={setShowUnsavedModal}
          onDiscard={handleDiscardChanges}
          onSave={handleSaveAndClose}
          onCancel={handleCancelUnsaved}
          isSaving={isSubmitting}
        />
      </SheetContent>
    </Sheet>
  )
}
