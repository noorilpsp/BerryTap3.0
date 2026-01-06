"use client"

import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { FloatingActionButton } from "@/components/floating-action-button"
import { CommandPalette } from "@/components/command-palette"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col">
          <DashboardHeader />
          <main className="flex flex-1 flex-col gap-4" aria-label="Main content">
            {children}
          </main>
          <FloatingActionButton />
          <CommandPalette />
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
