"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Upload, ChevronDown, Plus } from "lucide-react"
import { toast } from "sonner"
import type { MenuItem } from "@/types/menu-item"

const itemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  price: z.number().min(0.01, "Price must be greater than 0"),
  category: z.string().min(1, "At least one category is required"),
  photo: z.string().optional(),
  status: z.enum(["live", "draft", "hidden", "soldout"]),
  dietaryTags: z.array(z.string()),
  attributeTags: z.array(z.string()),
})

type ItemFormData = z.infer<typeof itemSchema>

interface CreateItemModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (item: Partial<MenuItem>) => void
  defaultCategory?: string
  onCreateCategory?: () => void
  categories?: Array<{ id: string; name: string }>
}

const dietaryTags = ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free"]
const attributeTags = ["Spicy", "Popular", "New", "Chef's Pick"]

export function CreateItemModal({ isOpen, onClose, onSave, defaultCategory, onCreateCategory, categories }: CreateItemModalProps) {
  const [isQuickOptionsOpen, setIsQuickOptionsOpen] = useState(false)
  const [descriptionLength, setDescriptionLength] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string>()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: defaultCategory || "",
      status: "draft",
      dietaryTags: [],
      attributeTags: [],
    },
  })

  const selectedDietaryTags = watch("dietaryTags") || []
  const selectedAttributeTags = watch("attributeTags") || []
  const description = watch("description") || ""

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
        setValue("photo", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: ItemFormData, publishImmediately: boolean) => {
    setIsSubmitting(true)
    try {
      const item: Partial<MenuItem> = {
        name: data.name,
        description: data.description,
        price: data.price,
        categories: [data.category],
        image: data.photo,
        status: publishImmediately ? "live" : data.status,
        dietaryTags: data.dietaryTags as Array<"vegetarian" | "vegan" | "gluten-free">,
        tags: data.attributeTags,
        currency: "USD",
      }

      await onSave(item)
      toast.success(publishImmediately ? "Item created and published!" : "Item saved as draft")
      reset()
      setPhotoPreview(undefined)
      onClose()
    } catch (error) {
      toast.error("Failed to create item")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    setPhotoPreview(undefined)
    setDescriptionLength(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>Add a new item to your menu</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
          <form className="space-y-6 py-4">
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" placeholder="e.g., Caesar Salad" autoFocus {...register("name")} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Describe ingredients, portion size, and preparation method..."
                maxLength={260}
                {...register("description")}
                onChange={(e) => {
                  register("description").onChange(e)
                  setDescriptionLength(e.target.value.length)
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Best descriptions are 140-260 characters</span>
                <span>{descriptionLength}/260</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">
                Price <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  className="pl-7"
                  {...register("price", { valueAsNumber: true })}
                />
              </div>
              {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select onValueChange={(value) => setValue("category", value)} defaultValue={defaultCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {(categories || []).map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {onCreateCategory && (
                <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={onCreateCategory}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Category
                </Button>
              )}
              {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Photo (optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                {photoPreview ? (
                  <div className="space-y-2">
                    <img
                      src={photoPreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPhotoPreview(undefined)
                        setValue("photo", undefined)
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <label htmlFor="photo" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">Drag & drop or click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">Recommended: 800×800px, JPG or PNG</p>
                    <input id="photo" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                )}
              </div>
            </div>

            {/* Quick Options (Collapsible) */}
            <Collapsible open={isQuickOptionsOpen} onOpenChange={setIsQuickOptionsOpen}>
              <CollapsibleTrigger asChild>
                <Button type="button" variant="ghost" className="w-full justify-between">
                  Quick Options
                  <ChevronDown className={`w-4 h-4 transition-transform ${isQuickOptionsOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    onValueChange={(value) => setValue("status", value as ItemFormData["status"])}
                    defaultValue="draft"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                      <SelectItem value="soldout">Sold Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dietary Tags */}
                <div className="space-y-2">
                  <Label>Dietary Tags</Label>
                  <div className="space-y-2">
                    {dietaryTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dietary-${tag}`}
                          checked={selectedDietaryTags.includes(tag)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setValue("dietaryTags", [...selectedDietaryTags, tag])
                            } else {
                              setValue(
                                "dietaryTags",
                                selectedDietaryTags.filter((t) => t !== tag),
                              )
                            }
                          }}
                        />
                        <Label htmlFor={`dietary-${tag}`} className="font-normal cursor-pointer">
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attribute Tags */}
                <div className="space-y-2">
                  <Label>Attributes</Label>
                  <div className="space-y-2">
                    {attributeTags.map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`attribute-${tag}`}
                          checked={selectedAttributeTags.includes(tag)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setValue("attributeTags", [...selectedAttributeTags, tag])
                            } else {
                              setValue(
                                "attributeTags",
                                selectedAttributeTags.filter((t) => t !== tag),
                              )
                            }
                          }}
                        />
                        <Label htmlFor={`attribute-${tag}`} className="font-normal cursor-pointer">
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6 flex-row justify-between">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleSubmit((data) => onSubmit(data, false))} disabled={isSubmitting}>
              Save as Draft
            </Button>
            <Button onClick={handleSubmit((data) => onSubmit(data, true))} disabled={isSubmitting}>
              Create & Publish
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
