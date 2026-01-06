"use client"

import { CheckCircle, Download, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { complianceChecklists } from "../data"

interface ComplianceDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  complianceName: string
}

export function ComplianceDetailModal({ open, onOpenChange, complianceName }: ComplianceDetailModalProps) {
  const compliance = complianceChecklists.find((c) => c.name === complianceName)

  if (!compliance) return null

  const handleDownloadReport = () => {
    toast({
      title: "Generating report",
      description: `${complianceName} compliance report is being generated`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {compliance.name} - Detailed View
          </DialogTitle>
          <DialogDescription>
            <Badge variant="default" className="mt-2">
              <CheckCircle className="h-3 w-3 mr-1" />
              {compliance.completedCount}/{compliance.totalCount} Complete
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            {compliance.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded hover:bg-accent/50">
                <CheckCircle className={`h-5 w-5 ${item.completed ? "text-green-600" : "text-gray-300"}`} />
                <span className={item.completed ? "" : "text-muted-foreground"}>{item.label}</span>
              </div>
            ))}
          </div>

          {compliance.lastAudit && (
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground">Last audit: {compliance.lastAudit}</p>
              <p className="text-sm text-muted-foreground">Next audit: {compliance.nextAudit}</p>
            </div>
          )}

          {compliance.certificate && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Certification Details</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  {compliance.certificate.valid ? (
                    <Badge variant="default">Valid</Badge>
                  ) : (
                    <Badge variant="destructive">Expired</Badge>
                  )}
                </p>
                {compliance.certificate.validUntil && (
                  <p>
                    <span className="text-muted-foreground">Valid until:</span> {compliance.certificate.validUntil}
                  </p>
                )}
                {compliance.certificate.lastScan && (
                  <p>
                    <span className="text-muted-foreground">Last scan:</span> {compliance.certificate.lastScan}
                  </p>
                )}
                {compliance.certificate.nextScan && (
                  <p>
                    <span className="text-muted-foreground">Next scan:</span> {compliance.certificate.nextScan}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleDownloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
