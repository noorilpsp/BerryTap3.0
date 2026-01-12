'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const revenueData = [
  { name: 'Mon', revenue: 3200 },
  { name: 'Tue', revenue: 2800 },
  { name: 'Wed', revenue: 4100 },
  { name: 'Thu', revenue: 3600 },
  { name: 'Fri', revenue: 5200 },
  { name: 'Sat', revenue: 6800 },
  { name: 'Sun', revenue: 5900 },
]

const popularDishes = [
  { name: 'Burger', orders: 145 },
  { name: 'Pizza', orders: 132 },
  { name: 'Pasta', orders: 98 },
  { name: 'Salad', orders: 87 },
  { name: 'Steak', orders: 76 },
]

export function WeeklyRevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={revenueData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function PopularDishesChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={popularDishes}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="orders" fill="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  )
}

