import { distributorDashboardMock } from "../../../lib/mock/distributor-dashboard";
import type {
  ProductContributionItem,
  RevenueOverviewData,
} from "../sales/data";

function formatMonthLabel(raw: string) {
  const [, month] = raw.split("-");
  return `${Number.parseInt(month ?? "1", 10)}月`;
}

export interface PartnerStatusSlice {
  id: "active" | "inactive";
  label: string;
  value: number;
  ratio: number;
  tone: "primary" | "warning";
}

export interface PartnerSummaryData {
  activeCount: number;
  inactiveCount: number;
  totalManaged: number;
  statusSlices: PartnerStatusSlice[];
}

export interface DistributorDashboardViewModel {
  commission: {
    overview: RevenueOverviewData;
    monthly: number;
    total: number;
    secondary: {
      monthly: number;
      total: number;
      share: number | null;
    };
  };
  products: ProductContributionItem[];
  partners: PartnerSummaryData;
}

export function getDistributorDashboardViewModel(): DistributorDashboardViewModel {
  const {
    commission,
    secondaryCommission,
    productSales,
    secondaryDistributorSummary,
  } = distributorDashboardMock;

  const monthlyTrend = commission.trend.map((item) => ({
    month: item.month,
    value: item.amount,
    shortLabel: formatMonthLabel(item.month),
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

  const totalManaged =
    secondaryDistributorSummary.activeCount +
    secondaryDistributorSummary.inactiveCount;

  const safeTotal = totalManaged > 0 ? totalManaged : 1;

  const statusSlices: PartnerStatusSlice[] = [
    {
      id: "active",
      label: "活跃伙伴",
      value: secondaryDistributorSummary.activeCount,
      ratio: secondaryDistributorSummary.activeCount / safeTotal,
      tone: "primary",
    },
    {
      id: "inactive",
      label: "长期未活跃",
      value: secondaryDistributorSummary.inactiveCount,
      ratio: secondaryDistributorSummary.inactiveCount / safeTotal,
      tone: "warning",
    },
  ];

  return {
    commission: {
      overview,
      monthly: commission.monthly,
      total: commission.total,
      secondary: {
        monthly: secondaryCommission.monthly,
        total: secondaryCommission.total,
        share:
          commission.total > 0
            ? secondaryCommission.total / commission.total
            : null,
      },
    },
    products,
    partners: {
      activeCount: secondaryDistributorSummary.activeCount,
      inactiveCount: secondaryDistributorSummary.inactiveCount,
      totalManaged,
      statusSlices,
    },
  };
}
