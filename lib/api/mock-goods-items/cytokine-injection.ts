import type { RawGoodsRecord } from "../mock-goods-types";

const cytokineInjection: RawGoodsRecord = {
  productId: 960005,
  slug: "cytokine-injection",
  title: "CyTIX 日本诊所院线用 细胞免疫赋能因子 免疫再生注射剂 (0.3ml)",
  jpName: "サイトカイン注射",
  brand: "",
  spec: "0.3ml/瓶",
  priceJpy: 300000,
  priceCny: 14100,
  notes: "冷凍",
  effects: "免疫力增强，促进免疫细胞再生",
  keywords: ["抗炎", "激活干细胞", "抗衰"],
  categoryId: 2085,
  subCategoryId: 3085001,
  subCategoryName: "点滴",
  image: {
    src: "/product-images/cytokine-injection.png",
    alt: "CyTIX 细胞免疫赋能因子注射剂",
  },
  collectionHandles: ["hospital-preparation"],
  rank: 5,
};

export default cytokineInjection;
