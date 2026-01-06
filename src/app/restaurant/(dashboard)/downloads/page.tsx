"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, Mail, Trash2, RefreshCw, HelpCircle, Settings, FileText } from "lucide-react"
import { mockExportJobs } from "../transactions/data/export-data"
import { formatDistanceToNow } from "date-fns"

export default function DownloadCenterPage() {
  const activeJobs = mockExportJobs.filter((job) => job.status === "processing" || job.status === "queued")
  const completedJobs = mockExportJobs.filter((job) => job.status === "completed")
  const failedJobs = mockExportJobs.filter((job) => job.status === "failed")

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">Download Center</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Clear Completed
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Active Exports */}
      {activeJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Active Exports ({activeJobs.length})</h2>
          </div>

          {activeJobs.map((job) => (
            <Card key={job.jobId}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">
                          {job.status === "processing"
                            ? "transactions_2024-01-01_to_2024-11-20.xlsx"
                            : "refunds_report_november_2024.pdf"}
                        </span>
                      </div>
                      {job.status === "processing" ? (
                        <>
                          <p className="text-sm text-muted-foreground">Processing... {job.progress}%</p>
                          <Progress value={job.progress} className="w-full" />
                          <p className="text-xs text-muted-foreground mt-2">
                            Status: Generating file ({job.processedRows?.toLocaleString()} of{" "}
                            {job.estimatedRows.toLocaleString()} rows processed)
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Started: {formatDistanceToNow(new Date(job.startedAt!))} ago • Estimated completion: ~1
                            minute
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground">Queued (position 2 in queue)</p>
                          <p className="text-xs text-muted-foreground mt-2">Status: Waiting for processing</p>
                          <p className="text-xs text-muted-foreground">
                            Started: {formatDistanceToNow(new Date(job.startedAt!))} ago • Estimated start: ~2 minutes
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Cancel Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Completed Exports */}
      {completedJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Completed ({completedJobs.length})</h2>
          </div>

          {completedJobs.map((job) => (
            <Card key={job.jobId}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          ✓
                        </Badge>
                        <span className="font-medium">{job.result?.filename}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {(job.result!.fileSize / 1024).toFixed(0)} KB • {job.result!.actualRows.toLocaleString()} rows •
                        Completed {formatDistanceToNow(new Date(job.completedAt!))} ago
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires: {new Date(job.result!.expiresAt).toLocaleDateString()} (
                        {Math.floor((new Date(job.result!.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}{" "}
                        days remaining)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Downloaded: {job.result!.downloadCount} time{job.result!.downloadCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Failed Exports */}
      {failedJobs.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Failed ({failedJobs.length})</h2>
          </div>

          {failedJobs.map((job) => (
            <Card key={job.jobId} className="border-destructive">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">✗</Badge>
                        <span className="font-medium">transactions_large_dataset.xlsx</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Failed • Attempted {formatDistanceToNow(new Date(job.startedAt!))} ago
                      </p>
                      <p className="text-sm text-destructive mt-2">Error: {job.error?.message}</p>
                      <p className="text-xs text-muted-foreground">Tip: {job.error?.details}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry
                    </Button>
                    <Button variant="outline" size="sm">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      Get Help
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
