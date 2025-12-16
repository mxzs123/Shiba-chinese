import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";

type Args = {
  csvPath: string;
  dryRun: boolean;
};

type CsvRow = Record<string, string | undefined>;

const PROJECT_ROOT = process.cwd();
const ITEMS_DIR = path.join(PROJECT_ROOT, "lib", "api", "mock-goods-items");
const DEFAULT_CSV_PATH = "/Users/yume/Desktop/gainimabi.csv";

type PatentStatus = "originator" | "generic";

const DEFAULT_JPY_TO_CNY_RATE = 0.05;

function parseArgs(): Args {
  const argv = process.argv.slice(2);
  let csvPath = DEFAULT_CSV_PATH;
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run" || arg === "-d") {
      dryRun = true;
      continue;
    }
    if (arg === "--csv" || arg === "-c") {
      const next = argv[i + 1];
      if (!next) {
        throw new Error("缺少 --csv 的路径参数");
      }
      csvPath = next;
      i += 1;
    }
  }

  return {
    csvPath,
    dryRun,
  };
}

function normalizeJan(value?: string): string {
  if (!value) {
    return "";
  }
  return value.normalize("NFKC").replace(/\D/g, "").trim();
}

function normalizeGs1(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.normalize("NFKC").replace(/\s+/g, "").trim();
  return normalized.length ? normalized : undefined;
}

function cleanText(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const cleaned = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  return cleaned.length ? cleaned : undefined;
}

function normalizeSpecCount(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.normalize("NFKC").replace(/\s+/g, "").trim();
  return normalized.length ? normalized : undefined;
}

function normalizeUnit(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.normalize("NFKC").replace(/\s+/g, "").trim();
  return normalized.length ? normalized : undefined;
}

function normalizePatentStatus(value?: string): PatentStatus | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.normalize("NFKC").replace(/\s+/g, "").trim();
  if (!normalized) {
    return undefined;
  }
  if (normalized.includes("先発")) {
    return "originator";
  }
  if (normalized.includes("後発")) {
    return "generic";
  }
  return undefined;
}

function normalizeJpyAmount(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.normalize("NFKC");
  const digits = normalized.replace(/\D/g, "");
  const parsed = Number.parseInt(digits, 10);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return parsed;
}

function formatNumberLiteral(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(2).replace(/\.?0+$/, "");
}

function updateOrInsertStringProperty(
  source: string,
  key: string,
  value: string,
  insertAfterKey: string,
): string {
  const escapedValue = JSON.stringify(value);
  const existingPattern = new RegExp(`\\b${key}\\s*:\\s*"[^"]*"\\s*,`);

  if (existingPattern.test(source)) {
    return source.replace(existingPattern, `${key}: ${escapedValue},`);
  }

  const insertAnchor = new RegExp(
    `(^\\s*${insertAfterKey}\\s*:\\s*"[^"]*"\\s*,\\s*$)`,
    "m",
  );

  if (insertAnchor.test(source)) {
    return source.replace(
      insertAnchor,
      (match) => `${match}\n  ${key}: ${escapedValue},`,
    );
  }

  throw new Error(`无法找到插入位置：${insertAfterKey}`);
}

function replaceStringProperty(source: string, key: string, value: string) {
  const escapedValue = JSON.stringify(value);
  const pattern = new RegExp(`\\b${key}\\s*:\\s*"[^"]*"\\s*,`);

  if (!pattern.test(source)) {
    throw new Error(`未找到字段：${key}`);
  }

  return source.replace(pattern, `${key}: ${escapedValue},`);
}

function readNumberProperty(source: string, key: string): number | undefined {
  const pattern = new RegExp(`\\b${key}\\s*:\\s*(-?\\d+(?:\\.\\d+)?)\\s*,`);
  const match = source.match(pattern);
  if (!match) {
    return undefined;
  }
  const parsed = Number.parseFloat(match[1]);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }
  return parsed;
}

function replaceNumberProperty(source: string, key: string, value: number) {
  const literal = formatNumberLiteral(value);
  const pattern = new RegExp(`\\b${key}\\s*:\\s*-?\\d+(?:\\.\\d+)?\\s*,`);

  if (!pattern.test(source)) {
    throw new Error(`未找到字段：${key}`);
  }

  return source.replace(pattern, `${key}: ${literal},`);
}

function parseStringArrayLiteral(value: string): string[] {
  const jsonish = value.replace(/,\s*\]/g, "]");
  try {
    const parsed = JSON.parse(jsonish) as unknown;
    if (
      Array.isArray(parsed) &&
      parsed.every((item) => typeof item === "string")
    ) {
      return parsed;
    }
  } catch {
    // fall through
  }

  throw new Error("keywords 字段格式不支持");
}

function formatStringArrayLiteral(
  values: string[],
  indent: string,
  multiline: boolean,
): string {
  if (!multiline) {
    return `[${values.map((item) => JSON.stringify(item)).join(", ")}]`;
  }

  const elementIndent = `${indent}  `;
  const lines = ["["];
  for (const item of values) {
    lines.push(`${elementIndent}${JSON.stringify(item)},`);
  }
  lines.push(`${indent}]`);
  return lines.join("\n");
}

function updateKeywordTag(source: string, status: PatentStatus): string {
  const tag = status === "originator" ? "tag:originator" : "tag:generic";
  const pattern = /^(\s*)keywords\s*:\s*(\[[\s\S]*?\])\s*,/m;
  const match = source.match(pattern);
  if (!match) {
    throw new Error("未找到字段：keywords");
  }

  const indent = match[1] || "";
  const originalArrayText = match[2] || "[]";
  const multiline = originalArrayText.includes("\n");
  const keywords = parseStringArrayLiteral(originalArrayText);

  const cleaned = keywords.filter(
    (item) => item !== "tag:originator" && item !== "tag:generic",
  );
  const deduped = [...new Set(cleaned)];
  deduped.push(tag);

  const nextArrayText = formatStringArrayLiteral(deduped, indent, multiline);
  return source.replace(pattern, `${indent}keywords: ${nextArrayText},`);
}

async function readCsv(csvPath: string): Promise<CsvRow[]> {
  const content = await fs.readFile(csvPath, "utf8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true,
  }) as CsvRow[];
}

async function main() {
  const args = parseArgs();
  const rows = await readCsv(args.csvPath);

  const total = rows.length;
  const seenJan = new Set<string>();

  let duplicateCount = 0;
  let invalidCount = 0;
  let matchedCount = 0;
  let changedCount = 0;
  let skippedNoChangeCount = 0;

  const unmatched: string[] = [];
  const failed: string[] = [];

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const jan = normalizeJan(row.JAN);
    const gs1 = normalizeGs1(row.GS1);
    const title = cleanText(row["商品名"]);
    const jpName = cleanText(row["薬名"]);
    const brand = cleanText(row["製造販売元"]);
    const specCount = normalizeSpecCount(row["入数"]);
    const specUnit = normalizeUnit(row["単位"]);
    const priceJpy = normalizeJpyAmount(row["売値（税込）"]);
    const patentStatus = normalizePatentStatus(row["先発・後発"]);

    if (!jan || jan.length !== 13) {
      invalidCount += 1;
      continue;
    }

    if (seenJan.has(jan)) {
      duplicateCount += 1;
      continue;
    }
    seenJan.add(jan);

    const filePath = path.join(ITEMS_DIR, `${jan}.ts`);
    let original: string;

    try {
      original = await fs.readFile(filePath, "utf8");
    } catch (error) {
      unmatched.push(jan);
      continue;
    }

    matchedCount += 1;

    try {
      let updated = original;

      const originalPriceJpy = readNumberProperty(original, "priceJpy");
      const originalPriceCny = readNumberProperty(original, "priceCny");
      const derivedRate =
        originalPriceJpy && originalPriceJpy > 0 && originalPriceCny
          ? originalPriceCny / originalPriceJpy
          : DEFAULT_JPY_TO_CNY_RATE;

      if (title) {
        updated = replaceStringProperty(updated, "title", title);
        updated = replaceStringProperty(updated, "alt", title);
      }

      if (gs1) {
        updated = updateOrInsertStringProperty(updated, "gs1", gs1, "slug");
      }

      if (jpName) {
        updated = replaceStringProperty(updated, "jpName", jpName);
      }

      if (brand) {
        updated = replaceStringProperty(updated, "brand", brand);
      }

      if (specCount && specUnit) {
        updated = replaceStringProperty(
          updated,
          "spec",
          `${specCount}/${specUnit}`,
        );
      }

      if (priceJpy !== undefined) {
        updated = replaceNumberProperty(updated, "priceJpy", priceJpy);
        const nextPriceCny = Number((priceJpy * derivedRate).toFixed(2));
        updated = replaceNumberProperty(updated, "priceCny", nextPriceCny);
      }

      if (patentStatus) {
        updated = updateKeywordTag(updated, patentStatus);
      }

      if (updated !== original) {
        changedCount += 1;
        if (!args.dryRun) {
          await fs.writeFile(filePath, updated, "utf8");
        }
      } else {
        skippedNoChangeCount += 1;
      }
    } catch (error) {
      failed.push(`${jan} (第 ${i + 1} 行): ${(error as Error).message}`);
    }
  }

  const unique = seenJan.size;
  const successRate = total === 0 ? 0 : matchedCount / total;

  console.log(
    `导入完成：总行数=${total}，唯一JAN=${unique}，命中=${matchedCount}，写入变更=${changedCount}，重复=${duplicateCount}，无效=${invalidCount}，无变更=${skippedNoChangeCount}，成功率=${(
      successRate * 100
    ).toFixed(2)}%${args.dryRun ? " (dry-run)" : ""}`,
  );

  if (unmatched.length) {
    console.log(`未命中 JAN（${unmatched.length}）：`);
    for (const jan of unmatched) {
      console.log(`- ${jan}`);
    }
  }

  if (failed.length) {
    console.log(`处理失败（${failed.length}）：`);
    for (const item of failed) {
      console.log(`- ${item}`);
    }
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
