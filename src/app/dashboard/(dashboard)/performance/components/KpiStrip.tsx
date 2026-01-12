"use client"

import { kpiData } from "../lib/mockData"
import { KpiCard } from "./KpiCard"
import { DrillDownData } from "../types"

interface KpiStripProps {
  onDrillDown: (data: DrillDownData) => void
}

export function KpiStrip({ onDrillDown }: KpiStripProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpiData.map((kpi) => (
        <KpiCard 
          key={kpi.id} 
          kpi={kpi} 
          onClick={() => onDrillDown({
            id: kpi.id,
            type: "kpi",
            title: kpi.title,
            subtitle: "Detailed performance analysis",
            kpi
          })}
        />
      ))}
    </div>
  )
}
