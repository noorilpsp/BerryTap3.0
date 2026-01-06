import { Kpi, TimeSeriesDataPoint, MenuItem, ServiceMetric, OrderFunnelStage, ServiceTimeBucket, KitchenStaff, StaffRadarMetric, StaffOrdersComparison, StaffPerformanceDetailed, WorkloadHeatmap, CategoryRevenue, ProfitabilityMatrixItem, TrendingItem, KitchenMetrics, KitchenStation, LiveKitchenOrder, Alert, TopPerformer, NeedsAttention, ShiftData, ActivityFeedItem, SmartSuggestion } from "../types"

export const kpiData: Kpi[] = [
  {
    id: "avg_order_fulfillment",
    icon: "Clock",
    title: "Avg Order Fulfillment Time",
    value: "12m 42s",
    numericValue: 762,
    unit: "time",
    delta: 0.082,
    deltaLabel: "+8.2%",
    status: "declined",
    target: 600,
    targetLabel: "10m 00s",
    targetAchieved: false,
    progressPercent: 78.9,
    sparkline: [650, 680, 720, 690, 740, 760, 762],
    sparklineLabel: "Last 7 data points",
    color: "#ef4444",
    comparisonValue: 705,
    insight: "Order fulfillment time increased by 57 seconds compared to yesterday. Evening rush (7-9pm) is the primary contributor."
  },
  {
    id: "table_turnover",
    icon: "RefreshCw",
    title: "Table Turnover Rate",
    value: "2.3x",
    numericValue: 2.3,
    unit: "ratio",
    delta: 0.125,
    deltaLabel: "+12.5%",
    status: "improved",
    target: 2.5,
    targetLabel: "2.5x",
    targetAchieved: false,
    progressPercent: 92,
    sparkline: [2.0, 2.1, 2.2, 2.15, 2.25, 2.28, 2.3],
    color: "#10b981",
    comparisonValue: 2.04,
    insight: "Table turnover improved significantly. Lunch service efficiency up 15%."
  },
  {
    id: "orders_per_hour",
    icon: "Package",
    title: "Orders Per Hour",
    value: "47",
    numericValue: 47,
    unit: "count",
    delta: 0.053,
    deltaLabel: "+5.3%",
    status: "improved",
    target: 50,
    targetLabel: "50 orders/hour",
    targetAchieved: false,
    progressPercent: 94,
    sparkline: [42, 44, 45, 46, 48, 47, 47],
    color: "#10b981",
    comparisonValue: 44.6,
    insight: "Approaching hourly order target. Peak hour (7-8pm) reached 51 orders."
  },
  {
    id: "no_show_rate",
    icon: "UserX",
    title: "Reservation No-Show Rate",
    value: "8.5%",
    numericValue: 0.085,
    unit: "percentage",
    delta: -0.021,
    deltaLabel: "-2.1%",
    status: "improved",
    target: 0.05,
    targetLabel: "<5%",
    targetAchieved: false,
    progressPercent: 40,
    sparkline: [0.095, 0.092, 0.088, 0.09, 0.087, 0.086, 0.085],
    color: "#10b981",
    comparisonValue: 0.087,
    insight: "No-show rate decreased. SMS reminder system working effectively."
  },
  {
    id: "staff_efficiency",
    icon: "Zap",
    title: "Staff Efficiency Index",
    value: "94%",
    numericValue: 0.94,
    unit: "percentage",
    delta: 0.038,
    deltaLabel: "+3.8%",
    status: "improved",
    target: 0.95,
    targetLabel: "95%",
    targetAchieved: false,
    progressPercent: 98.9,
    sparkline: [0.89, 0.90, 0.91, 0.92, 0.93, 0.935, 0.94],
    color: "#10b981",
    comparisonValue: 0.906,
    insight: "Staff efficiency near target. Sarah and Chef Ali leading performance."
  },
  {
    id: "customer_satisfaction",
    icon: "Star",
    title: "Customer Satisfaction",
    value: "4.7/5.0",
    numericValue: 4.7,
    unit: "rating",
    delta: 0.043,
    deltaLabel: "+0.2",
    status: "improved",
    target: 4.8,
    targetLabel: "4.8/5.0",
    targetAchieved: false,
    progressPercent: 97.9,
    sparkline: [4.5, 4.55, 4.6, 4.62, 4.65, 4.68, 4.7],
    color: "#10b981",
    comparisonValue: 4.66,
    insight: "Customer satisfaction trending up. Positive feedback on food quality (95%)."
  }
]

export const revenueTimeseries: TimeSeriesDataPoint[] = [
  { time: "11:00", hour: 11, revenue: 420, orders: 18, avgCheck: 23.33, covers: 19, channel: { dineIn: 15, takeout: 2, delivery: 1 } },
  { time: "12:00", hour: 12, revenue: 850, orders: 35, avgCheck: 24.29, covers: 38, channel: { dineIn: 30, takeout: 3, delivery: 2 } },
  { time: "13:00", hour: 13, revenue: 920, orders: 38, avgCheck: 24.21, covers: 41, channel: { dineIn: 32, takeout: 4, delivery: 2 } },
  { time: "14:00", hour: 14, revenue: 680, orders: 28, avgCheck: 24.29, covers: 30, channel: { dineIn: 22, takeout: 4, delivery: 2 } },
  { time: "15:00", hour: 15, revenue: 520, orders: 22, avgCheck: 23.64, covers: 23, channel: { dineIn: 18, takeout: 3, delivery: 1 } },
  { time: "16:00", hour: 16, revenue: 450, orders: 19, avgCheck: 23.68, covers: 20, channel: { dineIn: 15, takeout: 3, delivery: 1 } },
  { time: "17:00", hour: 17, revenue: 780, orders: 32, avgCheck: 24.38, covers: 34, channel: { dineIn: 26, takeout: 4, delivery: 2 } },
  { time: "18:00", hour: 18, revenue: 1050, orders: 43, avgCheck: 24.42, covers: 46, channel: { dineIn: 35, takeout: 5, delivery: 3 } },
  { time: "19:00", hour: 19, revenue: 1240, orders: 51, avgCheck: 24.31, covers: 54, channel: { dineIn: 42, takeout: 6, delivery: 3 } },
  { time: "20:00", hour: 20, revenue: 1100, orders: 45, avgCheck: 24.44, covers: 48, channel: { dineIn: 37, takeout: 5, delivery: 3 } },
  { time: "20:45", hour: 20, minute: 45, revenue: 224, orders: 16, avgCheck: 24.00, covers: 17, partial: true }
]

export const topItems: MenuItem[] = [
  { rank: 1, itemId: "item_001", name: "Shawarma Plate", category: "Main Course", sold: 87, revenue: 1305, avgPrice: 15.00, avgPrepTime: 750, avgPrepTimeLabel: "12m 30s", rating: 4.9, trend: "up", trendValue: 0.15, profitMargin: 0.70 },
  { rank: 2, itemId: "item_002", name: "Falafel Wrap", category: "Main Course", sold: 72, revenue: 1080, avgPrice: 15.00, avgPrepTime: 525, avgPrepTimeLabel: "8m 45s", rating: 4.8, trend: "up", trendValue: 0.08, profitMargin: 0.72 },
  { rank: 3, itemId: "item_003", name: "Chicken Kebab", category: "Main Course", sold: 65, revenue: 1040, avgPrice: 16.00, avgPrepTime: 860, avgPrepTimeLabel: "14m 20s", rating: 4.7, trend: "stable", trendValue: 0.02, profitMargin: 0.68 },
  { rank: 4, itemId: "item_004", name: "Mixed Grill", category: "Main Course", sold: 54, revenue: 1080, avgPrice: 20.00, avgPrepTime: 1090, avgPrepTimeLabel: "18m 10s", rating: 4.9, trend: "up", trendValue: 0.12, profitMargin: 0.65 },
  { rank: 5, itemId: "item_005", name: "Hummus Plate", category: "Appetizers", sold: 89, revenue: 801, avgPrice: 9.00, avgPrepTime: 330, avgPrepTimeLabel: "5m 30s", rating: 4.8, trend: "stable", trendValue: 0.01, profitMargin: 0.80 },
  { rank: 6, itemId: "item_006", name: "Greek Salad", category: "Appetizers", sold: 76, revenue: 760, avgPrice: 10.00, avgPrepTime: 375, avgPrepTimeLabel: "6m 15s", rating: 4.6, trend: "down", trendValue: -0.05, profitMargin: 0.75 },
  { rank: 7, itemId: "item_007", name: "Lamb Chops", category: "Main Course", sold: 48, revenue: 960, avgPrice: 20.00, avgPrepTime: 1000, avgPrepTimeLabel: "16m 40s", rating: 4.8, trend: "up", trendValue: 0.20, profitMargin: 0.60 },
  { rank: 8, itemId: "item_008", name: "Baklava", category: "Desserts", sold: 92, revenue: 552, avgPrice: 6.00, avgPrepTime: 200, avgPrepTimeLabel: "3m 20s", rating: 4.7, trend: "down", trendValue: -0.03, profitMargin: 0.75 },
  { rank: 9, itemId: "item_009", name: "Turkish Coffee", category: "Beverages", sold: 105, revenue: 315, avgPrice: 3.00, avgPrepTime: 130, avgPrepTimeLabel: "2m 10s", rating: 4.5, trend: "stable", trendValue: 0.00, profitMargin: 0.85 },
  { rank: 10, itemId: "item_010", name: "Mint Tea", category: "Beverages", sold: 87, revenue: 218, avgPrice: 2.50, avgPrepTime: 105, avgPrepTimeLabel: "1m 45s", rating: 4.6, trend: "stable", trendValue: 0.01, profitMargin: 0.82 }
]

export const serviceMetrics: Record<string, ServiceMetric> = {
  avgPrepTime: { value: 512, label: "8m 32s", delta: 12, target: 500, targetLabel: "8m 20s", progress: 98 },
  avgServeTime: { value: 258, label: "4m 18s", delta: -23, target: 270, targetLabel: "4m 30s", progress: 96 },
  completionRate: { value: 0.978, label: "97.8%", delta: 0.012, target: 0.98, targetLabel: "98%", progress: 99 },
  activeOrders: { value: 23, capacity: 45, percent: 51, status: "normal", threshold: { warning: 35, critical: 40 } }
}

export const orderFunnel: Record<string, OrderFunnelStage> = {
  placed: { count: 347, percent: 100, timestamp: "Various" },
  confirmed: { count: 345, percent: 99.4, dropOff: 2, reasons: ["Customer cancelled (2)"] },
  preparing: { count: 321, percent: 93.1, dropOff: 24, reasons: ["In kitchen queue (24)"] },
  ready: { count: 298, percent: 86.2, dropOff: 23, reasons: ["Awaiting pickup (23)"] },
  delivered: { count: 289, percent: 83.3, dropOff: 9, reasons: ["Out for delivery (9)"] },
  completed: { count: 276, percent: 82.4, dropOff: 13, reasons: ["Pending payment (13)"] }
}

export const serviceTimeDistribution: ServiceTimeBucket[] = [
  { bucket: "<5m", range: [0, 300], count: 32, percent: 9.2, orders: [], color: "green" },
  { bucket: "5-10m", range: [300, 600], count: 156, percent: 45.0, orders: [], color: "green", isMode: true },
  { bucket: "10-15m", range: [600, 900], count: 98, percent: 28.2, orders: [], color: "yellow" },
  { bucket: "15-20m", range: [900, 1200], count: 39, percent: 11.2, orders: [], color: "yellow" },
  { bucket: "20-25m", range: [1200, 1500], count: 14, percent: 4.0, orders: [], color: "orange" },
  { bucket: ">25m", range: [1500, Infinity], count: 8, percent: 2.3, orders: [], color: "red", isOutlier: true }
]

export const kitchenStaff: KitchenStaff[] = [
  { staffId: "staff_005", name: "Chef Ali", role: "Head Chef", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ali", ordersCompleted: 124, avgPrepTime: 465, avgPrepTimeLabel: "7m 45s", prepTimeDelta: -15, onTimePercent: 98.4, rating: 4.9, badges: ["Speed Master", "Top Performer"] },
  { staffId: "staff_006", name: "Maria Garcia", role: "Cook", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria", ordersCompleted: 98, avgPrepTime: 492, avgPrepTimeLabel: "8m 12s", prepTimeDelta: 8, onTimePercent: 96.9, rating: 4.8, badges: [] },
  { staffId: "staff_007", name: "John Smith", role: "Prep", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John", ordersCompleted: 87, avgPrepTime: 542, avgPrepTimeLabel: "9m 02s", prepTimeDelta: 22, onTimePercent: 94.2, rating: 4.7, badges: [] },
  { staffId: "staff_008", name: "Lisa Chen", role: "Cook", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa", ordersCompleted: 76, avgPrepTime: 514, avgPrepTimeLabel: "8m 34s", prepTimeDelta: 14, onTimePercent: 95.8, rating: 4.8, badges: [] }
]

export const staffRadarMetrics: StaffRadarMetric[] = [
  { 
    metric: "Speed", 
    Sarah: 98, Mike: 92, Emma: 88, David: 85,
    fullMark: 100
  },
  { 
    metric: "Quality", 
    Sarah: 95, Mike: 93, Emma: 90, David: 87,
    fullMark: 100
  },
  { 
    metric: "Accuracy", 
    Sarah: 97, Mike: 95, Emma: 92, David: 89,
    fullMark: 100
  },
  { 
    metric: "Orders", 
    Sarah: 95, Mike: 78, Emma: 64, David: 57,
    fullMark: 150
  },
  { 
    metric: "Tips", 
    Sarah: 100, Mike: 88, Emma: 75, David: 66,
    fullMark: 500
  },
  { 
    metric: "Rating", 
    Sarah: 98, Mike: 96, Emma: 94, David: 90,
    fullMark: 5.0
  }
]

export const staffOrdersComparison: StaffOrdersComparison[] = [
  { name: "Sarah J.", orders: 145, efficiency: 98, revenue: 3200.50, tips: 480, color: "#10b981" },
  { name: "Mike C.", orders: 120, efficiency: 94, revenue: 2800.25, tips: 420, color: "#10b981" },
  { name: "Emma D.", orders: 98, efficiency: 91, revenue: 2400.00, tips: 360, color: "#10b981" },
  { name: "David M.", orders: 87, efficiency: 88, revenue: 2100.75, tips: 315, color: "#f59e0b" },
  { name: "Lisa W.", orders: 72, efficiency: 85, revenue: 1900.50, tips: 285, color: "#f59e0b" },
  { name: "Tom B.", orders: 65, efficiency: 82, revenue: 1750.25, tips: 260, color: "#f59e0b" },
  { name: "Amy K.", orders: 54, efficiency: 79, revenue: 1500.00, tips: 225, color: "#ef4444" },
  { name: "Chris P.", orders: 42, efficiency: 75, revenue: 1200.00, tips: 180, color: "#ef4444" }
]

export const staffPerformanceDetailed: StaffPerformanceDetailed[] = [
  {
    staffId: "staff_001",
    name: "Sarah Johnson",
    role: "Server",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    ordersHandled: 145,
    ordersDelta: 12,
    revenue: 3200.50,
    revenueDelta: 250.00,
    avgTicketTime: 1500,
    avgTicketTimeLabel: "25m",
    timeDelta: -120,
    customerRating: 4.9,
    ratingDelta: 0.1,
    tipsEarned: 480.00,
    tipsDelta: 45.00,
    hoursWorked: 9.75,
    ordersPerHour: 14.9,
    revenuePerHour: 328.26,
    efficiency: 0.98,
    efficiencyLabel: "98%",
    performance: "excellent",
    badges: ["🏆 Top Performer", "💎 Customer Favorite", "⚡ Speed Leader"],
    workloadPercent: 95,
    onTime: 0.984
  },
  {
    staffId: "staff_002",
    name: "Mike Chen",
    role: "Server",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    ordersHandled: 120,
    ordersDelta: 8,
    revenue: 2800.25,
    revenueDelta: 180.00,
    avgTicketTime: 1620,
    avgTicketTimeLabel: "27m",
    timeDelta: 60,
    customerRating: 4.8,
    ratingDelta: 0.0,
    tipsEarned: 420.00,
    tipsDelta: 35.00,
    hoursWorked: 9.5,
    ordersPerHour: 12.6,
    revenuePerHour: 294.76,
    efficiency: 0.94,
    efficiencyLabel: "94%",
    performance: "excellent",
    badges: ["🎯 Reliable", "👍 Consistent"],
    workloadPercent: 88,
    onTime: 0.958
  },
  {
    staffId: "staff_003",
    name: "Emma Davis",
    role: "Server",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    ordersHandled: 98,
    ordersDelta: 5,
    revenue: 2400.00,
    revenueDelta: 150.00,
    avgTicketTime: 1680,
    avgTicketTimeLabel: "28m",
    timeDelta: 120,
    customerRating: 4.7,
    ratingDelta: -0.1,
    tipsEarned: 360.00,
    tipsDelta: 28.00,
    hoursWorked: 9.25,
    ordersPerHour: 10.6,
    revenuePerHour: 259.46,
    efficiency: 0.91,
    efficiencyLabel: "91%",
    performance: "good",
    badges: [],
    workloadPercent: 76,
    onTime: 0.939
  },
  {
    staffId: "staff_004",
    name: "David Martinez",
    role: "Server",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    ordersHandled: 87,
    ordersDelta: 3,
    revenue: 2100.75,
    revenueDelta: 120.00,
    avgTicketTime: 1800,
    avgTicketTimeLabel: "30m",
    timeDelta: 180,
    customerRating: 4.5,
    ratingDelta: -0.2,
    tipsEarned: 315.00,
    tipsDelta: 22.00,
    hoursWorked: 9.0,
    ordersPerHour: 9.7,
    revenuePerHour: 233.42,
    efficiency: 0.88,
    efficiencyLabel: "88%",
    performance: "good",
    badges: [],
    workloadPercent: 68,
    onTime: 0.908
  }
]

export const workloadHeatmap: WorkloadHeatmap[] = [
  { 
    staff: "Sarah Johnson", 
    hours: [
      { hour: "11a", orders: 18, percent: 45, load: "medium" },
      { hour: "12p", orders: 35, percent: 88, load: "heavy" },
      { hour: "1p", orders: 38, percent: 95, load: "heavy" },
      { hour: "2p", orders: 28, percent: 70, load: "medium" },
      { hour: "3p", orders: 22, percent: 55, load: "medium" },
      { hour: "4p", orders: 32, percent: 80, load: "heavy" },
      { hour: "5p", orders: 43, percent: 100, load: "heavy" },
      { hour: "6p", orders: 51, percent: 100, load: "heavy" },
      { hour: "7p", orders: 51, percent: 100, load: "heavy" },
      { hour: "8p", orders: 45, percent: 90, load: "heavy" },
      { hour: "9p", orders: 16, percent: 40, load: "medium" },
      { hour: "10p", orders: 8, percent: 20, load: "light" }
    ],
    avgLoad: 95
  },
  { 
    staff: "Mike Chen", 
    hours: [
      { hour: "11a", orders: 15, percent: 38, load: "medium" },
      { hour: "12p", orders: 30, percent: 75, load: "heavy" },
      { hour: "1p", orders: 32, percent: 80, load: "heavy" },
      { hour: "2p", orders: 25, percent: 63, load: "medium" },
      { hour: "3p", orders: 20, percent: 50, load: "medium" },
      { hour: "4p", orders: 28, percent: 70, load: "heavy" },
      { hour: "5p", orders: 38, percent: 95, load: "heavy" },
      { hour: "6p", orders: 45, percent: 100, load: "heavy" },
      { hour: "7p", orders: 45, percent: 100, load: "heavy" },
      { hour: "8p", orders: 40, percent: 80, load: "heavy" },
      { hour: "9p", orders: 14, percent: 35, load: "medium" },
      { hour: "10p", orders: 6, percent: 15, load: "light" }
    ],
    avgLoad: 88
  },
  { 
    staff: "Emma Davis", 
    hours: [
      { hour: "11a", orders: 8, percent: 20, load: "light" },
      { hour: "12p", orders: 22, percent: 55, load: "medium" },
      { hour: "1p", orders: 25, percent: 63, load: "medium" },
      { hour: "2p", orders: 20, percent: 50, load: "medium" },
      { hour: "3p", orders: 30, percent: 75, load: "heavy" },
      { hour: "4p", orders: 35, percent: 88, load: "heavy" },
      { hour: "5p", orders: 40, percent: 100, load: "heavy" },
      { hour: "6p", orders: 32, percent: 80, load: "heavy" },
      { hour: "7p", orders: 28, percent: 70, load: "medium" },
      { hour: "8p", orders: 24, percent: 60, load: "medium" },
      { hour: "9p", orders: 8, percent: 20, load: "light" },
      { hour: "10p", orders: 0, percent: 0, load: "none" }
    ],
    avgLoad: 76
  },
  { 
    staff: "David Martinez", 
    hours: [
      { hour: "11a", orders: 12, percent: 30, load: "medium" },
      { hour: "12p", orders: 18, percent: 45, load: "medium" },
      { hour: "1p", orders: 20, percent: 50, load: "medium" },
      { hour: "2p", orders: 28, percent: 70, load: "heavy" },
      { hour: "3p", orders: 32, percent: 80, load: "heavy" },
      { hour: "4p", orders: 25, percent: 63, load: "medium" },
      { hour: "5p", orders: 22, percent: 55, load: "medium" },
      { hour: "6p", orders: 18, percent: 45, load: "medium" },
      { hour: "7p", orders: 15, percent: 38, load: "medium" },
      { hour: "8p", orders: 5, percent: 13, load: "light" },
      { hour: "9p", orders: 0, percent: 0, load: "none" },
      { hour: "10p", orders: 0, percent: 0, load: "none" }
    ],
    avgLoad: 68
  },
  { 
    staff: "Lisa Williams", 
    hours: [
      { hour: "11a", orders: 6, percent: 15, load: "light" },
      { hour: "12p", orders: 15, percent: 38, load: "medium" },
      { hour: "1p", orders: 25, percent: 63, load: "heavy" },
      { hour: "2p", orders: 28, percent: 70, load: "heavy" },
      { hour: "3p", orders: 20, percent: 50, load: "medium" },
      { hour: "4p", orders: 18, percent: 45, load: "medium" },
      { hour: "5p", orders: 16, percent: 40, load: "medium" },
      { hour: "6p", orders: 12, percent: 30, load: "medium" },
      { hour: "7p", orders: 4, percent: 10, load: "light" },
      { hour: "8p", orders: 0, percent: 0, load: "none" },
      { hour: "9p", orders: 0, percent: 0, load: "none" },
      { hour: "10p", orders: 0, percent: 0, load: "none" }
    ],
    avgLoad: 62
  }
]

export const categoryRevenue: CategoryRevenue[] = [
  { 
    category: "Main Course", 
    revenue: 7234, 
    percent: 42.0, 
    color: "#10b981",
    items: 6,
    avgPrice: 16.50,
    totalOrders: 438
  },
  { 
    category: "Appetizers", 
    revenue: 3890, 
    percent: 23.0, 
    color: "#3b82f6",
    items: 8,
    avgPrice: 9.50,
    totalOrders: 410
  },
  { 
    category: "Desserts", 
    revenue: 2456, 
    percent: 14.0, 
    color: "#f59e0b",
    items: 5,
    avgPrice: 6.50,
    totalOrders: 378
  },
  { 
    category: "Beverages", 
    revenue: 2134, 
    percent: 12.0, 
    color: "#eab308",
    items: 12,
    avgPrice: 3.25,
    totalOrders: 657
  },
  { 
    category: "Sides", 
    revenue: 1567, 
    percent: 9.0, 
    color: "#8b5cf6",
    items: 4,
    avgPrice: 5.00,
    totalOrders: 313
  }
]

export const profitabilityMatrix: ProfitabilityMatrixItem[] = [
  { 
    itemId: "item_001", 
    name: "Shawarma Plate", 
    category: "Main Course",
    volume: 87, 
    volumePercent: 87,
    margin: 70, 
    revenue: 1305,
    quadrant: "star",
    color: "#10b981"
  },
  { 
    itemId: "item_002", 
    name: "Falafel Wrap", 
    volume: 72, 
    volumePercent: 72,
    margin: 72, 
    revenue: 1080,
    quadrant: "star",
    color: "#10b981"
  },
  { 
    itemId: "item_003", 
    name: "Chicken Kebab", 
    volume: 65, 
    volumePercent: 65,
    margin: 68, 
    revenue: 1040,
    quadrant: "star",
    color: "#10b981"
  },
  { 
    itemId: "item_004", 
    name: "Mixed Grill", 
    volume: 54, 
    volumePercent: 54,
    margin: 65, 
    revenue: 1080,
    quadrant: "star",
    color: "#10b981"
  },
  { 
    itemId: "item_005", 
    name: "Hummus Plate", 
    volume: 89, 
    volumePercent: 89,
    margin: 80, 
    revenue: 801,
    quadrant: "star",
    color: "#3b82f6"
  },
  { 
    itemId: "item_006", 
    name: "Greek Salad", 
    volume: 76, 
    volumePercent: 76,
    margin: 75, 
    revenue: 760,
    quadrant: "cash_cow",
    color: "#3b82f6"
  },
  { 
    itemId: "item_009", 
    name: "Turkish Coffee", 
    volume: 105, 
    volumePercent: 100,
    margin: 85, 
    revenue: 315,
    quadrant: "cash_cow",
    color: "#eab308"
  },
  { 
    itemId: "item_010", 
    name: "Mint Tea", 
    volume: 87, 
    volumePercent: 87,
    margin: 82, 
    revenue: 218,
    quadrant: "question_mark",
    color: "#eab308"
  },
  { 
    itemId: "item_008", 
    name: "Baklava", 
    volume: 92, 
    volumePercent: 92,
    margin: 75, 
    revenue: 552,
    quadrant: "question_mark",
    color: "#f59e0b"
  }
]

export const trendingItems: TrendingItem[] = [
  { 
    itemId: "item_007", 
    name: "Lamb Chops", 
    category: "Main Course", 
    sold: 60, 
    revenue: 1200, 
    margin: 60, 
    marginLabel: "$$$",
    prepTime: 1000, 
    prepTimeLabel: "16m 40s", 
    prepTimeStatus: "slow",
    trend: "up", 
    trendValue: 0.20, 
    trendLabel: "+20%" 
  },
  { 
    itemId: "item_004", 
    name: "Mixed Grill", 
    category: "Main Course", 
    sold: 105, 
    revenue: 2100, 
    margin: 65, 
    marginLabel: "$$$$",
    prepTime: 1090, 
    prepTimeLabel: "18m 10s", 
    prepTimeStatus: "slow",
    trend: "up", 
    trendValue: 0.15, 
    trendLabel: "+15%" 
  },
  { 
    itemId: "item_003", 
    name: "Chicken Kebab", 
    category: "Main Course", 
    sold: 65, 
    revenue: 1040, 
    margin: 68, 
    marginLabel: "$$$$",
    prepTime: 860, 
    prepTimeLabel: "14m 20s", 
    prepTimeStatus: "normal",
    trend: "stable", 
    trendValue: 0.02, 
    trendLabel: "+2%" 
  },
  { 
    itemId: "item_006", 
    name: "Greek Salad", 
    category: "Appetizers", 
    sold: 150, 
    revenue: 1500, 
    margin: 75, 
    marginLabel: "$$$$",
    prepTime: 375, 
    prepTimeLabel: "6m 15s", 
    prepTimeStatus: "fast",
    trend: "down", 
    trendValue: -0.05, 
    trendLabel: "-5%" 
  },
  { 
    itemId: "item_008", 
    name: "Baklava", 
    category: "Desserts", 
    sold: 150, 
    revenue: 900, 
    margin: 75, 
    marginLabel: "$$",
    prepTime: 200, 
    prepTimeLabel: "3m 20s", 
    prepTimeStatus: "fast",
    trend: "down", 
    trendValue: -0.03, 
    trendLabel: "-3%" 
  }
]

export const kitchenMetrics: KitchenMetrics = {
  activeOrders: { 
    count: 23, 
    capacity: 45, 
    percent: 51, 
    status: "normal", 
    statusColor: "green",
    thresholds: { warning: 35, critical: 40 }
  },
  avgPrepTime: { 
    value: 512, 
    label: "8m 32s", 
    delta: 12, 
    target: 500, 
    targetLabel: "8m 20s", 
    progress: 98 
  },
  accuracyRate: { 
    value: 0.978, 
    label: "97.8%", 
    delta: -0.003, 
    target: 0.98, 
    targetLabel: "98%", 
    progress: 99 
  },
  delayedOrders: { 
    count: 2, 
    threshold: 5, 
    percent: 40, 
    status: "warning", 
    statusColor: "yellow",
    orderIds: ["ORD-1237", "ORD-1238"]
  }
}

export const kitchenStations: KitchenStation[] = [
  {
    id: "grill",
    name: "Grill Station",
    efficiency: 96,
    activeOrders: 8,
    capacity: 12,
    capacityPercent: 67,
    avgPrepTime: 782,
    avgPrepTimeLabel: "13m 02s",
    onTimePercent: 98.2,
    staff: ["Chef Ali", "Maria Garcia"],
    status: "good",
    statusColor: "green"
  },
  {
    id: "fryer",
    name: "Fryer Station",
    efficiency: 92,
    activeOrders: 7,
    capacity: 8,
    capacityPercent: 88,
    avgPrepTime: 435,
    avgPrepTimeLabel: "7m 15s",
    onTimePercent: 94.5,
    staff: ["John Smith"],
    status: "bottleneck",
    statusColor: "yellow",
    alert: "At 88% capacity - consider backup support"
  },
  {
    id: "salad",
    name: "Salad Station",
    efficiency: 94,
    activeOrders: 4,
    capacity: 10,
    capacityPercent: 40,
    avgPrepTime: 262,
    avgPrepTimeLabel: "4m 22s",
    onTimePercent: 96.8,
    staff: ["Lisa Chen"],
    status: "good",
    statusColor: "green"
  },
  {
    id: "dessert",
    name: "Dessert Station",
    efficiency: 98,
    activeOrders: 2,
    capacity: 8,
    capacityPercent: 25,
    avgPrepTime: 198,
    avgPrepTimeLabel: "3m 18s",
    onTimePercent: 99.1,
    staff: ["Maria Garcia"],
    status: "excellent",
    statusColor: "green"
  },
  {
    id: "drinks",
    name: "Drinks Bar",
    efficiency: 99,
    activeOrders: 2,
    capacity: 15,
    capacityPercent: 13,
    avgPrepTime: 92,
    avgPrepTimeLabel: "1m 32s",
    onTimePercent: 99.8,
    staff: ["Automated"],
    status: "excellent",
    statusColor: "green"
  }
]

export const liveKitchenOrders: LiveKitchenOrder[] = [
  {
    orderId: "ORD-1234",
    items: ["Shawarma Plate", "Hummus Plate"],
    station: "Grill",
    assignedStaff: "Chef Ali",
    elapsedTime: 200,
    elapsedTimeLabel: "3m 20s",
    targetTime: 630,
    targetTimeLabel: "10m 30s",
    estimatedReady: 310,
    estimatedReadyLabel: "5m 10s",
    status: "on_time",
    statusLabel: "On Time",
    statusColor: "green",
    progress: 32
  },
  {
    orderId: "ORD-1235",
    items: ["Falafel Wrap (×2)"],
    station: "Fryer",
    assignedStaff: "John Smith",
    elapsedTime: 165,
    elapsedTimeLabel: "2m 45s",
    targetTime: 510,
    targetTimeLabel: "8m 30s",
    estimatedReady: 345,
    estimatedReadyLabel: "5m 45s",
    status: "on_time",
    statusLabel: "On Time",
    statusColor: "green",
    progress: 32
  },
  {
    orderId: "ORD-1236",
    items: ["Greek Salad", "House Dressing"],
    station: "Salad",
    assignedStaff: "Lisa Chen",
    elapsedTime: 70,
    elapsedTimeLabel: "1m 10s",
    targetTime: 375,
    targetTimeLabel: "6m 15s",
    estimatedReady: 0,
    estimatedReadyLabel: "Ready",
    status: "ready",
    statusLabel: "Ready for Pickup",
    statusColor: "blue",
    progress: 100
  },
  {
    orderId: "ORD-1237",
    items: ["Chicken Kebab", "Rice Pilaf", "Side Salad"],
    station: "Grill",
    assignedStaff: "Maria Garcia",
    elapsedTime: 530,
    elapsedTimeLabel: "8m 50s",
    targetTime: 600,
    targetTimeLabel: "10m 00s",
    estimatedReady: 160,
    estimatedReadyLabel: "2m 40s",
    status: "warning",
    statusLabel: "Approaching Limit",
    statusColor: "yellow",
    progress: 88
  },
  {
    orderId: "ORD-1238",
    items: ["Mixed Grill (Large)"],
    station: "Grill",
    assignedStaff: "Chef Ali",
    elapsedTime: 725,
    elapsedTimeLabel: "12m 05s",
    targetTime: 600,
    targetTimeLabel: "10m 00s",
    estimatedReady: -125,
    estimatedReadyLabel: "Overdue 2m 05s",
    status: "delayed",
    statusLabel: "DELAYED",
    statusColor: "red",
    progress: 120,
    alert: true
  },
  {
    orderId: "ORD-1239",
    items: ["Baklava (×3)", "Turkish Coffee"],
    station: "Dessert",
    assignedStaff: "Maria Garcia",
    elapsedTime: 45,
    elapsedTimeLabel: "45s",
    targetTime: 200,
    targetTimeLabel: "3m 20s",
    estimatedReady: 155,
    estimatedReadyLabel: "2m 35s",
    status: "on_time",
    statusLabel: "On Time",
    statusColor: "green",
    progress: 23
  }
]

export const activeAlerts: Alert[] = [
  {
    id: "alert_001",
    severity: "high",
    severityColor: "red",
    severityIcon: "🔴",
    type: "service_delay",
    title: "Table 8: Excessive Wait Time",
    message: "Current wait: 18 minutes",
    details: "Order #1238 - Mixed Grill\nThreshold: 15 minutes\nCustomer has been waiting 3 minutes over target.",
    timestamp: "2024-11-12T20:43:00Z",
    age: "2 minutes ago",
    relatedEntity: { type: "order", id: "ORD-1238" },
    actions: [
      { label: "View Order", action: "viewOrder", orderId: "ORD-1238" },
      { label: "Assign Staff", action: "assignStaff" }
    ]
  },
  {
    id: "alert_002",
    severity: "medium",
    severityColor: "yellow",
    severityIcon: "🟡",
    type: "capacity_warning",
    title: "Fryer Station High Capacity",
    message: "Current: 90% capacity (7/8 slots)",
    details: "3 orders in queue\nAverage wait increased by 2 minutes\nConsider backup support during peak hours",
    timestamp: "2024-11-12T20:40:00Z",
    age: "5 minutes ago",
    relatedEntity: { type: "station", id: "fryer" },
    actions: [
      { label: "View Kitchen", action: "viewKitchen" },
      { label: "Alert Chef", action: "alertChef", staffId: "staff_005" }
    ]
  },
  {
    id: "alert_003",
    severity: "medium",
    severityColor: "yellow",
    severityIcon: "🟡",
    type: "staffing",
    title: "Sarah Approaching Overtime",
    message: "Hours worked: 7h 45m",
    details: "Target shift: 8h 00m\nProjected total if continues: 9h 15m\nMandatory break due in 15 minutes\nOT cost: $35/hour",
    timestamp: "2024-11-12T20:33:00Z",
    age: "12 minutes ago",
    relatedEntity: { type: "staff", id: "staff_001" },
    actions: [
      { label: "View Schedule", action: "viewSchedule" },
      { label: "Schedule Break", action: "scheduleBreak", staffId: "staff_001" }
    ]
  }
]

export const topPerformers: TopPerformer[] = [
  {
    rank: 1,
    staffId: "staff_001",
    name: "Sarah Johnson",
    role: "Server",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    metrics: "145 orders • 98% efficiency",
    detailedMetrics: {
      orders: 145,
      efficiency: 98,
      tips: 480,
      rating: 4.9,
      hours: 9.75,
      revenuePerHour: 328.26
    },
    badges: ["🏆 Top Performer", "💎 Customer Favorite", "⚡ Speed Leader"],
    score: 98
  },
  {
    rank: 2,
    staffId: "staff_005",
    name: "Chef Ali",
    role: "Head Chef",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ali",
    metrics: "124 orders • 98.4% on-time",
    detailedMetrics: {
      orders: 124,
      efficiency: 98.4,
      avgPrepTime: "7m 45s",
      onTimePercent: 98.4,
      hours: 9.75,
      ordersPerHour: 12.7
    },
    badges: ["⚡ Speed Master", "🍳 Kitchen Star"],
    score: 96
  },
  {
    rank: 3,
    staffId: "staff_002",
    name: "Mike Chen",
    role: "Server",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    metrics: "120 orders • 94% efficiency",
    detailedMetrics: {
      orders: 120,
      efficiency: 94,
      tips: 420,
      rating: 4.8,
      hours: 9.5,
      revenuePerHour: 294.76
    },
    badges: ["🎯 Reliable", "👍 Consistent"],
    score: 94
  }
]

export const needsAttention: NeedsAttention[] = [
  {
    id: "attention_001",
    type: "menu_item",
    category: "Menu Performance",
    icon: "🍽️",
    title: "Greek Salad Trending Down",
    severity: "medium",
    metric: "-5% vs last week",
    details: {
      currentOrders: 72,
      previousOrders: 76,
      percentChange: -5.3,
      customerFeedback: "Too much dressing (mentioned in 12 reviews)",
      margin: 75,
      revenue: 760
    },
    suggestedActions: [
      { action: "Reduce dressing portion by 20%", impact: "high", effort: "low" },
      { action: "Add to daily specials board", impact: "medium", effort: "low" },
      { action: "Price adjustment ($10 → $9)", impact: "high", effort: "medium" }
    ],
    actions: [
      { label: "Investigate", action: "investigate", itemId: "item_006" },
      { label: "Create Promo", action: "createPromo" },
      { label: "Dismiss", action: "dismiss" }
    ]
  },
  {
    id: "attention_002",
    type: "kitchen_efficiency",
    category: "Service Efficiency",
    icon: "⏱️",
    title: "Average Prep Time Increased",
    severity: "medium",
    metric: "+12s vs target",
    details: {
      current: "8m 32s",
      target: "8m 20s",
      delta: 12,
      trend: "increasing",
      daysIncreasing: 3,
      impact: "2 delayed orders today"
    },
    rootCause: [
      "Fryer station bottleneck (88% capacity)",
      "John Smith +22s above his average",
      "Peak hour staffing may be insufficient"
    ],
    actions: [
      { label: "View Kitchen", action: "viewKitchen" },
      { label: "Schedule Staff", action: "scheduleStaff" },
      { label: "Dismiss", action: "dismiss" }
    ]
  },
  {
    id: "attention_003",
    type: "staff_performance",
    category: "Staff Performance",
    icon: "👥",
    title: "David Martinez Below Target",
    severity: "low",
    metric: "88% efficiency",
    details: {
      efficiency: 88,
      target: 90,
      avgTicketTime: "30m",
      teamAvg: "26m",
      rating: 4.5,
      previousRating: 4.7,
      ratingDelta: -0.2
    },
    recommendations: [
      { action: "Schedule coaching session", priority: "high" },
      { action: "Pair with Sarah for mentoring", priority: "medium" },
      { action: "Review recent customer feedback", priority: "medium" }
    ],
    actions: [
      { label: "View Profile", action: "viewProfile", staffId: "staff_004" },
      { label: "Schedule Coaching", action: "scheduleCoaching" }
    ]
  }
]

export const currentShift: ShiftData = {
  name: "Dinner Service",
  startTime: "17:00",
  endTime: "23:00",
  duration: 360,
  elapsed: 225,
  elapsedLabel: "3h 45m",
  remaining: 135,
  remainingLabel: "2h 15m",
  progress: 62.5,
  ordersCompleted: 187,
  ordersTarget: 250,
  ordersProgress: 74.8,
  ordersPace: "On track (+2% vs target)",
  ordersProjection: 255,
  revenue: 4234.50,
  revenueTarget: 5000.00,
  revenueProgress: 84.7,
  revenueProjection: 5150.00,
  revenueProjectionPercent: 103,
  revenueStatus: "exceeding",
  activeStaff: 8,
  scheduledStaff: 10,
  staffBreakdown: {
    servers: 4,
    kitchen: 3,
    bar: 1
  },
  upcomingBreaks: [
    { staffName: "Sarah", timeUntil: "15m" }
  ],
  efficiency: 94,
  efficiencyTarget: 90,
  efficiencyDelta: 4,
  efficiencyStatus: "above_target"
}

export const previousShift: ShiftData = {
  name: "Lunch Service",
  startTime: "11:00",
  endTime: "17:00",
  ordersCompleted: 160,
  ordersTarget: 160,
  ordersCompletionRate: 96,
  revenue: 3120.00,
  revenueTarget: 3000.00,
  revenuePercent: 104,
  efficiency: 96,
  efficiencyTarget: 90,
  peakHour: {
    time: "1-2pm",
    revenue: 920,
    orders: 38
  },
  status: "success"
}

export const dailyGoals: DailyGoal[] = [
  {
    id: "goal_revenue",
    category: "Revenue",
    icon: "💰",
    metric: "Daily Revenue",
    current: 7234.50,
    target: 12000.00,
    unit: "currency",
    progress: 60.3,
    status: "on_track",
    statusColor: "green",
    projection: 12350.00,
    projectionPercent: 103,
    projectionLabel: "On track to exceed by $350",
    timeRemaining: "2h 15m",
    paceData: {
      currentPace: 65.82,
      requiredPace: 59.56,
      paceLabel: "$65.82/min (need: $59.56/min)",
      paceStatus: "ahead"
    }
  },
  {
    id: "goal_orders",
    category: "Operations",
    icon: "📦",
    metric: "Daily Orders",
    current: 347,
    target: 400,
    unit: "count",
    progress: 86.8,
    status: "on_track",
    statusColor: "green",
    remaining: 53,
    remainingLabel: "Need 53 more orders",
    paceData: {
      currentPace: 35.5,
      requiredPace: 23.5,
      paceLabel: "Current: 35.5/hr (need: 23.5/hr)",
      paceStatus: "ahead"
    },
    projection: 405,
    projectionPercent: 101,
    projectionLabel: "If pace continues: 405 orders (101%)"
  },
  {
    id: "goal_satisfaction",
    category: "Quality",
    icon: "⭐",
    metric: "Customer Satisfaction",
    current: 4.7,
    target: 4.8,
    unit: "rating",
    progress: 97.9,
    status: "almost",
    statusColor: "yellow",
    remaining: 0.1,
    message: "Almost there! Just 0.1 points away",
    additionalInfo: {
      reviewsToday: 247,
      responseRate: 89,
      trend: "up",
      trendValue: 0.2,
      trendLabel: "Up 0.2 from yesterday"
    },
    focusArea: "Maintain food quality & service speed"
  },
  {
    id: "goal_efficiency",
    category: "Operations",
    icon: "⚡",
    metric: "Staff Efficiency",
    current: 94,
    target: 95,
    unit: "percentage",
    progress: 98.9,
    status: "almost",
    statusColor: "yellow",
    remaining: 1,
    message: "So close! Just 1 point to go",
    trend: "up",
    trendValue: 3.8,
    trendLabel: "Up 3.8% from yesterday",
    leaders: "Sarah & Chef Ali leading the way"
  }
]

export const activityFeed: ActivityFeedItem[] = [
  {
    id: "act_001",
    type: "order_completed",
    icon: "✅",
    iconColor: "green",
    message: "Sarah completed Order #1239",
    details: "Mixed Grill + Sides",
    timestamp: "2024-11-12T20:45:00Z",
    age: "Just now",
    relatedEntity: { type: "order", id: "ORD-1239", staffId: "staff_001" }
  },
  {
    id: "act_002",
    type: "milestone",
    icon: "🏆",
    iconColor: "gold",
    message: "Chef Ali hit 120 orders today",
    details: "Milestone achieved",
    timestamp: "2024-11-12T20:43:00Z",
    age: "2 minutes ago",
    relatedEntity: { type: "staff", id: "staff_005" }
  },
  {
    id: "act_003",
    type: "record",
    icon: "📈",
    iconColor: "blue",
    message: "New peak hour record: $1,240",
    details: "7-8pm time slot",
    timestamp: "2024-11-12T20:30:00Z",
    age: "15 minutes ago",
    relatedEntity: { type: "revenue", hour: 19 }
  },
  {
    id: "act_004",
    type: "inventory_alert",
    icon: "⚠️",
    iconColor: "orange",
    message: "Lamb Chops sold out",
    details: "86 units sold today",
    timestamp: "2024-11-12T20:23:00Z",
    age: "22 minutes ago",
    relatedEntity: { type: "item", id: "item_007" },
    actions: [
      { label: "Restock", action: "restock" },
      { label: "Notify Servers", action: "notifyServers" }
    ]
  },
  {
    id: "act_005",
    type: "shift_start",
    icon: "🔄",
    iconColor: "blue",
    message: "Evening shift started",
    details: "8 staff checked in",
    timestamp: "2024-11-12T18:45:00Z",
    age: "2 hours ago",
    relatedEntity: { type: "shift", id: "shift_dinner" }
  },
  {
    id: "act_006",
    type: "goal_achieved",
    icon: "💰",
    iconColor: "green",
    message: "Lunch revenue target exceeded",
    details: "$3,120 (104% of goal)",
    timestamp: "2024-11-12T17:30:00Z",
    age: "3 hours ago",
    relatedEntity: { type: "goal", id: "goal_lunch_revenue" }
  },
  {
    id: "act_007",
    type: "badge_earned",
    icon: "🎯",
    iconColor: "purple",
    message: "Sarah earned \"Top Performer\" badge",
    details: "5th time this month",
    timestamp: "2024-11-12T16:45:00Z",
    age: "4 hours ago",
    relatedEntity: { type: "staff", id: "staff_001" }
  },
  {
    id: "act_008",
    type: "system",
    icon: "📊",
    iconColor: "gray",
    message: "Daily prep completed",
    details: "All stations ready",
    timestamp: "2024-11-12T12:00:00Z",
    age: "8 hours ago",
    relatedEntity: { type: "system", id: "daily_prep" }
  }
]

export const smartSuggestions: SmartSuggestion[] = [
  {
    id: "sugg_001",
    type: "staffing",
    category: "Operations",
    priority: "high",
    priorityColor: "red",
    icon: "🎯",
    title: "Optimize Rush Hour Staffing",
    analysis: "7-9pm generates 42% of daily revenue but only 1 additional server during this window.",
    recommendation: "Add 1 server for 7-9pm window",
    expectedImpact: {
      revenueIncrease: 200,
      revenueIncreaseLabel: "+$200 daily revenue",
      waitTimeReduction: 180,
      waitTimeReductionLabel: "-3min avg wait time",
      satisfactionIncrease: 5,
      satisfactionIncreaseLabel: "+5% customer satisfaction"
    },
    cost: 35,
    costLabel: "$35/shift",
    roi: 571,
    roiLabel: "571% ROI ($200 rev / $35 cost)",
    confidence: 92,
    dataPoints: 180,
    actions: [
      { label: "Schedule Staff", action: "scheduleStaff" },
      { label: "See Details", action: "viewDetails" },
      { label: "Dismiss", action: "dismiss" }
    ]
  },
  {
    id: "sugg_002",
    type: "menu_promotion",
    category: "Marketing",
    priority: "medium",
    priorityColor: "yellow",
    icon: "🍽️",
    title: "Promote Underperforming Item",
    analysis: "Greek Salad has excellent 75% margin but sales trending down -5% this week.",
    recommendation: "Feature as \"Daily Special\" tomorrow",
    expectedImpact: {
      salesIncrease: 15,
      salesIncreaseLabel: "+15% item sales (+12 orders/day)",
      revenueIncrease: 120,
      revenueIncreaseLabel: "+$120 daily revenue",
      additionalBenefit: "Clear excess inventory"
    },
    cost: 0,
    costLabel: "$0 (menu board update only)",
    roi: "Infinite",
    roiLabel: "Infinite ROI",
    confidence: 78,
    dataPoints: 90,
    actions: [
      { label: "Create Promo", action: "createPromo", itemId: "item_006" },
      { label: "Preview", action: "preview" },
      { label: "Dismiss", action: "dismiss" }
    ]
  },
  {
    id: "sugg_003",
    type: "happy_hour",
    category: "Marketing",
    priority: "low",
    priorityColor: "blue",
    icon: "⏰",
    title: "Adjust Happy Hour Timing",
    analysis: "2-4pm is slowest period with only $1,200 revenue (7% of daily total).",
    recommendation: "Introduce 2-4pm happy hour specials",
    expectedImpact: {
      ordersIncrease: 25,
      ordersIncreaseLabel: "+25% afternoon orders",
      revenueIncrease: 300,
      revenueIncreaseLabel: "+$300 daily revenue",
      additionalBenefit: "Better kitchen utilization during slow period"
    },
    cost: "20% discount",
    costLabel: "20% discount on select items",
    roi: "18-22%",
    roiLabel: "Estimated lift: 18-22%",
    confidence: 65,
    dataPoints: 120,
    actions: [
      { label: "Design Promo", action: "designPromo" },
      { label: "Run Test", action: "runTest" },
      { label: "Dismiss", action: "dismiss" }
    ]
  }
]
