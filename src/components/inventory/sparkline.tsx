"use client"

import { Line, LineChart, ResponsiveContainer } from "recharts"

interface SparklineProps {
  data: number[]
}

export function Sparkline({ data }: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }))

  return (
    <ResponsiveContainer width="100%" height={40}>
      <LineChart data={chartData}>
        <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
