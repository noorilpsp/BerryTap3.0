"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Lock } from "lucide-react"
import type { TransactionDetail } from "../types/detail-types"
import { verifyManagerPin } from "../utils/refund-utils"

interface ManagerPinDialogProps {
  open: boolean
  transaction: TransactionDetail
  refundAmount: number
  reason: string
  onAuthorized: (pin: string, managerName: string) => void
  onCancel: () => void
}

export function ManagerPinDialog({
  open,
  transaction,
  refundAmount,
  reason,
  onAuthorized,
  onCancel,
}: ManagerPinDialogProps) {
  const [pin, setPin] = useState("")
  const [managerName, setManagerName] = useState("")
  const [error, setError] = useState("")
  const [attempts, setAttempts] = useState(3)

  const handleSubmit = () => {
    if (pin.length !== 4) {
      setError("Please enter a 4-digit PIN")
      return
    }

    const result = verifyManagerPin(pin)
    if (result.valid) {
      onAuthorized(pin, managerName)
      // Reset
      setPin("")
      setManagerName("")
      setError("")
      setAttempts(3)
    } else {
      const remaining = result.attemptsRemaining || 0
      setAttempts(remaining)
      setError("Incorrect PIN")
      setPin("")

      if (remaining === 0) {
        setError("Account locked. Please contact administrator.")
      }
    }
  }

  const handleClose = () => {
    setPin("")
    setManagerName("")
    setError("")
    setAttempts(3)
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            Manager Authorization Required
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>This refund requires manager approval</AlertDescription>
          </Alert>

          <div className="space-y-3 text-sm">
            <div className="font-medium">Refund Details:</div>
            <div className="space-y-1 text-muted-foreground">
              <div>• Transaction: {transaction.transactionId}</div>
              <div>
                • Amount: €{refundAmount.toFixed(2)} ({refundAmount >= transaction.amount * 0.99 ? "Full" : "Partial"}{" "}
                refund)
              </div>
              <div className="capitalize">• Reason: {reason.replace(/_/g, " ")}</div>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="font-medium">Your store policy requires manager authorization for:</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-5">
                  ✓
                </Badge>
                <span>All refunds over €100</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-5">
                  ✓
                </Badge>
                <span>Full refunds on orders over €40</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-5">
                  ✓
                </Badge>
                <span>Refunds to cash</span>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="manager-pin" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Manager PIN *
              </Label>
              <Input
                id="manager-pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "")
                  setPin(value)
                  setError("")
                }}
                placeholder="Enter 4-digit PIN"
                disabled={attempts === 0}
              />
              <p className="text-xs text-muted-foreground">Enter your 4-digit manager PIN to authorize this refund</p>
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {error}
                    {attempts > 0 && attempts < 3 && (
                      <div className="mt-1">
                        Attempts remaining: {attempts} of 3
                        <br />
                        (Account will be locked after 3 failed attempts)
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-name">Manager Name (optional):</Label>
              <Input
                id="manager-name"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                placeholder="Enter your name"
                disabled={attempts === 0}
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <div>Authorization will be logged in audit trail with:</div>
            <div>• Your PIN (encrypted)</div>
            <div>• Your name (if provided)</div>
            <div>• Timestamp</div>
            <div>• Reason for refund</div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={pin.length !== 4 || attempts === 0}>
            Authorize & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
