import { redirect } from "next/navigation";

export { generateMetadata } from "@/app/_shared/pages/search/collection-page";

export default async function CollectionRedirect(props: {
  params: Promise<{ collection: string }>;
}) {
  const params = await props.params;
  redirect(`/d/search/${params.collection}`);
}
