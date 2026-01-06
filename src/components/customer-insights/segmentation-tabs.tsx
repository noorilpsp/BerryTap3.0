"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  AreaChart,
  Area,
} from "recharts"
import { Users, DollarSign, Clock, TrendingUp, GitCompare, Crown, Gem, Star, UserPlus, ArrowRight, Lightbulb, Calendar, UtensilsCrossed } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

const ageData = [
  { age: "18-24", count: 342, percent: 12.0, avgSpend: 94.50, revenue: 32319, growth: 18.3, color: "hsl(280, 100%, 70%)" },
  { age: "25-34", count: 867, percent: 30.5, avgSpend: 132.25, revenue: 114661, growth: 12.7, color: "hsl(221, 83%, 53%)" },
  { age: "35-44", count: 734, percent: 25.8, avgSpend: 162.75, revenue: 119459, growth: 8.1, color: "hsl(142, 76%, 36%)" },
  { age: "45-54", count: 512, percent: 18.0, avgSpend: 148.90, revenue: 76237, growth: 5.4, color: "hsl(25, 95%, 53%)" },
  { age: "55-64", count: 281, percent: 9.9, avgSpend: 178.40, revenue: 50130, growth: 3.2, color: "hsl(10, 79%, 63%)" },
  { age: "65+", count: 111, percent: 3.9, avgSpend: 196.80, revenue: 21845, growth: 6.8, color: "hsl(330, 81%, 60%)" },
]

const geoData = [
  { city: "San Francisco", count: 578, percent: 20.3, avgSpend: 174.50, revenue: 100861 },
  { city: "Oakland", count: 432, percent: 15.2, avgSpend: 142.30, revenue: 61474 },
  { city: "San Jose", count: 394, percent: 13.8, avgSpend: 138.90, revenue: 54727 },
  { city: "Berkeley", count: 287, percent: 10.1, avgSpend: 156.20, revenue: 44829 },
  { city: "Daly City", count: 234, percent: 8.2, avgSpend: 128.40, revenue: 30046 },
  { city: "Fremont", count: 198, percent: 7.0, avgSpend: 135.60, revenue: 26849 },
  { city: "Hayward", count: 167, percent: 5.9, avgSpend: 122.80, revenue: 20508 },
  { city: "Alameda", count: 143, percent: 5.0, avgSpend: 131.20, revenue: 18762 },
  { city: "San Mateo", count: 128, percent: 4.5, avgSpend: 129.80, revenue: 16614 },
  { city: "Others", count: 286, percent: 10.0, avgSpend: 125.40, revenue: 35864 },
]

const spendingTiers = [
  {
    name: "VIP",
    icon: Crown,
    threshold: "$1,000+",
    count: 184,
    percent: 6.5,
    avgLtv: 2847.30,
    avgOrders: 23.4,
    avgOrderValue: 121.70,
    visitFreq: "2.1/week",
    revenuePercent: 38.2,
    retention: 94.6,
    growth: 15.7,
  },
  {
    name: "High-Value",
    icon: Gem,
    threshold: "$500-$999",
    count: 412,
    percent: 14.5,
    avgLtv: 724.60,
    avgOrders: 11.8,
    avgOrderValue: 61.40,
    visitFreq: "1.3/week",
    revenuePercent: 26.4,
    retention: 82.3,
    growth: 9.3,
  },
  {
    name: "Regular",
    icon: Star,
    threshold: "$100-$499",
    count: 1278,
    percent: 44.9,
    avgLtv: 247.80,
    avgOrders: 5.2,
    avgOrderValue: 47.60,
    visitFreq: "0.6/week",
    revenuePercent: 28.1,
    retention: 68.9,
    growth: 7.2,
  },
  {
    name: "New/Occasional",
    icon: UserPlus,
    threshold: "Under $100",
    count: 973,
    percent: 34.2,
    avgLtv: 43.20,
    avgOrders: 1.8,
    avgOrderValue: 24.00,
    visitFreq: "0.2/week",
    revenuePercent: 7.4,
    retention: 31.2,
    growth: 22.1,
  },
]

const lifecycleStages = [
  { stage: "New Arrivals", visits: "1-2 visits", period: "30 days", count: 847, percent: 29.7, avgSpend: 32.40, revenue: 27443, conversion: 60.4, icon: UserPlus },
  { stage: "Exploring", visits: "3-5 visits", period: "60 days", count: 512, percent: 18.0, avgSpend: 178.60, revenue: 91443, conversion: 51.2, icon: Users },
  { stage: "Engaged", visits: "6-12 visits", period: "90 days", count: 634, percent: 22.3, avgSpend: 487.20, revenue: 309085, conversion: 45.7, icon: Star },
  { stage: "Loyal", visits: "13-25 visits", period: "180 days", count: 523, percent: 18.4, avgSpend: 1124.80, revenue: 588270, conversion: 38.3, icon: TrendingUp },
  { stage: "Champions", visits: "26+ visits", period: "Lifetime", count: 331, percent: 11.6, avgSpend: 3247.90, revenue: 1075055, conversion: null, icon: Crown },
]

const lifecycleTrendData = [
  { stage: "New", value: 32 },
  { stage: "Explore", value: 89 },
  { stage: "Engage", value: 122 },
  { stage: "Loyal", value: 112 },
  { stage: "Champion", value: 137 },
]

const segmentOptions = [
  "25-34 years",
  "35-44 years",
  "VIP Customers",
  "High-Value Customers",
  "Regular Customers",
  "San Francisco",
  "Oakland",
  "Weekend Visitors",
  "Weekday Visitors",
]

const heatmapData = [
  { day: "Sun", hours: [8, 23, 19, 12, 9, 18, 42, 67, 51, 34, 22, 14, 7], total: 347 },
  { day: "Mon", hours: [12, 28, 15, 10, 8, 13, 38, 56, 42, 31, 19, 11, 6], total: 412 },
  { day: "Tue", hours: [9, 24, 14, 8, 7, 11, 34, 52, 39, 27, 16, 9, 5], total: 385 },
  { day: "Wed", hours: [11, 26, 21, 13, 10, 15, 37, 58, 48, 33, 18, 12, 6], total: 428 },
  { day: "Thu", hours: [10, 25, 18, 11, 9, 20, 44, 64, 53, 36, 21, 13, 7], total: 456 },
  { day: "Fri", hours: [14, 32, 27, 16, 14, 26, 72, 89, 84, 61, 38, 23, 12], total: 678 },
  { day: "Sat", hours: [28, 47, 43, 32, 29, 49, 94, 107, 112, 98, 67, 41, 18], total: 847 },
]

const hourLabels = ["11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm", "7pm", "8pm", "9pm", "10pm", "11pm"]

const getHeatmapColor = (count: number) => {
  if (count >= 56) return "hsl(221, 83%, 40%)"  // Peak
  if (count >= 36) return "hsl(221, 83%, 55%)"  // High
  if (count >= 16) return "hsl(221, 83%, 75%)"  // Medium
  return "hsl(221, 83%, 95%)"  // Low
}

const getHeatmapIntensity = (count: number) => {
  if (count >= 56) return "Peak"
  if (count >= 36) return "High"
  if (count >= 16) return "Medium"
  return "Low"
}

const frequencyDistData = [
  { visits: "1", customers: 847, percent: 29.7 },
  { visits: "2", customers: 463, percent: 16.3 },
  { visits: "3", customers: 328, percent: 11.5 },
  { visits: "4", customers: 247, percent: 8.7 },
  { visits: "5", customers: 189, percent: 6.6 },
  { visits: "6-8", customers: 142, percent: 5.0 },
  { visits: "9-12", customers: 208, percent: 7.3 },
  { visits: "13-20", customers: 176, percent: 6.2 },
  { visits: "21-30", customers: 134, percent: 4.7 },
  { visits: "31+", customers: 113, percent: 4.0 },
]

const cohortData = [
  { cohort: "Aug 2024", m0: 100, m1: 68, m2: 54, m3: 47, m4: 43, m5: 39, m6: 37, size: 324 },
  { cohort: "Sep 2024", m0: 100, m1: 71, m2: 58, m3: 51, m4: 46, m5: 42, m6: null, size: 287 },
  { cohort: "Oct 2024", m0: 100, m1: 74, m2: 62, m3: 54, m4: 49, m5: null, m6: null, size: 412 },
  { cohort: "Nov 2024", m0: 100, m1: 76, m2: 64, m3: 56, m4: null, m5: null, m6: null, size: 398 },
  { cohort: "Dec 2024", m0: 100, m1: 73, m2: 61, m3: null, m4: null, m5: null, m6: null, size: 445 },
  { cohort: "Jan 2025", m0: 100, m1: 69, m2: null, m3: null, m4: null, m5: null, m6: null, size: 534 },
  { cohort: "Feb 2025", m0: 100, m1: null, m2: null, m3: null, m4: null, m5: null, m6: null, size: 447 },
]

const getCohortColor = (value: number | null) => {
  if (value === null) return "bg-muted/30 text-muted-foreground"
  if (value >= 75) return "bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100"
  if (value >= 60) return "bg-yellow-100 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100"
  if (value >= 45) return "bg-orange-100 dark:bg-orange-950 text-orange-900 dark:text-orange-100"
  return "bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100"
}

const reservationData = [
  { hour: "11am", reservations: 12, walkIns: 80, total: 92 },
  { hour: "12pm", reservations: 28, walkIns: 177, total: 205 },
  { hour: "1pm", reservations: 18, walkIns: 139, total: 157 },
  { hour: "2pm", reservations: 8, walkIns: 94, total: 102 },
  { hour: "3pm", reservations: 6, walkIns: 80, total: 86 },
  { hour: "4pm", reservations: 15, walkIns: 137, total: 152 },
  { hour: "5pm", reservations: 47, walkIns: 314, total: 361 },
  { hour: "6pm", reservations: 61, walkIns: 432, total: 493 },
  { hour: "7pm", reservations: 64, walkIns: 365, total: 429 },
  { hour: "8pm", reservations: 42, walkIns: 278, total: 320 },
  { hour: "9pm", reservations: 23, walkIns: 178, total: 201 },
  { hour: "10pm", reservations: 12, walkIns: 111, total: 123 },
  { hour: "11pm", reservations: 5, walkIns: 56, total: 61 },
]

const waitTimeData = [
  { hour: "11am", avgWait: 8 },
  { hour: "12pm", avgWait: 12 },
  { hour: "1pm", avgWait: 10 },
  { hour: "2pm", avgWait: 4 },
  { hour: "3pm", avgWait: 4 },
  { hour: "4pm", avgWait: 8 },
  { hour: "5pm", avgWait: 18 },
  { hour: "6pm", avgWait: 28 },
  { hour: "7pm", avgWait: 32 },
  { hour: "8pm", avgWait: 26 },
  { hour: "9pm", avgWait: 18 },
  { hour: "10pm", avgWait: 12 },
  { hour: "11pm", avgWait: 8 },
]

const menuItemsData = [
  { rank: 1, name: "Grilled Salmon", category: "Mains", orders: 2081, revenue: 99888, avgPrice: 48, reorderRate: 68.6, segment: "VIP, High-Value" },
  { rank: 2, name: "Caesar Salad", category: "Appetizers", orders: 2656, revenue: 63744, avgPrice: 24, reorderRate: 69.5, segment: "All Segments" },
  { rank: 3, name: "Ribeye Steak", category: "Mains", orders: 1615, revenue: 121125, avgPrice: 75, reorderRate: 81.0, segment: "VIP" },
  { rank: 4, name: "Margherita Pizza", category: "Mains", orders: 1779, revenue: 35580, avgPrice: 20, reorderRate: 78.8, segment: "Regular" },
  { rank: 5, name: "Chicken Burger", category: "Mains", orders: 1089, revenue: 21780, avgPrice: 20, reorderRate: 45.2, segment: "Regular, New" },
  { rank: 6, name: "Chocolate Cake", category: "Desserts", orders: 1190, revenue: 23800, avgPrice: 20, reorderRate: 75.5, segment: "All Segments" },
  { rank: 7, name: "Fish Tacos", category: "Mains", orders: 823, revenue: 16460, avgPrice: 20, reorderRate: 52.3, segment: "Regular" },
  { rank: 8, name: "Lobster Tail", category: "Mains", orders: 612, revenue: 48960, avgPrice: 80, reorderRate: 72.4, segment: "VIP" },
  { rank: 9, name: "Garden Salad", category: "Appetizers", orders: 712, revenue: 10680, avgPrice: 15, reorderRate: 38.7, segment: "Regular" },
  { rank: 10, name: "Wagyu Burger", category: "Mains", orders: 534, revenue: 26700, avgPrice: 50, reorderRate: 65.8, segment: "VIP" },
  { rank: 11, name: "Truffle Pasta", category: "Mains", orders: 487, revenue: 24350, avgPrice: 50, reorderRate: 58.9, segment: "VIP" },
  { rank: 12, name: "Tiramisu", category: "Desserts", orders: 456, revenue: 9120, avgPrice: 20, reorderRate: 68.2, segment: "All Segments" },
  { rank: 13, name: "Bruschetta", category: "Appetizers", orders: 389, revenue: 7780, avgPrice: 20, reorderRate: 42.1, segment: "Regular" },
  { rank: 14, name: "Filet Mignon", category: "Mains", orders: 312, revenue: 37440, avgPrice: 120, reorderRate: 78.5, segment: "VIP" },
  { rank: 15, name: "Caprese Salad", category: "Appetizers", orders: 278, revenue: 6680, avgPrice: 24, reorderRate: 51.8, segment: "Regular" },
  { rank: 16, name: "New York Strip", category: "Mains", orders: 267, revenue: 24030, avgPrice: 90, reorderRate: 71.2, segment: "VIP, High-Value" },
  { rank: 17, name: "Creme Brulee", category: "Desserts", orders: 234, revenue: 4680, avgPrice: 20, reorderRate: 64.5, segment: "All Segments" },
  { rank: 18, name: "Shrimp Scampi", category: "Mains", orders: 198, revenue: 15840, avgPrice: 80, reorderRate: 55.6, segment: "High-Value" },
  { rank: 19, name: "Burrata Salad", category: "Appetizers", orders: 167, revenue: 5010, avgPrice: 30, reorderRate: 48.5, segment: "VIP" },
  { rank: 20, name: "Cheesecake", category: "Desserts", orders: 145, revenue: 2900, avgPrice: 20, reorderRate: 59.3, segment: "Regular" },
]

const vipTopItems = [
  { name: "Ribeye Steak", orders: 847, revenue: 63525 },
  { name: "Grilled Salmon", orders: 723, revenue: 34704 },
  { name: "Lobster Tail", orders: 612, revenue: 48960 },
  { name: "Wagyu Burger", orders: 534, revenue: 26700 },
  { name: "Truffle Pasta", orders: 487, revenue: 24350 },
]

const regularTopItems = [
  { name: "Caesar Salad", orders: 1234, revenue: 29616 },
  { name: "Chicken Burger", orders: 1089, revenue: 21780 },
  { name: "Margherita Pizza", orders: 956, revenue: 19120 },
  { name: "Fish Tacos", orders: 823, revenue: 16460 },
  { name: "Garden Salad", orders: 712, revenue: 10680 },
]

const categoryRevenueData = [
  { category: "Mains", revenue: 147890, percent: 59.6, avgOrderValue: 52.40, itemCount: 12, trend: 12.3 },
  { category: "Appetizers", revenue: 48230, percent: 19.5, avgOrderValue: 18.60, itemCount: 8, trend: 8.7 },
  { category: "Desserts", revenue: 32450, percent: 13.1, avgOrderValue: 19.80, itemCount: 6, trend: 5.4 },
  { category: "Beverages", revenue: 19320, percent: 7.8, avgOrderValue: 12.50, itemCount: 15, trend: 15.2 },
]

const reorderRateData = [
  { item: "Ribeye Steak", firstOrders: 892, reorders: 723, reorderRate: 81.0, trend: 7.1 },
  { item: "Margherita Pizza", firstOrders: 1045, reorders: 823, reorderRate: 78.8, trend: 4.6 },
  { item: "Filet Mignon", firstOrders: 312, reorders: 245, reorderRate: 78.5, trend: 6.3 },
  { item: "Chocolate Cake", firstOrders: 678, reorders: 512, reorderRate: 75.5, trend: 2.4 },
  { item: "Caesar Salad", firstOrders: 1567, reorders: 1089, reorderRate: 69.5, trend: 3.8 },
  { item: "Grilled Salmon", firstOrders: 1234, reorders: 847, reorderRate: 68.6, trend: 5.2 },
]

const dietaryPreferencesData = [
  { preference: "Vegetarian", customers: 847, percent: 29.7, revenue: 124560, avgSpend: 147.00, growth: 18.3 },
  { preference: "Vegan", customers: 234, percent: 8.2, revenue: 28340, avgSpend: 121.00, growth: 24.7 },
  { preference: "Gluten-Free", customers: 512, percent: 18.0, revenue: 67890, avgSpend: 132.60, growth: 12.4 },
  { preference: "Keto", customers: 189, percent: 6.6, revenue: 34210, avgSpend: 181.00, growth: 8.9 },
  { preference: "Dairy-Free", customers: 423, percent: 14.9, revenue: 56780, avgSpend: 134.20, growth: 15.6 },
  { preference: "Paleo", customers: 98, percent: 3.4, revenue: 18420, avgSpend: 187.80, growth: 6.2 },
  { preference: "Halal", customers: 156, percent: 5.5, revenue: 23440, avgSpend: 150.30, growth: 9.8 },
  { preference: "Kosher", customers: 67, percent: 2.4, revenue: 12340, avgSpend: 184.20, growth: 4.1 },
]

const allergenData = [
  { allergen: "Shellfish", customers: 156, percent: 5.5, severity: "High", itemsAffected: 8 },
  { allergen: "Peanuts", customers: 89, percent: 3.1, severity: "High", itemsAffected: 3 },
  { allergen: "Tree Nuts", customers: 234, percent: 8.2, severity: "Medium", itemsAffected: 12 },
  { allergen: "Dairy", customers: 423, percent: 14.9, severity: "Info", itemsAffected: 18 },
  { allergen: "Gluten", customers: 512, percent: 18.0, severity: "Info", itemsAffected: 24 },
  { allergen: "Soy", customers: 67, percent: 2.4, severity: "Info", itemsAffected: 15 },
  { allergen: "Eggs", customers: 45, percent: 1.6, severity: "Medium", itemsAffected: 9 },
]

const DIETARY_COLORS = [
  "hsl(280, 100%, 70%)",
  "hsl(142, 76%, 36%)",
  "hsl(25, 95%, 53%)",
  "hsl(221, 83%, 53%)",
  "hsl(330, 81%, 60%)",
  "hsl(10, 79%, 63%)",
  "hsl(190, 80%, 45%)",
  "hsl(45, 93%, 47%)",
]

export function SegmentationTabs() {
  const [compareSegmentA, setCompareSegmentA] = useState("25-34 years")
  const [compareSegmentB, setCompareSegmentB] = useState("35-44 years")
  const [showPercentages, setShowPercentages] = useState(false)

  const radarData = [
    { metric: "Spend Level", segmentA: 85, segmentB: 95 },
    { metric: "Frequency", segmentA: 70, segmentB: 80 },
    { metric: "Order Size", segmentA: 75, segmentB: 85 },
    { metric: "Recency", segmentA: 80, segmentB: 70 },
    { metric: "Retention", segmentA: 82, segmentB: 89 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Customer Segmentation & Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="demographics" className="w-full">
          <TabsList className="grid w-full grid-cols-6 h-auto">
            <TabsTrigger value="demographics" className="flex items-center gap-2 data-[state=active]:border-b-[3px] data-[state=active]:border-primary">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Demographics</span>
            </TabsTrigger>
            <TabsTrigger value="spending" className="flex items-center gap-2 data-[state=active]:border-b-[3px] data-[state=active]:border-primary">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Spending Tiers</span>
            </TabsTrigger>
            <TabsTrigger value="visits" className="flex items-center gap-2 data-[state=active]:border-b-[3px] data-[state=active]:border-primary">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Visit Patterns</span>
            </TabsTrigger>
            <TabsTrigger value="lifecycle" className="flex items-center gap-2 data-[state=active]:border-b-[3px] data-[state=active]:border-primary">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Lifecycle</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2 data-[state=active]:border-b-[3px] data-[state=active]:border-primary">
              <UtensilsCrossed className="w-4 h-4" />
              <span className="hidden sm:inline">Menu Affinity</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="flex items-center gap-2 data-[state=active]:border-b-[3px] data-[state=active]:border-primary">
              <GitCompare className="w-4 h-4" />
              <span className="hidden sm:inline">Compare</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Demographics */}
          <TabsContent value="demographics" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Age Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-full max-w-[320px] h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ageData}
                            cx="50%"
                            cy="50%"
                            innerRadius={90}
                            outerRadius={130}
                            paddingAngle={2}
                            dataKey="count"
                            label={(entry) => entry.percent > 10 ? `${entry.percent}%` : ''}
                          >
                            {ageData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload
                                return (
                                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                    <p className="font-semibold">{data.age} years</p>
                                    <p className="text-sm">Count: {data.count.toLocaleString()}</p>
                                    <p className="text-sm">Percent: {data.percent}%</p>
                                    <p className="text-sm">Avg Spend: ${data.avgSpend}</p>
                                    <p className="text-sm text-green-600">Growth: ↗{data.growth}%</p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-3xl font-bold">
                            2,847
                          </text>
                          <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-sm">
                            Total Customers
                          </text>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Age Group</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">%</TableHead>
                        <TableHead className="text-right">Avg $</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ageData.map((row) => (
                        <TableRow key={row.age}>
                          <TableCell className="font-medium">{row.age}</TableCell>
                          <TableCell className="text-right">{row.count.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{row.percent}%</TableCell>
                          <TableCell className="text-right">${row.avgSpend.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Geographic Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Geographic Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-[380px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={geoData} layout="vertical" margin={{ left: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                        <YAxis type="category" dataKey="city" stroke="hsl(var(--muted-foreground))" width={80} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              return (
                                <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                  <p className="font-semibold">{data.city}</p>
                                  <p className="text-sm">Customers: {data.count.toLocaleString()}</p>
                                  <p className="text-sm">Percent: {data.percent}%</p>
                                  <p className="text-sm">Avg Spend: ${data.avgSpend}</p>
                                  <p className="text-sm">Revenue: ${data.revenue.toLocaleString()}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                          {geoData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.city === "Others" ? "hsl(var(--muted))" : `hsl(221, 83%, ${53 - index * 5}%)`}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Insight</p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">SF customers have 23% higher avg order value</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: Spending Tiers */}
          <TabsContent value="spending" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {spendingTiers.map((tier) => {
                const Icon = tier.icon
                const isVip = tier.name === "VIP"
                const isHighValue = tier.name === "High-Value"
                const isNew = tier.name === "New/Occasional"
                
                return (
                  <Card 
                    key={tier.name} 
                    className={
                      isVip 
                        ? "bg-gradient-to-br from-amber-500 to-yellow-600 text-amber-950 border-amber-600" 
                        : isHighValue
                        ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
                        : isNew
                        ? "bg-muted/30"
                        : ""
                    }
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className={`w-6 h-6 ${isVip ? "text-amber-900" : "text-muted-foreground"}`} />
                        <Badge 
                          variant={isVip ? "default" : "secondary"} 
                          className={isVip ? "bg-amber-900 text-amber-50 hover:bg-amber-900" : ""}
                        >
                          {tier.name}
                        </Badge>
                      </div>
                      <p className={`text-2xl font-bold mb-1 ${isVip ? "text-amber-950" : ""}`}>
                        {tier.threshold}
                      </p>
                      <p className={`text-sm mb-4 ${isVip ? "text-amber-900/80" : "text-muted-foreground"}`}>
                        {tier.count.toLocaleString()} customers ({tier.percent}% of base)
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className={isVip ? "text-amber-900/80" : "text-muted-foreground"}>Avg LTV:</span>
                          <span className={`font-semibold ${isVip ? "text-amber-950" : ""}`}>
                            ${tier.avgLtv.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isVip ? "text-amber-900/80" : "text-muted-foreground"}>Avg Orders:</span>
                          <span className={`font-semibold ${isVip ? "text-amber-950" : ""}`}>
                            {tier.avgOrders}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isVip ? "text-amber-900/80" : "text-muted-foreground"}>Revenue:</span>
                          <span className={`font-semibold ${isVip ? "text-amber-950" : ""}`}>
                            {tier.revenuePercent}%
                          </span>
                        </div>
                        <div className={`flex items-center gap-1 font-semibold mt-3 ${isVip ? "text-green-700" : "text-green-600 dark:text-green-400"}`}>
                          <TrendingUp className="w-4 h-4" />
                          <span>+{tier.growth}%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Comparison Table</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-right">VIP</TableHead>
                      <TableHead className="text-right">High-Value</TableHead>
                      <TableHead className="text-right">Regular</TableHead>
                      <TableHead className="text-right">New/Occ.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Customers</TableCell>
                      {spendingTiers.map((tier) => (
                        <TableCell key={tier.name} className="text-right">
                          {tier.count.toLocaleString()} ({tier.percent}%)
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Avg LTV</TableCell>
                      {spendingTiers.map((tier) => (
                        <TableCell key={tier.name} className="text-right">
                          ${tier.avgLtv.toLocaleString()}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Avg Orders</TableCell>
                      {spendingTiers.map((tier) => (
                        <TableCell key={tier.name} className="text-right">
                          {tier.avgOrders}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Avg Order $</TableCell>
                      {spendingTiers.map((tier) => (
                        <TableCell key={tier.name} className="text-right">
                          ${tier.avgOrderValue}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Visit Freq</TableCell>
                      {spendingTiers.map((tier) => (
                        <TableCell key={tier.name} className="text-right">
                          {tier.visitFreq}
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Revenue %</TableCell>
                      {spendingTiers.map((tier) => (
                        <TableCell key={tier.name} className="text-right">
                          {tier.revenuePercent}%
                        </TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Retention</TableCell>
                      {spendingTiers.map((tier) => (
                        <TableCell key={tier.name} className="text-right">
                          {tier.retention}%
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Insights</p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• 23 Regular customers approaching High-Value ($450-$499) → Send promotion</li>
                    <li>• 47 VIP customers haven't visited in 30+ days → Re-engagement needed</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Visit Patterns */}
          <TabsContent value="visits" className="mt-6 space-y-6">
            
            {/* Visit Frequency Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Visit Pattern Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Visit Frequency Heatmap (Day × Hour)</h3>
                  
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                      <div className="grid gap-0.5" style={{ gridTemplateColumns: `80px repeat(13, 1fr) 60px` }}>
                        {/* Header Row */}
                        <div className="h-12" />
                        {hourLabels.map((hour) => (
                          <div key={hour} className="text-xs font-medium text-center flex items-end justify-center pb-2 text-muted-foreground">
                            {hour}
                          </div>
                        ))}
                        <div className="text-xs font-medium text-center flex items-end justify-center pb-2 text-muted-foreground">
                          Total
                        </div>

                        {/* Heatmap Rows */}
                        {heatmapData.map((row) => (
                          <>
                            <div key={`${row.day}-label`} className="flex items-center justify-end pr-3 text-sm font-medium">
                              {row.day}
                            </div>
                            {row.hours.map((count, idx) => (
                              <div
                                key={`${row.day}-${idx}`}
                                className="aspect-square flex items-center justify-center text-xs font-medium rounded border border-border/50 hover:border-border hover:scale-105 transition-all cursor-pointer"
                                style={{ backgroundColor: getHeatmapColor(count) }}
                                title={`${row.day} ${hourLabels[idx]}: ${count} visits (${getHeatmapIntensity(count)})`}
                              >
                                <span className={count >= 36 ? "text-white" : "text-foreground"}>
                                  {count}
                                </span>
                              </div>
                            ))}
                            <div key={`${row.day}-total`} className="flex items-center justify-center text-sm font-semibold">
                              {row.total}
                            </div>
                          </>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 mt-6 flex-wrap text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: "hsl(221, 83%, 95%)" }} />
                      <span className="text-muted-foreground">Low (1-15)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: "hsl(221, 83%, 75%)" }} />
                      <span className="text-muted-foreground">Medium (16-35)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: "hsl(221, 83%, 55%)" }} />
                      <span className="text-muted-foreground">High (36-55)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded" style={{ backgroundColor: "hsl(221, 83%, 40%)" }} />
                      <span className="text-white font-medium">Peak (56+)</span>
                    </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground mt-4">
                    Total: 3,553 visits
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Key Insights</p>
                      <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <li>🕐 <strong>Busiest:</strong> Saturday 7:00 PM (112 visits/week)</li>
                        <li>📈 <strong>Growing:</strong> Friday 5:00-7:00 PM (+24.7% growth)</li>
                        <li>⚠️ <strong>Underutilized:</strong> Mon-Wed 2:00-4:00 PM (9 visits/day avg)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Visit Frequency Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visit Frequency Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={frequencyDistData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="visits" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-semibold">{data.visits} visit{data.visits === "1" ? "" : "s"}</p>
                                <p className="text-sm">Customers: {data.customers.toLocaleString()}</p>
                                <p className="text-sm">Percent: {data.percent}%</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="customers" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Distribution: 29.7% one-time, 16.3% two-time, 11.5% three-time visitors</p>
                  <p className="font-medium">Top 10% (287 customers) = 41.3% of visits, 46.8% of revenue</p>
                </div>
              </CardContent>
            </Card>

            {/* Cohort Retention Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Cohort Retention Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[100px]">Cohort</TableHead>
                        <TableHead className="text-center">M0</TableHead>
                        <TableHead className="text-center">M1</TableHead>
                        <TableHead className="text-center">M2</TableHead>
                        <TableHead className="text-center">M3</TableHead>
                        <TableHead className="text-center">M4</TableHead>
                        <TableHead className="text-center">M5</TableHead>
                        <TableHead className="text-center">M6</TableHead>
                        <TableHead className="text-right">Size</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cohortData.map((row) => (
                        <TableRow key={row.cohort}>
                          <TableCell className="font-medium">{row.cohort}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={getCohortColor(row.m0)}>
                              {row.m0}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {row.m1 !== null ? (
                              <Badge variant="outline" className={getCohortColor(row.m1)}>
                                {row.m1}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.m2 !== null ? (
                              <Badge variant="outline" className={getCohortColor(row.m2)}>
                                {row.m2}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.m3 !== null ? (
                              <Badge variant="outline" className={getCohortColor(row.m3)}>
                                {row.m3}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.m4 !== null ? (
                              <Badge variant="outline" className={getCohortColor(row.m4)}>
                                {row.m4}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.m5 !== null ? (
                              <Badge variant="outline" className={getCohortColor(row.m5)}>
                                {row.m5}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.m6 !== null ? (
                              <Badge variant="outline" className={getCohortColor(row.m6)}>
                                {row.m6}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{row.size}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center gap-6 mt-4 flex-wrap text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-950" />
                    <span className="text-muted-foreground">75%+</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-950" />
                    <span className="text-muted-foreground">60-74%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-100 dark:bg-orange-950" />
                    <span className="text-muted-foreground">45-59%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-950" />
                    <span className="text-muted-foreground">&lt;45%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reservation vs Walk-in */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Reservation vs Walk-In Patterns</CardTitle>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="percentage-view" className="text-sm">%</Label>
                      <Switch 
                        id="percentage-view"
                        checked={showPercentages}
                        onCheckedChange={setShowPercentages}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reservationData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              const resPercent = ((data.reservations / data.total) * 100).toFixed(1)
                              const walkPercent = ((data.walkIns / data.total) * 100).toFixed(1)
                              return (
                                <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                  <p className="font-semibold mb-2">{data.hour}</p>
                                  <p className="text-sm">Reservations: {data.reservations} ({resPercent}%)</p>
                                  <p className="text-sm">Walk-Ins: {data.walkIns} ({walkPercent}%)</p>
                                  <p className="text-sm font-medium mt-1">Total: {data.total}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Legend />
                        <Bar dataKey="reservations" stackId="a" fill="hsl(221, 83%, 53%)" radius={[0, 0, 0, 0]} name="Reservations" />
                        <Bar dataKey="walkIns" stackId="a" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} name="Walk-Ins" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="text-sm text-muted-foreground mt-4 space-y-1">
                    <p>Reservations: 58.3% of Fri/Sat dinner, 32.4% of lunch</p>
                  </div>
                </CardContent>
              </Card>

              {/* Wait Time Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Wait Time by Hour</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={waitTimeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload
                              const status = data.avgWait > 20 ? "🔴 High" : data.avgWait > 15 ? "🟠 Elevated" : "🟢 Good"
                              return (
                                <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                  <p className="font-semibold">{data.hour}</p>
                                  <p className="text-sm">Wait Time: {data.avgWait} min</p>
                                  <p className="text-sm">Status: {status}</p>
                                </div>
                              )
                            }
                            return null
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="avgWait" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                          name="Avg Wait"
                        />
                        {/* Target line at 20 minutes */}
                        <Line 
                          type="monotone" 
                          dataKey={() => 20} 
                          stroke="hsl(var(--destructive))" 
                          strokeWidth={2} 
                          strokeDasharray="5 5" 
                          dot={false}
                          name="Target Max"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-lg p-3 mt-4">
                    <div className="flex items-start gap-2">
                      <span className="text-lg">⚠️</span>
                      <div>
                        <p className="text-sm font-medium text-orange-900 dark:text-orange-100">Alert</p>
                        <p className="text-sm text-orange-800 dark:text-orange-200">
                          Wait times exceed 20-min target during Fri/Sat dinner peak
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 4: Lifecycle */}
          <TabsContent value="lifecycle" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Customer Lifecycle Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-4">
                    {lifecycleStages.map((stage, index) => {
                      const Icon = stage.icon
                      const showArrow = index < lifecycleStages.length - 1
                      
                      return (
                        <div key={stage.stage}>
                          <div className="flex items-center gap-4">
                            <Card className="flex-1">
                              <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                  <div className="p-3 bg-primary/10 rounded-full flex-shrink-0">
                                    <Icon className="w-6 h-6 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-lg">{stage.stage}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {stage.visits} • {stage.period}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-2xl font-bold">
                                      {stage.count.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      ({stage.percent}%)
                                    </p>
                                    <p className="text-sm font-medium mt-1">
                                      ${stage.avgSpend.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          {showArrow && (
                            <div className="flex items-center justify-center py-2">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <ArrowRight className="w-5 h-5 rotate-90" />
                                <span className="text-sm font-medium">
                                  {lifecycleStages[index + 1].conversion}% conversion
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Order Value Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Order Value Trend by Lifecycle Stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={lifecycleTrendData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="stage" stroke="hsl(var(--muted-foreground))" />
                            <YAxis stroke="hsl(var(--muted-foreground))" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--popover))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                              }}
                            />
                            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="mt-6 space-y-6">
            {/* Top Items by Customer Segment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5" />
                  Top Items by Customer Segment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* VIP Customers */}
                <div>
                  <h3 className="font-semibold mb-4 text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    VIP Customers
                  </h3>
                  <div className="space-y-2">
                    {vipTopItems.map((item, index) => {
                      const maxOrders = Math.max(...vipTopItems.map(i => i.orders))
                      const barWidth = (item.orders / maxOrders) * 100
                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{index + 1}. {item.name}</span>
                            <span className="text-muted-foreground">
                              {item.orders.toLocaleString()} orders · ${item.revenue.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-6 bg-muted rounded-md overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center px-2"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Regular Customers */}
                <div>
                  <h3 className="font-semibold mb-4 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Regular Customers
                  </h3>
                  <div className="space-y-2">
                    {regularTopItems.map((item, index) => {
                      const maxOrders = Math.max(...regularTopItems.map(i => i.orders))
                      const barWidth = (item.orders / maxOrders) * 100
                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{index + 1}. {item.name}</span>
                            <span className="text-muted-foreground">
                              {item.orders.toLocaleString()} orders · ${item.revenue.toLocaleString()}
                            </span>
                          </div>
                          <div className="h-6 bg-muted rounded-md overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center px-2"
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Menu Category */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Menu Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload
                            return (
                              <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                <p className="font-semibold">{data.category}</p>
                                <p className="text-sm">Revenue: ${data.revenue.toLocaleString()}</p>
                                <p className="text-sm">Percent: {data.percent}%</p>
                                <p className="text-sm">Avg Order: ${data.avgOrderValue}</p>
                                <p className="text-sm text-green-600">Growth: ↗ {data.trend}%</p>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                      <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                        {categoryRevenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${220 - index * 30}, 83%, ${53 + index * 10}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {categoryRevenueData.map((category) => (
                    <div key={category.category} className="text-center p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">{category.category}</p>
                      <p className="text-xl font-bold">${(category.revenue / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-muted-foreground">{category.percent}% of total</p>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">↗ +{category.trend}%</p>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-2 border-t">
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold">$247,890</p>
                </div>
              </CardContent>
            </Card>

            {/* Reorder Rate Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reorder Rate Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">First Orders</TableHead>
                      <TableHead className="text-right">Reorders</TableHead>
                      <TableHead className="text-right">Reorder Rate</TableHead>
                      <TableHead className="text-right">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reorderRateData.map((item) => (
                      <TableRow key={item.item}>
                        <TableCell className="font-medium">{item.item}</TableCell>
                        <TableCell className="text-right">{item.firstOrders.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{item.reorders.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={item.reorderRate} className="w-16 h-2" />
                            <span className="font-semibold">{item.reorderRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-green-600 dark:text-green-400 font-medium">
                            ↗ +{item.trend}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Insight</p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Ribeye Steak has highest reorder rate (81%). Consider loyalty program bonus for repeat orders of signature items.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dietary Preferences & Allergen Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dietary Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Pie Chart */}
                  <div className="flex justify-center">
                    <div className="w-full max-w-[320px] h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dietaryPreferencesData}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={120}
                            paddingAngle={2}
                            dataKey="customers"
                            label={(entry) => entry.percent > 5 ? `${entry.percent}%` : ''}
                          >
                            {dietaryPreferencesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={DIETARY_COLORS[index % DIETARY_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload
                                return (
                                  <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                                    <p className="font-semibold">{data.preference}</p>
                                    <p className="text-sm">Customers: {data.customers.toLocaleString()}</p>
                                    <p className="text-sm">Percent: {data.percent}%</p>
                                    <p className="text-sm">Revenue: ${data.revenue.toLocaleString()}</p>
                                    <p className="text-sm text-green-600">Growth: ↗ {data.growth}%</p>
                                  </div>
                                )
                              }
                              return null
                            }}
                          />
                          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-2xl font-bold">
                            2,847
                          </text>
                          <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-xs">
                            Total Customers
                          </text>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Preference</TableHead>
                        <TableHead className="text-right">Customers</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dietaryPreferencesData.map((pref, index) => (
                        <TableRow key={pref.preference}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: DIETARY_COLORS[index % DIETARY_COLORS.length] }}
                              />
                              <span className="font-medium">{pref.preference}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {pref.customers.toLocaleString()} ({pref.percent}%)
                          </TableCell>
                          <TableCell className="text-right">
                            ${pref.revenue.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Allergen Tracking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Allergen</TableHead>
                        <TableHead className="text-right">Customers</TableHead>
                        <TableHead className="text-center">Severity</TableHead>
                        <TableHead className="text-right">Items</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allergenData.map((allergen) => (
                        <TableRow key={allergen.allergen}>
                          <TableCell className="font-medium">{allergen.allergen}</TableCell>
                          <TableCell className="text-right">
                            {allergen.customers.toLocaleString()} ({allergen.percent}%)
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={
                                allergen.severity === "High" ? "destructive" :
                                allergen.severity === "Medium" ? "default" :
                                "secondary"
                              }
                            >
                              {allergen.severity === "High" ? "⚠️" : allergen.severity === "Medium" ? "⚠️" : "ℹ️"} {allergen.severity}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{allergen.itemsAffected}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-4">
                      <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">Allergen Alerts</p>
                      <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                        <li>• 156 customers have shellfish allergies</li>
                        <li>• 89 customers have peanut allergies</li>
                        <li>• 234 customers have tree nut allergies</li>
                      </ul>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Recommendation</p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            Ensure allergen warnings are clearly displayed and staff are trained on cross-contamination prevention.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 6: Compare */}
          <TabsContent value="compare" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Segment Comparison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-1 w-full">
                    <label className="text-sm font-medium mb-2 block">Segment A</label>
                    <Select value={compareSegmentA} onValueChange={setCompareSegmentA}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {segmentOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-muted-foreground font-semibold">vs</div>
                  <div className="flex-1 w-full">
                    <label className="text-sm font-medium mb-2 block">Segment B</label>
                    <Select value={compareSegmentB} onValueChange={setCompareSegmentB}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {segmentOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Comparison Table */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Comparison Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Metric</TableHead>
                            <TableHead className="text-right">Segment A</TableHead>
                            <TableHead className="text-center">vs</TableHead>
                            <TableHead className="text-right">Segment B</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Customers</TableCell>
                            <TableCell className="text-right">867</TableCell>
                            <TableCell className="text-center">≈</TableCell>
                            <TableCell className="text-right">734</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Avg LTV</TableCell>
                            <TableCell className="text-right">$724.60</TableCell>
                            <TableCell className="text-center">&lt;</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                $1,124.80
                                <TrendingUp className="w-3 h-3 text-green-600" />
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Avg Order $</TableCell>
                            <TableCell className="text-right">$61.40</TableCell>
                            <TableCell className="text-center">&lt;</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                $78.90
                                <TrendingUp className="w-3 h-3 text-green-600" />
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Visit Freq</TableCell>
                            <TableCell className="text-right">1.3/week</TableCell>
                            <TableCell className="text-center">&lt;</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                1.8/week
                                <TrendingUp className="w-3 h-3 text-green-600" />
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Retention</TableCell>
                            <TableCell className="text-right">82.3%</TableCell>
                            <TableCell className="text-center">&lt;</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                88.7%
                                <TrendingUp className="w-3 h-3 text-green-600" />
                              </div>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Top Item</TableCell>
                            <TableCell className="text-right">Pizza (234)</TableCell>
                            <TableCell className="text-center">≠</TableCell>
                            <TableCell className="text-right">Salmon (198)</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Radar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Performance Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="hsl(var(--border))" />
                            <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" />
                            <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                            <Radar name="Segment A" dataKey="segmentA" stroke="hsl(221, 83%, 53%)" fill="hsl(221, 83%, 53%)" fillOpacity={0.3} />
                            <Radar name="Segment B" dataKey="segmentB" stroke="hsl(25, 95%, 53%)" fill="hsl(25, 95%, 53%)" fillOpacity={0.3} />
                            <Legend />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--popover))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
