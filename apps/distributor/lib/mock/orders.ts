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

export interface DistributorOrder {
  id: string;
  type: DistributorOrderType;
  distributorName: string;
  secondaryDistributor?: string;
  submittedAt: string;
  amount: number;
  customerName: string;
  address: string;
  trackingNo: string;
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

export const distributorOrdersMock: DistributorOrdersMock = {
  page: 1,
  pageSize: 20,
  total: 76,
  items: Array.from({ length: 10 }).map((_, index) => ({
    id: `DO-2024-10-${index + 1}`,
    type: index % 2 === 0 ? "primary" : "secondary",
    distributorName: index % 2 === 0 ? "张三" : "王婷",
    secondaryDistributor: index % 2 === 0 ? undefined : "王婷",
    submittedAt: `2024-10-${String(index + 5).padStart(2, "0")} 11:20`,
    amount: 5200 + index * 180,
    customerName: index % 2 === 0 ? "赵杰" : "韩敏",
    address: "深圳市南山区科技南十二路",
    trackingNo: `YT10${index}6327815`,
  })),
};

export function findSalesOrderById(orderId: string) {
  return salesOrdersMock.items.find((order) => order.id === orderId);
}
