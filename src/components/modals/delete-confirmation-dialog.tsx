"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, AlertCircle } from "lucide-react"

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  entityType?: "item" | "category" | "menu" | "customization"
  entityName: string
  variant?: "simple" | "strict"
  warningMessage?: string
}

const contextMessages = {
  item: "This item will be removed from all menus and categories.",
  category: "Items in this category won't be deleted. They'll move to 'Uncategorized'.",
  menu: "This will remove the menu schedule. Items and categories won't be deleted.",
  customization: "This will remove the customization group from all items using it.",
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  entityType,
  entityName,
  variant = "simple",
  warningMessage,
}: DeleteConfirmationDialogProps) {
  const [confirmationText, setConfirmationText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  const requireConfirmation = variant === "strict"
  const isConfirmationValid = !requireConfirmation || confirmationText === "DELETE"

  const handleConfirm = async () => {
    if (!isConfirmationValid) return

    setIsDeleting(true)
    try {
      await onConfirm()
      handleClose()
    } catch (error) {
      // Error toast is handled by the calling function
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setConfirmationText("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <DialogTitle>Delete {entityName}?</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-left">{entityType ? contextMessages[entityType] : "This item will be deleted."}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {warningMessage && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">{warningMessage}</p>
              </div>
            </div>
          )}

          {requireConfirmation && (
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="DELETE"
                autoFocus
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isDeleting} autoFocus={!requireConfirmation}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!isConfirmationValid || isDeleting}>
            Delete {entityType ? entityType.charAt(0).toUpperCase() + entityType.slice(1) : "Item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
