// Mock data for datasets and templates

export interface DatasetField {
  key: string
  label: string
  type: string
  pii: boolean
  options?: string[]
}

export interface Dataset {
  id: string
  name: string
  icon: string
  description: string
  rowCount: number
  rowCountLabel: string
  enabled: boolean
  fields: DatasetField[]
  popularity: number
  lastExported: string | null
  category: string
  comingSoon?: boolean
}

export interface Template {
  templateId: string
  name: string
  icon: string
  dataset: string
  datasetLabel: string
  description: string
  format: string
  columnCount: number
  columns: string[]
  filters: Record<string, any>
  createdBy: {
    userId: string
    name: string
    avatar: string
  }
  createdAt: string
  lastUsed: string
  lastUsedLabel: string
  useCount: number
  shared: boolean
  favorite: boolean
  tags: string[]
  private?: boolean
  requiresPermission?: string
  containsPII?: boolean
}

export const availableDatasets: Dataset[] = [
  {
    id: "orders",
    name: "Orders",
    icon: "ShoppingCart",
    description: "Full order transactions with items, modifiers, payments",
    rowCount: 2847392,
    rowCountLabel: "2.8M",
    enabled: true,
    fields: [
      { key: "orderId", label: "Order ID", type: "string", pii: false },
      { key: "placedAt", label: "Placed At", type: "datetime", pii: false },
      { key: "closedAt", label: "Closed At", type: "datetime", pii: false },
      { key: "amount", label: "Amount", type: "currency", pii: false },
      { key: "tax", label: "Tax", type: "currency", pii: false },
      { key: "tip", label: "Tip", type: "currency", pii: false },
      { key: "total", label: "Total", type: "currency", pii: false },
      { key: "channel", label: "Channel", type: "enum", options: ["dine_in", "takeout", "delivery"], pii: false },
      { key: "table", label: "Table", type: "string", pii: false },
      { key: "serverId", label: "Server ID", type: "string", pii: false },
      { key: "serverName", label: "Server Name", type: "string", pii: true },
      { key: "items", label: "Items", type: "array", pii: false },
      { key: "status", label: "Status", type: "enum", options: ["pending", "preparing", "ready", "completed", "canceled"], pii: false },
      { key: "paymentMethod", label: "Payment Method", type: "enum", options: ["cash", "card", "mobile"], pii: false },
      { key: "locationId", label: "Location ID", type: "string", pii: false }
    ],
    popularity: 95,
    lastExported: "2024-11-15T14:20:00Z",
    category: "transactions"
  },
  {
    id: "staff_metrics",
    name: "Staff Metrics",
    icon: "Users",
    description: "Staff performance data including orders handled, fulfillment times",
    rowCount: 1247,
    rowCountLabel: "1,247",
    enabled: true,
    fields: [
      { key: "staffId", label: "Staff ID", type: "string", pii: false },
      { key: "name", label: "Name", type: "string", pii: true },
      { key: "email", label: "Email", type: "string", pii: true },
      { key: "role", label: "Role", type: "enum", options: ["server", "bartender", "host", "manager"], pii: false },
      { key: "shift", label: "Shift", type: "string", pii: false },
      { key: "ordersHandled", label: "Orders Handled", type: "number", pii: false },
      { key: "avgFulfillmentMin", label: "Avg Fulfillment (min)", type: "number", pii: false },
      { key: "missedOrders", label: "Missed Orders", type: "number", pii: false },
      { key: "totalTips", label: "Total Tips", type: "currency", pii: false },
      { key: "hoursWorked", label: "Hours Worked", type: "number", pii: false },
      { key: "periodStart", label: "Period Start", type: "datetime", pii: false },
      { key: "periodEnd", label: "Period End", type: "datetime", pii: false }
    ],
    popularity: 72,
    lastExported: "2024-11-14T09:15:00Z",
    category: "workforce"
  },
  {
    id: "menu_performance",
    name: "Menu Performance",
    icon: "UtensilsCrossed",
    description: "Top-selling items, revenue by category, dish analytics",
    rowCount: 3892,
    rowCountLabel: "3,892",
    enabled: true,
    fields: [
      { key: "itemId", label: "Item ID", type: "string", pii: false },
      { key: "name", label: "Name", type: "string", pii: false },
      { key: "category", label: "Category", type: "string", pii: false },
      { key: "sold", label: "Units Sold", type: "number", pii: false },
      { key: "revenue", label: "Revenue", type: "currency", pii: false },
      { key: "avgPrice", label: "Average Price", type: "currency", pii: false },
      { key: "cost", label: "Cost", type: "currency", pii: false },
      { key: "margin", label: "Margin %", type: "percentage", pii: false },
      { key: "rating", label: "Avg Rating", type: "number", pii: false },
      { key: "preparationTime", label: "Prep Time (min)", type: "number", pii: false }
    ],
    popularity: 83,
    lastExported: "2024-11-13T16:45:00Z",
    category: "menu"
  },
  {
    id: "reservations",
    name: "Reservations",
    icon: "Calendar",
    description: "Booking data with guest information, party size, status",
    rowCount: 8456,
    rowCountLabel: "8,456",
    enabled: true,
    fields: [
      { key: "reservationId", label: "Reservation ID", type: "string", pii: false },
      { key: "createdAt", label: "Created At", type: "datetime", pii: false },
      { key: "reservationDate", label: "Reservation Date", type: "datetime", pii: false },
      { key: "guestName", label: "Guest Name", type: "string", pii: true },
      { key: "guestPhone", label: "Guest Phone", type: "string", pii: true },
      { key: "guestEmail", label: "Guest Email", type: "string", pii: true },
      { key: "covers", label: "Party Size", type: "number", pii: false },
      { key: "status", label: "Status", type: "enum", options: ["confirmed", "seated", "completed", "no_show", "canceled"], pii: false },
      { key: "source", label: "Source", type: "enum", options: ["phone", "website", "walk_in", "third_party"], pii: false },
      { key: "table", label: "Table", type: "string", pii: false },
      { key: "specialRequests", label: "Special Requests", type: "text", pii: false }
    ],
    popularity: 65,
    lastExported: "2024-11-12T11:30:00Z",
    category: "reservations"
  },
  {
    id: "table_analytics",
    name: "Table Analytics",
    icon: "LayoutGrid",
    description: "Table occupancy, turnover times, utilization metrics",
    rowCount: 5234,
    rowCountLabel: "5,234",
    enabled: true,
    fields: [
      { key: "tableId", label: "Table ID", type: "string", pii: false },
      { key: "tableName", label: "Table Name", type: "string", pii: false },
      { key: "capacity", label: "Capacity", type: "number", pii: false },
      { key: "occupancyRate", label: "Occupancy Rate %", type: "percentage", pii: false },
      { key: "avgTurnoverMin", label: "Avg Turnover (min)", type: "number", pii: false },
      { key: "totalOrders", label: "Total Orders", type: "number", pii: false },
      { key: "totalRevenue", label: "Total Revenue", type: "currency", pii: false },
      { key: "zone", label: "Zone", type: "string", pii: false },
      { key: "periodStart", label: "Period Start", type: "datetime", pii: false },
      { key: "periodEnd", label: "Period End", type: "datetime", pii: false }
    ],
    popularity: 54,
    lastExported: "2024-11-10T14:00:00Z",
    category: "operations"
  },
  {
    id: "customer_insights",
    name: "Customer Insights",
    icon: "Users",
    description: "Customer profiles, visit history, spend patterns, segments",
    rowCount: 12847,
    rowCountLabel: "12.8K",
    enabled: true,
    fields: [
      { key: "customerId", label: "Customer ID", type: "string", pii: false },
      { key: "name", label: "Name", type: "string", pii: true },
      { key: "email", label: "Email", type: "string", pii: true },
      { key: "phone", label: "Phone", type: "string", pii: true },
      { key: "totalVisits", label: "Total Visits", type: "number", pii: false },
      { key: "totalSpend", label: "Total Spend", type: "currency", pii: false },
      { key: "avgOrderValue", label: "Avg Order Value", type: "currency", pii: false },
      { key: "lastVisit", label: "Last Visit", type: "datetime", pii: false },
      { key: "segment", label: "Segment", type: "enum", options: ["vip", "regular", "occasional", "new"], pii: false },
      { key: "tags", label: "Tags", type: "array", pii: false },
      { key: "joinedAt", label: "Joined At", type: "datetime", pii: false }
    ],
    popularity: 78,
    lastExported: "2024-11-11T10:20:00Z",
    category: "customers"
  },
  {
    id: "kpi_reports",
    name: "KPI Reports",
    icon: "TrendingUp",
    description: "Pre-aggregated business KPIs and performance metrics",
    rowCount: 456,
    rowCountLabel: "456",
    enabled: true,
    fields: [
      { key: "reportId", label: "Report ID", type: "string", pii: false },
      { key: "date", label: "Date", type: "date", pii: false },
      { key: "totalRevenue", label: "Total Revenue", type: "currency", pii: false },
      { key: "totalOrders", label: "Total Orders", type: "number", pii: false },
      { key: "avgCheck", label: "Average Check", type: "currency", pii: false },
      { key: "totalCovers", label: "Total Covers", type: "number", pii: false },
      { key: "laborCost", label: "Labor Cost", type: "currency", pii: false },
      { key: "foodCost", label: "Food Cost", type: "currency", pii: false },
      { key: "profitMargin", label: "Profit Margin %", type: "percentage", pii: false },
      { key: "location", label: "Location", type: "string", pii: false }
    ],
    popularity: 89,
    lastExported: "2024-11-15T08:00:00Z",
    category: "reports"
  },
  {
    id: "inventory",
    name: "Inventory",
    icon: "Package",
    description: "Stock levels, ingredients, vendors, reorder tracking (Phase 2)",
    rowCount: 0,
    rowCountLabel: "Coming Soon",
    enabled: false,
    fields: [],
    popularity: 0,
    lastExported: null,
    category: "inventory",
    comingSoon: true
  }
]

export const savedTemplates: Template[] = [
  {
    templateId: "tmpl_001",
    name: "Monthly Sales Report",
    icon: "Star",
    dataset: "orders",
    datasetLabel: "Orders",
    description: "Complete monthly sales breakdown with all order details for accounting",
    format: "csv",
    columnCount: 12,
    columns: ["orderId", "placedAt", "closedAt", "amount", "tax", "tip", "total", "channel", "serverId", "table", "status", "paymentMethod"],
    filters: {
      dateRange: "last_30_days",
      status: ["completed", "paid"],
      channel: ["dine_in", "takeout", "delivery"]
    },
    createdBy: {
      userId: "user_001",
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    createdAt: "2024-09-15T10:00:00Z",
    lastUsed: "2024-11-13T14:30:00Z",
    lastUsedLabel: "2 days ago",
    useCount: 47,
    shared: true,
    favorite: true,
    tags: ["accounting", "monthly", "sales"]
  },
  {
    templateId: "tmpl_002",
    name: "Staff Performance Summary",
    icon: "Users",
    dataset: "staff_metrics",
    datasetLabel: "Staff Metrics",
    description: "Weekly staff performance metrics for management review",
    format: "xlsx",
    columnCount: 8,
    columns: ["staffId", "name", "role", "ordersHandled", "avgFulfillmentMin", "totalTips", "hoursWorked", "shift"],
    filters: {
      dateRange: "last_7_days",
      role: ["server", "bartender"]
    },
    createdBy: {
      userId: "user_002",
      name: "Mike Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"
    },
    createdAt: "2024-08-20T09:15:00Z",
    lastUsed: "2024-11-08T11:45:00Z",
    lastUsedLabel: "1 week ago",
    useCount: 28,
    shared: true,
    favorite: false,
    tags: ["staff", "weekly", "performance"]
  },
  {
    templateId: "tmpl_003",
    name: "Weekly Revenue Breakdown",
    icon: "TrendingUp",
    dataset: "orders",
    datasetLabel: "Orders",
    description: "Revenue analysis by channel and time period",
    format: "csv",
    columnCount: 10,
    columns: ["orderId", "placedAt", "amount", "tax", "tip", "total", "channel", "table", "serverId", "status"],
    filters: {
      dateRange: "last_7_days",
      status: ["completed"]
    },
    createdBy: {
      userId: "user_001",
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    createdAt: "2024-10-05T15:20:00Z",
    lastUsed: "2024-11-14T09:00:00Z",
    lastUsedLabel: "Yesterday",
    useCount: 63,
    shared: true,
    favorite: true,
    tags: ["revenue", "weekly"]
  },
  {
    templateId: "tmpl_004",
    name: "Payroll Data",
    icon: "Lock",
    dataset: "staff_metrics",
    datasetLabel: "Staff Metrics",
    description: "Confidential payroll export with hours and tips (managers only)",
    format: "xlsx",
    columnCount: 15,
    columns: ["staffId", "name", "email", "role", "hoursWorked", "totalTips", "ordersHandled", "shift", "periodStart", "periodEnd"],
    filters: {
      dateRange: "custom"
    },
    createdBy: {
      userId: "user_003",
      name: "Emma Davis",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma"
    },
    createdAt: "2024-07-10T08:00:00Z",
    lastUsed: "2024-11-12T16:30:00Z",
    lastUsedLabel: "3 days ago",
    useCount: 12,
    shared: false,
    favorite: false,
    private: true,
    requiresPermission: "payroll:read",
    tags: ["payroll", "confidential", "hr"]
  },
  {
    templateId: "tmpl_005",
    name: "Top Menu Items",
    icon: "UtensilsCrossed",
    dataset: "menu_performance",
    datasetLabel: "Menu Performance",
    description: "Best-selling menu items for inventory planning",
    format: "csv",
    columnCount: 6,
    columns: ["itemId", "name", "category", "sold", "revenue", "avgPrice"],
    filters: {
      dateRange: "last_30_days",
      sold: { min: 10 }
    },
    createdBy: {
      userId: "user_004",
      name: "Alex Martinez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
    },
    createdAt: "2024-09-28T12:45:00Z",
    lastUsed: "2024-11-10T14:15:00Z",
    lastUsedLabel: "5 days ago",
    useCount: 34,
    shared: true,
    favorite: false,
    tags: ["menu", "inventory", "monthly"]
  },
  {
    templateId: "tmpl_006",
    name: "Customer VIP List",
    icon: "Star",
    dataset: "customer_insights",
    datasetLabel: "Customer Insights",
    description: "High-value customer export for marketing campaigns",
    format: "xlsx",
    columnCount: 9,
    columns: ["customerId", "name", "email", "phone", "totalVisits", "totalSpend", "avgOrderValue", "segment", "tags"],
    filters: {
      segment: ["vip", "regular"],
      totalSpend: { min: 1000 }
    },
    createdBy: {
      userId: "user_001",
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
    },
    createdAt: "2024-08-15T10:30:00Z",
    lastUsed: "2024-11-09T13:20:00Z",
    lastUsedLabel: "6 days ago",
    useCount: 19,
    shared: true,
    favorite: true,
    containsPII: true,
    tags: ["customers", "marketing", "vip"]
  },
  {
    templateId: "tmpl_007",
    name: "Daily Sales Summary",
    icon: "FileText",
    dataset: "kpi_reports",
    datasetLabel: "KPI Reports",
    description: "End-of-day KPI snapshot for daily reports",
    format: "csv",
    columnCount: 7,
    columns: ["date", "totalRevenue", "totalOrders", "avgCheck", "totalCovers", "profitMargin", "location"],
    filters: {
      dateRange: "today"
    },
    createdBy: {
      userId: "user_002",
      name: "Mike Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"
    },
    createdAt: "2024-10-20T17:00:00Z",
    lastUsed: "2024-11-15T16:00:00Z",
    lastUsedLabel: "2 hours ago",
    useCount: 89,
    shared: true,
    favorite: true,
    tags: ["daily", "kpi", "summary"]
  },
  {
    templateId: "tmpl_008",
    name: "Reservation Analytics",
    icon: "Calendar",
    dataset: "reservations",
    datasetLabel: "Reservations",
    description: "Reservation trends and no-show analysis",
    format: "xlsx",
    columnCount: 8,
    columns: ["reservationId", "reservationDate", "covers", "status", "source", "guestName", "specialRequests", "table"],
    filters: {
      dateRange: "last_30_days",
      status: ["confirmed", "seated", "completed", "no_show"]
    },
    createdBy: {
      userId: "user_004",
      name: "Alex Martinez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
    },
    createdAt: "2024-09-10T11:00:00Z",
    lastUsed: "2024-11-07T10:30:00Z",
    lastUsedLabel: "1 week ago",
    useCount: 25,
    shared: true,
    favorite: false,
    containsPII: true,
    tags: ["reservations", "analytics"]
  }
]


export interface FilterableField {
  key: string
  label: string
  type: "string" | "number" | "currency" | "enum" | "datetime"
  category: "financial" | "status" | "dates" | "location" | "pii"
  operators: string[]
  operatorLabels?: Record<string, string>
  inputType: "text" | "number" | "date" | "select" | "multiselect"
  options?: Array<{ value: string; label: string }>
  min?: number
  max?: number
  step?: number
  format?: string
  icon?: string
  pii?: boolean
  requiresPermission?: string
}

export interface ActiveFilter {
  filterId: string
  field: string
  fieldLabel: string
  operator: string
  operatorLabel: string
  value: any
  valueLabel: string
  type: string
}

export const filterableFields: FilterableField[] = [
  {
    key: "amount",
    label: "Amount",
    type: "currency",
    category: "financial",
    operators: ["=", "≠", ">", "≥", "<", "≤", "⊂"],
    operatorLabels: {
      "=": "Equals",
      "≠": "Not equals",
      ">": "Greater than",
      "≥": "Greater than or equal",
      "<": "Less than",
      "≤": "Less than or equal",
      "⊂": "Between"
    },
    inputType: "number",
    min: 0,
    max: 10000,
    step: 0.01,
    format: "currency",
    icon: "DollarSign"
  },
  {
    key: "tax",
    label: "Tax",
    type: "currency",
    category: "financial",
    operators: ["=", "≠", ">", "≥", "<", "≤", "⊂"],
    inputType: "number",
    min: 0,
    max: 1000,
    step: 0.01,
    format: "currency",
    icon: "DollarSign"
  },
  {
    key: "tip",
    label: "Tip",
    type: "currency",
    category: "financial",
    operators: ["=", "≠", ">", "≥", "<", "≤", "⊂"],
    inputType: "number",
    min: 0,
    max: 1000,
    step: 0.01,
    format: "currency",
    icon: "DollarSign"
  },
  {
    key: "total",
    label: "Total",
    type: "currency",
    category: "financial",
    operators: ["=", "≠", ">", "≥", "<", "≤", "⊂"],
    inputType: "number",
    min: 0,
    max: 10000,
    step: 0.01,
    format: "currency",
    icon: "DollarSign"
  },
  {
    key: "channel",
    label: "Channel",
    type: "enum",
    category: "status",
    operators: ["=", "≠"],
    operatorLabels: {
      "=": "Is (any of)",
      "≠": "Is not (any of)"
    },
    options: [
      { value: "dine_in", label: "Dine In" },
      { value: "takeout", label: "Takeout" },
      { value: "delivery", label: "Delivery" }
    ],
    inputType: "multiselect",
    icon: "ShoppingBag"
  },
  {
    key: "status",
    label: "Status",
    type: "enum",
    category: "status",
    operators: ["=", "≠"],
    operatorLabels: {
      "=": "Is (any of)",
      "≠": "Is not (any of)"
    },
    options: [
      { value: "pending", label: "Pending" },
      { value: "preparing", label: "Preparing" },
      { value: "ready", label: "Ready" },
      { value: "completed", label: "Completed" },
      { value: "canceled", label: "Canceled" }
    ],
    inputType: "multiselect",
    icon: "CheckCircle"
  },
  {
    key: "paymentMethod",
    label: "Payment Method",
    type: "enum",
    category: "status",
    operators: ["=", "≠"],
    options: [
      { value: "cash", label: "Cash" },
      { value: "card", label: "Card" },
      { value: "mobile", label: "Mobile Payment" }
    ],
    inputType: "multiselect",
    icon: "CreditCard"
  },
  {
    key: "placedAt",
    label: "Placed At",
    type: "datetime",
    category: "dates",
    operators: ["=", "≠", ">", "≥", "<", "≤", "⊂", "⊕"],
    operatorLabels: {
      "=": "On date",
      "≠": "Not on date",
      ">": "After",
      "≥": "On or after",
      "<": "Before",
      "≤": "On or before",
      "⊂": "Between",
      "⊕": "Relative (last N days)"
    },
    inputType: "date",
    icon: "Calendar"
  },
  {
    key: "closedAt",
    label: "Closed At",
    type: "datetime",
    category: "dates",
    operators: ["=", "≠", ">", "≥", "<", "≤", "⊂", "⊕"],
    inputType: "date",
    icon: "Calendar"
  },
  {
    key: "table",
    label: "Table",
    type: "string",
    category: "location",
    operators: ["=", "≠", "⊃", "⊅", "∅", "∃"],
    operatorLabels: {
      "=": "Equals",
      "≠": "Not equals",
      "⊃": "Contains",
      "⊅": "Does not contain",
      "∅": "Is empty",
      "∃": "Is not empty"
    },
    inputType: "text",
    icon: "LayoutGrid"
  },
  {
    key: "serverId",
    label: "Server ID",
    type: "string",
    category: "location",
    operators: ["=", "≠", "⊃", "⊅", "∅", "∃"],
    inputType: "text",
    icon: "User"
  },
  {
    key: "serverName",
    label: "Server Name",
    type: "string",
    category: "pii",
    operators: ["=", "≠", "⊃", "⊅"],
    inputType: "text",
    pii: true,
    requiresPermission: "pii:read",
    icon: "User"
  },
  {
    key: "locationId",
    label: "Location ID",
    type: "string",
    category: "location",
    operators: ["=", "≠"],
    inputType: "select",
    options: [
      { value: "LOC-001", label: "Main Street Location" },
      { value: "LOC-002", label: "Downtown Location" },
      { value: "LOC-003", label: "Airport Location" }
    ],
    icon: "MapPin"
  }
]

export interface ExportFormat {
  id: string
  label: string
  icon: string
  description: string
  fileExtension: string
  mimeType: string
  features: string[]
  limitations: string[]
  recommended: boolean
  available: boolean
  maxRows?: number
  avgSpeed: string
  speedLabel: string
  estimatedSize: (rows: number) => string
  phase: string
  requiresFeatureFlag?: string
  contactSupport?: boolean
}

export const exportFormats: ExportFormat[] = [
  {
    id: "csv",
    label: "CSV (Comma-Separated Values)",
    icon: "FileText",
    description: "Universal format, opens in Excel/Google Sheets",
    fileExtension: ".csv",
    mimeType: "text/csv",
    features: [
      "Fast export",
      "Small file size",
      "Universal compatibility"
    ],
    limitations: [],
    recommended: true,
    available: true,
    maxRows: 1000000,
    avgSpeed: "fast",
    speedLabel: "Fast (< 1 min for 10K rows)",
    estimatedSize: (rows) => `~${Math.round(rows * 0.5)}KB`,
    phase: "current"
  },
  {
    id: "xlsx",
    label: "XLSX (Excel Workbook)",
    icon: "FileSpreadsheet",
    description: "Native Excel format with formatting",
    fileExtension: ".xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    features: [
      "Preserves formatting",
      "Multiple sheets",
      "Formulas supported"
    ],
    limitations: [
      "Slower for large datasets (> 10,000 rows)"
    ],
    recommended: false,
    available: true,
    maxRows: 1048576,
    avgSpeed: "medium",
    speedLabel: "Medium (2-3 min for 10K rows)",
    estimatedSize: (rows) => `~${Math.round(rows * 1.2)}KB`,
    phase: "current"
  },
  {
    id: "pdf",
    label: "PDF (Portable Document Format)",
    icon: "FileType",
    description: "Professional reports with charts and formatting",
    fileExtension: ".pdf",
    mimeType: "application/pdf",
    features: [
      "Print-ready",
      "Visual reports",
      "Not editable"
    ],
    limitations: [
      "Limited to 1,000 rows per document",
      "Not suitable for data analysis"
    ],
    recommended: false,
    available: false,
    requiresFeatureFlag: "exportPdf",
    maxRows: 1000,
    avgSpeed: "slow",
    speedLabel: "Slow (5+ min for formatting)",
    estimatedSize: (rows) => `~${Math.round(rows * 3)}KB`,
    phase: "phase2",
    contactSupport: true
  }
]

export interface DestinationOption {
  id: string
  label: string
  icon: string
  description: string
  recommended: boolean
  available: boolean
  bestFor?: string
  maxRows?: number
  minRows?: number
  requiresInput: boolean
  inputType?: string
  inputPlaceholder?: string
  inputValidation?: string
  maxRecipients?: number
  estimatedWaitTime: string
  phase: string
  features: string[]
  autoSelected?: {
    condition: string
    message: string
  }
  requiresFeatureFlag?: string
  setupRequired?: boolean
  setupLink?: string
}

export const destinationOptions: DestinationOption[] = [
  {
    id: "download",
    label: "Download Now (Browser)",
    icon: "Download",
    description: "Immediate download to your device",
    recommended: true,
    available: true,
    bestFor: "Exports under 5,000 rows",
    maxRows: 5000,
    requiresInput: false,
    estimatedWaitTime: "Immediate",
    phase: "current",
    features: [
      "Instant download",
      "No server processing",
      "Works offline after download"
    ]
  },
  {
    id: "server_job",
    label: "Server Job (Background Processing)",
    icon: "Loader",
    description: "Processes in background, download when ready",
    recommended: false,
    available: true,
    bestFor: "Exports over 5,000 rows or complex processing",
    minRows: 5000,
    requiresInput: false,
    estimatedWaitTime: "2-10 minutes (depends on size)",
    phase: "current",
    features: [
      "Handles large datasets",
      "Email notification when complete",
      "Downloadable for 7 days",
      "Can cancel or retry"
    ],
    autoSelected: {
      condition: "rows > 5000",
      message: "Server job required for exports over 5,000 rows"
    }
  },
  {
    id: "email",
    label: "Email Delivery",
    icon: "Mail",
    description: "Send download link to email address",
    recommended: false,
    available: true,
    bestFor: "Sharing exports with team members",
    requiresInput: true,
    inputType: "email",
    inputPlaceholder: "sarah@berrytap.com; accounting@berrytap.com",
    inputValidation: "email",
    maxRecipients: 10,
    estimatedWaitTime: "Email arrives in 2-5 minutes",
    phase: "current",
    features: [
      "Share with multiple recipients",
      "Secure download links (expire in 7 days)",
      "Email includes export summary"
    ]
  },
  {
    id: "webhook",
    label: "Webhook / API Endpoint",
    icon: "Send",
    description: "POST export metadata to external URL",
    recommended: false,
    available: false,
    requiresFeatureFlag: "exportWebhooks",
    requiresInput: true,
    inputType: "url",
    inputPlaceholder: "https://api.yourapp.com/exports/receive",
    estimatedWaitTime: "Webhook fires immediately on completion",
    phase: "phase2",
    features: [
      "Integrate with external systems",
      "Automated workflows",
      "Supports authentication headers"
    ],
    setupRequired: true,
    setupLink: "/settings/integrations/webhooks"
  },
  {
    id: "cloud_storage",
    label: "Cloud Storage (S3/GCS)",
    icon: "Cloud",
    description: "Upload directly to your cloud storage bucket",
    recommended: false,
    available: false,
    requiresFeatureFlag: "exportCloudStorage",
    requiresInput: true,
    inputType: "select",
    inputPlaceholder: "Select configured bucket",
    estimatedWaitTime: "Uploads immediately on completion",
    phase: "phase2",
    features: [
      "Direct to cloud storage",
      "Long-term retention",
      "Integrates with data pipelines"
    ],
    setupRequired: true,
    setupLink: "/settings/integrations/cloud-storage"
  }
]
