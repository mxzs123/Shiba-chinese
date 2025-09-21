import type { Metadata } from "next";

import { DesktopSearchView } from "app/_shared";
import { getProducts } from "lib/api";

export const metadata: Metadata = {
  title: "商品搜索",
  description: "在芝园药局筛选、排序与浏览所有商品，支持桌面端多维度筛选体验。",
};

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function DesktopSearchPage(props: {
  searchParams?: Promise<SearchParams>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const initialQuery = typeof searchParams.q === "string" ? searchParams.q : "";

  const products = await getProducts({});

  return (
    <DesktopSearchView
      allProducts={products}
      initialQuery={initialQuery}
      title="全部商品"
      subtitle="快速浏览芝园药局的全部商品，支持关键词、标签与价格的本地筛选。"
    />
  );
}
