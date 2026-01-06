export interface Promotion {
  id: string
  name: string
  description: string
  type: "percentage" | "fixed" | "bogo" | "happy_hour"
  typeLabel: string
  typeIcon: string
  discountValue: number
  discountUnit: string
  target: {
    type: string
    categoryId?: string
    categoryName?: string
    itemCount?: number
    minOrderAmount?: number
  }
  status: "active" | "scheduled" | "paused" | "expired"
  statusLabel: string
  statusSubtext: string
  statusColor: "green" | "blue" | "yellow" | "red"
  statusDot: string
  schedule: {
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    timezone: string
    recurring: boolean
    recurringType?: string
    activeDays: string[]
    displayDuration: string
    displayRecurrence: string
    displayTimeWindow: string
  }
  limits: {
    maxRedemptions: number
    currentRedemptions: number
    redemptionPercent: number
    perCustomerLimit: number
    perCustomerPeriod: string
  }
  performance: {
    revenueLift: number
    revenueLiftPercent: number
    revenueLiftTrend: "up" | "down" | "neutral"
    ordersAffected: number
  }
  createdBy: {
    userId: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export const mockPromotions: Promotion[] = [
  {
    id: "promo_001",
    name: "Happy Hour 20% Off Draft Beers",
    description: "Daily happy hour discount on all draft beers to drive early evening traffic",
    type: "percentage",
    typeLabel: "Percentage Discount",
    typeIcon: "Percent",
    discountValue: 20,
    discountUnit: "%",
    target: {
      type: "category",
      categoryId: "cat_draft_beers",
      categoryName: "Draft Beers",
      itemCount: 8,
    },
    status: "active",
    statusLabel: "Active",
    statusSubtext: "Live now",
    statusColor: "green",
    statusDot: "🟢",
    schedule: {
      startDate: "2024-11-01",
      endDate: "2024-11-30",
      startTime: "17:00",
      endTime: "19:00",
      timezone: "Europe/Skopje",
      recurring: true,
      recurringType: "daily",
      activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      displayDuration: "Nov 1-30",
      displayRecurrence: "Daily",
      displayTimeWindow: "5:00-7:00 PM",
    },
    limits: {
      maxRedemptions: 500,
      currentRedemptions: 234,
      redemptionPercent: 46.8,
      perCustomerLimit: 1,
      perCustomerPeriod: "day",
    },
    performance: {
      revenueLift: 1240.5,
      revenueLiftPercent: 12.3,
      revenueLiftTrend: "up",
      ordersAffected: 234,
    },
    createdBy: {
      userId: "user_001",
      name: "Sarah Johnson",
    },
    createdAt: "2024-10-28T10:30:00Z",
    updatedAt: "2024-11-15T14:20:00Z",
  },
  {
    id: "promo_002",
    name: "First-Time Customer €10 Off",
    description: "Welcome discount for new customers to encourage first purchase",
    type: "fixed",
    typeLabel: "Fixed Discount",
    typeIcon: "Euro",
    discountValue: 10,
    discountUnit: "€",
    target: {
      type: "entire_order",
      minOrderAmount: 25,
    },
    status: "scheduled",
    statusLabel: "Scheduled",
    statusSubtext: "Starts in 3 days",
    statusColor: "blue",
    statusDot: "🔵",
    schedule: {
      startDate: "2024-11-20",
      endDate: "2024-11-30",
      startTime: "00:00",
      endTime: "23:59",
      timezone: "Europe/Skopje",
      recurring: false,
      activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      displayDuration: "Nov 20-30",
      displayRecurrence: "All day",
      displayTimeWindow: "",
    },
    limits: {
      maxRedemptions: 1000,
      currentRedemptions: 0,
      redemptionPercent: 0,
      perCustomerLimit: 1,
      perCustomerPeriod: "lifetime",
    },
    performance: {
      revenueLift: 0,
      revenueLiftPercent: 0,
      revenueLiftTrend: "neutral",
      ordersAffected: 0,
    },
    createdBy: {
      userId: "user_001",
      name: "Sarah Johnson",
    },
    createdAt: "2024-11-12T09:15:00Z",
    updatedAt: "2024-11-12T09:15:00Z",
  },
  {
    id: "promo_003",
    name: "BOGO Pizza Tuesdays",
    description: "Buy one pizza, get one free every Tuesday",
    type: "bogo",
    typeLabel: "BOGO",
    typeIcon: "Gift",
    discountValue: 100,
    discountUnit: "%",
    target: {
      type: "category",
      categoryId: "cat_pizza",
      categoryName: "Pizza",
      itemCount: 12,
    },
    status: "paused",
    statusLabel: "Paused",
    statusSubtext: "By user",
    statusColor: "yellow",
    statusDot: "🟡",
    schedule: {
      startDate: "2024-11-01",
      endDate: "2024-11-15",
      startTime: "00:00",
      endTime: "23:59",
      timezone: "Europe/Skopje",
      recurring: true,
      recurringType: "weekly",
      activeDays: ["tuesday"],
      displayDuration: "Nov 1-15",
      displayRecurrence: "Tuesdays",
      displayTimeWindow: "",
    },
    limits: {
      maxRedemptions: 1000,
      currentRedemptions: 456,
      redemptionPercent: 45.6,
      perCustomerLimit: 1,
      perCustomerPeriod: "day",
    },
    performance: {
      revenueLift: 2340.0,
      revenueLiftPercent: 8.7,
      revenueLiftTrend: "up",
      ordersAffected: 456,
    },
    createdBy: {
      userId: "user_002",
      name: "Mike Chen",
    },
    createdAt: "2024-10-25T11:00:00Z",
    updatedAt: "2024-11-10T16:30:00Z",
  },
  {
    id: "promo_004",
    name: "Weekend Brunch 15% Off",
    description: "Weekend brunch discount to boost morning sales",
    type: "percentage",
    typeLabel: "Percentage Discount",
    typeIcon: "Percent",
    discountValue: 15,
    discountUnit: "%",
    target: {
      type: "category",
      categoryId: "cat_brunch",
      categoryName: "Brunch Items",
      itemCount: 15,
    },
    status: "expired",
    statusLabel: "Expired",
    statusSubtext: "16 days ago",
    statusColor: "red",
    statusDot: "🔴",
    schedule: {
      startDate: "2024-10-01",
      endDate: "2024-10-31",
      startTime: "09:00",
      endTime: "14:00",
      timezone: "Europe/Skopje",
      recurring: true,
      recurringType: "weekly",
      activeDays: ["saturday", "sunday"],
      displayDuration: "Oct 1-31",
      displayRecurrence: "Sat & Sun",
      displayTimeWindow: "9:00 AM-2:00 PM",
    },
    limits: {
      maxRedemptions: 1200,
      currentRedemptions: 1240,
      redemptionPercent: 103.3,
      perCustomerLimit: 2,
      perCustomerPeriod: "day",
    },
    performance: {
      revenueLift: 5600.0,
      revenueLiftPercent: 15.2,
      revenueLiftTrend: "up",
      ordersAffected: 1240,
    },
    createdBy: {
      userId: "user_001",
      name: "Sarah Johnson",
    },
    createdAt: "2024-09-28T08:00:00Z",
    updatedAt: "2024-10-31T23:59:00Z",
  },
  {
    id: "promo_005",
    name: "Lunch Special €5 Off €25+",
    description: "Weekday lunch discount to drive midday traffic",
    type: "fixed",
    typeLabel: "Fixed Discount",
    typeIcon: "Euro",
    discountValue: 5,
    discountUnit: "€",
    target: {
      type: "entire_order",
      minOrderAmount: 25,
    },
    status: "active",
    statusLabel: "Active",
    statusSubtext: "Live now",
    statusColor: "green",
    statusDot: "🟢",
    schedule: {
      startDate: "2024-11-01",
      endDate: "2024-11-30",
      startTime: "11:00",
      endTime: "14:00",
      timezone: "Europe/Skopje",
      recurring: true,
      recurringType: "weekly",
      activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      displayDuration: "Nov 1-30",
      displayRecurrence: "Weekdays",
      displayTimeWindow: "11:00 AM-2:00 PM",
    },
    limits: {
      maxRedemptions: 200,
      currentRedemptions: 89,
      redemptionPercent: 44.5,
      perCustomerLimit: 1,
      perCustomerPeriod: "day",
    },
    performance: {
      revenueLift: 445.0,
      revenueLiftPercent: 6.4,
      revenueLiftTrend: "up",
      ordersAffected: 89,
    },
    createdBy: {
      userId: "user_003",
      name: "Elena Rodriguez",
    },
    createdAt: "2024-10-29T09:00:00Z",
    updatedAt: "2024-11-15T12:00:00Z",
  },
  {
    id: "promo_006",
    name: "Student Discount 10%",
    description: "Student ID discount for university students",
    type: "percentage",
    typeLabel: "Percentage Discount",
    typeIcon: "Percent",
    discountValue: 10,
    discountUnit: "%",
    target: {
      type: "entire_order",
      minOrderAmount: 0,
    },
    status: "active",
    statusLabel: "Active",
    statusSubtext: "Live now",
    statusColor: "green",
    statusDot: "🟢",
    schedule: {
      startDate: "2024-09-01",
      endDate: "2025-06-30",
      startTime: "00:00",
      endTime: "23:59",
      timezone: "Europe/Skopje",
      recurring: false,
      activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      displayDuration: "Sep 1 '24 - Jun 30 '25",
      displayRecurrence: "All day",
      displayTimeWindow: "",
    },
    limits: {
      maxRedemptions: 10000,
      currentRedemptions: 2345,
      redemptionPercent: 23.5,
      perCustomerLimit: 1,
      perCustomerPeriod: "day",
    },
    performance: {
      revenueLift: 8900.0,
      revenueLiftPercent: 18.5,
      revenueLiftTrend: "up",
      ordersAffected: 2345,
    },
    createdBy: {
      userId: "user_001",
      name: "Sarah Johnson",
    },
    createdAt: "2024-08-25T10:00:00Z",
    updatedAt: "2024-11-15T14:20:00Z",
  },
  {
    id: "promo_007",
    name: "Late Night €3 Off Delivery",
    description: "Late night delivery discount",
    type: "fixed",
    typeLabel: "Fixed Discount",
    typeIcon: "Euro",
    discountValue: 3,
    discountUnit: "€",
    target: {
      type: "delivery_orders",
    },
    status: "active",
    statusLabel: "Active",
    statusSubtext: "Live now",
    statusColor: "green",
    statusDot: "🟢",
    schedule: {
      startDate: "2024-11-01",
      endDate: "2024-12-31",
      startTime: "22:00",
      endTime: "02:00",
      timezone: "Europe/Skopje",
      recurring: true,
      recurringType: "daily",
      activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      displayDuration: "Nov 1 - Dec 31",
      displayRecurrence: "Daily",
      displayTimeWindow: "10:00 PM-2:00 AM",
    },
    limits: {
      maxRedemptions: 500,
      currentRedemptions: 123,
      redemptionPercent: 24.6,
      perCustomerLimit: 1,
      perCustomerPeriod: "day",
    },
    performance: {
      revenueLift: 615.0,
      revenueLiftPercent: 9.8,
      revenueLiftTrend: "up",
      ordersAffected: 123,
    },
    createdBy: {
      userId: "user_002",
      name: "Mike Chen",
    },
    createdAt: "2024-10-30T15:00:00Z",
    updatedAt: "2024-11-15T22:30:00Z",
  },
  {
    id: "promo_008",
    name: "Family Bundle Deal",
    description: "€15 off family meal bundles",
    type: "fixed",
    typeLabel: "Fixed Discount",
    typeIcon: "Euro",
    discountValue: 15,
    discountUnit: "€",
    target: {
      type: "category",
      categoryId: "cat_family_meals",
      categoryName: "Family Meals",
      itemCount: 6,
    },
    status: "scheduled",
    statusLabel: "Scheduled",
    statusSubtext: "Starts in 5 days",
    statusColor: "blue",
    statusDot: "🔵",
    schedule: {
      startDate: "2024-11-22",
      endDate: "2024-12-25",
      startTime: "00:00",
      endTime: "23:59",
      timezone: "Europe/Skopje",
      recurring: false,
      activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      displayDuration: "Nov 22 - Dec 25",
      displayRecurrence: "All day",
      displayTimeWindow: "",
    },
    limits: {
      maxRedemptions: 300,
      currentRedemptions: 0,
      redemptionPercent: 0,
      perCustomerLimit: 2,
      perCustomerPeriod: "week",
    },
    performance: {
      revenueLift: 0,
      revenueLiftPercent: 0,
      revenueLiftTrend: "neutral",
      ordersAffected: 0,
    },
    createdBy: {
      userId: "user_001",
      name: "Sarah Johnson",
    },
    createdAt: "2024-11-10T11:00:00Z",
    updatedAt: "2024-11-10T11:00:00Z",
  },
  {
    id: "promo_009",
    name: "Sports Night Wings Special",
    description: "Discounted wings during game nights",
    type: "percentage",
    typeLabel: "Percentage Discount",
    typeIcon: "Percent",
    discountValue: 25,
    discountUnit: "%",
    target: {
      type: "category",
      categoryId: "cat_appetizers",
      categoryName: "Wings",
      itemCount: 5,
    },
    status: "active",
    statusLabel: "Active",
    statusSubtext: "Live now",
    statusColor: "green",
    statusDot: "🟢",
    schedule: {
      startDate: "2024-11-01",
      endDate: "2024-12-31",
      startTime: "18:00",
      endTime: "22:00",
      timezone: "Europe/Skopje",
      recurring: true,
      recurringType: "weekly",
      activeDays: ["thursday", "friday", "saturday"],
      displayDuration: "Nov 1 - Dec 31",
      displayRecurrence: "Thu-Sat",
      displayTimeWindow: "6:00-10:00 PM",
    },
    limits: {
      maxRedemptions: 800,
      currentRedemptions: 567,
      redemptionPercent: 70.9,
      perCustomerLimit: 2,
      perCustomerPeriod: "day",
    },
    performance: {
      revenueLift: 3400.0,
      revenueLiftPercent: 22.1,
      revenueLiftTrend: "up",
      ordersAffected: 567,
    },
    createdBy: {
      userId: "user_002",
      name: "Mike Chen",
    },
    createdAt: "2024-10-28T14:00:00Z",
    updatedAt: "2024-11-15T20:00:00Z",
  },
  {
    id: "promo_010",
    name: "Birthday Month Special",
    description: "Free dessert during birthday month",
    type: "bogo",
    typeLabel: "BOGO",
    typeIcon: "Gift",
    discountValue: 100,
    discountUnit: "%",
    target: {
      type: "category",
      categoryId: "cat_desserts",
      categoryName: "Desserts",
      itemCount: 10,
    },
    status: "active",
    statusLabel: "Active",
    statusSubtext: "Live now",
    statusColor: "green",
    statusDot: "🟢",
    schedule: {
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      startTime: "00:00",
      endTime: "23:59",
      timezone: "Europe/Skopje",
      recurring: false,
      activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      displayDuration: "All Year 2024",
      displayRecurrence: "All day",
      displayTimeWindow: "",
    },
    limits: {
      maxRedemptions: 5000,
      currentRedemptions: 1234,
      redemptionPercent: 24.7,
      perCustomerLimit: 1,
      perCustomerPeriod: "month",
    },
    performance: {
      revenueLift: 4500.0,
      revenueLiftPercent: 11.2,
      revenueLiftTrend: "up",
      ordersAffected: 1234,
    },
    createdBy: {
      userId: "user_003",
      name: "Elena Rodriguez",
    },
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-11-15T16:00:00Z",
  },
]
