"use client"

import { useEffect, useRef, useState } from "react"
import {
  Users,
  CalendarCheck,
  Armchair,
  Footprints,
  ListOrdered,
  UserX,
  Gauge,
  Clock3,
} from "lucide-react"

interface StatCardProps {
  label: string
  value: number
  valueSuffix?: string
  subtitle: string
  icon: React.ReactNode
  maxValue?: number
  showProgress?: boolean
  accentColor?: string
  pulse?: boolean
  danger?: boolean
  dangerPct?: string
  delay?: number
}

function AnimatedNumber({ target, delay = 0 }: { target: number; delay: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<number>(0)

  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 800
      const start = performance.now()

      function tick(now: number) {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
        const current = Math.round(eased * target)
        setCount(current)
        if (progress < 1) {
          ref.current = requestAnimationFrame(tick)
        }
      }

      ref.current = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(ref.current)
    }
  }, [target, delay])

  return <span className="tabular-nums">{count}</span>
}

function StatCard({
  label,
  value,
  valueSuffix,
  subtitle,
  icon,
  maxValue,
  showProgress,
  accentColor = "emerald",
  pulse,
  danger,
  dangerPct,
  delay = 0,
}: StatCardProps) {
  const progressPct = maxValue ? (value / maxValue) * 100 : 0
  const isHighCapacity = maxValue ? progressPct > 90 : false

  const accentColorMap: Record<string, string> = {
    emerald: "text-emerald-400",
    blue: "text-blue-400",
    amber: "text-amber-400",
    rose: "text-rose-400",
    violet: "text-violet-400",
    cyan: "text-cyan-400",
  }
  const iconColor = danger ? "text-rose-400" : accentColorMap[accentColor] ?? "text-emerald-400"

  const progressBgMap: Record<string, string> = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  }
  const progressColor = isHighCapacity ? "bg-rose-500" : progressBgMap[accentColor] ?? "bg-emerald-500"

  return (
    <div
      className={`glass-surface flex min-w-[140px] flex-1 flex-col gap-2 rounded-xl p-4 transition-all ${
        pulse ? "res-pulse-badge" : ""
      }`}
      role="group"
      aria-label={`${label}: ${value} ${subtitle}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-foreground">
          <AnimatedNumber target={value} delay={delay} />
        </span>
        {valueSuffix && (
          <span className="text-sm text-muted-foreground">{valueSuffix}</span>
        )}
        {maxValue && (
          <span className="text-sm text-muted-foreground">
            /{maxValue}
          </span>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {danger && dangerPct ? (
          <span className="font-medium text-rose-400">{dangerPct}%</span>
        ) : (
          subtitle
        )}
      </span>
      {showProgress && maxValue && (
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800"
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={maxValue}
          aria-label={`${label} progress`}
        >
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColor} ${
              isHighCapacity ? "res-pulse-bar" : ""
            }`}
            style={{ width: `${Math.min(progressPct, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}

interface HeroStatsProps {
  stats: {
    covers: { current: number; capacity: number }
    reserved: number
    seated: number
    walkIns: number
    waitlist: number
    noShows: number
    noShowPct: string
    capacityNow: { pct: number; occupied: number; total: number }
    upcoming2h: number
  }
}

export function HeroStats({ stats }: HeroStatsProps) {
  return (
    <section aria-label="Key metrics" className="px-4 lg:px-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <StatCard
          label="Covers"
          value={stats.covers.current}
          subtitle="tonight"
          icon={<Users className="h-4 w-4" />}
          maxValue={stats.covers.capacity}
          showProgress
          accentColor="emerald"
          delay={0}
        />
        <StatCard
          label="Reserved"
          value={stats.reserved}
          subtitle="tonight"
          icon={<CalendarCheck className="h-4 w-4" />}
          accentColor="blue"
          delay={80}
        />
        <StatCard
          label="Seated"
          value={stats.seated}
          subtitle="people"
          icon={<Armchair className="h-4 w-4" />}
          accentColor="cyan"
          delay={160}
        />
        <StatCard
          label="Walk-ins"
          value={stats.walkIns}
          subtitle="tonight"
          icon={<Footprints className="h-4 w-4" />}
          accentColor="amber"
          delay={240}
        />
        <StatCard
          label="Waitlist"
          value={stats.waitlist}
          subtitle="waiting"
          icon={<ListOrdered className="h-4 w-4" />}
          accentColor="violet"
          pulse={stats.waitlist > 0}
          delay={320}
        />
        <StatCard
          label="No-shows"
          value={stats.noShows}
          subtitle="tonight"
          icon={<UserX className="h-4 w-4" />}
          accentColor="rose"
          danger={parseFloat(stats.noShowPct) > 5}
          dangerPct={stats.noShowPct}
          delay={400}
        />
        <StatCard
          label="Capacity Now"
          value={stats.capacityNow.pct}
          valueSuffix="%"
          subtitle={`${stats.capacityNow.occupied}/${stats.capacityNow.total} seats`}
          icon={<Gauge className="h-4 w-4" />}
          accentColor="blue"
          delay={480}
        />
        <StatCard
          label="Upcoming 2h"
          value={stats.upcoming2h}
          subtitle="arrivals"
          icon={<Clock3 className="h-4 w-4" />}
          accentColor="amber"
          delay={560}
        />
      </div>
    </section>
  )
}
