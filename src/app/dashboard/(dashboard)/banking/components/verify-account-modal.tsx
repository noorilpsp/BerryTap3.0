"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertTriangle, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { BankAccount } from "../types"

interface VerifyAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: BankAccount | null
  onSuccess: () => void
}

export function VerifyAccountModal({ open, onOpenChange, account, onSuccess }: VerifyAccountModalProps) {
  const { toast } = useToast()
  const [amount1, setAmount1] = useState("")
  const [amount2, setAmount2] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attemptsRemaining] = useState(3)

  const handleVerify = async () => {
    if (!amount1 || !amount2) {
      toast({
        title: "Amounts Required",
        description: "Please enter both deposit amounts",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    onOpenChange(false)

    toast({
      title: "Account Verified!",
      description: "Your bank account is now ready to receive payouts",
    })

    onSuccess()
  }

  if (!account) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Verify Bank Account</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <p className="font-semibold">{account.bankName}</p>
            <p className="text-sm text-muted-foreground">{account.ibanMasked}</p>
            <p className="text-sm text-muted-foreground">{account.accountHolder}</p>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">Micro-Deposit Verification</h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span>⏳ Deposits sent on Nov 18, 2024</span>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="text-sm">We sent 2 small deposits to your bank account.</p>
              <p className="text-sm">Check your bank statement and enter the exact amounts below.</p>

              <div className="mt-4 space-y-2 text-sm">
                <p className="font-medium">Look for:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Transaction description: "BerryTap Verification" or "VERIFY"</li>
                  <li>2 deposits, each less than €1.00</li>
                  <li>Posted between Nov 18-21, 2024</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">Enter Deposit Amounts</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount1">First deposit amount (in euros) *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">€</span>
                  <Input
                    id="amount1"
                    type="number"
                    step="0.01"
                    value={amount1}
                    onChange={(e) => setAmount1(e.target.value)}
                    placeholder="0.12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount2">Second deposit amount (in euros) *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">€</span>
                  <Input
                    id="amount2"
                    type="number"
                    step="0.01"
                    value={amount2}
                    onChange={(e) => setAmount2(e.target.value)}
                    placeholder="0.37"
                  />
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Important: Enter amounts exactly as shown on your statement (e.g., if you see €0.12 and €0.37, enter
                  those exact values)
                </p>
              </div>

              <p className="text-sm text-muted-foreground">Attempts remaining: {attemptsRemaining} of 3</p>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-4 w-4 mt-0.5" />
              <div className="flex-1 space-y-2 text-sm">
                <p className="font-medium">Need Help?</p>

                <div className="space-y-1">
                  <p className="text-muted-foreground">Haven't received the deposits?</p>
                  <ul className="list-disc list-inside text-muted-foreground">
                    <li>They can take 1-3 business days to appear</li>
                    <li>Check with your bank if not received after 3 days</li>
                  </ul>
                </div>

                <Button variant="link" className="h-auto p-0">
                  Resend Deposits (available after 24 hours)
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleVerify} disabled={isSubmitting || !amount1 || !amount2}>
            {isSubmitting ? "Verifying..." : "Verify Account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
