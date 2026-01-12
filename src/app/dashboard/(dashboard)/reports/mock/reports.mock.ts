import type { ReportsData } from "../types/reports.types"

// Generate realistic revenue timeseries for 90 days
function generateRevenueTimeseries() {
  const data = []
  const startDate = new Date("2025-10-01")

  for (let i = 0; i < 43; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)

    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" })
    const isWeekend = dayOfWeek === "Saturday" || dayOfWeek === "Sunday"

    // Weekend revenue is 30-40% higher
    const baseRevenue = 1400
    const weekendBoost = isWeekend ? 1.35 : 1.0
    const randomVariation = 0.9 + Math.random() * 0.2
    const revenue = baseRevenue * weekendBoost * randomVariation

    data.push({
      date: date.toISOString().split("T")[0],
      revenue: Math.round(revenue * 100) / 100,
      orders: Math.round((revenue / 24.5) * (0.95 + Math.random() * 0.1)),
      covers: Math.round((revenue / 24.5) * 1.02 * (0.95 + Math.random() * 0.1)),
      avgCheck: 24.5 + Math.random() * 2 - 1,
      dayOfWeek,
      isWeekend,
    })
  }

  return data
}

export const mockReportsData: ReportsData = {
  kpis: {
    revenue: {
      current: 45234.5,
      previous: 40210.0,
      delta: 0.125,
      deltaType: "increase",
      sparkline: [1200, 1350, 1180, 1420, 1580, 1640, 1520],
      unit: "currency",
    },
    netSales: {
      current: 43890.25,
      previous: 39100.0,
      delta: 0.122,
      deltaType: "increase",
      sparkline: [1180, 1320, 1150, 1390, 1550, 1610, 1490],
      unit: "currency",
    },
    orders: {
      current: 1847,
      previous: 1705,
      delta: 0.083,
      deltaType: "increase",
      sparkline: [245, 258, 240, 268, 272, 280, 265],
      unit: "count",
    },
    avgCheck: {
      current: 24.5,
      previous: 25.02,
      delta: -0.021,
      deltaType: "decrease",
      sparkline: [25.2, 24.8, 24.5, 24.9, 24.3, 24.6, 24.5],
      unit: "currency",
    },
    covers: {
      current: 1892,
      previous: 1642,
      delta: 0.152,
      deltaType: "increase",
      sparkline: [250, 268, 245, 280, 285, 295, 270],
      unit: "count",
    },
    tableTurnover: {
      current: 2.3,
      previous: 2.42,
      delta: -0.05,
      deltaType: "decrease",
      sparkline: [2.4, 2.3, 2.2, 2.4, 2.3, 2.3, 2.3],
      unit: "ratio",
    },
    avgTicketTime: {
      current: 28,
      previous: 27.1,
      delta: 0.032,
      deltaType: "increase",
      sparkline: [27, 28, 29, 27, 28, 28, 28],
      unit: "minutes",
    },
  },
  revenueTimeseries: generateRevenueTimeseries(),
  ordersByChannel: [
    {
      channel: "dine_in",
      label: "Dine-in",
      orders: 1234,
      revenue: 30307.12,
      percentage: 67,
      avgCheck: 24.56,
      color: "#10b981",
    },
    {
      channel: "takeout",
      label: "Takeout",
      orders: 380,
      revenue: 9499.25,
      percentage: 21,
      avgCheck: 25.0,
      color: "#3b82f6",
    },
    {
      channel: "delivery",
      label: "Delivery",
      orders: 233,
      revenue: 5428.13,
      percentage: 12,
      avgCheck: 23.29,
      color: "#f59e0b",
    },
  ],
  topItems: [
    {
      itemId: "item_001",
      name: "Shawarma Plate",
      category: "Main Course",
      quantitySold: 220,
      revenue: 3300.0,
      avgPrice: 15.0,
      costOfGoods: 990.0,
      profitMargin: 0.7,
      trend: "up",
      trendValue: 0.15,
    },
    {
      itemId: "item_002",
      name: "Falafel Wrap",
      category: "Main Course",
      quantitySold: 180,
      revenue: 2700.0,
      avgPrice: 15.0,
      costOfGoods: 810.0,
      profitMargin: 0.7,
      trend: "up",
      trendValue: 0.08,
    },
    {
      itemId: "item_003",
      name: "Chicken Kebab",
      category: "Main Course",
      quantitySold: 150,
      revenue: 2400.0,
      avgPrice: 16.0,
      costOfGoods: 750.0,
      profitMargin: 0.69,
      trend: "stable",
      trendValue: 0.02,
    },
    {
      itemId: "item_004",
      name: "Mixed Grill",
      category: "Main Course",
      quantitySold: 105,
      revenue: 2100.0,
      avgPrice: 20.0,
      costOfGoods: 735.0,
      profitMargin: 0.65,
      trend: "up",
      trendValue: 0.12,
    },
    {
      itemId: "item_005",
      name: "Hummus Plate",
      category: "Appetizers",
      quantitySold: 200,
      revenue: 1800.0,
      avgPrice: 9.0,
      costOfGoods: 360.0,
      profitMargin: 0.8,
      trend: "stable",
      trendValue: 0.01,
    },
  ],
  staffMetrics: [],
  orders: Array.from({ length: 50 }, (_, i) => ({
    orderId: `ORD-${1234 + i}`,
    orderNumber: 1234 + i,
    placedAt: `2025-11-12T${String(12 + (i % 10)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}:00+01:00`,
    closedAt: `2025-11-12T${String(13 + (i % 10)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}:00+01:00`,
    duration: 30 + (i % 20),
    date: "2025-11-12",
    time: `${String(12 + (i % 10)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
    dayOfWeek: "Wednesday",
    table: `T-${String((i % 25) + 1).padStart(2, "0")}`,
    server: {
      id: `staff_${(i % 3) + 1}`,
      name: ["Sarah Johnson", "Mike Chen", "Emma Davis"][i % 3],
    },
    channel: ["dine_in", "takeout", "delivery"][i % 3],
    channelLabel: ["Dine-in", "Takeout", "Delivery"][i % 3],
    status: "completed",
    statusLabel: "Completed",
    subtotal: 35 + (i % 30),
    tax: 3 + (i % 3),
    tip: 5 + (i % 10),
    total: 43 + (i % 40),
    paymentMethod: "credit_card",
    paymentMethodLabel: "Credit Card",
    guests: (i % 4) + 1,
    items: [
      {
        itemId: "item_001",
        name: "Shawarma Plate",
        quantity: 1,
        price: 15.0,
        total: 15.0,
      },
    ],
    void: false,
    refund: false,
  })),
  alerts: [
    {
      id: "alert_001",
      type: "warning",
      severity: "medium",
      title: "Kitchen Prep Time Increased",
      message: "Average kitchen prep time is up 15% compared to last week",
      timestamp: "2025-11-12T18:00:00+01:00",
    },
    {
      id: "alert_002",
      type: "error",
      severity: "high",
      title: "Revenue Drop Detected",
      message: "Today's revenue is 18% lower than average Wednesday",
      timestamp: "2025-11-12T17:30:00+01:00",
    },
  ],
  suggestions: [
    {
      id: "sugg_001",
      type: "operational",
      title: "Peak Hour Optimization",
      description: "Your busiest time is 7-9pm. Consider adding 1 more server during this window.",
      impact: "high",
      effort: "medium",
    },
    {
      id: "sugg_002",
      type: "menu",
      title: "Promote Top Performer",
      description: "Shawarma Plate is your #1 seller. Feature it in daily specials.",
      impact: "medium",
      effort: "low",
    },
  ],
  exportTemplates: [
    {
      id: "template_001",
      name: "Daily Sales Report",
      description: "Revenue, orders, and top items",
      icon: "FileText",
      format: ["csv", "pdf"],
      includes: ["kpis", "topItems", "orders"],
      popular: true,
    },
    {
      id: "template_002",
      name: "Staff Performance",
      description: "Individual staff metrics",
      icon: "Users",
      format: ["csv", "pdf"],
      includes: ["staffMetrics"],
      popular: true,
    },
  ],
  recentExports: [
    {
      id: "export_001",
      name: "daily-sales-nov12.csv",
      template: "Daily Sales Report",
      format: "csv",
      size: "245 KB",
      createdAt: "2025-11-12T16:30:00+01:00",
      createdBy: "Manager",
      status: "completed",
      downloadUrl: "#",
    },
  ],
  savedViews: [
    {
      id: "view_001",
      name: "Weekend Performance",
      description: "Saturday & Sunday analysis",
      filters: {
        datePreset: "custom",
        channels: ["dine_in"],
      },
      isPinned: true,
      isDefault: false,
      createdAt: "2025-10-15T10:00:00+01:00",
      createdBy: "Manager",
    },
  ],
}
