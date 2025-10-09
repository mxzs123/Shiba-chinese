export const salesDashboardMock = {
  revenue: {
    monthlyTotal: 268000,
    trend: [
      { month: "2025-05", value: 32000 },
      { month: "2025-06", value: 41000 },
      { month: "2025-07", value: 46000 },
      { month: "2025-08", value: 52000 },
      { month: "2025-09", value: 69000 },
      { month: "2025-10", value: 48000 },
    ],
    dailyBreakdown: [
      { date: "2025-10-01", value: 4200 },
      { date: "2025-10-02", value: 5100 },
      { date: "2025-10-03", value: 4800 },
      { date: "2025-10-04", value: 5600 },
      { date: "2025-10-05", value: 6300 },
      { date: "2025-10-06", value: 5900 },
      { date: "2025-10-07", value: 6100 },
    ],
  },
  products: [
    { name: "护肝胶囊", amount: 86000, category: "A" },
    { name: "维生素B 复合片", amount: 54000, category: "A" },
    { name: "丁酸梭菌活菌袋", amount: 41000, category: "B" },
    { name: "益生菌粉", amount: 32000, category: "B" },
    { name: "免疫提升饮品", amount: 25000, category: "C" },
  ],
  customers: {
    total: 420,
    newThisMonth: 32,
    demographics: {
      male: 0.48,
      female: 0.52,
      ageGroups: [
        { range: "18-25", ratio: 0.12 },
        { range: "26-35", ratio: 0.33 },
        { range: "36-45", ratio: 0.27 },
        { range: "46-60", ratio: 0.18 },
        { range: "60+", ratio: 0.1 },
      ],
    },
  },
  tasks: [
    {
      id: "task-1",
      title: "联系上月未完成跟进的客户",
      dueDate: "2025-10-09",
      priority: "high",
      summary: "优先处理高价值客户的续签意向，并更新 CRM 跟进记录。",
    },
    {
      id: "task-2",
      title: "整理本月新客户需求反馈",
      dueDate: "2025-10-10",
      priority: "medium",
      summary: "汇总客户反馈给产品团队，标注高频痛点。",
    },
    {
      id: "task-3",
      title: "准备下周的二级分销商培训资料",
      dueDate: "2025-10-12",
      priority: "low",
      summary: "整理培训大纲和案例，确认讲师及参会名单。",
    },
  ],
};
