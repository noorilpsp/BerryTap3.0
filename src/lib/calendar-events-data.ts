import { mockPromotions } from "./promotions-table-data"

export interface CalendarEvent {
  id: string
  promotionId: string
  title: string
  description: string
  start: string
  end: string
  recurring: boolean
  recurringRule?: string
  allDay: boolean
  color: string
  status: "active" | "scheduled" | "paused" | "expired"
  statusDot: string
  duration: string
  timeDisplay: string
  category: string
  redemptions: {
    current: number
    max: number
    percent: number
  }
  revenue: {
    lift: number
    liftPercent: number
  }
  draggable: boolean
  resizable: boolean
  conflicts: string[]
  quickActions: string[]
  startsIn?: {
    days: number
    text: string
  }
}

export interface Conflict {
  id: string
  type: "time_overlap" | "target_overlap" | "budget_warning"
  severity: "warning" | "error" | "info"
  date: string
  promotions: {
    id: string
    name: string
    time: string
  }[]
  overlapDetails: {
    actualOverlap: boolean
    sameDayWarning: boolean
    customerConfusionRisk: string
    recommendation: string
  }
  resolvedAt: string | null
  resolvedBy: string | null
}

// Convert promotions to calendar events
export const calendarEvents: CalendarEvent[] = mockPromotions.map((promo) => {
  const statusColors: Record<string, string> = {
    active: "hsl(var(--chart-1))",
    scheduled: "hsl(var(--chart-2))",
    paused: "hsl(var(--chart-3))",
    expired: "hsl(var(--chart-4))",
  }

  return {
    id: `event_${promo.id}`,
    promotionId: promo.id,
    title: promo.name,
    description: promo.description,
    start: `${promo.schedule.startDate}T${promo.schedule.startTime}:00`,
    end: `${promo.schedule.endDate}T${promo.schedule.endTime}:00`,
    recurring: promo.schedule.recurring,
    recurringRule: promo.schedule.recurring
      ? promo.schedule.recurringType === "daily"
        ? `FREQ=DAILY;UNTIL=${promo.schedule.endDate.replace(/-/g, "")}`
        : promo.schedule.recurringType === "weekly"
          ? `FREQ=WEEKLY;BYDAY=${promo.schedule.activeDays.map((d) => d.slice(0, 2).toUpperCase()).join(",")};UNTIL=${promo.schedule.endDate.replace(/-/g, "")}`
          : undefined
      : undefined,
    allDay: promo.schedule.startTime === "00:00" && promo.schedule.endTime === "23:59",
    color: statusColors[promo.status],
    status: promo.status,
    statusDot: promo.statusDot,
    duration: promo.schedule.displayDuration,
    timeDisplay: promo.schedule.displayTimeWindow || "All day",
    category: promo.target.categoryName || "All Orders",
    redemptions: {
      current: promo.limits.currentRedemptions,
      max: promo.limits.maxRedemptions,
      percent: promo.limits.redemptionPercent,
    },
    revenue: {
      lift: promo.performance.revenueLift,
      liftPercent: promo.performance.revenueLiftPercent,
    },
    draggable: promo.status !== "expired",
    resizable: promo.status === "scheduled",
    conflicts: [],
    quickActions: promo.status === "active" ? ["view", "edit", "pause"] : promo.status === "paused" ? ["view", "edit", "activate"] : ["view", "edit", "cancel"],
    startsIn:
      promo.status === "scheduled"
        ? {
            days: 3,
            text: "Starts in 3 days",
          }
        : undefined,
  }
})

// Mock conflicts
export const conflicts: Conflict[] = [
  {
    id: "conflict_001",
    type: "time_overlap",
    severity: "warning",
    date: "2024-11-25",
    promotions: [
      {
        id: "promo_001",
        name: "Happy Hour 20% Off Draft Beers",
        time: "5:00 PM - 7:00 PM",
      },
      {
        id: "promo_004",
        name: "Weekend Brunch 15% Off",
        time: "9:00 AM - 2:00 PM",
      },
    ],
    overlapDetails: {
      actualOverlap: false,
      sameDayWarning: true,
      customerConfusionRisk: "Low",
      recommendation: "No action needed - different time windows",
    },
    resolvedAt: null,
    resolvedBy: null,
  },
]

export type ViewType = "month" | "week" | "day" | "timeline"

export interface ViewConfig {
  name: string
  icon: string
  daysPerRow?: number
  weeksVisible?: number
  showWeekNumbers?: boolean
  eventHeight?: number
  maxEventsPerDay?: number
  showMoreIndicator?: boolean
  navigationStep: string
  daysVisible?: number
  hoursVisible?: number
  hourHeight?: number
  showAllDaySlot?: boolean
  showTimeLabels?: boolean
  showCurrentTimeLine?: boolean
  autoScrollToNow?: boolean
  orientation?: string
  zoomLevels?: string[]
  defaultZoom?: string
  showBaseline?: boolean
  showMilestones?: boolean
}

export const viewConfigs: Record<ViewType, ViewConfig> = {
  month: {
    name: "Month",
    icon: "Calendar",
    daysPerRow: 7,
    weeksVisible: 5,
    showWeekNumbers: false,
    eventHeight: 48,
    maxEventsPerDay: 3,
    showMoreIndicator: true,
    navigationStep: "1 month",
  },
  week: {
    name: "Week",
    icon: "CalendarDays",
    daysVisible: 7,
    hoursVisible: 24,
    hourHeight: 60,
    showAllDaySlot: true,
    showTimeLabels: true,
    navigationStep: "1 week",
  },
  day: {
    name: "Day",
    icon: "Clock",
    hoursVisible: 24,
    hourHeight: 80,
    showCurrentTimeLine: true,
    autoScrollToNow: true,
    navigationStep: "1 day",
  },
  timeline: {
    name: "Timeline",
    icon: "BarChart3",
    orientation: "horizontal",
    zoomLevels: ["day", "week", "month", "quarter"],
    defaultZoom: "month",
    showBaseline: true,
    showMilestones: true,
    navigationStep: "1 month",
  },
}
