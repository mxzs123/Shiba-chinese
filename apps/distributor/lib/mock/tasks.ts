export const tasksMock = Array.from({ length: 6 }).map((_, index) => ({
  id: `TASK-${index + 1}`,
  title: index % 2 === 0 ? "跟进潜在客户" : "审核退款申请",
  description:
    index % 2 === 0
      ? "联系近期提交问卷的潜在客户，确认需求并记录关键信息"
      : "核对退款申请材料并同步财务，确保流程闭环",
  dueDate: `2025-10-${String(index + 6).padStart(2, "0")}`,
  completed: index === 1,
}));
