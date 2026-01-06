"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription
} from "@/components/ui/drawer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { MapPin, Phone, Cake, Mail, Edit, MessageSquare, DollarSign, ShoppingBag, Calendar, TrendingUp, Star, AlertCircle, CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

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

interface CustomerProfileDrawerProps {
  customer: Customer | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const spendingTrendData = [
  { month: "Jan", amount: 320 },
  { month: "Feb", amount: 380 },
  { month: "Mar", amount: 420 },
  { month: "Apr", amount: 360 },
  { month: "May", amount: 450 },
  { month: "Jun", amount: 410 },
]

const favoriteItems = [
  { name: "Grilled Salmon", orders: 23, revenue: 1127, percentage: 85 },
  { name: "Caesar Salad", orders: 18, revenue: 432, percentage: 68 },
  { name: "Ribeye Steak", orders: 15, revenue: 1125, percentage: 55 },
  { name: "Chocolate Cake", orders: 12, revenue: 288, percentage: 45 },
  { name: "Pinot Noir", orders: 9, revenue: 315, percentage: 35 },
]

const recentOrders = [
  { date: "Nov 13", items: "Salmon, Salad", total: 48.50, type: "Dine-In", status: "Complete" },
  { date: "Nov 10", items: "Steak, Wine", total: 67.30, type: "Dine-In", status: "Complete" },
  { date: "Nov 7", items: "Salad, Cake", total: 34.20, type: "Takeout", status: "Complete" },
  { date: "Nov 4", items: "Salmon, Wine", total: 52.80, type: "Dine-In", status: "Complete" },
  { date: "Nov 1", items: "Steak, Salad", total: 61.40, type: "Dine-In", status: "Complete" },
]

const reviews = [
  { rating: 5, comment: "Amazing salmon! Always fresh.", date: "Nov 10, 2024" },
  { rating: 4, comment: "Great service, will return.", date: "Oct 28, 2024" },
  { rating: 5, comment: "Best restaurant in SF!", date: "Oct 15, 2024" },
]

export function CustomerProfileDrawer({ customer, open, onOpenChange }: CustomerProfileDrawerProps) {
  if (!customer) return null

  const chartConfig = {
    amount: {
      label: "Spend",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <Drawer 
      open={open} 
      onClose={() => onOpenChange(false)}
      title="Customer Profile"
      subtitle="View detailed customer information"
      side="right"
    >
      <div className="space-y-6">
        {/* Customer Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${customer.name}`}
                    alt={customer.name}
                  />
                  <AvatarFallback>{customer.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold mb-2">{customer.name.toUpperCase()}</h2>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {customer.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {customer.location}, CA
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      (415) 555-0123
                    </div>
                    <div className="flex items-center gap-2">
                      <Cake className="w-4 h-4" />
                      Birthday: March 15
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Message
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                {customer.segment}
              </Badge>
              <Badge variant="outline">Regular Diner</Badge>
              <Badge variant="outline">Wine Enthusiast</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold text-green-600">${customer.spend.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground mt-1">Lifetime Value</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{customer.orders}</div>
                <div className="text-xs text-muted-foreground mt-1">Total Orders</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">2.1/week</div>
                <div className="text-xs text-muted-foreground mt-1">Frequency</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">94.6%</div>
                <div className="text-xs text-muted-foreground mt-1">Retention</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spending Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendingTrendData}>
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Favorite Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Favorite Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {favoriteItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {index + 1}. {item.name}
                  </span>
                  <span className="text-muted-foreground">
                    {item.orders} orders · ${item.revenue.toLocaleString()}
                  </span>
                </div>
                <Progress value={item.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Dietary Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Dietary Preferences & Allergens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>Vegetarian-friendly options preferred</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>No shellfish</AlertDescription>
            </Alert>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>No peanuts</AlertDescription>
            </Alert>
            <Alert>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>Gluten-free options acceptable</AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Recent Orders (Last 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm">{order.date}</TableCell>
                    <TableCell className="text-sm">{order.items}</TableCell>
                    <TableCell className="text-sm font-semibold">${order.total.toFixed(2)}</TableCell>
                    <TableCell className="text-sm">{order.type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="link" className="w-full mt-2">
              View All Orders →
            </Button>
          </CardContent>
        </Card>

        {/* Feedback & Reviews */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4" />
              Feedback & Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviews.map((review, index) => (
              <div key={index} className="space-y-1 pb-3 border-b last:border-b-0">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "fill-amber-500 text-amber-500" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm">{review.comment}</p>
                <p className="text-xs text-muted-foreground">{review.date}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Customer hasn't visited in {customer.lastVisitDays} days - send re-engagement offer</p>
            <p>• Approaching VIP anniversary - consider special recognition</p>
            <p>• Favorite item (Salmon) has new seasonal preparation - notify</p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button className="flex-1">
            <DollarSign className="w-4 h-4 mr-2" />
            Send Targeted Offer
          </Button>
          <Button variant="outline" className="flex-1">
            <Edit className="w-4 h-4 mr-2" />
            Add Note
          </Button>
          <Button variant="outline" className="flex-1">
            <Calendar className="w-4 h-4 mr-2" />
            Export Profile
          </Button>
        </div>
      </div>
    </Drawer>
  )
}
