import { z } from "zod";

/**
 * Validation schema for merchant onboarding form
 */

// Belgian phone number validation: +32 or starts with 0, followed by 9 digits
const belgianPhoneRegex = /^(\+32|0)[1-9]\d{8}$/;

// Belgian postal code: exactly 4 digits
const belgianPostalCodeRegex = /^\d{4}$/;

// KBO number: exactly 10 digits
const kboNumberRegex = /^\d{10}$/;

export const merchantOnboardingSchema = z.object({
  // Business Details
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(255, "Business name is too long"),
  legalName: z
    .string()
    .min(2, "Legal name must be at least 2 characters")
    .max(255, "Legal name is too long"),
  kboNumber: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || kboNumberRegex.test(val),
      "KBO number must be exactly 10 digits"
    ),
  businessType: z.enum([
    "restaurant",
    "cafe",
    "bar",
    "bakery",
    "food_truck",
    "fine_dining",
    "fast_food",
    "other",
  ]),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z
    .string()
    .regex(belgianPhoneRegex, "Please enter a valid Belgian phone number (+32 or 0XXXXXXXXX)"),

  // Subscription
  subscriptionTier: z.enum(["trial", "basic", "pro", "enterprise"]),
  trialExpires: z.string().optional(),

  // First Location
  locationName: z
    .string()
    .min(2, "Location name must be at least 2 characters")
    .max(255, "Location name is too long"),
  address: z.string().min(1, "Street address is required"),
  postalCode: z
    .string()
    .regex(belgianPostalCodeRegex, "Postal code must be exactly 4 digits"),
  city: z.string().min(1, "City is required"),
  locationPhone: z
    .string()
    .regex(belgianPhoneRegex, "Please enter a valid Belgian phone number (+32 or 0XXXXXXXXX)"),
});

export type MerchantOnboardingFormData = z.infer<typeof merchantOnboardingSchema>;

