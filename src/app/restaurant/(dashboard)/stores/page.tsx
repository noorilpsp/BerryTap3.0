"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Save,
  X,
  MapPin,
  Clock,
  Globe,
  Settings,
  Eye,
  Zap,
  StoreIcon,
  Palette,
  Upload,
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Zod Schema
const storeInfoSchema = z.object({
  storeName: z.string().min(1, "Store name is required").max(100),
  storeType: z.enum(["restaurant", "bar", "cafe", "grocery", "other"]),
  shortDescription: z.string().max(300).optional(),
  storeSlug: z
    .string()
    .min(1, "Store URL is required")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens"),
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    apartment: z.string().optional(),
    postalCode: z.string().min(1, "Postal code is required"),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
  }),
  phoneNumber: z.string().min(1, "Phone number is required"),
  publicEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  useBusinessEmail: z.boolean(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  openingHours: z.array(
    z.object({
      day: z.number(),
      closed: z.boolean(),
      shifts: z.array(
        z.object({
          open: z.string(),
          close: z.string(),
        }),
      ),
    }),
  ),
  enableTables: z.boolean(),
  enableReservations: z.boolean(),
  requirePrepayment: z.boolean(),
  maxPartySize: z.number().min(1).max(50),
  bookingWindow: z.number().min(1).max(90),
  enableOnlineOrders: z.boolean(),
  orderModes: z.object({
    dineIn: z.boolean(),
    pickup: z.boolean(),
    delivery: z.boolean(),
  }),
  deliveryRadius: z.number().optional(),
  deliveryFee: z.number().optional(),
  minimumOrder: z.number().optional(),
  storeStatus: z.enum(["active", "inactive", "coming-soon"]),
  publicListing: z.boolean(),
  timezone: z.string(),
  useBusinessTimezone: z.boolean(),
  useCustomLogo: z.boolean(),
  useCustomBanner: z.boolean(),
  useCustomAccentColor: z.boolean(),
  accentColor: z.string().optional(),
})

type StoreInfoFormData = z.infer<typeof storeInfoSchema>

const storeTypes = [
  { value: "restaurant", label: "Restaurant", icon: "🍽️" },
  { value: "bar", label: "Bar", icon: "🍺" },
  { value: "cafe", label: "Café", icon: "☕" },
  { value: "grocery", label: "Grocery", icon: "🛒" },
  { value: "other", label: "Other", icon: "🏪" },
]

const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = i % 2 === 0 ? "00" : "30"
  return `${hour.toString().padStart(2, "0")}:${minute}`
})

const timezones = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
]

const countries = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "FR", label: "France" },
  { value: "DE", label: "Germany" },
  { value: "ES", label: "Spain" },
  { value: "IT", label: "Italy" },
  { value: "NL", label: "Netherlands" },
  { value: "BE", label: "Belgium" },
]

const commonPresets = [
  { name: "Restaurant hours (11:00-23:00)", open: "11:00", close: "23:00" },
  { name: "Bar hours (16:00-02:00)", open: "16:00", close: "02:00" },
  { name: "24/7 convenience store", open: "00:00", close: "23:59" },
]

export default function StoresPage() {
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [urlCopied, setUrlCopied] = useState(false)
  const [showSocialMedia, setShowSocialMedia] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>("")
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const form = useForm<StoreInfoFormData>({
    resolver: zodResolver(storeInfoSchema),
    defaultValues: {
      storeName: "Sunrise Bar – Center",
      storeType: "bar",
      shortDescription: "Cozy bar in the city center with craft cocktails and local beers",
      storeSlug: "sunrise-center",
      address: {
        street: "123 Main Street",
        apartment: "",
        postalCode: "10001",
        city: "New York",
        country: "US",
      },
      phoneNumber: "+1 (555) 123-4567",
      publicEmail: "hello@sunrise-bar.com",
      useBusinessEmail: false,
      website: "https://sunrise-bar.com",
      instagram: "@sunrisebar",
      facebook: "",
      openingHours: dayNames.map((_, index) => ({
        day: index,
        closed: false,
        shifts: [{ open: "11:00", close: "23:00" }],
      })),
      enableTables: true,
      enableReservations: true,
      requirePrepayment: false,
      maxPartySize: 12,
      bookingWindow: 30,
      enableOnlineOrders: true,
      orderModes: {
        dineIn: true,
        pickup: true,
        delivery: false,
      },
      deliveryRadius: 5,
      deliveryFee: 5.99,
      minimumOrder: 15,
      storeStatus: "active",
      publicListing: true,
      timezone: "America/New_York",
      useBusinessTimezone: true,
      useCustomLogo: false,
      useCustomBanner: false,
      useCustomAccentColor: false,
      accentColor: "#f97316",
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = form

  const storeName = watch("storeName")
  const storeType = watch("storeType")
  const shortDescription = watch("shortDescription")
  const storeSlug = watch("storeSlug")
  const openingHours = watch("openingHours")
  const enableOnlineOrders = watch("enableOnlineOrders")
  const orderModes = watch("orderModes")
  const storeStatus = watch("storeStatus")
  const enableReservations = watch("enableReservations")
  const enableTables = watch("enableTables")
  const useBusinessTimezone = watch("useBusinessTimezone")
  const useCustomLogo = watch("useCustomLogo")
  const useCustomBanner = watch("useCustomBanner")
  const useCustomAccentColor = watch("useCustomAccentColor")

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
    setValue("storeSlug", slug, { shouldValidate: true })
  }

  const copyStoreUrl = () => {
    navigator.clipboard.writeText(`https://berrytap.app/${storeSlug}`)
    setUrlCopied(true)
    toast.success("Store URL copied to clipboard")
    setTimeout(() => setUrlCopied(false), 2000)
  }

  const onSubmit = (data: StoreInfoFormData) => {
    console.log("[v0] Saving store info:", data)
    setLastSaved(new Date())
    toast.success("Store information saved successfully!")
  }

  const handleDiscard = () => {
    form.reset()
    toast.info("Changes discarded")
  }

  const toggleDayClosed = (dayIndex: number) => {
    const current = openingHours[dayIndex].closed
    setValue(`openingHours.${dayIndex}.closed`, !current, { shouldDirty: true })
  }

  const addShift = (dayIndex: number) => {
    const currentShifts = openingHours[dayIndex].shifts
    setValue(`openingHours.${dayIndex}.shifts`, [...currentShifts, { open: "11:00", close: "23:00" }], {
      shouldDirty: true,
    })
  }

  const removeShift = (dayIndex: number, shiftIndex: number) => {
    const currentShifts = openingHours[dayIndex].shifts
    if (currentShifts.length > 1) {
      setValue(
        `openingHours.${dayIndex}.shifts`,
        currentShifts.filter((_, i) => i !== shiftIndex),
        { shouldDirty: true },
      )
    }
  }

  const applyPreset = (preset: (typeof commonPresets)[0]) => {
    openingHours.forEach((_, index) => {
      if (!openingHours[index].closed) {
        setValue(`openingHours.${index}.shifts`, [{ open: preset.open, close: preset.close }], { shouldDirty: true })
      }
    })
    toast.success(`Applied ${preset.name} to all open days`)
  }

  const copyToAllDays = (dayIndex: number) => {
    const sourceDay = openingHours[dayIndex]
    openingHours.forEach((_, index) => {
      setValue(`openingHours.${index}.closed`, sourceDay.closed, { shouldDirty: true })
      setValue(`openingHours.${index}.shifts`, sourceDay.shifts, { shouldDirty: true })
    })
    toast.success("Applied to all days")
  }

  const applyToWeekdays = (dayIndex: number) => {
    const sourceDay = openingHours[dayIndex]
    ;[0, 1, 2, 3, 4].forEach((index) => {
      setValue(`openingHours.${index}.closed`, sourceDay.closed, { shouldDirty: true })
      setValue(`openingHours.${index}.shifts`, sourceDay.shifts, { shouldDirty: true })
    })
    toast.success("Applied to weekdays (Mon-Fri)")
  }

  const applyToWeekend = (dayIndex: number) => {
    const sourceDay = openingHours[dayIndex]
    ;[5, 6].forEach((index) => {
      setValue(`openingHours.${index}.closed`, sourceDay.closed, { shouldDirty: true })
      setValue(`openingHours.${index}.shifts`, sourceDay.shifts, { shouldDirty: true })
    })
    toast.success("Applied to weekend (Sat-Sun)")
  }

  const getCurrentStatus = () => {
    // Simple logic to determine if currently open
    const now = new Date()
    const currentDay = (now.getDay() + 6) % 7 // Convert to Mon=0 format
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`

    const todayHours = openingHours[currentDay]
    if (todayHours.closed) return "closed"

    for (const shift of todayHours.shifts) {
      if (currentTime >= shift.open && currentTime <= shift.close) {
        return "open"
      }
    }
    return "closed"
  }

  const isCurrentlyOpen = getCurrentStatus() === "open"

  // Keyboard shortcut for save (Cmd+S / Ctrl+S)
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault()
      handleSubmit(onSubmit)()
    }
  }

  useState(() => {
    window.addEventListener("keydown", handleKeyDown as any)
    return () => window.removeEventListener("keydown", handleKeyDown as any)
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">Store Info</h1>
              <p className="text-sm text-muted-foreground mt-1 hidden sm:block">
                Configure this store's details and what customers see
              </p>

              {/* Mobile: Status pill, View button, and Tips button below title */}
              <div className="flex flex-wrap items-center gap-2 mt-3 md:hidden">
                <Badge variant={storeStatus === "active" ? "default" : "secondary"} className="capitalize">
                  {storeStatus === "active" ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                      Active
                    </>
                  ) : storeStatus === "inactive" ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground mr-2" />
                      Inactive
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                      Coming Soon
                    </>
                  )}
                </Badge>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>

                <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Menu className="w-4 h-4 mr-2" />
                      Tips
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-full p-0 flex flex-col h-full">
                    {/* Sticky Header */}
                    <div className="sticky top-0 z-10 border-b bg-background">
                      <SheetHeader className="px-6 py-4">
                        <SheetTitle>Store Info Helper</SheetTitle>
                        <SheetDescription>Quick tips and preview</SheetDescription>
                      </SheetHeader>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="px-6 py-4 space-y-6">
                        {/* Quick Tips */}
                        <div>
                          <h3 className="font-semibold mb-3">Quick Tips</h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex gap-3">
                              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                                <span className="text-orange-600 dark:text-orange-400 font-bold">1</span>
                              </div>
                              <div>
                                <p className="font-medium">Complete your profile</p>
                                <p className="text-muted-foreground text-xs">
                                  Add all contact details and opening hours
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                                <span className="text-orange-600 dark:text-orange-400 font-bold">2</span>
                              </div>
                              <div>
                                <p className="font-medium">Set up operational features</p>
                                <p className="text-muted-foreground text-xs">
                                  Enable tables, reservations, and order modes
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                                <span className="text-orange-600 dark:text-orange-400 font-bold">3</span>
                              </div>
                              <div>
                                <p className="font-medium">Customize branding</p>
                                <p className="text-muted-foreground text-xs">
                                  Make your store stand out with custom colors and images
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Preview */}
                        <div>
                          <h3 className="font-semibold mb-3">Store Preview</h3>
                          <div className="space-y-3">
                            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                              <StoreIcon className="w-12 h-12 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-semibold">{storeName}</h4>
                              <p className="text-sm text-muted-foreground">{shortDescription}</p>
                              <Badge
                                variant={storeStatus === "active" ? "default" : "secondary"}
                                className="capitalize text-xs"
                              >
                                {storeStatus}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* Desktop: Status pill and View button on the right */}
            <div className="hidden md:flex items-center gap-4">
              {lastSaved && (
                <div className="text-sm text-muted-foreground">Last saved: {lastSaved.toLocaleTimeString()}</div>
              )}
              <Badge variant={storeStatus === "active" ? "default" : "secondary"} className="capitalize">
                {storeStatus === "active" ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                    Active
                  </>
                ) : storeStatus === "inactive" ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground mr-2" />
                    Inactive
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                    Coming Soon
                  </>
                )}
              </Badge>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View Public Page
              </Button>
            </div>
          </div>
        </div>

        {/* Sticky Action Bar */}
        {isDirty && (
          <div className="border-t bg-amber-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">You have unsaved changes</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleDiscard}>
                    <X className="w-4 h-4 mr-2" />
                    Discard
                  </Button>
                  <Button size="sm" onClick={handleSubmit(onSubmit)} className="bg-orange-600 hover:bg-orange-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Store Basics */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <StoreIcon className="w-5 h-5 text-orange-600" />
                  <CardTitle>Store Basics</CardTitle>
                </div>
                <CardDescription>Essential information about your store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Store Name */}
                <div className="space-y-2">
                  <Label htmlFor="storeName">
                    Store Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="storeName"
                    {...register("storeName")}
                    onChange={(e) => {
                      register("storeName").onChange(e)
                      handleNameChange(e)
                    }}
                    className={cn(errors.storeName && "border-red-500")}
                  />
                  <div className="flex justify-between text-xs">
                    {errors.storeName && <span className="text-red-500">{errors.storeName.message}</span>}
                    <span className={cn("ml-auto", storeName.length > 100 ? "text-red-500" : "text-gray-500")}>
                      {storeName.length}/100
                    </span>
                  </div>
                </div>

                {/* Store Type */}
                <div className="space-y-2">
                  <Label>
                    Store Type <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={storeType}
                    onValueChange={(value) => setValue("storeType", value as any, { shouldDirty: true })}
                    className="grid grid-cols-3 sm:grid-cols-5 gap-2"
                  >
                    {storeTypes.map((type) => (
                      <div key={type.value}>
                        <RadioGroupItem value={type.value} id={type.value} className="peer sr-only" />
                        <Label
                          htmlFor={type.value}
                          className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-background p-3 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-accent cursor-pointer transition-all min-h-[80px]"
                        >
                          <span className="text-2xl mb-1">{type.icon}</span>
                          <span className="text-xs font-medium text-center break-words">{type.label}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Short Description */}
                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Textarea
                    id="shortDescription"
                    {...register("shortDescription")}
                    rows={3}
                    placeholder="Brief description of your store..."
                    className={cn(errors.shortDescription && "border-red-500")}
                  />
                  <div className="flex justify-between text-xs">
                    {errors.shortDescription && <span className="text-red-500">{errors.shortDescription.message}</span>}
                    <span
                      className={cn(
                        "ml-auto",
                        (shortDescription?.length || 0) > 300 ? "text-red-500" : "text-muted-foreground",
                      )}
                    >
                      {shortDescription?.length || 0}/300
                    </span>
                  </div>
                </div>

                {/* Store Slug/URL */}
                <div className="space-y-2">
                  <Label htmlFor="storeSlug">
                    Store URL <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-muted border rounded-lg">
                      <span className="text-sm text-muted-foreground">https://berrytap.app/</span>
                      <Input
                        id="storeSlug"
                        {...register("storeSlug")}
                        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      />
                    </div>
                    <Button type="button" variant="outline" size="icon" onClick={copyStoreUrl}>
                      {urlCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.storeSlug && <p className="text-xs text-red-500">{errors.storeSlug.message}</p>}
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Changing this will break existing links
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location & Contact */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <CardTitle>Location & Contact</CardTitle>
                </div>
                <CardDescription>Store address and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="street">
                      Street Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="street"
                      {...register("address.street")}
                      placeholder="123 Main Street"
                      className={cn(errors.address?.street && "border-red-500")}
                    />
                    {errors.address?.street && <p className="text-xs text-red-500">{errors.address.street.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apartment">Apartment / Suite (Optional)</Label>
                    <Input id="apartment" {...register("address.apartment")} placeholder="Suite 100" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">
                        Postal Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="postalCode"
                        {...register("address.postalCode")}
                        className={cn(errors.address?.postalCode && "border-red-500")}
                      />
                      {errors.address?.postalCode && (
                        <p className="text-xs text-red-500">{errors.address.postalCode.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        {...register("address.city")}
                        className={cn(errors.address?.city && "border-red-500")}
                      />
                      {errors.address?.city && <p className="text-xs text-red-500">{errors.address.city.message}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">
                      Country <span className="text-red-500">*</span>
                    </Label>
                    <Select value={watch("address.country")} onValueChange={(val) => setValue("address.country", val)}>
                      <SelectTrigger className={cn(errors.address?.country && "border-red-500")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.address?.country && (
                      <p className="text-xs text-red-500">{errors.address.country.message}</p>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    {...register("phoneNumber")}
                    placeholder="+1 (555) 123-4567"
                    className={cn(errors.phoneNumber && "border-red-500")}
                  />
                  {errors.phoneNumber && <p className="text-xs text-red-500">{errors.phoneNumber.message}</p>}
                </div>

                {/* Public Email */}
                <div className="space-y-2">
                  <Label htmlFor="publicEmail">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Public Email
                  </Label>
                  <Input
                    id="publicEmail"
                    type="email"
                    {...register("publicEmail")}
                    placeholder="hello@store.com"
                    className={cn(errors.publicEmail && "border-red-500")}
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="useBusinessEmail"
                      checked={watch("useBusinessEmail")}
                      onCheckedChange={(checked) => setValue("useBusinessEmail", !!checked, { shouldDirty: true })}
                    />
                    <Label htmlFor="useBusinessEmail" className="text-sm font-normal cursor-pointer">
                      Use business email
                    </Label>
                  </div>
                  {errors.publicEmail && <p className="text-xs text-red-500">{errors.publicEmail.message}</p>}
                </div>

                <Separator />

                {/* Website & Social Media */}
                <div className="space-y-4">
                  <button
                    type="button"
                    className="flex items-center justify-between w-full text-sm font-medium"
                    onClick={() => setShowSocialMedia(!showSocialMedia)}
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Website & Social Media
                    </span>
                    {showSocialMedia ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showSocialMedia && (
                    <div className="space-y-4 pt-2">
                      <div className="space-y-2">
                        <Label htmlFor="website">
                          <Globe className="w-4 h-4 inline mr-2" />
                          Website URL
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="website"
                            type="url"
                            {...register("website")}
                            placeholder="https://your-store.com"
                            className={cn("flex-1", errors.website && "border-red-500")}
                          />
                          {watch("website") && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => window.open(watch("website"), "_blank")}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {errors.website && <p className="text-xs text-red-500">{errors.website.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="instagram">Instagram</Label>
                        <div className="flex gap-2">
                          <span className="inline-flex items-center px-3 border border-r-0 rounded-l-lg bg-gray-50 text-gray-600">
                            @
                          </span>
                          <Input
                            id="instagram"
                            {...register("instagram")}
                            placeholder="username"
                            className="rounded-l-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input id="facebook" {...register("facebook")} placeholder="Facebook page URL or username" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card>
              <CardHeader>
                {/* Make opening hours header responsive */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-600" />
                    <div>
                      <CardTitle>Opening Hours</CardTitle>
                      <CardDescription className="hidden sm:block">
                        When your store is open for business
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={isCurrentlyOpen ? "default" : "secondary"}>
                    {isCurrentlyOpen ? "Currently Open" : "Currently Closed"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preset Buttons */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                  <span className="text-sm text-muted-foreground">Quick apply:</span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {commonPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset(preset)}
                        className="text-xs"
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Days Table */}
                <div className="space-y-2">
                  {openingHours.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={cn(
                        "border rounded-lg p-3 sm:p-4 space-y-3",
                        (new Date().getDay() + 6) % 7 === dayIndex &&
                          "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800",
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium w-20 sm:w-24">{dayNames[dayIndex]}</span>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`closed-${dayIndex}`}
                              checked={day.closed}
                              onCheckedChange={() => toggleDayClosed(dayIndex)}
                            />
                            <Label htmlFor={`closed-${dayIndex}`} className="text-sm font-normal cursor-pointer">
                              Closed
                            </Label>
                          </div>
                        </div>

                        {!day.closed && (
                          <div className="flex flex-wrap gap-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => copyToAllDays(dayIndex)}
                              className="text-xs h-8 px-3"
                            >
                              <Copy className="w-3 h-3 mr-1.5" />
                              Copy to all
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => applyToWeekdays(dayIndex)}
                              className="text-xs h-8 px-3 hidden sm:inline-flex"
                            >
                              Mon–Fri
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => applyToWeekend(dayIndex)}
                              className="text-xs h-8 px-3 hidden sm:inline-flex"
                            >
                              Sat–Sun
                            </Button>
                          </div>
                        )}
                      </div>

                      {!day.closed && (
                        <div className="space-y-2 sm:pl-28">
                          {day.shifts.map((shift, shiftIndex) => (
                            <div key={shiftIndex} className="flex items-center gap-2">
                              <Select
                                value={shift.open}
                                onValueChange={(val) =>
                                  setValue(`openingHours.${dayIndex}.shifts.${shiftIndex}.open`, val, {
                                    shouldDirty: true,
                                  })
                                }
                              >
                                <SelectTrigger className="w-24 sm:w-32">
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
                              <span className="text-muted-foreground">–</span>
                              <Select
                                value={shift.close}
                                onValueChange={(val) =>
                                  setValue(`openingHours.${dayIndex}.shifts.${shiftIndex}.close`, val, {
                                    shouldDirty: true,
                                  })
                                }
                              >
                                <SelectTrigger className="w-24 sm:w-32">
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
                              {day.shifts.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => removeShift(dayIndex, shiftIndex)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addShift(dayIndex)}
                            className="text-xs"
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            Add hours
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Store Branding */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-orange-600" />
                  <div>
                    <CardTitle>Store Branding (Overrides)</CardTitle>
                    <CardDescription>Customize branding for this specific store</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Override */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Store Logo</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={useCustomLogo}
                        onCheckedChange={(checked) => setValue("useCustomLogo", checked, { shouldDirty: true })}
                      />
                      <span className="text-sm text-muted-foreground">
                        {useCustomLogo ? "Custom logo" : "Using business default"}
                      </span>
                    </div>
                  </div>

                  {useCustomLogo && (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Upload custom logo</p>
                      <Button type="button" variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Banner Override */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Store Banner</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={useCustomBanner}
                        onCheckedChange={(checked) => setValue("useCustomBanner", checked, { shouldDirty: true })}
                      />
                      <span className="text-sm text-muted-foreground">
                        {useCustomBanner ? "Custom banner" : "Using business default"}
                      </span>
                    </div>
                  </div>

                  {useCustomBanner && (
                    <div className="border-2 border-dashed rounded-lg p-12 text-center bg-muted">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-2">Upload banner image (16:9 recommended)</p>
                      <Button type="button" variant="outline" size="sm">
                        Choose File
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Accent Color Override */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Accent Color</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={useCustomAccentColor}
                        onCheckedChange={(checked) => setValue("useCustomAccentColor", checked, { shouldDirty: true })}
                      />
                      <span className="text-sm text-muted-foreground">
                        {useCustomAccentColor ? "Custom color" : "Using business default"}
                      </span>
                    </div>
                  </div>

                  {useCustomAccentColor && (
                    <div className="flex items-center gap-4">
                      <input
                        type="color"
                        {...register("accentColor")}
                        className="w-16 h-16 rounded-lg border-2 cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-medium">{watch("accentColor")}</p>
                        <p className="text-xs text-muted-foreground">Used for buttons and highlights</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Operational Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-600" />
                  <CardTitle>Operational Settings</CardTitle>
                </div>
                <CardDescription>Configure what features are enabled for this store</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enable Tables */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enableTables" className="text-base">
                      Enable Tables
                    </Label>
                    <p className="text-sm text-muted-foreground">Allow customers to book specific tables</p>
                    {!enableTables && (
                      <p className="text-xs text-amber-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        If disabled, Tables page will be hidden
                      </p>
                    )}
                  </div>
                  <Switch
                    id="enableTables"
                    checked={enableTables}
                    onCheckedChange={(checked) => setValue("enableTables", checked, { shouldDirty: true })}
                  />
                </div>

                <Separator />

                {/* Enable Reservations */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="enableReservations" className="text-base">
                        Enable Reservations
                      </Label>
                      <p className="text-sm text-muted-foreground">Allow customers to book tables in advance</p>
                    </div>
                    <Switch
                      id="enableReservations"
                      checked={enableReservations}
                      onCheckedChange={(checked) => setValue("enableReservations", checked, { shouldDirty: true })}
                    />
                  </div>

                  {enableReservations && (
                    <div className="pl-6 space-y-4 border-l-2 border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="requirePrepayment"
                          checked={watch("requirePrepayment")}
                          onCheckedChange={(checked) => setValue("requirePrepayment", !!checked, { shouldDirty: true })}
                        />
                        <Label htmlFor="requirePrepayment" className="text-sm font-normal cursor-pointer">
                          Require prepayment for reservations
                        </Label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="maxPartySize">Maximum Party Size</Label>
                          <Input
                            id="maxPartySize"
                            type="number"
                            min="1"
                            max="50"
                            {...register("maxPartySize", { valueAsNumber: true })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bookingWindow">Booking Window (days)</Label>
                          <Input
                            id="bookingWindow"
                            type="number"
                            min="1"
                            max="90"
                            {...register("bookingWindow", { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Enable Online Orders */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="enableOnlineOrders" className="text-base">
                        Enable Online Orders
                      </Label>
                      <p className="text-sm text-muted-foreground">Allow customers to place orders online</p>
                      {!enableOnlineOrders && (
                        <p className="text-xs text-amber-600">Store still visible but order button is hidden</p>
                      )}
                    </div>
                    <Switch
                      id="enableOnlineOrders"
                      checked={enableOnlineOrders}
                      onCheckedChange={(checked) => setValue("enableOnlineOrders", checked, { shouldDirty: true })}
                    />
                  </div>

                  {enableOnlineOrders && (
                    <div className="pl-6 space-y-4 border-l-2 border-orange-200 dark:border-orange-800">
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Order Modes *</Label>
                        <div className="space-y-2">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="dineIn"
                              checked={orderModes.dineIn}
                              onCheckedChange={(checked) =>
                                setValue("orderModes.dineIn", !!checked, { shouldDirty: true })
                              }
                            />
                            <div className="flex-1">
                              <Label htmlFor="dineIn" className="text-sm font-normal cursor-pointer">
                                Dine-in
                              </Label>
                              <p className="text-xs text-muted-foreground">Order at table, eat in restaurant</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="pickup"
                              checked={orderModes.pickup}
                              onCheckedChange={(checked) =>
                                setValue("orderModes.pickup", !!checked, { shouldDirty: true })
                              }
                            />
                            <div className="flex-1">
                              <Label htmlFor="pickup" className="text-sm font-normal cursor-pointer">
                                Pickup
                              </Label>
                              <p className="text-xs text-muted-foreground">Order ahead, pick up at store</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="delivery"
                              checked={orderModes.delivery}
                              onCheckedChange={(checked) =>
                                setValue("orderModes.delivery", !!checked, { shouldDirty: true })
                              }
                            />
                            <div className="flex-1">
                              <Label htmlFor="delivery" className="text-sm font-normal cursor-pointer">
                                Delivery
                              </Label>
                              <p className="text-xs text-muted-foreground">Order for delivery</p>
                            </div>
                          </div>
                        </div>

                        {orderModes.delivery && (
                          <div className="pl-8 space-y-3 pt-2 border-l-2 border-orange-100 dark:border-orange-900">
                            <div className="space-y-2">
                              <Label htmlFor="deliveryRadius">Delivery Radius (miles)</Label>
                              <Input
                                id="deliveryRadius"
                                type="number"
                                min="0"
                                step="0.5"
                                {...register("deliveryRadius", { valueAsNumber: true })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="deliveryFee">Delivery Fee ($)</Label>
                              <Input
                                id="deliveryFee"
                                type="number"
                                min="0"
                                step="0.01"
                                {...register("deliveryFee", { valueAsNumber: true })}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="minimumOrder">Minimum Order ($)</Label>
                              <Input
                                id="minimumOrder"
                                type="number"
                                min="0"
                                step="0.01"
                                {...register("minimumOrder", { valueAsNumber: true })}
                              />
                            </div>
                          </div>
                        )}

                        {!orderModes.dineIn && !orderModes.pickup && !orderModes.delivery && (
                          <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded">
                            <AlertCircle className="w-4 h-4" />
                            <span>Must select at least one order mode</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status & Visibility */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <CardTitle>Status & Visibility</CardTitle>
                </div>
                <CardDescription>Control store availability and public visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Store Status */}
                <div className="space-y-3">
                  <Label>Store Status</Label>
                  <RadioGroup
                    value={storeStatus}
                    onValueChange={(value) => setValue("storeStatus", value as any, { shouldDirty: true })}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 border rounded-lg p-4">
                      <RadioGroupItem value="active" id="active" />
                      <Label htmlFor="active" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="font-medium">Active</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Visible and fully operational</p>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-4">
                      <RadioGroupItem value="inactive" id="inactive" />
                      <Label htmlFor="inactive" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                          <span className="font-medium">Inactive</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Hidden from customers; admin only</p>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-4">
                      <RadioGroupItem value="coming-soon" id="coming-soon" />
                      <Label htmlFor="coming-soon" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500" />
                          <span className="font-medium">Coming Soon</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Visible but can't take orders</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                {/* Public Listing */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="publicListing" className="text-base">
                      Visible in Public Directory
                    </Label>
                    <p className="text-sm text-muted-foreground">List this store in the public BerryTap directory</p>
                    <p className="text-xs text-muted-foreground">Store URL will still work: berrytap.app/{storeSlug}</p>
                  </div>
                  <Switch
                    id="publicListing"
                    checked={watch("publicListing")}
                    onCheckedChange={(checked) => setValue("publicListing", checked, { shouldDirty: true })}
                  />
                </div>

                <Separator />

                {/* Timezone */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Store Timezone</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={useBusinessTimezone}
                        onCheckedChange={(checked) => setValue("useBusinessTimezone", checked, { shouldDirty: true })}
                      />
                      <span className="text-sm text-muted-foreground">
                        {useBusinessTimezone ? "Using business timezone" : "Custom timezone"}
                      </span>
                    </div>
                  </div>

                  {!useBusinessTimezone && (
                    <Select value={watch("timezone")} onValueChange={(val) => setValue("timezone", val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Current time: {new Date().toLocaleTimeString()} ({watch("timezone")})
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Helper Panel */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Quick Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 dark:text-orange-400 font-bold">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Complete your profile</p>
                      <p className="text-muted-foreground text-xs">Add all contact details and opening hours</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 dark:text-orange-400 font-bold">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Set up operational features</p>
                      <p className="text-muted-foreground text-xs">Enable tables, reservations, and order modes</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 dark:text-orange-400 font-bold">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Customize branding</p>
                      <p className="text-muted-foreground text-xs">
                        Make your store stand out with custom colors and images
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Store Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <StoreIcon className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{storeName}</h3>
                    <p className="text-sm text-muted-foreground">{shortDescription}</p>
                    <Badge variant={storeStatus === "active" ? "default" : "secondary"} className="capitalize text-xs">
                      {storeStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="hidden lg:block">
                <CardHeader>
                  <CardTitle className="text-base">Keyboard Shortcuts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Save changes</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘ S</kbd>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
