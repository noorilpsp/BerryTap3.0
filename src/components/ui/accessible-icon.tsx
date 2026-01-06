import type { LucideIcon } from "lucide-react"

interface AccessibleIconProps {
  icon: LucideIcon
  label: string
  className?: string
}

export function AccessibleIcon({ icon: Icon, label, className }: AccessibleIconProps) {
  return (
    <>
      <Icon className={className} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </>
  )
}
