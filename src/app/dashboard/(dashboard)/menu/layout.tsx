"use client"

import React from "react"
import { MenuProvider } from "./menu-context"
import { MenuTabs } from "@/components/menu-tabs"

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MenuProvider>
      <div className="flex flex-col h-full">
        {/* Menu Tabs */}
        <MenuTabs />

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </MenuProvider>
  )
}
