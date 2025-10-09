import type {
  DistributorPartner,
  DistributorPartnerApplication,
  DistributorPartnerApplicationInput,
  DistributorPartnerStatus,
  Paginated,
} from "@shiba/models";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const partners: DistributorPartner[] = [
  {
    id: "SUB-2001",
    name: "深圳康泰门店",
    contact: "王婷 · 136-8899-1022",
    region: "广东 · 深圳",
    status: "active",
    joinedAt: "2023-04-18",
  },
  {
    id: "SUB-2002",
    name: "杭州安心健康馆",
    contact: "李娜 · 135-6677-3388",
    region: "浙江 · 杭州",
    status: "paused",
    joinedAt: "2023-09-05",
    note: "等待总部到店培训安排",
  },
  {
    id: "SUB-2003",
    name: "成都同心诊所",
    contact: "周成 · 139-5566-7722",
    region: "四川 · 成都",
    status: "active",
    joinedAt: "2022-12-12",
  },
  {
    id: "SUB-2004",
    name: "北京颐和门店",
    contact: "刘颖 · 138-9900-5566",
    region: "北京",
    status: "disabled",
    joinedAt: "2021-11-01",
    note: "停用原因：长期未提交订单",
  },
  {
    id: "SUB-2005",
    name: "广州木槿美容馆",
    contact: "陈蕾 · 137-6001-8899",
    region: "广东 · 广州",
    status: "active",
    joinedAt: "2024-02-20",
  },
  {
    id: "SUB-2006",
    name: "西安知源健康",
    contact: "赵峰 · 136-7820-1199",
    region: "陕西 · 西安",
    status: "paused",
    joinedAt: "2023-06-30",
    note: "暂停原因：等待装修升级",
  },
  {
    id: "SUB-2007",
    name: "重庆悦生堂",
    contact: "杨雪 · 135-6650-2277",
    region: "重庆",
    status: "active",
    joinedAt: "2022-03-16",
  },
  {
    id: "SUB-2008",
    name: "南京梵悦美妍",
    contact: "孙倩 · 139-8800-6633",
    region: "江苏 · 南京",
    status: "active",
    joinedAt: "2024-07-08",
  },
  {
    id: "SUB-2009",
    name: "武汉知美门诊",
    contact: "胡静 · 137-5522-7788",
    region: "湖北 · 武汉",
    status: "disabled",
    joinedAt: "2022-09-22",
    note: "停用原因：违规低价售卖",
  },
  {
    id: "SUB-2010",
    name: "天津悦龄会馆",
    contact: "李哲 · 138-2200-5577",
    region: "天津",
    status: "active",
    joinedAt: "2023-03-11",
  },
  {
    id: "SUB-2011",
    name: "长沙翌辰中心",
    contact: "彭航 · 136-7700-8899",
    region: "湖南 · 长沙",
    status: "active",
    joinedAt: "2023-12-19",
  },
  {
    id: "SUB-2012",
    name: "合肥初见医疗",
    contact: "高珊 · 137-9000-1166",
    region: "安徽 · 合肥",
    status: "paused",
    joinedAt: "2024-05-02",
    note: "暂停原因：等待年度考核结果",
  },
];

const partnerById = new Map(partners.map((partner) => [partner.id, partner]));

function sanitizeNote(note?: string | null) {
  const trimmed = note?.trim();
  return trimmed ? trimmed : undefined;
}

export function listDistributorPartners(): Paginated<DistributorPartner> {
  const items = partners.map((partner) => clone(partner));
  return {
    items,
    page: 1,
    pageSize: items.length,
    total: items.length,
  };
}

export function getDistributorPartner(id: string) {
  const partner = partnerById.get(id);
  if (!partner) {
    return undefined;
  }
  return clone(partner);
}

export function updateDistributorPartnerStatus(
  id: string,
  status: DistributorPartnerStatus,
): DistributorPartner | undefined {
  const partner = partnerById.get(id);
  if (!partner) {
    return undefined;
  }

  partner.status = status;
  if (status === "active") {
    partner.note = undefined;
  }

  return clone(partner);
}

export interface DistributorPartnerApplicationRecord
  extends DistributorPartnerApplication {}

const partnerApplications: DistributorPartnerApplicationRecord[] = [];

function generateApplicationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `APP-${crypto.randomUUID()}`;
  }
  return `APP-${Math.random().toString(36).slice(2, 10)}`;
}

export function createDistributorPartnerApplication(
  input: DistributorPartnerApplicationInput,
): DistributorPartnerApplicationRecord {
  const record: DistributorPartnerApplicationRecord = {
    id: generateApplicationId(),
    name: input.name.trim(),
    contact: input.contact.trim(),
    region: input.region.trim(),
    status: "pending",
    note: sanitizeNote(input.note),
    submittedAt: new Date().toISOString(),
  };

  partnerApplications.push(record);
  return clone(record);
}

export function listDistributorPartnerApplications(): DistributorPartnerApplicationRecord[] {
  return partnerApplications.map((application) => clone(application));
}

export function listDistributorPartnerRegions(): string[] {
  return Array.from(new Set(partners.map((partner) => partner.region))).sort();
}
