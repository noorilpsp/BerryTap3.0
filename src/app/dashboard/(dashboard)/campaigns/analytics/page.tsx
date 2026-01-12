"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart3,
  TrendingUp,
  Mail,
  MessageSquare,
  MessageCircle,
  Smartphone,
  Download,
  ChevronDown,
  Lightbulb,
  Target,
  Clock,
  Zap,
} from "lucide-react"
import { getAnalyticsData } from "./analytics-mock-data"

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30")
  const [channelFilter, setChannelFilter] = useState("all")

  const data = getAnalyticsData(dateRange, channelFilter)

  return (
    <div className="container mx-auto px-4 py-6 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">Campaign Analytics</h1>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
              <SelectItem value="365">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={channelFilter} onValueChange={setChannelFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="email">Email Only</SelectItem>
              <SelectItem value="sms">SMS Only</SelectItem>
              <SelectItem value="whatsapp">WhatsApp Only</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              <DropdownMenuItem>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem>Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Key Metrics Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.kpis.totalSent.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-success font-medium">+{data.kpis.totalSentChange}%</span>
              <span className="text-muted-foreground">vs prev period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{data.kpis.deliveryRate}%</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-success font-medium">+{data.kpis.deliveryRateChange}pp</span>
              <span className="text-muted-foreground">Industry: {data.kpis.industryDeliveryRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{data.kpis.openRate}%</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-success font-medium">+{data.kpis.openRateChange}pp</span>
              <span className="text-muted-foreground">Industry: {data.kpis.industryOpenRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-chart-5">{data.kpis.clickRate}%</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-success font-medium">+{data.kpis.clickRateChange}pp</span>
              <span className="text-muted-foreground">Industry: {data.kpis.industryClickRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.kpis.conversions.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-success font-medium">+{data.kpis.conversionsChange}%</span>
              <span className="text-muted-foreground">vs prev period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revenue Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">€{data.kpis.revenue.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-success font-medium">+€{data.kpis.revenueChange.toLocaleString()}</span>
              <span className="text-muted-foreground">vs prev period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{data.kpis.roi}%</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <TrendingUp className="w-4 h-4 text-success" />
              <span className="text-success font-medium">+{data.kpis.roiChange}pp</span>
              <span className="text-muted-foreground">Excellent</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unsubscribe Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.kpis.unsubscribeRate}%</div>
            <div className="flex items-center gap-1 mt-2 text-sm">
              <span className="text-muted-foreground">No change</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Over Time Chart */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Performance Over Time</CardTitle>
              <CardDescription>Track key metrics across campaigns</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                Sent
              </Button>
              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                Opens
              </Button>
              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                <div className="w-3 h-3 rounded-full bg-chart-5"></div>
                Clicks
              </Button>
              <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                Conversions
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <svg className="w-full h-full" viewBox="0 0 800 300">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <line
                  key={i}
                  x1="40"
                  y1={50 + i * 40}
                  x2="780"
                  y2={50 + i * 40}
                  stroke="currentColor"
                  strokeOpacity="0.1"
                />
              ))}

              {/* Line chart */}
              <polyline
                points="60,150 120,130 180,140 240,110 300,100 360,120 420,90 480,80 540,85 600,70 660,75 720,65"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
              />

              {/* X-axis labels */}
              {["Oct 22", "Oct 29", "Nov 5", "Nov 12", "Nov 19", "Nov 26"].map((label, i) => (
                <text
                  key={i}
                  x={60 + i * 132}
                  y="285"
                  fontSize="12"
                  fill="currentColor"
                  opacity="0.5"
                  textAnchor="middle"
                >
                  {label}
                </text>
              ))}
            </svg>
          </div>
          <div className="text-center text-sm text-muted-foreground mt-4">
            Peak: Nov 5 (Flash Sale) • 8,234 sent • 42% open rate • €15,678 revenue
          </div>
        </CardContent>
      </Card>

      {/* Channel Breakdown */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Channel Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.channels.map((channel) => (
            <Card key={channel.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {channel.name === "Email" && <Mail className="w-5 h-5 text-primary" />}
                    {channel.name === "SMS" && <MessageSquare className="w-5 h-5 text-success" />}
                    {channel.name === "In-App" && <Smartphone className="w-5 h-5 text-chart-5" />}
                    {channel.name === "WhatsApp" && <MessageCircle className="w-5 h-5 text-success" />}
                    {channel.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Sent:</span>{" "}
                  <span className="font-semibold">{channel.sent.toLocaleString()}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Delivered:</span>{" "}
                  <span className="font-semibold">
                    {channel.delivered.toLocaleString()} ({channel.deliveryRate}%)
                  </span>
                </div>
                {channel.opens !== null && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Opens:</span>{" "}
                    <span className="font-semibold">
                      {channel.opens.toLocaleString()} ({channel.openRate}%)
                    </span>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-muted-foreground">Clicks:</span>{" "}
                  <span className="font-semibold">
                    {channel.clicks.toLocaleString()} ({channel.clickRate}%)
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Conversions:</span>{" "}
                  <span className="font-semibold">
                    {channel.conversions.toLocaleString()} ({channel.conversionRate}%)
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Revenue:</span>{" "}
                  <span className="font-semibold">€{channel.revenue.toLocaleString()}</span>
                </div>
                <div className="text-sm pt-2 border-t">
                  <span className="text-muted-foreground">Cost:</span>{" "}
                  <span className="font-semibold">{channel.cost}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">ROI:</span>{" "}
                  <span className="font-semibold text-success">{channel.roi}</span>
                </div>
                {channel.status === "inactive" ? (
                  <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                    Complete Setup
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                    View Details
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Top Performing Campaigns */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Performing Campaigns</CardTitle>
              <CardDescription>Best campaigns by open rate and revenue</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All Campaigns
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Open Rate</TableHead>
                <TableHead>CTR</TableHead>
                <TableHead>Conv.</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.topCampaigns.map((campaign, index) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {index === 0 && <span className="text-xl">🏆</span>}
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {campaign.date} • {campaign.channels.join(" + ")}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{campaign.sent.toLocaleString()}</div>
                      {campaign.trend === "up" && (
                        <div className="text-xs text-success flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />#{index + 1}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold">{campaign.openRate}%</div>
                      {campaign.openTrend === "up" && (
                        <div className="text-xs text-success flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />+{campaign.openChange}pp
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold">{campaign.ctr}%</div>
                      <div className="text-xs text-muted-foreground">{campaign.ctrBenchmark}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold">{campaign.convRate}%</div>
                      {campaign.convTrend === "up" && (
                        <div className="text-xs text-success flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />+{campaign.convChange}pp
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-semibold">€{campaign.revenue.toLocaleString()}</div>
                      <div className="text-xs text-success">{campaign.revenueBenchmark}</div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Insights & Recommendations */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-warning" />
            <CardTitle>AI-Powered Insights</CardTitle>
          </div>
          <CardDescription>Automated recommendations to improve performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.insights.map((insight, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {insight.type === "success" && <TrendingUp className="w-5 h-5 text-success mt-0.5" />}
                  {insight.type === "opportunity" && <Target className="w-5 h-5 text-primary mt-0.5" />}
                  {insight.type === "warning" && <Clock className="w-5 h-5 text-warning mt-0.5" />}
                  {insight.type === "action" && <Zap className="w-5 h-5 text-chart-5 mt-0.5" />}
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
                <Badge variant={insight.impact === "High Impact" ? "default" : "secondary"}>{insight.impact}</Badge>
              </div>
              <Button variant="outline" size="sm">
                {insight.action}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
