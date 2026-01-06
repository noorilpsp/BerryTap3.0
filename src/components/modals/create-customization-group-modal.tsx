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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

const customizationGroupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  customerInstructions: z.string().optional(),
  rules: z.object({
    min: z.number().min(0),
    max: z.number().min(1),
    required: z.boolean(),
  }),
  options: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1, "Option name is required"),
      priceDelta: z.number(),
      isDefault: z.boolean(),
      order: z.number(),
    })
  ).min(1, "At least one option is required"),
})

type CustomizationGroupFormData = z.infer<typeof customizationGroupSchema>

interface CreateCustomizationGroupModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (group: CustomizationGroupFormData) => void
}

export function CreateCustomizationGroupModal({ isOpen, onClose, onSave }: CreateCustomizationGroupModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CustomizationGroupFormData>({
    resolver: zodResolver(customizationGroupSchema),
    defaultValues: {
      name: "",
      customerInstructions: "",
      rules: {
        min: 0,
        max: 1,
        required: false,
      },
      options: [
        { id: "option1", name: "Option 1", priceDelta: 0, isDefault: true, order: 1 },
        { id: "option2", name: "Option 2", priceDelta: 2, isDefault: false, order: 2 },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  })

  const onSubmit = async (data: CustomizationGroupFormData) => {
    setIsSubmitting(true)
    try {
      await onSave(data)
      toast.success("Customization group created successfully!")
      form.reset()
      onClose()
    } catch (error) {
      toast.error("Failed to create customization group")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    form.reset()
    onClose()
  }

  const addOption = () => {
    const newId = `option${Date.now()}`
    append({
      id: newId,
      name: "",
      priceDelta: 0,
      isDefault: false,
      order: fields.length + 1,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Create Customization Group</DialogTitle>
          <DialogDescription>Add a new customization group with options and pricing</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
          <form className="space-y-6 py-4">
            {/* Group Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Group Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" placeholder="e.g., Pizza Size, Toppings" autoFocus {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Customer Instructions */}
            <div className="space-y-2">
              <Label htmlFor="instructions">Customer Instructions</Label>
              <Textarea
                id="instructions"
                rows={2}
                placeholder="Instructions for customers (e.g., 'Choose your pizza size')"
                {...form.register("customerInstructions")}
              />
            </div>

            {/* Rules */}
            <div className="space-y-4">
              <Label>Selection Rules</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min">Minimum selections</Label>
                  <Input
                    id="min"
                    type="number"
                    min="0"
                    {...form.register("rules.min", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max">Maximum selections</Label>
                  <Input
                    id="max"
                    type="number"
                    min="1"
                    {...form.register("rules.max", { valueAsNumber: true })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="required"
                  {...form.register("rules.required")}
                />
                <Label htmlFor="required">Required selection</Label>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Options</Label>
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Option {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Option Name</Label>
                        <Input
                          placeholder="e.g., Small, Medium, Large"
                          {...form.register(`options.${index}.name`)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price Delta</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            className="pl-7"
                            {...form.register(`options.${index}.priceDelta`, { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        {...form.register(`options.${index}.isDefault`)}
                      />
                      <Label>Default option</Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6">
          <Button variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
