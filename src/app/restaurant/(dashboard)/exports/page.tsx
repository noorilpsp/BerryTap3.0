import { DatasetsPanel } from "@/components/exports/datasets-panel"
import { JobsPanel } from "@/components/exports/jobs-panel"
import { ExportBuilder } from "@/components/exports/export-builder"
import { ScheduledExportsPanel } from "@/components/exports/scheduled-exports-panel"
import { TemplatesPanel } from "@/components/exports/templates-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ExportsPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col overflow-hidden">
      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Left Sidebar - Datasets */}
        <div className="w-80 border-r border-border bg-card overflow-y-auto flex-shrink-0">
          <DatasetsPanel />
        </div>

        {/* Center Content - Export Builder */}
        <div className="flex-1 overflow-y-auto bg-background p-6">
          <ExportBuilder />
        </div>

        {/* Right Sidebar - Templates, Jobs & Schedules */}
        <div className="w-96 border-l border-border bg-card overflow-hidden flex-shrink-0">
          <Tabs defaultValue="templates" className="h-full flex flex-col">
            <div className="border-b border-border px-4 pt-4">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
                <TabsTrigger value="jobs" className="text-xs">Jobs</TabsTrigger>
                <TabsTrigger value="schedules" className="text-xs">Schedules</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="templates" className="flex-1 overflow-y-auto mt-0">
              <TemplatesPanel />
            </TabsContent>
            <TabsContent value="jobs" className="flex-1 overflow-y-auto p-4 mt-0">
              <JobsPanel />
            </TabsContent>
            <TabsContent value="schedules" className="flex-1 overflow-y-auto p-4 mt-0">
              <ScheduledExportsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
