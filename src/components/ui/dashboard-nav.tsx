"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Activity,
  CreditCard,
  TrendingUp,
  Award,
  BarChart3,
  Settings,
  Dumbbell,
  UserCog,
  ClipboardList,
} from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Members",
    href: "/members",
    icon: Users,
  },
  {
    title: "Classes",
    href: "/classes",
    icon: Calendar,
  },
  {
    title: "Check-ins",
    href: "/checkins",
    icon: ClipboardList,
  },
  {
    title: "Trainers",
    href: "/trainers",
    icon: UserCog,
  },
  {
    title: "Equipment",
    href: "/equipment",
    icon: Dumbbell,
  },
  {
    title: "Payments",
    href: "/payments",
    icon: CreditCard,
  },
  {
    title: "Performance",
    href: "/performance",
    icon: Activity,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Growth",
    href: "/growth",
    icon: TrendingUp,
  },
  {
    title: "Challenges",
    href: "/challenges",
    icon: Award,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid gap-1 p-2">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
