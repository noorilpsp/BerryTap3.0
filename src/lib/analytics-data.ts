// ── Analytics Data Types & Mock Data ──────────────────────────────

export interface KpiItem {
  label: string
  value: number
  previous: number
  change: number
  trend: "up" | "down_good" | "down_bad" | "up_bad"
  format: "number" | "currency" | "percent" | "minutes" | "decimal"
  prefix?: string
  suffix?: string
  tabLink?: string
}

export interface DailyEntry {
  date: string
  day: string
  covers: number
  revenue: number
  noShows: number
}

export interface DayAvg {
  day: string
  avg: number
  prev: number
}

export interface ChannelData {
  covers: number
  revenue: number
  avgCheck: number
  noShowRate: number
  confirmRate: number | null
  costPerCover: number
}

export interface PartySizeEntry {
  size: string
  percentage: number
  avgCheck: number
}

export interface RevPASHRow {
  day: string
  hours: Record<string, number>
  avg: number
}

export interface TurnTimeByParty {
  size: string
  target: number
  actual: number
  variance: number
  status: "under" | "on_target" | "slight_over" | "over" | "significant_over"
}

export interface TurnDistribution {
  range: string
  count: number
}

export interface NoShowByItem {
  day?: string
  slot?: string
  channel?: string
  type?: string
  rate: number
}

export interface RepeatOffender {
  name: string
  noShows: number
  totalBookings: number
  rate: number
  status: "flagged" | "blocked"
}

export interface WaitDistEntry {
  range: string
  count: number
  percentage: number
  abandonRate?: number
}

export interface ZoneRevenue {
  zone: string
  revenue: number
  percentage: number
  seats: number
  revenuePerSeat: number
}

export interface TableRevenue {
  table: string
  revenue: number
  features: string
  server: string
}

export interface ChannelTrendWeek {
  week: string
  direct: number
  phone: number
  google: number
  walkIn: number
}

export interface TurnTimeTrendWeek {
  week: string
  avg: number
  target: number
}

// ── Mock Data ────────────────────────────────────────────────────

export const kpis: KpiItem[] = [
  { label: "Total Covers", value: 2847, previous: 2631, change: 8.2, trend: "up", format: "number", tabLink: "overview" },
  { label: "Revenue", value: 312000, previous: 278500, change: 12.0, trend: "up", format: "currency", prefix: "$", tabLink: "covers-revenue" },
  { label: "Rev / Cover", value: 109.6, previous: 105.9, change: 3.5, trend: "up", format: "currency", prefix: "$", tabLink: "covers-revenue" },
  { label: "No-Show Rate", value: 4.2, previous: 5.3, change: -1.1, trend: "down_good", format: "percent", suffix: "%", tabLink: "no-shows" },
  { label: "Avg Turn Time", value: 82, previous: 85, change: -3, trend: "down_good", format: "minutes", suffix: " min", tabLink: "turn-times" },
  { label: "Confirm Rate", value: 91.4, previous: 89.3, change: 2.1, trend: "up", format: "percent", suffix: "%", tabLink: "channels" },
  { label: "Turns / Table", value: 1.86, previous: 1.74, change: 0.12, trend: "up", format: "decimal", tabLink: "turn-times" },
  { label: "Capacity Util.", value: 78.2, previous: 73.9, change: 4.3, trend: "up", format: "percent", suffix: "%", tabLink: "overview" },
]

export const dailyData: DailyEntry[] = [
  { date: "Dec 19", day: "Thu", covers: 92, revenue: 10120, noShows: 3 },
  { date: "Dec 20", day: "Fri", covers: 124, revenue: 14880, noShows: 5 },
  { date: "Dec 21", day: "Sat", covers: 138, revenue: 17940, noShows: 3 },
  { date: "Dec 22", day: "Sun", covers: 78, revenue: 7800, noShows: 4 },
  { date: "Dec 23", day: "Mon", covers: 68, revenue: 6120, noShows: 2 },
  { date: "Dec 24", day: "Tue", covers: 45, revenue: 5400, noShows: 1 },
  { date: "Dec 25", day: "Wed", covers: 0, revenue: 0, noShows: 0 },
  { date: "Dec 26", day: "Thu", covers: 82, revenue: 9020, noShows: 3 },
  { date: "Dec 27", day: "Fri", covers: 130, revenue: 15600, noShows: 6 },
  { date: "Dec 28", day: "Sat", covers: 142, revenue: 18460, noShows: 4 },
  { date: "Dec 29", day: "Sun", covers: 80, revenue: 8000, noShows: 3 },
  { date: "Dec 30", day: "Mon", covers: 72, revenue: 6480, noShows: 4 },
  { date: "Dec 31", day: "Tue", covers: 145, revenue: 21750, noShows: 2 },
  { date: "Jan 1", day: "Wed", covers: 55, revenue: 5500, noShows: 1 },
  { date: "Jan 2", day: "Thu", covers: 88, revenue: 9680, noShows: 4 },
  { date: "Jan 3", day: "Fri", covers: 126, revenue: 15120, noShows: 7 },
  { date: "Jan 4", day: "Sat", covers: 135, revenue: 17550, noShows: 2 },
  { date: "Jan 5", day: "Sun", covers: 74, revenue: 7400, noShows: 3 },
  { date: "Jan 6", day: "Mon", covers: 70, revenue: 6300, noShows: 5 },
  { date: "Jan 7", day: "Tue", covers: 85, revenue: 9350, noShows: 3 },
  { date: "Jan 8", day: "Wed", covers: 82, revenue: 8200, noShows: 4 },
  { date: "Jan 9", day: "Thu", covers: 94, revenue: 10340, noShows: 5 },
  { date: "Jan 10", day: "Fri", covers: 128, revenue: 15360, noShows: 8 },
  { date: "Jan 11", day: "Sat", covers: 140, revenue: 18200, noShows: 4 },
  { date: "Jan 12", day: "Sun", covers: 76, revenue: 7600, noShows: 4 },
  { date: "Jan 13", day: "Mon", covers: 74, revenue: 6660, noShows: 3 },
  { date: "Jan 14", day: "Tue", covers: 86, revenue: 9460, noShows: 4 },
  { date: "Jan 15", day: "Wed", covers: 80, revenue: 8000, noShows: 2 },
  { date: "Jan 16", day: "Thu", covers: 90, revenue: 9900, noShows: 3 },
  { date: "Jan 17", day: "Fri", covers: 118, revenue: 14160, noShows: 5 },
]

export const coversByDay: DayAvg[] = [
  { day: "Mon", avg: 72, prev: 65 },
  { day: "Tue", avg: 84, prev: 78 },
  { day: "Wed", avg: 81, prev: 76 },
  { day: "Thu", avg: 92, prev: 86 },
  { day: "Fri", avg: 128, prev: 118 },
  { day: "Sat", avg: 138, prev: 125 },
  { day: "Sun", avg: 76, prev: 72 },
]

export const coversByPeriod = [
  { period: "Breakfast", value: 12, fill: "#fbbf24" },
  { period: "Lunch", value: 28, fill: "#22d3ee" },
  { period: "Brunch", value: 18, fill: "#a78bfa" },
  { period: "Dinner", value: 42, fill: "#34d399" },
]

export const channelMix: Record<string, ChannelData> = {
  Direct: { covers: 1082, revenue: 128600, avgCheck: 118.80, noShowRate: 3.1, confirmRate: 96, costPerCover: 0 },
  Phone: { covers: 626, revenue: 72400, avgCheck: 115.60, noShowRate: 2.8, confirmRate: 94, costPerCover: 0 },
  Google: { covers: 427, revenue: 42700, avgCheck: 100.00, noShowRate: 12.1, confirmRate: 72, costPerCover: 2.50 },
  "Walk-in": { covers: 712, revenue: 68300, avgCheck: 95.90, noShowRate: 0, confirmRate: null, costPerCover: 0 },
}

export const partySizeDistribution: PartySizeEntry[] = [
  { size: "1", percentage: 8, avgCheck: 62 },
  { size: "2", percentage: 32, avgCheck: 98 },
  { size: "3-4", percentage: 28, avgCheck: 142 },
  { size: "5-6", percentage: 18, avgCheck: 195 },
  { size: "7-8", percentage: 10, avgCheck: 268 },
  { size: "9-10", percentage: 3, avgCheck: 345 },
  { size: "10+", percentage: 1, avgCheck: 480 },
]

export const revPASHData: RevPASHRow[] = [
  { day: "Mon", hours: { "17": 8, "18": 12, "19": 18, "20": 16, "21": 10, "22": 4 }, avg: 11.3 },
  { day: "Tue", hours: { "17": 9, "18": 14, "19": 20, "20": 19, "21": 12, "22": 5 }, avg: 13.2 },
  { day: "Wed", hours: { "17": 9, "18": 13, "19": 19, "20": 18, "21": 11, "22": 5 }, avg: 12.5 },
  { day: "Thu", hours: { "17": 10, "18": 15, "19": 22, "20": 21, "21": 14, "22": 6 }, avg: 14.7 },
  { day: "Fri", hours: { "17": 12, "18": 18, "19": 28, "20": 26, "21": 18, "22": 8 }, avg: 18.3 },
  { day: "Sat", hours: { "17": 14, "18": 20, "19": 30, "20": 28, "21": 20, "22": 10 }, avg: 20.3 },
  { day: "Sun", hours: { "17": 8, "18": 12, "19": 16, "20": 14, "21": 9, "22": 3 }, avg: 10.3 },
]
export const revPASHMeta = { peak: 30, target: 20, average: 14.4 }

export const noShowByDay: NoShowByItem[] = [
  { day: "Mon", rate: 5.2 }, { day: "Tue", rate: 4.1 }, { day: "Wed", rate: 3.8 },
  { day: "Thu", rate: 4.5 }, { day: "Fri", rate: 5.6 }, { day: "Sat", rate: 2.8 }, { day: "Sun", rate: 4.8 },
]
export const noShowByTime: NoShowByItem[] = [
  { slot: "5-6 PM", rate: 2.8 }, { slot: "6-7 PM", rate: 3.5 }, { slot: "7-8 PM", rate: 5.8 },
  { slot: "8-9 PM", rate: 4.9 }, { slot: "9-10 PM", rate: 6.2 }, { slot: "Lunch", rate: 2.1 },
]
export const noShowByChannel: NoShowByItem[] = [
  { channel: "Direct", rate: 3.1 }, { channel: "Phone", rate: 2.8 },
  { channel: "Google", rate: 12.1 }, { channel: "Walk-in", rate: 0 }, { channel: "Instagram", rate: 7.5 },
]
export const noShowByGuestType: NoShowByItem[] = [
  { type: "VIP", rate: 0.8 }, { type: "Regular", rate: 2.2 },
  { type: "New guest", rate: 8.4 }, { type: "Flagged", rate: 34 },
]
export const noShowRevenueImpact = { lostRevenue: 14280, avgNoShowCheck: 119, recoveredPercent: 38, recoveredAmount: 5426, netLoss: 8854 }
export const repeatOffenders: RepeatOffender[] = [
  { name: "Morrison", noShows: 2, totalBookings: 3, rate: 67, status: "flagged" },
  { name: "Baker", noShows: 3, totalBookings: 5, rate: 60, status: "flagged" },
  { name: "Unknown (Google)", noShows: 2, totalBookings: 2, rate: 100, status: "blocked" },
]

export const turnTimeByParty: TurnTimeByParty[] = [
  { size: "1 guest", target: 60, actual: 54, variance: -6, status: "under" },
  { size: "2 guests", target: 75, actual: 78, variance: 3, status: "slight_over" },
  { size: "3-4 guests", target: 90, actual: 88, variance: -2, status: "on_target" },
  { size: "5-6 guests", target: 105, actual: 112, variance: 7, status: "over" },
  { size: "7-8 guests", target: 120, actual: 134, variance: 14, status: "significant_over" },
  { size: "9-10 guests", target: 135, actual: 148, variance: 13, status: "significant_over" },
]
export const turnDistribution: TurnDistribution[] = [
  { range: "45-60", count: 142 }, { range: "60-75", count: 389 },
  { range: "75-90", count: 512 }, { range: "90-105", count: 324 },
  { range: "105-120", count: 186 }, { range: "120-135", count: 98 }, { range: "135-150+", count: 42 },
]
export const turnTimeMeta = { median: 82, mean: 88, stdDev: 18 }
export const turnTimeByDay = [
  { day: "Mon", avg: 78 }, { day: "Tue", avg: 82 }, { day: "Wed", avg: 80 },
  { day: "Thu", avg: 84 }, { day: "Fri", avg: 92 }, { day: "Sat", avg: 98 }, { day: "Sun", avg: 82 },
]
export const turnTimeByZone = [
  { zone: "Main Dining", avg: 86 }, { zone: "Patio", avg: 72 }, { zone: "Private Room", avg: 108 },
]
export const turnTimeTrend: TurnTimeTrendWeek[] = [
  { week: "W1", avg: 90, target: 82 }, { week: "W2", avg: 88, target: 82 }, { week: "W3", avg: 86, target: 82 },
  { week: "W4", avg: 84, target: 82 }, { week: "W5", avg: 89, target: 82 }, { week: "W6", avg: 87, target: 82 },
  { week: "W7", avg: 85, target: 82 }, { week: "W8", avg: 86, target: 82 }, { week: "W9", avg: 83, target: 82 },
  { week: "W10", avg: 82, target: 82 }, { week: "W11", avg: 80, target: 82 }, { week: "W12", avg: 82, target: 82 },
]

export const channelTrend: ChannelTrendWeek[] = [
  { week: "W1", direct: 82, phone: 52, google: 28, walkIn: 56 },
  { week: "W2", direct: 85, phone: 50, google: 30, walkIn: 58 },
  { week: "W3", direct: 80, phone: 48, google: 32, walkIn: 55 },
  { week: "W4", direct: 88, phone: 55, google: 29, walkIn: 60 },
  { week: "W5", direct: 84, phone: 53, google: 34, walkIn: 57 },
  { week: "W6", direct: 90, phone: 51, google: 33, walkIn: 59 },
  { week: "W7", direct: 86, phone: 49, google: 36, walkIn: 56 },
  { week: "W8", direct: 92, phone: 54, google: 35, walkIn: 58 },
  { week: "W9", direct: 88, phone: 50, google: 38, walkIn: 60 },
  { week: "W10", direct: 94, phone: 52, google: 37, walkIn: 57 },
  { week: "W11", direct: 91, phone: 48, google: 40, walkIn: 59 },
  { week: "W12", direct: 96, phone: 50, google: 39, walkIn: 61 },
]

export const waitlistAnalysis = {
  kpis: {
    totalParties: { value: 312, change: 18 },
    conversionRate: { value: 78.2, change: 4.2 },
    avgWaitTime: { value: 22, change: -3 },
    quoteAccuracy: { value: 84.6, change: 6.1 },
  },
  waitDistribution: [
    { range: "0-10 min", count: 42, percentage: 17 },
    { range: "10-20 min", count: 68, percentage: 28 },
    { range: "20-30 min", count: 62, percentage: 25 },
    { range: "30-45 min", count: 38, percentage: 15 },
    { range: "45-60 min", count: 22, percentage: 9 },
    { range: "60+ min", count: 16, percentage: 6, abandonRate: 68 },
  ] as WaitDistEntry[],
  quoteAccuracy: { early: 18, onTime: 67, late: 15, avgOverquote: 4, avgUnderquote: -8 },
  barSpend: { partiesAtBar: 62, avgSpend: 34.50, totalRevenue: 6676, avgTransferred: 28.40, transferRate: 82 },
  abandonment: { total: 68, rate: 21.8, beforeQuote: 22, atQuote: 28, afterQuote: 18, avgWaitBeforeLeaving: 34, worstPartySize: "5-6" },
}

export const revenueByZone: ZoneRevenue[] = [
  { zone: "Main Dining", revenue: 198400, percentage: 63.6, seats: 52, revenuePerSeat: 3815 },
  { zone: "Patio", revenue: 62400, percentage: 20.0, seats: 18, revenuePerSeat: 3467 },
  { zone: "Private Room", revenue: 51200, percentage: 16.4, seats: 14, revenuePerSeat: 3657 },
]

export const revenueByTable: TableRevenue[] = [
  { table: "T12", revenue: 18200, features: "window", server: "Mike" },
  { table: "T17", revenue: 16800, features: "round 6-top", server: "Lisa" },
  { table: "T7", revenue: 15400, features: "booth", server: "Mike" },
  { table: "T23", revenue: 14900, features: "private", server: "Jordan" },
  { table: "T22", revenue: 13200, features: "patio 6-top", server: "Carlos" },
  { table: "T8", revenue: 12800, features: "merged often", server: "Mike" },
  { table: "T10", revenue: 11600, features: "", server: "Mike" },
  { table: "T14", revenue: 11200, features: "", server: "Lisa" },
  { table: "T15", revenue: 10800, features: "", server: "Lisa" },
  { table: "T9", revenue: 10600, features: "merged often", server: "Mike" },
]

export const overviewInsights = [
  "Saturday covers up 15% -- consider adding a late-night seating at 9:30 PM",
  "Monday remains slowest -- a Monday promotion could lift covers by ~20",
  "Google Reserve no-show rate (12%) is 3x higher than direct (3.8%)",
  "2-tops make up 32% of covers but only 18% of revenue -- upsell opportunity",
]

// helpers
export function formatCurrency(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
  return `$${n.toLocaleString()}`
}
export function formatKpiValue(kpi: KpiItem) {
  if (kpi.format === "currency" && kpi.value >= 1000) return formatCurrency(kpi.value)
  if (kpi.format === "currency") return `$${kpi.value}`
  if (kpi.prefix || kpi.suffix) return `${kpi.prefix ?? ""}${kpi.value.toLocaleString()}${kpi.suffix ?? ""}`
  return kpi.value.toLocaleString()
}
export function trendIsPositive(trend: KpiItem["trend"]) {
  return trend === "up" || trend === "down_good"
}
