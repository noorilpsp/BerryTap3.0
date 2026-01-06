"use client"

import { useState } from "react"
import { PerformanceHeader } from "./components/PerformanceHeader"
import { KpiStrip } from "./components/KpiStrip"
import { PerformanceTabs } from "./components/PerformanceTabs"
import { InsightsSidebar } from "./components/InsightsSidebar"
import { DrillDownDrawer } from "./components/DrillDownDrawer"
import { DrillDownData } from "./types"

export default function PerformancePage() {
  const [drillDownOpen, setDrillDownOpen] = useState(false)
  const [drillDownData, setDrillDownData] = useState<DrillDownData | null>(null)

  const handleDrillDown = (data: DrillDownData) => {
    setDrillDownData(data)
    setDrillDownOpen(true)
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col space-y-6 overflow-auto p-4 lg:p-6">
        <PerformanceHeader />
        <KpiStrip onDrillDown={handleDrillDown} />
        <PerformanceTabs />
      </div>
      <InsightsSidebar />
      <DrillDownDrawer 
        open={drillDownOpen} 
        onOpenChange={setDrillDownOpen} 
        data={drillDownData}
      />
    </div>
  )
}
