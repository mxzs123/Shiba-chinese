import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";
import fetch, { Response } from "node-fetch";
import pLimit from "p-limit";
import slugify from "slugify";
import { pinyin } from "pinyin-pro";
import { z } from "zod";

import type { RawGoodsRecord } from "../lib/api/mock-goods-types";

type Args = {
  dryRun: boolean;
  limit?: number;
  skipImages: boolean;
  csvPath?: string;
};

type CsvRow = {
  JAN: string;
  GS1: string;
  薬名: string;
  製造販売元: string;
  大分類: string;
  小分類: string;
  入数: string;
  単位: string;
  "先発・後発": string;
  "売値（税別）": string;
  税率: string;
  "売値（税込）": string;
  商品名: string;
  功效: string;
  商品图片: string;
};

type PrescriptionSubcategory = {
  id: number;
  parentId: number;
  name: string;
  jpName: string;
  enName: string;
  sort: number;
  imageUrl: string;
  slug: string;
  child: null;
};

const PROJECT_ROOT = process.cwd();
const CSV_DEFAULT_PATH = path.join(PROJECT_ROOT, "public", "productss.csv");
const ITEMS_DIR = path.join(PROJECT_ROOT, "lib", "api", "mock-goods-items");
const INDEX_PATH = path.join(ITEMS_DIR, "index.ts");
const IMAGE_DIR = path.join(PROJECT_ROOT, "public", "product-images");
const SUBCATEGORY_JSON = path.join(
  PROJECT_ROOT,
  "lib",
  "api",
  "mock-goods-prescription-subcategories.json",
);

const PRESCRIPTION_CATEGORY_ID = 2088;
const START_SUBCATEGORY_ID = 2104;
const PLACEHOLDER_IMAGE = "/images/placeholders/product-1.svg";
const IMAGE_CONCURRENCY = 5;
const PRICE_CNY_RATE = 0.05;
const ENABLE_FALLBACK_SUBCATEGORY = true;

// 处方子分类白名单（按需求顺序排序，sort 递减确保写入 JSON 时与列表一致）
const ALLOWED_SUBCATEGORY_NAMES = [
  "美白",
  "血压血糖治疗",
  "焦虑改善",
  "妇科",
  "泌尿与男性健康",
  "维生素/补充剂",
  "抗过敏类治疗",
  "生发防脱",
  "肠胃护理",
  "止疼/外用贴剂",
  "睡眠辅助",
  "糖尿病与医学减重",
  "眼科护理",
  "流感治疗",
  "痛风治疗",
  "神经治理",
];

// 兼容旧/同义标签到白名单名称
const SUBCATEGORY_ALIASES: Record<string, string> = {
  高血压: "血压血糖治疗",
  降血糖: "血压血糖治疗",
  脂质异常: "血压血糖治疗",
  高胆固醇: "血压血糖治疗",
  糖尿病: "糖尿病与医学减重",
  "糖尿病/肥胖症": "糖尿病与医学减重",
  肥胖症: "糖尿病与医学减重",
  失眠: "睡眠辅助",
  "失眠/焦虑症": "焦虑改善",
  焦虑症: "焦虑改善",
  泌尿: "泌尿与男性健康",
  漏尿: "泌尿与男性健康",
  排结石: "泌尿与男性健康",
  前立腺肥大: "泌尿与男性健康",
  勃起不全: "泌尿与男性健康",
  青光眼: "眼科护理",
  干眼症: "眼科护理",
  眼疲劳: "眼科护理",
  眼睛痒: "眼科护理",
  抗敏: "抗过敏类治疗",
  鼻炎: "抗过敏类治疗",
  护胃: "肠胃护理",
  消化不良: "肠胃护理",
  胀气: "肠胃护理",
  胃溃疡: "肠胃护理",
  生发剂: "生发防脱",
  "防脱发/生发": "生发防脱",
  防长斑: "美白",
  维他命H: "维生素/补充剂",
  维生素C: "维生素/补充剂",
  补铁剂: "维生素/补充剂",
  缓和疼痛: "止疼/外用贴剂",
  外皮用药: "止疼/外用贴剂",
  预防痛风发作: "痛风治疗",
  高尿酸血症: "痛风治疗",
  防痴呆: "神经治理",
};

const CATEGORY_SYNONYMS: Record<string, string> = {
  // 根类写法差异
  处方药品: "处方药品",
  処方薬品: "处方药品",
  // 常见中日/简繁差异
  高血压: "高血压",
  高血圧: "高血压",
};

const FALLBACK_SUBCATEGORY: PrescriptionSubcategory = {
  id: 2103,
  parentId: PRESCRIPTION_CATEGORY_ID,
  name: "其他",
  jpName: "その他",
  enName: "Other",
  sort: 0,
  imageUrl: "/static/images/common/empty.png",
  slug: "other-rx",
  child: null,
};

const csvRowSchema = z.object({
  JAN: z.string(),
  GS1: z.string(),
  薬名: z.string(),
  製造販売元: z.string(),
  大分類: z.string(),
  小分類: z.string(),
  入数: z.string(),
  単位: z.string(),
  "先発・後発": z.string(),
  "売値（税別）": z.string(),
  税率: z.string(),
  "売値（税込）": z.string(),
  商品名: z.string(),
  功效: z.string(),
  商品图片: z.string(),
});

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  let dryRun = false;
  let limit: number | undefined;
  let skipImages = false;
  let csvPath: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run" || arg === "-d") {
      dryRun = true;
    } else if (arg === "--limit" || arg === "-l") {
      const next = argv[i + 1];
      if (!next) {
        throw new Error("缺少 --limit 的数值参数");
      }
      limit = Number(next);
      if (!Number.isFinite(limit) || limit <= 0) {
        throw new Error("limit 必须为正整数");
      }
      i += 1;
    } else if (arg === "--skip-images") {
      skipImages = true;
    } else if (arg === "--csv" || arg === "-c") {
      const next = argv[i + 1];
      if (!next) {
        throw new Error("缺少 --csv 的路径参数");
      }
      csvPath = path.isAbsolute(next) ? next : path.join(PROJECT_ROOT, next);
      i += 1;
    }
  }

  return { dryRun, limit, skipImages, csvPath };
}

async function readCsv(csvPath: string): Promise<CsvRow[]> {
  const content = await fs.readFile(csvPath, "utf8");
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as unknown[];

  return rows.map((row, index) =>
    csvRowSchema.parse(row, {
      path: [`第 ${index + 1} 行`],
    }),
  );
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function hashString(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function buildCategorySlug(name: string): string {
  const ascii = slugify(name, { lower: true, strict: true });
  if (ascii) {
    return ascii;
  }

  const py = pinyin(name, { toneType: "none", type: "array" }).join("-");
  const pySlug = slugify(py, { lower: true, strict: true });
  if (pySlug) {
    return pySlug;
  }

  return `cat-${hashString(name)}`;
}

function toHalfWidth(input: string): string {
  return input
    .replace(/[\uff01-\uff5e]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0xfee0),
    )
    .replace(/\u3000/g, " ");
}

function normalizeCategoryName(name: string): string {
  const half = toHalfWidth(name || "");
  const trimmed = half.trim();
  if (!trimmed) return "其他";
  const mapped = CATEGORY_SYNONYMS[trimmed];
  if (mapped) return mapped;
  const lower = trimmed.toLowerCase();
  const mappedLower = CATEGORY_SYNONYMS[lower];
  return mappedLower || trimmed;
}

function normalizeSlug(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("缺少 JAN / GS1，无法生成 slug");
  }
  const slug = slugify(trimmed, { lower: true, strict: true });
  return slug || trimmed.replace(/\s+/g, "-").toLowerCase();
}

function buildWhitelistedSubcategories(): PrescriptionSubcategory[] {
  return ALLOWED_SUBCATEGORY_NAMES.map((name, index) => {
    const normalizedName = normalizeCategoryName(name);
    return {
      id: START_SUBCATEGORY_ID + index,
      parentId: PRESCRIPTION_CATEGORY_ID,
      name: normalizedName,
      jpName: normalizedName,
      enName: normalizedName,
      sort: ALLOWED_SUBCATEGORY_NAMES.length - index,
      imageUrl: "/static/images/common/empty.png",
      slug: buildCategorySlug(normalizedName),
      child: null,
    } satisfies PrescriptionSubcategory;
  });
}

function buildSubcategoryLookup() {
  const allowedList = buildWhitelistedSubcategories();
  const fallback = ENABLE_FALLBACK_SUBCATEGORY
    ? {
        ...FALLBACK_SUBCATEGORY,
        name: normalizeCategoryName(FALLBACK_SUBCATEGORY.name),
        jpName: FALLBACK_SUBCATEGORY.jpName || FALLBACK_SUBCATEGORY.name,
        enName: FALLBACK_SUBCATEGORY.enName || FALLBACK_SUBCATEGORY.name,
        slug: buildCategorySlug(
          FALLBACK_SUBCATEGORY.slug || FALLBACK_SUBCATEGORY.name,
        ),
      }
    : undefined;

  const lookup = new Map<string, PrescriptionSubcategory>();

  const addToLookup = (item: PrescriptionSubcategory) => {
    lookup.set(normalizeCategoryName(item.name), item);
    lookup.set(buildCategorySlug(item.name), item);
    lookup.set(item.slug, item);
    lookup.set(buildCategorySlug(item.slug), item);
  };

  allowedList.forEach(addToLookup);
  if (fallback) addToLookup(fallback);

  const resolve = (rawName: string): PrescriptionSubcategory => {
    const normalized = normalizeCategoryName(rawName);
    const aliasByName = SUBCATEGORY_ALIASES[normalized];
    const aliasBySlug = SUBCATEGORY_ALIASES[buildCategorySlug(normalized)];
    const canonicalName = aliasByName || aliasBySlug || normalized;
    const byName = lookup.get(normalizeCategoryName(canonicalName));
    const bySlug = lookup.get(buildCategorySlug(canonicalName));
    const hit = byName || bySlug;

    if (hit) return hit;
    if (fallback) return fallback;

    throw new Error(`处方小分类 ${rawName} 不在白名单内，且未启用兜底`);
  };

  return {
    allowedList,
    fallback,
    resolve,
    map: lookup,
  } as const;
}

function deriveNumericId(slug: string): number {
  const digits = slug.replace(/\D/g, "");
  if (!digits) {
    throw new Error(`slug=${slug} 无法提取数字以生成 productId`);
  }
  const num = Number(digits);
  if (Number.isSafeInteger(num)) {
    return num;
  }

  const fallback = Number(digits.slice(-12));
  if (Number.isSafeInteger(fallback)) {
    return fallback;
  }

  return parseInt(hashString(slug).slice(0, 10), 36);
}

function parsePrice(value: string, slug: string): number {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed)) {
    throw new Error(`行 slug=${slug} 的价格无法解析：${value}`);
  }
  return Math.round(parsed);
}

function buildSpec(row: CsvRow): string {
  const qty = row.入数.trim();
  const unit = row.単位.trim();
  const parts = [qty, unit].filter(Boolean);
  return parts.join("/");
}

function buildKeywords(
  effects: string,
  subCategory: string,
  originTag?: string,
): string[] {
  const clean = effects
    .replace(/[。.!！]/g, " ")
    .split(/[,，、/\\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const keywords = [...clean.slice(0, 4)];

  if (subCategory) {
    keywords.push(subCategory);
  }

  if (originTag) {
    keywords.push(originTag);
  }

  return Array.from(new Set(keywords));
}

function originFlag(value: string): "tag:originator" | "tag:generic" | null {
  const normalized = value.trim();
  if (normalized === "先発") return "tag:originator";
  if (normalized === "後発" || normalized === "先發" || normalized === "后发")
    return "tag:generic";
  return null;
}

function buildIdentifier(slug: string): string {
  const parts = slug.split(/[^a-zA-Z0-9]+/).filter(Boolean);
  const camel = parts
    .map((part, index) =>
      index === 0
        ? part.toLowerCase()
        : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
    )
    .join("");
  const safe = camel || slug.replace(/[^a-zA-Z0-9]/g, "");
  return /^[a-zA-Z_]/.test(safe) ? safe : `item${safe}`;
}

async function fileExists(filepath: string) {
  try {
    await fs.access(filepath);
    return true;
  } catch {
    return false;
  }
}

function getExtFromContentType(contentType?: string | null): string {
  if (!contentType) return "jpg";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("gif")) return "gif";
  return "jpg";
}

async function findExistingImageFile(slug: string): Promise<string | null> {
  try {
    const entries = await fs.readdir(IMAGE_DIR);
    const match = entries.find((entry) => entry.startsWith(`${slug}.`));
    return match ? path.join(IMAGE_DIR, match) : null;
  } catch {
    return null;
  }
}

async function downloadImage(
  url: string,
  slug: string,
  skip: boolean,
): Promise<string> {
  if (!url) {
    return PLACEHOLDER_IMAGE;
  }

  const attemptDownload = async () => {
    const existingPath = await findExistingImageFile(slug);
    const existingExt = existingPath
      ? path.extname(existingPath).toLowerCase()
      : null;
    const isImageExt =
      existingExt === ".jpg" ||
      existingExt === ".jpeg" ||
      existingExt === ".png" ||
      existingExt === ".webp" ||
      existingExt === ".gif";

    if (skip && existingPath) {
      return `/product-images/${path.basename(existingPath)}`;
    }

    if (existingPath && isImageExt) {
      return `/product-images/${path.basename(existingPath)}`;
    }

    if (skip) {
      return `/product-images/${slug}.jpg`;
    }

    const response: Response = await fetch(url);
    if (!response.ok) {
      throw new Error(`下载失败 ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    const ext = getExtFromContentType(contentType);
    const fileName = `${slug}.${ext}`;
    const filePath = path.join(IMAGE_DIR, fileName);

    if (existingPath && path.basename(existingPath) === fileName) {
      return `/product-images/${fileName}`;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    if (existingPath && path.basename(existingPath) !== fileName) {
      await fs.rm(existingPath).catch(() => undefined);
    }

    return `/product-images/${fileName}`;
  };

  let lastError: unknown;
  for (let i = 0; i < 3; i += 1) {
    try {
      return await attemptDownload();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 500 * (i + 1)));
    }
  }

  console.warn(`[WARN] 图片 ${url} 下载失败，回退远程 URL`, lastError);
  return url || PLACEHOLDER_IMAGE;
}

async function writeSubcategoryJson(list: PrescriptionSubcategory[]) {
  const sorted = [...list].sort((a, b) => b.sort - a.sort || a.id - b.id);
  const json = JSON.stringify(sorted, null, 2);
  await fs.writeFile(SUBCATEGORY_JSON, `${json}\n`, "utf8");
}

async function findMaxExistingRank(): Promise<number> {
  const entries = await fs.readdir(ITEMS_DIR);
  let maxRank = 0;

  for (const entry of entries) {
    if (entry === "index.ts" || !entry.endsWith(".ts")) continue;
    if (/^\d/.test(entry)) continue;
    const content = await fs.readFile(path.join(ITEMS_DIR, entry), "utf8");
    const match = content.match(/rank:\s*(\d+)/);
    if (match) {
      maxRank = Math.max(maxRank, Number(match[1]));
    }
  }

  return maxRank;
}

function toObjectLiteral(data: unknown): string {
  return JSON.stringify(data, null, 2).replace(/"(\w+)":/g, "$1:");
}

async function writeItemFile(
  identifier: string,
  slug: string,
  record: RawGoodsRecord,
) {
  const objectLiteral = toObjectLiteral(record);
  const content = `import type { RawGoodsRecord } from "../mock-goods-types";

const ${identifier}: RawGoodsRecord = ${objectLiteral};

export default ${identifier};
`;

  const filePath = path.join(ITEMS_DIR, `${slug}.ts`);
  await fs.writeFile(filePath, content, "utf8");
}

async function buildIndexFile(slugs: string[]) {
  const lines: string[] = [
    'import type { RawGoodsRecord } from "../mock-goods-types";',
    "",
  ];
  const identifiers = slugs.map((slug) => buildIdentifier(slug));

  identifiers.forEach((identifier, index) => {
    const slug = slugs[index];
    lines.push(`import ${identifier} from "./${slug}";`);
  });

  lines.push("");
  lines.push("const mockGoodsItems: RawGoodsRecord[] = [");
  identifiers.forEach((identifier) => {
    lines.push(`  ${identifier},`);
  });
  lines.push("];");
  lines.push("");
  lines.push("export default mockGoodsItems;");

  await fs.writeFile(INDEX_PATH, `${lines.join("\n")}\n`, "utf8");
}

async function collectSlugsSortedByRank(): Promise<string[]> {
  const entries = await fs.readdir(ITEMS_DIR);
  const items: { slug: string; rank: number }[] = [];

  for (const entry of entries) {
    if (entry === "index.ts" || !entry.endsWith(".ts")) continue;
    const slug = entry.replace(/\.ts$/, "");
    const content = await fs.readFile(path.join(ITEMS_DIR, entry), "utf8");
    const match = content.match(/rank:\s*(\d+)/);
    const rank = match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
    items.push({ slug, rank });
  }

  return items
    .sort((a, b) => a.rank - b.rank || a.slug.localeCompare(b.slug))
    .map((item) => item.slug);
}

async function main() {
  const args = parseArgs();
  await ensureDir(ITEMS_DIR);
  await ensureDir(IMAGE_DIR);

  const csvPath = args.csvPath || CSV_DEFAULT_PATH;
  const rows = await readCsv(csvPath);
  const limitedRows = args.limit ? rows.slice(0, args.limit) : rows;
  const {
    allowedList,
    fallback,
    resolve: resolveSubcategory,
  } = buildSubcategoryLookup();

  const maxRank = await findMaxExistingRank();
  let rankCursor = maxRank + 1;

  const slugSet = new Set<string>();
  const limit = pLimit(IMAGE_CONCURRENCY);

  const generated: {
    slug: string;
    identifier: string;
    record: RawGoodsRecord;
  }[] = [];

  for (const [index, row] of limitedRows.entries()) {
    const slug = normalizeSlug(row.JAN || row.GS1);
    if (slugSet.has(slug)) {
      throw new Error(`CSV 中存在重复的 JAN/GS1：${slug}`);
    }
    slugSet.add(slug);

    const normalizedSubCategoryName = normalizeCategoryName(row.小分類);
    const subCategory = resolveSubcategory(normalizedSubCategoryName);

    const priceJpy = parsePrice(row["売値（税込）"], slug);
    const priceCny = Number((priceJpy * PRICE_CNY_RATE).toFixed(2));
    const spec = buildSpec(row);
    const effects = row.功效.trim();
    const originTag = originFlag(row["先発・後発"]);
    const keywords = buildKeywords(
      effects,
      subCategory.name,
      originTag || undefined,
    );
    const identifier = buildIdentifier(slug);
    const productId = deriveNumericId(slug);

    const imageTask = limit(() =>
      downloadImage(row.商品图片.trim(), slug, args.skipImages || args.dryRun),
    );
    const imageSrc = await imageTask;

    const record: RawGoodsRecord = {
      productId,
      slug,
      title: row.商品名.trim(),
      jpName: row.薬名.trim(),
      brand: row.製造販売元.trim(),
      spec,
      priceJpy,
      priceCny,
      effects,
      keywords,
      categoryId: PRESCRIPTION_CATEGORY_ID,
      subCategoryId: subCategory.id,
      subCategoryName: subCategory.name,
      image: {
        src: imageSrc,
        alt: row.商品名.trim(),
      },
      collectionHandles: ["prescription"],
      rank: rankCursor + index,
    };

    generated.push({ slug, identifier, record });
  }

  if (args.dryRun) {
    console.log(
      `[dry-run] 即将生成 ${generated.length} 个商品文件，处方子分类严格限制在 ${allowedList.length + (fallback ? 1 : 0)} 个`,
    );
    return;
  }

  await Promise.all(
    generated.map(({ identifier, slug, record }) =>
      writeItemFile(identifier, slug, record),
    ),
  );

  const subcategoryList = [...allowedList, ...(fallback ? [fallback] : [])];
  await writeSubcategoryJson(subcategoryList);

  const sortedSlugs = await collectSlugsSortedByRank();
  await buildIndexFile(sortedSlugs);

  console.log(
    `完成：生成 ${generated.length} 个商品文件，处方子分类共 ${subcategoryList.length} 个`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
