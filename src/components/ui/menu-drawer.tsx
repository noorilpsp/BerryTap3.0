"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, MoreVertical, AlertCircle, Plus, Clock } from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Menu } from "@/types/menu"

const menuSchema = z.object({
  name: z.string().min(1, "Menu name is required").max(50),
  schedule: z
    .array(
      z.object({
        days: z.array(z.number()).min(1, "Select at least one day"),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
      }),
    )
    .min(1, "At least one schedule is required"),
  orderTypes: z.array(z.enum(["delivery", "pickup", "dine-in"])).min(1, "Select at least one order type"),
  isActive: z.boolean(),
})

type MenuFormData = z.infer<typeof menuSchema>

interface MenuDrawerProps {
  menu: Menu | null
  isOpen: boolean
  onClose: () => void
  onSave: (menu: Menu) => void
  onDelete: (id: string) => void
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? "00" : "30"
  const period = hour < 12 ? "AM" : "PM"
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minute} ${period}`
})

const getOrderedTimeSlots = (selectedTime: string) => {
  if (!selectedTime || !timeSlots.includes(selectedTime)) {
    return timeSlots
  }

  const selectedIndex = timeSlots.indexOf(selectedTime)
  // Split array: times from selected onwards + times before selected
  const timesAfterSelected = timeSlots.slice(selectedIndex)
  const timesBeforeSelected = timeSlots.slice(0, selectedIndex)

  return [...timesAfterSelected, ...timesBeforeSelected]
}

export function MenuDrawer({ menu, isOpen, onClose, onSave, onDelete }: MenuDrawerProps) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)

  const form = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: menu
      ? {
          name: menu.name,
          schedule: menu.schedule,
          orderTypes: menu.orderTypes,
          isActive: menu.isActive,
        }
      : {
          name: "",
          schedule: [{ days: [], startTime: "7:00 AM", endTime: "11:00 AM" }],
          orderTypes: [],
          isActive: true,
        },
  })

  const {
    formState: { isDirty, errors },
  } = form

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "schedule",
  })

  React.useEffect(() => {
    if (!isOpen) {
      // Reset form to default values when drawer closes
      form.reset({
        name: "",
        schedule: [{ days: [], startTime: "7:00 AM", endTime: "11:00 AM" }],
        orderTypes: [],
        isActive: true,
      })
      setShowDeleteConfirm(false)
    }
  }, [isOpen, form])

  React.useEffect(() => {
    if (menu) {
      form.reset({
        name: menu.name,
        schedule: menu.schedule,
        orderTypes: menu.orderTypes,
        isActive: menu.isActive,
      })
    }
  }, [menu, form])

  const handleClose = () => {
    if (isDirty) {
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to close?")
      if (!confirmed) return
    }
    onClose()
  }

  const handleSave = async (isActive: boolean) => {
    const isValid = await form.trigger()

    if (!isValid) {
      const firstError = Object.values(errors)[0]
      alert("Please fix all required fields before saving.")
      return
    }

    setIsSaving(true)
    try {
      const values = form.getValues()
      const menuData: Menu = {
        id: menu?.id || `${Date.now()}`,
        name: values.name,
        schedule: values.schedule,
        orderTypes: values.orderTypes,
        categoryCount: menu?.categoryCount || 0,
        itemCount: menu?.itemCount || 0,
        isActive,
      }
      await onSave(menuData)
      form.reset(values)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (menu) {
      onDelete(menu.id)
      onClose()
    }
  }

  const nameValue = form.watch("name")
  const scheduleValue = form.watch("schedule")
  const orderTypesValue = form.watch("orderTypes")

  const toggleDay = (scheduleIndex: number, day: number) => {
    const currentDays = scheduleValue[scheduleIndex].days
    const newDays = currentDays.includes(day) ? currentDays.filter((d) => d !== day) : [...currentDays, day]
    form.setValue(`schedule.${scheduleIndex}.days`, newDays, { shouldValidate: true })
  }

  const toggleOrderType = (type: "delivery" | "pickup" | "dine-in") => {
    const newTypes = orderTypesValue.includes(type)
      ? orderTypesValue.filter((t) => t !== type)
      : [...orderTypesValue, type]
    form.setValue("orderTypes", newTypes, { shouldValidate: true })
  }

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
              <SheetTitle className="text-lg font-semibold">{menu ? "Edit Menu" : "New Menu"}</SheetTitle>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Duplicate Menu</DropdownMenuItem>
                <DropdownMenuItem>View Items</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => setShowDeleteConfirm(true)}>
                  Delete Menu
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
                <Button size="sm" onClick={() => handleSave(true)} disabled={isSaving}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Single Scrollable Form */}
        <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
          <div className="p-6 space-y-6">
            {/* Menu Information */}
            <div className="space-y-4">
              <h3 className="font-semibold">Menu Information</h3>

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <div className="relative">
                  <Input
                    id="name"
                    placeholder="e.g., Breakfast Menu, Lunch Menu"
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
                <p className="text-xs text-gray-500">Common: Breakfast, Lunch, Dinner, Late Night, Brunch</p>
              </div>
            </div>

            <Separator />

            {/* Stats (if editing existing menu) */}
            {menu && (
              <>
                <div className="space-y-4">
                  <h3 className="font-semibold">Menu Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-4">
                      <div className="text-2xl font-bold">{menu.categoryCount}</div>
                      <div className="text-xs text-muted-foreground">Categories</div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-2xl font-bold">{menu.itemCount}</div>
                      <div className="text-xs text-muted-foreground">Items</div>
                    </div>
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Time Blocks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Time Blocks</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ days: [], startTime: "7:00 AM", endTime: "11:00 AM" })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Block
                </Button>
              </div>

              {errors.schedule && !Array.isArray(errors.schedule) && (
                <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">
                  <AlertCircle className="size-4" />
                  <span>{errors.schedule.message}</span>
                </div>
              )}

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={cn(
                    "border rounded-lg p-4 space-y-4 relative",
                    errors.schedule?.[index] && "border-red-500 bg-red-50/50",
                  )}
                >
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 size-8"
                      onClick={() => remove(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  )}

                  {/* Day Selector */}
                  <div className="space-y-2">
                    <Label className="text-sm">Days *</Label>
                    <div className="flex gap-2">
                      {dayNames.map((day, dayIndex) => (
                        <Button
                          key={dayIndex}
                          type="button"
                          variant={scheduleValue[index]?.days.includes(dayIndex) ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => toggleDay(index, dayIndex)}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                    {errors.schedule?.[index]?.days && (
                      <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
                        <AlertCircle className="size-3" />
                        <span>{errors.schedule[index]?.days?.message}</span>
                      </div>
                    )}
                  </div>

                  {/* Time Picker */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">From *</Label>
                      <Select
                        value={scheduleValue[index]?.startTime}
                        onValueChange={(value) =>
                          form.setValue(`schedule.${index}.startTime`, value, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger className={cn(errors.schedule?.[index]?.startTime && "border-red-500")}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getOrderedTimeSlots(scheduleValue[index]?.startTime).map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.schedule?.[index]?.startTime && (
                        <p className="text-xs text-red-500">{errors.schedule[index]?.startTime?.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">To *</Label>
                      <Select
                        value={scheduleValue[index]?.endTime}
                        onValueChange={(value) =>
                          form.setValue(`schedule.${index}.endTime`, value, { shouldValidate: true })
                        }
                      >
                        <SelectTrigger className={cn(errors.schedule?.[index]?.endTime && "border-red-500")}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getOrderedTimeSlots(scheduleValue[index]?.endTime).map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.schedule?.[index]?.endTime && (
                        <p className="text-xs text-red-500">{errors.schedule[index]?.endTime?.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Order Types */}
            <div className="space-y-4">
              <h3 className="font-semibold">Available For *</h3>
              <p className="text-sm text-gray-600">Select how customers can order from this menu</p>

              <div
                className={cn("space-y-3 p-4 rounded-lg border", errors.orderTypes && "border-red-500 bg-red-50/50")}
              >
                {(["delivery", "pickup", "dine-in"] as const).map((type) => (
                  <div key={type} className="flex items-center space-x-3">
                    <Checkbox
                      id={`order-${type}`}
                      checked={orderTypesValue.includes(type)}
                      onCheckedChange={() => toggleOrderType(type)}
                    />
                    <Label htmlFor={`order-${type}`} className="font-normal cursor-pointer capitalize">
                      {type === "dine-in" ? "Dine-in" : type}
                    </Label>
                  </div>
                ))}
              </div>

              {errors.orderTypes && (
                <div className="flex items-center gap-2 text-sm text-red-500 font-medium">
                  <AlertCircle className="size-4" />
                  <span>{errors.orderTypes.message}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Preview */}
            <div className="space-y-4 bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-semibold">Schedule Preview</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                {scheduleValue.map((block, index) => {
                  const dayRanges = block.days
                    .sort((a, b) => a - b)
                    .map((d) => dayNames[d])
                    .join(", ")
                  return (
                    <p key={index}>
                      {dayRanges || "No days selected"}: {block.startTime} - {block.endTime}
                    </p>
                  )
                })}
                <p className="text-gray-600 dark:text-gray-400 mt-3">
                  Available for:{" "}
                  {orderTypesValue.map((t) => (t === "dine-in" ? "Dine-in" : t)).join(", ") || "None selected"}
                </p>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <SheetFooter className="sticky bottom-0 border-t bg-white dark:bg-slate-950 p-4">
          <div className="flex w-full gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleSave(false)} disabled={isSaving}>
              Save as Inactive
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => handleSave(true)} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save & Activate"}
            </Button>
          </div>
        </SheetFooter>

        {/* Delete Confirmation (Simple) */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-950 rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-2">Delete Menu?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{menu?.name}"? This action cannot be undone.
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
