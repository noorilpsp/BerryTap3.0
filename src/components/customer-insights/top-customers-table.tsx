"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpDown, Search, Download, Zap, MapPin, Crown } from 'lucide-react'
import { CustomerProfileDrawer } from "./customer-profile-drawer"

interface Customer {
  rank: number
  name: string
  email: string
  location: string
  spend: number
  spendDelta: number
  orders: number
  lastVisit: string
  lastVisitDays: number
  segment: "VIP" | "High-Value" | "Regular" | "New"
}

const mockCustomers: Customer[] = [
  { rank: 1, name: "Sarah Johnson", email: "sarah.j@email.com", location: "San Francisco", spend: 4287.50, spendDelta: 12.3, orders: 34, lastVisit: "2 days ago", lastVisitDays: 2, segment: "VIP" },
  { rank: 2, name: "Michael Chen", email: "mchen@email.com", location: "Oakland", spend: 3892.30, spendDelta: 8.7, orders: 28, lastVisit: "5 days ago", lastVisitDays: 5, segment: "VIP" },
  { rank: 3, name: "Emma Davis", email: "emma.davis@email.com", location: "San Francisco", spend: 3645.80, spendDelta: 15.2, orders: 31, lastVisit: "1 day ago", lastVisitDays: 1, segment: "VIP" },
  { rank: 4, name: "David Rodriguez", email: "d.rodriguez@email.com", location: "Berkeley", spend: 3421.60, spendDelta: 6.4, orders: 26, lastVisit: "3 days ago", lastVisitDays: 3, segment: "High-Value" },
  { rank: 5, name: "Lisa Wang", email: "lisa.wang@email.com", location: "San Jose", spend: 3198.40, spendDelta: 11.8, orders: 29, lastVisit: "Today", lastVisitDays: 0, segment: "VIP" },
  { rank: 6, name: "James Anderson", email: "j.anderson@email.com", location: "San Francisco", spend: 2987.20, spendDelta: 9.2, orders: 24, lastVisit: "4 days ago", lastVisitDays: 4, segment: "High-Value" },
  { rank: 7, name: "Maria Garcia", email: "maria.g@email.com", location: "Oakland", spend: 2845.90, spendDelta: 7.5, orders: 27, lastVisit: "6 days ago", lastVisitDays: 6, segment: "VIP" },
  { rank: 8, name: "Robert Taylor", email: "robert.t@email.com", location: "Berkeley", spend: 2734.60, spendDelta: 5.8, orders: 22, lastVisit: "8 days ago", lastVisitDays: 8, segment: "High-Value" },
  { rank: 9, name: "Jennifer Lee", email: "jennifer.lee@email.com", location: "San Francisco", spend: 2621.40, spendDelta: 10.3, orders: 25, lastVisit: "2 days ago", lastVisitDays: 2, segment: "High-Value" },
  { rank: 10, name: "Christopher Brown", email: "chris.brown@email.com", location: "San Jose", spend: 2498.80, spendDelta: 6.9, orders: 23, lastVisit: "7 days ago", lastVisitDays: 7, segment: "High-Value" },
  { rank: 11, name: "Amanda White", email: "amanda.w@email.com", location: "San Francisco", spend: 2387.50, spendDelta: 8.1, orders: 21, lastVisit: "3 days ago", lastVisitDays: 3, segment: "High-Value" },
  { rank: 12, name: "Daniel Martinez", email: "daniel.m@email.com", location: "Oakland", spend: 2276.30, spendDelta: 4.5, orders: 20, lastVisit: "5 days ago", lastVisitDays: 5, segment: "High-Value" },
  { rank: 13, name: "Jessica Thompson", email: "jessica.t@email.com", location: "Berkeley", spend: 2165.20, spendDelta: 3.2, orders: 19, lastVisit: "9 days ago", lastVisitDays: 9, segment: "Regular" },
  { rank: 14, name: "Matthew Harris", email: "matthew.h@email.com", location: "San Francisco", spend: 2054.10, spendDelta: 5.7, orders: 18, lastVisit: "4 days ago", lastVisitDays: 4, segment: "High-Value" },
  { rank: 15, name: "Ashley Clark", email: "ashley.c@email.com", location: "San Jose", spend: 1943.80, spendDelta: 7.3, orders: 17, lastVisit: "6 days ago", lastVisitDays: 6, segment: "Regular" },
  { rank: 16, name: "Joshua Lewis", email: "joshua.l@email.com", location: "Oakland", spend: 1832.70, spendDelta: 2.8, orders: 16, lastVisit: "8 days ago", lastVisitDays: 8, segment: "Regular" },
  { rank: 17, name: "Samantha Walker", email: "samantha.w@email.com", location: "San Francisco", spend: 1721.60, spendDelta: 6.1, orders: 15, lastVisit: "2 days ago", lastVisitDays: 2, segment: "Regular" },
  { rank: 18, name: "Andrew Hall", email: "andrew.h@email.com", location: "Berkeley", spend: 1610.50, spendDelta: 4.9, orders: 14, lastVisit: "7 days ago", lastVisitDays: 7, segment: "Regular" },
  { rank: 19, name: "Nicole Young", email: "nicole.y@email.com", location: "San Jose", spend: 1499.40, spendDelta: 3.6, orders: 13, lastVisit: "5 days ago", lastVisitDays: 5, segment: "Regular" },
  { rank: 20, name: "Kevin King", email: "kevin.k@email.com", location: "Oakland", spend: 1388.30, spendDelta: 2.1, orders: 12, lastVisit: "10 days ago", lastVisitDays: 10, segment: "Regular" },
]

interface TopCustomersTableProps {
  onCustomerClick?: (customerName: string) => void
}

export function TopCustomersTable({ onCustomerClick }: TopCustomersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"spend" | "orders" | "lastVisit">("spend")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const filteredCustomers = mockCustomers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return rank.toString()
  }

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case "VIP":
        return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
      case "High-Value":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
      case "Regular":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20"
      case "New":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
      default:
        return ""
    }
  }

  const getLastVisitColor = (days: number) => {
    if (days === 0) return "text-green-600 dark:text-green-400"
    if (days < 7) return "text-green-600 dark:text-green-400"
    if (days < 14) return "text-yellow-600 dark:text-yellow-400"
    if (days <= 30) return "text-orange-600 dark:text-orange-400"
    return "text-red-600 dark:text-red-400"
  }

  const handleViewCustomer = (customer: Customer) => {
    if (onCustomerClick) {
      onCustomerClick(customer.name)
    } else {
      setSelectedCustomer(customer)
      setDrawerOpen(true)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Crown className="w-5 h-5 text-amber-500" />
              Top Customers
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 md:flex-initial md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="default">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort: {sortBy === "spend" ? "Total Spend" : sortBy === "orders" ? "Orders" : "Last Visit"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy("spend")}>Total Spend</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("orders")}>Orders</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("lastVisit")}>Last Visit</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="default">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                  <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead className="min-w-[280px]">Customer</TableHead>
                  <TableHead className="w-[140px]">Total Spend</TableHead>
                  <TableHead className="w-[120px]">Orders</TableHead>
                  <TableHead className="w-[140px]">Last Visit</TableHead>
                  <TableHead className="w-[130px]">Segment</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow
                    key={customer.rank}
                    className="hover:bg-accent/10 transition-colors cursor-pointer"
                  >
                    <TableCell className="font-bold text-sm">
                      {getRankIcon(customer.rank)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}`}
                            alt={customer.name}
                          />
                          <AvatarFallback>{customer.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold text-base">{customer.name}</span>
                          <span className="text-sm text-muted-foreground">{customer.email}</span>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {customer.location}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-lg text-green-600 dark:text-green-400">
                          ${customer.spend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <Badge variant="outline" className="w-fit mt-1 text-xs border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400">
                          ↗ +{customer.spendDelta}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{customer.orders} orders</span>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getLastVisitColor(customer.lastVisitDays)}`}>
                        {customer.lastVisit}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getSegmentColor(customer.segment)}>
                        {customer.segment}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Zap className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {!onCustomerClick && (
        <CustomerProfileDrawer
          customer={selectedCustomer}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      )}
    </>
  )
}
