import { MerchantDetails } from './components/MerchantDetails'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function MerchantDetailPage({ params }: PageProps) {
  const { id } = await params

  return <MerchantDetails merchantId={id} />
}
