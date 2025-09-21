import { redirect } from "next/navigation";

export { generateMetadata } from "@/app/_shared/pages/product/page";

export default async function ProductRedirect(props: {
  params: Promise<{ handle: string }>;
}) {
  const params = await props.params;
  redirect(`/d/product/${params.handle}`);
}
