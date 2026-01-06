"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"

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

interface CreateMenuModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (menu: MenuSchedule) => void
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? "00" : "30"
  const period = hour < 12 ? "AM" : "PM"
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minute} ${period}`
})

export function CreateMenuModal({ isOpen, onClose, onSave }: CreateMenuModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
    reset,
  } = useForm<MenuFormData>({
    resolver: zodResolver(menuSchema),
    defaultValues: {
      name: "",
      schedules: [{ days: [], startTime: "7:00 AM", endTime: "11:00 AM" }],
      orderTypes: ["delivery", "pickup"],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "schedules",
  })

  const schedules = watch("schedules")
  const orderTypes = watch("orderTypes") || []

  const toggleDay = (scheduleIndex: number, day: number) => {
    const currentDays = schedules[scheduleIndex].days
    const newDays = currentDays.includes(day) ? currentDays.filter((d) => d !== day) : [...currentDays, day]
    setValue(`schedules.${scheduleIndex}.days`, newDays)
  }

  const toggleOrderType = (type: "delivery" | "pickup" | "dine-in") => {
    const newTypes = orderTypes.includes(type) ? orderTypes.filter((t) => t !== type) : [...orderTypes, type]
    setValue("orderTypes", newTypes)
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
    setIsSubmitting(true)
    try {
      const menu: MenuSchedule = {
        name: data.name,
        schedule: data.schedules,
        orderTypes: data.orderTypes,
      }
      await onSave(menu)
      toast.success("Menu created successfully!")
      reset()
      onClose()
    } catch (error) {
      toast.error("Failed to create menu")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Create New Menu</DialogTitle>
          <DialogDescription>Set up a menu with schedule and availability</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
          <form className="space-y-6 py-4">
            {/* Menu Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Menu Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" placeholder="e.g., Breakfast Menu, Happy Hour" autoFocus {...register("name")} />
              <p className="text-xs text-gray-500">Common: Breakfast, Lunch, Dinner, Late Night, Brunch</p>
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">From</Label>
                      <Select
                        value={schedules[index]?.startTime}
                        onValueChange={(value) => setValue(`schedules.${index}.startTime`, value)}
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
                        onValueChange={(value) => setValue(`schedules.${index}.endTime`, value)}
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
              <p className="text-xs text-gray-500">Select how customers can order from this menu</p>
              {errors.orderTypes && <p className="text-sm text-red-500">{errors.orderTypes.message}</p>}
            </div>

            {/* Preview */}
            <div className="space-y-2 bg-gray-50 rounded-lg p-4">
              <Label className="text-sm font-semibold">Preview</Label>
              <div className="space-y-1 text-sm text-gray-700">
                {formatSchedulePreview().map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
                <p className="text-gray-600">
                  Available for:{" "}
                  {orderTypes.map((t) => (t === "dine-in" ? "Dine-in" : t)).join(", ") || "None selected"}
                </p>
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            Create Menu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
