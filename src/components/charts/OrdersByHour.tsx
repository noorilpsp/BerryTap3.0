"use client"

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList } from "recharts"
import { GRIDLINE, CHART_COLORS } from "@/lib/constants"

interface OrdersByHourProps {
  data: { hour: string; count: number }[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]

  return (
    <div
      className="rounded-lg border bg-background/95 px-3 py-2 shadow-lg backdrop-blur-sm"
      style={{
        pointerEvents: "none",
      }}
    >
      <p className="text-sm font-medium text-foreground">{data.payload.hour}</p>
      <p className="text-sm text-muted-foreground">
        {data.value} order{data.value !== 1 ? "s" : ""}
      </p>
    </div>
  )
}

export default function OrdersByHour({ data }: OrdersByHourProps) {
  return (
    <div className="h-full text-foreground">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke={GRIDLINE} strokeDasharray="3 3" />
          <XAxis
            dataKey="hour"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "currentColor", fontSize: 13, opacity: 0.6 }}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "currentColor", fontSize: 13, opacity: 0.6 }} />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
            position={{ y: 0 }}
            wrapperStyle={{
              position: "absolute",
              top: "-3.5rem",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
          <Bar dataKey="count" fill={CHART_COLORS[1]}>
            <LabelList dataKey="count" position="top" className="fill-current" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
