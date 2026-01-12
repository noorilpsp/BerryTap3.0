"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, Mail, Star, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { BankAccount } from "../types"

interface AccountDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account: BankAccount | null
}

export function AccountDetailDrawer({ open, onOpenChange, account }: AccountDetailDrawerProps) {
  const { toast } = useToast()

  if (!account) return null

  const copyIban = () => {
    toast({
      title: "Copied to clipboard",
      description: "IBAN copied to clipboard",
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Bank Account Details</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center gap-2 flex-wrap">
            {account.isDefault && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3 fill-current" />
                Default Account
              </Badge>
            )}
            <Badge
              variant={
                account.status === "verified" ? "default" : account.status === "pending" ? "secondary" : "destructive"
              }
            >
              {account.status === "verified" && "✅ Verified"}
              {account.status === "pending" && "⏳ Pending Verification"}
              {account.status === "failed" && "❌ Failed"}
            </Badge>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">Account Information</h3>

            <div className="grid gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Bank Name</p>
                <p className="font-medium">{account.bankName}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Account Holder</p>
                <p className="font-medium">{account.accountHolder}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">IBAN</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{account.ibanMasked}</p>
                  <Button variant="ghost" size="sm" onClick={copyIban}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">BIC / SWIFT</p>
                <p className="font-medium">{account.bic}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Currency</p>
                <p className="font-medium">{account.currency} (€)</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">Status</h3>

            <div className="space-y-3">
              {account.status === "verified" && (
                <>
                  <div>
                    <p className="text-sm font-medium text-green-600">✅ Verified</p>
                    <p className="text-sm text-muted-foreground">
                      Verified on {new Date(account.verification.verifiedAt!).toLocaleDateString()} at{" "}
                      {new Date(account.verification.verifiedAt!).toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Verification method: Micro-deposits</p>
                  </div>

                  {account.isDefault && (
                    <div>
                      <p className="text-sm font-medium">⭐ Default payout account</p>
                      <p className="text-sm text-muted-foreground">
                        Set as default on {new Date(account.addedAt).toLocaleDateString()} by {account.addedByName}
                      </p>
                    </div>
                  )}
                </>
              )}

              {account.status === "pending" && (
                <div>
                  <p className="text-sm font-medium text-yellow-600">⏳ Pending Verification</p>
                  <p className="text-sm text-muted-foreground">Micro-deposits sent on Nov 18, 2024</p>
                  <p className="text-sm text-muted-foreground">Expected arrival: Nov 19-21, 2024</p>
                </div>
              )}
            </div>
          </div>

          {account.payoutSummary && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold">Payout History</h3>

              <div className="space-y-2">
                <p className="text-sm">
                  Total received: €{account.payoutSummary.totalReceived.toLocaleString()} (
                  {account.payoutSummary.payoutCount} payouts)
                </p>
                {account.payoutSummary.lastPayoutDate && (
                  <p className="text-sm text-muted-foreground">
                    Last payout: {account.payoutSummary.lastPayoutDate} • €
                    {account.payoutSummary.lastPayoutAmount?.toFixed(2)}
                  </p>
                )}
                {account.payoutSummary.nextPayoutDate && (
                  <p className="text-sm text-muted-foreground">
                    Next payout: {account.payoutSummary.nextPayoutDate} • Est. €
                    {account.payoutSummary.nextPayoutAmount?.toFixed(2)}
                  </p>
                )}

                <Button variant="link" className="h-auto p-0">
                  View All Payouts →
                </Button>
              </div>
            </div>
          )}

          {account.documents.length > 0 && (
            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold">Documents</h3>

              <div className="space-y-2">
                {account.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">Metadata</h3>

            <div className="text-sm space-y-1">
              <p>
                <span className="text-muted-foreground">Added by:</span> {account.addedByName}
              </p>
              <p>
                <span className="text-muted-foreground">Added on:</span> {new Date(account.addedAt).toLocaleString()}
              </p>
              <p>
                <span className="text-muted-foreground">Last updated:</span>{" "}
                {new Date(account.updatedAt).toLocaleString()}
              </p>
              <p>
                <span className="text-muted-foreground">Account ID:</span> {account.bankAccountId}
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Actions</h3>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Documents
              </Button>
              <Button variant="outline" size="sm">
                <Mail className="h-4 w-4 mr-2" />
                Email Details
              </Button>
              <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Account
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
