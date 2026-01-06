"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SalesTab } from "./tabs/SalesTab"
import { ServiceTab } from "./tabs/ServiceTab"
import { StaffTab } from "./tabs/StaffTab"
import { MenuTab } from "./tabs/MenuTab"
import { KitchenTab } from "./tabs/KitchenTab"

export function PerformanceTabs() {
  return (
    <Tabs defaultValue="sales" className="space-y-4">
      <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
        <TabsTrigger value="sales" className="relative">
          <span className="flex items-center gap-2">
            💰 Sales
            <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">2</Badge>
          </span>
        </TabsTrigger>
        <TabsTrigger value="service" className="relative">
          <span className="flex items-center gap-2">
            ⚡ Service
            <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">1</Badge>
          </span>
        </TabsTrigger>
        <TabsTrigger value="staff" className="relative">
          <span className="flex items-center gap-2">
            👥 Staff
            <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">3</Badge>
          </span>
        </TabsTrigger>
        <TabsTrigger value="menu">🍽️ Menu</TabsTrigger>
        <TabsTrigger value="kitchen" className="relative">
          <span className="flex items-center gap-2">
            🍳 Kitchen
            <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">1</Badge>
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="sales" className="space-y-4">
        <SalesTab />
      </TabsContent>

      <TabsContent value="service" className="space-y-4">
        <ServiceTab />
      </TabsContent>

      <TabsContent value="staff" className="space-y-4">
        <StaffTab />
      </TabsContent>

      <TabsContent value="menu" className="space-y-4">
        <MenuTab />
      </TabsContent>

      <TabsContent value="kitchen" className="space-y-4">
        <KitchenTab />
      </TabsContent>
    </Tabs>
  )
}
