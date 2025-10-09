import { CustomersClient } from "./customers-client";
import { fetchMockCustomers } from "../../../../lib/mock/server-actions";

export default async function SalesCustomersPage() {
  const initialData = await fetchMockCustomers();

  return <CustomersClient initialData={initialData} />;
}
