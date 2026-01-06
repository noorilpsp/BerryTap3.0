export interface Kpi {
  id: string
  icon: string
  title: string
  value: string
  numericValue: number
  unit: "time" | "ratio" | "count" | "percentage" | "rating"
  delta: number
  deltaLabel: string
  status: "improved" | "declined" | "stable"
  target: number
  targetLabel: string
  targetAchieved: boolean
  progressPercent: number
  sparkline: number[]
  sparklineLabel: string
  color: string
  comparisonValue: number
  insight: string
}

export interface TimeSeriesDataPoint {
  time: string
  hour: number
  minute?: number
  revenue: number
  orders: number
  avgCheck: number
  covers: number
  partial?: boolean
  channel?: {
    dineIn: number
    takeout: number
    delivery: number
  }
}

export interface MenuItem {
  rank: number
  itemId: string
  name: string
  category: string
  sold: number
  revenue: number
  avgPrice: number
  avgPrepTime: number
  avgPrepTimeLabel: string
  rating: number
  trend: "up" | "down" | "stable"
  trendValue: number
  profitMargin: number
}

export interface ServiceMetric {
  value: number
  label: string
  delta: number
  target: number
  targetLabel: string
  progress: number
  capacity?: number
  percent?: number
  status?: "normal" | "warning" | "critical"
  threshold?: {
    warning: number
    critical: number
  }
}

export interface OrderFunnelStage {
  count: number
  percent: number
  dropOff?: number
  reasons?: string[]
  timestamp?: string
}

export interface ServiceTimeBucket {
  bucket: string
  range: [number, number]
  count: number
  percent: number
  orders: any[]
  color: "green" | "yellow" | "orange" | "red"
  isMode?: boolean
  isOutlier?: boolean
}

export interface KitchenStaff {
  staffId: string
  name: string
  role: string
  avatar: string
  ordersCompleted: number
  avgPrepTime: number
  avgPrepTimeLabel: string
  prepTimeDelta: number
  onTimePercent: number
  rating: number
  badges: string[]
}

export interface StaffRadarMetric {
  metric: string
  Sarah: number
  Mike: number
  Emma: number
  David: number
  fullMark: number
}

export interface StaffOrdersComparison {
  name: string
  orders: number
  efficiency: number
  revenue: number
  tips: number
  color: string
}

export interface StaffPerformanceDetailed {
  staffId: string
  name: string
  role: string
  avatar: string
  ordersHandled: number
  ordersDelta: number
  revenue: number
  revenueDelta: number
  avgTicketTime: number
  avgTicketTimeLabel: string
  timeDelta: number
  customerRating: number
  ratingDelta: number
  tipsEarned: number
  tipsDelta: number
  hoursWorked: number
  ordersPerHour: number
  revenuePerHour: number
  efficiency: number
  efficiencyLabel: string
  performance: "excellent" | "good" | "needs-support"
  badges: string[]
  workloadPercent: number
  onTime: number
}

export interface WorkloadHourData {
  hour: string
  orders: number
  percent: number
  load: "none" | "light" | "medium" | "heavy"
}

export interface WorkloadHeatmap {
  staff: string
  hours: WorkloadHourData[]
  avgLoad: number
}

export interface CategoryRevenue {
  category: string
  revenue: number
  percent: number
  color: string
  items: number
  avgPrice: number
  totalOrders: number
}

export interface ProfitabilityMatrixItem {
  itemId: string
  name: string
  category: string
  volume: number
  volumePercent: number
  margin: number
  revenue: number
  quadrant: "star" | "cash_cow" | "question_mark" | "dog"
  color: string
}

export interface TrendingItem {
  itemId: string
  name: string
  category: string
  sold: number
  revenue: number
  margin: number
  marginLabel: string
  prepTime: number
  prepTimeLabel: string
  prepTimeStatus: "fast" | "normal" | "slow"
  trend: "up" | "stable" | "down"
  trendValue: number
  trendLabel: string
}

export interface KitchenMetrics {
  activeOrders: {
    count: number
    capacity: number
    percent: number
    status: "normal" | "warning" | "critical"
    statusColor: string
    thresholds: { warning: number; critical: number }
  }
  avgPrepTime: {
    value: number
    label: string
    delta: number
    target: number
    targetLabel: string
    progress: number
  }
  accuracyRate: {
    value: number
    label: string
    delta: number
    target: number
    targetLabel: string
    progress: number
  }
  delayedOrders: {
    count: number
    threshold: number
    percent: number
    status: "good" | "warning" | "critical"
    statusColor: string
    orderIds: string[]
  }
}

export interface KitchenStation {
  id: string
  name: string
  efficiency: number
  activeOrders: number
  capacity: number
  capacityPercent: number
  avgPrepTime: number
  avgPrepTimeLabel: string
  onTimePercent: number
  staff: string[]
  status: "excellent" | "good" | "bottleneck" | "critical"
  statusColor: string
  alert?: string
}

export interface LiveKitchenOrder {
  orderId: string
  items: string[]
  station: string
  assignedStaff: string
  elapsedTime: number
  elapsedTimeLabel: string
  targetTime: number
  targetTimeLabel: string
  estimatedReady: number
  estimatedReadyLabel: string
  status: "on_time" | "ready" | "warning" | "delayed"
  statusLabel: string
  statusColor: string
  progress: number
  alert?: boolean
}

export interface Alert {
  id: string
  severity: "high" | "medium" | "low"
  severityColor: string
  severityIcon: string
  type: string
  title: string
  message: string
  details: string
  timestamp: string
  age: string
  relatedEntity: { type: string; id: string }
  actions: { label: string; action: string; [key: string]: any }[]
}

export interface TopPerformer {
  rank: number
  staffId: string
  name: string
  role: string
  avatar: string
  metrics: string
  detailedMetrics: {
    orders?: number
    efficiency?: number
    tips?: number
    rating?: number
    hours?: number
    revenuePerHour?: number
    avgPrepTime?: string
    onTimePercent?: number
    ordersPerHour?: number
  }
  badges: string[]
  score: number
}

export interface NeedsAttention {
  id: string
  type: string
  category: string
  icon: string
  title: string
  severity: string
  metric: string
  details: any
  suggestedActions?: { action: string; impact: string; effort: string }[]
  rootCause?: string[]
  recommendations?: { action: string; priority: string }[]
  actions: { label: string; action: string; [key: string]: any }[]
}

export interface ShiftData {
  name: string
  startTime: string
  endTime: string
  duration?: number
  elapsed?: number
  elapsedLabel?: string
  remaining?: number
  remainingLabel?: string
  progress?: number
  ordersCompleted: number
  ordersTarget?: number
  ordersProgress?: number
  ordersPace?: string
  ordersProjection?: number
  ordersCompletionRate?: number
  revenue: number
  revenueTarget?: number
  revenueProgress?: number
  revenueProjection?: number
  revenueProjectionPercent?: number
  revenuePercent?: number
  revenueStatus?: string
  activeStaff?: number
  scheduledStaff?: number
  staffBreakdown?: {
    servers: number
    kitchen: number
    bar: number
  }
  upcomingBreaks?: { staffName: string; timeUntil: string }[]
  efficiency: number
  efficiencyTarget: number
  efficiencyDelta?: number
  efficiencyStatus?: string
  peakHour?: {
    time: string
    revenue: number
    orders: number
  }
  status?: string
}

export interface DailyGoal {
  id: string
  category: string
  icon: string
  metric: string
  current: number
  target: number
  unit: string
  progress: number
  status: string
  statusColor: string
  projection?: number
  projectionPercent?: number
  projectionLabel?: string
  timeRemaining?: string
  remaining?: number
  remainingLabel?: string
  message?: string
  additionalInfo?: any
  trend?: string
  trendValue?: number
  trendLabel?: string
  focusArea?: string
  leaders?: string
  paceData?: {
    currentPace: number
    requiredPace: number
    paceLabel: string
    paceStatus: string
  }
}

export interface ActivityFeedItem {
  id: string
  type: string
  icon: string
  iconColor: string
  message: string
  details: string
  timestamp: string
  age: string
  relatedEntity: { type: string; id: string; [key: string]: any }
  actions?: { label: string; action: string }[]
}

export interface SmartSuggestion {
  id: string
  type: string
  category: string
  priority: string
  priorityColor: string
  icon: string
  title: string
  analysis: string
  recommendation: string
  expectedImpact: {
    [key: string]: any
  }
  cost: number | string
  costLabel: string
  roi: number | string
  roiLabel: string
  confidence: number
  dataPoints: number
  actions: { label: string; action: string; [key: string]: any }[]
}

export interface DrillDownData {
  id: string
  type: "kpi" | "staff" | "menu_item" | "order" | "station"
  title: string
  subtitle?: string
  kpi?: Kpi
  staff?: StaffPerformanceDetailed
  menuItem?: MenuItem
  order?: any
  station?: KitchenStation
}
