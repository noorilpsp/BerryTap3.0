// ── Level 3 Close Zoom Types ─────────────────────────────────────────────────

export type TableShape = "rectangular" | "round" | "square" | "booth" | "bar"
export type SeatPosition =
  | "top-left" | "top-center" | "top-right"
  | "bottom-left" | "bottom-center" | "bottom-right"
  | "left" | "right" | "top" | "bottom"

export type DietaryFlag =
  | "nut_allergy" | "vegetarian" | "vegan"
  | "gluten_free" | "dairy_free" | "shellfish_allergy"

export type WaveType = "drinks" | "food" | "dessert"
export type WaveStatus = "served" | "ready" | "cooking" | "held" | "not_started"

export type AlertSeverity = "urgent" | "warning" | "info"
export type DetailAlertType = "food_ready" | "no_checkin" | "bill_requested"

export interface Seat {
  number: number
  position: SeatPosition
  occupied: boolean
  dietary: DietaryFlag[]
  notes: string[]
  itemCount: number
  orderTotal: number
  items?: SeatItem[]
  specialOccasion?: string
  isVip?: boolean
}

export interface SeatItem {
  name: string
  status: "ready" | "served" | "cooking" | "held"
  price: number
  allergyFlag?: boolean
}

export interface Wave {
  type: WaveType
  status: WaveStatus
  completedAt?: string
  readyAt?: string
}

export interface DetailAlert {
  type: DetailAlertType
  severity: AlertSeverity
  message: string
  items?: string[]
}

export interface TableNote {
  text: string
  icon: string
}

export interface TableDetailInfo {
  id: string
  number: number
  section: string
  sectionLabel: string
  shape: TableShape
  capacity: number
  status: string
  guests: number
  server: { id: string; name: string }
  seatedAt: string
  lastCheckIn: string
  notes: TableNote[]
  alerts: DetailAlert[]
  seats: Seat[]
  waves: Wave[]
  combinedWith?: string
}

// ── Dietary / Badge Config ───────────────────────────────────────────────────

export const dietaryConfig: Record<DietaryFlag, { icon: string; label: string; color: string }> = {
  nut_allergy:      { icon: "nut",    label: "Nut Allergy",       color: "text-amber-600 dark:text-amber-400" },
  vegetarian:       { icon: "leaf",   label: "Vegetarian",        color: "text-green-600 dark:text-green-400" },
  vegan:            { icon: "vegan",  label: "Vegan",             color: "text-emerald-600 dark:text-emerald-400" },
  gluten_free:      { icon: "wheat",  label: "Gluten-free",       color: "text-yellow-600 dark:text-yellow-400" },
  dairy_free:       { icon: "milk",   label: "Dairy-free",        color: "text-blue-600 dark:text-blue-400" },
  shellfish_allergy:{ icon: "shrimp", label: "Shellfish Allergy", color: "text-red-600 dark:text-red-400" },
}

export const waveConfig: Record<WaveType, { icon: string; label: string }> = {
  drinks:  { icon: "wine",       label: "Drinks" },
  food:    { icon: "utensils",   label: "Food" },
  dessert: { icon: "cake-slice", label: "Dessert" },
}

export const waveStatusConfig: Record<WaveStatus, { label: string; color: string; dotColor: string }> = {
  served:      { label: "Served",      color: "text-emerald-600 dark:text-emerald-400", dotColor: "bg-emerald-500" },
  ready:       { label: "Ready",       color: "text-red-600 dark:text-red-400",         dotColor: "bg-red-500" },
  cooking:     { label: "Cooking",     color: "text-amber-600 dark:text-amber-400",     dotColor: "bg-amber-500" },
  held:        { label: "Held",        color: "text-muted-foreground",                  dotColor: "bg-muted-foreground" },
  not_started: { label: "Not started", color: "text-muted-foreground/50",               dotColor: "bg-muted" },
}

// ── Seat Position Layouts ────────────────────────────────────────────────────

export const seatPositions: Record<TableShape, Record<number, SeatPosition[]>> = {
  rectangular: {
    2: ["left", "right"],
    4: ["top-left", "top-right", "bottom-left", "bottom-right"],
    6: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"],
  },
  round: {
    2: ["left", "right"],
    4: ["top", "right", "bottom", "left"],
    6: ["top", "top-right", "right", "bottom", "bottom-left", "left"],
  },
  square: {
    2: ["left", "right"],
    4: ["top-left", "top-right", "bottom-left", "bottom-right"],
  },
  booth: {
    3: ["top-left", "top-center", "top-right"],
    4: ["top-left", "top-center", "top-right", "bottom-center"],
    6: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"],
  },
  bar: {
    2: ["left", "right"],
    4: ["top-left", "top-center", "top-right", "bottom-center"],
    6: ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"],
  },
}

// ── Table Shape Dimensions ───────────────────────────────────────────────────

export const tableShapeLayouts: Record<TableShape, { width: number; height: number }> = {
  rectangular: { width: 200, height: 120 },
  round:       { width: 160, height: 160 },
  square:      { width: 140, height: 140 },
  booth:       { width: 220, height: 120 },
  bar:         { width: 260, height: 60 },
}

// ── Mock Data ────────────────────────────────────────────────────────────────

export function getTableDetailById(tableId: string): TableDetailInfo | null {
  return mockTableDetails[tableId] ?? null
}

const mockTableDetails: Record<string, TableDetailInfo> = {
  // T5 - Patio, urgent, food ready
  t5: {
    id: "t5",
    number: 5,
    section: "patio",
    sectionLabel: "Patio",
    shape: "rectangular",
    capacity: 4,
    status: "urgent",
    guests: 4,
    server: { id: "s1", name: "Sarah" },
    seatedAt: "2026-02-08T18:43:00Z",
    lastCheckIn: "2026-02-08T19:58:00Z",
    notes: [
      { text: "Birthday celebration - Seat 3 is birthday girl", icon: "cake" },
      { text: "Bring candle with dessert", icon: "note" },
    ],
    alerts: [
      {
        type: "food_ready",
        severity: "urgent",
        message: "3 items waiting for pickup",
        items: [
          "Caesar Salad (Seat 1)",
          "Pasta Carbonara (Seat 2) - ALLERGY",
          "Salmon (Seat 3)",
        ],
      },
    ],
    seats: [
      {
        number: 1,
        position: "bottom-left",
        occupied: true,
        dietary: [],
        notes: [],
        itemCount: 3,
        orderTotal: 47.50,
        items: [
          { name: "Caesar Salad", status: "ready", price: 14.50 },
          { name: "Glass of Pinot Grigio", status: "served", price: 12.00 },
          { name: "Bruschetta", status: "served", price: 11.00 },
        ],
      },
      {
        number: 2,
        position: "top-left",
        occupied: true,
        dietary: ["nut_allergy"],
        notes: ["Prefers window side"],
        itemCount: 3,
        orderTotal: 42.50,
        items: [
          { name: "Pasta Carbonara (-NO nuts)", status: "ready", price: 18.50, allergyFlag: true },
          { name: "Glass of Chianti", status: "served", price: 14.00 },
          { name: "Tiramisu", status: "held", price: 10.00 },
        ],
      },
      {
        number: 3,
        position: "top-right",
        occupied: true,
        dietary: [],
        notes: ["Birthday girl"],
        itemCount: 3,
        orderTotal: 38.00,
        specialOccasion: "birthday",
        items: [
          { name: "Salmon", status: "ready", price: 22.00 },
          { name: "Sparkling Water", status: "served", price: 6.00 },
          { name: "Birthday Cake Slice", status: "held", price: 10.00 },
        ],
      },
      {
        number: 4,
        position: "bottom-right",
        occupied: true,
        dietary: [],
        notes: [],
        itemCount: 2,
        orderTotal: 25.00,
        items: [
          { name: "Margherita Pizza", status: "cooking", price: 16.00 },
          { name: "Beer", status: "served", price: 9.00 },
        ],
      },
    ],
    waves: [
      { type: "drinks", status: "served", completedAt: "2026-02-08T18:48:00Z" },
      { type: "food", status: "ready", readyAt: "2026-02-08T20:12:00Z" },
      { type: "dessert", status: "held" },
    ],
  },

  // T12 - Bar, active, food stage
  t12: {
    id: "t12",
    number: 12,
    section: "bar",
    sectionLabel: "Bar Area",
    shape: "round",
    capacity: 4,
    status: "active",
    guests: 4,
    server: { id: "s1", name: "Sarah" },
    seatedAt: "2026-02-08T18:52:00Z",
    lastCheckIn: "2026-02-08T20:05:00Z",
    notes: [],
    alerts: [],
    seats: [
      {
        number: 1,
        position: "top",
        occupied: true,
        dietary: ["vegetarian"],
        notes: [],
        itemCount: 2,
        orderTotal: 28.00,
        items: [
          { name: "Veggie Burger", status: "cooking", price: 16.00 },
          { name: "Craft IPA", status: "served", price: 12.00 },
        ],
      },
      {
        number: 2,
        position: "right",
        occupied: true,
        dietary: [],
        notes: [],
        itemCount: 2,
        orderTotal: 32.00,
        items: [
          { name: "Fish & Chips", status: "cooking", price: 19.00 },
          { name: "Lager", status: "served", price: 8.00 },
        ],
      },
      {
        number: 3,
        position: "bottom",
        occupied: true,
        dietary: [],
        notes: [],
        itemCount: 1,
        orderTotal: 15.00,
        items: [
          { name: "Wings", status: "cooking", price: 15.00 },
        ],
      },
      {
        number: 4,
        position: "left",
        occupied: true,
        dietary: ["gluten_free"],
        notes: [],
        itemCount: 2,
        orderTotal: 24.00,
        items: [
          { name: "GF Pasta", status: "cooking", price: 17.00 },
          { name: "White Wine", status: "served", price: 11.00 },
        ],
      },
    ],
    waves: [
      { type: "drinks", status: "served", completedAt: "2026-02-08T18:58:00Z" },
      { type: "food", status: "cooking" },
      { type: "dessert", status: "not_started" },
    ],
  },

  // T13 - Bar, urgent, no check-in
  t13: {
    id: "t13",
    number: 13,
    section: "bar",
    sectionLabel: "Bar Area",
    shape: "square",
    capacity: 2,
    status: "urgent",
    guests: 2,
    server: { id: "s1", name: "Sarah" },
    seatedAt: "2026-02-08T18:30:00Z",
    lastCheckIn: "2026-02-08T19:48:00Z",
    notes: [
      { text: "Regulars - prefer the corner", icon: "note" },
    ],
    alerts: [
      {
        type: "no_checkin",
        severity: "warning",
        message: "Table hasn't been checked on recently",
      },
    ],
    seats: [
      {
        number: 1,
        position: "left",
        occupied: true,
        dietary: [],
        notes: [],
        itemCount: 3,
        orderTotal: 45.00,
        items: [
          { name: "Steak Frites", status: "served", price: 28.00 },
          { name: "Red Wine", status: "served", price: 14.00 },
          { name: "Creme Brulee", status: "not_started" as "held", price: 12.00 },
        ],
      },
      {
        number: 2,
        position: "right",
        occupied: true,
        dietary: ["dairy_free"],
        notes: [],
        itemCount: 2,
        orderTotal: 36.00,
        items: [
          { name: "Grilled Chicken", status: "served", price: 22.00 },
          { name: "Sparkling Water", status: "served", price: 6.00 },
        ],
      },
    ],
    waves: [
      { type: "drinks", status: "served", completedAt: "2026-02-08T18:35:00Z" },
      { type: "food", status: "served", completedAt: "2026-02-08T19:20:00Z" },
      { type: "dessert", status: "not_started" },
    ],
  },

  // T4 - Patio, active, drinks stage
  t4: {
    id: "t4",
    number: 4,
    section: "patio",
    sectionLabel: "Patio",
    shape: "rectangular",
    capacity: 4,
    status: "active",
    guests: 3,
    server: { id: "s1", name: "Sarah" },
    seatedAt: "2026-02-08T19:15:00Z",
    lastCheckIn: "2026-02-08T19:45:00Z",
    notes: [],
    alerts: [],
    seats: [
      {
        number: 1,
        position: "bottom-left",
        occupied: true,
        dietary: [],
        notes: [],
        itemCount: 1,
        orderTotal: 12.00,
        items: [
          { name: "Aperol Spritz", status: "served", price: 12.00 },
        ],
      },
      {
        number: 2,
        position: "top-left",
        occupied: true,
        dietary: [],
        notes: [],
        itemCount: 1,
        orderTotal: 9.00,
        items: [
          { name: "Beer", status: "served", price: 9.00 },
        ],
      },
      {
        number: 3,
        position: "top-right",
        occupied: true,
        dietary: ["vegan"],
        notes: [],
        itemCount: 1,
        orderTotal: 11.00,
        items: [
          { name: "Mojito (Virgin)", status: "served", price: 11.00 },
        ],
      },
      {
        number: 4,
        position: "bottom-right",
        occupied: false,
        dietary: [],
        notes: [],
        itemCount: 0,
        orderTotal: 0,
      },
    ],
    waves: [
      { type: "drinks", status: "served", completedAt: "2026-02-08T19:22:00Z" },
      { type: "food", status: "not_started" },
      { type: "dessert", status: "not_started" },
    ],
  },

  // T8 - Patio, active, dessert stage
  t8: {
    id: "t8",
    number: 8,
    section: "patio",
    sectionLabel: "Patio",
    shape: "booth",
    capacity: 4,
    status: "active",
    guests: 2,
    server: { id: "s1", name: "Sarah" },
    seatedAt: "2026-02-08T18:20:00Z",
    lastCheckIn: "2026-02-08T20:00:00Z",
    notes: [
      { text: "Anniversary dinner - comp dessert", icon: "note" },
    ],
    alerts: [],
    seats: [
      {
        number: 1,
        position: "top-left",
        occupied: true,
        dietary: [],
        notes: [],
        itemCount: 4,
        orderTotal: 62.00,
        isVip: true,
        items: [
          { name: "Lobster Risotto", status: "served", price: 32.00 },
          { name: "Champagne", status: "served", price: 18.00 },
          { name: "Chocolate Fondant", status: "cooking", price: 12.00 },
        ],
      },
      {
        number: 2,
        position: "top-right",
        occupied: true,
        dietary: [],
        notes: [],
        itemCount: 3,
        orderTotal: 55.00,
        isVip: true,
        items: [
          { name: "Filet Mignon", status: "served", price: 38.00 },
          { name: "Champagne", status: "served", price: 18.00 },
          { name: "Panna Cotta", status: "cooking", price: 10.00 },
        ],
      },
      {
        number: 3,
        position: "bottom-left",
        occupied: false,
        dietary: [],
        notes: [],
        itemCount: 0,
        orderTotal: 0,
      },
      {
        number: 4,
        position: "bottom-right",
        occupied: false,
        dietary: [],
        notes: [],
        itemCount: 0,
        orderTotal: 0,
      },
    ],
    waves: [
      { type: "drinks", status: "served", completedAt: "2026-02-08T18:28:00Z" },
      { type: "food", status: "served", completedAt: "2026-02-08T19:30:00Z" },
      { type: "dessert", status: "cooking" },
    ],
  },

  // T19 - Main Dining, billing
  t19: {
    id: "t19",
    number: 19,
    section: "main",
    sectionLabel: "Main Dining",
    shape: "rectangular",
    capacity: 6,
    status: "billing",
    guests: 4,
    server: { id: "s3", name: "Mike" },
    seatedAt: "2026-02-08T17:50:00Z",
    lastCheckIn: "2026-02-08T20:08:00Z",
    notes: [],
    alerts: [
      {
        type: "bill_requested",
        severity: "info",
        message: "Guests are ready to pay",
      },
    ],
    seats: [
      {
        number: 1,
        position: "top-left",
        occupied: true,
        dietary: [],
        notes: [],
        itemCount: 4,
        orderTotal: 58.00,
        items: [
          { name: "Soup of the Day", status: "served", price: 10.00 },
          { name: "Duck Confit", status: "served", price: 28.00 },
          { name: "Red Wine", status: "served", price: 14.00 },
          { name: "Espresso", status: "served", price: 6.00 },
        ],
      },
      {
        number: 2,
        position: "top-right",
        occupied: true,
        dietary: [],
        notes: [],
        itemCount: 3,
        orderTotal: 44.00,
        items: [
          { name: "Arugula Salad", status: "served", price: 12.00 },
          { name: "Seafood Pasta", status: "served", price: 24.00 },
          { name: "Prosecco", status: "served", price: 10.00 },
        ],
      },
      {
        number: 3,
        position: "bottom-left",
        occupied: true,
        dietary: [],
        notes: [],
        itemCount: 3,
        orderTotal: 48.00,
        items: [
          { name: "Bruschetta", status: "served", price: 11.00 },
          { name: "Lamb Chops", status: "served", price: 32.00 },
          { name: "Tiramisu", status: "served", price: 10.00 },
        ],
      },
      {
        number: 4,
        position: "bottom-right",
        occupied: true,
        dietary: [],
        notes: [],
        itemCount: 2,
        orderTotal: 30.00,
        items: [
          { name: "Chicken Parmigiana", status: "served", price: 20.00 },
          { name: "Lemonade", status: "served", price: 6.00 },
        ],
      },
    ],
    waves: [
      { type: "drinks", status: "served", completedAt: "2026-02-08T17:58:00Z" },
      { type: "food", status: "served", completedAt: "2026-02-08T18:45:00Z" },
      { type: "dessert", status: "served", completedAt: "2026-02-08T19:30:00Z" },
    ],
  },

  // T17 - Main Dining, urgent, food ready
  t17: {
    id: "t17",
    number: 17,
    section: "main",
    sectionLabel: "Main Dining",
    shape: "rectangular",
    capacity: 4,
    status: "urgent",
    guests: 3,
    server: { id: "s3", name: "Mike" },
    seatedAt: "2026-02-08T18:35:00Z",
    lastCheckIn: "2026-02-08T19:50:00Z",
    notes: [
      { text: "Guest at seat 1 is a food critic", icon: "note" },
    ],
    alerts: [
      {
        type: "food_ready",
        severity: "urgent",
        message: "2 items waiting for pickup",
        items: [
          "Truffle Risotto (Seat 1)",
          "Grilled Sea Bass (Seat 3)",
        ],
      },
    ],
    seats: [
      {
        number: 1,
        position: "top-left",
        occupied: true,
        dietary: [],
        notes: ["Food critic - extra attention"],
        itemCount: 3,
        orderTotal: 62.00,
        isVip: true,
        items: [
          { name: "Truffle Risotto", status: "ready", price: 28.00 },
          { name: "Barolo Wine", status: "served", price: 24.00 },
          { name: "Antipasti Board", status: "served", price: 18.00 },
        ],
      },
      {
        number: 2,
        position: "top-right",
        occupied: true,
        dietary: ["shellfish_allergy"],
        notes: [],
        itemCount: 2,
        orderTotal: 34.00,
        items: [
          { name: "Chicken Milanese", status: "cooking", price: 22.00, allergyFlag: false },
          { name: "Sparkling Water", status: "served", price: 6.00 },
        ],
      },
      {
        number: 3,
        position: "bottom-left",
        occupied: true,
        dietary: [],
        notes: [],
        itemCount: 2,
        orderTotal: 38.00,
        items: [
          { name: "Grilled Sea Bass", status: "ready", price: 26.00 },
          { name: "White Wine", status: "served", price: 12.00 },
        ],
      },
      {
        number: 4,
        position: "bottom-right",
        occupied: false,
        dietary: [],
        notes: [],
        itemCount: 0,
        orderTotal: 0,
      },
    ],
    waves: [
      { type: "drinks", status: "served", completedAt: "2026-02-08T18:42:00Z" },
      { type: "food", status: "ready", readyAt: "2026-02-08T20:10:00Z" },
      { type: "dessert", status: "not_started" },
    ],
  },
}

// Provide a fallback detail for any table that doesn't have specific mock data
export function getTableDetailFallback(tableId: string, number: number, section: string, sectionLabel: string, guests: number, status: string, seatedAt?: string): TableDetailInfo {
  const capacity = Math.max(guests, 2)
  const seats: Seat[] = Array.from({ length: capacity }, (_, i) => ({
    number: i + 1,
    position: (seatPositions.rectangular[capacity as keyof typeof seatPositions.rectangular] ?? ["left", "right"])[i] ?? "left" as SeatPosition,
    occupied: i < guests,
    dietary: [],
    notes: [],
    itemCount: 0,
    orderTotal: 0,
  }))

  return {
    id: tableId,
    number,
    section,
    sectionLabel,
    shape: "rectangular",
    capacity,
    status,
    guests,
    server: { id: "s1", name: "Sarah" },
    seatedAt: seatedAt ?? new Date().toISOString(),
    lastCheckIn: new Date().toISOString(),
    notes: [],
    alerts: [],
    seats,
    waves: [
      { type: "drinks", status: guests > 0 ? "served" : "not_started" },
      { type: "food", status: "not_started" },
      { type: "dessert", status: "not_started" },
    ],
  }
}
