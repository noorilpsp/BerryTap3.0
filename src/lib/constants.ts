export const STATUS_COLORS = {
  reserved: "bg-yellow-400 dark:bg-yellow-500",
  confirmed: "bg-blue-500 dark:bg-blue-400",
  arrived: "bg-orange-400 dark:bg-orange-300",
  seated: "bg-green-500 dark:bg-green-400",
  completed: "bg-gray-400 dark:bg-gray-300",
  cancelled: "bg-red-600 dark:bg-red-500",
  noShow: "bg-gray-700 dark:bg-gray-500",
  waitlist: "bg-purple-500 dark:bg-purple-400",
  grace: "bg-amber-400 dark:bg-amber-300",
  conflict: "bg-orange-500 dark:bg-orange-400",
  cleaning: "bg-gray-200 dark:bg-gray-600",
} as const

export const FEATURE_FLAGS = {
  dnd: false,
  heatmap: false,
  waitlist: false,
  exports: false,
  shortcuts: false,
  gestures: false,
  autostatus: false,
  conflicts: false,
  autoAssign: false,
  overbooking: false,
  thirdPartySync: false,
  splitView: true,
  sessionsWidget: true,
} as const

export const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export const GRIDLINE = "hsl(var(--gridline))"

export type StatusKey = keyof typeof STATUS_COLORS
export type FeatureFlagKey = keyof typeof FEATURE_FLAGS
