import { Inter } from "next/font/google"
import type { ReactNode } from "react"

import { OpsBottomNav } from "@/components/navigation/ops-bottom-nav"
import { OpsTablesAttr } from "@/components/navigation/ops-tables-attr"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter-ops" })

export default function TableLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`ops-tables-root dark min-h-dvh bg-background text-foreground font-sans antialiased ${inter.variable}`}>
      <OpsTablesAttr fontVariableClass={inter.variable} />
      <div className="h-dvh min-h-0 overflow-hidden pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
      <OpsBottomNav />
    </div>
  )
}
