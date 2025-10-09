export const salesOrdersMock = {
  page: 1,
  pageSize: 20,
  total: 124,
  items: Array.from({ length: 10 }).map((_, index) => ({
    id: `SO-2024-10-${index + 1}`,
    submittedAt: `2024-10-${String(index + 4).padStart(2, "0")} 09:30`,
    amount: 2800 + index * 120,
    status:
      index % 3 === 0
        ? "completed"
        : index % 3 === 1
          ? "processing"
          : "shipped",
    customer: {
      id: `CUST-${index + 1}`,
      name: index % 2 === 0 ? "李梅" : "张伟",
      type: index % 2 === 0 ? "个人客户" : "分销商客户",
      phone: "138-0000-0000",
      address: "上海市徐汇区漕溪北路 398 号",
    },
    shipment: {
      date: "2024-10-12",
      trackingNo: `SF10${index}2938745`,
    },
  })),
};

export const distributorOrdersMock = {
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
