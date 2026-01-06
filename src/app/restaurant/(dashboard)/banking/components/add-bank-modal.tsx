"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, CheckCircle2, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AddBankModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddBankModal({ open, onOpenChange, onSuccess }: AddBankModalProps) {
  const { toast } = useToast()
  const [accountHolder, setAccountHolder] = useState("BerryTap Restaurant Ltd")
  const [iban, setIban] = useState("")
  const [bic, setBic] = useState("")
  const [currency, setCurrency] = useState("EUR")
  const [ibanValid, setIbanValid] = useState<boolean | null>(null)
  const [confirmBusiness, setConfirmBusiness] = useState(false)
  const [confirmAuthorized, setConfirmAuthorized] = useState(false)
  const [confirmTerms, setConfirmTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateIban = (value: string) => {
    const cleanIban = value.replace(/\s/g, "")
    if (cleanIban.length < 15) {
      setIbanValid(null)
      return
    }

    // Simple validation: check if it starts with 2 letters and has numbers
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/
    const isValid = ibanRegex.test(cleanIban)
    setIbanValid(isValid)

    // Auto-detect bank and BIC
    if (isValid && cleanIban.startsWith("MT")) {
      if (cleanIban.includes("VALL")) {
        setBic("VALLMTMT")
      } else if (cleanIban.includes("MMEB")) {
        setBic("MMEBMTMT")
      }
    }
  }

  const handleIbanChange = (value: string) => {
    setIban(value)
    validateIban(value)
  }

  const handleSubmit = async () => {
    if (!confirmBusiness || !confirmAuthorized || !confirmTerms) {
      toast({
        title: "Confirmation Required",
        description: "Please confirm all required checkboxes",
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
      title: "Bank Account Added",
      description: "Verification deposits will be sent within 1-3 business days",
    })

    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Bank Account</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Account Details</h3>

            <div className="space-y-2">
              <Label htmlFor="accountHolder">Account Holder Name *</Label>
              <Input
                id="accountHolder"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Business name"
              />
              <p className="text-sm text-muted-foreground">Must match the name on your business bank account</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="iban">IBAN *</Label>
              <Input
                id="iban"
                value={iban}
                onChange={(e) => handleIbanChange(e.target.value)}
                placeholder="MT84 VALL 2201 3000 0000 1234 5678 9034"
              />
              {ibanValid === true && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Valid IBAN - Malta • Bank detected
                </div>
              )}
              {ibanValid === false && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  Invalid IBAN - Please check the number
                </div>
              )}
              <p className="text-sm text-muted-foreground">International Bank Account Number</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bic">BIC / SWIFT Code (Optional)</Label>
              <Input id="bic" value={bic} onChange={(e) => setBic(e.target.value)} placeholder="VALLMTMT" />
              {bic && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Auto-filled from IBAN
                </div>
              )}
              <p className="text-sm text-muted-foreground">Will be auto-detected from IBAN if possible</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                  <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                  <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">Verification</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs mt-0.5">
                  •
                </div>
                <div className="flex-1">
                  <p className="font-medium">Micro-deposits (1-3 business days)</p>
                  <p className="text-sm text-muted-foreground">
                    We'll send 2 small deposits to your account. You'll confirm the amounts to verify ownership.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 opacity-50">
                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground flex items-center justify-center text-xs mt-0.5">
                  ○
                </div>
                <div className="flex-1">
                  <p className="font-medium">Instant verification (Phase 2)</p>
                  <p className="text-sm text-muted-foreground">
                    Connect your bank instantly via secure provider [Coming soon]
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">Security & Compliance</h3>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="confirmBusiness"
                  checked={confirmBusiness}
                  onCheckedChange={(checked) => setConfirmBusiness(checked as boolean)}
                />
                <Label htmlFor="confirmBusiness" className="font-normal cursor-pointer">
                  I confirm this is a business bank account
                </Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="confirmAuthorized"
                  checked={confirmAuthorized}
                  onCheckedChange={(checked) => setConfirmAuthorized(checked as boolean)}
                />
                <Label htmlFor="confirmAuthorized" className="font-normal cursor-pointer">
                  I am authorized to add this account
                </Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="confirmTerms"
                  checked={confirmTerms}
                  onCheckedChange={(checked) => setConfirmTerms(checked as boolean)}
                />
                <Label htmlFor="confirmTerms" className="font-normal cursor-pointer">
                  I have read the SEPA mandate terms
                </Label>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-muted rounded-md">
              <Lock className="h-4 w-4 mt-0.5" />
              <p className="text-sm">
                Your bank details are encrypted and securely stored. Only the last 4 digits will be visible.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !ibanValid}>
            {isSubmitting ? "Adding..." : "Add Bank Account"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
