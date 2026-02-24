"use client"

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts"
import { AlertTriangle, Lightbulb, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  dailyData, noShowByDay, noShowByTime, noShowByChannel,
  noShowByGuestType, noShowRevenueImpact, repeatOffenders,
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

const dailyNoShowRate = dailyData
  .filter((d) => d.covers > 0)
  .map((d) => ({
    date: d.date,
    rate: parseFloat(((d.noShows / d.covers) * 100).toFixed(1)),
  }))

function HBarChart({ data, labelKey, valueKey, maxVal, color }: { data: Array<Record<string, unknown>>; labelKey: string; valueKey: string; maxVal: number; color: string }) {
  return (
    <div className="space-y-1.5">
      {data.map((item) => {
        const label = item[labelKey] as string
        const value = item[valueKey] as number
        return (
          <div key={label} className="flex items-center gap-2 text-xs">
            <span className="w-20 shrink-0 text-right text-zinc-400">{label}</span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full rounded-full" style={{ width: `${(value / maxVal) * 100}%`, backgroundColor: color }} />
            </div>
            <span className="w-12 font-mono text-zinc-300">{value}%</span>
          </div>
        )
      })}
    </div>
  )
}

export function NoShowsTab() {
  const imp = noShowRevenueImpact
  return (
    <div className="flex flex-col gap-4">
      {/* Trend line */}
      <ChartCard title="No-Show Trend (Last 30 Days)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={dailyNoShowRate} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(63,63,70,0.4)" />
            <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 10 }} interval={4} />
            <YAxis tick={{ fill: "#71717a", fontSize: 10 }} unit="%" domain={[0, 12]} />
            <ReferenceLine y={3} stroke="#fbbf24" strokeDasharray="6 3" label={{ value: "Target 3%", fill: "#fbbf24", fontSize: 10, position: "right" }} />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 shadow-xl">
                    <p className="text-xs text-zinc-400">{label}</p>
                    <p className="text-xs text-rose-400">No-show rate: {payload[0].value}%</p>
                  </div>
                )
              }}
            />
            <Line type="monotone" dataKey="rate" stroke="#fb7185" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-500">
          <span>Current: <span className="font-medium text-rose-400">4.2%</span></span>
          <span>Target: <span className="font-medium text-amber-400">3.0%</span></span>
          <span>Previous: <span className="font-medium text-zinc-400">5.3%</span></span>
          <span>Trend: <span className="font-medium text-emerald-400">Improving</span></span>
        </div>
      </ChartCard>

      {/* By day + by time */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="No-Shows by Day">
          <HBarChart data={noShowByDay} labelKey="day" valueKey="rate" maxVal={8} color="#fb7185" />
          <p className="mt-2 text-xs text-zinc-500">Worst: <span className="text-rose-400">Friday (5.6%)</span></p>
        </ChartCard>
        <ChartCard title="No-Shows by Time Slot">
          <HBarChart data={noShowByTime} labelKey="slot" valueKey="rate" maxVal={8} color="#fb7185" />
          <div className="mt-2 space-y-0.5 text-xs text-zinc-500">
            <p>Worst: <span className="text-rose-400">Late dinner 9-10 PM (6.2%)</span></p>
            <p>Best: <span className="text-emerald-400">Lunch (2.1%)</span></p>
          </div>
        </ChartCard>
      </div>

      {/* By channel + by guest type */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="No-Shows by Channel">
          <HBarChart data={noShowByChannel} labelKey="channel" valueKey="rate" maxVal={14} color="#fbbf24" />
          <div className="mt-2 flex items-start gap-1.5 text-xs text-amber-400">
            <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
            <span>Google 3.9x higher than direct bookings</span>
          </div>
        </ChartCard>
        <ChartCard title="No-Shows by Guest Type">
          <HBarChart data={noShowByGuestType} labelKey="type" valueKey="rate" maxVal={36} color="#a78bfa" />
          <p className="mt-2 text-xs text-zinc-500">
            First-timers from Google are highest risk segment (<span className="text-rose-400">18.2%</span>)
          </p>
        </ChartCard>
      </div>

      {/* Revenue impact */}
      <ChartCard title="Revenue Impact of No-Shows">
        <div className="grid gap-2 text-xs sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2">
            <span className="text-zinc-400">Est. lost revenue</span>
            <span className="font-mono font-bold text-rose-400">${imp.lostRevenue.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2">
            <span className="text-zinc-400">Avg no-show check</span>
            <span className="font-mono font-medium text-zinc-300">${imp.avgNoShowCheck}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2">
            <span className="text-zinc-400">Recovered (waitlist/rebook)</span>
            <span className="font-mono font-medium text-emerald-400">{imp.recoveredPercent}% (${imp.recoveredAmount.toLocaleString()})</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2">
            <span className="text-zinc-400">Net loss</span>
            <span className="font-mono font-bold text-rose-400">${imp.netLoss.toLocaleString()}</span>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-400">
          <Lightbulb className="mt-0.5 h-3 w-3 shrink-0" />
          <span>Requiring confirmation for Google bookings could reduce no-shows by ~40 reservations/month, recovering ~$4,760 in revenue.</span>
        </div>
      </ChartCard>

      {/* Repeat offenders */}
      <ChartCard title="Repeat No-Show Offenders">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" aria-label="Repeat no-show offenders">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500">
                <th className="px-2 py-2 text-left font-medium">Guest</th>
                <th className="px-2 py-2 text-center font-medium">No-Shows</th>
                <th className="px-2 py-2 text-center font-medium">Total</th>
                <th className="px-2 py-2 text-center font-medium">Rate</th>
                <th className="px-2 py-2 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {repeatOffenders.map((o) => (
                <tr key={o.name} className="border-b border-zinc-800/50">
                  <td className="px-2 py-2 font-medium text-zinc-300">{o.name}</td>
                  <td className="px-2 py-2 text-center font-mono text-rose-400">{o.noShows}</td>
                  <td className="px-2 py-2 text-center font-mono text-zinc-400">{o.totalBookings}</td>
                  <td className="px-2 py-2 text-center font-mono text-rose-400">{o.rate}%</td>
                  <td className="px-2 py-2 text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px]",
                        o.status === "blocked"
                          ? "border-rose-500/40 text-rose-400"
                          : "border-amber-500/40 text-amber-400"
                      )}
                    >
                      <ShieldAlert className="mr-1 h-2.5 w-2.5" />
                      {o.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
