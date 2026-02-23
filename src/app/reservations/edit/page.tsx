import { redirect } from "next/navigation"

export default function EditReservationPage() {
  redirect("/reservations/list?action=edit&id=res_001")
}
