export type SalesOrderStatus =
  | "completed"
  | "processing"
  | "shipped"
  | "pending"
  | "refunded";

export interface SalesOrderLineItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesOrder {
  id: string;
  submittedAt: string;
  amount: number;
  paymentMethod: string;
  status: SalesOrderStatus;
  customer: {
    id: string;
    name: string;
    type: string;
    phone: string;
    address: string;
  };
  shipment: {
    date: string;
    trackingNo: string;
    carrier: string;
  };
  items: SalesOrderLineItem[];
  shippingFee: number;
  discount: number;
  note?: string;
}

export interface SalesOrdersMock {
  page: number;
  pageSize: number;
  total: number;
  items: SalesOrder[];
}

export type DistributorOrderType = "primary" | "secondary";

export interface DistributorOrderCustomer {
  id: string;
  name: string;
  type: string;
  phone: string;
  address: string;
}

export interface DistributorOrderShipment {
  date: string;
  trackingNo: string;
  carrier: string;
}

export interface DistributorOrderSecondaryPartner {
  id: string;
  name: string;
  contact: string;
  phone: string;
  region: string;
}

export interface DistributorOrderLineItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DistributorOrder {
  id: string;
  type: DistributorOrderType;
  distributorId: string;
  distributorName: string;
  submittedAt: string;
  amount: number;
  customer: DistributorOrderCustomer;
  shipment?: DistributorOrderShipment;
  secondaryDistributor?: DistributorOrderSecondaryPartner;
  items: DistributorOrderLineItem[];
  shippingFee?: number;
  discount?: number;
  note?: string;
  commissionAmount?: number;
  commissionRate?: number;
}

export interface DistributorOrdersMock {
  page: number;
  pageSize: number;
  total: number;
  items: DistributorOrder[];
}

const productCatalog = [
  { name: "护肝胶囊", sku: "SKU-HEP-001", unitPrice: 1680 },
  { name: "益生菌粉", sku: "SKU-PRO-003", unitPrice: 980 },
  { name: "维生素B 复合片", sku: "SKU-VIT-002", unitPrice: 360 },
  { name: "免疫提升饮品", sku: "SKU-IMM-004", unitPrice: 420 },
  { name: "丁酸梭菌活菌袋", sku: "SKU-GUT-006", unitPrice: 620 },
  { name: "深海鱼油胶囊", sku: "SKU-OME-009", unitPrice: 520 },
];

const customers = [
  {
    name: "李梅",
    type: "个人客户",
    phone: "138-0011-2233",
    address: "上海市徐汇区漕溪北路 398 号",
  },
  {
    name: "张伟",
    type: "分销商客户",
    phone: "139-6677-8899",
    address: "杭州市西湖区古翠路 88 号",
  },
  {
    name: "王婷",
    type: "个人客户",
    phone: "137-5566-7788",
    address: "深圳市南山区科技南十二路",
  },
  {
    name: "陈浩",
    type: "企业客户",
    phone: "136-8899-1122",
    address: "北京市朝阳区望京东路 11 号",
  },
];

const paymentMethods = ["微信支付", "支付宝", "企业转账", "银联在线"] as const;
const carriers = ["顺丰速运", "京东物流", "极兔速递", "中通快递"] as const;
const statuses: SalesOrderStatus[] = [
  "completed",
  "processing",
  "shipped",
  "pending",
  "refunded",
];

const primaryDistributors = [
  {
    id: "DIST-1001",
    name: "华南总代",
    contact: "陈涛",
    phone: "138-2200-1188",
  },
  {
    id: "DIST-1002",
    name: "沪上优选",
    contact: "赵敏",
    phone: "139-8800-6611",
  },
  {
    id: "DIST-1003",
    name: "西北渠道中心",
    contact: "张鹏",
    phone: "137-4433-7722",
  },
];

const secondaryDistributors = [
  {
    id: "SUB-2001",
    name: "深圳康泰门店",
    contact: "王婷",
    phone: "136-8899-1022",
    region: "广东 · 深圳",
  },
  {
    id: "SUB-2002",
    name: "杭州安心健康馆",
    contact: "李娜",
    phone: "135-6677-3388",
    region: "浙江 · 杭州",
  },
  {
    id: "SUB-2003",
    name: "成都同心诊所",
    contact: "周成",
    phone: "139-5566-7722",
    region: "四川 · 成都",
  },
  {
    id: "SUB-2004",
    name: "北京颐和门店",
    contact: "刘颖",
    phone: "138-9900-5566",
    region: "北京",
  },
];

const primaryCommissionRates = [0.12, 0.11, 0.1];
const secondaryCommissionRates = [0.08, 0.075, 0.07];

function addDays(base: Date, days: number) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function formatDateTime(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hour = String(value.getHours()).padStart(2, "0");
  const minute = String(value.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function formatDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createLineItem(
  productIndex: number,
  quantity: number,
  seed: number,
): SalesOrderLineItem {
  const product = productCatalog[productIndex % productCatalog.length]!;
  const total = product.unitPrice * quantity;
  return {
    id: `${product.sku}-${seed}`,
    name: product.name,
    sku: product.sku,
    quantity,
    unitPrice: product.unitPrice,
    total,
  };
}

function createSalesOrder(index: number): SalesOrder {
  const baseDate = new Date("2024-10-05T09:30:00");
  const submittedAtDate = addDays(baseDate, index);
  const shipmentDate = addDays(submittedAtDate, 2);

  const status = statuses[index % statuses.length]!;
  const paymentMethod = paymentMethods[index % paymentMethods.length]!;
  const carrier = carriers[index % carriers.length]!;
  const customerSeed = customers[index % customers.length]!;
  const quantitySeed = (index % 3) + 1;

  const lineItems: SalesOrderLineItem[] = [
    createLineItem(index, quantitySeed, index),
    createLineItem(
      index + 2,
      quantitySeed === 3 ? 1 : quantitySeed + 1,
      index + 50,
    ),
  ];

  const merchandiseTotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const shippingFee = index % 3 === 0 ? 0 : 35;
  const discount = index % 4 === 0 ? 180 : index % 5 === 0 ? 90 : 0;
  const amount = merchandiseTotal + shippingFee - discount;

  return {
    id: `SO-2024-10-${String(index + 1).padStart(3, "0")}`,
    submittedAt: formatDateTime(submittedAtDate),
    amount,
    paymentMethod,
    status,
    customer: {
      id: `CUST-2024-${String(index + 1).padStart(4, "0")}`,
      name: customerSeed.name,
      type: customerSeed.type,
      phone: customerSeed.phone,
      address: customerSeed.address,
    },
    shipment: {
      date: formatDate(shipmentDate),
      trackingNo: `SF${String(1365000 + index).padStart(8, "0")}`,
      carrier,
    },
    items: lineItems,
    shippingFee,
    discount,
    note:
      index % 6 === 0
        ? "客户备注：货到后联系前台确认签收。"
        : index % 7 === 0
          ? "客户备注：请在上午送达，避免午休时间。"
          : undefined,
  };
}

export const salesOrdersMock: SalesOrdersMock = {
  page: 1,
  pageSize: 10,
  total: 30,
  items: Array.from({ length: 30 }).map((_, index) => createSalesOrder(index)),
};

function mapDistributorItems(
  items: SalesOrderLineItem[],
): DistributorOrderLineItem[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
  }));
}

function createDistributorOrder(index: number): DistributorOrder {
  const base = createSalesOrder(index);
  const distributor = primaryDistributors[index % primaryDistributors.length]!;
  const secondary =
    secondaryDistributors[index % secondaryDistributors.length]!;
  const isSecondary = index % 3 === 1;
  const primaryCommissionRate =
    primaryCommissionRates[index % primaryCommissionRates.length]!;
  const secondaryCommissionRate =
    secondaryCommissionRates[index % secondaryCommissionRates.length]!;

  if (!isSecondary) {
    return {
      id: `DO-${String(20241000 + index)}`,
      type: "primary",
      distributorId: distributor.id,
      distributorName: distributor.name,
      submittedAt: base.submittedAt,
      amount: base.amount,
      customer: {
        id: base.customer.id,
        name: base.customer.name,
        type: base.customer.type,
        phone: base.customer.phone,
        address: base.customer.address,
      },
      shipment: {
        date: base.shipment.date,
        trackingNo: base.shipment.trackingNo,
        carrier: base.shipment.carrier,
      },
      items: mapDistributorItems(base.items),
      shippingFee: base.shippingFee,
      discount: base.discount,
      note: base.note,
      commissionAmount: Number(
        (base.amount * primaryCommissionRate).toFixed(2),
      ),
    };
  }

  return {
    id: `SD-${String(20241000 + index)}`,
    type: "secondary",
    distributorId: distributor.id,
    distributorName: distributor.name,
    submittedAt: base.submittedAt,
    amount: base.amount,
    customer: {
      id: base.customer.id,
      name: base.customer.name,
      type: base.customer.type,
      phone: base.customer.phone,
      address: base.customer.address,
    },
    secondaryDistributor: {
      id: secondary.id,
      name: secondary.name,
      contact: secondary.contact,
      phone: secondary.phone,
      region: secondary.region,
    },
    items: mapDistributorItems(base.items),
    shippingFee: base.shippingFee,
    discount: base.discount,
    note: base.note,
    commissionAmount: Number(
      (base.amount * secondaryCommissionRate).toFixed(2),
    ),
    commissionRate: Number(secondaryCommissionRate.toFixed(4)),
  };
}

export const distributorOrdersMock: DistributorOrdersMock = {
  page: 1,
  pageSize: 10,
  total: 36,
  items: Array.from({ length: 36 }).map((_, index) =>
    createDistributorOrder(index),
  ),
};

export function findSalesOrderById(orderId: string) {
  return salesOrdersMock.items.find((order) => order.id === orderId);
}
