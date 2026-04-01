import { redirect } from "next/navigation";
import { getOrdersView } from "@/lib/orders/getOrdersView";
import { OrdersClient } from "./OrdersClient";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const result = await getOrdersView();

  if (result.error === "UNAUTHORIZED" || result.error === "FORBIDDEN") {
    redirect("/login");
  }

  const loadError =
    result.error === "LOAD_ERROR"
      ? result.message ?? "Failed to load orders. Please try again."
      : null;

  return (
    <OrdersClient
      initialOrdersView={result.error === "NO_LOCATION" ? null : "data" in result ? result.data : null}
      loadError={loadError}
    />
  );
}
