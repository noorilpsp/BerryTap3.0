"use client"

import { useState } from 'react'
import { Eye, Download, X, Info, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface PreviewPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PreviewPanel({ open, onOpenChange }: PreviewPanelProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Eye className="h-5 w-5 text-primary" />
                Export Preview
              </DialogTitle>
              <DialogDescription className="text-sm">
                Orders Export • Nov 1-30, 2024 • 8 columns • First 20 of ~1,847 rows
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="data" className="flex-1">
          <div className="px-6 pt-2">
            <TabsList>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="columns">Column Info</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="data" className="px-6 pb-6 mt-4">
            <ScrollArea className="h-[500px] rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-muted z-10">
                  <TableRow>
                    <TableHead className="font-semibold">Order ID</TableHead>
                    <TableHead className="font-semibold">Placed At</TableHead>
                    <TableHead className="font-semibold text-right">Amount</TableHead>
                    <TableHead className="font-semibold text-right">Tax</TableHead>
                    <TableHead className="font-semibold text-right">Tip</TableHead>
                    <TableHead className="font-semibold text-right">Total</TableHead>
                    <TableHead className="font-semibold">Channel</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPreviewData.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs">{row.orderId}</TableCell>
                      <TableCell className="text-sm">{row.placedAtDisplay}</TableCell>
                      <TableCell className="text-right font-medium">{row.amountDisplay}</TableCell>
                      <TableCell className="text-right">{row.taxDisplay}</TableCell>
                      <TableCell className="text-right">{row.tipDisplay || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell className="text-right font-semibold">{row.totalDisplay}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{row.channelDisplay}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{row.statusDisplay}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
            <p className="text-sm text-muted-foreground mt-3 text-center">
              Showing 20 of ~1,847 estimated rows
            </p>
          </TabsContent>

          <TabsContent value="columns" className="px-6 pb-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Column Information & Statistics</CardTitle>
                <CardDescription>Data types, null values, and sample values for each column</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Column Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Null Count</TableHead>
                        <TableHead className="text-right">Null %</TableHead>
                        <TableHead>Sample Values</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockColumnStats.map((stat, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{stat.columnLabel}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs font-mono">{stat.type}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{stat.nullCount}</TableCell>
                          <TableCell className="text-right">{stat.nullPercentage}%</TableCell>
                          <TableCell className="text-sm text-muted-foreground font-mono">
                            {stat.sampleValues.slice(0, 2).join(', ')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 p-3 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-900 dark:text-amber-100">1 column has null values</p>
                    <p className="text-amber-700 dark:text-amber-300 mt-1">
                      Tip (5.0% null) - These rows will show empty values in the export.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="px-6 pb-6 mt-4">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    📊 Data Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Rows (estimated)</p>
                      <p className="text-2xl font-bold">~1,847</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Columns</p>
                      <p className="text-2xl font-bold">8</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Date Range</p>
                      <p className="text-lg font-semibold">Nov 1 - Nov 30, 2024 (30 days)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    💰 Financial Summary
                  </CardTitle>
                  <CardDescription>From preview sample (20 rows)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-xl font-bold text-green-600">$861.60</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Order</p>
                      <p className="text-xl font-bold">$43.08</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Min Order</p>
                      <p className="text-lg font-semibold">$24.50</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Max Order</p>
                      <p className="text-lg font-semibold">$58.60</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    📈 Distribution
                  </CardTitle>
                  <CardDescription>From preview sample (20 rows)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Channel</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">Dine In (15)</Badge>
                      <Badge variant="secondary">Takeout (4)</Badge>
                      <Badge variant="secondary">Delivery (1)</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Status</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Completed (20)</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    Data Quality Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p>No duplicate Order IDs detected</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p>All timestamps within selected date range</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p>1 column with null values (Tip: 5.0%)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/50">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            <Download className="h-4 w-4 mr-2" />
            Export Anyway
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

const mockPreviewData = [
  { orderId: "ORD-001234", placedAtDisplay: "Nov 15, 2024 2:23PM", amountDisplay: "$24.50", taxDisplay: "$2.45", tipDisplay: "$4.90", totalDisplay: "$31.85", channelDisplay: "Dine In", statusDisplay: "Completed" },
  { orderId: "ORD-001235", placedAtDisplay: "Nov 15, 2024 2:45PM", amountDisplay: "$38.75", taxDisplay: "$3.88", tipDisplay: "$7.75", totalDisplay: "$50.38", channelDisplay: "Dine In", statusDisplay: "Completed" },
  { orderId: "ORD-001236", placedAtDisplay: "Nov 15, 2024 3:12PM", amountDisplay: "$52.00", taxDisplay: "$5.20", tipDisplay: "$10.40", totalDisplay: "$67.60", channelDisplay: "Takeout", statusDisplay: "Completed" },
  { orderId: "ORD-001237", placedAtDisplay: "Nov 15, 2024 3:34PM", amountDisplay: "$28.90", taxDisplay: "$2.89", tipDisplay: "$5.78", totalDisplay: "$37.57", channelDisplay: "Dine In", statusDisplay: "Completed" },
  { orderId: "ORD-001238", placedAtDisplay: "Nov 15, 2024 3:56PM", amountDisplay: "$45.25", taxDisplay: "$4.53", tipDisplay: "$9.05", totalDisplay: "$58.83", channelDisplay: "Delivery", statusDisplay: "Completed" },
  { orderId: "ORD-001239", placedAtDisplay: "Nov 15, 2024 4:18PM", amountDisplay: "$31.60", taxDisplay: "$3.16", tipDisplay: "$6.32", totalDisplay: "$41.08", channelDisplay: "Dine In", statusDisplay: "Completed" },
  { orderId: "ORD-001240", placedAtDisplay: "Nov 15, 2024 4:42PM", amountDisplay: "$56.80", taxDisplay: "$5.68", tipDisplay: "$11.36", totalDisplay: "$73.84", channelDisplay: "Takeout", statusDisplay: "Completed" },
  { orderId: "ORD-001241", placedAtDisplay: "Nov 15, 2024 5:05PM", amountDisplay: "$42.15", taxDisplay: "$4.22", tipDisplay: "$8.43", totalDisplay: "$54.80", channelDisplay: "Dine In", statusDisplay: "Completed" },
  { orderId: "ORD-001242", placedAtDisplay: "Nov 15, 2024 5:28PM", amountDisplay: "$37.40", taxDisplay: "$3.74", tipDisplay: null, totalDisplay: "$48.62", channelDisplay: "Dine In", statusDisplay: "Completed" },
  { orderId: "ORD-001243", placedAtDisplay: "Nov 15, 2024 5:51PM", amountDisplay: "$49.90", taxDisplay: "$4.99", tipDisplay: "$9.98", totalDisplay: "$64.87", channelDisplay: "Dine In", statusDisplay: "Completed" },
  { orderId: "ORD-001244", placedAtDisplay: "Nov 15, 2024 6:14PM", amountDisplay: "$33.25", taxDisplay: "$3.33", tipDisplay: "$6.65", totalDisplay: "$43.23", channelDisplay: "Dine In", statusDisplay: "Completed" },
  { orderId: "ORD-001245", placedAtDisplay: "Nov 15, 2024 6:37PM", amountDisplay: "$58.60", taxDisplay: "$5.86", tipDisplay: "$11.72", totalDisplay: "$76.18", channelDisplay: "Takeout", statusDisplay: "Completed" },
  { orderId: "ORD-001246", placedAtDisplay: "Nov 15, 2024 7:01PM", amountDisplay: "$41.30", taxDisplay: "$4.13", tipDisplay: "$8.26", totalDisplay: "$53.69", channelDisplay: "Dine In", statusDisplay: "Completed" },
  { orderId: "ORD-001247", placedAtDisplay: "Nov 15, 2024 7:24PM", amountDisplay: "$54.75", taxDisplay: "$5.48", tipDisplay: "$10.95", totalDisplay: "$71.18", channelDisplay: "Dine In", statusDisplay: "Completed" },
  { orderId: "ORD-001248", placedAtDisplay: "Nov 15, 2024 7:48PM", amountDisplay: "$36.50", taxDisplay: "$3.65", tipDisplay: "$7.30", totalDisplay: "$47.45", channelDisplay: "Dine In", statusDisplay: "Completed" },
  { orderId: "ORD-001249", placedAtDisplay: "Nov 15, 2024 8:11PM", amountDisplay: "$48.20", taxDisplay: "$4.82", tipDisplay: "$9.64", totalDisplay: "$62.66", channelDisplay: "Takeout", statusDisplay: "Completed" },
  { orderId: "ORD-001250", placedAtDisplay: "Nov 15, 2024 8:35PM", amountDisplay: "$29.80", taxDisplay: "$2.98", tipDisplay: "$5.96", totalDisplay: "$38.74", channelDisplay: "Dine In", statusDisplay: "Completed" },
  { orderId: "ORD-001251", placedAtDisplay: "Nov 15, 2024 8:58PM", amountDisplay: "$51.40", taxDisplay: "$5.14", tipDisplay: "$10.28", totalDisplay: "$66.82", channelDisplay: "Dine In", statusDisplay: "Completed" },
  { orderId: "ORD-001252", placedAtDisplay: "Nov 15, 2024 9:22PM", amountDisplay: "$44.65", taxDisplay: "$4.47", tipDisplay: "$8.93", totalDisplay: "$58.05", channelDisplay: "Dine In", statusDisplay: "Completed" },
  { orderId: "ORD-001253", placedAtDisplay: "Nov 15, 2024 9:45PM", amountDisplay: "$39.90", taxDisplay: "$3.99", tipDisplay: "$7.98", totalDisplay: "$51.87", channelDisplay: "Dine In", statusDisplay: "Completed" },
]

const mockColumnStats = [
  { columnLabel: "Order ID", type: "string", nullCount: 0, nullPercentage: 0.0, sampleValues: ["ORD-001234", "ORD-001235", "ORD-001236"] },
  { columnLabel: "Placed At", type: "datetime", nullCount: 0, nullPercentage: 0.0, sampleValues: ["2024-11-15T14:23:00Z", "2024-11-15T14:45:00Z"] },
  { columnLabel: "Amount", type: "currency", nullCount: 0, nullPercentage: 0.0, sampleValues: ["$24.50", "$38.75", "$52.00"] },
  { columnLabel: "Tax", type: "currency", nullCount: 0, nullPercentage: 0.0, sampleValues: ["$2.45", "$3.88", "$5.20"] },
  { columnLabel: "Tip", type: "currency", nullCount: 1, nullPercentage: 5.0, sampleValues: ["$4.90", "$7.75", "null"] },
  { columnLabel: "Total", type: "currency", nullCount: 0, nullPercentage: 0.0, sampleValues: ["$31.85", "$50.38", "$67.60"] },
  { columnLabel: "Channel", type: "enum", nullCount: 0, nullPercentage: 0.0, sampleValues: ["dine_in", "takeout", "delivery"] },
  { columnLabel: "Status", type: "enum", nullCount: 0, nullPercentage: 0.0, sampleValues: ["completed"] },
]
