import { salesDashboardMock } from "../../../lib/mock/sales-dashboard";

const PRIORITY_ORDER = ["high", "medium", "low"] as const;

export type TaskPriority = (typeof PRIORITY_ORDER)[number];

export interface SalesTask {
  id: string;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  summary?: string;
}

export interface SalesTaskSummary {
  total: number;
  byPriority: Record<TaskPriority, number>;
}

export interface RevenueTrendPoint {
  month: string;
  value: number;
  shortLabel: string;
}

export interface DailyTrendPoint {
  date: string;
  value: number;
  shortLabel: string;
}

export interface RevenueOverviewData {
  monthlyTrend: RevenueTrendPoint[];
  dailyTrend: DailyTrendPoint[];
  latestMonthLabel: string;
  latestValue: number;
  previousValue: number | null;
  growthRatio: number | null;
  monthCount: number;
}

export interface ProductContributionItem {
  name: string;
  amount: number;
  category: string;
  ratio: number;
}

export interface CustomerGenderSlice {
  label: "女" | "男";
  ratio: number;
}

export interface CustomerAgeSlice {
  range: string;
  ratio: number;
}

export interface CustomerInsightsData {
  total: number;
  newThisMonth: number;
  gender: CustomerGenderSlice[];
  ageGroups: CustomerAgeSlice[];
  dominantAgeGroup: CustomerAgeSlice | null;
}

export interface SalesDashboardViewModel {
  tasks: {
    items: SalesTask[];
    summary: SalesTaskSummary;
  };
  revenue: RevenueOverviewData;
  products: ProductContributionItem[];
  customers: CustomerInsightsData;
}

function formatMonthLabel(raw: string) {
  const [, month] = raw.split("-");
  return `${Number.parseInt(month ?? "0", 10)}月`;
}

function formatDayLabel(raw: string) {
  return raw.slice(5);
}

export function getSalesDashboardViewModel(): SalesDashboardViewModel {
  const { revenue, products, customers, tasks } = salesDashboardMock;

  const monthlyTrend = revenue.monthlyTrend.map((item) => ({
    month: item.month,
    value: item.value,
    shortLabel: formatMonthLabel(item.month),
  }));

  const dailyTrend = revenue.dailyBreakdown.map((item) => ({
    date: item.date,
    value: item.value,
    shortLabel: formatDayLabel(item.date),
  }));

  const latestMonthlyPoint = monthlyTrend.at(-1) ?? null;
  const previousMonthlyPoint = monthlyTrend.at(-2) ?? null;

  const growthRatio =
    latestMonthlyPoint && previousMonthlyPoint
      ? (latestMonthlyPoint.value - previousMonthlyPoint.value) /
        Math.max(previousMonthlyPoint.value, 1)
      : null;

  const productTotal = products.reduce((total, item) => total + item.amount, 0);

  const productContribution = [...products]
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      name: item.name,
      amount: item.amount,
      category: item.category,
      ratio: productTotal > 0 ? item.amount / productTotal : 0,
    }));

  const normalizePriority = (value: string): TaskPriority =>
    PRIORITY_ORDER.includes(value as TaskPriority)
      ? (value as TaskPriority)
      : "low";

  const normalizedTasks = tasks.map((task) => ({
    ...task,
    priority: normalizePriority(task.priority),
  }));

  const sortedTasks = [...normalizedTasks].sort((a, b) => {
    const priorityWeight = (priority: TaskPriority) =>
      PRIORITY_ORDER.indexOf(priority);
    const diff = priorityWeight(a.priority) - priorityWeight(b.priority);
    return diff !== 0 ? diff : a.dueDate.localeCompare(b.dueDate);
  });

  const taskSummary: SalesTaskSummary = {
    total: normalizedTasks.length,
    byPriority: PRIORITY_ORDER.reduce(
      (acc, priority) => ({
        ...acc,
        [priority]: normalizedTasks.filter((task) => task.priority === priority)
          .length,
      }),
      {} as Record<TaskPriority, number>,
    ),
  };

  const genderSlices: CustomerGenderSlice[] = [
    { label: "女", ratio: customers.demographics.female },
    { label: "男", ratio: customers.demographics.male },
  ];

  const ageGroups = customers.demographics.ageGroups.map((group) => ({
    range: group.range,
    ratio: group.ratio,
  }));

  const dominantAgeGroup =
    ageGroups.length > 0
      ? ageGroups.reduce((prev, current) =>
          current.ratio > prev.ratio ? current : prev,
        )
      : null;

  return {
    tasks: {
      items: sortedTasks,
      summary: taskSummary,
    },
    revenue: {
      monthlyTrend,
      dailyTrend,
      latestMonthLabel: latestMonthlyPoint
        ? latestMonthlyPoint.shortLabel
        : "--",
      latestValue: latestMonthlyPoint?.value ?? 0,
      previousValue: previousMonthlyPoint?.value ?? null,
      growthRatio,
      monthCount: monthlyTrend.length,
    },
    products: productContribution,
    customers: {
      total: customers.total,
      newThisMonth: customers.newThisMonth,
      gender: genderSlices,
      ageGroups,
      dominantAgeGroup,
    },
  };
}
