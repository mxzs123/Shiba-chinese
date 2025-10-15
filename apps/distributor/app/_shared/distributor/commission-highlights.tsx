import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";

import type { DistributorDashboardViewModel, PartnerSummaryData } from "./data";
import { formatCurrency, formatPercent } from "../sales/formatters";

interface CommissionHighlightsProps {
  commission: DistributorDashboardViewModel["commission"];
  partners: PartnerSummaryData;
  className?: string;
}

type MetricTone = "default" | "positive" | "negative" | "warning";

interface MetricConfig {
  id: string;
  label: string;
  value: string;
  caption?: string;
  badge?: {
    label: string;
    tone: MetricTone;
  };
}

const BADGE_VARIANTS: Record<MetricTone, string> = {
  default: "border-neutral-200 bg-white text-neutral-500",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-600",
  negative: "border-rose-200 bg-rose-50 text-rose-600",
  warning: "border-amber-200 bg-amber-50 text-amber-600",
};

export function CommissionHighlights({
  commission,
  partners,
  className,
}: CommissionHighlightsProps) {
  const growth = commission.overview.growthRatio;

  const metrics: MetricConfig[] = [
    {
      id: "monthly",
      label: "本月佣金",
      value: formatCurrency(commission.monthly),
      caption: commission.overview.latestMonthLabel,
      badge:
        growth === null
          ? undefined
          : {
              label: `${growth >= 0 ? "+" : ""}${formatPercent(growth, 1)}`,
              tone: growth >= 0 ? "positive" : "negative",
            },
    },
    {
      id: "total",
      label: "累计佣金",
      value: formatCurrency(commission.total),
    },
    {
      id: "active",
      label: "活跃伙伴",
      value: `${partners.activeCount} 家`,
    },
    {
      id: "pending",
      label: "待审批",
      value: `${partners.pendingApprovals} 份`,
      badge:
        partners.pendingApprovals > 0
          ? {
              label: "待处理",
              tone: "warning",
            }
          : undefined,
    },
  ];

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}>
      {metrics.map((metric) => (
        <Card key={metric.id} className="gap-4 py-5">
          <CardHeader className="gap-1 px-5 pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              {metric.label}
            </CardTitle>
            {metric.caption ? (
              <span className="text-xs text-neutral-500">{metric.caption}</span>
            ) : null}
          </CardHeader>
          <CardContent className="px-5 pb-1 pt-0">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-semibold tracking-tight text-neutral-900">
                {metric.value}
              </span>
              {metric.badge ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[11px]",
                    BADGE_VARIANTS[metric.badge.tone],
                  )}
                >
                  {metric.badge.label}
                </Badge>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
