import { redirect } from "next/navigation";

export default async function NewsArticleRedirect(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  redirect(`/d/news/${params.slug}`);
}
