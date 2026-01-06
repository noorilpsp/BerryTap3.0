"use client"

import { Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import type { LegalDocument } from "../types"

interface ViewDocumentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: LegalDocument
}

export function ViewDocumentModal({ open, onOpenChange, document }: ViewDocumentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {document.title} v{document.version}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  toast({
                    title: "Download started",
                    description: `Downloading ${document.title}`,
                  })
                }
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button size="sm" variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 border rounded-lg p-6 overflow-y-auto bg-white dark:bg-gray-900">
          <div className="prose dark:prose-invert max-w-none">
            <h1>{document.title}</h1>
            <p className="text-muted-foreground">
              Version {document.version} • Effective {document.effectiveDate}
            </p>
            <hr />
            <p>
              This is a preview of the {document.title}. In a production environment, this would display the actual PDF
              or HTML content of the legal document.
            </p>
            <h2>Document Information</h2>
            <p>{document.description}</p>
            <h2>Compliance</h2>
            <p>This document addresses: {document.compliance.join(", ")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
