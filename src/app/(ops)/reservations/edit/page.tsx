import { redirect } from "next/navigation"

export default async function EditReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>
}) {
  const params = await searchParams
  const id = params?.id?.trim()
  if (id) {
    redirect(`/reservations/list?action=edit&id=${encodeURIComponent(id)}`)
  }
  redirect("/reservations/list")
}
