"use client"

import { useState, useEffect } from "react"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { CHART_COLORS } from "@/lib/constants"

interface TableUtilizationProps {
  data: { name: string; value: number }[]
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
  const RADIAN = Math.PI / 180
  // Position label at 60% of the radius for better centering
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  // Only show label if slice is large enough (>5%)
  if (percent < 0.05) return null

  return (
    <g>
      <text
        x={x}
        y={y - 6}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-medium"
        style={{ pointerEvents: "none" }}
      >
        {name}
      </text>
      <text
        x={x}
        y={y + 8}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-normal"
        style={{ pointerEvents: "none" }}
      >
        {value}
      </text>
    </g>
  )
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
      <p className="text-sm font-medium text-foreground">{data.name}</p>
      <p className="text-sm text-muted-foreground">
        {data.value} table{data.value !== 1 ? "s" : ""}
      </p>
    </div>
  )
}

export default function TableUtilization({ data }: TableUtilizationProps) {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }
    
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  return (
    <div className="relative h-full text-foreground">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="85%"
            labelLine={false}
            label={renderCustomLabel}
          >
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            content={<CustomTooltip />}
            cursor={false}
            position={{ x: 0, y: 16 }}
            wrapperStyle={{
              position: "absolute",
              top: isDesktop ? "0" : "0.5rem",
              right: "3rem",
              left: "auto",
              transform: "none",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
