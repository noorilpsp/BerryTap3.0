import { Suspense, type ReactNode } from "react"
import { Inter } from "next/font/google"

import { ReservationsShellLayout } from "@/components/reservations/reservations-shell-layout"
import { OpsBottomNav } from "@/components/navigation/ops-bottom-nav"
import { OpsReservationsAttr } from "@/components/reservations/ops-reservations-attr"
import "./ops-reservations.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter-ops" })

export default function ReservationsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`ops-reservations-root dark min-h-dvh bg-zinc-950 text-zinc-100 font-sans antialiased ${inter.variable}`}>
      <OpsReservationsAttr fontVariableClass={inter.variable} />
      <div className="h-dvh min-h-0 overflow-hidden pb-[calc(4.5rem+env(safe-area-inset-bottom))]">
        <Suspense fallback={<div className="h-full bg-zinc-950" />}>
          <ReservationsShellLayout>{children}</ReservationsShellLayout>
        </Suspense>
      </div>
      <OpsBottomNav />
    </div>
  )
}
