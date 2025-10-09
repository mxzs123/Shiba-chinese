import { DistributorOrdersClient } from "./orders-client";
import { fetchMockOrders } from "../../../../lib/mock/server-actions";

export default async function DistributorOrdersPage() {
  const initialData = await fetchMockOrders("distributor");

  return <DistributorOrdersClient initialData={initialData} />;
}
