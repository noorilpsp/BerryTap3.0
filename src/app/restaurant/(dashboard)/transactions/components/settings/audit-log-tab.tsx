import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Download } from "lucide-react"

export function AuditLogTab() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>View all transaction-related activities</CardDescription>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search audit log..." className="pl-9" />
          </div>
          <Select defaultValue="30days">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="view">View</SelectItem>
              <SelectItem value="export">Export</SelectItem>
              <SelectItem value="refund">Refund</SelectItem>
              <SelectItem value="dispute">Dispute</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="allusers">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="allusers">All Users</SelectItem>
              <SelectItem value="me">Me Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Audit Log Table */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">Nov 20, 3:45 PM</div>
                    <div className="text-xs text-muted-foreground">2 mins ago</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-xs text-muted-foreground">Manager</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">Refund Issued</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>Transaction: tx_001</p>
                    <p className="text-muted-foreground">Amount: €45.50</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">Nov 20, 3:30 PM</div>
                    <div className="text-xs text-muted-foreground">17 mins ago</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">Michael Chen</p>
                    <p className="text-xs text-muted-foreground">Manager</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">Transaction Viewed</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>Transaction: tx_001</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">Nov 20, 2:15 PM</div>
                    <div className="text-xs text-muted-foreground">1 hour ago</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">Emma Rodriguez</p>
                    <p className="text-xs text-muted-foreground">Accountant</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">Data Exported</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>Format: CSV</p>
                    <p className="text-muted-foreground">1,234 rows</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">Nov 20, 9:00 AM</div>
                    <div className="text-xs text-muted-foreground">6 hours ago</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">System</p>
                    <p className="text-xs text-muted-foreground">Automated</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">Scheduled Export</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>Report: Daily Report</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">Showing 1-50 of 5,678 activities</div>
          <Button variant="outline">Load More</Button>
        </div>
      </CardContent>
    </Card>
  )
}
