import { Inter } from "next/font/google"
import type { ReactNode } from "react"

import { OpsBottomNav } from "@/components/navigation/ops-bottom-nav"
import { OpsCounterAttr } from "@/components/navigation/ops-counter-attr"

import "./ops-counter.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter-ops" })

export default function CounterLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`ops-counter-root dark min-h-dvh bg-zinc-950 text-zinc-100 font-sans antialiased ${inter.variable}`}>
      <OpsCounterAttr fontVariableClass={inter.variable} />
      <div className="h-dvh min-h-0 overflow-hidden pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
        {children}
      </div>
      <OpsBottomNav />
    </div>
  )
}
