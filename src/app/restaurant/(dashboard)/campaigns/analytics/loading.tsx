export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-[1400px]">
      <div className="h-10 w-64 bg-muted animate-pulse rounded mb-6" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded" />
        ))}
      </div>
      <div className="h-96 bg-muted animate-pulse rounded mb-6" />
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded" />
        ))}
      </div>
    </div>
  )
}
