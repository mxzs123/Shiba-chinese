import {
  findGoodsProductByHandle,
  getCart,
  getGoodsDetail,
  getGoodsRecommendList,
  getProduct,
  getProductRecommendations,
} from "@/lib/api";
import type { Image, Product, ProductVariant } from "@/lib/api/types";

export type ProductDetailRow = {
  label: string;
  value: string;
};

export type GuidelineSection = {
  title: string;
  body: string;
};

export type GalleryImage = {
  src: string;
  altText: string;
};

export type LoadedProductPageData = {
  product: Product;
  cartPromise: ReturnType<typeof getCart>;
  productJsonLd: Record<string, unknown>;
  images: GalleryImage[];
  recommended: Product[];
  detailRows: ProductDetailRow[];
  guidelineSections: GuidelineSection[];
};

export function selectPrimaryVariant(
  product: Product,
): ProductVariant | undefined {
  if (!product.variants.length) {
    return undefined;
  }

  return product.variants[0];
}

export function buildProductJsonLd(product: Product) {
  const variant = selectPrimaryVariant(product);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.featuredImage?.url,
    offers: {
      "@type": "Offer",
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      priceCurrency:
        variant?.price.currencyCode ||
        product.priceRange.minVariantPrice.currencyCode,
      price: variant?.price.amount || product.priceRange.minVariantPrice.amount,
    },
  };
}

function parseTaggedData(tags: string[], prefix: string) {
  return tags.reduce<Record<string, string>>((acc, tag) => {
    if (!tag.startsWith(prefix)) {
      return acc;
    }

    const raw = tag.slice(prefix.length);
    const [key, ...rest] = raw.split("=");
    const value = rest.join("=").trim();

    if (key && value) {
      acc[key.trim()] = value;
    }

    return acc;
  }, {});
}

export function getProductDetailRows(product: Product): ProductDetailRow[] {
  const detailMap = parseTaggedData(product.tags, "detail:");
  const optionSummary = product.options
    .map((option) => `${option.name}：${option.values.join(" / ")}`)
    .join("；");
  const defaults: Array<{
    key: string;
    label: string;
    fallback?: string;
  }> = [
    {
      key: "jp_name",
      label: "日语商品名",
      fallback: product.title,
    },
    {
      key: "manufacturer",
      label: "制造商",
    },
    {
      key: "seller",
      label: "销售商",
    },
    {
      key: "content_volume",
      label: "内容量",
      fallback: optionSummary || "以实际包装为准",
    },
  ];

  const rows = defaults.map(({ key, label, fallback }) => ({
    label,
    value: detailMap[key] || fallback || "资料更新中",
  }));

  const extraRows = Object.entries(detailMap).filter(
    ([key]) => !defaults.some((detail) => detail.key === key),
  );

  return [
    ...rows,
    ...extraRows.map(([key, value]) => ({
      label: key,
      value,
    })),
  ];
}

export function getUsageGuidelines(product: Product): GuidelineSection[] {
  const guidelineMap = parseTaggedData(product.tags, "guideline:");
  const defaults: Array<{
    key: string;
    title: string;
    fallback: string;
  }> = [
    {
      key: "usage",
      title: "用法用量",
      fallback: "请遵照包装说明书或专业药剂师指导使用，切勿超量服用。",
    },
    {
      key: "caution",
      title: "注意事项",
      fallback: "如您正处于孕期、哺乳期或有基础疾病，请先咨询医生再行使用。",
    },
    {
      key: "storage",
      title: "存储建议",
      fallback: "置于阴凉干燥处保存，避免阳光直射，并远离儿童可触及的位置。",
    },
  ];
  const usedKeys = new Set(defaults.map((item) => item.key));

  const sections = defaults.map(({ key, title, fallback }) => ({
    title,
    body: guidelineMap[key] || fallback,
  }));

  const extraSections = Object.entries(guidelineMap)
    .filter(([key]) => !usedKeys.has(key))
    .map(([key, body]) => ({
      title: key,
      body,
    }));

  return [...sections, ...extraSections];
}

export function mapProductImages(product: Product): GalleryImage[] {
  return product.images.slice(0, 6).map((image: Image) => ({
    src: image.url,
    altText: image.altText,
  }));
}

export async function loadProductPageData(
  handle: string,
): Promise<LoadedProductPageData | null> {
  const goodsMatch = findGoodsProductByHandle(handle);
  let product = goodsMatch ?? (await getProduct(handle));

  if (!product) {
    return null;
  }

  const cartPromise = getCart();
  let recommended: Product[] = [];

  if (goodsMatch?.backend?.productId) {
    const [detailResponse, recommendResponse] = await Promise.all([
      getGoodsDetail(goodsMatch.backend.productId),
      getGoodsRecommendList({ id: goodsMatch.backend.productId }),
    ]);

    if (detailResponse.status && detailResponse.data) {
      product = detailResponse.data;
    }

    if (recommendResponse.status && recommendResponse.data) {
      recommended = recommendResponse.data;
    }
  } else {
    recommended = await getProductRecommendations(product.id);
  }

  if (!recommended.length) {
    recommended = await getProductRecommendations(product.id);
  }

  const productJsonLd = buildProductJsonLd(product);
  const images = mapProductImages(product);
  const detailRows = getProductDetailRows(product);
  const guidelineSections = getUsageGuidelines(product);

  return {
    product,
    cartPromise,
    productJsonLd,
    images,
    recommended,
    detailRows,
    guidelineSections,
  };
}
