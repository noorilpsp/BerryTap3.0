"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Plus, Star, Download, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AddBankModal } from "./components/add-bank-modal"
import { VerifyAccountModal } from "./components/verify-account-modal"
import { AccountDetailDrawer } from "./components/account-detail-drawer"
import { mockBankAccounts, mockBankEvents, mockBankingSummary } from "./data"
import type { BankAccount } from "./types"

export default function BankingPage() {
  const [accounts, setAccounts] = useState(mockBankAccounts)
  const [events] = useState(mockBankEvents)
  const [summary] = useState(mockBankingSummary)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)

  const handleViewDetails = (account: BankAccount) => {
    setSelectedAccount(account)
    setDetailDrawerOpen(true)
  }

  const handleVerifyClick = (account: BankAccount) => {
    setSelectedAccount(account)
    setVerifyModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="default" className="gap-1">
            ✅ Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            ⏳ Pending Verification
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1">
            ❌ Failed
          </Badge>
        )
      default:
        return null
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "account_added":
        return "🏦"
      case "account_verified":
        return "✅"
      case "default_set":
        return "⭐"
      case "payout_succeeded":
        return "✅"
      case "verification_sent":
        return "📤"
      default:
        return "•"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Banking</h1>
        </div>
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bank Account
        </Button>
      </div>

      {/* Default Account Summary */}
      {summary.defaultAccount && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase">Default Payout Account</h2>
                <Badge variant="secondary" className="gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Default
                </Badge>
              </div>

              <div>
                <p className="text-lg font-semibold">
                  {summary.defaultAccount.bankName} • {summary.defaultAccount.ibanMasked} •{" "}
                  {summary.defaultAccount.currency}
                </p>
                <p className="text-muted-foreground">{summary.defaultAccount.accountHolder}</p>
              </div>

              <div className="flex items-center gap-6 text-sm pt-4 border-t">
                {summary.nextPayout && (
                  <div>
                    <span className="text-muted-foreground">Next Payout:</span>{" "}
                    <span className="font-medium">
                      {summary.nextPayout.date} • Est. €{summary.nextPayout.estimatedAmount.toFixed(2)}
                    </span>
                    <Button variant="link" className="h-auto p-0 ml-2">
                      View Payouts →
                    </Button>
                  </div>
                )}
                {summary.lastPayout && (
                  <div>
                    <span className="text-muted-foreground">Last Payout:</span>{" "}
                    <span className="font-medium">
                      {summary.lastPayout.date} • €{summary.lastPayout.amount.toFixed(2)} • Successful
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bank Accounts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Bank Accounts ({accounts.length})</h2>
        </div>

        <div className="grid gap-4">
          {accounts.map((account) => (
            <Card key={account.bankAccountId}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      {account.isDefault && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Default
                        </Badge>
                      )}
                      {getStatusBadge(account.status)}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(account)}>View Details</DropdownMenuItem>
                        {!account.isDefault && account.status === "verified" && (
                          <DropdownMenuItem>Set as Default</DropdownMenuItem>
                        )}
                        <DropdownMenuItem>Download Mandate</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Remove Account</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {account.bankName}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Account Holder</p>
                      <p className="font-medium">{account.accountHolder}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">BIC / SWIFT</p>
                      <p className="font-medium">{account.bic}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">IBAN</p>
                      <p className="font-medium">{account.ibanMasked}</p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <div className="space-y-1">
                        {getStatusBadge(account.status)}
                        {account.status === "verified" && account.verification.verifiedAt && (
                          <p className="text-sm text-muted-foreground">
                            Verified on {new Date(account.verification.verifiedAt).toLocaleDateString()}
                          </p>
                        )}
                        {account.status === "pending" && (
                          <p className="text-sm text-muted-foreground">Micro-deposits sent Nov 18</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {account.status === "pending" && (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-md">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⓘ Waiting for verification - Check your bank statement and confirm the two small deposit amounts
                        below.
                      </p>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    Added by {account.addedByName} • {new Date(account.addedAt).toLocaleDateString()}
                  </div>

                  <div className="flex gap-2 pt-2 border-t">
                    {account.status === "pending" && (
                      <Button variant="default" size="sm" onClick={() => handleVerifyClick(account)}>
                        Verify Now
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(account)}>
                      View Details
                    </Button>
                    {account.documents.length > 0 && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Mandate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Bank Events */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Bank Events ({events.length})</h2>
          <Button variant="link">View All →</Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {events.map((event) => (
                <div key={event.eventId} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getEventIcon(event.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{event.message}</p>
                          {event.details?.payoutId && (
                            <Button variant="link" className="h-auto p-0 text-xs">
                              View Payout →
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(event.createdAt).toLocaleDateString()} •{" "}
                          {new Date(event.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddBankModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={() => {
          // Refresh accounts list
        }}
      />

      <VerifyAccountModal
        open={verifyModalOpen}
        onOpenChange={setVerifyModalOpen}
        account={selectedAccount}
        onSuccess={() => {
          // Refresh accounts list
        }}
      />

      <AccountDetailDrawer open={detailDrawerOpen} onOpenChange={setDetailDrawerOpen} account={selectedAccount} />
    </div>
  )
}
