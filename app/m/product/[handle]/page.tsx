export { generateMetadata } from "@/app/_shared/pages/product/page";

import { notFound } from "next/navigation";

import { MobileProductPageClient } from "@/app/_shared/pages/product/mobile-page";
import { loadProductPageData } from "@/app/_shared/pages/product/shared";
import { CartProvider } from "@/components/cart/cart-context";
import { ProductProvider } from "@/components/product/product-context";

type PageParams = {
  handle: string;
};

type MobilePageProps = {
  params: Promise<PageParams>;
};

export default async function MobileProductPage({ params }: MobilePageProps) {
  const resolvedParams = await params;
  const data = await loadProductPageData(resolvedParams.handle);

  if (!data) {
    return notFound();
  }

  const {
    product,
    cartPromise,
    productJsonLd,
    images,
    recommended,
    detailRows,
    guidelineSections,
  } = data;

  return (
    <CartProvider cartPromise={cartPromise}>
      <ProductProvider>
        <MobileProductPageClient
          product={product}
          productJsonLd={productJsonLd}
          images={images}
          recommended={recommended}
          detailRows={detailRows}
          guidelineSections={guidelineSections}
        />
      </ProductProvider>
    </CartProvider>
  );
}
