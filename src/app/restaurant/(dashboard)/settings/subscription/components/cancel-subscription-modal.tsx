"use client"

import { useState } from "react"
import { AlertCircle, X, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import type { Subscription } from "../types"

interface CancelSubscriptionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: Subscription
}

export function CancelSubscriptionModal({ open, onOpenChange, subscription }: CancelSubscriptionModalProps) {
  const { toast } = useToast()
  const [reason, setReason] = useState("")
  const [feedback, setFeedback] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = () => {
    setIsLoading(true)
    setTimeout(() => {
      toast({
        title: "Subscription canceled",
        description: `Your subscription will remain active until ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}.`,
      })
      setIsLoading(false)
      onOpenChange(false)
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cancel Subscription</DialogTitle>
        </DialogHeader>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Are you sure you want to cancel your subscription?</AlertTitle>
        </Alert>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold">What Happens When You Cancel</h3>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">
                    You'll keep access until {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Continue using all Pro features until the end of your period
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <X className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">Your subscription will not renew</p>
                  <p className="text-sm text-muted-foreground">
                    No charge on {new Date(subscription.nextBillingDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <X className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium">You'll lose access to Pro features</p>
                  <p className="text-sm text-muted-foreground">
                    After {new Date(subscription.currentPeriodEnd).toLocaleDateString()}, you'll lose access to all Pro
                    features
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Tell us why you're canceling (optional)</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expensive" id="expensive" />
                <Label htmlFor="expensive" className="font-normal">
                  Too expensive
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="features" id="features" />
                <Label htmlFor="features" className="font-normal">
                  Missing features I need
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="competitor" id="competitor" />
                <Label htmlFor="competitor" className="font-normal">
                  Switching to a competitor
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not-needed" id="not-needed" />
                <Label htmlFor="not-needed" className="font-normal">
                  No longer need the service
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Additional feedback (optional)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us more..."
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Subscription
          </Button>
          <Button variant="destructive" onClick={handleCancel} disabled={isLoading}>
            {isLoading ? "Canceling..." : "Cancel Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
