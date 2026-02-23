"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface MenuSearchProps {
  value: string
  onChange: (value: string) => void
  inputClassName?: string
}

export function MenuSearch({ value, onChange, inputClassName }: MenuSearchProps) {
  return (
    <div className="group relative rounded-md border border-input bg-background transition-all focus-within:border-primary focus-within:bg-primary/5 focus-within:ring-2 focus-within:ring-primary/35">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
      <Input
        type="search"
        placeholder="Search menu..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-11 border-0 bg-transparent pl-9 pr-4 focus-visible:ring-0 focus-visible:ring-offset-0",
          inputClassName
        )}
      />
    </div>
  )
}
