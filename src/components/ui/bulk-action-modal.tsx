"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface BulkActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  action: "tags" | "change-status" | "categories" | "delete" | null
  selectedCount: number
  selectedItems?: Array<{ id: string; name: string }>
  availableTags?: string[]
  availableCategories?: Array<{ id: string; name: string }>
  onConfirm: (data: any) => Promise<void>
}

export function BulkActionModal({
  open,
  onOpenChange,
  action,
  selectedCount,
  selectedItems = [],
  availableTags = [],
  availableCategories = [],
  onConfirm,
}: BulkActionModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [deleteConfirmed, setDeleteConfirmed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleConfirm = async () => {
    setLoading(true)
    try {
      let data: any = {}

      if (action === "tags") {
        data = { tags: selectedTags }
      } else if (action === "change-status") {
        data = { status: selectedStatus }
      } else if (action === "categories") {
        data = { categoryIds: selectedCategories }
      }

      await onConfirm(data)
      onOpenChange(false)

      // Reset state
      setSelectedTags([])
      setSelectedStatus("")
      setSelectedCategories([])
      setDeleteConfirmed(false)
      setSearchQuery("")
    } catch (error) {
      console.error("Bulk action failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const filteredTags = availableTags.filter((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

  const pluralSuffix = selectedCount === 1 ? "" : "s"

  const getTitle = () => {
    switch (action) {
      case "tags":
        return `Update Tags for ${selectedCount} Item${pluralSuffix}`
      case "change-status":
        return `Change Status of ${selectedCount} Item${pluralSuffix}`
      case "categories":
        return `Update Categories for ${selectedCount} Item${pluralSuffix}`
      case "delete":
        return `Delete ${selectedCount} Item${pluralSuffix}?`
      default:
        return "Bulk Action"
    }
  }

  const getActionButton = () => {
    switch (action) {
      case "tags":
        return "Apply Tags"
      case "change-status":
        return "Update Status"
      case "categories":
        return "Apply Categories"
      case "delete":
        return "Delete Items"
      default:
        return "Confirm"
    }
  }

  const isConfirmDisabled = () => {
    if (action === "tags") {
      return selectedTags.length === 0
    }
    if (action === "change-status") {
      return !selectedStatus
    }
    if (action === "categories") {
      return selectedCategories.length === 0
    }
    if (action === "delete") {
      return !deleteConfirmed
    }
    return false
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          {action !== "delete" && (
            <DialogDescription>Select the options you want to apply to the selected items.</DialogDescription>
          )}
        </DialogHeader>

        <div className="py-4">
          {/* Tags */}
          {action === "tags" && (
            <div className="space-y-4">
              <Input
                placeholder="Search tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <ScrollArea className="h-64 border rounded-lg p-4">
                <div className="space-y-2">
                  {filteredTags.map((tag) => (
                    <div key={tag} className="flex items-center space-x-2">
                      <Checkbox id={tag} checked={selectedTags.includes(tag)} onCheckedChange={() => toggleTag(tag)} className="min-h-0 min-w-0" />
                      <Label htmlFor={tag} className="flex-1 cursor-pointer">
                        {tag}
                      </Label>
                    </div>
                  ))}
                  {filteredTags.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No tags found</p>}
                </div>
              </ScrollArea>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Change Status */}
          {action === "change-status" && (
            <div className="space-y-4">
              <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="live" id="live" />
                  <Label htmlFor="live" className="flex-1 cursor-pointer">
                    🟢 Live
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="draft" id="draft" />
                  <Label htmlFor="draft" className="flex-1 cursor-pointer">
                    📝 Draft
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hidden" id="hidden" />
                  <Label htmlFor="hidden" className="flex-1 cursor-pointer">
                    👻 Hidden
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="soldout-today" id="soldout-today" />
                  <Label htmlFor="soldout-today" className="flex-1 cursor-pointer">
                    🔴 Sold Out - Today only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="soldout-indefinite" id="soldout-indefinite" />
                  <Label htmlFor="soldout-indefinite" className="flex-1 cursor-pointer">
                    ⛔ Sold Out - Indefinitely
                  </Label>
                </div>
              </RadioGroup>
              {(selectedStatus === "soldout-today" || selectedStatus === "soldout-indefinite") && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    These items will be marked as sold out and won't be available for ordering.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Categories */}
          {action === "categories" && (
            <div className="space-y-4">
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <ScrollArea className="h-64 border rounded-lg p-4">
                <div className="space-y-2">
                  {availableCategories
                    .filter((category) =>
                      category.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((category) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCategories([...selectedCategories, category.id])
                            } else {
                              setSelectedCategories(selectedCategories.filter(id => id !== category.id))
                            }
                          }}
                          className="min-h-0 min-w-0"
                        />
                        <Label htmlFor={category.id} className="flex-1 cursor-pointer">
                          {category.name}
                        </Label>
                      </div>
                    ))}
                </div>
              </ScrollArea>
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.map((categoryId) => {
                    const category = availableCategories.find(cat => cat.id === categoryId)
                    return (
                      <Badge key={categoryId} variant="secondary" className="text-xs">
                        {category?.name}
                        <button
                          onClick={() => setSelectedCategories(selectedCategories.filter(id => id !== categoryId))}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          ×
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Delete Confirmation */}
          {action === "delete" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-red-900">This action cannot be undone</p>
                  <p className="text-sm text-red-700">These items will be removed from all menus and categories.</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Items to be deleted:</p>
                <ScrollArea className="h-32 border rounded-lg p-3">
                  <div className="space-y-1">
                    {selectedItems.slice(0, 5).map((item) => (
                      <p key={item.id} className="text-sm text-gray-600">
                        • {item.name}
                      </p>
                    ))}
                    {selectedItems.length > 5 && (
                      <p className="text-sm text-gray-500 font-medium">+{selectedItems.length - 5} more items</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delete-confirm"
                  checked={deleteConfirmed}
                  onCheckedChange={(checked) => setDeleteConfirmed(checked as boolean)}
                  className="min-h-0 min-w-0"
                />
                <Label htmlFor="delete-confirm" className="text-sm cursor-pointer">
                  I understand this cannot be undone
                </Label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirmDisabled() || loading}
            className={cn(action === "delete" && "bg-red-600 hover:bg-red-700")}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {getActionButton()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
