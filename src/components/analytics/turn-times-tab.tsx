"use client"

import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Legend,
} from "recharts"
import { Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  turnTimeByParty, turnDistribution, turnTimeMeta,
  turnTimeByDay, turnTimeByZone, turnTimeTrend,
} from "@/lib/analytics-data"
import { Badge } from "@/components/ui/badge"

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-zinc-800/50 bg-zinc-900/80 p-4 backdrop-blur-sm", className)}>
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-zinc-400 uppercase">{title}</h3>
      {children}
    </div>
  )
}

const statusColors: Record<string, string> = {
  under: "border-emerald-500/40 text-emerald-400",
  on_target: "border-emerald-500/40 text-emerald-400",
  slight_over: "border-amber-500/40 text-amber-400",
  over: "border-amber-500/40 text-amber-400",
  significant_over: "border-rose-500/40 text-rose-400",
}
const statusLabels: Record<string, string> = {
  under: "Under target",
  on_target: "On target",
  slight_over: "Slightly over",
  over: "Over target",
  significant_over: "Significantly over",
}

export function TurnTimesTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* Target vs Actual table */}
      <ChartCard title="Actual vs Target Turn Times">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" aria-label="Turn times by party size compared to target">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="px-2 py-2 text-left font-medium">Party Size</th>
                <th className="px-2 py-2 text-center font-medium">Target</th>
                <th className="px-2 py-2 text-center font-medium">Actual Avg</th>
                <th className="px-2 py-2 text-center font-medium">Variance</th>
                <th className="px-2 py-2 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {turnTimeByParty.map((row) => (
                <tr key={row.size} className="border-b border-zinc-800/50">
                  <td className="px-2 py-2 font-medium text-zinc-300">{row.size}</td>
                  <td className="px-2 py-2 text-center font-mono text-zinc-400">{row.target} min</td>
                  <td className="px-2 py-2 text-center font-mono text-zinc-300">{row.actual} min</td>
                  <td className={cn("px-2 py-2 text-center font-mono", row.variance > 0 ? "text-rose-400" : "text-emerald-400")}>
                    {row.variance > 0 ? "+" : ""}{row.variance} min
                  </td>
                  <td className="px-2 py-2 text-center">
                    <Badge variant="outline" className={cn("text-[10px]", statusColors[row.status])}>
                      {statusLabels[row.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Distribution histogram */}
      <ChartCard title="Turn Time Distribution (Dinner, All Sizes)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={turnDistribution} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.4)" />
            <XAxis dataKey="range" tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis tick={{ fill: "#71717a", fontSize: 10 }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
                    <p className="text-xs text-zinc-400">{label} min</p>
                    <p className="text-xs text-cyan-400">{payload[0].value} seatings</p>
                  </div>
                )
              }}
            />
            <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-2 text-xs text-zinc-500">
          Median: <span className="text-cyan-400">{turnTimeMeta.median} min</span> &middot;
          Mean: <span className="text-zinc-300">{turnTimeMeta.mean} min</span> &middot;
          Std Dev: <span className="text-zinc-400">{turnTimeMeta.stdDev} min</span>
        </p>
      </ChartCard>

      {/* By day + by zone */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Turn Time by Day">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={turnTimeByDay} layout="vertical" margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.4)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#71717a", fontSize: 10 }} unit=" min" />
              <YAxis dataKey="day" type="category" tick={{ fill: "#71717a", fontSize: 11 }} width={36} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
                      <p className="text-xs text-zinc-400">{label}</p>
                      <p className="text-xs text-amber-400">{payload[0].value} min avg</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="avg" fill="#fbbf24" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-zinc-500">Fri/Sat +15 min vs weekdays</p>
        </ChartCard>

        <ChartCard title="Turn Time by Zone">
          <div className="space-y-3">
            {turnTimeByZone.map((z) => (
              <div key={z.zone}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300">{z.zone}</span>
                  <span className="font-mono text-zinc-400">{z.avg} min</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full rounded-full bg-amber-500/60" style={{ width: `${(z.avg / 120) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-0.5 text-xs text-zinc-500">
            <p>Patio fastest (casual dining)</p>
            <p>Private longest (events/groups)</p>
          </div>
        </ChartCard>
      </div>

      {/* 12-week trend */}
      <ChartCard title="Turn Time Trend (Last 12 Weeks)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={turnTimeTrend} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.4)" />
            <XAxis dataKey="week" tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis tick={{ fill: "#71717a", fontSize: 10 }} domain={[60, 100]} unit=" min" />
            <ReferenceLine y={82} stroke="#fbbf24" strokeDasharray="6 3" label={{ value: "Target: 82 min", fill: "#fbbf24", fontSize: 10, position: "right" }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
                    <p className="text-xs text-zinc-400">{label}</p>
                    <p className="text-xs text-amber-400">{payload[0].value} min avg</p>
                  </div>
                )
              }}
            />
            <Line type="monotone" dataKey="avg" stroke="#fbbf24" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-2 text-xs text-zinc-500">Trend: <span className="text-emerald-400">Improving</span> (avg -2 min/month)</p>
      </ChartCard>

      {/* Insight */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-sm">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-400">
          <Lightbulb className="h-4 w-4" />
          Insight
        </h3>
        <p className="text-xs leading-relaxed text-zinc-400">
          Large party (7+) turn times are 14 min over target. Consider pre-ordering for groups to reduce ordering time,
          assigning dedicated servers to 7+ tops, and setting realistic expectations in the booking widget (2h 15min for 7+).
        </p>
      </div>
    </div>
  )
}
