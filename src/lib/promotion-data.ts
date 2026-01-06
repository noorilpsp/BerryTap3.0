export interface PromotionKPI {
  id: string
  title: string
  icon: string
  value: number
  unit: "count" | "currency" | "percentage"
  currencySymbol?: string
  delta: number
  deltaPercent: number
  deltaType: "increase" | "decrease"
  comparisonPeriod: string
  sparkline: number[]
  sparklineLabels: string[]
  target: number
  progress: number
  warning?: string
  color: string
  statusColor: string
  ctaLabel: string
  ctaHref: string
}

export const promotionKPIs: PromotionKPI[] = [
  {
    id: "kpi_active",
    title: "Active Promotions",
    icon: "🎯",
    value: 12,
    unit: "count",
    delta: 3,
    deltaPercent: 33.3,
    deltaType: "increase",
    comparisonPeriod: "last week",
    sparkline: [8, 9, 10, 9, 11, 10, 12],
    sparklineLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    target: 15,
    progress: 80.0,
    color: "hsl(var(--chart-1))",
    statusColor: "hsl(var(--chart-2))",
    ctaLabel: "View All",
    ctaHref: "/dashboard/promotions?status=active",
  },
  {
    id: "kpi_revenue_lift",
    title: "Total Revenue Lift",
    icon: "💰",
    value: 8450,
    unit: "currency",
    currencySymbol: "€",
    delta: 950,
    deltaPercent: 12.5,
    deltaType: "increase",
    comparisonPeriod: "last month",
    sparkline: [6200, 6500, 7100, 7400, 7800, 8100, 8450],
    sparklineLabels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7"],
    target: 10000,
    progress: 84.5,
    color: "hsl(var(--chart-2))",
    statusColor: "hsl(var(--chart-2))",
    ctaLabel: "View Breakdown",
    ctaHref: "/dashboard/promotions/analytics",
  },
  {
    id: "kpi_redemption_rate",
    title: "Avg Redemption Rate",
    icon: "📊",
    value: 42.3,
    unit: "percentage",
    delta: -2.1,
    deltaPercent: -4.7,
    deltaType: "decrease",
    comparisonPeriod: "last week",
    sparkline: [45.2, 44.8, 43.5, 44.1, 43.2, 42.8, 42.3],
    sparklineLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    target: 45,
    progress: 94.0,
    warning: "Below target",
    color: "hsl(var(--chart-3))",
    statusColor: "hsl(var(--destructive))",
    ctaLabel: "Optimize",
    ctaHref: "/dashboard/promotions/optimize",
  },
  {
    id: "kpi_orders_affected",
    title: "Orders Affected",
    icon: "🛒",
    value: 1847,
    unit: "count",
    delta: 234,
    deltaPercent: 14.5,
    deltaType: "increase",
    comparisonPeriod: "last week",
    sparkline: [1420, 1510, 1580, 1650, 1720, 1790, 1847],
    sparklineLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    target: 2000,
    progress: 92.4,
    color: "hsl(var(--chart-1))",
    statusColor: "hsl(var(--chart-1))",
    ctaLabel: "View Details",
    ctaHref: "/dashboard/promotions/orders",
  },
  {
    id: "kpi_avg_discount",
    title: "Avg Discount Amount",
    icon: "💵",
    value: 4.58,
    unit: "currency",
    currencySymbol: "€",
    delta: 0.23,
    deltaPercent: 5.3,
    deltaType: "increase",
    comparisonPeriod: "last week",
    sparkline: [4.2, 4.35, 4.42, 4.48, 4.51, 4.55, 4.58],
    sparklineLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    target: 5.0,
    progress: 91.6,
    color: "hsl(var(--chart-3))",
    statusColor: "hsl(var(--chart-3))",
    ctaLabel: "View Range",
    ctaHref: "/dashboard/promotions/discounts",
  },
  {
    id: "kpi_roi",
    title: "Promotion ROI",
    icon: "📈",
    value: 3.2,
    unit: "count",
    delta: 0.4,
    deltaPercent: 14.3,
    deltaType: "increase",
    comparisonPeriod: "last month",
    sparkline: [2.8, 2.9, 3.0, 3.0, 3.1, 3.15, 3.2],
    sparklineLabels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    target: 4.0,
    progress: 80.0,
    color: "hsl(var(--chart-2))",
    statusColor: "hsl(var(--chart-2))",
    ctaLabel: "View Calculation",
    ctaHref: "/dashboard/promotions/roi",
  },
]
