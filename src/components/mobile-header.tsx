"use client"
import { Bell } from "lucide-react"
import { MobileSidebar } from "@/components/mobile-sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function MobileHeader({ title = "Dashboard" }: { title?: string }) {
  const unreadCount = 3

  return (
    <header className="md:hidden sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-14 items-center justify-between px-4">
        <MobileSidebar />
        <h1 className="text-lg font-semibold truncate flex-1 text-center">{title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
