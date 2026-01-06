"use client"

import { useState } from "react"
import { TopBar } from "./components/TopBar"
import { KpiStrip } from "./components/KpiStrip"
import { ChartsGrid } from "./components/ChartsGrid"
import { DataTable } from "./components/DataTable"
import { InsightsSidebar } from "./components/InsightsSidebar"
import { DrilldownDrawer } from "./components/DrilldownDrawer"
import { ExportModal } from "./components/ExportModal"
import { useReportsData } from "./hooks/useReportsData"
import { useReportsFilters } from "./hooks/useReportsFilters"
import type { DrilldownData } from "./types/reports.types"

export default function ReportsPage() {
  const { filters, updateFilters, resetFilters } = useReportsFilters()
  const { data, loading, error, refresh } = useReportsData(filters)
  const [compareMode, setCompareMode] = useState<"off" | "previous" | "yoy">("off")
  const [drilldownOpen, setDrilldownOpen] = useState(false)
  const [drilldownData, setDrilldownData] = useState<DrilldownData | null>(null)
  const [exportModalOpen, setExportModalOpen] = useState(false)

  const handleKpiClick = (metric: string) => {
    setDrilldownData({
      type: "kpi",
      metric,
      title: `${metric.charAt(0).toUpperCase() + metric.slice(1)} Breakdown`,
      data: {
        metric,
        kpiData: data?.kpis,
        orders: data?.orders,
        channels: data?.ordersByChannel,
        timeseries: data?.revenueTimeseries,
      },
    })
    setDrilldownOpen(true)
  }

  const handleChartClick = (type: string, data: any) => {
    setDrilldownData({
      type: "chart",
      metric: type,
      title: `${type} Details`,
      data: data,
    })
    setDrilldownOpen(true)
  }

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 py-4 md:px-4 md:py-4">
      <main className="flex flex-col gap-4 md:gap-6">
        {/* Top Bar */}
        <div className="px-6">
          <TopBar
            filters={filters}
            onFiltersChange={updateFilters}
            compareMode={compareMode}
            onCompareModeChange={setCompareMode}
            onExport={() => setExportModalOpen(true)}
            onRefresh={refresh}
            onToggleFilters={() => {}}
          />
        </div>

        {/* KPI Strip */}
        <section className="px-6">
          <KpiStrip kpis={data?.kpis} compareMode={compareMode} loading={loading} onClick={handleKpiClick} />
        </section>

        {/* Charts Grid */}
        <section className="px-6">
          <ChartsGrid data={data} compareMode={compareMode} loading={loading} onDrill={handleChartClick} />
        </section>

        {/* Data Table */}
        <section className="px-6">
          <DataTable
            orders={data?.orders}
            loading={loading}
            onRowClick={(order) => {
              setDrilldownData({
                type: "order",
                metric: "order",
                title: `Order #${order.orderId}`,
                data: order,
              })
              setDrilldownOpen(true)
            }}
          />
        </section>

        {/* Insights Sidebar - Mobile/Tablet */}
        <section className="px-6 xl:hidden">
          <InsightsSidebar
            alerts={data?.alerts}
            suggestions={data?.suggestions}
            templates={data?.exportTemplates}
            recentExports={data?.recentExports}
            savedViews={data?.savedViews}
            onExport={() => setExportModalOpen(true)}
            onLoadView={updateFilters}
          />
        </section>
      </main>

      {/* Modals & Drawers */}
      <DrilldownDrawer
        open={drilldownOpen}
        onClose={() => setDrilldownOpen(false)}
        data={drilldownData}
        filters={filters}
      />

      <ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} data={data} filters={filters} />
    </div>
  )
}
