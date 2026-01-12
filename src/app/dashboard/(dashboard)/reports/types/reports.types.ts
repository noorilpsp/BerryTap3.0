export interface ReportsData {
  kpis: KpiData
  revenueTimeseries: TimeSeriesData[]
  comparisonSeries?: TimeSeriesData[]
  ordersByChannel: ChannelData[]
  topItems: ItemData[]
  staffMetrics: StaffMetric[]
  orders: Order[]
  hourlyHeatmap?: HeatmapData
  alerts: Alert[]
  suggestions: Suggestion[]
  exportTemplates: ExportTemplate[]
  recentExports: Export[]
  savedViews: SavedView[]
}

export interface KpiData {
  revenue: KpiMetric
  netSales: KpiMetric
  orders: KpiMetric
  avgCheck: KpiMetric
  covers: KpiMetric
  tableTurnover: KpiMetric
  avgTicketTime: KpiMetric
  refunds?: KpiMetric
  reservationConversion?: KpiMetric
  onlineOrdersPercent?: KpiMetric
}

export interface KpiMetric {
  current: number
  previous: number
  delta: number
  deltaType: "increase" | "decrease" | "neutral"
  sparkline: number[]
  unit: "currency" | "count" | "percentage" | "ratio" | "minutes"
}

export interface TimeSeriesData {
  date: string
  revenue: number
  orders: number
  covers: number
  avgCheck: number
  dayOfWeek: string
  isWeekend: boolean
}

export interface ChannelData {
  channel: string
  label: string
  orders: number
  revenue: number
  percentage: number
  avgCheck: number
  color: string
}

export interface ItemData {
  itemId: string
  name: string
  category: string
  quantitySold: number
  revenue: number
  avgPrice: number
  costOfGoods: number
  profitMargin: number
  trend: "up" | "down" | "stable"
  trendValue: number
}

export interface StaffMetric {
  staffId: string
  name: string
  role: string
  avatar: string
  ordersHandled: number
  revenue: number
  avgTicketTime: number
  customerRating: number
  tipsEarned: number
  hoursWorked: number
  ordersPerHour: number
  revenuePerHour: number
  missedOrders: number
  voidedOrders: number
  performance: string
}

export interface Order {
  orderId: string
  orderNumber: number
  placedAt: string
  closedAt: string
  duration: number
  date: string
  time: string
  dayOfWeek: string
  table: string
  server: {
    id: string
    name: string
  }
  channel: string
  channelLabel: string
  status: string
  statusLabel: string
  subtotal: number
  tax: number
  tip: number
  total: number
  paymentMethod: string
  paymentMethodLabel: string
  guests: number
  items: OrderItem[]
  customerRating?: number
  notes?: string
  void: boolean
  refund: boolean
}

export interface OrderItem {
  itemId: string
  name: string
  quantity: number
  price: number
  total: number
}

export interface HeatmapData {
  hours: string[]
  days: string[]
  data: number[][]
  maxValue: number
}

export interface Alert {
  id: string
  type: "warning" | "error" | "info"
  severity: "low" | "medium" | "high"
  title: string
  message: string
  metric?: string
  currentValue?: number
  previousValue?: number
  threshold?: number
  timestamp: string
  action?: {
    label: string
    link: string
  }
}

export interface Suggestion {
  id: string
  type: string
  title: string
  description: string
  impact: "high" | "medium" | "low"
  effort: "high" | "medium" | "low"
}

export interface ExportTemplate {
  id: string
  name: string
  description: string
  icon: string
  format: string[]
  includes: string[]
  popular: boolean
}

export interface Export {
  id: string
  name: string
  template: string
  format: string
  size: string
  createdAt: string
  createdBy: string
  status: string
  downloadUrl: string
}

export interface SavedView {
  id: string
  name: string
  description: string
  filters: Partial<ReportsFilters>
  isPinned: boolean
  isDefault: boolean
  createdAt: string
  createdBy: string
}

export interface ReportsFilters {
  dateRange: { from: string; to: string }
  datePreset?: string
  locations?: string[]
  staff?: string[]
  channels?: string[]
  categories?: string[]
  tables?: string[]
  granularity?: "hourly" | "daily" | "weekly"
}

export interface DrilldownData {
  type: string
  metric: string
  title: string
  data: any
}
