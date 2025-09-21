import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DesktopSearchView } from "app/_shared";
import { getCollection, getCollectionProducts } from "lib/api";

type Params = { collection: string };
type SearchParams = { [key: string]: string | string[] | undefined };

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const params = await props.params;
  const collection = await getCollection(params.collection);

  if (!collection) {
    notFound();
  }

  return {
    title: collection.seo?.title || collection.title,
    description:
      collection.seo?.description ||
      collection.description ||
      `${collection.title} 商品列表`,
  };
}

export default async function DesktopCollectionSearchPage(props: {
  params: Promise<Params>;
  searchParams?: Promise<SearchParams>;
}) {
  const params = props.params ? await props.params : { collection: "" };
  const searchParams = props.searchParams ? await props.searchParams : {};

  const collection = await getCollection(params.collection);

  if (!collection) {
    notFound();
  }

  const initialQuery = typeof searchParams.q === "string" ? searchParams.q : "";

  const products = await getCollectionProducts({
    collection: params.collection,
  });

  return (
    <DesktopSearchView
      allProducts={products}
      initialQuery={initialQuery}
      title={collection.title}
      collectionTitle={collection.title}
      subtitle={
        collection.description || "按标签、价格等条件进一步筛选该分类下的商品。"
      }
    />
  );
}
