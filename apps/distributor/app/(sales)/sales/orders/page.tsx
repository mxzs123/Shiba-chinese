import { OrdersClient } from "./orders-client";
import { fetchMockOrders } from "@/lib/mock/server-actions";

export default async function SalesOrdersPage() {
  const initialData = await fetchMockOrders("sales");

  return <OrdersClient initialData={initialData} />;
}
