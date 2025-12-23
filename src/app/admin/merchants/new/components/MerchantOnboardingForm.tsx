"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays } from "date-fns";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  merchantOnboardingSchema,
  type MerchantOnboardingFormData,
} from "@/lib/validations/merchant-onboarding";

const businessTypes = [
  { value: "restaurant", label: "Restaurant" },
  { value: "cafe", label: "Cafe" },
  { value: "bar", label: "Bar" },
  { value: "bakery", label: "Bakery" },
  { value: "food_truck", label: "Food Truck" },
  { value: "fine_dining", label: "Fine Dining" },
  { value: "fast_food", label: "Fast Food" },
  { value: "other", label: "Other" },
] as const;

const subscriptionTiers = [
  { value: "trial", label: "Trial" },
  { value: "basic", label: "Basic" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
] as const;

export function MerchantOnboardingForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Calculate default trial expiration (30 days from now)
  const defaultTrialExpires = format(addDays(new Date(), 30), "yyyy-MM-dd");

  const form = useForm<MerchantOnboardingFormData>({
    resolver: zodResolver(merchantOnboardingSchema),
    defaultValues: {
      businessName: "",
      legalName: "",
      kboNumber: "",
      businessType: "restaurant",
      contactEmail: "",
      contactPhone: "",
      subscriptionTier: "trial",
      trialExpires: defaultTrialExpires,
      locationName: "",
      address: "",
      postalCode: "",
      city: "",
      locationPhone: "",
    },
    mode: "onBlur", // Show errors after user leaves field
    reValidateMode: "onChange", // Re-validate on change after first error
  });

  const subscriptionTier = form.watch("subscriptionTier");
  const showTrialExpires = subscriptionTier === "trial";

  const onSubmit = async (data: MerchantOnboardingFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare data for API
      const merchantData = {
        name: data.businessName,
        legalName: data.legalName,
        kboNumber: data.kboNumber || null,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        businessType: data.businessType,
        status: "onboarding" as const,
        subscriptionTier: data.subscriptionTier,
        subscriptionExpiresAt:
          data.subscriptionTier === "trial" && data.trialExpires
            ? new Date(data.trialExpires).toISOString()
            : null,
      };

      const locationData = {
        name: data.locationName,
        address: data.address,
        postalCode: data.postalCode,
        city: data.city,
        country: "Belgium",
        phone: data.locationPhone,
      };

      const invitationData = {
        email: data.contactEmail,
        role: "admin" as const,
      };

      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append("merchant", JSON.stringify(merchantData));
      formData.append("location", JSON.stringify(locationData));
      formData.append("invitation", JSON.stringify(invitationData));

      const response = await fetch("/api/admin/merchants", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create merchant");
      }

      // Success!
      console.log("[merchant-form] API response:", result);
      const merchantId = result.merchantId;
      const locationId = result.locationId;
      
      if (!merchantId || merchantId === "null" || merchantId === "undefined") {
        console.error("[merchant-form] Invalid merchantId in response:", { merchantId, fullResult: result });
        throw new Error("Merchant created but no valid ID returned");
      }
      
      toast.success(
        `Merchant created successfully! Invitation sent to ${data.contactEmail}`,
        {
          duration: 5000,
          action: merchantId
            ? {
                label: "View Merchant",
                onClick: () => router.push(`/admin/merchants/${merchantId}`),
              }
            : undefined,
        }
      );

      // Reset form for adding another
      form.reset({
        businessName: "",
        legalName: "",
        kboNumber: "",
        businessType: "restaurant",
        contactEmail: "",
        contactPhone: "",
        subscriptionTier: "trial",
        trialExpires: defaultTrialExpires,
        locationName: "",
        address: "",
        postalCode: "",
        city: "",
        locationPhone: "",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create merchant";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Business Details */}
        <Card>
          <CardHeader>
            <CardTitle>Business Details</CardTitle>
            <CardDescription>
              Enter the essential business information for the new merchant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Business Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., La Brasserie"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="legalName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Legal Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., La Brasserie BV"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="kboNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>KBO Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1234567890"
                        maxLength={10}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Belgian business registration number (10 digits)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Business Type <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Primary Contact Email{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="owner@restaurant.com"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      This person will receive the invitation email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Primary Contact Phone{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+32 123 456 789 or 0123 456 789"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>Belgian format: +32 or 0XXXXXXXXX</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              Set the initial subscription tier for this merchant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="subscriptionTier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Subscription Tier <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subscription tier" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subscriptionTiers.map((tier) => (
                        <SelectItem key={tier.value} value={tier.value}>
                          {tier.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showTrialExpires && (
              <FormField
                control={form.control}
                name="trialExpires"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trial Expires</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min={format(new Date(), "yyyy-MM-dd")}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>
                      Default: 30 days from today
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Section 3: First Location */}
        <Card>
          <CardHeader>
            <CardTitle>First Location</CardTitle>
            <CardDescription>
              Add the primary location for this merchant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="locationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Location Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Downtown Branch"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Street Address <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Rue de la Loi 123"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Postal Code <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1000"
                        maxLength={4}
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormDescription>4 digits</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      City <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Brussels"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="locationPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone Number <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+32 123 456 789 or 0123 456 789"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>Belgian format: +32 or 0XXXXXXXXX</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Error Message */}
        {submitError && (
          <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
            {submitError}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="min-w-[140px]"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Creating..." : "Create Merchant"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

