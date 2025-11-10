import fs from "fs/promises";
import path from "path";

// 轻量级本地持久化（仅内测使用）。
// 将一次性订单等数据写入到 JSON 文件，默认路径 test-results/one-time-orders.json。

type MockRecord = {
  id: string;
  type: string;
  createdAt: string;
  payload: unknown;
};

const DEFAULT_FILE = path.join(process.cwd(), "test-results", "one-time-orders.json");

function getStoreFilePath() {
  const custom = process.env.MOCK_DB_PATH;
  if (custom && custom.trim().length > 0) {
    return path.isAbsolute(custom) ? custom : path.join(process.cwd(), custom);
  }
  return DEFAULT_FILE;
}

async function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

export async function readAll(): Promise<MockRecord[]> {
  const file = getStoreFilePath();
  try {
    const buf = await fs.readFile(file, "utf-8");
    const parsed = JSON.parse(buf);
    return Array.isArray(parsed) ? (parsed as MockRecord[]) : [];
  } catch {
    return [];
  }
}

export async function appendRecord(record: MockRecord): Promise<void> {
  const file = getStoreFilePath();
  await ensureDir(file);
  const all = await readAll();
  all.unshift(record);
  const MAX = Number(process.env.MOCK_DB_MAX || 500);
  const trimmed = all.slice(0, Math.max(1, MAX));
  await fs.writeFile(file, JSON.stringify(trimmed, null, 2), "utf-8");
}

export function createRecord(type: string, payload: unknown): MockRecord {
  return {
    id: `rec_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    createdAt: new Date().toISOString(),
    payload,
  };
}
