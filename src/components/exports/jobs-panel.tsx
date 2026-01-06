"use client"

import { useState } from 'react'
import { Clock, CheckCircle, XCircle, Loader, AlertCircle, Download, Eye, Trash2, RotateCcw, MoreVertical, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { JobDetailsDrawer } from './job-details-drawer'

export function JobsPanel() {
  const [activeTab, setActiveTab] = useState("active")
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  const activeJobs = mockJobs.filter(j => j.status === 'running' || j.status === 'queued')
  const completedJobs = mockJobs.filter(j => j.status === 'completed')
  const failedJobs = mockJobs.filter(j => j.status === 'failed')

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId)
    setDrawerOpen(true)
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              📋 Export Jobs & History
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-3.5 w-3.5" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>Last 24 hours</DropdownMenuItem>
                <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                <DropdownMenuItem>All time</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="active" className="text-xs">
                Active ({activeJobs.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">
                History ({completedJobs.length})
              </TabsTrigger>
              <TabsTrigger value="failed" className="text-xs">
                Failed ({failedJobs.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            <Tabs value={activeTab}>
              <TabsContent value="active" className="mt-0 space-y-4">
                {activeJobs.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="text-4xl mb-3">⚙️</div>
                      <h3 className="font-semibold mb-1">No active exports</h3>
                      <p className="text-sm text-muted-foreground">
                        Your export jobs will appear here when you run an export
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  activeJobs.map((job) => <JobCard key={job.jobId} job={job} onClick={() => handleJobClick(job.jobId)} />)
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-0 space-y-4">
                {completedJobs.map((job) => <JobCard key={job.jobId} job={job} onClick={() => handleJobClick(job.jobId)} />)}
              </TabsContent>

              <TabsContent value="failed" className="mt-0 space-y-4">
                {failedJobs.map((job) => <JobCard key={job.jobId} job={job} onClick={() => handleJobClick(job.jobId)} />)}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>

      <JobDetailsDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        jobId={selectedJobId}
      />
    </>
  )
}

function JobCard({ job, onClick }: { job: typeof mockJobs[0]; onClick: () => void }) {
  const statusConfig = {
    running: { color: 'blue', icon: Loader, label: 'RUNNING', borderClass: 'border-l-blue-500' },
    queued: { color: 'yellow', icon: Clock, label: 'QUEUED', borderClass: 'border-l-amber-500' },
    completed: { color: 'green', icon: CheckCircle, label: 'COMPLETED', borderClass: 'border-l-green-500' },
    failed: { color: 'red', icon: XCircle, label: 'FAILED', borderClass: 'border-l-red-500' },
  }

  const config = statusConfig[job.status as keyof typeof statusConfig]
  const StatusIcon = config.icon

  return (
    <Card className={`border-l-4 ${config.borderClass} transition-all hover:shadow-md cursor-pointer`} onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base flex items-center gap-2 mb-1">
              <StatusIcon className={`h-4 w-4 flex-shrink-0 ${job.status === 'running' ? 'animate-spin' : ''} ${
                job.status === 'running' ? 'text-blue-500' :
                job.status === 'queued' ? 'text-amber-500' :
                job.status === 'completed' ? 'text-green-500' :
                'text-red-500'
              }`} />
              <span className="truncate">{job.name}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {job.datasetLabel} • {job.format.toUpperCase()}
              {job.status === 'completed' && ` • ${job.rowCount?.toLocaleString()} rows • ${job.fileSizeLabel}`}
              {job.status === 'running' && ` • ${job.progress?.total.toLocaleString()} rows`}
              {job.status === 'failed' && ` • Failed at ${job.progress?.failedAtRow?.toLocaleString()} rows`}
            </CardDescription>
          </div>
          <Badge variant={
            job.status === 'running' ? 'default' :
            job.status === 'queued' ? 'secondary' :
            job.status === 'completed' ? 'secondary' :
            'destructive'
          } className="text-xs flex-shrink-0">
            {config.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Progress Bar for Running Jobs */}
        {job.status === 'running' && job.progress && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Progress: {job.progress.current.toLocaleString()} / {job.progress.total.toLocaleString()} rows ({job.progress.percentageLabel})
              </span>
              <span className="font-medium text-blue-600">ETA: {job.progress.etaLabel}</span>
            </div>
            <Progress value={job.progress.percentage} className="h-2" />
          </div>
        )}

        {/* Queue Position for Queued Jobs */}
        {job.status === 'queued' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{job.queuePositionLabel}</span>
              <span className="font-medium text-amber-600">Wait: {job.estimatedWaitLabel}</span>
            </div>
            <Progress value={20} className="h-2" />
          </div>
        )}

        {/* Completion Info for Completed Jobs */}
        {job.status === 'completed' && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-900 p-2.5">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-green-900 dark:text-green-100">Ready to download</p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Completed in {job.durationLabel} • Expires in {job.expiresAtLabel}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Info for Failed Jobs */}
        {job.status === 'failed' && job.error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 p-2.5">
            <div className="flex items-start gap-2 text-sm">
              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-red-900 dark:text-red-100">{job.error.message}</p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                  {job.error.details}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User and Time Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Avatar className="h-5 w-5">
            <AvatarImage src={job.createdBy.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-[10px]">{job.createdBy.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <span>
            {job.createdAtLabel} by {job.createdBy.name}
          </span>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {job.status === 'running' && job.canCancel && (
            <>
              <Button variant="ghost" size="sm" className="flex-1 gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Details
              </Button>
            </>
          )}

          {job.status === 'queued' && job.canCancel && (
            <>
              <Button variant="ghost" size="sm" className="flex-1 gap-1.5">
                <XCircle className="h-3.5 w-3.5" />
                Cancel
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Details
              </Button>
            </>
          )}

          {job.status === 'completed' && job.canDownload && (
            <>
              <Button size="sm" className="flex-1 gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Details
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Copy Config</DropdownMenuItem>
                  <DropdownMenuItem>Share</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {job.status === 'failed' && (
            <>
              <Button variant="default" size="sm" className="flex-1 gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                Retry
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                Details
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 text-red-600 hover:text-red-700">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const mockJobs = [
  {
    jobId: "job_001",
    name: "Daily Sales Summary",
    dataset: "orders",
    datasetLabel: "Orders",
    format: "csv",
    status: "running",
    createdBy: { userId: "user_001", name: "Sarah Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    createdAtLabel: "45 seconds ago",
    progress: { current: 1234, total: 2847, percentage: 43.34, percentageLabel: "43%", eta: 135, etaLabel: "2m 15s" },
    canCancel: true,
  },
  {
    jobId: "job_002",
    name: "Staff Metrics Weekly",
    dataset: "staff_metrics",
    datasetLabel: "Staff Metrics",
    format: "xlsx",
    status: "queued",
    createdBy: { userId: "user_002", name: "Mike Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
    createdAtLabel: "3 minutes ago",
    queuePosition: 2,
    queuePositionLabel: "Position 2 in queue",
    estimatedWaitLabel: "~5 minutes",
    canCancel: true,
  },
  {
    jobId: "job_003",
    name: "Monthly Sales Report",
    dataset: "orders",
    datasetLabel: "Orders",
    format: "csv",
    status: "completed",
    createdBy: { userId: "user_001", name: "Sarah Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    createdAtLabel: "2 hours ago",
    durationLabel: "1m 23s",
    rowCount: 1847,
    fileSizeLabel: "924 KB",
    expiresAtLabel: "7 days",
    canDownload: true,
  },
  {
    jobId: "job_004",
    name: "Customer Export Large",
    dataset: "customer_insights",
    datasetLabel: "Customer Insights",
    format: "csv",
    status: "failed",
    createdBy: { userId: "user_003", name: "Emma Davis", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
    createdAtLabel: "5 minutes ago",
    progress: { failedAtRow: 3200 },
    error: { message: "Database timeout", details: "Query exceeded 30s limit. Try reducing date range or adding filters." },
    canRetry: true,
  },
  {
    jobId: "job_005",
    name: "Weekly Revenue Breakdown",
    dataset: "orders",
    datasetLabel: "Orders",
    format: "csv",
    status: "completed",
    createdBy: { userId: "user_001", name: "Sarah Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    createdAtLabel: "1 day ago",
    durationLabel: "2m 15s",
    rowCount: 3421,
    fileSizeLabel: "1.6 MB",
    expiresAtLabel: "6 days",
    canDownload: true,
  },
]
