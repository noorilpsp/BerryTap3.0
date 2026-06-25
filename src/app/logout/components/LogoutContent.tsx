"use client"

import { useState } from "react"
import { LogOut } from "lucide-react"

import { logout } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { clearUserData } from "@/lib/utils/logout"

export default function LogoutContent() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    clearUserData()
    await logout()
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Log out</CardTitle>
        <CardDescription>
          Sign out of your account on this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type="button"
          variant="destructive"
          className="w-full gap-2"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Signing out..." : "Log out"}
        </Button>
      </CardContent>
    </Card>
  )
}
