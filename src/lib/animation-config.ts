// ── Animation Configuration ──────────────────────────────────────────────────
// Central config for all floor map zoom/transition animations.
// GPU-accelerated (transform + opacity only), respects prefers-reduced-motion.

export const EASING = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  snap: "cubic-bezier(0.25, 1, 0.5, 1)",
  urgent: "cubic-bezier(0.2, 0.8, 0.2, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const

export const ZOOM_LEVELS = {
  level1: { scale: 0.85, label: "Full restaurant" },
  level2: { scale: 1.8, label: "Zone view" },
  level3: { scale: 4.0, label: "Table detail" },
} as const

export const DURATIONS = {
  zoomIn: 400,
  zoomOut: 300,
  searchJump: 500,
  alertJump: 300,
  sectionPan: 400,
  gridToMap: 400,
  mapToDetail: 300,
  fade: 200,
  seatStagger: 50,
  seatFade: 150,
  statusPulse: 200,
  statusTransition: 300,
  inertia: 500,
} as const

// Device-specific duration multipliers
export function getDurationMultiplier(width: number): number {
  if (width < 640) return 0.5 // phone: 50% duration
  if (width < 1024) return 1.0 // tablet: full
  return 1.0 // desktop: full
}

export function getAnimatedDuration(
  base: number,
  width: number,
  prefersReducedMotion: boolean
): number {
  if (prefersReducedMotion) return 1 // instant
  return Math.round(base * getDurationMultiplier(width))
}

// ── Search / Alert Jump Highlight ────────────────────────────────────────────

export const HIGHLIGHT = {
  search: {
    cycles: 2,
    totalDuration: 2000,
    borderWidth: 4,
    color: "var(--ring)", // accent blue
  },
  alert: {
    cycles: 3,
    totalDuration: 2000,
    borderWidth: 6,
    color: "#ef4444", // red
  },
} as const

// ── Seat Reveal Timing ───────────────────────────────────────────────────────

export function getSeatRevealDelay(index: number): number {
  return 300 + index * DURATIONS.seatStagger
}

// ── Inertia / Momentum Physics ───────────────────────────────────────────────

export interface Velocity {
  x: number
  y: number
}

export function applyInertia(
  currentOffset: { x: number; y: number },
  velocity: Velocity,
  friction: number = 0.92,
  onUpdate: (offset: { x: number; y: number }) => void,
  onComplete: () => void
): () => void {
  let vx = velocity.x
  let vy = velocity.y
  let ox = currentOffset.x
  let oy = currentOffset.y
  let animId = 0

  function step() {
    vx *= friction
    vy *= friction
    ox += vx
    oy += vy

    if (Math.abs(vx) < 0.5 && Math.abs(vy) < 0.5) {
      onComplete()
      return
    }

    onUpdate({ x: ox, y: oy })
    animId = requestAnimationFrame(step)
  }

  animId = requestAnimationFrame(step)
  return () => cancelAnimationFrame(animId)
}

// ── Zoom-to-point Math ───────────────────────────────────────────────────────

export function zoomToPoint(
  currentScale: number,
  newScale: number,
  point: { x: number; y: number },
  currentOffset: { x: number; y: number },
  containerCenter: { x: number; y: number }
): { x: number; y: number } {
  // Calculate the world-space point under the cursor
  const worldX = (point.x - containerCenter.x - currentOffset.x) / currentScale
  const worldY = (point.y - containerCenter.y - currentOffset.y) / currentScale

  // New offset so that same world point stays under cursor
  const newX = point.x - containerCenter.x - worldX * newScale
  const newY = point.y - containerCenter.y - worldY * newScale

  return { x: newX, y: newY }
}

// ── Section Center Calculation ───────────────────────────────────────────────

export function getSectionCenter(
  sectionId: string,
  tables: Array<{ section: string; position: { x: number; y: number } }>
): { x: number; y: number } | null {
  const sectionTables = tables.filter((t) => t.section === sectionId)
  if (sectionTables.length === 0) return null

  const avgX =
    sectionTables.reduce((sum, t) => sum + t.position.x, 0) / sectionTables.length
  const avgY =
    sectionTables.reduce((sum, t) => sum + t.position.y, 0) / sectionTables.length

  return { x: avgX, y: avgY }
}

// ── Table Center for Jump ────────────────────────────────────────────────────

export function getTableCenter(
  tableId: string,
  tables: Array<{ id: string; position: { x: number; y: number } }>
): { x: number; y: number } | null {
  const table = tables.find((t) => t.id === tableId)
  if (!table) return null
  return { x: table.position.x + 20, y: table.position.y + 20 }
}
