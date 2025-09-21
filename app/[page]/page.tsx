import { redirect } from "next/navigation";

export { generateMetadata } from "@/app/_shared/pages/cms-page";

export default async function CmsRedirect(props: {
  params: Promise<{ page: string }>;
}) {
  const params = await props.params;
  redirect(`/d/${params.page}`);
}
