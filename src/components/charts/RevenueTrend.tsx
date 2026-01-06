"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { GRIDLINE, CHART_COLORS } from "@/lib/constants"

interface RevenueTrendProps {
  data: { time: string; value: number }[]
}

function CustomTooltip({ active, payload, coordinate }: any) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0].payload

  return (
    <div
      className="text-sm font-medium text-foreground pointer-events-none"
      style={{
        position: "absolute",
        left: coordinate?.x ? coordinate.x + 16 : 0,
        top: coordinate?.y ? coordinate.y - 12 : 0,
        transform: "translateY(-50%)",
      }}
    >
      <div className="text-xs text-muted-foreground">{data.time}</div>
      <div className="text-base font-semibold">${data.value.toLocaleString()}</div>
    </div>
  )
}

export default function RevenueTrend({ data }: RevenueTrendProps) {
  return (
    <div className="h-full text-foreground">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={GRIDLINE} strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 13, opacity: 0.6 }}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 13, opacity: 0.6 }} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: CHART_COLORS[0], strokeWidth: 1, strokeDasharray: "4 4" }}
            wrapperStyle={{ outline: "none" }}
            position={{ y: 0 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: CHART_COLORS[0] }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
