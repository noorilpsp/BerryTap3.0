'use client'

import { Suspense } from 'react'
import { Link } from '@/components/ui/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { logout } from '@/app/actions/auth'
import { clearUserData } from '@/lib/utils/logout'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'
import { useIsAdmin } from '@/components/AdminPermissionsProvider'

const navItems = [
  { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { title: 'Merchants', href: '/admin/merchants', icon: BarChart3 },
  { title: 'Personnel', href: '/admin/personnel', icon: Users },
  { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
]

function AdminSidebarFooter() {
  const { isAdmin, loading } = useIsAdmin()

  return (
    <SidebarFooter className="px-3">
      <div className="flex items-center justify-between rounded-lg border px-3 py-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium">Access</span>
          <span className="text-muted-foreground text-xs">
            {loading
              ? 'Loading...'
              : isAdmin
                ? 'Super admin'
                : 'No access'}
          </span>
        </div>
        <Badge
          variant={isAdmin ? 'default' : 'outline'}
          className="text-xs"
        >
          {loading ? '...' : isAdmin ? 'Admin' : 'User'}
        </Badge>
      </div>
    </SidebarFooter>
  )
}

export function AdminSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar className="border-r" collapsible="offcanvas">
        <SidebarHeader className="px-2 py-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
              <span className="font-semibold leading-none truncate">NextFaster Admin</span>
              <span className="text-muted-foreground text-xs truncate">Internal tools</span>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon
                  // For the Dashboard (/admin), match exactly or with trailing slash
                  // For other routes, match if pathname starts with the href
                  const isActive =
                    item.href === '/admin'
                      ? pathname === '/admin' || pathname === '/admin/'
                      : pathname?.startsWith(item.href) ?? false

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.href} className="flex items-center gap-2">
                          <Icon className="size-4" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator />
        </SidebarContent>
        <Suspense
          fallback={
            <SidebarFooter className="px-3">
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Access</span>
                  <span className="text-muted-foreground text-xs">Loading...</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  ...
                </Badge>
              </div>
            </SidebarFooter>
          }
        >
          <AdminSidebarFooter />
        </Suspense>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="bg-background/95 sticky top-0 z-20 flex h-14 items-center gap-3 border-b px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-6" />
          <div className="flex min-w-0 flex-1 flex-col truncate">
            <span className="text-sm font-medium text-muted-foreground truncate">NextFaster</span>
            <span className="text-lg font-semibold leading-none truncate">Admin Console</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 gap-2 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <ShieldCheck className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={async () => {
                  clearUserData()
                  await logout()
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  )
}
