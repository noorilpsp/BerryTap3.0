"use client"

import { useState } from 'react'
import { Eye, Download, Calendar, Save, RotateCcw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PreviewPanel } from "./preview-panel"
import { SaveTemplateModal } from "./save-template-modal"
import { CreateScheduleModal } from "./create-schedule-modal"

export function ExportActions() {
  const [showPreview, setShowPreview] = useState(false)
  const [showSaveTemplate, setShowSaveTemplate] = useState(false)
  const [showCreateSchedule, setShowCreateSchedule] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset Builder
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Clear all fields and start over</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="gap-2" onClick={() => setShowPreview(true)}>
                  <Eye className="h-4 w-4" />
                  Preview Sample
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Preview first 20 rows of export data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="secondary" className="gap-2" onClick={() => setShowCreateSchedule(true)}>
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create recurring export schedule</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" className="gap-2" onClick={() => setShowSaveTemplate(true)}>
                  <Save className="h-4 w-4" />
                  Save Template
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save current configuration as reusable template</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Run Export
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Start export with current configuration</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <PreviewPanel open={showPreview} onOpenChange={setShowPreview} />
      <SaveTemplateModal open={showSaveTemplate} onOpenChange={setShowSaveTemplate} />
      <CreateScheduleModal open={showCreateSchedule} onOpenChange={setShowCreateSchedule} />
    </>
  )
}
