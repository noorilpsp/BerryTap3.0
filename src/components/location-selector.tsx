"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocation } from "@/lib/contexts/LocationContext";
import { MapPin } from "lucide-react";

export function LocationSelector() {
  const {
    currentLocationId,
    setCurrentLocation,
    locations,
    loading,
  } = useLocation();

  if (loading || locations.length === 0) {
    return null;
  }

  if (locations.length === 1) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 shrink-0" />
        <span className="truncate max-w-[180px]">{locations[0].name}</span>
      </div>
    );
  }

  return (
    <Select
      value={currentLocationId ?? ""}
      onValueChange={(value) => setCurrentLocation(value)}
    >
      <SelectTrigger className="w-[180px] h-9 gap-2">
        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
        <SelectValue placeholder="Select location" />
      </SelectTrigger>
      <SelectContent>
        {locations.map((loc) => (
          <SelectItem key={loc.id} value={loc.id}>
            {loc.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
