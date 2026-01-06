"use client"

import { useState } from "react"
import { Save, Users, Lock, Building, Tag, X, AlertCircle, CheckCircle2, Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface SaveTemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaveTemplateModal({ open, onOpenChange }: SaveTemplateModalProps) {
  const [name, setName] = useState("Monthly Sales Report - Nov 2024")
  const [description, setDescription] = useState("Complete monthly sales breakdown with all order details for accounting purposes. Includes revenue, tax, tips, and channel data.")
  const [visibility, setVisibility] = useState("team")
  const [tags, setTags] = useState(["accounting", "monthly", "sales"])
  const [newTag, setNewTag] = useState("")
  const [isFavorite, setIsFavorite] = useState(true)
  const [isPinned, setIsPinned] = useState(true)
  const [isDefault, setIsDefault] = useState(false)
  const [notifyOnUpdate, setNotifyOnUpdate] = useState(false)

  const suggestedTags = ["revenue", "financial", "reports"]

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save as Template
          </DialogTitle>
          <DialogDescription>
            Save your current export configuration for reuse
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="template-name">
              Template Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="template-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name"
              required
              aria-required="true"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="template-description">Description (Optional)</Label>
            <Textarea
              id="template-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this template is for"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Configuration Summary */}
          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Configuration Summary:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Dataset: Orders (2.8M records)</li>
              <li>• Columns: 8 selected (Order ID, Placed At, Amount, Tax, Tip...)</li>
              <li>• Filters: 3 active (Channel, Total ≥ $50, Status = Completed)</li>
              <li>• Format: CSV</li>
              <li>• Date Range: Dynamic (updates with template usage)</li>
            </ul>
          </div>

          <Separator />

          {/* Sharing & Access */}
          <div className="space-y-3">
            <Label>Sharing & Access</Label>
            <RadioGroup value={visibility} onValueChange={setVisibility} className="space-y-3">
              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="private" id="private" />
                <div className="flex-1">
                  <Label htmlFor="private" className="flex items-center gap-2 font-normal cursor-pointer">
                    <Lock className="h-4 w-4" />
                    Private (Only me)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Only you can view and use this template
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="team" id="team" />
                <div className="flex-1">
                  <Label htmlFor="team" className="flex items-center gap-2 font-normal cursor-pointer">
                    <Users className="h-4 w-4" />
                    Team (Shared)
                    <Badge variant="secondary" className="text-xs">Recommended</Badge>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    All team members can view and use this template
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0">
                <RadioGroupItem value="organization" id="organization" />
                <div className="flex-1">
                  <Label htmlFor="organization" className="flex items-center gap-2 font-normal cursor-pointer">
                    <Building className="h-4 w-4" />
                    Organization (All locations)
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Users across all locations can access this template
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-3">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-destructive"
                    aria-label={`Remove ${tag} tag`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {tags.length < 10 && (
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag(newTag)
                      }
                    }}
                    placeholder="+ Add tag"
                    className="h-6 w-24 text-xs"
                  />
                </div>
              )}
            </div>
            {suggestedTags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Suggested:</span>
                {suggestedTags.map((tag) => (
                  <Button
                    key={tag}
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => addTag(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Advanced Options */}
          <div className="space-y-3">
            <Label>Advanced Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="favorite"
                  checked={isFavorite}
                  onCheckedChange={(checked) => setIsFavorite(checked as boolean)}
                />
                <Label htmlFor="favorite" className="font-normal cursor-pointer">
                  Mark as favorite
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pinned"
                  checked={isPinned}
                  onCheckedChange={(checked) => setIsPinned(checked as boolean)}
                />
                <Label htmlFor="pinned" className="font-normal cursor-pointer">
                  Pin to top of templates list
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="default"
                  checked={isDefault}
                  onCheckedChange={(checked) => setIsDefault(checked as boolean)}
                />
                <Label htmlFor="default" className="font-normal cursor-pointer">
                  Set as default template for Orders dataset
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="notify"
                  checked={notifyOnUpdate}
                  onCheckedChange={(checked) => setNotifyOnUpdate(checked as boolean)}
                />
                <Label htmlFor="notify" className="font-normal cursor-pointer">
                  Notify team when template is updated
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            console.log("[v0] Saving template:", { name, description, visibility, tags })
            onOpenChange(false)
          }}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
