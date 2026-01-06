"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight, X, Check, CheckCircle, XCircle, AlertTriangle, CalendarIcon, Clock, Euro, Percent, Target, Users, Save, Rocket, Eye, BarChart3, Copy, Sparkles, Beer, Gift, UserPlus, Award, UtensilsCrossed, Coffee, GraduationCap, Moon, Loader2 } from 'lucide-react'
import { promotionTemplates } from "@/lib/promotion-templates"
import { useIsMobile } from "@/hooks/use-mobile"

interface CreatePromotionWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FormData {
  name: string
  description: string
  type: "percentage" | "fixed" | "bogo" | "happy_hour"
  discountValue: number
  discountUnit: string
  targetType: "category" | "items" | "entire_order"
  targetCategory: string
  selectedItems: string[]
  minOrderAmount: number
  eligibility: string
  startDate: Date
  endDate: Date
  startTime: string
  endTime: string
  recurring: boolean
  recurringType: string
  activeDays: string[]
  timeRestricted: boolean
  maxRedemptions: number
  perCustomerLimit: number
  perCustomerPeriod: string
  budgetCap: number
  budgetCapEnabled: boolean
  autoPause: boolean
  budgetAlert: boolean
  pushNotification: boolean
  displayOnMenus: boolean
}

const initialFormData: FormData = {
  name: "",
  description: "",
  type: "percentage",
  discountValue: 0,
  discountUnit: "%",
  targetType: "category",
  targetCategory: "",
  selectedItems: [],
  minOrderAmount: 0,
  eligibility: "all_customers",
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  startTime: "00:00",
  endTime: "23:59",
  recurring: false,
  recurringType: "daily",
  activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
  timeRestricted: false,
  maxRedemptions: 500,
  perCustomerLimit: 1,
  perCustomerPeriod: "day",
  budgetCap: 2000,
  budgetCapEnabled: false,
  autoPause: false,
  budgetAlert: false,
  pushNotification: false,
  displayOnMenus: false,
}

const steps = [
  { id: 1, name: "Details", label: "Promotion Details" },
  { id: 2, name: "Target", label: "Target Items" },
  { id: 3, name: "Schedule", label: "Schedule & Timing" },
  { id: 4, name: "Preview", label: "Preview & Details" },
  { id: 5, name: "Confirm", label: "Confirm & Launch" },
]

const categoryItems = {
  "Draft Beers": [
    { id: "item_001", name: "Pilsner Draft", price: 5.0 },
    { id: "item_002", name: "IPA Draft", price: 5.0 },
    { id: "item_003", name: "Wheat Beer", price: 5.0 },
    { id: "item_004", name: "Lager Draft", price: 5.0 },
    { id: "item_005", name: "Stout", price: 5.5 },
    { id: "item_006", name: "Pale Ale", price: 5.0 },
    { id: "item_007", name: "Amber Ale", price: 5.0 },
    { id: "item_008", name: "Porter", price: 5.5 },
  ],
  Beverages: [
    { id: "item_009", name: "Coca Cola", price: 3.0 },
    { id: "item_010", name: "Sprite", price: 3.0 },
    { id: "item_011", name: "Orange Juice", price: 4.0 },
    { id: "item_012", name: "Iced Tea", price: 3.5 },
  ],
  Pizza: [
    { id: "item_013", name: "Margherita", price: 12.0 },
    { id: "item_014", name: "Pepperoni", price: 14.0 },
    { id: "item_015", name: "Quattro Formaggi", price: 15.0 },
  ],
}

const iconMap: Record<string, any> = {
  Beer,
  Gift,
  UserPlus,
  Award,
  UtensilsCrossed,
  Coffee,
  GraduationCap,
  Moon,
}

export function CreatePromotionWizard({ open, onOpenChange }: CreatePromotionWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isMobile = useIsMobile()

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const applyTemplate = (template: typeof promotionTemplates[0]) => {
    const presets = template.presets
    updateFormData({
      name: presets.name,
      description: presets.description,
      type: presets.type,
      discountValue: presets.discountValue,
      discountUnit: presets.discountUnit,
      targetType: presets.targetType as any,
      targetCategory: presets.targetCategory || "",
      minOrderAmount: presets.minOrderAmount || 0,
      startTime: presets.startTime,
      endTime: presets.endTime,
      recurring: presets.recurring,
      recurringType: presets.recurringType || "daily",
      activeDays: presets.activeDays,
      maxRedemptions: presets.maxRedemptions || 500,
      perCustomerLimit: presets.perCustomerLimit || 1,
      perCustomerPeriod: presets.perCustomerPeriod || "day",
      eligibility: presets.eligibility || "all_customers",
    })
    setTimeout(() => setCurrentStep(2), 300)
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.name || formData.name.length < 3) {
        newErrors.name = "Name must be at least 3 characters"
      }
      if (formData.discountValue <= 0) {
        newErrors.discountValue = "Discount must be greater than 0"
      }
      if (formData.type === "percentage" && formData.discountValue > 100) {
        newErrors.discountValue = "Percentage cannot exceed 100%"
      }
    }

    if (step === 2) {
      if (formData.targetType === "category" && !formData.targetCategory) {
        newErrors.targetCategory = "Please select a category"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveDraft = () => {
    console.log("[v0] Saving draft:", formData)
    onOpenChange(false)
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setShowSuccess(true)
    }, 1500)
  }

  const handleCloseSuccess = () => {
    setShowSuccess(false)
    onOpenChange(false)
    setCurrentStep(1)
    setFormData(initialFormData)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1Details formData={formData} updateFormData={updateFormData} errors={errors} applyTemplate={applyTemplate} />
      case 2:
        return <Step2Target formData={formData} updateFormData={updateFormData} errors={errors} />
      case 3:
        return <Step3Schedule formData={formData} updateFormData={updateFormData} />
      case 4:
        return <Step4Preview formData={formData} updateFormData={updateFormData} />
      case 5:
        return <Step5Confirm formData={formData} updateFormData={updateFormData} />
      default:
        return null
    }
  }

  const progressPercent = (currentStep / 5) * 100

  const content = (
    <div className="flex flex-col h-full max-h-[calc(90vh-4rem)]">
      {/* Progress Indicator - Fixed height, no shrink */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                    currentStep > step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.id
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "border-2 border-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span className={cn("text-xs mt-1 hidden md:block", currentStep === step.id ? "font-medium" : "text-muted-foreground")}>
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn("w-12 md:w-20 h-0.5 mx-2", currentStep > step.id ? "bg-primary" : "bg-muted")} />
              )}
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Step {currentStep} of {steps.length}
        </p>
      </div>

      <Separator className="flex-shrink-0" />

      {/* Step Content - Scrollable area with flex-1 to take remaining space */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto">{renderStepContent()}</div>
      </div>

      <Separator className="flex-shrink-0" />

      {/* Footer - Fixed height, no shrink */}
      <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 1 || isSubmitting}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        <div className="flex gap-2">
          {currentStep < 5 && (
            <Button variant="ghost" onClick={handleSaveDraft} disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          )}
          {currentStep < 5 ? (
            <Button onClick={handleNext}>
              Next: {steps[currentStep]?.name}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating promotion...
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 mr-2" />
                  Launch Promotion
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  if (showSuccess) {
    return (
      <Dialog open={showSuccess} onOpenChange={handleCloseSuccess}>
        <DialogContent className="max-w-2xl">
          <SuccessConfirmation promotionName={formData.name} onClose={handleCloseSuccess} />
        </DialogContent>
      </Dialog>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] p-0 flex flex-col">
          <SheetHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle>Create Promotion</SheetTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleSaveDraft}>
                  Draft
                </Button>
              </div>
            </div>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] h-[90vh] p-0 flex flex-col">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle>Create New Promotion</DialogTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
            </div>
          </div>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}

function Step1Details({
  formData,
  updateFormData,
  errors,
  applyTemplate,
}: {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  errors: Record<string, string>
  applyTemplate: (template: any) => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Step 1: Promotion Details</h3>
        <p className="text-sm text-muted-foreground">Start from a template or create from scratch</p>
      </div>

      {/* Template Gallery */}
      <div>
        <Label className="mb-3 block">Choose a Template</Label>
        <ScrollArea className="w-full">
          <div className="flex gap-4 pb-4">
            {promotionTemplates.map((template) => {
              const Icon = iconMap[template.icon]
              return (
                <Card
                  key={template.id}
                  className="min-w-[200px] cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                  onClick={() => applyTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-2xl">{template.emoji}</div>
                      <Badge variant="secondary" className="text-xs">
                        {template.popularity}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <div className="text-sm">
                      <strong>{template.presets.discountValue}{template.presets.discountUnit}</strong> off
                    </div>
                    <div className="flex gap-2 text-xs text-muted-foreground">
                      <span>ROI: {template.estimatedROI}</span>
                      <span>•</span>
                      <span>{template.avgRedemptionRate} rate</span>
                    </div>
                    <Button size="sm" className="w-full" variant="secondary">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-sm text-muted-foreground">OR create from scratch</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="promo-name" className="required">
            Promotion Name
          </Label>
          <Input
            id="promo-name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder="Happy Hour 20% Off Draft Beers"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : "name-desc"}
          />
          {errors.name ? (
            <p id="name-error" className="text-sm text-destructive flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              {errors.name}
            </p>
          ) : (
            <p id="name-desc" className="text-sm text-muted-foreground">
              Give your promotion a clear, descriptive name
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="promo-description">Description (optional)</Label>
          <Textarea
            id="promo-description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Daily happy hour discount on all draft beers to drive early evening traffic and increase beverage sales."
            maxLength={200}
            rows={3}
          />
          <p className="text-sm text-muted-foreground">{formData.description.length} / 200 characters</p>
        </div>

        <div className="space-y-2">
          <Label>Promotion Type</Label>
          <RadioGroup value={formData.type} onValueChange={(value: any) => updateFormData({ type: value, discountUnit: value === "percentage" ? "%" : "€" })}>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="type-percentage" />
                <Label htmlFor="type-percentage" className="cursor-pointer">
                  Percentage Discount
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="type-fixed" />
                <Label htmlFor="type-fixed" className="cursor-pointer">
                  Fixed Amount Discount
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bogo" id="type-bogo" />
                <Label htmlFor="type-bogo" className="cursor-pointer">
                  BOGO (Buy One Get One)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="happy_hour" id="type-happy" />
                <Label htmlFor="type-happy" className="cursor-pointer">
                  Happy Hour Special
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="discount-value">Discount Amount</Label>
          <div className="flex gap-2">
            <Input
              id="discount-value"
              type="number"
              value={formData.discountValue || ""}
              onChange={(e) => updateFormData({ discountValue: parseFloat(e.target.value) || 0 })}
              className="flex-1"
              min="0"
              max={formData.type === "percentage" ? "100" : "1000"}
              aria-invalid={!!errors.discountValue}
            />
            <Select value={formData.discountUnit} onValueChange={(value) => updateFormData({ discountUnit: value })}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="%">% off</SelectItem>
                <SelectItem value="€">€ off</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {errors.discountValue ? (
            <p className="text-sm text-destructive flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              {errors.discountValue}
            </p>
          ) : formData.discountValue > 0 ? (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Looks good! {formData.discountValue}
              {formData.discountUnit} discount will be applied
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function Step2Target({
  formData,
  updateFormData,
  errors,
}: {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  errors: Record<string, string>
}) {
  const items = formData.targetCategory ? categoryItems[formData.targetCategory as keyof typeof categoryItems] || [] : []

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Step 2: Target Items</h3>
        <p className="text-sm text-muted-foreground">What should this promotion apply to?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Target Type</Label>
          <RadioGroup value={formData.targetType} onValueChange={(value: any) => updateFormData({ targetType: value })}>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="category" id="target-category" />
                <Label htmlFor="target-category" className="cursor-pointer">
                  Specific Category
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="items" id="target-items" />
                <Label htmlFor="target-items" className="cursor-pointer">
                  Specific Items
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="entire_order" id="target-order" />
                <Label htmlFor="target-order" className="cursor-pointer">
                  Entire Order
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {formData.targetType === "category" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="category-select">Select Category</Label>
              <Select value={formData.targetCategory} onValueChange={(value) => updateFormData({ targetCategory: value })}>
                <SelectTrigger id="category-select" aria-invalid={!!errors.targetCategory}>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft Beers">🍺 Draft Beers</SelectItem>
                  <SelectItem value="Beverages">🥤 Beverages</SelectItem>
                  <SelectItem value="Pizza">🍕 Pizza</SelectItem>
                  <SelectItem value="Brunch Items">☕ Brunch Items</SelectItem>
                </SelectContent>
              </Select>
              {errors.targetCategory && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.targetCategory}
                </p>
              )}
            </div>

            {formData.targetCategory && items.length > 0 && (
              <div className="space-y-2">
                <Label>Items in this category ({items.length} items)</Label>
                <Card>
                  <CardContent className="p-4 space-y-2">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          <Checkbox checked={true} />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">€{item.price.toFixed(2)}</span>
                          <Select defaultValue="all">
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Applies to all</SelectItem>
                              <SelectItem value="size-s">Small only</SelectItem>
                              <SelectItem value="size-m">Medium only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="min-order">Minimum Order Amount (optional)</Label>
          <div className="flex items-center gap-2">
            <Euro className="h-4 w-4 text-muted-foreground" />
            <Input
              id="min-order"
              type="number"
              value={formData.minOrderAmount || ""}
              onChange={(e) => updateFormData({ minOrderAmount: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              min="0"
            />
          </div>
          <p className="text-sm text-muted-foreground">{formData.minOrderAmount > 0 ? `Requires €${formData.minOrderAmount} minimum` : "No minimum"}</p>
        </div>

        <div className="space-y-2">
          <Label>Customer Eligibility</Label>
          <RadioGroup value={formData.eligibility} onValueChange={(value) => updateFormData({ eligibility: value })}>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all_customers" id="elig-all" />
                <Label htmlFor="elig-all" className="cursor-pointer">
                  All Customers
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new_customers_only" id="elig-new" />
                <Label htmlFor="elig-new" className="cursor-pointer">
                  New Customers Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="repeat_customers" id="elig-repeat" />
                <Label htmlFor="elig-repeat" className="cursor-pointer">
                  Repeat Customers
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vip_loyalty_members" id="elig-vip" />
                <Label htmlFor="elig-vip" className="cursor-pointer">
                  VIP/Loyalty Members
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  )
}

function Step3Schedule({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) {
  const duration = Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Step 3: Schedule</h3>
        <p className="text-sm text-muted-foreground">When should this promotion run?</p>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date & Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.startDate, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={formData.startDate} onSelect={(date) => date && updateFormData({ startDate: date })} />
              </PopoverContent>
            </Popover>
            <Input type="time" value={formData.startTime} onChange={(e) => updateFormData({ startTime: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label>End Date & Time</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.endDate, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={formData.endDate} onSelect={(date) => date && updateFormData({ endDate: date })} />
              </PopoverContent>
            </Popover>
            <Input type="time" value={formData.endTime} onChange={(e) => updateFormData({ endTime: e.target.value })} />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">Duration: {duration} days</p>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="recurring" checked={formData.recurring} onCheckedChange={(checked) => updateFormData({ recurring: checked as boolean })} />
            <Label htmlFor="recurring" className="cursor-pointer">
              Repeat this promotion
            </Label>
          </div>

          {formData.recurring && (
            <Select value={formData.recurringType} onValueChange={(value) => updateFormData({ recurringType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-2">
          <Label>Active Days</Label>
          <div className="flex flex-wrap gap-2">
            {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => {
              const isActive = formData.activeDays.includes(day)
              return (
                <Button
                  key={day}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newDays = isActive ? formData.activeDays.filter((d) => d !== day) : [...formData.activeDays, day]
                    updateFormData({ activeDays: newDays })
                  }}
                >
                  {day.slice(0, 3)}
                </Button>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="time-restricted"
              checked={formData.timeRestricted}
              onCheckedChange={(checked) => updateFormData({ timeRestricted: checked as boolean })}
            />
            <Label htmlFor="time-restricted" className="cursor-pointer">
              Only during specific hours
            </Label>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h4 className="font-medium">Redemption Limits</h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="max-redemptions">Limit total redemptions</Label>
              <Input
                id="max-redemptions"
                type="number"
                value={formData.maxRedemptions}
                onChange={(e) => updateFormData({ maxRedemptions: parseInt(e.target.value) || 0 })}
                className="w-32"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label>Limit per customer:</Label>
            <Input
              type="number"
              value={formData.perCustomerLimit}
              onChange={(e) => updateFormData({ perCustomerLimit: parseInt(e.target.value) || 1 })}
              className="w-20"
              min="1"
            />
            <span className="text-sm text-muted-foreground">per</span>
            <Select value={formData.perCustomerPeriod} onValueChange={(value) => updateFormData({ perCustomerPeriod: value })}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">day</SelectItem>
                <SelectItem value="week">week</SelectItem>
                <SelectItem value="month">month</SelectItem>
                <SelectItem value="lifetime">lifetime</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="budget-cap"
                checked={formData.budgetCapEnabled}
                onCheckedChange={(checked) => updateFormData({ budgetCapEnabled: checked as boolean })}
              />
              <Label htmlFor="budget-cap" className="cursor-pointer">
                Stop when discount reaches:
              </Label>
              {formData.budgetCapEnabled && (
                <div className="flex items-center gap-1">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={formData.budgetCap}
                    onChange={(e) => updateFormData({ budgetCap: parseFloat(e.target.value) || 0 })}
                    className="w-32"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Conflict Warning */}
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>CONFLICT WARNING</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>This promotion overlaps with "Weekend Brunch 15% Off" (Nov 25-30) on Saturdays and Sundays. Customers may be confused about which discount applies.</p>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline">
                View Conflicts
              </Button>
              <Button size="sm" variant="outline">
                Adjust Schedule
              </Button>
              <Button size="sm">Continue Anyway</Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

function Step4Preview({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) {
  const duration = Math.ceil((formData.endDate.getTime() - formData.startDate.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Step 4: Preview</h3>
        <p className="text-sm text-muted-foreground">Review how your promotion will appear to customers</p>
      </div>

      {/* Customer View Preview */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">CUSTOMER VIEW PREVIEW</CardTitle>
        </CardHeader>
        <CardContent>
          <Card className="bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-2 border-primary/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-primary">SPECIAL OFFER</span>
              </div>
              <h3 className="text-2xl font-bold">{formData.name || "Your Promotion"}</h3>
              <p className="text-lg">
                Get <strong>{formData.discountValue}{formData.discountUnit}</strong> {formData.targetType === "category" ? `on ${formData.targetCategory}` : "off"}
              </p>
              {formData.recurring && (
                <p className="text-sm text-muted-foreground">
                  {formData.recurringType === "daily" ? "Daily" : formData.recurringType === "weekly" ? "Weekly" : "Monthly"} from {formData.startTime} -{" "}
                  {formData.endTime}
                </p>
              )}
              <div className="space-y-1 text-sm">
                <p>
                  Valid: {format(formData.startDate, "MMM d")} - {format(formData.endDate, "MMM d, yyyy")}
                </p>
                <Separator />
                <p>
                  Limited to {formData.perCustomerLimit} use per customer per {formData.perCustomerPeriod}
                </p>
                <p>{formData.maxRedemptions} total redemptions available</p>
              </div>
              <Button className="w-full">Apply to Order</Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Promotion Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Promotion Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium">
              {formData.type === "percentage" ? "Percentage" : formData.type === "fixed" ? "Fixed" : "BOGO"} Discount ({formData.discountValue}
              {formData.discountUnit})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Target:</span>
            <span className="font-medium">
              {formData.targetType === "category" ? `Category → ${formData.targetCategory}` : formData.targetType === "items" ? "Specific Items" : "Entire Order"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Schedule:</span>
            <span className="font-medium">
              {formData.recurring ? `${formData.recurringType}, ` : ""}
              {formData.startTime} - {formData.endTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">
              {format(formData.startDate, "MMM d")} - {format(formData.endDate, "MMM d, yyyy")} ({duration} days)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Limits:</span>
            <span className="font-medium">
              {formData.maxRedemptions} total, {formData.perCustomerLimit} per customer per {formData.perCustomerPeriod}
            </span>
          </div>
          {formData.budgetCapEnabled && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-medium">€{formData.budgetCap} cap</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Eligibility:</span>
            <span className="font-medium">{formData.eligibility.replace(/_/g, " ")}</span>
          </div>
        </CardContent>
      </Card>

      {/* Projected Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Projected Performance</CardTitle>
          <CardDescription>Based on similar past promotions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Estimated Redemptions:</span>
              <span className="font-medium">380-450 (76-90%)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Projected Revenue Impact:</span>
              <span className="font-medium text-green-600">+€1,100 - €1,400</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Expected ROI:</span>
              <span className="font-medium">2.8x - 3.5x</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Confidence:</span>
              <span className="font-medium">Medium (65%)</span>
            </div>
          </div>
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>Tip: Similar promotions performed best on Fridays and Saturdays</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Settings (optional)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox id="auto-pause" checked={formData.autoPause} onCheckedChange={(checked) => updateFormData({ autoPause: checked as boolean })} />
            <Label htmlFor="auto-pause" className="cursor-pointer text-sm">
              Automatically pause when budget is reached
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="budget-alert" checked={formData.budgetAlert} onCheckedChange={(checked) => updateFormData({ budgetAlert: checked as boolean })} />
            <Label htmlFor="budget-alert" className="cursor-pointer text-sm">
              Send email notification when 80% of budget used
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="push-notification"
              checked={formData.pushNotification}
              onCheckedChange={(checked) => updateFormData({ pushNotification: checked as boolean })}
            />
            <Label htmlFor="push-notification" className="cursor-pointer text-sm">
              Notify customers via push notification
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="display-menus"
              checked={formData.displayOnMenus}
              onCheckedChange={(checked) => updateFormData({ displayOnMenus: checked as boolean })}
            />
            <Label htmlFor="display-menus" className="cursor-pointer text-sm">
              Display on digital menu boards
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Step5Confirm({ formData, updateFormData }: { formData: FormData; updateFormData: (updates: Partial<FormData>) => void }) {
  const [launchOption, setLaunchOption] = useState<string>("immediate")

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Step 5: Confirm</h3>
        <p className="text-sm text-muted-foreground">You're all set! Review and launch your promotion.</p>
      </div>

      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">All required information provided</span>
          </div>
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">No conflicts detected</span>
          </div>
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Budget limits configured</span>
          </div>
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Preview looks great</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Label>Launch Options</Label>
        <RadioGroup value={launchOption} onValueChange={setLaunchOption}>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="immediate" id="launch-immediate" />
              <Label htmlFor="launch-immediate" className="cursor-pointer">
                Launch immediately (promotion goes live now)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="scheduled" id="launch-scheduled" />
              <Label htmlFor="launch-scheduled" className="cursor-pointer">
                Schedule for start date (goes live {format(formData.startDate, "MMM d")} at {formData.startTime})
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="draft" id="launch-draft" />
              <Label htmlFor="launch-draft" className="cursor-pointer">
                Save as draft (review and launch later)
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label>Team Notifications</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="notify-kitchen" defaultChecked />
            <Label htmlFor="notify-kitchen" className="cursor-pointer text-sm">
              Notify kitchen staff
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="notify-foh" defaultChecked />
            <Label htmlFor="notify-foh" className="cursor-pointer text-sm">
              Notify front-of-house staff
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="notify-managers" defaultChecked />
            <Label htmlFor="notify-managers" className="cursor-pointer text-sm">
              Notify managers
            </Label>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground space-y-1">
          <p>By creating this promotion, you confirm that:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Pricing and terms are accurate</li>
            <li>You have authority to create this promotion</li>
            <li>Terms comply with local regulations</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function SuccessConfirmation({ promotionName, onClose }: { promotionName: string; onClose: () => void }) {
  return (
    <div className="p-6 space-y-6 text-center">
      <div className="flex justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
            <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-ping" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Success!</h2>
        <p className="text-muted-foreground">Your promotion has been created and launched</p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 space-y-2">
          <h3 className="text-xl font-semibold">{promotionName}</h3>
          <div className="flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium">Status: Active - Live now</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-sm">View Live Promotion</CardTitle>
            <CardDescription className="text-xs">See how it appears to customers</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" size="sm" className="w-full">
              View Promotion →
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-sm">Track Performance</CardTitle>
            <CardDescription className="text-xs">Monitor real-time redemptions</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" size="sm" className="w-full">
              View Analytics →
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <Copy className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-sm">Duplicate Promotion</CardTitle>
            <CardDescription className="text-xs">Create a similar promotion</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" size="sm" className="w-full">
              Duplicate →
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex justify-center mb-2">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-sm">Create Another</CardTitle>
            <CardDescription className="text-xs">Start fresh with a new promotion</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" size="sm" className="w-full">
              New Promotion →
            </Button>
          </CardContent>
        </Card>
      </div>

      <Button onClick={onClose} className="w-full">
        Close
      </Button>
    </div>
  )
}
