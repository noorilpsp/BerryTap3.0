"use client"

import { useState } from "react"
import { ShoppingCart, Users, UtensilsCrossed, Calendar, LayoutGrid, TrendingUp, Package, ChevronRight, Info, Lightbulb } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { availableDatasets } from "@/app/dashboard/(dashboard)/exports/data"

const iconMap: Record<string, any> = {
  ShoppingCart,
  Users,
  UtensilsCrossed,
  Calendar,
  LayoutGrid,
  TrendingUp,
  Package,
}

export function DatasetsPanel() {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null)

  const handleSelectDataset = (datasetId: string) => {
    console.log("[v0] Selecting dataset:", datasetId)
    setSelectedDataset(datasetId)
    // This will be used in Prompt 2 to load dataset into builder
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Available Datasets</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Select a dataset to view fields and build your export</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Badge variant="secondary" className="text-xs">{availableDatasets.length}</Badge>
      </div>

      {/* Datasets List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {availableDatasets.map((dataset) => {
              const Icon = iconMap[dataset.icon]
              const hasPII = dataset.fields.some((field) => field.pii)
              
              return (
                <AccordionItem
                  key={dataset.id}
                  value={dataset.id}
                  className={`rounded-lg border transition-all ${
                    selectedDataset === dataset.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border bg-card hover:bg-muted/50"
                  } ${!dataset.enabled ? "opacity-60" : ""}`}
                >
                  <AccordionTrigger
                    className="px-3 py-2.5 hover:no-underline rounded-lg transition-colors [&[data-state=open]]:pb-2"
                    disabled={!dataset.enabled}
                  >
                    <div className="flex items-center justify-between w-full pr-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-foreground">{dataset.name}</span>
                            {dataset.comingSoon && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {dataset.rowCountLabel}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3">
                    <div className="space-y-3 pt-1">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {dataset.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{dataset.fields.length} fields</span>
                        {hasPII && (
                          <>
                            <span>•</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Contains PII
                            </Badge>
                          </>
                        )}
                      </div>
                      {dataset.enabled && (
                        <Button
                          onClick={() => handleSelectDataset(dataset.id)}
                          size="sm"
                          className="w-full gap-2 h-8 text-xs"
                          variant={selectedDataset === dataset.id ? "default" : "outline"}
                        >
                          {selectedDataset === dataset.id ? "Selected" : "Select Dataset"}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </div>

        <div className="p-3">
          <Card className="border-primary/20 bg-primary/5 p-3">
            <div className="flex gap-2.5">
              <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">Quick Tip</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Click any dataset to view fields and start building your export
                </p>
              </div>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  )
}
