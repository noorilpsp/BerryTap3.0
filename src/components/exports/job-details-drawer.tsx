"use client"

import { useState } from 'react'
import { X, Download, Copy, RefreshCw, AlertCircle, CheckCircle2, Info, Code, Clock, User, Database, TrendingUp, Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface JobDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string | null
}

export function JobDetailsDrawer({ open, onOpenChange, jobId }: JobDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview")
  
  // Mock job details - in real app, fetch based on jobId
  const jobDetails = mockJobDetails

  if (!jobId || !jobDetails) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl mb-1">{jobDetails.name}</SheetTitle>
              <SheetDescription className="text-sm">
                Job ID: {jobDetails.jobId}
              </SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b px-6">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6">
              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* Status */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">Completed</p>
                      <p className="text-sm text-green-700 dark:text-green-300">Ready to download</p>
                    </div>
                  </div>
                </div>

                {/* Created */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Created</h3>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={jobDetails.createdBy.avatar || "/placeholder.svg"} />
                      <AvatarFallback>{jobDetails.createdBy.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">Nov 15, 2024 at 2:00 PM</p>
                      <p className="text-muted-foreground">by {jobDetails.createdBy.name}</p>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Duration</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Started:</span>
                      <span className="font-medium">2:00:05 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="font-medium">2:01:28 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">{jobDetails.durationLabel}</span>
                    </div>
                  </div>
                </div>

                {/* Output */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Output</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>Rows exported: <span className="font-medium">{jobDetails.output.rowCount.toLocaleString()}</span></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>File size: <span className="font-medium">{jobDetails.output.fileSizeLabel}</span></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>Format: <span className="font-medium">{jobDetails.output.format.toUpperCase()} ({jobDetails.output.encoding.toUpperCase()} encoding)</span></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>Compression: <span className="font-medium">{jobDetails.output.compression}</span></span>
                    </li>
                  </ul>
                </div>

                {/* Download Options */}
                <Card className="bg-muted/30">
                  <CardContent className="p-4 space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download Options
                    </h3>
                    <div className="flex gap-2">
                      <Button size="sm" className="gap-2">
                        <Download className="h-3.5 w-3.5" />
                        Download File
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Copy className="h-3.5 w-3.5" />
                        Copy Link
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        📧 Email Link
                      </Button>
                    </div>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>File available until: <span className="font-medium">Nov 22, 2024 (7 days)</span></p>
                      <p>Downloads: <span className="font-medium">{jobDetails.output.downloadCount} times</span></p>
                      <p>Last downloaded: <span className="font-medium">2 hours ago by {jobDetails.output.lastDownloadedBy.name}</span></p>
                    </div>
                  </CardContent>
                </Card>

                {/* Retention */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Retention</h3>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>Expires in: <span className="font-medium">{jobDetails.retention.expiresIn} (Nov 22, 2024)</span></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>Auto-delete: <span className="font-medium">Enabled</span></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>Policy: <span className="font-medium">{jobDetails.retention.policy}</span></span>
                    </li>
                  </ul>
                </div>

                <Separator />

                {/* Quick Actions */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Run Again
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Copy className="h-3.5 w-3.5" />
                      Duplicate
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2 text-red-600 hover:text-red-700">
                      🗑 Delete
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="config" className="mt-0 space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  ⚙️ Export Configuration
                </h2>

                {/* Dataset */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Dataset</h3>
                  <p className="text-sm">
                    {jobDetails.config.dataset} <span className="text-muted-foreground">({jobDetails.config.datasetRecordCount.toLocaleString()} total records)</span>
                  </p>
                </div>

                {/* Date Range */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Date Range</h3>
                  <div className="space-y-1 text-sm">
                    <p>Nov 1, 2024 00:00:00 - Nov 30, 2024 23:59:59</p>
                    <p className="text-muted-foreground">Timezone: {jobDetails.config.dateRange.timezone} (UTC+1)</p>
                    <p className="text-muted-foreground">Duration: {jobDetails.config.dateRange.duration}</p>
                  </div>
                </div>

                {/* Columns */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Columns ({jobDetails.config.columns.length} selected)</h3>
                  <Card>
                    <CardContent className="p-3">
                      <ol className="space-y-2 text-sm">
                        {jobDetails.config.columns.map((col, idx) => (
                          <li key={col.key} className="flex items-center gap-2">
                            <span className="text-muted-foreground">{idx + 1}.</span>
                            <span className="font-medium">{col.label}</span>
                            <Badge variant="outline" className="text-xs">{col.type}</Badge>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </div>

                {/* Filters */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Filters ({jobDetails.config.filters.length} active)</h3>
                  <Card>
                    <CardContent className="p-3">
                      <ol className="space-y-2 text-sm">
                        {jobDetails.config.filters.map((filter, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="text-muted-foreground">{idx + 1}.</span>
                            <span>{filter.label}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                </div>

                {/* Output Format */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Output Format</h3>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium">{jobDetails.config.format.type.toUpperCase()} (Comma-Separated Values)</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Delimiter: {jobDetails.config.format.delimiter === ',' ? 'Comma (,)' : jobDetails.config.format.delimiter}</li>
                      <li>• Quote char: Double quote (")</li>
                      <li>• Line ending: {jobDetails.config.format.lineEnding} (\r\n)</li>
                      <li>• Encoding: {jobDetails.config.format.encoding.toUpperCase()}</li>
                      <li>• Header row: {jobDetails.config.format.includeHeader ? 'Included' : 'Not included'}</li>
                    </ul>
                  </div>
                </div>

                {/* Delivery Method */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Delivery Method</h3>
                  <p className="text-sm">Download Now (Browser)</p>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Copy className="h-3.5 w-3.5" />
                    Copy Configuration as JSON
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    💾 Save as Template
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="logs" className="mt-0 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  📝 Execution Logs
                </h2>

                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="space-y-1 font-mono text-xs">
                    {jobDetails.logs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-muted-foreground whitespace-nowrap">
                          [{new Date(log.timestamp).toLocaleTimeString()}]
                        </span>
                        {log.level === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0 mt-0.5" />}
                        {log.level === 'info' && <Info className="h-3.5 w-3.5 text-blue-600 flex-shrink-0 mt-0.5" />}
                        {log.level === 'error' && <AlertCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" />}
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Copy className="h-3.5 w-3.5" />
                    Copy Logs
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-3.5 w-3.5" />
                    Download Logs
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="mt-0 space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  ⚡ Performance Metrics
                </h2>

                {/* Timing Breakdown */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">Timing Breakdown</h3>
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {jobDetails.performance.phases.map((phase) => (
                          <div key={phase.name}>
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="font-medium">{phase.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">{phase.duration}s</span>
                                <span className="font-medium">{phase.percentage}%</span>
                              </div>
                            </div>
                            <Progress value={phase.percentage} className="h-2" />
                          </div>
                        ))}
                        <Separator />
                        <div className="flex items-center justify-between text-sm font-medium">
                          <span>Total</span>
                          <span>83s (100%)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Resource Usage */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Resource Usage</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Peak memory: <span className="font-medium">{jobDetails.performance.resources.peakMemoryMB} MB</span></li>
                    <li>• Avg CPU: <span className="font-medium">{jobDetails.performance.resources.avgCpuPercent}%</span></li>
                    <li>• Network: <span className="font-medium">{jobDetails.performance.resources.networkUploadKB} KB uploaded</span></li>
                    <li>• Database queries: <span className="font-medium">{jobDetails.performance.resources.databaseQueries} (optimized)</span></li>
                  </ul>
                </div>

                {/* Efficiency Metrics */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Efficiency Metrics</h3>
                  <ul className="space-y-1 text-sm">
                    <li>• Rows per second: <span className="font-medium">~{jobDetails.performance.efficiency.rowsPerSecond} rows/sec</span></li>
                    <li>• Data throughput: <span className="font-medium">~{jobDetails.performance.efficiency.dataThroughputKBPerSec} KB/sec</span></li>
                    <li>• Overhead: <span className="font-medium">{jobDetails.performance.efficiency.overheadPercent}% (expected: {jobDetails.performance.efficiency.expectedOverhead})</span></li>
                  </ul>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Recommendations</h3>
                  <div className="space-y-2">
                    {jobDetails.performance.recommendations.map((rec, idx) => (
                      <div key={idx} className={`flex items-start gap-2 p-2 rounded-md text-sm ${
                        rec.type === 'success' ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900' :
                        'bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900'
                      }`}>
                        {rec.type === 'success' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span>{rec.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

// Mock data
const mockJobDetails = {
  jobId: "job_003",
  name: "Monthly Sales Report - Nov 2024",
  status: "completed",
  dataset: "orders",
  createdBy: {
    userId: "user_001",
    name: "Sarah Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    email: "sarah@berrytap.com"
  },
  createdAt: "2024-11-15T14:00:00Z",
  startedAt: "2024-11-15T14:00:05Z",
  completedAt: "2024-11-15T14:01:28Z",
  duration: 83,
  durationLabel: "1 minute 23 seconds",
  output: {
    rowCount: 1847,
    fileSize: 924000,
    fileSizeLabel: "924 KB",
    format: "csv",
    encoding: "utf-8",
    compression: "none",
    downloadUrl: "https://storage.berrytap.com/exports/job_003.csv",
    signedUrl: true,
    expiresAt: "2024-11-22T14:01:28Z",
    expiresIn: "7 days",
    downloadCount: 3,
    lastDownloadedAt: "2024-11-15T12:00:00Z",
    lastDownloadedBy: {
      userId: "user_001",
      name: "Sarah Johnson"
    }
  },
  config: {
    dataset: "orders",
    datasetRecordCount: 2847392,
    dateRange: {
      from: "2024-11-01T00:00:00Z",
      to: "2024-11-30T23:59:59Z",
      timezone: "Europe/Skopje",
      duration: "30 days"
    },
    columns: [
      { key: "orderId", label: "Order ID", type: "string" },
      { key: "placedAt", label: "Placed At", type: "datetime" },
      { key: "amount", label: "Amount", type: "currency" },
      { key: "tax", label: "Tax", type: "currency" },
      { key: "tip", label: "Tip", type: "currency" },
      { key: "total", label: "Total", type: "currency" },
      { key: "channel", label: "Channel", type: "enum" },
      { key: "status", label: "Status", type: "enum" }
    ],
    filters: [
      {
        field: "channel",
        operator: "=",
        value: ["dine_in", "takeout"],
        label: "Channel = Dine In, Takeout"
      },
      {
        field: "total",
        operator: "≥",
        value: 50.00,
        label: "Total ≥ $50.00"
      },
      {
        field: "status",
        operator: "=",
        value: ["completed"],
        label: "Status = Completed"
      }
    ],
    format: {
      type: "csv",
      delimiter: ",",
      quoteChar: '"',
      lineEnding: "CRLF",
      encoding: "utf-8",
      includeHeader: true
    },
    destination: "download"
  },
  logs: [
    { timestamp: "2024-11-15T14:00:00Z", level: "info", message: "Job queued (job_003)", icon: "Info" },
    { timestamp: "2024-11-15T14:00:01Z", level: "info", message: "Validating export configuration...", icon: "Info" },
    { timestamp: "2024-11-15T14:00:02Z", level: "success", message: "Configuration validated successfully", icon: "CheckCircle2" },
    { timestamp: "2024-11-15T14:00:03Z", level: "info", message: "Estimating row count...", icon: "Info" },
    { timestamp: "2024-11-15T14:00:04Z", level: "info", message: "Estimated rows: ~1,850 (based on filters)", icon: "Info" },
    { timestamp: "2024-11-15T14:00:05Z", level: "success", message: "Job started", icon: "CheckCircle2" },
    { timestamp: "2024-11-15T14:00:05Z", level: "info", message: "Connecting to database...", icon: "Database" },
    { timestamp: "2024-11-15T14:00:06Z", level: "success", message: "Database connection established", icon: "CheckCircle2" },
    { timestamp: "2024-11-15T14:00:06Z", level: "info", message: "Building query with filters...", icon: "Info" },
    { timestamp: "2024-11-15T14:00:07Z", level: "success", message: "Query built successfully", icon: "CheckCircle2" },
    { timestamp: "2024-11-15T14:00:07Z", level: "info", message: "Executing query...", icon: "Info" },
    { timestamp: "2024-11-15T14:00:12Z", level: "info", message: "Query returned 1,847 rows", icon: "Info" },
    { timestamp: "2024-11-15T14:00:12Z", level: "info", message: "Processing rows...", icon: "Info" },
    { timestamp: "2024-11-15T14:00:15Z", level: "info", message: "Progress: 500 / 1,847 rows (27%)", icon: "Clock" },
    { timestamp: "2024-11-15T14:00:20Z", level: "info", message: "Progress: 1,000 / 1,847 rows (54%)", icon: "Clock" },
    { timestamp: "2024-11-15T14:00:25Z", level: "info", message: "Progress: 1,500 / 1,847 rows (81%)", icon: "Clock" },
    { timestamp: "2024-11-15T14:01:15Z", level: "success", message: "All rows processed", icon: "CheckCircle2" },
    { timestamp: "2024-11-15T14:01:15Z", level: "info", message: "Formatting as CSV...", icon: "Info" },
    { timestamp: "2024-11-15T14:01:20Z", level: "success", message: "CSV file created (924 KB)", icon: "CheckCircle2" },
    { timestamp: "2024-11-15T14:01:20Z", level: "info", message: "Uploading to storage...", icon: "Info" },
    { timestamp: "2024-11-15T14:01:25Z", level: "success", message: "File uploaded successfully", icon: "CheckCircle2" },
    { timestamp: "2024-11-15T14:01:26Z", level: "info", message: "Generating signed download URL...", icon: "Info" },
    { timestamp: "2024-11-15T14:01:27Z", level: "success", message: "Download URL generated (expires Nov 22)", icon: "CheckCircle2" },
    { timestamp: "2024-11-15T14:01:28Z", level: "success", message: "Job completed successfully", icon: "CheckCircle2" },
    { timestamp: "2024-11-15T14:01:28Z", level: "info", message: "Total duration: 1m 23s", icon: "Clock" }
  ],
  performance: {
    phases: [
      { name: "Validation", duration: 2, percentage: 2.4 },
      { name: "Database Query", duration: 5, percentage: 6.0 },
      { name: "Row Processing", duration: 63, percentage: 75.9 },
      { name: "CSV Formatting", duration: 5, percentage: 6.0 },
      { name: "File Upload", duration: 5, percentage: 6.0 },
      { name: "Finalization", duration: 3, percentage: 3.6 }
    ],
    resources: {
      peakMemoryMB: 45,
      avgCpuPercent: 23,
      networkUploadKB: 924,
      databaseQueries: 1
    },
    efficiency: {
      rowsPerSecond: 22,
      dataThroughputKBPerSec: 11,
      overheadPercent: 3.6,
      expectedOverhead: "2-5%"
    },
    recommendations: [
      {
        type: "success",
        message: "Performance is optimal for this dataset size"
      },
      {
        type: "tip",
        message: "Consider adding more filters to reduce processing time"
      }
    ]
  },
  retention: {
    expiresAt: "2024-11-22T14:01:28Z",
    expiresIn: "7 days",
    autoDelete: true,
    policy: "Standard (7-day retention)"
  }
}
