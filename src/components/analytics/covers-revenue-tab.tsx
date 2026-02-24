"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts"
import { cn } from "@/lib/utils"
import { revPASHData, revPASHMeta, coversByDay, revenueByZone, revenueByTable } from "@/lib/analytics-data"

const HOURS = ["17", "18", "19", "20", "21", "22"]
const HOUR_LABELS: Record<string, string> = { "17": "5PM", "18": "6PM", "19": "7PM", "20": "8PM", "21": "9PM", "22": "10PM" }

function heatColor(val: number): string {
  if (val >= 25) return "bg-emerald-500/80 text-emerald-50"
  if (val >= 18) return "bg-emerald-600/50 text-emerald-100"
  if (val >= 12) return "bg-amber-500/40 text-amber-100"
  if (val >= 8) return "bg-zinc-700/60 text-zinc-300"
  return "bg-zinc-800/50 text-zinc-500"
}

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-zinc-800/50 bg-zinc-900/80 p-4 backdrop-blur-sm", className)}>
      <h3 className="mb-3 text-sm font-semibold tracking-wide text-zinc-400 uppercase">{title}</h3>
      {children}
    </div>
  )
}

// forecast vs actual mock (based on coversByDay)
const forecastData = coversByDay.map((d) => ({
  day: d.day,
  actual: d.avg,
  forecast: Math.round(d.avg * (0.9 + Math.random() * 0.15)),
}))
const accuracy = Math.round(
  (forecastData.reduce((acc, d) => acc + (1 - Math.abs(d.actual - d.forecast) / d.actual), 0) / forecastData.length) * 100
)

export function CoversRevenueTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* RevPASH Heatmap */}
      <ChartCard title="Revenue Per Seat-Hour (RevPASH)">
        <p className="mb-3 text-xs leading-relaxed text-zinc-500">
          The most important metric for reservation optimization. Shows how effectively each seat generates revenue per hour.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs" aria-label="RevPASH heatmap by hour and day of week">
            <thead>
              <tr>
                <th className="px-2 py-1.5 text-left text-zinc-500 font-medium" />
                {HOURS.map((h) => (
                  <th key={h} className="px-2 py-1.5 text-center text-zinc-500 font-medium">{HOUR_LABELS[h]}</th>
                ))}
                <th className="px-2 py-1.5 text-center text-zinc-500 font-medium">Avg</th>
              </tr>
            </thead>
            <tbody>
              {revPASHData.map((row) => (
                <tr key={row.day}>
                  <td className="px-2 py-1.5 font-medium text-zinc-400">{row.day}</td>
                  {HOURS.map((h) => {
                    const val = row.hours[h]
                    return (
                      <td
                        key={h}
                        className={cn("px-2 py-1.5 text-center font-mono font-medium rounded", heatColor(val))}
                        aria-label={`${row.day} ${HOUR_LABELS[h]}: $${val} per seat-hour`}
                      >
                        ${val}
                      </td>
                    )
                  })}
                  <td className="px-2 py-1.5 text-center font-mono font-medium text-zinc-400">${row.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
          <span>Peak: <span className="font-medium text-emerald-400">${revPASHMeta.peak}/seat-hr</span> (Sat 7PM)</span>
          <span>Target: <span className="font-medium text-amber-400">${revPASHMeta.target}/seat-hr</span></span>
          <span>Average: <span className="font-medium text-zinc-400">${revPASHMeta.average}/seat-hr</span></span>
        </div>
      </ChartCard>

      {/* Forecast vs Actual */}
      <ChartCard title="Covers Forecast vs Actual">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={forecastData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.4)" />
            <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 10 }} />
            <YAxis tick={{ fill: "#71717a", fontSize: 10 }} />
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
            <Legend wrapperStyle={{ fontSize: 11 }} formatter={(value: string) => <span className="text-zinc-400">{value}</span>} />
            <Line type="monotone" dataKey="actual" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
            <Line type="monotone" dataKey="forecast" stroke="#71717a" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3, stroke: "#71717a" }} name="Forecast" />
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-2 text-xs text-zinc-500">Accuracy: <span className="font-medium text-cyan-400">{accuracy}%</span></p>
      </ChartCard>

      {/* Revenue by zone + table */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Revenue by Zone">
          <div className="space-y-3">
            {revenueByZone.map((z) => (
              <div key={z.zone}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300">{z.zone}</span>
                  <span className="font-mono text-zinc-400">${(z.revenue / 1000).toFixed(1)}K ({z.percentage}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div className="h-full rounded-full bg-emerald-500/70" style={{ width: `${z.percentage}%` }} />
                </div>
                <p className="mt-0.5 text-[10px] text-zinc-600">{z.seats} seats &middot; ${z.revenuePerSeat.toLocaleString()}/seat/month</p>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Revenue by Table (Top 10)">
          <div className="space-y-1.5">
            {revenueByTable.map((t, i) => (
              <div key={t.table} className="flex items-center gap-2 text-xs">
                <span className="w-5 text-right font-mono text-zinc-600">{i + 1}</span>
                <span className="w-8 font-medium text-zinc-300">{t.table}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-cyan-500/60"
                    style={{ width: `${(t.revenue / revenueByTable[0].revenue) * 100}%` }}
                  />
                </div>
                <span className="w-14 text-right font-mono text-zinc-400">${(t.revenue / 1000).toFixed(1)}K</span>
                {t.features && <span className="text-[10px] text-zinc-600">({t.features})</span>}
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
