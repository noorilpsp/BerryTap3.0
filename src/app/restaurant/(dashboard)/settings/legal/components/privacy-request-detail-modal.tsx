"use client"

import { CheckCircle, XCircle, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import type { PrivacyRequest } from "../types"

interface PrivacyRequestDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: PrivacyRequest
}

export function PrivacyRequestDetailModal({ open, onOpenChange, request }: PrivacyRequestDetailModalProps) {
  const handleApprove = () => {
    toast({
      title: "Request approved",
      description: `${request.type} request ${request.id} has been approved`,
    })
    onOpenChange(false)
  }

  const handleReject = () => {
    toast({
      title: "Request rejected",
      description: `${request.type} request ${request.id} has been rejected`,
      variant: "destructive",
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Privacy Request Details: {request.id}</DialogTitle>
          <DialogDescription>
            <Badge variant="secondary" className="mt-2">
              {request.status}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Requester Information</h3>
            <div className="border rounded-lg p-4 space-y-2">
              <p>
                <span className="text-muted-foreground">Name:</span> {request.requester}
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span> {request.email}
              </p>
              {request.customerId && (
                <p>
                  <span className="text-muted-foreground">Customer ID:</span> {request.customerId}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Identity verified via email link</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Request Details</h3>
            <div className="border rounded-lg p-4 space-y-2">
              <p>
                <span className="text-muted-foreground">Request ID:</span> {request.id}
              </p>
              <p>
                <span className="text-muted-foreground">Type:</span>{" "}
                <span className="capitalize">{request.type.replace("_", " ")}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Legal basis:</span> {request.legalBasis}
              </p>
              <p>
                <span className="text-muted-foreground">Submitted:</span>{" "}
                {new Date(request.submittedDate).toLocaleString()}
              </p>
              <p>
                <span className="text-muted-foreground">Due date:</span> {request.dueDate}
              </p>
            </div>
          </div>

          {request.requestedData && request.requestedData.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Requested Data</h3>
              <div className="border rounded-lg p-4">
                <ul className="space-y-1">
                  {request.requestedData.map((data, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>{data}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {request.warnings && request.warnings.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Warnings</h3>
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 rounded p-4">
                {request.warnings.map((warning, idx) => (
                  <p key={idx} className="text-sm text-orange-900 dark:text-orange-200">
                    ⚠️ {warning}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button variant="outline" onClick={() => {}}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Request More Info
          </Button>
          <Button variant="destructive" onClick={handleReject}>
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button onClick={handleApprove}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
