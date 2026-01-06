"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Crown, AlertTriangle, TrendingUp, Star, ThumbsUp, ThumbsDown, Target, Mail, MessageSquare, Download, BarChart3, Gift, ArrowRight, Calendar, DollarSign, Users, ShoppingBag } from 'lucide-react'

// Top 10 VIP Customers Data
const topVIPCustomers = [
  { name: "Sarah Johnson", spend: 4287.50, orders: 34, lastVisit: "2 days ago", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
  { name: "Michael Chen", spend: 3892.30, orders: 28, lastVisit: "5 days ago", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
  { name: "Emma Davis", spend: 3645.80, orders: 31, lastVisit: "1 day ago", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
  { name: "David Rodriguez", spend: 3421.60, orders: 26, lastVisit: "3 days ago", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
  { name: "Lisa Wang", spend: 3198.40, orders: 29, lastVisit: "Today", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa" },
  { name: "James Anderson", spend: 2987.20, orders: 24, lastVisit: "4 days ago", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James" },
  { name: "Maria Garcia", spend: 2845.90, orders: 27, lastVisit: "6 days ago", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" },
  { name: "Robert Taylor", spend: 2734.60, orders: 22, lastVisit: "8 days ago", status: "at-risk", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert" },
  { name: "Jennifer Lee", spend: 2621.40, orders: 25, lastVisit: "2 days ago", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer" },
  { name: "Christopher Brown", spend: 2498.80, orders: 23, lastVisit: "7 days ago", status: "active", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Christopher" },
]

const behavioralAlerts = [
  {
    priority: "high",
    title: "VIP customers haven't visited in 30+ days",
    count: 47,
    type: "Churn Risk",
    action: "Take Action",
  },
  {
    priority: "medium",
    title: "Regular customers approaching High-Value threshold",
    count: 23,
    type: "Upsell Opportunity",
    action: "Send Promotion",
  },
  {
    priority: "medium",
    title: "Customers with negative review sentiment",
    count: 12,
    type: "Feedback",
    action: "Review Feedback",
  },
  {
    priority: "low",
    title: "Customers with upcoming birthdays this month",
    count: 156,
    type: "Birthday",
    action: "Send Birthday Offer",
  },
]

const reviewSentiment = {
  overall: 4.6,
  positive: { count: 234, percentage: 87.3 },
  neutral: { count: 18, percentage: 6.7 },
  negative: { count: 12, percentage: 4.5 },
  topCompliments: [
    { text: "Amazing food quality", count: 89 },
    { text: "Excellent service", count: 76 },
    { text: "Great atmosphere", count: 54 },
  ],
  commonConcerns: [
    { text: "Wait time too long", count: 8 },
    { text: "Portion size small", count: 5 },
  ],
}

const recommendations = [
  {
    title: "Re-engage At-Risk VIPs",
    description: "Send personalized offer to 47 customers who haven't visited in 30+ days",
    action: "Create Campaign",
    icon: Target,
  },
  {
    title: "Boost Regular to High-Value",
    description: "Target 23 customers near $500 threshold with special promotion",
    action: "Send Promotion",
    icon: TrendingUp,
  },
  {
    title: "Address Negative Feedback",
    description: "Follow up with 12 customers who left negative reviews",
    action: "Contact Customers",
    icon: MessageSquare,
  },
  {
    title: "Birthday Campaign",
    description: "Send birthday offers to 156 customers this month",
    action: "Create Campaign",
    icon: Gift,
  },
]

const activePromotions = [
  {
    name: "VIP Appreciation Week",
    targeted: 184,
    redeemed: 67,
    rate: 36.4,
    revenue: 8940,
    endsIn: "3 days",
  },
  {
    name: "New Customer Welcome",
    targeted: 234,
    redeemed: 89,
    rate: 38.0,
    revenue: 2670,
    endsIn: "12 days",
  },
]

interface InsightsSidebarProps {
  onCustomerClick?: (customerName: string) => void
}

export function InsightsSidebar({ onCustomerClick }: InsightsSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Crown className="w-5 h-5 text-amber-500" />
            Top Customers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topVIPCustomers.slice(0, 3).map((customer, index) => (
            <div
              key={index}
              className="group p-3 rounded-lg border border-border hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
              onClick={() => onCustomerClick?.(customer.name)}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-background">
                  <AvatarImage src={customer.avatar || "/placeholder.svg"} alt={customer.name} />
                  <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{customer.name}</p>
                    {customer.status === "active" && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 bg-green-500/10 text-green-700 dark:text-green-400">
                        Active
                      </Badge>
                    )}
                    {customer.status === "at-risk" && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5 bg-orange-500/10 text-orange-700 dark:text-orange-400">
                        At Risk
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    ${customer.spend.toLocaleString()} • {customer.orders} orders
                  </p>
                  <p className="text-xs text-muted-foreground">Last visit: {customer.lastVisit}</p>
                  <Button
                    variant="link"
                    className="h-auto p-0 mt-1 text-xs group-hover:underline"
                    onClick={(e) => {
                      e.stopPropagation()
                      onCustomerClick?.(customer.name)
                    }}
                  >
                    View Profile <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2">
            View All Top Customers <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Behavioral Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Behavioral Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {behavioralAlerts.map((alert, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-l-4 ${
                alert.priority === "high"
                  ? "border-l-red-500 bg-red-500/5"
                  : alert.priority === "medium"
                  ? "border-l-orange-500 bg-orange-500/5"
                  : "border-l-green-500 bg-green-500/5"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  {alert.priority === "high" ? "🔴 HIGH PRIORITY" : alert.priority === "medium" ? "🟡 MEDIUM PRIORITY" : "🟢 LOW PRIORITY"}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {alert.count}
                </Badge>
              </div>
              <p className="text-sm font-medium mb-2">{alert.title}</p>
              <Button size="sm" variant="outline" className="w-full mt-1 h-8 text-xs">
                {alert.action} <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Review Sentiment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="w-5 h-5 text-amber-500" />
            Review Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-1">Overall Sentiment:</p>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.floor(reviewSentiment.overall)
                        ? "fill-amber-500 text-amber-500"
                        : star - 0.5 <= reviewSentiment.overall
                        ? "fill-amber-500/50 text-amber-500"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-lg">{reviewSentiment.overall}/5.0</span>
            </div>

            <div className="space-y-2 mb-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Positive</span>
                  <span className="text-xs font-semibold">{reviewSentiment.positive.percentage}%</span>
                </div>
                <Progress value={reviewSentiment.positive.percentage} className="h-2 bg-muted [&>div]:bg-green-500" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Neutral</span>
                  <span className="text-xs font-semibold">{reviewSentiment.neutral.percentage}%</span>
                </div>
                <Progress value={reviewSentiment.neutral.percentage} className="h-2 bg-muted [&>div]:bg-gray-500" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Negative</span>
                  <span className="text-xs font-semibold">{reviewSentiment.negative.percentage}%</span>
                </div>
                <Progress value={reviewSentiment.negative.percentage} className="h-2 bg-muted [&>div]:bg-red-500" />
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg mb-3">
              <p className="text-xs font-semibold mb-2">Recent Reviews (Last 30 days):</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p>• {reviewSentiment.positive.count} positive reviews</p>
                <p>• {reviewSentiment.neutral.count} neutral reviews</p>
                <p>• {reviewSentiment.negative.count} negative reviews</p>
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs font-semibold mb-2">Top Compliments:</p>
              <div className="space-y-2">
                {reviewSentiment.topCompliments.map((compliment, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <ThumbsUp className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                    <span className="flex-1">{compliment.text}</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                      {compliment.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs font-semibold mb-2">Common Concerns:</p>
              <div className="space-y-2">
                {reviewSentiment.commonConcerns.map((concern, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <ThumbsDown className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                    <span className="flex-1">{concern.text}</span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                      {concern.count}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <Button variant="outline" className="w-full" size="sm">
              View All Reviews <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actionable Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-blue-500" />
            Actionable Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon
            return (
              <div key={index} className="p-3 rounded-lg border border-border hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-1">{index + 1}. {rec.title}</p>
                    <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                    <Button size="sm" variant="outline" className="w-full h-8 text-xs">
                      {rec.action} <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Promotion Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Promotion Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-medium mb-3">Current Active Promotions:</p>
          {activePromotions.map((promo, index) => (
            <div key={index} className="p-3 rounded-lg border border-border">
              <div className="flex items-start gap-2 mb-3">
                <Gift className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm mb-1">{promo.name}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">• {promo.targeted} customers targeted</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    • {promo.redeemed} redemptions ({promo.rate}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">• ${promo.revenue.toLocaleString()} revenue generated</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">• Ends in {promo.endsIn}</span>
                </div>
              </div>
              <Progress value={promo.rate} className="h-1.5 mt-3" />
            </div>
          ))}
          <Button variant="outline" className="w-full mt-2">
            View All Promotions <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            ⚡ Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2">
          <Button variant="outline" className="justify-start h-12">
            <Mail className="w-4 h-4 mr-3" />
            Send Email Campaign
          </Button>
          <Button variant="outline" className="justify-start h-12">
            <MessageSquare className="w-4 h-4 mr-3" />
            Send SMS Promotion
          </Button>
          <Button variant="outline" className="justify-start h-12">
            <Download className="w-4 h-4 mr-3" />
            Export Customer Data
          </Button>
          <Button variant="outline" className="justify-start h-12">
            <Gift className="w-4 h-4 mr-3" />
            Create New Promotion
          </Button>
          <Button variant="outline" className="justify-start h-12">
            <BarChart3 className="w-4 h-4 mr-3" />
            View Full Analytics
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
