"use client"

import { Loader2 } from 'lucide-react'
import { Skeleton } from "@/components/ui/skeleton"

export function BuilderSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
      </div>
      <div className="flex justify-center py-4">
        <p className="text-sm text-muted-foreground">Loading export builder...</p>
      </div>
    </div>
  )
}

export function JobsPanelSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </div>
      ))}
      <div className="flex justify-center py-4">
        <p className="text-sm text-muted-foreground">Loading export jobs...</p>
      </div>
    </div>
  )
}

export function PreviewLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-center">
        <p className="font-medium">Loading Preview...</p>
        <p className="text-sm text-muted-foreground mt-1">Fetching sample data...</p>
        <p className="text-sm text-muted-foreground">Estimated time: 3-5 seconds</p>
      </div>
    </div>
  )
}

export function ExportStarting() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/50">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <div>
        <p className="font-medium">Starting Export...</p>
        <p className="text-sm text-muted-foreground">Please wait while we prepare your export...</p>
      </div>
    </div>
  )
}

export function TemplateSaving() {
  return (
    <div className="flex items-center gap-3">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span className="text-sm">Saving Template...</span>
    </div>
  )
}
