"use client"

import { Download, Eye, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { documentVersions } from "../data"
import type { LegalDocument } from "../types"

interface DocumentVersionHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: LegalDocument
}

export function DocumentVersionHistoryModal({ open, onOpenChange, document }: DocumentVersionHistoryModalProps) {
  const versions = documentVersions[document.id] || []

  const handleView = (version: string) => {
    toast({
      title: "Opening document",
      description: `Viewing ${document.title} v${version}`,
    })
  }

  const handleDownload = (version: string) => {
    toast({
      title: "Download started",
      description: `Downloading ${document.title} v${version}`,
    })
  }

  const handleReactivate = (version: string) => {
    toast({
      title: "Version reactivated",
      description: `${document.title} v${version} is now the active version`,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{document.title} - Version History</DialogTitle>
          <DialogDescription>View and manage document versions</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {versions.map((version) => (
            <div key={version.version} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">v{version.version}</h3>
                    <Badge variant={version.status === "active" ? "default" : "secondary"}>{version.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Uploaded: {version.uploadedDate} by {version.uploadedBy}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Effective: {version.effectiveDate}
                    {version.validUntil && ` - ${version.validUntil}`}
                  </p>
                </div>
              </div>

              {version.changes && version.changes.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-medium mb-1">Changes:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {version.changes.map((change, idx) => (
                      <li key={idx}>• {change}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleView(version.version)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDownload(version.version)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {version.status !== "active" && (
                  <Button size="sm" variant="outline" onClick={() => handleReactivate(version.version)}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reactivate
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
