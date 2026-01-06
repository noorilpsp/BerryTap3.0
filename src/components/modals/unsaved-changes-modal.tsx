"use client"

import { AlertTriangle, Save, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UnsavedChangesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDiscard: () => void
  onSave: () => void
  onCancel: () => void
  isSaving?: boolean
}

export function UnsavedChangesModal({
  open,
  onOpenChange,
  onDiscard,
  onSave,
  onCancel,
  isSaving = false,
}: UnsavedChangesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <DialogTitle>Unsaved Changes</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-left">
            You have unsaved changes that will be lost if you close without saving. What would you like to do?
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Your changes will be permanently lost if you don't save them.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button variant="outline" onClick={onDiscard} className="w-full sm:w-auto">
            Discard Changes
          </Button>
          <Button onClick={onSave} disabled={isSaving} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
