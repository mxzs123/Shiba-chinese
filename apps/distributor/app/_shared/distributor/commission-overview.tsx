import type { DistributorDashboardViewModel } from "./data";
import { RevenueOverview } from "../sales";

interface CommissionOverviewProps {
  data: DistributorDashboardViewModel["commission"];
  className?: string;
}

export function CommissionOverview({
  data,
  className,
}: CommissionOverviewProps) {
  return (
    <RevenueOverview
      data={data.overview}
      className={className}
      labels={{
        title: "佣金走势",
        latestMonth: "最新月份",
        latestValue: "当月佣金",
        growth: "环比变化",
        series: "佣金",
        dailySeries: "日佣金",
        dailyRange: "近 7 天",
        dailyUnit: "单位：日元",
      }}
    />
  );
}
