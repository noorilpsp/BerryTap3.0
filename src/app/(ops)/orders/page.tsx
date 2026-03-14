import { redirect } from "next/navigation";
import { getOrdersView } from "@/lib/orders/getOrdersView";
import { OrdersClient } from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const result = await getOrdersView();

  if (result.error === "UNAUTHORIZED" || result.error === "FORBIDDEN") {
    redirect("/login");
  }

  return (
    <OrdersClient
      initialOrdersView={result.error === "NO_LOCATION" ? null : result.data}
    />
  );
}
