import {
  type Customer,
  type CustomerFollowUp,
  type CustomerFollowUpCreateInput,
  type CustomerFollowUpUpdateInput,
  type Paginated,
} from "@shiba/models";

function cloneCustomer<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sortByPlannedAtAsc(a: CustomerFollowUp, b: CustomerFollowUp) {
  return new Date(a.plannedAt).getTime() - new Date(b.plannedAt).getTime();
}

function resolveNextFollowUp(followUps: CustomerFollowUp[]) {
  const pending = [...followUps]
    .filter((item) => item.status === "pending")
    .sort(sortByPlannedAtAsc);
  return pending[0]?.plannedAt;
}

function resolveLastFollowUp(followUps: CustomerFollowUp[]) {
  if (followUps.length === 0) {
    return undefined;
  }

  const completed = [...followUps]
    .filter((item) => item.status === "completed")
    .sort((a, b) => {
      const getTimestamp = (record: CustomerFollowUp) =>
        new Date(record.updatedAt ?? record.plannedAt).getTime();
      return getTimestamp(b) - getTimestamp(a);
    });

  const [latestCompleted] = completed;
  if (latestCompleted) {
    return latestCompleted.updatedAt ?? latestCompleted.plannedAt;
  }

  const sorted = [...followUps].sort(sortByPlannedAtAsc);
  const last = sorted.at(-1);
  return last ? last.plannedAt : undefined;
}

function recalculateCustomer(customer: Customer) {
  customer.followUps.sort(sortByPlannedAtAsc);
  customer.nextFollowUpAt = resolveNextFollowUp(customer.followUps);
  customer.lastFollowUpAt = resolveLastFollowUp(customer.followUps);

  return customer;
}

const customers: Customer[] = [
  {
    id: "CUS-0001",
    name: "陈楠",
    gender: "male",
    birthDate: "1995-03-18",
    age: 30,
    region: { country: "中国", province: "上海", city: "上海" },
    contact: {
      phone: "13800000001",
      wechat: "chen_nan",
      email: "chen.nan@example.com",
    },
    address: "上海市浦东新区世纪大道 1 号",
    type: "personal",
    level: "vip",
    status: "in_progress",
    source: "official_site",
    registeredAt: "2024-06-18",
    salesOwner: "王晓",
    tags: ["高客单", "关注抗衰"],
    notes: "对治疗周期和副作用有详细咨询，倾向高端方案。",
    totalOrders: 6,
    totalAmount: 128000,
    recentOrderId: "SO-92121",
    followUps: [
      {
        id: "CUS-0001-FU-1",
        title: "初次治疗反馈回访",
        plannedAt: "2024-09-12T10:00:00+08:00",
        channel: "wechat",
        status: "completed",
        notes: "反馈麻醉体验良好，建议安排复查",
        createdAt: "2024-09-05T09:30:00+08:00",
        updatedAt: "2024-09-12T10:45:00+08:00",
      },
      {
        id: "CUS-0001-FU-2",
        title: "节前抗衰组合介绍",
        plannedAt: "2024-10-16T15:00:00+08:00",
        channel: "call",
        status: "pending",
        notes: "重点强调限时优惠和疗程组合",
        createdAt: "2024-09-20T11:00:00+08:00",
        updatedAt: "2024-09-20T11:00:00+08:00",
      },
    ],
  },
  {
    id: "CUS-0002",
    name: "夏雨",
    gender: "female",
    birthDate: "1992-11-02",
    age: 32,
    region: { country: "中国", province: "浙江", city: "杭州" },
    contact: { phone: "13900000002", wechat: "xiayu92" },
    address: "杭州市西湖区玉古路 18 号",
    type: "personal",
    level: "standard",
    status: "converted",
    source: "sns",
    registeredAt: "2023-12-05",
    salesOwner: "李华",
    tags: ["高粘性", "社群传播"],
    notes: "愿意分享体验至社群，适合邀请参加活动。",
    totalOrders: 3,
    totalAmount: 46500,
    recentOrderId: "SO-91802",
    followUps: [
      {
        id: "CUS-0002-FU-1",
        title: "社群分享素材确认",
        plannedAt: "2024-08-20T19:30:00+08:00",
        channel: "wechat",
        status: "completed",
        notes: "已同意下周推送体验帖",
        createdAt: "2024-08-15T16:00:00+08:00",
        updatedAt: "2024-08-20T20:10:00+08:00",
      },
      {
        id: "CUS-0002-FU-2",
        title: "邀请线下茶话会",
        plannedAt: "2024-10-08T14:00:00+08:00",
        channel: "message",
        status: "pending",
        notes: "准备活动流程与嘉宾介绍",
        createdAt: "2024-09-25T09:20:00+08:00",
        updatedAt: "2024-09-25T09:20:00+08:00",
      },
    ],
  },
  {
    id: "CUS-0003",
    name: "林晨",
    gender: "male",
    birthDate: "1985-05-11",
    age: 40,
    region: { country: "中国", province: "广东", city: "广州" },
    contact: {
      phone: "13700000003",
      email: "lin.chen@example.com",
    },
    address: "广州市天河区珠江新城花城大道 38 号",
    type: "distributor",
    level: "vip",
    status: "in_progress",
    source: "agency",
    registeredAt: "2024-02-11",
    salesOwner: "王晓",
    tags: ["分销商", "重点跟进"],
    notes: "正在评估成为区域分销的激励方案。",
    totalOrders: 9,
    totalAmount: 210500,
    recentOrderId: "SO-93015",
    followUps: [
      {
        id: "CUS-0003-FU-1",
        title: "季度进货计划沟通",
        plannedAt: "2024-09-30T09:30:00+08:00",
        channel: "meeting",
        status: "completed",
        notes: "确认 10 月份首批备货 60 套",
        createdAt: "2024-09-12T13:00:00+08:00",
        updatedAt: "2024-09-30T11:00:00+08:00",
      },
      {
        id: "CUS-0003-FU-2",
        title: "补贴政策答疑",
        plannedAt: "2024-10-18T11:00:00+08:00",
        channel: "call",
        status: "pending",
        notes: "对返点比例有疑问，准备案例说明",
        createdAt: "2024-10-01T14:20:00+08:00",
        updatedAt: "2024-10-01T14:20:00+08:00",
      },
    ],
  },
  {
    id: "CUS-0004",
    name: "王悦",
    gender: "female",
    birthDate: "1997-07-26",
    age: 28,
    region: { country: "中国", province: "北京", city: "北京" },
    contact: { phone: "13600000004", wechat: "wangyue" },
    address: "北京市朝阳区望京东路 19 号",
    type: "personal",
    level: "prospect",
    status: "paused",
    source: "member_event",
    registeredAt: "2024-08-02",
    salesOwner: "张敏",
    tags: ["价格敏感", "活动意向"],
    notes: "正在观望竞争方案，建议提供安心保障材料。",
    totalOrders: 0,
    totalAmount: 0,
    recentOrderId: undefined,
    followUps: [
      {
        id: "CUS-0004-FU-1",
        title: "方案预算确认",
        plannedAt: "2024-09-15T16:00:00+08:00",
        channel: "email",
        status: "cancelled",
        notes: "客户临时出差改期",
        createdAt: "2024-09-10T15:00:00+08:00",
        updatedAt: "2024-09-14T08:00:00+08:00",
      },
      {
        id: "CUS-0004-FU-2",
        title: "提供竞争报价对比",
        plannedAt: "2024-10-22T13:30:00+08:00",
        channel: "email",
        status: "pending",
        notes: "附带专家认证与案例",
        createdAt: "2024-09-28T10:00:00+08:00",
        updatedAt: "2024-09-28T10:00:00+08:00",
      },
    ],
  },
  {
    id: "CUS-0005",
    name: "陆航",
    gender: "male",
    birthDate: "1979-01-08",
    age: 46,
    region: { country: "中国", province: "江苏", city: "苏州" },
    contact: {
      phone: "13500000005",
      wechat: "luhang_suzhou",
      email: "lu.hang@example.com",
    },
    address: "苏州市工业园区星湖街 88 号",
    type: "personal",
    level: "vvip",
    status: "converted",
    source: "referral",
    registeredAt: "2022-11-18",
    salesOwner: "王晓",
    tags: ["老客户", "高复购"],
    notes: "偏好线下专属服务，重视恢复期管理。",
    totalOrders: 18,
    totalAmount: 398000,
    recentOrderId: "SO-90561",
    followUps: [
      {
        id: "CUS-0005-FU-1",
        title: "年度体检报告跟进",
        plannedAt: "2024-08-02T09:00:00+08:00",
        channel: "meeting",
        status: "completed",
        notes: "建议补充营养方案",
        createdAt: "2024-07-25T15:30:00+08:00",
        updatedAt: "2024-08-02T11:00:00+08:00",
      },
      {
        id: "CUS-0005-FU-2",
        title: "年终疗程规划",
        plannedAt: "2024-11-05T10:30:00+08:00",
        channel: "meeting",
        status: "pending",
        notes: "需协调专家排期",
        createdAt: "2024-09-18T14:45:00+08:00",
        updatedAt: "2024-09-18T14:45:00+08:00",
      },
    ],
  },
  {
    id: "CUS-0006",
    name: "高霖",
    gender: "female",
    birthDate: "1990-04-30",
    age: 35,
    region: { country: "中国", province: "四川", city: "成都" },
    contact: {
      phone: "13800000006",
      wechat: "gaolin_cd",
    },
    address: "成都市高新区天府二街 266 号",
    type: "personal",
    level: "standard",
    status: "in_progress",
    source: "official_site",
    registeredAt: "2024-04-02",
    salesOwner: "张敏",
    tags: ["小白用户", "关注体验"],
    notes: "担心恢复期影响工作，需更多安心指导。",
    totalOrders: 1,
    totalAmount: 8600,
    recentOrderId: "SO-93412",
    followUps: [
      {
        id: "CUS-0006-FU-1",
        title: "术后护理提醒",
        plannedAt: "2024-09-08T18:00:00+08:00",
        channel: "message",
        status: "completed",
        createdAt: "2024-09-07T12:00:00+08:00",
        updatedAt: "2024-09-08T18:05:00+08:00",
      },
      {
        id: "CUS-0006-FU-2",
        title: "介绍体验官项目",
        plannedAt: "2024-10-12T20:00:00+08:00",
        channel: "wechat",
        status: "pending",
        notes: "邀约成为半年体验官",
        createdAt: "2024-09-25T20:30:00+08:00",
        updatedAt: "2024-09-25T20:30:00+08:00",
      },
    ],
  },
  {
    id: "CUS-0007",
    name: "赵彤",
    gender: "female",
    birthDate: "1988-01-19",
    age: 37,
    region: { country: "中国", province: "湖北", city: "武汉" },
    contact: { phone: "13900000007", email: "zhaotong@example.com" },
    address: "武汉市武昌区中北路 66 号",
    type: "personal",
    level: "vip",
    status: "lost",
    source: "overseas_clinic",
    registeredAt: "2023-05-19",
    salesOwner: "李华",
    tags: ["对比出国方案", "高敏感度"],
    notes: "近期选择海外项目，需维护关系等待回流机会。",
    totalOrders: 2,
    totalAmount: 28600,
    recentOrderId: "SO-88101",
    followUps: [
      {
        id: "CUS-0007-FU-1",
        title: "回访了解海外项目进度",
        plannedAt: "2024-08-05T10:00:00+08:00",
        channel: "call",
        status: "completed",
        notes: "对海外服务不够满意，半年后考虑回流",
        createdAt: "2024-07-28T09:00:00+08:00",
        updatedAt: "2024-08-05T10:35:00+08:00",
      },
    ],
  },
  {
    id: "CUS-0008",
    name: "何远",
    gender: "male",
    birthDate: "1993-12-14",
    age: 31,
    region: { country: "中国", province: "福建", city: "厦门" },
    contact: {
      phone: "13700000008",
      wechat: "he_yuan",
      email: "he.yuan@example.com",
    },
    address: "厦门市思明区观音山国际商务区 19 号",
    type: "distributor",
    level: "standard",
    status: "in_progress",
    source: "agency",
    registeredAt: "2024-07-01",
    salesOwner: "张敏",
    tags: ["渠道扩展", "关注培训"],
    notes: "计划年底前启动美容院合作，重视培训与开业支持。",
    totalOrders: 2,
    totalAmount: 65500,
    recentOrderId: "SO-93991",
    followUps: [
      {
        id: "CUS-0008-FU-1",
        title: "培训体系介绍",
        plannedAt: "2024-09-18T15:30:00+08:00",
        channel: "meeting",
        status: "completed",
        notes: "需提供门店 SOP 文件",
        createdAt: "2024-09-05T13:00:00+08:00",
        updatedAt: "2024-09-18T16:20:00+08:00",
      },
      {
        id: "CUS-0008-FU-2",
        title: "签约流程确认",
        plannedAt: "2024-10-28T10:00:00+08:00",
        channel: "call",
        status: "pending",
        notes: "同步法务合同版本",
        createdAt: "2024-10-03T09:45:00+08:00",
        updatedAt: "2024-10-03T09:45:00+08:00",
      },
    ],
  },
];

customers.forEach(recalculateCustomer);

const customersById = new Map(
  customers.map((customer) => [customer.id, customer]),
);

function paginateCustomers(): Paginated<Customer> {
  return {
    items: customers.map((customer) => cloneCustomer(customer)),
    page: 1,
    pageSize: customers.length,
    total: customers.length,
  };
}

export function listCustomers() {
  return paginateCustomers();
}

export function findCustomerById(id: string) {
  const customer = customersById.get(id);
  if (!customer) {
    return undefined;
  }
  return cloneCustomer(customer);
}

function generateFollowUpId(customerId: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `FU-${crypto.randomUUID()}`;
  }
  return `${customerId}-FU-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeNotes(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function createCustomerFollowUp(
  customerId: string,
  input: CustomerFollowUpCreateInput,
) {
  const customer = customersById.get(customerId);
  if (!customer) {
    return undefined;
  }

  const now = new Date().toISOString();
  const followUp: CustomerFollowUp = {
    id: generateFollowUpId(customerId),
    title: input.title.trim(),
    plannedAt: input.plannedAt,
    channel: input.channel,
    status: "pending",
    notes: sanitizeNotes(input.notes),
    createdAt: now,
    updatedAt: now,
  };

  customer.followUps.push(followUp);
  recalculateCustomer(customer);

  return cloneCustomer(customer);
}

export function updateCustomerFollowUp(
  customerId: string,
  followUpId: string,
  input: CustomerFollowUpUpdateInput,
) {
  const customer = customersById.get(customerId);
  if (!customer) {
    return undefined;
  }

  const target = customer.followUps.find((item) => item.id === followUpId);
  if (!target) {
    return undefined;
  }

  if (input.title !== undefined) {
    target.title = input.title.trim();
  }
  if (input.plannedAt !== undefined) {
    target.plannedAt = input.plannedAt;
  }
  if (input.channel !== undefined) {
    target.channel = input.channel;
  }
  if (input.status !== undefined) {
    target.status = input.status;
  }
  if (input.notes !== undefined) {
    target.notes = sanitizeNotes(input.notes);
  }

  target.updatedAt = new Date().toISOString();
  recalculateCustomer(customer);

  return cloneCustomer(customer);
}

export function deleteCustomerFollowUp(customerId: string, followUpId: string) {
  const customer = customersById.get(customerId);
  if (!customer) {
    return undefined;
  }

  const index = customer.followUps.findIndex((item) => item.id === followUpId);
  if (index === -1) {
    return undefined;
  }

  customer.followUps.splice(index, 1);
  recalculateCustomer(customer);

  return cloneCustomer(customer);
}
