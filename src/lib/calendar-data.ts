// ── Calendar View Mock Data ──────────────────────────────────────────────────
// Full January 2025 data for week/month calendar views

export type CalendarServicePeriod = "lunch" | "dinner"

export interface SpecialEvent {
  id: string
  name: string
  zone: string
  timeRange: string
  guestCount: number
  icon: string // text icon label
}

export interface ServiceData {
  covers: number
  reservationCount: number
  capacityPct: number
}

export interface CalendarDay {
  date: number // day of month
  dayOfWeek: number // 0=Mon, 1=Tue, ... 6=Sun
  isToday: boolean
  isPast: boolean
  lunch: ServiceData
  dinner: ServiceData
  totalCovers: number
  totalReservations: number
  events: SpecialEvent[]
}

export interface TimeSlotCapacity {
  time: string
  capacityPct: number
}

export interface DayDetailReservation {
  time: string
  guestName: string
  partySize: number
  table: string
  tags: string[]
}

export interface DayDetail {
  date: number
  dayName: string
  service: CalendarServicePeriod
  covers: number
  reservationCount: number
  capacityPct: number
  timeSlots: TimeSlotCapacity[]
  reservations: DayDetailReservation[]
  notes: string[]
}

// ── Constants ────────────────────────────────────────────────────────────────

const TOTAL_SEATS = 78
const TODAY = 17 // January 17

// ── Special Events ───────────────────────────────────────────────────────────

const specialEvents: Record<number, SpecialEvent[]> = {
  1: [
    {
      id: "e1",
      name: "New Year's Day Brunch",
      zone: "Patio blocked",
      timeRange: "10am-3pm",
      guestCount: 40,
      icon: "NYD",
    },
  ],
  4: [
    {
      id: "e2",
      name: "NYE Overflow Hours",
      zone: "All zones",
      timeRange: "Extended",
      guestCount: 30,
      icon: "NYE",
    },
  ],
  14: [
    {
      id: "e3",
      name: "Valentine's Preview",
      zone: "Private Room",
      timeRange: "7-10pm",
      guestCount: 8,
      icon: "VDay",
    },
  ],
  15: [
    {
      id: "e4",
      name: "Private Birthday",
      zone: "Private Room",
      timeRange: "6-9pm",
      guestCount: 12,
      icon: "Bday",
    },
  ],
  18: [
    {
      id: "e5",
      name: "Wine Tasting",
      zone: "Patio",
      timeRange: "4-7pm",
      guestCount: 20,
      icon: "Wine",
    },
  ],
  25: [
    {
      id: "e6",
      name: "Birthday Celebration",
      zone: "Private Room",
      timeRange: "7-10pm",
      guestCount: 16,
      icon: "Bday",
    },
  ],
  31: [
    {
      id: "e7",
      name: "Live Jazz Night",
      zone: "Main Dining",
      timeRange: "7-11pm",
      guestCount: 0,
      icon: "Jazz",
    },
  ],
}

// ── Seeded random ────────────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function randRange(rand: () => number, min: number, max: number): number {
  return Math.round(rand() * (max - min) + min)
}

// ── Generate January 2025 data ───────────────────────────────────────────────

function getDayOfWeek(date: number): number {
  // Jan 1, 2025 is Wednesday (dayOfWeek=2, 0-indexed Mon=0)
  return (date - 1 + 2) % 7
}

function generateServiceData(
  rand: () => number,
  dayOfWeek: number,
  service: "lunch" | "dinner"
): ServiceData {
  let covers: number

  // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  if (service === "lunch") {
    if (dayOfWeek >= 5) {
      // Weekend
      covers = randRange(rand, 55, 75)
    } else if (dayOfWeek <= 1) {
      // Mon-Tue (slow)
      covers = randRange(rand, 20, 35)
    } else if (dayOfWeek <= 3) {
      // Wed-Thu (moderate)
      covers = randRange(rand, 30, 55)
    } else {
      // Friday
      covers = randRange(rand, 45, 65)
    }
  } else {
    // dinner
    if (dayOfWeek === 5) {
      // Saturday
      covers = randRange(rand, 140, 250)
    } else if (dayOfWeek === 4) {
      // Friday
      covers = randRange(rand, 120, 190)
    } else if (dayOfWeek === 6) {
      // Sunday
      covers = randRange(rand, 90, 160)
    } else if (dayOfWeek <= 1) {
      // Mon-Tue (slow)
      covers = randRange(rand, 35, 55)
    } else if (dayOfWeek <= 3) {
      // Wed-Thu (moderate)
      covers = randRange(rand, 55, 80)
    } else {
      covers = randRange(rand, 40, 70)
    }
  }

  const capacityPct = Math.min(100, Math.round((covers / TOTAL_SEATS) * 100))
  const reservationCount = Math.max(
    2,
    Math.round(covers / (service === "lunch" ? 3.2 : 3.8) + rand() * 4)
  )

  return { covers, reservationCount, capacityPct }
}

export function generateJanuaryData(): CalendarDay[] {
  const rand = seededRandom(2025_01)
  const days: CalendarDay[] = []

  for (let date = 1; date <= 31; date++) {
    const dayOfWeek = getDayOfWeek(date)
    const lunch = generateServiceData(rand, dayOfWeek, "lunch")
    const dinner = generateServiceData(rand, dayOfWeek, "dinner")
    const events = specialEvents[date] ?? []

    days.push({
      date,
      dayOfWeek,
      isToday: date === TODAY,
      isPast: date < TODAY,
      lunch,
      dinner,
      totalCovers: lunch.covers + dinner.covers,
      totalReservations: lunch.reservationCount + dinner.reservationCount,
      events,
    })
  }

  return days
}

// ── Week helpers ─────────────────────────────────────────────────────────────

export function getWeekForDate(
  days: CalendarDay[],
  anchorDate: number
): CalendarDay[] {
  const anchor = days.find((d) => d.date === anchorDate)
  if (!anchor) return days.slice(0, 7)

  const startDate = anchorDate - anchor.dayOfWeek
  const week: CalendarDay[] = []

  for (let i = 0; i < 7; i++) {
    const d = startDate + i
    if (d >= 1 && d <= 31) {
      const found = days.find((day) => day.date === d)
      if (found) week.push(found)
    }
  }

  return week
}

// ── Detailed drill-down for Friday Jan 17 ────────────────────────────────────

const fridayDinnerReservations: DayDetailReservation[] = [
  { time: "17:30", guestName: "Hart", partySize: 2, table: "T1", tags: ["Anniversary"] },
  { time: "17:30", guestName: "Williams", partySize: 2, table: "T4", tags: [] },
  { time: "18:00", guestName: "Sharma", partySize: 2, table: "T3", tags: ["VIP", "Gluten-free"] },
  { time: "18:00", guestName: "Kim", partySize: 3, table: "T5", tags: ["First timer"] },
  { time: "18:00", guestName: "Jensen", partySize: 2, table: "T3", tags: [] },
  { time: "18:30", guestName: "Okonkwo", partySize: 4, table: "T8", tags: ["Birthday"] },
  { time: "18:30", guestName: "Rossi", partySize: 4, table: "T9", tags: ["VIP", "Shellfish"] },
  { time: "19:00", guestName: "Nguyen", partySize: 6, table: "T14", tags: ["Birthday", "Nut allergy"] },
  { time: "19:00", guestName: "Walsh", partySize: 2, table: "T2", tags: ["First timer"] },
  { time: "19:15", guestName: "Tanaka", partySize: 4, table: "T15", tags: ["VIP", "Business"] },
  { time: "19:30", guestName: "Chen", partySize: 4, table: "T12", tags: ["VIP", "Shellfish"] },
  { time: "19:30", guestName: "Webb", partySize: 2, table: "T5", tags: ["First timer"] },
  { time: "19:45", guestName: "Osei", partySize: 3, table: "T6", tags: [] },
  { time: "19:45", guestName: "Morrison", partySize: 4, table: "TBD", tags: ["High risk"] },
  { time: "20:00", guestName: "Reyes", partySize: 2, table: "T3", tags: ["Window"] },
  { time: "20:00", guestName: "Chen Wei", partySize: 8, table: "T16", tags: ["Wheelchair"] },
  { time: "20:15", guestName: "McAllister", partySize: 2, table: "T4", tags: ["First timer"] },
  { time: "20:30", guestName: "Patel", partySize: 6, table: "T14", tags: ["Birthday", "Dairy-free"] },
  { time: "21:00", guestName: "Davis", partySize: 4, table: "TBD", tags: [] },
  { time: "21:30", guestName: "Yamamoto", partySize: 2, table: "TBD", tags: ["First timer", "High risk"] },
]

const fridayDinnerTimeSlots: TimeSlotCapacity[] = [
  { time: "5:00", capacityPct: 15 },
  { time: "5:30", capacityPct: 22 },
  { time: "6:00", capacityPct: 45 },
  { time: "6:30", capacityPct: 72 },
  { time: "7:00", capacityPct: 95 },
  { time: "7:30", capacityPct: 100 },
  { time: "8:00", capacityPct: 98 },
  { time: "8:30", capacityPct: 88 },
  { time: "9:00", capacityPct: 65 },
  { time: "9:30", capacityPct: 40 },
]

const fridayLunchTimeSlots: TimeSlotCapacity[] = [
  { time: "11:00", capacityPct: 10 },
  { time: "11:30", capacityPct: 25 },
  { time: "12:00", capacityPct: 55 },
  { time: "12:30", capacityPct: 68 },
  { time: "1:00", capacityPct: 62 },
  { time: "1:30", capacityPct: 45 },
  { time: "2:00", capacityPct: 22 },
  { time: "2:30", capacityPct: 10 },
]

export function getDayDetail(
  day: CalendarDay,
  service: CalendarServicePeriod
): DayDetail {
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const serviceData = service === "lunch" ? day.lunch : day.dinner

  // For Friday Jan 17, return the full detailed data
  if (day.date === 17 && service === "dinner") {
    return {
      date: day.date,
      dayName: dayNames[day.dayOfWeek],
      service,
      covers: serviceData.covers,
      reservationCount: serviceData.reservationCount,
      capacityPct: serviceData.capacityPct,
      timeSlots: fridayDinnerTimeSlots,
      reservations: fridayDinnerReservations,
      notes: ["Large party at 7 -- prep extra dessert stations", "Check patio heaters before 5pm"],
    }
  }

  if (day.date === 17 && service === "lunch") {
    return {
      date: day.date,
      dayName: dayNames[day.dayOfWeek],
      service,
      covers: serviceData.covers,
      reservationCount: serviceData.reservationCount,
      capacityPct: serviceData.capacityPct,
      timeSlots: fridayLunchTimeSlots,
      reservations: fridayDinnerReservations.slice(0, 8).map((r) => ({
        ...r,
        time: `1${r.time.slice(1)}`,
      })),
      notes: [],
    }
  }

  // For all other days, generate plausible time slots
  const rand = seededRandom(day.date * 100 + (service === "lunch" ? 0 : 50))
  const isLunch = service === "lunch"
  const startHour = isLunch ? 11 : 17
  const endHour = isLunch ? 14 : 22

  const timeSlots: TimeSlotCapacity[] = []
  for (let h = startHour; h <= endHour; h++) {
    for (const m of [0, 30]) {
      if (h === endHour && m === 30) break
      const hour12 = h > 12 ? h - 12 : h
      const pct = Math.min(
        100,
        Math.round(
          serviceData.capacityPct * (0.3 + 0.7 * Math.sin(((h - startHour + m / 60) / (endHour - startHour)) * Math.PI)) +
            (rand() * 15 - 7)
        )
      )
      timeSlots.push({
        time: `${hour12}:${m === 0 ? "00" : "30"}`,
        capacityPct: Math.max(5, pct),
      })
    }
  }

  // Generate plausible reservation list
  const names = [
    "Smith", "Johnson", "Brown", "Garcia", "Miller", "Davis", "Wilson",
    "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "White", "Lee",
    "Harris", "Clark", "Lewis", "Robinson", "Walker", "Young",
  ]
  const reservationList: DayDetailReservation[] = []
  const numRes = Math.min(serviceData.reservationCount, 15)
  for (let i = 0; i < numRes; i++) {
    const slotIdx = Math.floor(rand() * timeSlots.length)
    const slot = timeSlots[slotIdx]
    reservationList.push({
      time: slot.time,
      guestName: names[Math.floor(rand() * names.length)],
      partySize: randRange(rand, 2, 6),
      table: `T${randRange(rand, 1, 22)}`,
      tags: rand() > 0.7 ? [rand() > 0.5 ? "VIP" : "Birthday"] : [],
    })
  }
  reservationList.sort((a, b) => {
    const parseT = (t: string) => {
      const [h, m] = t.split(":").map(Number)
      return h * 60 + m
    }
    return parseT(a.time) - parseT(b.time)
  })

  return {
    date: day.date,
    dayName: dayNames[day.dayOfWeek],
    service,
    covers: serviceData.covers,
    reservationCount: serviceData.reservationCount,
    capacityPct: serviceData.capacityPct,
    timeSlots,
    reservations: reservationList,
    notes: [],
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getCapacityColor(pct: number): string {
  if (pct < 60) return "emerald"
  if (pct < 85) return "amber"
  return "rose"
}

export function getCapacityBgClass(pct: number): string {
  if (pct < 60) return "bg-emerald-500"
  if (pct < 85) return "bg-amber-500"
  return "bg-rose-500"
}

export function getCapacityTextClass(pct: number): string {
  if (pct < 60) return "text-emerald-400"
  if (pct < 85) return "text-amber-400"
  return "text-rose-400"
}

export function getWarningIndicator(pct: number): string | null {
  if (pct >= 95) return "Full"
  if (pct >= 85) return "Peak"
  if (pct >= 80) return "Busy"
  return null
}

export function getWarningBadgeClass(pct: number): string {
  if (pct >= 95) return "bg-rose-500/20 text-rose-400 border-rose-500/30"
  if (pct >= 85) return "bg-amber-500/20 text-amber-400 border-amber-500/30"
  return "bg-amber-500/15 text-amber-400/80 border-amber-500/20"
}

export function getEventIcon(icon: string): string {
  const map: Record<string, string> = {
    NYD: "Brunch",
    NYE: "NYE",
    VDay: "VDay",
    Bday: "Bday",
    Wine: "Wine",
    Jazz: "Jazz",
  }
  return map[icon] ?? icon
}

export const DAY_LABELS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
export const MONTH_NAME = "January 2025"
