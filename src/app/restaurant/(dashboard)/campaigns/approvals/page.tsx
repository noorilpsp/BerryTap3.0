"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Clock, AlertCircle, Mail, MessageSquare, ArrowLeft, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { mockApprovalsData } from "./approvals-mock-data"

export default function ApprovalsPage() {
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null)

  const { pendingApprovals, recentlyApproved } = mockApprovalsData

  const handleApprove = (campaign: any) => {
    setSelectedCampaign(campaign)
    setApprovalDialogOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Campaign Approvals</h1>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pendingApprovals.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {pendingApprovals.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <CheckCircle className="w-16 h-16 text-success mb-4" />
                <h3 className="text-xl font-semibold mb-2">All caught up on approvals!</h3>
                <p className="text-muted-foreground">You have no campaigns pending approval</p>
                <Button variant="outline" className="mt-4 bg-transparent">
                  View Approved Campaigns
                </Button>
              </CardContent>
            </Card>
          ) : (
            pendingApprovals.map((approval) => (
              <Card key={approval.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="bg-warning/10 text-warning">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending Approval
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{approval.campaignName}</CardTitle>
                      <CardDescription className="mt-2">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs">{approval.submittedBy.initials}</AvatarFallback>
                            </Avatar>
                            {approval.submittedBy.name}
                          </span>
                          <span>•</span>
                          <span>{new Date(approval.submittedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {approval.scheduledFor &&
                              `Scheduled ${new Date(approval.scheduledFor).toLocaleDateString()}`}
                          </span>
                        </div>
                      </CardDescription>
                    </div>
                    <Button size="sm">View Campaign</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Campaign Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Channels</div>
                      <div className="flex gap-1">
                        {approval.channels.includes("email") && <Mail className="w-4 h-4" />}
                        {approval.channels.includes("sms") && <MessageSquare className="w-4 h-4" />}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Recipients</div>
                      <div className="font-medium">{approval.recipientCount.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Estimated Cost</div>
                      <div className="font-medium">€{approval.estimatedCost.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Approver</div>
                      <div className="font-medium text-sm">{approval.approver}</div>
                    </div>
                  </div>

                  {/* Approval Checklist */}
                  <div>
                    <div className="font-medium mb-2">Approval Checklist:</div>
                    <div className="space-y-2">
                      {approval.checklist.map((item, index) => (
                        <div key={index} className="flex items-start gap-2">
                          {item.status === "pass" && <CheckCircle className="w-4 h-4 text-success mt-0.5" />}
                          {item.status === "warning" && <AlertCircle className="w-4 h-4 text-warning mt-0.5" />}
                          {item.status === "fail" && <XCircle className="w-4 h-4 text-destructive mt-0.5" />}
                          <span className={cn("text-sm", item.status === "warning" && "text-warning")}>
                            {item.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comments */}
                  {approval.comments && approval.comments.length > 0 && (
                    <div>
                      <div className="font-medium mb-2">Comments:</div>
                      {approval.comments.map((comment, index) => (
                        <div key={index} className="flex gap-2 text-sm p-3 bg-muted/30 rounded-lg">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">{comment.authorInitials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{comment.author}:</span> {comment.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Request Changes
                    </Button>
                    <Button variant="outline">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button onClick={() => handleApprove(approval)}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve & Send
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {recentlyApproved.map((approval) => (
            <Card key={approval.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-success/10 text-success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                      </Badge>
                      <h4 className="font-medium">{approval.campaignName}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Approved by {approval.approvedBy} • {new Date(approval.approvedAt).toLocaleDateString()} •{" "}
                      {approval.revenue && `€${approval.revenue.toLocaleString()} revenue`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <XCircle className="w-16 h-16 mb-4 opacity-50" />
              <p>No rejected campaigns</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Campaign: {selectedCampaign?.campaignName}</DialogTitle>
            <DialogDescription>You are about to approve this campaign for sending.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Scheduled:</span>{" "}
                {selectedCampaign?.scheduledFor && new Date(selectedCampaign.scheduledFor).toLocaleString()}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Recipients:</span>{" "}
                {selectedCampaign?.recipientCount.toLocaleString()}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Channels:</span> {selectedCampaign?.channels.join(", ")}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Estimated cost:</span> €
                {selectedCampaign?.estimatedCost.toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <div className="font-medium">Final Review:</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="reviewed" />
                  <Label htmlFor="reviewed">I have reviewed the campaign content</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="budget" />
                  <Label htmlFor="budget">Budget is approved</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="compliance" />
                  <Label htmlFor="compliance">Compliance requirements met</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="timing" />
                  <Label htmlFor="timing">Schedule and timing are appropriate</Label>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="comments">Approval Comments (optional)</Label>
              <Textarea
                id="comments"
                placeholder="Approved. Good timing for weekend traffic"
                className="mt-1.5"
                rows={3}
              />
            </div>

            <div className="p-3 bg-primary/5 rounded-lg text-sm">
              <strong>What happens next:</strong>
              <p className="text-muted-foreground mt-1">
                Campaign will be queued for sending at scheduled time. The sender will be notified of approval.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setApprovalDialogOpen(false)}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
