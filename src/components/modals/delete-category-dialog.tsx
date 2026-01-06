"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2 } from "lucide-react"
import type { Category } from "@/types/category"

interface DeleteCategoryDialogProps {
  category: Category | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (id: string) => void
  itemsInCategory: number
}

export function DeleteCategoryDialog({ 
  category, 
  isOpen, 
  onClose, 
  onConfirm, 
  itemsInCategory 
}: DeleteCategoryDialogProps) {
  if (!category) return null

  const handleConfirm = () => {
    console.log('DeleteCategoryDialog: handleConfirm called')
    onConfirm(category.id)
    console.log('DeleteCategoryDialog: calling onClose')
    onClose()
  }

  console.log('DeleteCategoryDialog render:', { isOpen, category: category?.name })

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      console.log('DeleteCategoryDialog onOpenChange:', open)
      onClose()
    }}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-left">
                Delete "{category.name}"?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-left mt-1">
                This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">
                {itemsInCategory > 0 ? `This category has ${itemsInCategory} item${itemsInCategory !== 1 ? 's' : ''}` : 'Delete category'}
              </h4>
              <p className="text-sm text-amber-800 mt-1">
                {itemsInCategory > 0 
                  ? `Deleting this category will remove it from all ${itemsInCategory} item${itemsInCategory !== 1 ? 's' : ''}, but the items themselves will remain. This action cannot be undone.`
                  : 'This action cannot be undone.'
                }
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel asChild>
            <Button variant="ghost">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="destructive" 
              onClick={handleConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Category
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
