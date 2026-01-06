"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, X, Plus } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface PermissionsSettingsTabProps {
  onSettingsChange: () => void
}

export function PermissionsSettingsTab({ onSettingsChange }: PermissionsSettingsTabProps) {
  return (
    <div className="space-y-6">
      {/* Roles */}
      <Card>
        <CardHeader>
          <CardTitle>Roles & Permissions</CardTitle>
          <CardDescription>Manage user roles and their access levels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Owner Role */}
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Owner</h3>
              <Badge>System Role</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Full access to all transaction features</p>

            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>View all transactions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Process refunds (any amount)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Manage disputes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Export data</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Manage settings</span>
              </div>
            </div>

            <Button variant="outline" size="sm">
              Edit Role
            </Button>
          </div>

          {/* Manager Role */}
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Manager</h3>
              <Badge variant="outline">Custom</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Can manage transactions and process refunds with limits</p>

            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>View all transactions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Process refunds (up to €500 per transaction)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Manage disputes (view and respond)</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">View sensitive data</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Manage settings</span>
              </div>
            </div>

            <div className="text-sm">
              <p className="font-medium">Additional restrictions:</p>
              <ul className="ml-4 mt-1 list-disc space-y-1 text-muted-foreground">
                <li>Requires PIN for refunds over €100</li>
                <li>Cannot delete transactions</li>
                <li>Access assigned locations only</li>
              </ul>
            </div>

            <Button variant="outline" size="sm" onClick={onSettingsChange}>
              Edit Role
            </Button>
          </div>

          {/* Accountant Role */}
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Accountant</h3>
              <Badge variant="outline">Custom</Badge>
            </div>
            <p className="text-sm text-muted-foreground">View-only access for financial review and reporting</p>

            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>View all transactions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>Export data</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-success" />
                <span>View audit logs</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Process refunds</span>
              </div>
              <div className="flex items-center gap-2">
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Manage settings</span>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={onSettingsChange}>
              Edit Role
            </Button>
          </div>

          <Button variant="outline" className="w-full bg-transparent">
            <Plus className="mr-2 h-4 w-4" />
            Create Custom Role
          </Button>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage user assignments and access</CardDescription>
            </div>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Invite
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Access</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">sarah.johnson@berrytap.com</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge>Owner</Badge>
                </TableCell>
                <TableCell>All locations</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div>
                    <p className="font-medium">Michael Chen</p>
                    <p className="text-sm text-muted-foreground">michael.chen@berrytap.com</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">Manager</Badge>
                </TableCell>
                <TableCell>Valletta Main, Sliema</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={onSettingsChange}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div>
                    <p className="font-medium">Emma Rodriguez</p>
                    <p className="text-sm text-muted-foreground">emma.r@berrytap.com</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">Accountant</Badge>
                </TableCell>
                <TableCell>All locations (view only)</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={onSettingsChange}>
                    Edit
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
