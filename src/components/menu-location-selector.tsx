"use client"

import { useMenu } from "@/app/dashboard/(dashboard)/menu/menu-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin } from "lucide-react"

export function MenuLocationSelector() {
  const { locationId, locations, setLocationId, loading } = useMenu()

  if (locations.length <= 1) {
    return null // Don't show selector if only one location
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b bg-background">
      <MapPin className="h-4 w-4 text-muted-foreground" />
      <Select
        value={locationId || ""}
        onValueChange={setLocationId}
        disabled={loading}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent>
          {locations.map((location) => (
            <SelectItem key={location.id} value={location.id}>
              {location.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
