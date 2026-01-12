import { SkeletonBlock } from "@/components/ui/skeleton-block"

export default function TablesLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1 space-y-6">
        <SkeletonBlock variant="header" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <SkeletonBlock key={i} variant="card" />
          ))}
        </div>
      </div>
      <aside className="lg:w-[360px]">
        <SkeletonBlock variant="sidebar" />
      </aside>
    </div>
  )
}
