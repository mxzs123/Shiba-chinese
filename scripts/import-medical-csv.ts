import fs from "node:fs/promises";
import path from "node:path";
import { parse } from "csv-parse/sync";

import mockGoodsItems from "../lib/api/mock-goods-items";
import type { RawGoodsRecord } from "../lib/api/mock-goods-types";
import type { MedicalInfo } from "../lib/api/types";

type CsvRow = Record<string, string | undefined>;

const PROJECT_ROOT = process.cwd();
const JAPANESE_CSV_PATH = path.join(PROJECT_ROOT, "public", "japanese.csv");
const CHINESE_CSV_PATH = path.join(PROJECT_ROOT, "public", "chinese.csv");
const OUTPUT_PATH = path.join(
  PROJECT_ROOT,
  "lib",
  "api",
  "mock-goods-medical.ts",
);
const UNMATCHED_LOG_PATH = path.join(PROJECT_ROOT, "unmatched.log");

const JP_KEYS = {
  name: "医薬品名",
  genericName: "一般名",
  efficacy: "効能効果",
  dosage: "用法用量",
  sideEffects: "副作用・注意事項",
  warnings: "警告・禁忌",
  description: "医薬品の説明",
  contentVolume: "内容量",
  dosageForm: "剤形",
  ingredients: "成分一覧",
} as const;

const ZH_KEYS = {
  name: ["药品名", "药品名称", "医薬品名"],
  genericName: ["通用名", "一般名"],
  efficacy: ["功效效果", "功能主治"],
  dosage: ["用法用量", "用法用量(中文)"],
  sideEffects: ["副作用・注意事项", "副作用与注意事项"],
  warnings: ["警告・禁忌", "警告与禁忌"],
  description: ["药品说明", "医薬品の説明"],
  contentVolume: ["规格", "内容量(中文)", "内容量"],
  dosageForm: ["剂型", "剤形"],
  ingredients: ["成分列表", "成分一覧"],
} as const;

function normalizeName(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000]+/g, "")
    .replace(
      /[（）()\[\]［］【】・･·•:：,，．。.。\-–—~〜／/\\]/g,
      "",
    );
}

function cleanText(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const cleaned = value.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  return cleaned.length ? cleaned : undefined;
}

function pickValue(row: CsvRow, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = cleanText(row[key]);
    if (value) {
      return value;
    }
  }
  return undefined;
}

function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }
  const aLen = a.length;
  const bLen = b.length;
  if (!aLen) {
    return bLen;
  }
  if (!bLen) {
    return aLen;
  }

  const matrix: number[][] = Array.from({ length: aLen + 1 }, () =>
    new Array(bLen + 1).fill(0),
  );

  for (let i = 0; i <= aLen; i += 1) {
    matrix[i][0] = i;
  }
  for (let j = 0; j <= bLen; j += 1) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= aLen; i += 1) {
    const aChar = a[i - 1];
    for (let j = 1; j <= bLen; j += 1) {
      const bChar = b[j - 1];
      const cost = aChar === bChar ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  return matrix[aLen][bLen];
}

function findRecordByName(
  jpName: string,
  nameMap: Map<string, RawGoodsRecord>,
  records: RawGoodsRecord[],
): RawGoodsRecord | undefined {
  const normalized = normalizeName(jpName);
  const direct = nameMap.get(normalized);
  if (direct) {
    return direct;
  }

  const containmentCandidates = records.filter((record) => {
    const recordNormalized = normalizeName(record.jpName);
    return (
      normalized.includes(recordNormalized) ||
      recordNormalized.includes(normalized)
    );
  });

  if (containmentCandidates.length === 1) {
    return containmentCandidates[0];
  }

  let best: RawGoodsRecord | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const record of containmentCandidates.length
    ? containmentCandidates
    : records) {
    const distance = levenshtein(normalized, normalizeName(record.jpName));
    if (distance < bestDistance) {
      bestDistance = distance;
      best = record;
    }
  }

  if (!best) {
    return undefined;
  }

  const threshold = Math.max(2, Math.floor(normalized.length * 0.2));
  if (bestDistance <= threshold) {
    return best;
  }

  return undefined;
}

async function readCsv(csvPath: string): Promise<CsvRow[]> {
  const content = await fs.readFile(csvPath, "utf8");
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  }) as CsvRow[];
  return rows;
}

function buildMedicalInfo(
  jpRow: CsvRow,
  zhRow: CsvRow,
  fallbackTitle: string,
): MedicalInfo {
  const nameJp = cleanText(jpRow[JP_KEYS.name]) || "";
  const nameZh =
    pickValue(zhRow, ZH_KEYS.name) ||
    cleanText(zhRow[JP_KEYS.name]) ||
    fallbackTitle ||
    nameJp;

  const info: MedicalInfo = {
    name: { jp: nameJp, zh: nameZh },
  };

  const optionalFields: Array<{
    key: Exclude<keyof MedicalInfo, "name">;
    jpKey: string;
    zhKeys: readonly string[];
  }> = [
    {
      key: "genericName",
      jpKey: JP_KEYS.genericName,
      zhKeys: ZH_KEYS.genericName,
    },
    {
      key: "efficacy",
      jpKey: JP_KEYS.efficacy,
      zhKeys: ZH_KEYS.efficacy,
    },
    {
      key: "dosage",
      jpKey: JP_KEYS.dosage,
      zhKeys: ZH_KEYS.dosage,
    },
    {
      key: "sideEffects",
      jpKey: JP_KEYS.sideEffects,
      zhKeys: ZH_KEYS.sideEffects,
    },
    {
      key: "warnings",
      jpKey: JP_KEYS.warnings,
      zhKeys: ZH_KEYS.warnings,
    },
    {
      key: "description",
      jpKey: JP_KEYS.description,
      zhKeys: ZH_KEYS.description,
    },
    {
      key: "contentVolume",
      jpKey: JP_KEYS.contentVolume,
      zhKeys: ZH_KEYS.contentVolume,
    },
    {
      key: "dosageForm",
      jpKey: JP_KEYS.dosageForm,
      zhKeys: ZH_KEYS.dosageForm,
    },
    {
      key: "ingredients",
      jpKey: JP_KEYS.ingredients,
      zhKeys: ZH_KEYS.ingredients,
    },
  ];

  for (const field of optionalFields) {
    const jpValue = cleanText(jpRow[field.jpKey]);
    const zhValue = pickValue(zhRow, field.zhKeys);
    if (jpValue || zhValue) {
      info[field.key] = {
        jp: jpValue || "",
        zh: zhValue || jpValue || "",
      };
    }
  }

  return info;
}

function sortById(record: Record<number, MedicalInfo>) {
  return Object.fromEntries(
    Object.entries(record).sort(
      ([a], [b]) => Number(a) - Number(b),
    ),
  ) as Record<number, MedicalInfo>;
}

async function main() {
  const [jpRows, zhRows] = await Promise.all([
    readCsv(JAPANESE_CSV_PATH),
    readCsv(CHINESE_CSV_PATH),
  ]);

  if (jpRows.length !== zhRows.length) {
    throw new Error(
      `CSV 行数不一致：japanese.csv=${jpRows.length}, chinese.csv=${zhRows.length}`,
    );
  }

  const nameMap = new Map<string, RawGoodsRecord>();
  for (const record of mockGoodsItems) {
    nameMap.set(normalizeName(record.jpName), record);
  }

  const unmatched: string[] = [];
  const medicalById: Record<number, MedicalInfo> = {};

  for (let i = 0; i < jpRows.length; i += 1) {
    const jpRow = jpRows[i];
    const zhRow = zhRows[i];
    const jpNameRaw = cleanText(jpRow[JP_KEYS.name]);

    if (!jpNameRaw) {
      unmatched.push(`第 ${i + 1} 行：缺少医薬品名`);
      continue;
    }

    const record = findRecordByName(jpNameRaw, nameMap, mockGoodsItems);
    if (!record) {
      unmatched.push(jpNameRaw);
      continue;
    }

    medicalById[record.productId] = buildMedicalInfo(
      jpRow,
      zhRow,
      record.title,
    );
  }

  const sortedMedical = sortById(medicalById);

  const fileContent = `import type { MedicalInfo } from "./types";

export const goodsMedicalInfoById: Record<number, MedicalInfo> = ${JSON.stringify(
    sortedMedical,
    null,
    2,
  )};
`;

  await fs.writeFile(OUTPUT_PATH, fileContent, "utf8");

  if (unmatched.length) {
    await fs.writeFile(UNMATCHED_LOG_PATH, unmatched.join("\n") + "\n", "utf8");
  } else {
    await fs.writeFile(UNMATCHED_LOG_PATH, "", "utf8");
  }

  const total = jpRows.length;
  const matched = Object.keys(medicalById).length;
  const unmatchedCount = unmatched.length;

  // eslint-disable-next-line no-console
  console.log(
    `导入完成：总行数=${total}，命中=${matched}，未命中=${unmatchedCount}`,
  );

  if (unmatchedCount) {
    // eslint-disable-next-line no-console
    console.log("未命中条目：");
    for (const name of unmatched) {
      // eslint-disable-next-line no-console
      console.log(`- ${name}`);
    }
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
