import { redirect } from "next/navigation";

type AccountOrderEntryProps = {
  params: Promise<{ orderId: string }>;
};

export default async function AccountOrderEntry({
  params,
}: AccountOrderEntryProps) {
  const resolvedParams = await params;
  const orderId = decodeURIComponent(resolvedParams.orderId);
  redirect(`/d/account/orders/${orderId}`);
}
