"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, MoreVertical, AlertCircle, Settings2, GripVertical, Plus, Check, Clock } from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { MenuItem } from "@/types/menu-item"
import { CategorySelector } from "@/components/category-selector"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CustomizationDrawer } from "@/components/customization-drawer"
import { UnsavedChangesModal } from "@/components/modals/unsaved-changes-modal"
import { PhotoUpload } from "@/components/photo-upload"
import type { Photo } from "@/types/photo"

const menuItemSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(50),
  description: z.string().max(260).optional(),
  price: z.number().min(0),
  currency: z.string(),
  image: z.string().optional(),
  status: z.enum(["live", "draft", "hidden", "soldout"]),
  categories: z.array(z.string()).min(1, "At least one category is required"),
  tags: z.array(z.string()),
  dietaryTags: z.array(z.enum(["vegetarian", "vegan", "gluten-free"])),
  customizationGroups: z.array(z.string()),
  availabilityMode: z.enum(["menu-hours", "custom"]),
  customSchedule: z
    .array(
      z.object({
        days: z.array(z.number()).min(1, "Select at least one day"),
        startTime: z.string().min(1, "Start time is required"),
        endTime: z.string().min(1, "End time is required"),
      }),
    )
    .optional(),
  soldOutUntil: z.date().nullable().optional(),
  nutrition: z
    .object({
      calories: z.number().optional(),
      allergens: z.array(z.string()).optional(),
    })
    .optional(),
})

interface ItemDrawerProps {
  item: MenuItem | null
  isOpen: boolean
  onClose: () => void
  onSave: (item: MenuItem) => void
  onDelete: (id: string) => void
  categories?: Array<{ id: string; name: string; emoji?: string }>
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
  const timesAfterSelected = timeSlots.slice(selectedIndex)
  const timesBeforeSelected = timeSlots.slice(0, selectedIndex)

  return [...timesAfterSelected, ...timesBeforeSelected]
}

export function ItemDrawer({ item, isOpen, onClose, onSave, onDelete, categories }: ItemDrawerProps) {
  const [activeTab, setActiveTab] = React.useState("basic")
  const [isSaving, setIsSaving] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = React.useState(false)
  const [isClosing, setIsClosing] = React.useState(false)
  const [originalItem, setOriginalItem] = React.useState<MenuItem | null>(null)
  const [currentPhoto, setCurrentPhoto] = React.useState<Photo | undefined>(undefined)
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)
  const [editingCustomizationGroup, setEditingCustomizationGroup] = React.useState<string | null>(null)
  const [showCustomizationDrawer, setShowCustomizationDrawer] = React.useState(false)

  const form = useForm<MenuItem>({
    resolver: zodResolver(menuItemSchema) as any,
    defaultValues: item || {
      id: "",
      name: "",
      description: "",
      price: 0,
      currency: "USD",
      status: "draft" as const,
      categories: [],
      tags: [],
      dietaryTags: [],
      customizationGroups: [],
      availabilityMode: "menu-hours" as const,
      customSchedule: [{ days: [], startTime: "7:00 AM", endTime: "11:00 AM" }],
      nutrition: {},
    },
  })

  const {
    formState: { isDirty },
  } = form

  const {
    fields: scheduleFields,
    append: appendSchedule,
    remove: removeSchedule,
  } = useFieldArray({
    control: form.control,
    name: "customSchedule" as any,
  })

  // Auto-save every 30 seconds
  React.useEffect(() => {
    if (!isDirty || !item) return

    const interval = setInterval(() => {
      console.log("[v0] Auto-saving draft...")
      // Auto-save logic would go here
    }, 30000)

    return () => clearInterval(interval)
  }, [isDirty, item])

  // Reset form when item changes (but not when closing)
  React.useEffect(() => {
    if (isClosing) return // Don't reset form when drawer is closing

    console.log("Form reset effect triggered, item:", item)
    if (item) {
      console.log("Resetting form with item data:", item)
      form.reset(item)

      // Initialize photo state if item has an image
      if (item.image) {
        setCurrentPhoto({
          id: item.id,
          url: item.image,
          thumbnailUrl: item.image,
          status: "approved",
          uploadedAt: new Date(),
          approvedAt: new Date(),
          metadata: {
            size: 0,
            width: 800,
            height: 800,
            format: "jpg",
          },
        })
      } else {
        setCurrentPhoto(undefined)
      }
    } else {
      console.log("Resetting form with default values")
      // Reset to default values for new item
      form.reset({
        id: "",
        name: "",
        description: "",
        price: 0,
        currency: "USD",
        image: "",
        status: "draft",
        categories: [],
        tags: [],
        dietaryTags: [],
        customizationGroups: [],
        availabilityMode: "menu-hours",
        customSchedule: [{ days: [], startTime: "7:00 AM", endTime: "11:00 AM" }],
        soldOutUntil: null,
        nutrition: {
          calories: undefined,
          allergens: [],
        },
      })
      setCurrentPhoto(undefined)
    }
  }, [item, form, isClosing])

  // Reset closing state and store original item when drawer opens
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab("basic") // Reset activeTab to "basic" when drawer opens
      setIsClosing(false)
      setOriginalItem(item)
      setDraggedIndex(null)
      setDragOverIndex(null)
      setEditingCustomizationGroup(null)
      setShowCustomizationDrawer(false)
    }
  }, [isOpen, item])

  React.useEffect(() => {
    if (editingCustomizationGroup) {
      setShowCustomizationDrawer(true)
    }
  }, [editingCustomizationGroup])

  const handleClose = () => {
    if (isDirty) {
      setShowUnsavedModal(true)
      return
    }
    setIsClosing(true)
    onClose()
  }

  const handleDiscardChanges = () => {
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
    console.log("handleSave called with status:", status)
    console.log("Current item:", item)
    console.log("Form state:", form.formState)

    setIsSaving(true)
    try {
      console.log("Triggering form validation...")
      const isValid = await form.trigger()
      console.log("Form validation result:", isValid)

      if (!isValid) {
        const errors = form.formState.errors
        console.log("Form validation errors:", errors)

        // Show specific error messages
        if (errors.categories) {
          toast.error("Please select at least one category")
        } else if (errors.name) {
          toast.error("Please enter a valid name")
        } else if (errors.price) {
          toast.error("Please enter a valid price")
        } else {
          toast.error("Please fix form errors before saving")
        }
        return
      }

      const formData = form.getValues()
      const itemData = {
        ...formData,
        status,
        id: item?.id || Date.now().toString(),
      }

      console.log("Form is dirty:", isDirty)
      console.log("Form data:", formData)
      console.log("Saving item data:", itemData)

      // Call onSave and wait for it to complete
      console.log("Calling onSave with:", itemData)
      await onSave(itemData)
      console.log("onSave completed successfully")

      // Reset form to clean state after successful save
      form.reset()
      toast.success("Item saved successfully!")
    } catch (error) {
      console.error("Save error:", error)
      toast.error("Failed to save item")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = () => {
    if (item) {
      onDelete(item.id)
      onClose()
    }
  }

  // Photo upload handlers
  const handlePhotoUpload = async (file: File) => {
    try {
      // Convert file to data URL for preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        form.setValue("image", imageUrl, { shouldDirty: true, shouldValidate: true })

        // Update photo state for PhotoUpload component
        setCurrentPhoto({
          id: Date.now().toString(),
          url: imageUrl,
          thumbnailUrl: imageUrl,
          status: "approved",
          uploadedAt: new Date(),
          approvedAt: new Date(),
          metadata: {
            size: file.size,
            width: 800,
            height: 800,
            format: file.type.split("/")[1] as "jpg" | "png" | "webp",
          },
        })
      }
      reader.readAsDataURL(file)

      toast.success("Photo uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload photo")
    }
  }

  const handlePhotoReplace = async (file: File) => {
    await handlePhotoUpload(file)
  }

  const handlePhotoRemove = async () => {
    form.setValue("image", "", { shouldDirty: true, shouldValidate: true })
    setCurrentPhoto(undefined)
    toast.success("Photo removed")
  }

  const handlePhotoWithdraw = async () => {
    // For now, just remove the photo
    await handlePhotoRemove()
  }

  const nameValue = form.watch("name")
  const descriptionValue = form.watch("description")
  const statusValue = form.watch("status")
  const availabilityModeValue = form.watch("availabilityMode")
  const dietaryTagsValue = form.watch("dietaryTags")
  const tagsValue = form.watch("tags")
  const customScheduleValue = form.watch("customSchedule")

  const toggleDay = (scheduleIndex: number, day: number) => {
    const currentDays = customScheduleValue?.[scheduleIndex]?.days || []
    const newDays = currentDays.includes(day) ? currentDays.filter((d: number) => d !== day) : [...currentDays, day]
    form.setValue(`customSchedule.${scheduleIndex}.days` as any, newDays, { shouldValidate: true, shouldDirty: true })
  }

  const getDietaryEmoji = (tag: string) => {
    const emojiMap: Record<string, string> = {
      vegetarian: "🥬",
      vegan: "🌱",
      "gluten-free": "🌾",
      "dairy-free": "🥛",
      "nut-free": "🥜",
      "sugar-free": "🍯",
      keto: "🥑",
      paleo: "🥩",
      "low-carb": "🥗",
      "high-protein": "💪",
      organic: "🌿",
      raw: "🥕",
      halal: "☪️",
      kosher: "✡️",
    }
    return emojiMap[tag] || "🥗"
  }

  const getAllergenEmoji = (allergen: string) => {
    const emojiMap: Record<string, string> = {
      nuts: "🥜",
      dairy: "🥛",
      shellfish: "🦐",
      gluten: "🌾",
      soy: "🫘",
      eggs: "🥚",
      peanuts: "🥜",
      "tree nuts": "🌰",
      fish: "🐟",
      sesame: "🌰",
      mustard: "🌶️",
      celery: "🥬",
      lupin: "🫘",
      molluscs: "🐚",
    }
    return emojiMap[allergen.toLowerCase()] || "⚠️"
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent
        side="right"
        className={cn(
          "w-full p-0 flex flex-col h-full",
          "sm:max-w-[480px] md:w-[480px]",
          "max-md:h-screen max-md:rounded-none max-md:border-none",
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-white dark:bg-slate-950">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleClose} className="size-8">
                <X className="size-4" />
              </Button>
              <SheetTitle className="text-lg font-semibold">{originalItem ? "Edit Item" : "New Item"}</SheetTitle>
            </div>

            {item && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Duplicate Item</DropdownMenuItem>
                  <DropdownMenuItem>View History</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={() => setShowDeleteConfirm(true)}>
                    Delete Item
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                <Button size="sm" onClick={() => handleSave("draft")} disabled={isSaving}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
          <div className="sticky top-[55px] z-10 border-b bg-white dark:bg-slate-950">
            <TabsList className="w-full justify-start rounded-none border-0 bg-transparent p-0">
              <TabsTrigger
                value="basic"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600"
              >
                Basic
              </TabsTrigger>
              <TabsTrigger
                value="customizations"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600"
              >
                Customizations
              </TabsTrigger>
              <TabsTrigger
                value="availability"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-600"
              >
                Availability
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* TAB 1: BASIC */}
              <TabsContent value="basic" className="mt-0 space-y-6">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <Label>Photo</Label>
                  <PhotoUpload
                    currentPhoto={currentPhoto}
                    onUpload={handlePhotoUpload}
                    onReplace={handlePhotoReplace}
                    onRemove={handlePhotoRemove}
                    onWithdraw={handlePhotoWithdraw}
                    guidelines={true}
                  />
                </div>

                <Separator />

                {/* Item Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Item Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" placeholder="e.g., Caesar Salad" {...form.register("name")} />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{form.formState.errors.name?.message}</span>
                      <span>{nameValue?.length || 0}/50</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      placeholder="Describe ingredients, portion size..."
                      {...form.register("description")}
                    />
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Best descriptions are 140-260 characters</span>
                      <span>{descriptionValue?.length || 0}/260</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Pricing</h3>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        className="pl-7"
                        {...form.register("price", { valueAsNumber: true })}
                      />
                    </div>
                    <p className="text-xs text-gray-500">Base price for this item</p>
                  </div>
                </div>

                <Separator />

                {/* Categories */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Categories *</h3>
                  <p className="text-sm text-gray-600">Select at least one category</p>
                  {form.watch("categories")?.length === 0 && (
                    <div className="flex items-center gap-2 rounded-md bg-amber-50 dark:bg-amber-950 p-3 text-sm text-amber-900 dark:text-amber-200">
                      <AlertCircle className="size-4" />
                      Item won't be visible to customers without a category
                    </div>
                  )}
                  <CategorySelector
                    categories={(categories || []).map((cat) => ({
                      id: cat.id,
                      label: cat.name,
                      icon: cat.emoji ? () => <span className="text-lg">{cat.emoji}</span> : undefined,
                    }))}
                    selected={form.watch("categories") || []}
                    onChange={(selectedIds) => {
                      form.setValue("categories", selectedIds, { shouldDirty: true, shouldValidate: true })
                    }}
                    placeholder="Search categories..."
                  />
                  {form.formState.errors.categories && (
                    <div className="text-xs text-red-500 mt-1">{form.formState.errors.categories.message}</div>
                  )}
                </div>

                <Separator />

                {/* Tags */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Tags</h3>

                  <div className="space-y-3">
                    <Label>Dietary Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {(["vegetarian", "vegan", "gluten-free"] as const).map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            dietaryTagsValue?.includes(tag) && "border-green-500 bg-green-100 text-green-700",
                          )}
                          onClick={() => {
                            const current = dietaryTagsValue || []
                            if (current.includes(tag)) {
                              form.setValue(
                                "dietaryTags",
                                current.filter((t) => t !== tag),
                                { shouldDirty: true, shouldValidate: true },
                              )
                            } else {
                              form.setValue("dietaryTags", [...current, tag], {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                          }}
                        >
                          {dietaryTagsValue?.includes(tag) && <Check className="mr-0.5 size-3" />}
                          <span className="mr-0.5">{getDietaryEmoji(tag)}</span>
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Attributes</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: "spicy", label: "Spicy", emoji: "🌶️" },
                        { value: "popular", label: "Popular", emoji: "🔥" },
                        { value: "new", label: "New", emoji: "✨" },
                        { value: "chef-pick", label: "Chef's Pick", emoji: "👨‍🍳" },
                      ].map((tag) => (
                        <Button
                          key={tag.value}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(
                            tagsValue?.includes(tag.value) && "border-orange-500 bg-orange-100 text-orange-700",
                          )}
                          onClick={() => {
                            const current = tagsValue || []
                            if (current.includes(tag.value)) {
                              form.setValue(
                                "tags",
                                current.filter((t) => t !== tag.value),
                                { shouldDirty: true, shouldValidate: true },
                              )
                            } else {
                              form.setValue("tags", [...current, tag.value], {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                          }}
                        >
                          {tagsValue?.includes(tag.value) && <Check className="mr-0.5 size-3" />}
                          <span className="mr-0.5">{tag.emoji}</span>
                          {tag.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Nutrition */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Nutrition (Optional)</h3>

                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="e.g., 350"
                      value={form.watch("nutrition.calories") || ""}
                      onChange={(e) =>
                        form.setValue("nutrition.calories", Number.parseInt(e.target.value) || undefined, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Allergens</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Nuts", "Dairy", "Shellfish", "Gluten", "Soy", "Eggs"].map((allergen) => {
                        const allergens = form.watch("nutrition.allergens") || []
                        const isSelected = allergens.includes(allergen.toLowerCase())

                        return (
                          <Button
                            key={allergen}
                            type="button"
                            variant="outline"
                            size="sm"
                            className={cn(isSelected && "border-red-500 bg-red-50 text-red-700")}
                            onClick={() => {
                              if (isSelected) {
                                form.setValue(
                                  "nutrition.allergens",
                                  allergens.filter((a) => a !== allergen.toLowerCase()),
                                  { shouldDirty: true, shouldValidate: true },
                                )
                              } else {
                                form.setValue("nutrition.allergens", [...allergens, allergen.toLowerCase()], {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                })
                              }
                            }}
                          >
                            {isSelected && <Check className="mr-0.5 size-3" />}
                            <span className="mr-0.5">{getAllergenEmoji(allergen)}</span>
                            {allergen}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* TAB 2: CUSTOMIZATIONS */}
              <TabsContent value="customizations" className="mt-0 space-y-6">
                {form.watch("customizationGroups")?.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Settings2 className="mb-4 size-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold">No customizations attached</h3>
                    <p className="mb-6 text-sm text-gray-600">
                      Add customization groups to let customers personalize this item
                    </p>
                    <Button>
                      <Plus className="mr-2 size-4" />
                      Attach First Group
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {form.watch("customizationGroups")?.map((group, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={() => {
                          setDraggedIndex(index)
                        }}
                        onDragEnd={() => {
                          setDraggedIndex(null)
                          setDragOverIndex(null)
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          if (draggedIndex !== null && draggedIndex !== index) {
                            setDragOverIndex(index)
                          }
                        }}
                        onDragLeave={() => {
                          setDragOverIndex(null)
                        }}
                        onDrop={(e) => {
                          e.preventDefault()
                          if (draggedIndex === null || draggedIndex === index) return

                          const groups = form.watch("customizationGroups")
                          const newGroups = [...groups]
                          const draggedItem = newGroups[draggedIndex]
                          newGroups.splice(draggedIndex, 1)
                          newGroups.splice(index, 0, draggedItem)
                          form.setValue("customizationGroups", newGroups, { shouldDirty: true, shouldValidate: true })

                          setDraggedIndex(null)
                          setDragOverIndex(null)
                        }}
                        className={cn(
                          "rounded-lg border p-4 transition-all cursor-move",
                          draggedIndex === index && "opacity-50 scale-95",
                          dragOverIndex === index && draggedIndex !== index && "border-orange-500 bg-orange-50",
                          draggedIndex === null && "hover:border-gray-300 hover:bg-gray-50",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <GripVertical
                            className={cn(
                              "mt-1 size-5 transition-colors cursor-grab active:cursor-grabbing",
                              draggedIndex === index ? "text-orange-500" : "text-gray-400 hover:text-gray-600",
                            )}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{group}</h4>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 hover:bg-orange-100 hover:text-orange-600"
                                  onClick={() => setEditingCustomizationGroup(group)}
                                  title="Configure customization group"
                                >
                                  <Settings2 className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 hover:bg-red-100 hover:text-red-600"
                                  onClick={() => {
                                    const groups = form.watch("customizationGroups")
                                    form.setValue(
                                      "customizationGroups",
                                      groups.filter((_, i) => i !== index),
                                      { shouldDirty: true, shouldValidate: true },
                                    )
                                  }}
                                  title="Remove customization group"
                                >
                                  <X className="size-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full bg-transparent">
                      <Plus className="mr-2 size-4" />
                      Attach Customization Group
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* TAB 3: AVAILABILITY */}
              <TabsContent value="availability" className="mt-0 space-y-6">
                {/* Schedule Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
                      <svg
                        className="size-4 text-blue-600 dark:text-blue-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg">Schedule</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Control when this item is available to customers
                  </p>

                  <RadioGroup
                    value={availabilityModeValue}
                    onValueChange={(value: "menu-hours" | "custom") =>
                      form.setValue("availabilityMode", value, { shouldDirty: true, shouldValidate: true })
                    }
                    className="space-y-3"
                  >
                    {/* Menu Hours Option */}
                    <label
                      htmlFor="menu-hours"
                      className={cn(
                        "flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all",
                        availabilityModeValue === "menu-hours"
                          ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-sm"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-900/50",
                      )}
                    >
                      <RadioGroupItem value="menu-hours" id="menu-hours" className="mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Follow menu hours</span>
                          {availabilityModeValue === "menu-hours" && (
                            <span className="rounded-full bg-orange-100 dark:bg-orange-900 px-2 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-300">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Automatically available during assigned menu schedules
                        </p>
                        <div className="mt-3 space-y-2 rounded-lg bg-white dark:bg-slate-950 p-3 border dark:border-slate-800">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <span className="size-2 rounded-full bg-green-500"></span>
                              Lunch Menu
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">11:00 AM - 4:00 PM</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                              <span className="size-2 rounded-full bg-blue-500"></span>
                              Dinner Menu
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">4:00 PM - 11:00 PM</span>
                          </div>
                        </div>
                      </div>
                    </label>

                    {/* Custom Hours Option */}
                    <label
                      htmlFor="custom"
                      className={cn(
                        "flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all",
                        availabilityModeValue === "custom"
                          ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-sm"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-900/50",
                      )}
                    >
                      <RadioGroupItem value="custom" id="custom" className="mt-1" />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Set custom hours</span>
                          {availabilityModeValue === "custom" && (
                            <span className="rounded-full bg-orange-100 dark:bg-orange-900 px-2 py-0.5 text-xs font-medium text-orange-700 dark:text-orange-300">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Define specific days and times for this item
                        </p>
                      </div>
                    </label>
                  </RadioGroup>

                  {availabilityModeValue === "custom" && (
                    <div className="space-y-4">
                      <div className="rounded-lg border-2 border-orange-200 dark:border-orange-900 bg-orange-50/30 dark:bg-orange-950/20 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">Custom Time Blocks</h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendSchedule({ days: [], startTime: "7:00 AM", endTime: "11:00 AM" })}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Block
                          </Button>
                        </div>

                        {scheduleFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="border rounded-lg p-4 space-y-4 relative bg-white dark:bg-slate-950 dark:border-slate-800"
                          >
                            {scheduleFields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 size-8"
                                onClick={() => removeSchedule(index)}
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
                                    variant={
                                      (customScheduleValue?.[index]?.days || []).includes(dayIndex)
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => toggleDay(index, dayIndex)}
                                  >
                                    {day}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Time Picker */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm">From *</Label>
                                <Select
                                  value={customScheduleValue?.[index]?.startTime}
                                  onValueChange={(value) =>
                                    form.setValue(`customSchedule.${index}.startTime` as any, value, {
                                      shouldValidate: true,
                                      shouldDirty: true,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getOrderedTimeSlots(customScheduleValue?.[index]?.startTime || "").map((time) => (
                                      <SelectItem key={time} value={time}>
                                        {time}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm">To *</Label>
                                <Select
                                  value={customScheduleValue?.[index]?.endTime}
                                  onValueChange={(value) =>
                                    form.setValue(`customSchedule.${index}.endTime` as any, value, {
                                      shouldValidate: true,
                                      shouldDirty: true,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getOrderedTimeSlots(customScheduleValue?.[index]?.endTime || "").map((time) => (
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

                        {/* Schedule Preview */}
                        <div className="bg-white dark:bg-slate-950 rounded-lg p-3 border dark:border-slate-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="size-4 text-gray-600 dark:text-gray-400" />
                            <span className="text-sm font-medium">Preview</span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                            {customScheduleValue?.map((block, index) => {
                              if (!block) return null
                              const dayRanges = (block.days || [])
                                .sort((a: number, b: number) => a - b)
                                .map((d: number) => dayNames[d])
                                .join(", ")
                              return (
                                <p key={index}>
                                  {dayRanges || "No days selected"}: {block.startTime} - {block.endTime}
                                </p>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Status & Visibility Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
                      <svg
                        className="size-4 text-purple-600 dark:text-purple-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.543 7-1.274 4.057-5.064 7-9.543 7-4.477 0-8.268-2.943-9.543-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg">Status & Visibility</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Control how customers see and order this item
                  </p>

                  <RadioGroup
                    value={statusValue}
                    onValueChange={(value: MenuItem["status"]) =>
                      form.setValue("status", value, { shouldDirty: true, shouldValidate: true })
                    }
                    className="space-y-3"
                  >
                    {/* Live Status */}
                    <label
                      htmlFor="live"
                      className={cn(
                        "flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all",
                        statusValue === "live"
                          ? "border-green-500 bg-green-50/50 dark:bg-green-950/20 shadow-sm"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-900/50",
                      )}
                    >
                      <RadioGroupItem value="live" id="live" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex size-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <Check className="size-3.5 text-green-600 dark:text-green-300" />
                          </div>
                          <span className="font-medium">Live</span>
                          {statusValue === "live" && (
                            <span className="rounded-full bg-green-100 dark:bg-green-900 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Visible and available for customers to order now
                        </p>
                      </div>
                    </label>

                    {/* Sold Out Status */}
                    <label
                      htmlFor="soldout"
                      className={cn(
                        "flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all",
                        statusValue === "soldout"
                          ? "border-red-500 bg-red-50/50 dark:bg-red-950/20 shadow-sm"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-900/50",
                      )}
                    >
                      <RadioGroupItem value="soldout" id="soldout" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex size-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                            <X className="size-3.5 text-red-600 dark:text-red-300" />
                          </div>
                          <span className="font-medium">Sold Out</span>
                          {statusValue === "soldout" && (
                            <span className="rounded-full bg-red-100 dark:bg-red-900 px-2 py-0.5 text-xs font-medium text-red-700 dark:text-red-300">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Visible but marked as unavailable for ordering
                        </p>
                        {statusValue === "soldout" && (
                          <div className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-950 p-3 border dark:border-amber-900">
                            <p className="text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2">
                              <AlertCircle className="size-4" />
                              Remember to mark back in stock when available
                            </p>
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Hidden Status */}
                    <label
                      htmlFor="hidden"
                      className={cn(
                        "flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all",
                        statusValue === "hidden"
                          ? "border-gray-500 bg-gray-50/50 dark:bg-gray-900/20 shadow-sm"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-900/50",
                      )}
                    >
                      <RadioGroupItem value="hidden" id="hidden" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex size-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <svg
                              className="size-3.5 text-gray-600 dark:text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29M7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          </div>
                          <span className="font-medium">Hidden</span>
                          {statusValue === "hidden" && (
                            <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Not visible to customers, only visible to staff
                        </p>
                      </div>
                    </label>

                    {/* Draft Status */}
                    <label
                      htmlFor="draft"
                      className={cn(
                        "flex cursor-pointer items-start gap-4 rounded-xl border-2 p-4 transition-all",
                        statusValue === "draft"
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-slate-900/50",
                      )}
                    >
                      <RadioGroupItem value="draft" id="draft" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex size-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                            <svg
                              className="size-3.5 text-blue-600 dark:text-blue-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </div>
                          <span className="font-medium">Draft</span>
                          {statusValue === "draft" && (
                            <span className="rounded-full bg-blue-100 dark:bg-blue-900 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-300">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Work in progress, not published to customers yet
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>

        {/* Footer */}
        <SheetFooter className="sticky bottom-0 border-t bg-white dark:bg-slate-950 p-4">
          <div className="flex w-full gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => handleSave("draft")} disabled={isSaving}>
              Save Draft
            </Button>
            <Button
              className="bg-orange-600 hover:bg-orange-700"
              onClick={() => handleSave("live")}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save & Publish"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        open={showUnsavedModal}
        onOpenChange={setShowUnsavedModal}
        onDiscard={handleDiscardChanges}
        onSave={handleSaveAndClose}
        onCancel={handleCancelUnsaved}
        isSaving={isSaving}
      />

      <CustomizationDrawer
        group={
          editingCustomizationGroup
            ? {
                id: editingCustomizationGroup,
                name: editingCustomizationGroup,
                customerInstructions: "",
                internalNotes: "",
                rules: { min: 0, max: 1, required: false },
                options: [],
                itemCount: 0,
                itemNames: [],
              }
            : null
        }
        isOpen={showCustomizationDrawer}
        onClose={() => {
          setShowCustomizationDrawer(false)
          setEditingCustomizationGroup(null)
        }}
        onSave={(customization) => {
          console.log("[v0] Saved customization:", customization)
          setShowCustomizationDrawer(false)
          setEditingCustomizationGroup(null)
        }}
        onDelete={(id) => {
          console.log("[v0] Deleted customization:", id)
          setShowCustomizationDrawer(false)
          setEditingCustomizationGroup(null)
        }}
      />
    </Sheet>
  )
}
