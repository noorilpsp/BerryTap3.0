// Minimal types for payment modal (counter POS)
// Extracted from table-merge-manager lib/table-data.ts

export type ItemStatus = "held" | "sent" | "cooking" | "ready" | "served" | "void"
export type WaveType = "drinks" | "food" | "dessert"

export interface OrderItem {
  id: string
  name: string
  variant?: string
  mods?: string[]
  price: number
  status: ItemStatus
  wave: WaveType
  waveNumber?: number
  eta?: number
  allergyAlert?: boolean
}

export interface Seat {
  number: number
  dietary: string[]
  notes: string[]
  items: OrderItem[]
}

export function formatCurrency(amount: number): string {
  return `€${amount.toFixed(2)}`
}
