// ── Booking Widget Data & Mock ─────────────────────────────────

export interface Restaurant {
  name: string
  tagline: string
  address: string
  phone: string
  website: string
  mapUrl: string
  currency: string
  timezone: string
}

export interface ServicePeriod {
  id: string
  name: string
  icon: string
  start: string
  end: string
  days: string[]
}

export interface TimeSlot {
  time: string
  available: boolean
  popularity?: "low" | "medium" | "high"
  reason?: string
}

export interface SeatingOption {
  id: string
  label: string
  icon: string | null
  note: string | null
}

export interface OccasionOption {
  id: string
  label: string
  icon: string
}

export interface DietaryOption {
  id: string
  label: string
  icon: string
}

export interface CalendarDay {
  available: boolean
  spotsLeft?: "plenty" | "few"
  note?: string
}

export interface CountryCode {
  code: string
  dial: string
  flag: string
  name: string
}

export interface BookingState {
  partySize: number
  date: Date | null
  servicePeriod: string | null
  timeSlot: string | null
  seatingPreference: string
  firstName: string
  lastName: string
  phone: string
  countryCode: string
  email: string
  occasion: string | null
  dietary: string[]
  specialRequests: string
  agreedToPolicy: boolean
  marketingOptIn: boolean
}

export interface NearbyDate {
  date: Date
  label: string
  slotsAvailable: number
}

// ── Mock Data ──────────────────────────────────────────────────

export const restaurant: Restaurant = {
  name: "Chez Laurent",
  tagline: "Fine Dining \u00B7 Brussels",
  address: "Rue de la Montagne 12, 1000 Brussels",
  phone: "+32 2 123 4567",
  website: "https://chezlaurent.be",
  mapUrl: "https://maps.google.com/?q=Chez+Laurent+Brussels",
  currency: "EUR",
  timezone: "Europe/Brussels",
}

export const servicePeriods: ServicePeriod[] = [
  { id: "breakfast", name: "Breakfast", icon: "\u2600\uFE0F", start: "07:00", end: "10:30", days: ["mon","tue","wed","thu","fri"] },
  { id: "brunch", name: "Brunch", icon: "\uD83C\uDF24\uFE0F", start: "10:00", end: "14:30", days: ["sat","sun"] },
  { id: "lunch", name: "Lunch", icon: "\uD83C\uDF1E", start: "11:30", end: "15:00", days: ["mon","tue","wed","thu","fri"] },
  { id: "dinner", name: "Dinner", icon: "\uD83C\uDF19", start: "17:00", end: "23:00", days: ["mon","tue","wed","thu","fri","sat","sun"] },
]

export const availableSlots: TimeSlot[] = [
  { time: "17:00", available: true, popularity: "low" },
  { time: "17:15", available: true, popularity: "low" },
  { time: "17:30", available: true, popularity: "low" },
  { time: "17:45", available: true, popularity: "low" },
  { time: "18:00", available: true, popularity: "medium" },
  { time: "18:15", available: true, popularity: "medium" },
  { time: "18:30", available: true, popularity: "medium" },
  { time: "18:45", available: true, popularity: "medium" },
  { time: "19:00", available: true, popularity: "high" },
  { time: "19:15", available: true, popularity: "high" },
  { time: "19:30", available: true, popularity: "high" },
  { time: "19:45", available: true, popularity: "high" },
  { time: "20:00", available: true, popularity: "high" },
  { time: "20:15", available: true, popularity: "medium" },
  { time: "20:30", available: true, popularity: "medium" },
  { time: "20:45", available: true, popularity: "medium" },
  { time: "21:00", available: true, popularity: "low" },
  { time: "21:15", available: true, popularity: "low" },
  { time: "21:30", available: true, popularity: "low" },
  { time: "21:45", available: false, reason: "Last seating passed" },
  { time: "22:00", available: false, reason: "No availability" },
]

export const seatingOptions: SeatingOption[] = [
  { id: "no_pref", label: "No preference", icon: null, note: null },
  { id: "window", label: "Window", icon: "\uD83E\uDE9F", note: null },
  { id: "patio", label: "Patio", icon: "\uD83C\uDF3F", note: "Weather-dependent" },
  { id: "booth", label: "Booth", icon: "\uD83D\uDECB\uFE0F", note: null },
  { id: "quiet", label: "Quiet area", icon: "\uD83D\uDD07", note: null },
  { id: "private", label: "Private room", icon: "\uD83D\uDD12", note: "Parties of 6+ only" },
]

export const occasions: OccasionOption[] = [
  { id: "birthday", label: "Birthday", icon: "\uD83C\uDF82" },
  { id: "anniversary", label: "Anniversary", icon: "\uD83D\uDC8D" },
  { id: "celebration", label: "Celebration", icon: "\uD83C\uDF89" },
  { id: "business", label: "Business", icon: "\uD83D\uDCBC" },
  { id: "date_night", label: "Date night", icon: "\uD83E\uDD42" },
  { id: "just_dining", label: "Just dining", icon: "\uD83C\uDF7D\uFE0F" },
]

export const dietaryOptions: DietaryOption[] = [
  { id: "shellfish", label: "Shellfish", icon: "\uD83E\uDD90" },
  { id: "nuts", label: "Nuts", icon: "\uD83E\uDD5C" },
  { id: "gluten", label: "Gluten", icon: "\uD83C\uDF3E" },
  { id: "dairy", label: "Dairy", icon: "\uD83E\uDD5B" },
  { id: "vegan", label: "Vegan", icon: "\uD83C\uDF31" },
  { id: "vegetarian", label: "Vegetarian", icon: "\uD83E\uDD6C" },
]

export const countryCodes: CountryCode[] = [
  { code: "BE", dial: "+32", flag: "\uD83C\uDDE7\uD83C\uDDEA", name: "Belgium" },
  { code: "FR", dial: "+33", flag: "\uD83C\uDDEB\uD83C\uDDF7", name: "France" },
  { code: "NL", dial: "+31", flag: "\uD83C\uDDF3\uD83C\uDDF1", name: "Netherlands" },
  { code: "DE", dial: "+49", flag: "\uD83C\uDDE9\uD83C\uDDEA", name: "Germany" },
  { code: "US", dial: "+1", flag: "\uD83C\uDDFA\uD83C\uDDF8", name: "United States" },
  { code: "GB", dial: "+44", flag: "\uD83C\uDDEC\uD83C\uDDE7", name: "United Kingdom" },
]

export const calendarAvailability: Record<string, CalendarDay> = {
  "2025-01-17": { available: true, spotsLeft: "plenty" },
  "2025-01-18": { available: true, spotsLeft: "few", note: "Filling fast" },
  "2025-01-19": { available: true, spotsLeft: "plenty" },
  "2025-01-20": { available: true, spotsLeft: "plenty" },
  "2025-01-21": { available: true, spotsLeft: "plenty" },
  "2025-01-22": { available: true, spotsLeft: "plenty" },
  "2025-01-23": { available: true, spotsLeft: "plenty" },
  "2025-01-24": { available: true, spotsLeft: "few" },
  "2025-01-25": { available: false, note: "Fully booked \u2014 Private event" },
  "2025-01-26": { available: true, spotsLeft: "plenty" },
  "2025-01-27": { available: true, spotsLeft: "plenty" },
  "2025-01-28": { available: true, spotsLeft: "plenty" },
  "2025-01-29": { available: true, spotsLeft: "plenty" },
  "2025-01-30": { available: true, spotsLeft: "plenty" },
  "2025-01-31": { available: true, spotsLeft: "few", note: "Popular Friday" },
}

export const nearbyDates: NearbyDate[] = [
  { date: new Date(2025, 0, 16), label: "Thu 16", slotsAvailable: 12 },
  { date: new Date(2025, 0, 18), label: "Sat 18", slotsAvailable: 3 },
  { date: new Date(2025, 0, 19), label: "Sun 19", slotsAvailable: 8 },
]

export const confirmationData = {
  confirmationId: "CL-20250117-0042",
  restaurant: "Chez Laurent",
  date: "2025-01-17",
  time: "19:30",
  partySize: 4,
  guestName: "Sarah Chen",
  phone: "+32 0412 345 678",
  email: "sarah.chen@email.com",
  seatingPreference: "window",
  occasion: "birthday",
  allergies: ["shellfish"],
  specialRequests: "High chair needed for toddler. Window seat preferred if possible.",
  cancellationPolicy: "Free cancellation up to 4 hours before. \u20AC25/person late cancel fee.",
  depositPaid: false,
  smsSent: true,
}

// ── Helpers ────────────────────────────────────────────────────

export function getDayName(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase()
}

export function getAvailablePeriods(date: Date): ServicePeriod[] {
  const dayMap: Record<number, string> = { 0: "sun", 1: "mon", 2: "tue", 3: "wed", 4: "thu", 5: "fri", 6: "sat" }
  const day = dayMap[date.getDay()]
  return servicePeriods.filter((p) => p.days.includes(day))
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number)
  const suffix = h >= 12 ? "PM" : "AM"
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${hour12}:${m.toString().padStart(2, "0")} ${suffix}`
}

export function getDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  const d = date.getDate().toString().padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function initialBookingState(): BookingState {
  return {
    partySize: 2,
    date: new Date(2025, 0, 17),
    servicePeriod: null,
    timeSlot: null,
    seatingPreference: "no_pref",
    firstName: "",
    lastName: "",
    phone: "",
    countryCode: "BE",
    email: "",
    occasion: null,
    dietary: [],
    specialRequests: "",
    agreedToPolicy: false,
    marketingOptIn: false,
  }
}
