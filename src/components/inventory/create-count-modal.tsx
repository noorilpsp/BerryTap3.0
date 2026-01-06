"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

const countTypes = [
  { id: "full", icon: "📦", title: "Full Inventory Count", description: "Count all items in a location (847 SKUs)" },
  { id: "section", icon: "📋", title: "Section/Category Count", description: "Count specific sections or categories" },
  { id: "spot", icon: "🎯", title: "Spot Check", description: "Count specific items only" },
  { id: "cycle", icon: "🔄", title: "Cycle Count", description: "ABC analysis-based counting" },
]

const sections = [
  { id: "proteins", emoji: "🥩", name: "Proteins", skuCount: 45 },
  { id: "produce", emoji: "🥬", name: "Produce", skuCount: 52 },
  { id: "dairy", emoji: "🧀", name: "Dairy & Refrigerated", skuCount: 38 },
  { id: "dry", emoji: "🌾", name: "Dry Goods", skuCount: 89 },
  { id: "beverages", emoji: "🍷", name: "Beverages", skuCount: 67 },
  { id: "packaging", emoji: "📦", name: "Packaging & Supplies", skuCount: 23 },
]

interface CreateCountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateCountModal({ open, onOpenChange }: CreateCountModalProps) {
  const [countType, setCountType] = useState("section")
  const [selectedSections, setSelectedSections] = useState<string[]>(["proteins"])
  const [options, setOptions] = useState({
    includeZeroStock: true,
    showSystemQty: true,
    requirePhotos: false,
    enableBatchTracking: false,
  })

  const totalSKUs = sections.filter((s) => selectedSections.includes(s.id)).reduce((sum, s) => sum + s.skuCount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Count Sheet</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Count Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">COUNT TYPE</Label>
            <RadioGroup value={countType} onValueChange={setCountType}>
              {countTypes.map((type) => (
                <div
                  key={type.id}
                  className="flex items-start space-x-3 p-3 rounded-lg border hover:border-primary/50 cursor-pointer"
                >
                  <RadioGroupItem value={type.id} id={type.id} />
                  <label htmlFor={type.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 font-medium">
                      <span>{type.icon}</span>
                      <span>{type.title}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">LOCATION *</Label>
            <Select defaultValue="main">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Main Kitchen</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="prep">Prep Station</SelectItem>
                <SelectItem value="dry">Dry Storage</SelectItem>
                <SelectItem value="cold">Cold Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sections/Categories */}
          {countType === "section" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">SECTIONS/CATEGORIES</Label>
              <div className="text-sm text-muted-foreground mb-2">Select what to count:</div>
              <div className="space-y-2 max-h-60 overflow-y-auto p-3 border rounded-lg">
                {sections.map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedSections.includes(section.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSections([...selectedSections, section.id])
                          } else {
                            setSelectedSections(selectedSections.filter((id) => id !== section.id))
                          }
                        }}
                      />
                      <span>{section.emoji}</span>
                      <span>{section.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{section.skuCount} SKUs</span>
                  </div>
                ))}
              </div>
              <div className="text-sm font-medium">
                Selected: {selectedSections.length} section{selectedSections.length !== 1 ? "s" : ""} ({totalSKUs} SKUs)
              </div>
            </div>
          )}

          {/* Count Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">COUNT OPTIONS</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={options.includeZeroStock}
                  onCheckedChange={(checked) => setOptions({ ...options, includeZeroStock: !!checked })}
                />
                <label className="text-sm">Include zero-stock items</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={options.showSystemQty}
                  onCheckedChange={(checked) => setOptions({ ...options, showSystemQty: !!checked })}
                />
                <label className="text-sm">Show system quantities (blind count if unchecked)</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={options.requirePhotos}
                  onCheckedChange={(checked) => setOptions({ ...options, requirePhotos: !!checked })}
                />
                <label className="text-sm">Require photo verification for variances</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={options.enableBatchTracking}
                  onCheckedChange={(checked) => setOptions({ ...options, enableBatchTracking: !!checked })}
                />
                <label className="text-sm">Enable batch/lot tracking during count</label>
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">ASSIGNMENT</Label>
            <div className="space-y-2">
              <div>
                <Label className="text-sm">Assign to:</Label>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">👤 Maria L.</Badge>
                  <Badge variant="secondary">👤 John D.</Badge>
                  <Button variant="outline" size="sm">
                    + Add
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-sm">Due date (optional):</Label>
                <Select defaultValue="today">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">📅 Today, 6:00 PM</SelectItem>
                    <SelectItem value="tomorrow">📅 Tomorrow, 6:00 PM</SelectItem>
                    <SelectItem value="custom">📅 Custom date & time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">NOTES</Label>
            <Textarea placeholder="Weekly proteins count - check expiry dates" rows={3} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Create
          </Button>
          <Button onClick={() => onOpenChange(false)}>Create & Start</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
