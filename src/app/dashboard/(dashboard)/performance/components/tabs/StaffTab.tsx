"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Download, Settings, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts"
import { staffRadarMetrics, staffOrdersComparison, staffPerformanceDetailed, workloadHeatmap } from "../../lib/mockData"

export function StaffTab() {
  return (
    <div className="space-y-4">
      {/* Chart Row: Radar + Horizontal Bar */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Chart 6: Staff Efficiency Radar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Staff Performance Analysis</CardTitle>
              <CardDescription>Multi-Metric View</CardDescription>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Compare Staff" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Staff</SelectItem>
                <SelectItem value="top3">Top 3</SelectItem>
                <SelectItem value="servers">Servers Only</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={staffRadarMetrics}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Radar
                  name="Sarah (98%)"
                  dataKey="Sarah"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Mike (94%)"
                  dataKey="Mike"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Radar
                  name="Emma (91%)"
                  dataKey="Emma"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                  strokeDasharray="5 5"
                />
                <Radar
                  name="David (88%)"
                  dataKey="David"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.1}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="line"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-3 rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
              <span className="font-medium">💡 Insight:</span> Sarah leads in all metrics. Mike strong in consistency.
            </div>
          </CardContent>
        </Card>

        {/* Chart 7: Orders Handled Horizontal Bar */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Orders Handled Today</CardTitle>
              <CardDescription>Total: 683 orders | Team Avg: 85.4 orders/person</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Details</Button>
              <Select defaultValue="orders">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orders">Orders</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="efficiency">Efficiency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={staffOrdersComparison}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={80}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                  formatter={(value: any, name: string, props: any) => {
                    if (name === 'orders') {
                      return [
                        <div key="tooltip" className="space-y-1">
                          <div><strong>{value}</strong> orders</div>
                          <div className="text-xs">Efficiency: {props.payload.efficiency}%</div>
                          <div className="text-xs">Revenue: ${props.payload.revenue.toFixed(2)}</div>
                          <div className="text-xs">Tips: ${props.payload.tips.toFixed(2)}</div>
                        </div>,
                        ''
                      ]
                    }
                    return [value, name]
                  }}
                />
                <Bar dataKey="orders" radius={[0, 4, 4, 0]}>
                  {staffOrdersComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="orders"
                    position="right"
                    formatter={(value: number) => {
                      // Find the matching staff data by orders count
                      const staff = staffOrdersComparison.find(s => s.orders === value);
                      return staff ? `${value} (${staff.efficiency}%)` : value;
                    }}
                    style={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="text-muted-foreground">
                <span className="font-medium">Top Performer:</span> Sarah (+70% above average)
              </div>
              <div className="flex gap-3">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Excellent (&gt;90%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-muted-foreground">Good (80-90%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">Needs Support (&lt;80%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Performance Detailed Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Performance Breakdown - Full Details</CardTitle>
              <CardDescription>Click any row for comprehensive staff analytics dashboard</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm">Filter</Button>
              <Button variant="outline" size="sm">Columns</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Avg Time</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead className="text-right">Tips</TableHead>
                  <TableHead className="text-right">Performance</TableHead>
                  <TableHead className="text-right">Efficiency</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffPerformanceDetailed.map((staff, index) => (
                  <TableRow key={staff.staffId} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={staff.avatar || "/placeholder.svg"} alt={staff.name} />
                          <AvatarFallback>{staff.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{staff.name}</div>
                            {index === 0 && <span>🥇</span>}
                          </div>
                          {staff.badges.length > 0 && (
                            <div className="mt-1 flex gap-1">
                              {staff.badges.slice(0, 1).map((badge, i) => (
                                <span key={i} className="text-xs">{badge.split(' ')[0]}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{staff.role}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">{staff.ordersHandled}</div>
                      <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                        {staff.ordersDelta > 0 ? (
                          <>
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">+{staff.ordersDelta}</span>
                          </>
                        ) : (
                          <>
                            <Minus className="h-3 w-3" />
                            <span>{staff.ordersDelta}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">${staff.revenue.toLocaleString()}</div>
                      <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                        {staff.revenueDelta > 0 && (
                          <>
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">+${staff.revenueDelta}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">{staff.avgTicketTimeLabel}</div>
                      <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                        {staff.timeDelta < 0 ? (
                          <>
                            <TrendingDown className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">{Math.floor(Math.abs(staff.timeDelta) / 60)}m</span>
                          </>
                        ) : staff.timeDelta > 0 ? (
                          <>
                            <TrendingUp className="h-3 w-3 text-red-500" />
                            <span className="text-red-500">+{Math.floor(staff.timeDelta / 60)}m</span>
                          </>
                        ) : (
                          <>
                            <Minus className="h-3 w-3" />
                            <span>0m</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1 font-medium">
                        <span>{staff.customerRating}</span>
                        <span className="text-yellow-500">⭐</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                        {staff.ratingDelta > 0 ? (
                          <>
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">+{staff.ratingDelta}</span>
                          </>
                        ) : staff.ratingDelta < 0 ? (
                          <>
                            <TrendingDown className="h-3 w-3 text-red-500" />
                            <span className="text-red-500">{staff.ratingDelta}</span>
                          </>
                        ) : (
                          <>
                            <Minus className="h-3 w-3" />
                            <span>0.0</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">${staff.tipsEarned}</div>
                      <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                        {staff.tipsDelta > 0 && (
                          <>
                            <TrendingUp className="h-3 w-3 text-green-500" />
                            <span className="text-green-500">+${staff.tipsDelta}</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="text-xs text-muted-foreground">{staff.hoursWorked}h</div>
                      <div className="text-xs font-medium">{staff.ordersPerHour.toFixed(1)}/hr</div>
                      <div className="text-xs text-muted-foreground">${staff.revenuePerHour.toFixed(0)}/hr</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <Progress value={staff.efficiency * 100} className="h-2" />
                        <div className="text-xs font-medium">{staff.efficiencyLabel}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        Details
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Chart 8: Workload Heatmap */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Staff Workload Heatmap - Hourly Distribution</CardTitle>
              <CardDescription>Numbers show orders handled during that hour</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="mb-4 grid grid-cols-[140px_repeat(12,1fr)_80px] gap-1 text-xs font-medium">
                <div className="text-muted-foreground">Staff</div>
                {['11a', '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p'].map(hour => (
                  <div key={hour} className="text-center text-muted-foreground">{hour}</div>
                ))}
                <div className="text-center text-muted-foreground">Avg</div>
              </div>
              {workloadHeatmap.map((staffData) => (
                <div key={staffData.staff} className="mb-2 grid grid-cols-[140px_repeat(12,1fr)_80px] gap-1">
                  <div className="flex items-center text-sm font-medium">{staffData.staff.split(' ')[0]}</div>
                  {staffData.hours.map((hourData) => {
                    const bgColor = 
                      hourData.load === 'none' ? 'bg-muted/30' :
                      hourData.load === 'light' ? 'bg-blue-200/50 dark:bg-blue-900/30' :
                      hourData.load === 'medium' ? 'bg-yellow-200/50 dark:bg-yellow-900/40' :
                      'bg-red-200/50 dark:bg-red-900/40'
                    
                    return (
                      <div
                        key={hourData.hour}
                        className={`group relative flex h-12 items-center justify-center rounded border ${bgColor} transition-all hover:scale-105 hover:shadow-md`}
                        title={`${staffData.staff} - ${hourData.hour}: ${hourData.orders} orders (${hourData.percent}%)`}
                      >
                        <div className="text-center">
                          <div className="text-xs font-medium">{hourData.orders > 0 ? hourData.orders : '-'}</div>
                        </div>
                      </div>
                    )
                  })}
                  <div className="flex items-center justify-center text-sm font-semibold">
                    {staffData.avgLoad}%
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 space-y-2 rounded-md border bg-muted/30 p-3">
            <div className="flex items-center gap-4 text-xs">
              <span className="font-medium">Legend:</span>
              <div className="flex items-center gap-1">
                <div className="h-4 w-8 rounded border bg-blue-200/50 dark:bg-blue-900/30" />
                <span className="text-muted-foreground">Light (0-30%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-8 rounded border bg-yellow-200/50 dark:bg-yellow-900/40" />
                <span className="text-muted-foreground">Medium (30-70%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-4 w-8 rounded border bg-red-200/50 dark:bg-red-900/40" />
                <span className="text-muted-foreground">Heavy (70-100%)</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">💡 Insight:</span> Sarah maintains consistent high performance throughout dinner service
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
