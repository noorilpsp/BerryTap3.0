"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { type FieldErrors, type FieldError, type Resolver, useForm } from "react-hook-form"
import * as z from "zod"
import {
  Building2,
  ShieldCheck,
  Palette,
  Globe2,
  Bell,
  Upload,
  X,
  Check,
  AlertCircle,
  Keyboard,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "@/hooks/use-toast"

// Form validation schema
const businessInfoSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(100),
  publicBrandName: z.string().min(1, "Public brand name is required").max(100),
  primaryEmail: z.string().email("Invalid email address"),
  primaryPhone: z.string().optional(),
  legalEntityName: z.string().min(1, "Legal entity name is required"),
  sameAsBusinessName: z.boolean(),
  vatTaxId: z.string().optional(),
  streetAddress1: z.string().min(1, "Street address is required"),
  streetAddress2: z.string().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  companyRegNumber: z.string().optional(),
  primaryBrandColor: z.string().default("#0F172A"),
  accentColor: z.string().optional(),
  defaultCurrency: z.string().min(1, "Currency is required"),
  defaultTimezone: z.string().min(1, "Timezone is required"),
  defaultLanguage: z.string().min(1, "Language is required"),
  dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]),
  numberFormat: z.enum(["1,234.56", "1.234,56"]),
  billingEmail: z.string().email().optional().or(z.literal("")),
  criticalAlertsEmail: z.string().email().optional().or(z.literal("")),
  notifyBilling: z.boolean(),
  notifyUpdates: z.boolean(),
  notifyTips: z.boolean(),
  notifyMarketing: z.boolean(),
})

type BusinessInfoFormData = z.infer<typeof businessInfoSchema>

const businessInfoResolver: Resolver<BusinessInfoFormData> = async (values) => {
  const parsed = businessInfoSchema.safeParse(values)

  if (parsed.success) {
    return {
      values: parsed.data,
      errors: {},
    }
  }

  const fieldErrors: FieldErrors<BusinessInfoFormData> = {}

  for (const issue of parsed.error.issues) {
    const fieldPath = issue.path[0]
    if (typeof fieldPath !== "string") continue

    const key = fieldPath as keyof BusinessInfoFormData
    if (fieldErrors[key]) continue

    fieldErrors[key] = {
      type: issue.code ?? "validation",
      message: issue.message,
    } as FieldError
  }

  return {
    values: {},
    errors: fieldErrors,
  }
}

export default function RestaurantSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date())
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string>("/restaurant-logo.png")
  const [bannerFile, setBannerFile] = useState<File | null>(null)
  const [bannerPreview, setBannerPreview] = useState<string>("/restaurant-banner.png")

  const form = useForm<BusinessInfoFormData>({
    resolver: businessInfoResolver,
    defaultValues: {
      businessName: "BerryTap Restaurant",
      publicBrandName: "BerryTap",
      primaryEmail: "contact@berrytap.com",
      primaryPhone: "+1 (555) 123-4567",
      legalEntityName: "BerryTap Restaurant LLC",
      sameAsBusinessName: false,
      vatTaxId: "EU123456789",
      streetAddress1: "123 Main Street",
      streetAddress2: "Suite 100",
      postalCode: "10001",
      city: "New York",
      country: "US",
      companyRegNumber: "12345678",
      primaryBrandColor: "#0F172A",
      accentColor: "#10B981",
      defaultCurrency: "USD",
      defaultTimezone: "America/New_York",
      defaultLanguage: "en",
      dateFormat: "MM/DD/YYYY",
      numberFormat: "1,234.56",
      billingEmail: "",
      criticalAlertsEmail: "",
      notifyBilling: true,
      notifyUpdates: true,
      notifyTips: false,
      notifyMarketing: false,
    },
  })

  const {
    formState: { isDirty, isValid },
  } = form

  const onSubmit = useCallback(async (data: BusinessInfoFormData) => {
    setIsSaving(true)

    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log("Form data:", data)
    setIsSaving(false)
    setLastSaved(new Date())
    form.reset(data)

    toast({
      title: "Business info updated successfully",
      description: "Your changes have been saved.",
      variant: "default",
    })
  }, [form])

  const handleSaveClick = useCallback(() => {
    void form.handleSubmit(onSubmit)()
  }, [form, onSubmit])

  const handleDiscard = () => {
    form.reset()
    toast({
      title: "Changes discarded",
      description: "All unsaved changes have been reverted.",
    })
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setBannerFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setBannerPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const getRelativeTime = (date: Date | null) => {
    if (!date) return ""
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60)
    if (diff < 1) return "Just now"
    if (diff < 60) return `${diff} minute${diff > 1 ? "s" : ""} ago`
    const hours = Math.floor(diff / 60)
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
    const days = Math.floor(hours / 24)
    return `${days} day${days > 1 ? "s" : ""} ago`
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="px-6 pt-8 pb-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Business Info</h1>
            <p className="text-sm text-muted-foreground mt-2">Brand-level settings used across all stores</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 text-sm">
              {isDirty ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  <span className="text-muted-foreground">Unsaved changes</span>
                </>
              ) : (
                <>
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">All changes saved</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Last updated {getRelativeTime(lastSaved)}</span>
              <Badge variant="secondary">Global</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-10 px-6 py-4 bg-background/95 backdrop-blur border-b border-border">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Keyboard className="h-4 w-4" />
            <span className="hidden sm:inline">Cmd+S to save</span>
            <span className="sm:hidden">⌘S to save</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDiscard} disabled={!isDirty || isSaving}>
              Discard
            </Button>
            <Button variant="outline" disabled={isSaving}>
              Preview
            </Button>
            <Button onClick={handleSaveClick} disabled={!isDirty || !isValid || isSaving} className="gap-2">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Form Sections */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Business Profile */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Business Profile</CardTitle>
                      </div>
                      <CardDescription>Basic information about your business</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="businessName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Name *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input {...field} maxLength={100} />
                                {field.value.length >= 80 && (
                                  <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">
                                    {field.value.length}/100
                                  </span>
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="publicBrandName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Public Brand Name *</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              Customers will see: <span className="font-medium">{field.value || "..."}</span>
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="primaryEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Contact Email *</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input type="email" {...field} />
                                {field.value && !form.formState.errors.primaryEmail && (
                                  <Check className="absolute right-3 top-2.5 h-5 w-5 text-emerald-500" />
                                )}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="primaryPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Contact Phone</FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} placeholder="+1 (555) 123-4567" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Legal & Tax */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Legal & Tax</CardTitle>
                        <Badge variant="secondary" className="ml-auto">
                          <ShieldCheck className="h-3 w-3 mr-1" />
                          Secure
                        </Badge>
                      </div>
                      <CardDescription>Legal entity and tax information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="sameAsBusinessName"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => {
                                  field.onChange(checked)
                                  if (checked) {
                                    form.setValue("legalEntityName", form.getValues("businessName"))
                                  }
                                }}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Same as Business Name</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="legalEntityName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Legal Entity Name *</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={form.watch("sameAsBusinessName")} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="vatTaxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VAT / Tax ID</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="EU123456789" />
                            </FormControl>
                            <FormDescription>Auto-formats based on country</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator className="my-4" />

                      <div className="space-y-4">
                        <Label>Registered Address *</Label>
                        <FormField
                          control={form.control}
                          name="streetAddress1"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="Street address line 1" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="streetAddress2"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input {...field} placeholder="Street address line 2 (optional)" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} placeholder="Postal code" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input {...field} placeholder="City" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="US">🇺🇸 United States</SelectItem>
                                  <SelectItem value="GB">🇬🇧 United Kingdom</SelectItem>
                                  <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                                  <SelectItem value="FR">🇫🇷 France</SelectItem>
                                  <SelectItem value="DE">🇩🇪 Germany</SelectItem>
                                  <SelectItem value="NL">🇳🇱 Netherlands</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormDescription>This address is used on invoices</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="companyRegNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Registration Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Optional" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Branding */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Branding (Global Defaults)</CardTitle>
                      </div>
                      <CardDescription>Visual identity for your brand</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Logo Upload */}
                      <div className="space-y-3">
                        <Label>Business Logo</Label>
                        <div className="flex items-start gap-4">
                          <div className="relative h-32 w-32 rounded-lg border-2 border-dashed border-border overflow-hidden bg-muted">
                            <img
                              src={logoPreview || "/placeholder.svg"}
                              alt="Logo preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <p className="text-sm text-muted-foreground">Recommended: 512x512px, PNG or JPG</p>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById("logo-upload")?.click()}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {logoFile ? "Replace" : "Upload"}
                              </Button>
                              {logoFile && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setLogoFile(null)
                                    setLogoPreview("/restaurant-logo.png")
                                  }}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              )}
                            </div>
                            <input
                              id="logo-upload"
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml"
                              className="hidden"
                              onChange={handleLogoUpload}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Banner Upload */}
                      <div className="space-y-3">
                        <Label>Default Banner Image</Label>
                        <div className="space-y-3">
                          <div className="relative h-48 w-full rounded-lg border-2 border-dashed border-border overflow-hidden bg-muted">
                            <img
                              src={bannerPreview || "/placeholder.svg"}
                              alt="Banner preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">Recommended: 1920x1080px, 16:9 aspect ratio</p>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById("banner-upload")?.click()}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {bannerFile ? "Replace" : "Upload"}
                              </Button>
                              {bannerFile && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setBannerFile(null)
                                    setBannerPreview("/restaurant-banner.png")
                                  }}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                          <input
                            id="banner-upload"
                            type="file"
                            accept="image/png,image/jpeg"
                            className="hidden"
                            onChange={handleBannerUpload}
                          />
                        </div>
                      </div>

                      <Separator />

                      {/* Colors */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="primaryBrandColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Primary Brand Color *</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    value={field.value || "#0F172A"}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="h-10 w-20 rounded-md border cursor-pointer"
                                  />
                                  <Input
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    placeholder="#0F172A"
                                    className="flex-1"
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="flex items-center gap-1 text-emerald-600">
                                <Check className="h-3 w-3" />
                                Good contrast
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="accentColor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Accent Color</FormLabel>
                              <FormControl>
                                <div className="flex gap-2">
                                  <input
                                    type="color"
                                    value={field.value || "#10B981"}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="h-10 w-20 rounded-md border cursor-pointer"
                                  />
                                  <Input
                                    value={field.value || ""}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    placeholder="Optional"
                                    className="flex-1"
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Localization */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Globe2 className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Localization & Preferences</CardTitle>
                      </div>
                      <CardDescription>Regional settings and formats</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="defaultCurrency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Currency *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">🇺🇸 USD - US Dollar</SelectItem>
                                <SelectItem value="EUR">🇪🇺 EUR - Euro</SelectItem>
                                <SelectItem value="GBP">🇬🇧 GBP - British Pound</SelectItem>
                                <SelectItem value="CAD">🇨🇦 CAD - Canadian Dollar</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="defaultTimezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Timezone *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                <SelectItem value="Europe/London">London (GMT)</SelectItem>
                                <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>Current time: {new Date().toLocaleTimeString()}</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="defaultLanguage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Language *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">🇬🇧 English</SelectItem>
                                <SelectItem value="nl">🇳🇱 Dutch</SelectItem>
                                <SelectItem value="fr">🇫🇷 French</SelectItem>
                                <SelectItem value="de">🇩🇪 German</SelectItem>
                                <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateFormat"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Date Format *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="DD/MM/YYYY" />
                                  </FormControl>
                                  <FormLabel className="font-normal">DD/MM/YYYY (e.g., 31/12/2024)</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="MM/DD/YYYY" />
                                  </FormControl>
                                  <FormLabel className="font-normal">MM/DD/YYYY (e.g., 12/31/2024)</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="YYYY-MM-DD" />
                                  </FormControl>
                                  <FormLabel className="font-normal">YYYY-MM-DD (e.g., 2024-12-31)</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="numberFormat"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Number Format *</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="1,234.56" />
                                  </FormControl>
                                  <FormLabel className="font-normal">1,234.56 (comma thousands)</FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="1.234,56" />
                                  </FormControl>
                                  <FormLabel className="font-normal">1.234,56 (dot thousands)</FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Global Notifications */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-muted-foreground" />
                        <CardTitle>Global Notifications</CardTitle>
                      </div>
                      <CardDescription>Manage notification preferences</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="billingEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} placeholder={form.getValues("primaryEmail")} />
                            </FormControl>
                            <FormDescription>Defaults to primary contact if empty</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="criticalAlertsEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Critical Alerts Recipient</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input type="email" {...field} placeholder="alerts@example.com" />
                              </FormControl>
                              <Button type="button" variant="outline" size="sm">
                                Test alert
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Separator className="my-4" />

                      <div className="space-y-4">
                        <Label>Notification Preferences</Label>

                        <div className="flex items-start space-x-3 opacity-50">
                          <Checkbox checked disabled />
                          <div className="space-y-1 leading-none">
                            <Label className="flex items-center gap-2">
                              Security & legal notices
                              <ShieldCheck className="h-3 w-3" />
                            </Label>
                            <p className="text-sm text-muted-foreground">Always enabled for your protection</p>
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="notifyBilling"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Billing & invoices</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notifyUpdates"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Product updates</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notifyTips"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Tips & best practices</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="notifyMarketing"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Marketing & promotions</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Helper Panel (Desktop Only) */}
                <div className="hidden lg:block">
                  <div className="sticky top-24 space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Quick Tips</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <p>
                            These settings apply globally across all locations. Store-specific settings can override
                            these defaults.
                          </p>
                        </div>
                        <Separator />
                        <div className="flex gap-2">
                          <Check className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
                          <p>Your logo will appear on receipts, emails, and customer-facing pages.</p>
                        </div>
                        <Separator />
                        <div className="flex gap-2">
                          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <p>Tax IDs are required for invoicing in most EU countries.</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Live Preview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                            <img
                              src={bannerPreview || "/placeholder.svg"}
                              alt="Banner preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-card border rounded-lg">
                            <img
                              src={logoPreview || "/placeholder.svg"}
                              alt="Logo"
                              className="h-10 w-10 rounded object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {form.watch("publicBrandName") || "Brand Name"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">{form.watch("primaryEmail")}</p>
                            </div>
                          </div>
                          <div
                            className="h-12 rounded-lg flex items-center justify-center text-white font-medium"
                            style={{ backgroundColor: form.watch("primaryBrandColor") }}
                          >
                            Button Preview
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}
