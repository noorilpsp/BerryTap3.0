"use client"

import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from "recharts"
import { Lightbulb } from "lucide-react"
import {
  dailyData, coversByDay, coversByPeriod,
  partySizeDistribution, overviewInsights, channelMix,
} from "@/lib/analytics-data"

const CHART_COLORS = ["#34d399", "#22d3ee", "#fbbf24", "#fb7185", "#a78bfa", "#60a5fa"]

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-zinc-800/50 bg-zinc-900/80 p-4 backdrop-blur-sm ${className ?? ""}`}>
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-zinc-400 uppercase">{title}</h3>
      {children}
    </div>
  )
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
      <p className="mb-1 text-xs font-medium text-zinc-400">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          {p.name}: {p.name === "revenue" ? `$${(p.value / 1000).toFixed(1)}K` : p.value}
        </p>
      ))}
    </div>
  )
}

const channelPieData = Object.entries(channelMix).map(([name, d], i) => ({
  name,
  value: d.covers,
  fill: CHART_COLORS[i],
}))

export function OverviewTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* Daily covers & revenue */}
      <ChartCard title="Daily Covers & Revenue (Last 30 Days)">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={dailyData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.4)" />
            <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} interval={4} />
            <YAxis yAxisId="left" tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "#71717a", fontSize: 10 }} tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 11 }}
              formatter={(value: string) => <span className="text-zinc-400">{value}</span>}
            />
            <Line yAxisId="left" type="monotone" dataKey="covers" stroke="#34d399" strokeWidth={2} dot={false} name="Covers" />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={2} dot={false} name="Revenue" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 2-col: day-of-week + service period */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Covers by Day of Week">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={coversByDay} layout="vertical" margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.4)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#71717a", fontSize: 10 }} />
              <YAxis dataKey="day" type="category" tick={{ fill: "#71717a", fontSize: 11 }} width={36} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
                      <p className="mb-1 text-xs font-medium text-zinc-400">{label}</p>
                      {payload.map((p) => (
                        <p key={p.name} className="text-xs" style={{ color: p.color as string }}>
                          {p.name}: {p.value as number}
                        </p>
                      ))}
                    </div>
                  )
                }}
              />
              <Bar dataKey="avg" fill="#34d399" radius={[0, 4, 4, 0]} name="Current" barSize={14} />
              <Bar dataKey="prev" fill="rgba(52,211,153,0.25)" radius={[0, 4, 4, 0]} name="Previous" barSize={14} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
            <span>Busiest: Saturday (avg 138)</span>
            <span>Slowest: Monday (avg 72)</span>
          </div>
        </ChartCard>

        <ChartCard title="Covers by Service Period">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={coversByPeriod}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                nameKey="period"
                stroke="none"
              >
                {coversByPeriod.map((entry) => (
                  <Cell key={entry.period} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]
                  return (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
                      <p className="text-xs" style={{ color: d.payload.fill }}>{d.name}: {d.value as number}%</p>
                    </div>
                  )
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => <span className="text-zinc-400">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-1 space-y-0.5 text-xs text-zinc-500">
            <p>Peak hour: 7:00-8:00 PM (Fri)</p>
            <p>Avg covers at peak: 68 | Capacity at peak: 87%</p>
          </div>
        </ChartCard>
      </div>

      {/* 2-col: channel mix + party size */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Booking Channel Mix">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={channelPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                stroke="none"
              >
                {channelPieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const d = payload[0]
                  const pct = ((d.value as number) / 2847 * 100).toFixed(0)
                  return (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
                      <p className="text-xs" style={{ color: d.payload.fill }}>{d.name}: {d.value as number} covers ({pct}%)</p>
                    </div>
                  )
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => <span className="text-zinc-400">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
          <p className="mt-1 text-xs text-zinc-500">Direct growing (+5% vs prev)</p>
        </ChartCard>

        <ChartCard title="Party Size Distribution">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={partySizeDistribution} layout="vertical" margin={{ left: 0, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.4)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#71717a", fontSize: 10 }} unit="%" />
              <YAxis dataKey="size" type="category" tick={{ fill: "#71717a", fontSize: 11 }} width={32} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
                      <p className="mb-1 text-xs font-medium text-zinc-400">Party of {label}</p>
                      <p className="text-xs text-cyan-400">{payload[0].value}% of covers</p>
                    </div>
                  )
                }}
              />
              <Bar dataKey="percentage" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={14} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
            <span>Avg party size: 3.4 guests</span>
            <span>Most common: 2 (32%)</span>
          </div>
        </ChartCard>
      </div>

      {/* Insights */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 backdrop-blur-sm">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-400">
          <Lightbulb className="h-4 w-4" />
          Insights
        </h3>
        <ul className="space-y-1.5">
          {overviewInsights.map((insight, i) => (
            <li
              key={i}
              className="analytics-insight-stagger text-xs leading-relaxed text-zinc-400"
              style={{ "--insight-index": i } as React.CSSProperties}
            >
              {insight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
