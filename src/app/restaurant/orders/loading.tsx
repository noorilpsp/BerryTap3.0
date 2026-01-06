import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { TableSkeleton } from "@/components/loading-skeleton"

export default function OrdersLoading() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader>
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={10} />
        </CardContent>
      </Card>
    </div>
  )
}
