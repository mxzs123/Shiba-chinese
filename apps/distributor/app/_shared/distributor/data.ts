import { distributorDashboardMock } from "../../../lib/mock/distributor-dashboard";
import type {
  ProductContributionItem,
  RevenueOverviewData,
} from "../sales/data";

function formatMonthLabel(raw: string) {
  const [, month] = raw.split("-");
  return `${Number.parseInt(month ?? "1", 10)}月`;
}

export interface DistributorDashboardViewModel {
  commission: {
    overview: RevenueOverviewData;
    monthly: number;
    total: number;
  };
  products: ProductContributionItem[];
  partners: {
    activeCount: number;
    pendingApprovals: number;
    inactiveCount: number;
  };
}

export function getDistributorDashboardViewModel(): DistributorDashboardViewModel {
  const { commission, productSales, secondaryDistributorSummary } =
    distributorDashboardMock;

  const monthlyTrend = commission.trend.map((item) => ({
    month: item.month,
    value: item.amount,
    shortLabel: `${formatMonthLabel(item.month)}月`,
  }));

  const latestPoint = monthlyTrend.at(-1) ?? null;
  const previousPoint = monthlyTrend.at(-2) ?? null;

  const growthRatio =
    latestPoint && previousPoint
      ? (latestPoint.value - previousPoint.value) /
        Math.max(previousPoint.value, 1)
      : null;

  const productTotal = productSales.reduce(
    (total, item) => total + item.amount,
    0,
  );

  const products: ProductContributionItem[] = [...productSales]
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      name: item.name,
      amount: item.amount,
      category: item.category,
      ratio: productTotal > 0 ? item.amount / productTotal : 0,
    }));

  const overview: RevenueOverviewData = {
    monthlyTrend,
    dailyTrend: [],
    latestMonthLabel: latestPoint?.shortLabel ?? "--",
    latestValue: latestPoint?.value ?? 0,
    previousValue: previousPoint?.value ?? null,
    growthRatio,
    monthCount: monthlyTrend.length,
  };

  return {
    commission: {
      overview,
      monthly: commission.monthly,
      total: commission.total,
    },
    products,
    partners: secondaryDistributorSummary,
  };
}
