"use client"

import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, AlertCircle, Plus, Trash2 } from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { UnsavedChangesModal } from "@/components/modals/unsaved-changes-modal"
import type { Menu } from "@/types/menu"

const menuSchema = z.object({
  name: z.string().min(1, "Menu name is required"),
  schedules: z
    .array(
      z.object({
        days: z.array(z.number()).min(1, "Select at least one day"),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
      }),
    )
    .min(1, "At least one schedule is required"),
  orderTypes: z.array(z.enum(["delivery", "pickup", "dine-in"])).min(1, "Select at least one order type"),
})

type MenuFormData = z.infer<typeof menuSchema>

export interface MenuSchedule {
  name: string
  schedule: Array<{
    days: number[]
    startTime: string
    endTime: string
  }>
  orderTypes: ("delivery" | "pickup" | "dine-in")[]
}

interface EditMenuDrawerProps {
  menu: Menu | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, updates: MenuSchedule) => void
  onDelete?: (id: string) => void
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? "00" : "30"
  const period = hour < 12 ? "AM" : "PM"
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minute} ${period}`
})

export function EditMenuDrawer({ menu, isOpen, onClose, onSave, onDelete }: EditMenuDrawerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const form = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      name: "",
      schedules: [{ days: [], startTime: "7:00 AM", endTime: "11:00 AM" }],
      orderTypes: ["delivery", "pickup"],
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    setValue,
    watch,
    reset,
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedules",
  })

  // Reset form when menu changes or drawer opens
  useEffect(() => {
    if (menu && isOpen) {
      console.log('EditMenuDrawer - resetting form for menu:', menu.id, menu.name)
      reset({
        name: menu.name,
        schedules: menu.schedule?.length > 0 ? menu.schedule : [{ days: [], startTime: "9:00 AM", endTime: "5:00 PM" }],
        orderTypes: menu.orderTypes?.length > 0 ? menu.orderTypes : ["delivery", "pickup"],
      })
    }
  }, [menu?.id, isOpen, reset])

  const schedules = watch("schedules")
  const orderTypes = watch("orderTypes") || []

  const toggleDay = (scheduleIndex: number, day: number) => {
    const currentDays = schedules[scheduleIndex].days
    const newDays = currentDays.includes(day) ? currentDays.filter((d) => d !== day) : [...currentDays, day]
    setValue(`schedules.${scheduleIndex}.days`, newDays, { shouldDirty: true, shouldValidate: true })
  }

  const toggleOrderType = (type: "delivery" | "pickup" | "dine-in") => {
    const newTypes = orderTypes.includes(type) ? orderTypes.filter((t) => t !== type) : [...orderTypes, type]
    setValue("orderTypes", newTypes, { shouldDirty: true, shouldValidate: true })
  }

  const formatSchedulePreview = () => {
    return schedules.map((schedule, index) => {
      const dayRanges = getDayRanges(schedule.days)
      return `${dayRanges}: ${schedule.startTime} - ${schedule.endTime}`
    })
  }

  const getDayRanges = (days: number[]) => {
    if (days.length === 0) return ""
    const sorted = [...days].sort((a, b) => a - b)
    const ranges: string[] = []
    let start = sorted[0]
    let end = sorted[0]

    for (let i = 1; i <= sorted.length; i++) {
      if (i < sorted.length && sorted[i] === end + 1) {
        end = sorted[i]
      } else {
        if (start === end) {
          ranges.push(dayNames[start])
        } else if (end === start + 1) {
          ranges.push(`${dayNames[start]}, ${dayNames[end]}`)
        } else {
          ranges.push(`${dayNames[start]} - ${dayNames[end]}`)
        }
        if (i < sorted.length) {
          start = sorted[i]
          end = sorted[i]
        }
      }
    }
    return ranges.join(", ")
  }

  const onSubmit = async (data: MenuFormData) => {
    if (!menu) return

    setIsSubmitting(true)
    try {
      const menuData: MenuSchedule = {
        name: data.name,
        schedule: data.schedules,
        orderTypes: data.orderTypes,
      }
      await onSave(menu.id, menuData)
      toast.success("Menu updated successfully!")
      reset()
      onClose()
    } catch (error) {
      toast.error("Failed to update menu")
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
    if (!menu) return

    setIsSubmitting(true)
    try {
      const formData = form.getValues()
      const menuData: MenuSchedule = {
        name: formData.name,
        schedule: formData.schedules,
        orderTypes: formData.orderTypes,
      }

      await onSave(menu.id, menuData)
      toast.success("Menu updated successfully!")
      reset()
      onClose()
    } catch (error) {
      toast.error("Failed to update menu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = () => {
    if (menu && onDelete) {
      onDelete(menu.id)
      onClose()
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className={cn(
          "w-full p-0 gap-0 sm:max-w-[600px] flex flex-col h-full",
          "md:w-[600px]",
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
              <SheetTitle className="text-lg font-semibold">Edit Menu</SheetTitle>
            </div>

            {onDelete && menu && (
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
              {/* Menu Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Menu Name <span className="text-red-500">*</span>
                </Label>
                <Input id="name" placeholder="e.g., Breakfast Menu, Happy Hour" autoFocus {...register("name")} />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Common: Breakfast, Lunch, Dinner, Late Night, Brunch
                </p>
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <Label>
                  Schedule <span className="text-red-500">*</span>
                </Label>

                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => remove(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Day Selector */}
                    <div className="space-y-2">
                      <Label className="text-sm">Days</Label>
                      <div className="flex gap-2">
                        {dayNames.map((day, dayIndex) => (
                          <Button
                            key={dayIndex}
                            type="button"
                            variant={schedules[index]?.days.includes(dayIndex) ? "default" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() => toggleDay(index, dayIndex)}
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                      {errors.schedules?.[index]?.days && (
                        <p className="text-sm text-red-500">{errors.schedules[index]?.days?.message}</p>
                      )}
                    </div>

                    {/* Time Picker */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label className="text-sm">From</Label>
                        <Select
                          value={schedules[index]?.startTime}
                          onValueChange={(value) =>
                            setValue(`schedules.${index}.startTime`, value, { shouldDirty: true, shouldValidate: true })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">To</Label>
                        <Select
                          value={schedules[index]?.endTime}
                          onValueChange={(value) =>
                            setValue(`schedules.${index}.endTime`, value, { shouldDirty: true, shouldValidate: true })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ days: [], startTime: "7:00 AM", endTime: "11:00 AM" })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Time Block
                </Button>
              </div>

              {/* Available For (Order Types) */}
              <div className="space-y-2">
                <Label>
                  Available For <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  {(["delivery", "pickup", "dine-in"] as const).map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`order-${type}`}
                        checked={orderTypes.includes(type)}
                        onCheckedChange={() => toggleOrderType(type)}
                      />
                      <Label htmlFor={`order-${type}`} className="font-normal cursor-pointer capitalize">
                        {type === "dine-in" ? "Dine-in" : type}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Select how customers can order from this menu
                </p>
                {errors.orderTypes && <p className="text-sm text-red-500">{errors.orderTypes.message}</p>}
              </div>

              {/* Preview */}
              <div className="space-y-2 bg-gray-50 dark:bg-slate-900 rounded-lg p-4">
                <Label className="text-sm font-semibold">Preview</Label>
                <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {formatSchedulePreview().map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                  <p className="text-gray-600 dark:text-gray-400">
                    Available for:{" "}
                    {orderTypes.map((t) => (t === "dine-in" ? "Dine-in" : t)).join(", ") || "None selected"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="sticky bottom-0 border-t bg-white dark:bg-slate-950 p-4">
            <div className="flex w-full gap-2">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Menu"}
              </Button>
            </div>
          </SheetFooter>
        </form>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
            <div className="bg-white dark:bg-slate-950 rounded-lg p-6 max-w-md mx-4 shadow-lg">
              <h3 className="text-lg font-semibold mb-2">Delete Menu</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{menu?.name}"? This action cannot be undone.
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
