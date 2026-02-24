"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Bell, CalendarCheck, CalendarDays, ClipboardList, Clock, Combine, LayoutGrid, PencilRuler, ShoppingBasket, Table2, Users } from "lucide-react"

import { cn } from "@/lib/utils"

type OpsNavItem = {
  href: string
  label: string
  Icon: typeof ShoppingBasket
  active: (pathname: string) => boolean
}

const items: OpsNavItem[] = [
  {
    href: "/counter",
    label: "Cashier",
    Icon: ShoppingBasket,
    active: (pathname) => pathname.startsWith("/counter"),
  },
  {
    href: "/floor-map",
    label: "Floor Plan",
    Icon: LayoutGrid,
    active: (pathname) => pathname.startsWith("/floor-map"),
  },
  {
    href: "/builder",
    label: "Builder",
    Icon: PencilRuler,
    active: (pathname) => pathname.startsWith("/builder"),
  },
  {
    href: "/dashboard/orders",
    label: "Orders",
    Icon: ClipboardList,
    active: (pathname) => pathname.startsWith("/dashboard/orders"),
  },
  {
    href: "/tables",
    label: "Tables",
    Icon: Table2,
    active: (pathname) => pathname.startsWith("/tables") || pathname.startsWith("/table/"),
  },
  {
    href: "/merge-split",
    label: "Merge",
    Icon: Combine,
    active: (pathname) => pathname.startsWith("/merge-split"),
  },
  {
    href: "/communications",
    label: "Comms",
    Icon: Bell,
    active: (pathname) => pathname.startsWith("/communications"),
  },
  {
    href: "/book",
    label: "Book",
    Icon: CalendarCheck,
    active: (pathname) => pathname.startsWith("/book"),
  },
  {
    href: "/reservations/list",
    label: "Reservations",
    Icon: CalendarDays,
    active: (pathname) => pathname.startsWith("/reservations") && !pathname.startsWith("/reservations/waitlist"),
  },
  {
    href: "/reservations/waitlist",
    label: "Waitlist",
    Icon: Clock,
    active: (pathname) => pathname.startsWith("/reservations/waitlist"),
  },
  {
    href: "/guests",
    label: "Guests",
    Icon: Users,
    active: (pathname) => pathname.startsWith("/guests"),
  },
  {
    href: "/analytics",
    label: "Analytics",
    Icon: BarChart3,
    active: (pathname) => pathname.startsWith("/analytics"),
  },
]

export function OpsBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[70] border-t border-cyan-200/35 bg-[linear-gradient(135deg,rgba(2,6,23,0.96),rgba(15,23,42,0.94))] px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-14px_36px_rgba(2,6,23,0.5)] backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-[1680px] grid-cols-10 gap-1.5">
        {items.map((item) => {
          const isActive = item.active(pathname)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all",
                isActive
                  ? "border-cyan-300/55 bg-cyan-500/20 text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.32)]"
                  : "border-transparent text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
