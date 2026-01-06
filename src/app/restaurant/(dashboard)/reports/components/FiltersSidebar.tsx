"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { ReportsFilters } from "../types/reports.types"

interface FiltersSidebarProps {
  filters: ReportsFilters
  onApply: (filters: Partial<ReportsFilters>) => void
  onReset: () => void
  onClose?: () => void
}

const CHANNELS = [
  { id: "dine_in", label: "Dine-in" },
  { id: "takeout", label: "Takeout" },
  { id: "delivery", label: "Delivery" },
  { id: "catering", label: "Catering" },
]

const CATEGORIES = [
  { id: "appetizers", label: "Appetizers" },
  { id: "main_course", label: "Main Course" },
  { id: "desserts", label: "Desserts" },
  { id: "beverages", label: "Beverages" },
  { id: "salads", label: "Salads" },
]

export function FiltersSidebar({ filters, onApply, onReset, onClose }: FiltersSidebarProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleToggleChannel = (channelId: string) => {
    const current = localFilters.channels || []
    const updated = current.includes(channelId) ? current.filter((id) => id !== channelId) : [...current, channelId]
    setLocalFilters({ ...localFilters, channels: updated })
  }

  const handleToggleCategory = (categoryId: string) => {
    const current = localFilters.categories || []
    const updated = current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId]
    setLocalFilters({ ...localFilters, categories: updated })
  }

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 flex items-center justify-between border-b">
        <h2 className="font-semibold">Filters</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <Accordion type="multiple" defaultValue={["channels", "categories"]} className="space-y-2">
            {/* Order Channels */}
            <AccordionItem value="channels" className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">Order Channels</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {CHANNELS.map((channel) => (
                    <div key={channel.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={channel.id}
                        checked={localFilters.channels?.includes(channel.id)}
                        onCheckedChange={() => handleToggleChannel(channel.id)}
                      />
                      <Label htmlFor={channel.id} className="text-sm font-normal cursor-pointer">
                        {channel.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Item Categories */}
            <AccordionItem value="categories" className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-medium hover:no-underline">Item Categories</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {CATEGORIES.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={category.id}
                        checked={localFilters.categories?.includes(category.id)}
                        onCheckedChange={() => handleToggleCategory(category.id)}
                      />
                      <Label htmlFor={category.id} className="text-sm font-normal cursor-pointer">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4 space-y-2">
        <Button onClick={() => onApply(localFilters)} className="w-full">
          Apply Filters
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            onReset()
            setLocalFilters(filters)
          }}
          className="w-full"
        >
          Reset All
        </Button>
      </div>
    </Card>
  )
}

function useState<T>(initialValue: T): [T, (value: T) => void] {
  const [state, setState] = React.useState<T>(initialValue)
  return [state, setState]
}

import * as React from "react"
