"use client"
import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const themes = [
  { value: "system", icon: Monitor, label: "System" },
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
] as const

export function ThemeToggleInline({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const getIndicatorPosition = () => {
    const index = themes.findIndex((t) => t.value === theme)
    return index === -1 ? 0 : index
  }

  if (!mounted) {
    return <div className={cn("h-10 bg-muted/50 rounded-full animate-pulse", className)} />
  }

  return (
    <div className={cn("relative flex items-center gap-0.5 p-1 bg-muted/50 rounded-full backdrop-blur-sm", className)}>
      <div
        className="absolute h-8 bg-background rounded-full shadow-sm transition-all duration-300 ease-out"
        style={{
          width: "calc(33.333% - 0.25rem)",
          left: `calc(${getIndicatorPosition() * 33.333}% + 0.25rem)`,
        }}
      />

      {themes.map((themeOption) => {
        const Icon = themeOption.icon
        const isActive = theme === themeOption.value

        return (
          <button
            key={themeOption.value}
            onClick={() => setTheme(themeOption.value)}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center h-8 px-3 rounded-full transition-colors duration-200",
              "hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive ? "text-foreground" : "text-muted-foreground",
            )}
            title={themeOption.label}
            aria-label={themeOption.label}
          >
            <Icon className="h-[18px] w-[18px]" />
          </button>
        )
      })}
    </div>
  )
}
