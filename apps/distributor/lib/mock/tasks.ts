import type { Task, TaskStatus, TaskUpdateInput } from "@shiba/models";

function cloneTask<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const tasks: Task[] = [
  {
    id: "TASK-0001",
    title: "跟进潜在客户",
    description:
      "联系近期提交问卷的潜在客户，确认需求并记录关键信息，收集痛点与预算",
    dueDate: "2025-10-06T10:00:00+08:00",
    priority: "high",
    status: "pending",
    owner: "王晓",
    relatedCustomerId: "CUS-0006",
    relatedCustomerName: "高霖",
    tags: ["客户跟进", "问卷线索"],
    createdAt: "2025-10-03T09:00:00+08:00",
    updatedAt: "2025-10-03T09:00:00+08:00",
    notes: "确认试用装寄送地址，准备体验反馈模板。",
  },
  {
    id: "TASK-0002",
    title: "审核退款申请",
    description: "核对退款申请材料并同步财务，确认库存回收与折扣政策适用性",
    dueDate: "2025-10-05T12:00:00+08:00",
    priority: "medium",
    status: "completed",
    owner: "李华",
    relatedOrderId: "SO-93015",
    tags: ["售后", "财务联动"],
    createdAt: "2025-10-01T15:30:00+08:00",
    updatedAt: "2025-10-05T10:15:00+08:00",
    completedAt: "2025-10-05T10:15:00+08:00",
    notes: "客户同意换货方案，退款改为折抵积分。",
  },
  {
    id: "TASK-0003",
    title: "补贴政策答疑资料准备",
    description: "整理区域分销补贴政策 FAQ，输出 PPT 与标准回复话术",
    dueDate: "2025-10-08T18:00:00+08:00",
    priority: "medium",
    status: "pending",
    owner: "王晓",
    relatedCustomerId: "CUS-0003",
    relatedCustomerName: "林晨",
    tags: ["渠道管理"],
    createdAt: "2025-10-02T11:00:00+08:00",
    updatedAt: "2025-10-02T11:00:00+08:00",
  },
  {
    id: "TASK-0004",
    title: "交付线上渠道素材",
    description: "根据 A/B 测试反馈更新落地页主视觉与宣传语，打包交付电商团队",
    dueDate: "2025-10-07T17:30:00+08:00",
    priority: "medium",
    status: "in_progress",
    owner: "张敏",
    tags: ["市场物料", "电商渠道"],
    createdAt: "2025-09-30T14:20:00+08:00",
    updatedAt: "2025-10-04T09:10:00+08:00",
  },
  {
    id: "TASK-0005",
    title: "编制 Q4 进货预测",
    description: "结合区域订单趋势完成 SKU 库存测算，提交总部审批",
    dueDate: "2025-10-11T19:00:00+08:00",
    priority: "medium",
    status: "pending",
    owner: "王晓",
    tags: ["渠道管理", "库存"],
    createdAt: "2025-09-28T10:30:00+08:00",
    updatedAt: "2025-09-28T10:30:00+08:00",
  },
  {
    id: "TASK-0006",
    title: "回访新增客户",
    description: "确认首单履约体验并收集交叉销售机会，邀约参加线下沙龙",
    dueDate: "2025-10-12T16:00:00+08:00",
    priority: "low",
    status: "pending",
    owner: "李华",
    relatedCustomerId: "CUS-0002",
    relatedCustomerName: "夏雨",
    tags: ["客户维护"],
    createdAt: "2025-10-01T08:45:00+08:00",
    updatedAt: "2025-10-01T08:45:00+08:00",
  },
];

const tasksById = new Map(tasks.map((task) => [task.id, task]));

function sanitizeNotes(value?: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export function listTasks(): Task[] {
  return tasks.map((task) => cloneTask(task));
}

export function findTaskById(taskId: string) {
  const task = tasksById.get(taskId);
  if (!task) return undefined;
  return cloneTask(task);
}

export function updateTask(taskId: string, input: TaskUpdateInput) {
  const task = tasksById.get(taskId);
  if (!task) {
    return undefined;
  }

  const now = new Date().toISOString();

  if (input.status !== undefined) {
    task.status = input.status;
    if (input.status === "completed") {
      task.completedAt = now;
    } else if (task.completedAt) {
      task.completedAt = undefined;
    }
  }

  if (input.notes !== undefined) {
    task.notes = sanitizeNotes(input.notes);
  }

  task.updatedAt = now;

  return cloneTask(task);
}

export function updateTaskStatus(taskId: string, status: TaskStatus) {
  return updateTask(taskId, { status });
}
