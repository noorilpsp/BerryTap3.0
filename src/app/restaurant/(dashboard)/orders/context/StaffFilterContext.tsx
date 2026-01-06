"use client"

import * as React from "react"

interface StaffFilterContextType {
  selectedStaff: string
  setSelectedStaff: (staff: string) => void
}

const StaffFilterContext = React.createContext<StaffFilterContextType | undefined>(undefined)

export function StaffFilterProvider({ children }: { children: React.ReactNode }) {
  const [selectedStaff, setSelectedStaff] = React.useState("all")

  return (
    <StaffFilterContext.Provider value={{ selectedStaff, setSelectedStaff }}>{children}</StaffFilterContext.Provider>
  )
}

export function useStaffFilter() {
  const context = React.useContext(StaffFilterContext)
  if (context === undefined) {
    throw new Error("useStaffFilter must be used within a StaffFilterProvider")
  }
  return context
}
