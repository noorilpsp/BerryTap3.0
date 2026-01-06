// Revenue Timeline Data (30 data points)
export const revenueTimelineData = [
  { date: "Oct 15", baseline: 850, actual: 890, lift: 40, period: "before" },
  { date: "Oct 18", baseline: 920, actual: 920, lift: 0, period: "before" },
  { date: "Oct 21", baseline: 880, actual: 910, lift: 30, period: "before" },
  { date: "Oct 24", baseline: 950, actual: 950, lift: 0, period: "before" },
  { date: "Oct 27", baseline: 900, actual: 920, lift: 20, period: "before" },
  { date: "Oct 30", baseline: 930, actual: 930, lift: 0, period: "before" },
  { date: "Nov 1", baseline: 900, actual: 1150, lift: 250, period: "during" },
  { date: "Nov 3", baseline: 920, actual: 1280, lift: 360, period: "during" },
  { date: "Nov 5", baseline: 950, actual: 1520, lift: 570, period: "during" },
  { date: "Nov 7", baseline: 980, actual: 1680, lift: 700, period: "during" },
  { date: "Nov 9", baseline: 1000, actual: 1850, lift: 850, period: "during" },
  { date: "Nov 11", baseline: 990, actual: 1920, lift: 930, period: "during" },
  { date: "Nov 13", baseline: 1010, actual: 2150, lift: 1140, period: "during" },
  { date: "Nov 15", baseline: 980, actual: 2380, lift: 1400, period: "during" },
  { date: "Nov 17", baseline: 1020, actual: 2520, lift: 1500, period: "during" },
  { date: "Nov 19", baseline: 1030, actual: 2650, lift: 1620, period: "during" },
  { date: "Nov 21", baseline: 1050, actual: 2780, lift: 1730, period: "during" },
  { date: "Nov 23", baseline: 1080, actual: 2850, lift: 1770, period: "during" },
  { date: "Nov 25", baseline: 1100, actual: 2820, lift: 1720, period: "during" },
  { date: "Nov 27", baseline: 1070, actual: 2650, lift: 1580, period: "during" },
  { date: "Nov 29", baseline: 1090, actual: 2450, lift: 1360, period: "during" },
  { date: "Nov 30", baseline: 1100, actual: 2200, lift: 1100, period: "during" },
  { date: "Dec 1", baseline: 1080, actual: 1520, lift: 440, period: "after" },
  { date: "Dec 3", baseline: 1050, actual: 1280, lift: 230, period: "after" },
  { date: "Dec 5", baseline: 1020, actual: 1150, lift: 130, period: "after" },
  { date: "Dec 7", baseline: 1040, actual: 1100, lift: 60, period: "after" },
  { date: "Dec 9", baseline: 1060, actual: 1080, lift: 20, period: "after" },
  { date: "Dec 11", baseline: 1030, actual: 1040, lift: 10, period: "after" },
  { date: "Dec 13", baseline: 1000, actual: 1010, lift: 10, period: "after" },
  { date: "Dec 15", baseline: 1020, actual: 1020, lift: 0, period: "after" }
];

// Redemption Rate Trend Data (8 weeks)
export const redemptionRateData = [
  { week: "W1", actual: 38.5, movingAvg: 38.5, redemptions: 156, change: 0 },
  { week: "W2", actual: 41.2, movingAvg: 39.9, redemptions: 167, change: 2.7 },
  { week: "W3", actual: 44.8, movingAvg: 41.5, redemptions: 182, change: 3.6 },
  { week: "W4", actual: 43.1, movingAvg: 41.9, redemptions: 175, change: -1.7 },
  { week: "W5", actual: 46.5, movingAvg: 42.8, redemptions: 189, change: 3.4 },
  { week: "W6", actual: 42.9, movingAvg: 43.2, redemptions: 174, change: -3.6 },
  { week: "W7", actual: 47.3, movingAvg: 43.5, redemptions: 192, change: 4.4 },
  { week: "W8", actual: 45.8, movingAvg: 44.3, redemptions: 186, change: -1.5 }
];

// Usage Heatmap Data (7 days × 13 hours)
export const usageHeatmapData = [
  // Monday
  { day: "Mon", hour: 11, hourLabel: "11 AM", value: 5, color: "low", topPromo: "Student Discount" },
  { day: "Mon", hour: 12, hourLabel: "12 PM", value: 12, color: "medium", topPromo: "Lunch Special" },
  { day: "Mon", hour: 13, hourLabel: "1 PM", value: 8, color: "low", topPromo: "Lunch Special" },
  { day: "Mon", hour: 14, hourLabel: "2 PM", value: 6, color: "low", topPromo: "Student Discount" },
  { day: "Mon", hour: 15, hourLabel: "3 PM", value: 3, color: "low", topPromo: "Student Discount" },
  { day: "Mon", hour: 16, hourLabel: "4 PM", value: 2, color: "low", topPromo: "Happy Hour" },
  { day: "Mon", hour: 17, hourLabel: "5 PM", value: 45, color: "high", topPromo: "Happy Hour 20%" },
  { day: "Mon", hour: 18, hourLabel: "6 PM", value: 67, color: "very-high", topPromo: "Happy Hour 20%" },
  { day: "Mon", hour: 19, hourLabel: "7 PM", value: 23, color: "medium", topPromo: "Dinner Special" },
  { day: "Mon", hour: 20, hourLabel: "8 PM", value: 15, color: "medium", topPromo: "Late Night" },
  { day: "Mon", hour: 21, hourLabel: "9 PM", value: 8, color: "low", topPromo: "Late Night" },
  { day: "Mon", hour: 22, hourLabel: "10 PM", value: 4, color: "low", topPromo: "Late Night" },
  { day: "Mon", hour: 23, hourLabel: "11 PM", value: 2, color: "low", topPromo: "Late Night" },
  // Tuesday
  { day: "Tue", hour: 11, hourLabel: "11 AM", value: 6, color: "low", topPromo: "Student Discount" },
  { day: "Tue", hour: 12, hourLabel: "12 PM", value: 14, color: "medium", topPromo: "Lunch Special" },
  { day: "Tue", hour: 13, hourLabel: "1 PM", value: 32, color: "high", topPromo: "BOGO Pizza Tuesdays" },
  { day: "Tue", hour: 14, hourLabel: "2 PM", value: 7, color: "low", topPromo: "BOGO Pizza Tuesdays" },
  { day: "Tue", hour: 15, hourLabel: "3 PM", value: 4, color: "low", topPromo: "Student Discount" },
  { day: "Tue", hour: 16, hourLabel: "4 PM", value: 2, color: "low", topPromo: "Happy Hour" },
  { day: "Tue", hour: 17, hourLabel: "5 PM", value: 42, color: "high", topPromo: "Happy Hour 20%" },
  { day: "Tue", hour: 18, hourLabel: "6 PM", value: 65, color: "very-high", topPromo: "Happy Hour 20%" },
  { day: "Tue", hour: 19, hourLabel: "7 PM", value: 21, color: "medium", topPromo: "BOGO Pizza Tuesdays" },
  { day: "Tue", hour: 20, hourLabel: "8 PM", value: 18, color: "medium", topPromo: "Late Night" },
  { day: "Tue", hour: 21, hourLabel: "9 PM", value: 9, color: "low", topPromo: "Late Night" },
  { day: "Tue", hour: 22, hourLabel: "10 PM", value: 5, color: "low", topPromo: "Late Night" },
  { day: "Tue", hour: 23, hourLabel: "11 PM", value: 2, color: "low", topPromo: "Late Night" },
  // Wednesday
  { day: "Wed", hour: 11, hourLabel: "11 AM", value: 7, color: "low", topPromo: "Student Discount" },
  { day: "Wed", hour: 12, hourLabel: "12 PM", value: 15, color: "medium", topPromo: "Lunch Special" },
  { day: "Wed", hour: 13, hourLabel: "1 PM", value: 28, color: "medium", topPromo: "Lunch Special" },
  { day: "Wed", hour: 14, hourLabel: "2 PM", value: 8, color: "low", topPromo: "Student Discount" },
  { day: "Wed", hour: 15, hourLabel: "3 PM", value: 5, color: "low", topPromo: "Student Discount" },
  { day: "Wed", hour: 16, hourLabel: "4 PM", value: 3, color: "low", topPromo: "Happy Hour" },
  { day: "Wed", hour: 17, hourLabel: "5 PM", value: 48, color: "high", topPromo: "Happy Hour 20%" },
  { day: "Wed", hour: 18, hourLabel: "6 PM", value: 72, color: "very-high", topPromo: "Happy Hour 20%" },
  { day: "Wed", hour: 19, hourLabel: "7 PM", value: 25, color: "medium", topPromo: "Dinner Special" },
  { day: "Wed", hour: 20, hourLabel: "8 PM", value: 19, color: "medium", topPromo: "Late Night" },
  { day: "Wed", hour: 21, hourLabel: "9 PM", value: 11, color: "medium", topPromo: "Late Night" },
  { day: "Wed", hour: 22, hourLabel: "10 PM", value: 6, color: "low", topPromo: "Late Night" },
  { day: "Wed", hour: 23, hourLabel: "11 PM", value: 3, color: "low", topPromo: "Late Night" },
  // Thursday
  { day: "Thu", hour: 11, hourLabel: "11 AM", value: 8, color: "low", topPromo: "Student Discount" },
  { day: "Thu", hour: 12, hourLabel: "12 PM", value: 18, color: "medium", topPromo: "Lunch Special" },
  { day: "Thu", hour: 13, hourLabel: "1 PM", value: 22, color: "medium", topPromo: "Lunch Special" },
  { day: "Thu", hour: 14, hourLabel: "2 PM", value: 9, color: "low", topPromo: "Student Discount" },
  { day: "Thu", hour: 15, hourLabel: "3 PM", value: 6, color: "low", topPromo: "Student Discount" },
  { day: "Thu", hour: 16, hourLabel: "4 PM", value: 4, color: "low", topPromo: "Happy Hour" },
  { day: "Thu", hour: 17, hourLabel: "5 PM", value: 38, color: "high", topPromo: "Happy Hour 20%" },
  { day: "Thu", hour: 18, hourLabel: "6 PM", value: 55, color: "very-high", topPromo: "Happy Hour 20%" },
  { day: "Thu", hour: 19, hourLabel: "7 PM", value: 20, color: "medium", topPromo: "Dinner Special" },
  { day: "Thu", hour: 20, hourLabel: "8 PM", value: 16, color: "medium", topPromo: "Late Night" },
  { day: "Thu", hour: 21, hourLabel: "9 PM", value: 10, color: "low", topPromo: "Late Night" },
  { day: "Thu", hour: 22, hourLabel: "10 PM", value: 7, color: "low", topPromo: "Late Night" },
  { day: "Thu", hour: 23, hourLabel: "11 PM", value: 4, color: "low", topPromo: "Late Night" },
  // Friday
  { day: "Fri", hour: 11, hourLabel: "11 AM", value: 12, color: "medium", topPromo: "Student Discount" },
  { day: "Fri", hour: 12, hourLabel: "12 PM", value: 35, color: "high", topPromo: "Lunch Special" },
  { day: "Fri", hour: 13, hourLabel: "1 PM", value: 38, color: "high", topPromo: "Lunch Special" },
  { day: "Fri", hour: 14, hourLabel: "2 PM", value: 15, color: "medium", topPromo: "Lunch Special" },
  { day: "Fri", hour: 15, hourLabel: "3 PM", value: 8, color: "low", topPromo: "Student Discount" },
  { day: "Fri", hour: 16, hourLabel: "4 PM", value: 18, color: "medium", topPromo: "Happy Hour" },
  { day: "Fri", hour: 17, hourLabel: "5 PM", value: 78, color: "very-high", topPromo: "Happy Hour 20%" },
  { day: "Fri", hour: 18, hourLabel: "6 PM", value: 95, color: "very-high", topPromo: "Happy Hour 20%" },
  { day: "Fri", hour: 19, hourLabel: "7 PM", value: 52, color: "very-high", topPromo: "Dinner Special" },
  { day: "Fri", hour: 20, hourLabel: "8 PM", value: 41, color: "high", topPromo: "Late Night" },
  { day: "Fri", hour: 21, hourLabel: "9 PM", value: 32, color: "high", topPromo: "Late Night" },
  { day: "Fri", hour: 22, hourLabel: "10 PM", value: 24, color: "medium", topPromo: "Late Night" },
  { day: "Fri", hour: 23, hourLabel: "11 PM", value: 15, color: "medium", topPromo: "Late Night" },
  // Saturday
  { day: "Sat", hour: 11, hourLabel: "11 AM", value: 42, color: "high", topPromo: "Weekend Brunch" },
  { day: "Sat", hour: 12, hourLabel: "12 PM", value: 68, color: "very-high", topPromo: "Weekend Brunch" },
  { day: "Sat", hour: 13, hourLabel: "1 PM", value: 48, color: "high", topPromo: "Weekend Brunch" },
  { day: "Sat", hour: 14, hourLabel: "2 PM", value: 22, color: "medium", topPromo: "Weekend Brunch" },
  { day: "Sat", hour: 15, hourLabel: "3 PM", value: 12, color: "medium", topPromo: "Student Discount" },
  { day: "Sat", hour: 16, hourLabel: "4 PM", value: 8, color: "low", topPromo: "Happy Hour" },
  { day: "Sat", hour: 17, hourLabel: "5 PM", value: 85, color: "very-high", topPromo: "Happy Hour 20%" },
  { day: "Sat", hour: 18, hourLabel: "6 PM", value: 102, color: "very-high", topPromo: "Happy Hour 20%" },
  { day: "Sat", hour: 19, hourLabel: "7 PM", value: 58, color: "very-high", topPromo: "Dinner Special" },
  { day: "Sat", hour: 20, hourLabel: "8 PM", value: 45, color: "high", topPromo: "Late Night" },
  { day: "Sat", hour: 21, hourLabel: "9 PM", value: 38, color: "high", topPromo: "Late Night" },
  { day: "Sat", hour: 22, hourLabel: "10 PM", value: 28, color: "medium", topPromo: "Late Night" },
  { day: "Sat", hour: 23, hourLabel: "11 PM", value: 18, color: "medium", topPromo: "Late Night" },
  // Sunday
  { day: "Sun", hour: 11, hourLabel: "11 AM", value: 52, color: "very-high", topPromo: "Weekend Brunch" },
  { day: "Sun", hour: 12, hourLabel: "12 PM", value: 78, color: "very-high", topPromo: "Weekend Brunch" },
  { day: "Sun", hour: 13, hourLabel: "1 PM", value: 55, color: "very-high", topPromo: "Weekend Brunch" },
  { day: "Sun", hour: 14, hourLabel: "2 PM", value: 28, color: "medium", topPromo: "Weekend Brunch" },
  { day: "Sun", hour: 15, hourLabel: "3 PM", value: 15, color: "medium", topPromo: "Student Discount" },
  { day: "Sun", hour: 16, hourLabel: "4 PM", value: 9, color: "low", topPromo: "Happy Hour" },
  { day: "Sun", hour: 17, hourLabel: "5 PM", value: 62, color: "very-high", topPromo: "Happy Hour 20%" },
  { day: "Sun", hour: 18, hourLabel: "6 PM", value: 75, color: "very-high", topPromo: "Happy Hour 20%" },
  { day: "Sun", hour: 19, hourLabel: "7 PM", value: 38, color: "high", topPromo: "Dinner Special" },
  { day: "Sun", hour: 20, hourLabel: "8 PM", value: 28, color: "medium", topPromo: "Late Night" },
  { day: "Sun", hour: 21, hourLabel: "9 PM", value: 18, color: "medium", topPromo: "Late Night" },
  { day: "Sun", hour: 22, hourLabel: "10 PM", value: 12, color: "medium", topPromo: "Late Night" },
  { day: "Sun", hour: 23, hourLabel: "11 PM", value: 8, color: "low", topPromo: "Late Night" }
];

// Promotion Type Distribution
export const promotionTypeData = [
  { 
    type: "Percentage Discount", 
    count: 18, 
    percentage: 38.3,
    revenue: 3420,
    avgRedemptionRate: 44.2
  },
  { 
    type: "Fixed Discount", 
    count: 12, 
    percentage: 25.5,
    revenue: 2180,
    avgRedemptionRate: 38.7
  },
  { 
    type: "BOGO", 
    count: 8, 
    percentage: 17.0,
    revenue: 1840,
    avgRedemptionRate: 52.3
  },
  { 
    type: "Happy Hour", 
    count: 9, 
    percentage: 19.2,
    revenue: 1010,
    avgRedemptionRate: 41.8
  }
];

// Top Performing Items
export const topPerformingItems = [
  { 
    id: "item_001",
    name: "Pilsner Draft", 
    revenueLift: 640,
    redemptions: 128,
    category: "Beverages",
    promotions: ["Happy Hour 20%", "Student Discount 10%"],
    avgOrderValue: 5.00
  },
  { 
    id: "item_002",
    name: "IPA Draft", 
    revenueLift: 445,
    redemptions: 89,
    category: "Beverages",
    promotions: ["Happy Hour 20%"],
    avgOrderValue: 5.00
  },
  { 
    id: "item_003",
    name: "Margherita Pizza", 
    revenueLift: 380,
    redemptions: 23,
    category: "Food",
    promotions: ["BOGO Pizza Tuesdays"],
    avgOrderValue: 16.50
  },
  { 
    id: "item_004",
    name: "Wheat Beer", 
    revenueLift: 205,
    redemptions: 41,
    category: "Beverages",
    promotions: ["Happy Hour 20%", "Weekend Brunch 15%"],
    avgOrderValue: 5.00
  },
  { 
    id: "item_005",
    name: "Caesar Salad", 
    revenueLift: 180,
    redemptions: 18,
    category: "Food",
    promotions: ["Lunch Special €5 Off"],
    avgOrderValue: 10.00
  },
  { 
    id: "item_006",
    name: "Lager Draft", 
    revenueLift: 120,
    redemptions: 24,
    category: "Beverages",
    promotions: ["Happy Hour 20%"],
    avgOrderValue: 5.00
  },
  { 
    id: "item_007",
    name: "House Wine", 
    revenueLift: 95,
    redemptions: 13,
    category: "Beverages",
    promotions: ["Weekend Brunch 15%"],
    avgOrderValue: 7.30
  },
  { 
    id: "item_008",
    name: "Burger Combo", 
    revenueLift: 85,
    redemptions: 7,
    category: "Food",
    promotions: ["Lunch Special €5 Off"],
    avgOrderValue: 12.15
  },
  { 
    id: "item_009",
    name: "Tiramisu", 
    revenueLift: 60,
    redemptions: 8,
    category: "Desserts",
    promotions: ["Weekend Brunch 15%"],
    avgOrderValue: 7.50
  },
  { 
    id: "item_010",
    name: "Espresso", 
    revenueLift: 45,
    redemptions: 18,
    category: "Beverages",
    promotions: ["Weekend Brunch 15%"],
    avgOrderValue: 2.50
  }
];

// Performance Scores
export const performanceScores = [
  {
    promotionId: "promo_001",
    promotionName: "Happy Hour 20% Draft Beers",
    score: 92,
    rating: 5,
    ratingLabel: "Excellent",
    ratingColor: "success",
    metrics: {
      redemptionRate: { score: 28, max: 30, value: 46.8 },
      revenueLift: { score: 24, max: 25, value: 1240.50 },
      roi: { score: 19, max: 20, value: 3.8 },
      customerAcquisition: { score: 13, max: 15, value: 45 },
      efficiency: { score: 8, max: 10, value: 82 }
    },
    trend: "up" as const,
    trendPercent: 5.2,
    customerSatisfaction: 4.8
  },
  {
    promotionId: "promo_003",
    promotionName: "BOGO Pizza Tuesdays",
    score: 85,
    rating: 4,
    ratingLabel: "Very Good",
    ratingColor: "info",
    metrics: {
      redemptionRate: { score: 26, max: 30, value: 45.6 },
      revenueLift: { score: 22, max: 25, value: 2340.00 },
      roi: { score: 16, max: 20, value: 3.2 },
      customerAcquisition: { score: 12, max: 15, value: 89 },
      efficiency: { score: 9, max: 10, value: 88 }
    },
    trend: "up" as const,
    trendPercent: 2.8,
    customerSatisfaction: 4.6
  },
  {
    promotionId: "promo_006",
    promotionName: "Student Discount 10%",
    score: 78,
    rating: 3,
    ratingLabel: "Good",
    ratingColor: "warning",
    metrics: {
      redemptionRate: { score: 21, max: 30, value: 23.5 },
      revenueLift: { score: 23, max: 25, value: 8900.00 },
      roi: { score: 15, max: 20, value: 2.9 },
      customerAcquisition: { score: 14, max: 15, value: 450 },
      efficiency: { score: 5, max: 10, value: 52 }
    },
    trend: "stable" as const,
    trendPercent: 0.5,
    customerSatisfaction: 4.3
  },
  {
    promotionId: "promo_005",
    promotionName: "Weekend Brunch 15%",
    score: 81,
    rating: 4,
    ratingLabel: "Very Good",
    ratingColor: "info",
    metrics: {
      redemptionRate: { score: 24, max: 30, value: 38.2 },
      revenueLift: { score: 21, max: 25, value: 1850.00 },
      roi: { score: 17, max: 20, value: 3.4 },
      customerAcquisition: { score: 12, max: 15, value: 67 },
      efficiency: { score: 7, max: 10, value: 74 }
    },
    trend: "up" as const,
    trendPercent: 3.1,
    customerSatisfaction: 4.7
  }
];

// AI Insights
export const aiInsights = [
  {
    id: "insight_001",
    type: "top" as const,
    variant: "success" as const,
    icon: "Sparkles" as const,
    title: "Top Insight",
    message: '"Happy Hour 20%" is your best performing promotion. Revenue lift 12.3% higher than average. Consider extending to weekends for additional €850/week.',
    confidence: 92,
    actions: [
      { label: "Extend Promotion", variant: "default" as const, action: "extend" },
      { label: "View Details", variant: "outline" as const, action: "view" }
    ],
    dismissable: false
  },
  {
    id: "insight_002",
    type: "warning" as const,
    variant: "destructive" as const,
    icon: "AlertTriangle" as const,
    title: "Cannibalization Alert",
    message: '"Lunch Special" may be reducing regular lunch sales by 8%. Total lunch revenue unchanged despite promotion. Consider narrowing target audience or adjusting discount amount.',
    confidence: 78,
    actions: [
      { label: "Review Strategy", variant: "default" as const, action: "review" },
      { label: "Dismiss", variant: "ghost" as const, action: "dismiss" }
    ],
    dismissable: true
  },
  {
    id: "insight_003",
    type: "prediction" as const,
    variant: "default" as const,
    icon: "TrendingUp" as const,
    title: "Prediction",
    message: 'Extending "Weekend Brunch" through November could yield an additional €2,300 in revenue based on historical patterns and current redemption trends.',
    confidence: 85,
    actions: [
      { label: "Apply Recommendation", variant: "default" as const, action: "apply" },
      { label: "Learn More", variant: "outline" as const, action: "learn" }
    ],
    dismissable: true
  },
  {
    id: "insight_004",
    type: "opportunity" as const,
    variant: "secondary" as const,
    icon: "Lightbulb" as const,
    title: "Opportunity",
    message: 'Thursday evenings show 40% lower redemption rates than other weekdays. Consider creating a "Thirsty Thursday" promotion targeting 6-8 PM with appetizer bundles.',
    confidence: 71,
    actions: [
      { label: "Create Promotion", variant: "default" as const, action: "create" },
      { label: "See Analysis", variant: "outline" as const, action: "analysis" }
    ],
    dismissable: true
  }
];
