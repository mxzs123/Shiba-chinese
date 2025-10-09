export const salesDashboardMock = {
  revenue: {
    monthlyTrend: [
      { month: "2025-05", value: 186000 },
      { month: "2025-06", value: 204000 },
      { month: "2025-07", value: 228000 },
      { month: "2025-08", value: 256000 },
      { month: "2025-09", value: 284000 },
      { month: "2025-10", value: 312000 },
    ],
    dailyBreakdown: [
      { date: "2025-10-01", value: 12800 },
      { date: "2025-10-02", value: 11200 },
      { date: "2025-10-03", value: 9600 },
      { date: "2025-10-04", value: 14800 },
      { date: "2025-10-05", value: 15300 },
      { date: "2025-10-06", value: 16700 },
      { date: "2025-10-07", value: 14500 },
    ],
  },
  products: [
    { name: "护肝胶囊", amount: 96000, category: "A" },
    { name: "维生素B 复合片", amount: 68800, category: "A" },
    { name: "丁酸梭菌活菌袋", amount: 51200, category: "B" },
    { name: "免疫提升饮品", amount: 38400, category: "B" },
    { name: "益生菌粉", amount: 28800, category: "C" },
  ],
  customers: {
    total: 510,
    newThisMonth: 44,
    demographics: {
      male: 0.47,
      female: 0.53,
      ageGroups: [
        { range: "18-25", ratio: 0.14 },
        { range: "26-35", ratio: 0.36 },
        { range: "36-45", ratio: 0.28 },
        { range: "46-60", ratio: 0.16 },
        { range: "60+", ratio: 0.06 },
      ],
    },
  },
  tasks: [
    {
      id: "task-1",
      title: "完成华东重点客户续签",
      dueDate: "10-09",
      priority: "high",
      summary: "携带新版组合方案，突出返点策略与联合推广权益。",
    },
    {
      id: "task-2",
      title: "交付线上渠道素材",
      dueDate: "10-10",
      priority: "medium",
      summary: "根据 A/B 测试反馈更新落地页主视觉。",
    },
    {
      id: "task-3",
      title: "编制 Q4 进货预测",
      dueDate: "10-11",
      priority: "medium",
      summary: "结合区域订单趋势完成 SKU 库存测算。",
    },
    {
      id: "task-4",
      title: "回访新增客户",
      dueDate: "10-12",
      priority: "low",
      summary: "确认首单履约体验并收集交叉销售机会。",
    },
  ],
};
