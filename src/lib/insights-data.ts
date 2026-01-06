export interface Alert {
  id: string
  type: "budget_critical" | "low_performance" | "expiring_soon" | "high_redemption" | "conflict_detected" | "milestone_reached" | "cannibalization_risk"
  priority: "urgent" | "warning" | "info" | "success"
  level: 1 | 2 | 3 | 4
  promotionId: string
  promotionName: string
  title: string
  message: string
  details: Record<string, any>
  timestamp: string
  timeAgo: string
  status: "unread" | "read" | "snoozed" | "dismissed"
  actions: Array<{
    label: string
    variant: "default" | "outline" | "ghost"
    action: string
    href?: string
  }>
  recommendations?: string[]
  dismissible: boolean
  snoozable: boolean
}

export interface TopPerformer {
  rank: number
  medal: string
  promotionId: string
  name: string
  score: number
  scoreMax: number
  metrics: {
    revenueLift: number
    roi: number
    redemptionRate: number
    customerSatisfaction: number
  }
  trend: "up" | "down" | "stable"
  trendPercent: number
  badge: string
  progressColor: string
}

export interface Recommendation {
  id: string
  type: "ai_suggestion" | "optimization" | "opportunity"
  icon: string
  priority: "high" | "medium" | "low"
  title: string
  description: string
  confidence: number
  impact: {
    type: string
    estimate: number
    unit: string
    description: string
  }
  reasoning: string[]
  actions: Array<{
    label: string
    variant: "default" | "outline" | "ghost"
    action: string
  }>
  timestamp: string
  status: "new" | "viewed" | "applied" | "dismissed"
}

export interface Activity {
  id: string
  type: "promotion_paused" | "promotion_activated" | "promotion_created" | "promotion_edited" | "milestone" | "alert"
  icon: string
  iconColor: string
  user?: {
    id: string
    name: string
    avatar: string
  }
  system?: boolean
  action: string
  target: {
    type: string
    id: string
    name: string
  }
  description: string
  reason?: string
  changes?: string[]
  milestone?: number
  alertType?: string
  timestamp: string
  timeAgo: string
  viewable: boolean
  href?: string
}

export const activeAlerts: Alert[] = [
  {
    id: "alert_001",
    type: "budget_critical",
    priority: "urgent",
    level: 1,
    promotionId: "promo_001",
    promotionName: "Happy Hour 20% Off Draft Beers",
    title: '"Happy Hour 20%" budget 90% used',
    message: "€1,800 of €2,000 spent. Promotion may pause soon.",
    details: {
      budgetCap: 2000,
      budgetUsed: 1800,
      budgetRemaining: 200,
      budgetPercent: 90,
      estimatedDaysRemaining: 2.5,
      currentBurnRate: 80,
    },
    timestamp: "2024-11-20T14:48:00Z",
    timeAgo: "2 min ago",
    status: "unread",
    actions: [
      { label: "View Details", variant: "default", action: "view", href: "/dashboard/marketing/promotions/promo_001" },
      { label: "Increase Budget", variant: "outline", action: "increase_budget" },
    ],
    dismissible: true,
    snoozable: true,
  },
  {
    id: "alert_002",
    type: "low_performance",
    priority: "warning",
    level: 2,
    promotionId: "promo_003",
    promotionName: "BOGO Pizza Tuesdays",
    title: '"BOGO Pizza" low redemption rate',
    message: "Only 12% redeemed with 2 days left.",
    details: {
      currentRedemptions: 120,
      maxRedemptions: 1000,
      redemptionPercent: 12,
      daysRemaining: 2,
      expectedRedemptions: 600,
      shortfall: 480,
    },
    timestamp: "2024-11-20T14:35:00Z",
    timeAgo: "15 min ago",
    status: "unread",
    actions: [
      { label: "Optimize", variant: "default", action: "optimize" },
      { label: "Extend Promo", variant: "outline", action: "extend" },
    ],
    recommendations: ["Increase discount to 15% off second pizza", "Send push notification to customers", "Extend promotion by 1 week"],
    dismissible: true,
    snoozable: true,
  },
  {
    id: "alert_003",
    type: "expiring_soon",
    priority: "info",
    level: 3,
    promotionId: "promo_005",
    promotionName: "Lunch Special €5 Off",
    title: '"Lunch Special" ends in 3 days',
    message: "Currently performing well (89% redeemed). Consider extending.",
    details: {
      endDate: "2024-11-23",
      daysRemaining: 3,
      hoursRemaining: 72,
      currentRedemptions: 178,
      maxRedemptions: 200,
      redemptionPercent: 89,
      revenueLift: 890,
      roi: 3.1,
    },
    timestamp: "2024-11-20T13:50:00Z",
    timeAgo: "1 hour ago",
    status: "read",
    actions: [
      { label: "Extend", variant: "default", action: "extend" },
      { label: "Duplicate", variant: "outline", action: "duplicate" },
    ],
    dismissible: true,
    snoozable: false,
  },
  {
    id: "alert_004",
    type: "high_redemption",
    priority: "success",
    level: 4,
    promotionId: "promo_006",
    promotionName: "Weekend Brunch 15% Off",
    title: '"Weekend Brunch" performing exceptionally',
    message: "85% redeemed with 10 days remaining!",
    details: {
      currentRedemptions: 255,
      maxRedemptions: 300,
      redemptionPercent: 85,
      daysRemaining: 10,
      projectedFinalRate: 95,
      revenueLift: 1275,
      roi: 3.4,
    },
    timestamp: "2024-11-20T10:20:00Z",
    timeAgo: "4 hours ago",
    status: "read",
    actions: [
      { label: "View Details", variant: "default", action: "view" },
      { label: "Duplicate", variant: "outline", action: "duplicate" },
    ],
    dismissible: true,
    snoozable: false,
  },
  {
    id: "alert_005",
    type: "milestone_reached",
    priority: "info",
    level: 4,
    promotionId: "promo_001",
    promotionName: "Happy Hour 20% Off Draft Beers",
    title: '"Happy Hour" reached 250 redemptions',
    message: "Milestone achieved! Total revenue lift: €1,240",
    details: {
      milestone: 250,
      currentRedemptions: 250,
      revenueLift: 1240.5,
      roi: 3.8,
      daysToMilestone: 15,
      nextMilestone: 500,
    },
    timestamp: "2024-11-20T14:38:00Z",
    timeAgo: "12 min ago",
    status: "unread",
    actions: [
      { label: "View Details", variant: "default", action: "view" },
      { label: "Share", variant: "outline", action: "share" },
    ],
    dismissible: true,
    snoozable: false,
  },
]

export const topPerformers: TopPerformer[] = [
  {
    rank: 1,
    medal: "🥇",
    promotionId: "promo_001",
    name: "Happy Hour 20% Off Draft Beers",
    score: 92,
    scoreMax: 100,
    metrics: {
      revenueLift: 1240.5,
      roi: 3.8,
      redemptionRate: 46.8,
      customerSatisfaction: 4.8,
    },
    trend: "up",
    trendPercent: 5.2,
    badge: "⭐ Excellent",
    progressColor: "hsl(var(--success))",
  },
  {
    rank: 2,
    medal: "🥈",
    promotionId: "promo_006",
    name: "Weekend Brunch 15% Off",
    score: 85,
    scoreMax: 100,
    metrics: {
      revenueLift: 890.0,
      roi: 3.1,
      redemptionRate: 48.3,
      customerSatisfaction: 4.6,
    },
    trend: "up",
    trendPercent: 2.8,
    badge: "Very Good",
    progressColor: "hsl(var(--chart-2))",
  },
  {
    rank: 3,
    medal: "🥉",
    promotionId: "promo_003",
    name: "Student Discount 10%",
    score: 78,
    scoreMax: 100,
    metrics: {
      revenueLift: 8900.0,
      roi: 2.9,
      redemptionRate: 23.5,
      customerSatisfaction: 4.5,
    },
    trend: "stable",
    trendPercent: 0.5,
    badge: "Good",
    progressColor: "hsl(var(--chart-3))",
  },
]

export const recommendations: Recommendation[] = [
  {
    id: "rec_001",
    type: "ai_suggestion",
    icon: "Sparkles",
    priority: "high",
    title: 'Extend "Happy Hour" to weekends',
    description: "Based on analysis, extending this promotion to Saturday and Sunday could generate significant additional revenue.",
    confidence: 87,
    impact: {
      type: "revenue",
      estimate: 850,
      unit: "€/week",
      description: "Projected additional revenue per week",
    },
    reasoning: [
      "Weekend evening traffic 40% higher than weekdays",
      "Similar promotions performed 25% better on weekends",
      "Customer demand indicators show high interest",
    ],
    actions: [
      { label: "Apply", variant: "default", action: "apply" },
      { label: "Learn More", variant: "outline", action: "learn" },
      { label: "Dismiss", variant: "ghost", action: "dismiss" },
    ],
    timestamp: "2024-11-20T14:00:00Z",
    status: "new",
  },
  {
    id: "rec_002",
    type: "optimization",
    icon: "Target",
    priority: "medium",
    title: '"Lunch Special" underperforming',
    description: "Try increasing discount to €7 off instead of €5. Similar promotions with €7 discount saw 35% higher redemption.",
    confidence: 73,
    impact: {
      type: "redemption",
      estimate: 35,
      unit: "%",
      description: "Expected redemption rate increase",
    },
    reasoning: [
      "Current €5 discount below psychological threshold",
      "Competitors offering €7-10 discounts",
      "Historical data shows €7 sweet spot for lunch",
    ],
    actions: [
      { label: "Test Change", variant: "default", action: "test" },
      { label: "Dismiss", variant: "ghost", action: "dismiss" },
    ],
    timestamp: "2024-11-20T13:30:00Z",
    status: "new",
  },
]

export const recentActivity: Activity[] = [
  {
    id: "activity_001",
    type: "promotion_paused",
    icon: "Pause",
    iconColor: "hsl(var(--warning))",
    user: {
      id: "user_001",
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    action: "paused",
    target: {
      type: "promotion",
      id: "promo_003",
      name: "BOGO Pizza Tuesdays",
    },
    description: 'Sarah paused "BOGO Pizza Tuesdays"',
    reason: "Low performance",
    timestamp: "2024-11-20T14:45:00Z",
    timeAgo: "5 min ago",
    viewable: true,
    href: "/dashboard/marketing/promotions/promo_003",
  },
  {
    id: "activity_002",
    type: "milestone",
    icon: "Award",
    iconColor: "hsl(var(--success))",
    system: true,
    action: "milestone_reached",
    target: {
      type: "promotion",
      id: "promo_001",
      name: "Happy Hour 20% Off Draft Beers",
    },
    description: '"Happy Hour" reached 250 redemptions',
    milestone: 250,
    timestamp: "2024-11-20T14:38:00Z",
    timeAgo: "12 min ago",
    viewable: true,
    href: "/dashboard/marketing/promotions/promo_001",
  },
  {
    id: "activity_003",
    type: "promotion_edited",
    icon: "Edit",
    iconColor: "hsl(var(--chart-1))",
    user: {
      id: "user_002",
      name: "Mike Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    },
    action: "edited",
    target: {
      type: "promotion",
      id: "promo_005",
      name: "Lunch Special €5 Off",
    },
    description: 'Mike edited "Lunch Special"',
    changes: ["Updated end date", "Increased budget cap"],
    timestamp: "2024-11-20T14:27:00Z",
    timeAgo: "23 min ago",
    viewable: true,
    href: "/dashboard/marketing/promotions/promo_005",
  },
  {
    id: "activity_004",
    type: "promotion_created",
    icon: "Plus",
    iconColor: "hsl(var(--success))",
    user: {
      id: "user_001",
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    action: "created",
    target: {
      type: "promotion",
      id: "promo_002",
      name: "First-Time Customer €10 Off",
    },
    description: 'Sarah created "First-Time Customer €10"',
    timestamp: "2024-11-20T13:50:00Z",
    timeAgo: "1 hour ago",
    viewable: true,
    href: "/dashboard/marketing/promotions/promo_002",
  },
  {
    id: "activity_005",
    type: "alert",
    icon: "AlertTriangle",
    iconColor: "hsl(var(--warning))",
    system: true,
    action: "alert_triggered",
    target: {
      type: "promotion",
      id: "promo_006",
      name: "Student Discount 10%",
    },
    description: 'Budget warning for "Student Discount 10%"',
    alertType: "budget_warning",
    timestamp: "2024-11-20T12:50:00Z",
    timeAgo: "2 hours ago",
    viewable: true,
    href: "/dashboard/marketing/promotions/promo_006",
  },
]

export const liveMetrics = {
  activePromotions: 12,
  liveRedemptions: {
    last10min: 47,
    last30min: 128,
    lastHour: 234,
    vsAverage: 23,
    trend: "up" as const,
  },
  currentRevenue: {
    today: 642,
    vsYesterday: 78,
    vsYesterdayPercent: 13.8,
    trend: "up" as const,
  },
  peakHour: {
    hour: "6:00 PM",
    redemptions: 67,
    promotion: "Happy Hour 20% Off Draft Beers",
  },
  lastUpdate: "2024-11-20T14:50:00Z",
  nextUpdate: "2024-11-20T14:50:30Z",
  autoRefreshEnabled: true,
  refreshInterval: 30,
}

export const quickStats = {
  today: {
    redemptions: 127,
    redemptionsDelta: 15,
    redemptionsTrend: "up" as const,
    revenue: 642,
    revenueDelta: 78,
    revenueTrend: "up" as const,
    activePromotions: 12,
    peakHour: "6:00 PM",
    peakRedemptions: 67,
  },
  yesterday: {
    redemptions: 112,
    revenue: 564,
  },
  week: {
    redemptions: 847,
    revenue: 4235,
    avgPerDay: 121,
  },
}
