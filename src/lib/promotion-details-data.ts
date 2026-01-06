export interface PromotionDetails {
  id: string
  name: string
  description: string
  type: "percentage" | "fixed" | "bogo" | "happy_hour"
  typeLabel: string
  discountValue: number
  discountUnit: string
  status: "active" | "scheduled" | "paused" | "expired"
  statusLabel: string
  statusSubtext: string
  statusColor: "green" | "blue" | "yellow" | "red"
  statusDot: string
  isLive: boolean
  schedule: {
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    timezone: string
    recurring: boolean
    recurringType?: string
    activeDays: string[]
    timeWindows: { start: string; end: string }[]
    durationDays: number
    daysElapsed: number
    daysRemaining: number
    hoursPerDay: number
    totalHours: number
  }
  target: {
    type: string
    categoryId?: string
    categoryName?: string
    itemCount?: number
    items?: { id: string; name: string; price: number }[]
  }
  limits: {
    maxRedemptions: number
    currentRedemptions: number
    remainingRedemptions: number
    redemptionPercent: number
    perCustomerLimit: number
    perCustomerPeriod: string
    budgetCap: number
    budgetUsed: number
    budgetRemaining: number
    budgetPercent: number
    autoPauseOnBudget: boolean
  }
  performance: {
    redemptions: number
    ordersAffected: number
    revenueLift: number
    revenueLiftPercent: number
    avgDiscountAmount: number
    totalDiscountGiven: number
    roi: number
    roiDelta: number
    score: number
    scoreMax: number
    rating: number
    ratingLabel: string
    trend: "up" | "down" | "neutral"
    trendPercent: number
  }
  customerSegments: {
    total: number
    newCustomers: {
      count: number
      percent: number
      avgOrderValue: number
      avgRedemptions: number
      totalRevenue: number
    }
    returningCustomers: {
      count: number
      percent: number
      avgOrderValue: number
      avgRedemptions: number
      totalRevenue: number
    }
    vipMembers: {
      count: number
      percent: number
      avgOrderValue: number
      avgRedemptions: number
      totalRevenue: number
    }
  }
  hourlyPattern: {
    hour: string
    hourLabel: string
    redemptions: number
    avgPerDay: number
    percentOfTotal: number
    isPeak?: boolean
    peakDay: string
  }[]
  topItems: {
    rank: number
    itemId: string
    itemName: string
    redemptions: number
    percentOfTotal: number
    revenueLift: number
    avgOrderValue: number
    category: string
  }[]
  dailyPerformance: {
    date: string
    redemptions: number
    revenue: number
    orders: number
  }[]
  dayOfWeekBreakdown: {
    day: string
    redemptions: number
    revenue: number
    avgPerWeek: number
    isPeak?: boolean
  }[]
  timeOfDayBreakdown: {
    time: string
    hour: number
    redemptions: number
    revenue: number
    percent: number
    isPeak?: boolean
  }[]
  conversionFunnel: {
    stage: string
    count: number
    percent: number
    dropoff: number
  }[]
  comparison: {
    previousPeriod: {
      dateRange: string
      redemptions: number
      revenue: number
      roi: number
      deltaRedemptions: number
      deltaRevenue: number
      deltaROI: number
    }
    similarPromotions: {
      avgRedemptionRate: number
      deltaRedemptionRate: number
      avgRevenueLift: number
      deltaRevenueLift: number
      percentile: number
    }
  }
  topCustomers: {
    rank: number
    customerId: string
    name: string
    segment: string
    redemptions: number
    revenue: number
    avgOrderValue: number
    lastVisit: string
  }[]
  scoreBreakdown: {
    total: number
    max: number
    components: {
      name: string
      score: number
      max: number
      percent: number
    }[]
  }
  createdBy: {
    userId: string
    name: string
    email: string
    avatar: string
  }
  createdAt: string
  lastModifiedBy: {
    userId: string
    name: string
    email: string
    avatar: string
  }
  updatedAt: string
  tags: string[]
  settings: {
    priority: string
    visibility: {
      menuBoards: boolean
      mobileApp: boolean
      emailMarketing: boolean
      pushNotifications: boolean
      featuredPromotion: boolean
    }
    notifications: {
      budget80Percent: boolean
      redemptions80Percent: boolean
      dailySummary: boolean
      lowPerformance: boolean
    }
    advanced: {
      stackable: boolean
      excludeFromLoyalty: boolean
      requireApproval: boolean
    }
  }
}

export interface AuditLogEvent {
  id: string
  type: string
  icon: string
  color: string
  user?: {
    userId: string
    name: string
    avatar: string
  }
  system?: boolean
  action: string
  description: string
  changes?: { field: string; oldValue: any; newValue: any; delta?: any }[]
  reason?: string
  details?: any
  timestamp: string
  timeAgo: string
  reportId?: string
  downloadUrl?: string
  statusChange?: { from: string; to: string }
  initialConfig?: any
}

// Mock promotion details (using promo_001 from the table)
export const mockPromotionDetails: PromotionDetails = {
  id: "promo_001",
  name: "Happy Hour 20% Off Draft Beers",
  description: "Daily happy hour discount on all draft beers to drive early evening traffic and increase beverage sales",
  type: "percentage",
  typeLabel: "Percentage Discount",
  discountValue: 20,
  discountUnit: "%",
  status: "active",
  statusLabel: "Active",
  statusSubtext: "Live now",
  statusColor: "green",
  statusDot: "🟢",
  isLive: true,
  schedule: {
    startDate: "2024-11-01",
    startTime: "17:00",
    endDate: "2024-11-30",
    endTime: "19:00",
    timezone: "Europe/Skopje",
    recurring: true,
    recurringType: "daily",
    activeDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    timeWindows: [{ start: "17:00", end: "19:00" }],
    durationDays: 30,
    daysElapsed: 15,
    daysRemaining: 15,
    hoursPerDay: 2,
    totalHours: 60,
  },
  target: {
    type: "category",
    categoryId: "cat_draft_beers",
    categoryName: "Draft Beers",
    itemCount: 8,
    items: [
      { id: "item_001", name: "Pilsner Draft", price: 5.0 },
      { id: "item_002", name: "IPA Draft", price: 5.0 },
      { id: "item_003", name: "Wheat Beer", price: 5.0 },
      { id: "item_004", name: "Lager Draft", price: 5.0 },
      { id: "item_005", name: "Stout", price: 5.5 },
      { id: "item_006", name: "Pale Ale", price: 5.0 },
      { id: "item_007", name: "Amber Ale", price: 5.0 },
      { id: "item_008", name: "Porter", price: 5.5 },
    ],
  },
  limits: {
    maxRedemptions: 500,
    currentRedemptions: 234,
    remainingRedemptions: 266,
    redemptionPercent: 46.8,
    perCustomerLimit: 1,
    perCustomerPeriod: "day",
    budgetCap: 2000,
    budgetUsed: 1240.5,
    budgetRemaining: 759.5,
    budgetPercent: 62,
    autoPauseOnBudget: true,
  },
  performance: {
    redemptions: 234,
    ordersAffected: 234,
    revenueLift: 1240.5,
    revenueLiftPercent: 12.3,
    avgDiscountAmount: 3.2,
    totalDiscountGiven: 748.8,
    roi: 3.8,
    roiDelta: 0.4,
    score: 92,
    scoreMax: 100,
    rating: 5,
    ratingLabel: "Excellent",
    trend: "up",
    trendPercent: 5.2,
  },
  customerSegments: {
    total: 234,
    newCustomers: {
      count: 45,
      percent: 19.2,
      avgOrderValue: 28.5,
      avgRedemptions: 1.2,
      totalRevenue: 1282.5,
    },
    returningCustomers: {
      count: 189,
      percent: 80.8,
      avgOrderValue: 32.8,
      avgRedemptions: 2.4,
      totalRevenue: 6199.2,
    },
    vipMembers: {
      count: 67,
      percent: 28.6,
      avgOrderValue: 38.2,
      avgRedemptions: 3.1,
      totalRevenue: 2559.4,
    },
  },
  hourlyPattern: [
    { hour: "17:00", hourLabel: "5PM", redemptions: 45, avgPerDay: 6.4, percentOfTotal: 19.2, peakDay: "Friday" },
    { hour: "18:00", hourLabel: "6PM", redemptions: 67, avgPerDay: 9.6, percentOfTotal: 28.6, isPeak: true, peakDay: "Friday" },
    { hour: "19:00", hourLabel: "7PM", redemptions: 23, avgPerDay: 3.3, percentOfTotal: 9.8, peakDay: "Thursday" },
  ],
  topItems: [
    { rank: 1, itemId: "item_001", itemName: "Pilsner Draft", redemptions: 128, percentOfTotal: 54.7, revenueLift: 640.0, avgOrderValue: 5.0, category: "Draft Beers" },
    { rank: 2, itemId: "item_002", itemName: "IPA Draft", redemptions: 89, percentOfTotal: 38.0, revenueLift: 445.0, avgOrderValue: 5.0, category: "Draft Beers" },
    { rank: 3, itemId: "item_003", itemName: "Wheat Beer", redemptions: 17, percentOfTotal: 7.3, revenueLift: 85.0, avgOrderValue: 5.0, category: "Draft Beers" },
  ],
  dailyPerformance: [
    { date: "2024-11-01", redemptions: 8, revenue: 40.0, orders: 8 },
    { date: "2024-11-02", redemptions: 12, revenue: 60.0, orders: 12 },
    { date: "2024-11-03", redemptions: 10, revenue: 50.0, orders: 10 },
    { date: "2024-11-04", redemptions: 15, revenue: 75.0, orders: 15 },
    { date: "2024-11-05", redemptions: 18, revenue: 90.0, orders: 18 },
    { date: "2024-11-06", redemptions: 14, revenue: 70.0, orders: 14 },
    { date: "2024-11-07", redemptions: 11, revenue: 55.0, orders: 11 },
    { date: "2024-11-08", redemptions: 16, revenue: 80.0, orders: 16 },
    { date: "2024-11-09", redemptions: 19, revenue: 95.0, orders: 19 },
    { date: "2024-11-10", redemptions: 13, revenue: 65.0, orders: 13 },
    { date: "2024-11-11", redemptions: 17, revenue: 85.0, orders: 17 },
    { date: "2024-11-12", redemptions: 20, revenue: 100.0, orders: 20 },
    { date: "2024-11-13", redemptions: 22, revenue: 110.0, orders: 22 },
    { date: "2024-11-14", redemptions: 21, revenue: 105.0, orders: 21 },
    { date: "2024-11-15", redemptions: 18, revenue: 90.0, orders: 18 },
  ],
  dayOfWeekBreakdown: [
    { day: "Monday", redemptions: 30, revenue: 156.0, avgPerWeek: 15 },
    { day: "Tuesday", redemptions: 32, revenue: 162.0, avgPerWeek: 16 },
    { day: "Wednesday", redemptions: 35, revenue: 178.0, avgPerWeek: 17.5 },
    { day: "Thursday", redemptions: 28, revenue: 145.0, avgPerWeek: 14 },
    { day: "Friday", redemptions: 43, revenue: 218.0, avgPerWeek: 21.5, isPeak: true },
    { day: "Saturday", redemptions: 38, revenue: 192.0, avgPerWeek: 19 },
    { day: "Sunday", redemptions: 37, revenue: 189.0, avgPerWeek: 18.5 },
  ],
  timeOfDayBreakdown: [
    { time: "5PM", hour: 17, redemptions: 75, revenue: 384.0, percent: 32.1 },
    { time: "6PM", hour: 18, redemptions: 110, revenue: 562.0, percent: 47.0, isPeak: true },
    { time: "7PM", hour: 19, redemptions: 49, revenue: 294.0, percent: 20.9 },
  ],
  conversionFunnel: [
    { stage: "Saw promotion", count: 2450, percent: 100, dropoff: 0 },
    { stage: "Viewed details", count: 1234, percent: 50.4, dropoff: 49.6 },
    { stage: "Started order", count: 456, percent: 18.6, dropoff: 31.8 },
    { stage: "Applied promo", count: 234, percent: 9.6, dropoff: 9.0 },
    { stage: "Completed order", count: 234, percent: 9.6, dropoff: 0 },
  ],
  comparison: {
    previousPeriod: {
      dateRange: "Oct 1-15, 2024",
      redemptions: 159,
      revenue: 900.0,
      roi: 3.4,
      deltaRedemptions: 47.2,
      deltaRevenue: 37.8,
      deltaROI: 11.8,
    },
    similarPromotions: {
      avgRedemptionRate: 36.8,
      deltaRedemptionRate: 15,
      avgRevenueLift: 1018.0,
      deltaRevenueLift: 21.8,
      percentile: 90,
    },
  },
  topCustomers: [
    {
      rank: 1,
      customerId: "cust_001",
      name: "John Smith",
      segment: "VIP Member",
      redemptions: 8,
      revenue: 128.0,
      avgOrderValue: 16.0,
      lastVisit: "2024-11-20",
    },
    {
      rank: 2,
      customerId: "cust_002",
      name: "Emma Johnson",
      segment: "Returning",
      redemptions: 7,
      revenue: 112.0,
      avgOrderValue: 16.0,
      lastVisit: "2024-11-19",
    },
    {
      rank: 3,
      customerId: "cust_003",
      name: "Michael Brown",
      segment: "VIP Member",
      redemptions: 6,
      revenue: 96.0,
      avgOrderValue: 16.0,
      lastVisit: "2024-11-20",
    },
  ],
  scoreBreakdown: {
    total: 92,
    max: 100,
    components: [
      { name: "Redemption Rate", score: 28, max: 30, percent: 93.3 },
      { name: "Revenue Impact", score: 24, max: 25, percent: 96.0 },
      { name: "ROI", score: 19, max: 20, percent: 95.0 },
      { name: "Customer Acquisition", score: 13, max: 15, percent: 86.7 },
      { name: "Efficiency", score: 8, max: 10, percent: 80.0 },
    ],
  },
  createdBy: {
    userId: "user_001",
    name: "Sarah Johnson",
    email: "sarah.johnson@berrytap.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  createdAt: "2024-10-28T10:30:00Z",
  lastModifiedBy: {
    userId: "user_002",
    name: "Mike Chen",
    email: "mike.chen@berrytap.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
  },
  updatedAt: "2024-11-15T14:20:00Z",
  tags: ["happy-hour", "beverages", "traffic-driver"],
  settings: {
    priority: "medium",
    visibility: {
      menuBoards: true,
      mobileApp: true,
      emailMarketing: true,
      pushNotifications: true,
      featuredPromotion: false,
    },
    notifications: {
      budget80Percent: true,
      redemptions80Percent: true,
      dailySummary: true,
      lowPerformance: false,
    },
    advanced: {
      stackable: false,
      excludeFromLoyalty: false,
      requireApproval: false,
    },
  },
}

export const mockAuditLog: AuditLogEvent[] = [
  {
    id: "audit_001",
    type: "promotion_edited",
    icon: "Edit",
    color: "hsl(var(--chart-1))",
    user: {
      userId: "user_002",
      name: "Mike Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    },
    action: "edited",
    description: "Updated budget cap from €1,500 to €2,000",
    changes: [{ field: "budgetCap", oldValue: 1500, newValue: 2000, delta: 500 }],
    reason: "Increased demand, expand budget",
    timestamp: "2024-11-15T14:20:00Z",
    timeAgo: "2 hours ago",
  },
  {
    id: "audit_002",
    type: "alert_triggered",
    icon: "AlertTriangle",
    color: "hsl(var(--warning))",
    system: true,
    action: "alert",
    description: "Budget alert triggered: 80% of budget used",
    details: {
      budgetUsed: 1200,
      budgetTotal: 1500,
      budgetPercent: 80,
      emailsSent: ["sarah.johnson@berrytap.com", "mike.chen@berrytap.com"],
    },
    timestamp: "2024-11-15T14:15:00Z",
    timeAgo: "2 hours ago",
  },
  {
    id: "audit_003",
    type: "milestone_reached",
    icon: "Award",
    color: "hsl(var(--success))",
    system: true,
    action: "milestone",
    description: "Promotion reached 250 redemptions",
    details: {
      milestone: 250,
      revenueLift: 1250.0,
      daysToMilestone: 14,
    },
    timestamp: "2024-11-14T18:45:00Z",
    timeAgo: "1 day ago",
  },
  {
    id: "audit_004",
    type: "report_generated",
    icon: "FileText",
    color: "hsl(var(--chart-3))",
    system: true,
    action: "report",
    description: "Weekly performance report generated",
    reportId: "report_week_2",
    downloadUrl: "/reports/promo_001_week_2.pdf",
    timestamp: "2024-11-11T00:00:00Z",
    timeAgo: "6 days ago",
  },
  {
    id: "audit_005",
    type: "promotion_edited",
    icon: "Edit",
    color: "hsl(var(--chart-1))",
    user: {
      userId: "user_001",
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    action: "edited",
    description: "Updated redemption limit from 400 to 500",
    changes: [{ field: "maxRedemptions", oldValue: 400, newValue: 500, delta: 100 }],
    reason: "High demand, increase capacity",
    timestamp: "2024-11-08T10:15:00Z",
    timeAgo: "9 days ago",
  },
  {
    id: "audit_006",
    type: "promotion_activated",
    icon: "Play",
    color: "hsl(var(--success))",
    user: {
      userId: "user_001",
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    action: "activated",
    description: "Promotion activated and went live",
    statusChange: { from: "draft", to: "active" },
    timestamp: "2024-11-01T17:00:00Z",
    timeAgo: "16 days ago",
  },
  {
    id: "audit_007",
    type: "promotion_created",
    icon: "Plus",
    color: "hsl(var(--success))",
    user: {
      userId: "user_001",
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    action: "created",
    description: "Promotion created",
    initialConfig: {
      type: "percentage",
      discount: 20,
      target: "Draft Beers",
      schedule: "Daily 5-7 PM, Nov 1-30",
      budget: 1500,
    },
    timestamp: "2024-10-28T10:30:00Z",
    timeAgo: "20 days ago",
  },
]
