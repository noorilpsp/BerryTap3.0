"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="relative h-9 w-[120px] rounded-full bg-muted" />
  }

  const getSlidePosition = () => {
    if (theme === "system") return "left-1"
    if (theme === "light") return "left-[41px]"
    return "left-[81px]"
  }

  return (
    <div className="relative h-9 w-[120px] rounded-full bg-muted p-1">
      <div
        className={`absolute top-1 h-7 w-[34px] rounded-full bg-background shadow-md transition-all duration-300 ease-in-out ${getSlidePosition()}`}
      />

      <div className="relative flex h-full items-center justify-between">
        <button
          onClick={() => setTheme("system")}
          className={`flex h-7 w-[34px] items-center justify-center rounded-full transition-colors duration-200 ${
            theme === "system" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Use system theme"
        >
          <Monitor className="h-4 w-4" />
        </button>

        <button
          onClick={() => setTheme("light")}
          className={`flex h-7 w-[34px] items-center justify-center rounded-full transition-colors duration-200 ${
            theme === "light" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Switch to light mode"
        >
          <Sun className="h-4 w-4" />
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={`flex h-7 w-[34px] items-center justify-center rounded-full transition-colors duration-200 ${
            theme === "dark" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Switch to dark mode"
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
