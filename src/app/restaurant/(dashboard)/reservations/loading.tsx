import { SkeletonBlock } from "@/components/ui/skeleton-block"

export default function ReservationsLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-6">
        <SkeletonBlock variant="header" />
        <SkeletonBlock variant="table" rows={8} />
      </div>
      <div className="lg:w-[360px] space-y-4">
        <SkeletonBlock variant="card" />
        <SkeletonBlock variant="card" />
        <SkeletonBlock variant="card" />
      </div>
    </div>
  )
}
