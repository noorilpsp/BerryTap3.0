import { PODetailDrawer } from "@/components/inventory/po-detail-drawer"

export default function PODetailPage({ params }: { params: { id: string } }) {
  return <PODetailDrawer poId={params.id} />
}
