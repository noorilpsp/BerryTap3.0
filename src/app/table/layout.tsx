import { Inter } from "next/font/google"
import type { ReactNode } from "react"

import { OpsProviders } from "@/components/ops-providers"
import { OpsBottomNav } from "@/components/navigation/ops-bottom-nav"
import { OpsTablesAttr } from "@/components/navigation/ops-tables-attr"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter-ops" })

export default function TableLayout({ children }: { children: ReactNode }) {
  return (
    <OpsProviders>
    <div className={`ops-tables-root dark h-dvh bg-background text-foreground font-sans antialiased ${inter.variable}`}>
      <OpsTablesAttr fontVariableClass={inter.variable} />
      <div className="ops-bottom-nav-content">
        {children}
      </div>
      <OpsBottomNav />
    </div>
    </OpsProviders>
  )
}
