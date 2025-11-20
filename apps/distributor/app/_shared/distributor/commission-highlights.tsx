import {
  CreditCard,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";

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

type MetricTone = "default" | "positive" | "negative" | "warning" | "primary";

interface MetricConfig {
  id: string;
  label: string;
  value: string;
  icon: LucideIcon;
  caption?: string;
  secondary?: string;
  tone?: MetricTone;
  badge?: {
    label: string;
    tone: MetricTone;
  };
}

const BADGE_VARIANTS: Record<MetricTone, string> = {
  default: "border-neutral-200 bg-neutral-50 text-neutral-600",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-700",
  negative: "border-rose-200 bg-rose-50 text-rose-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  primary: "border-blue-200 bg-blue-50 text-blue-700",
};

const MOCK_JPY_TO_CNY_RATE = 0.048;

function formatNumber(value: number) {
  const rounded = Math.round(value);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatJPYDisplay(value: number) {
  return `¥${formatNumber(value)}`;
}

function formatCNYEstimate(value: number) {
  const cny = Math.round(value * MOCK_JPY_TO_CNY_RATE);
  return `≈ RMB ${formatCurrency(cny)}`;
}

export function CommissionHighlights({
  commission,
  partners,
  className,
}: CommissionHighlightsProps) {
  const growth = commission.overview.growthRatio;
  const secondaryShare = commission.secondary.share;

  const metrics: MetricConfig[] = [
    {
      id: "monthly",
      label: "本月佣金",
      value: formatJPYDisplay(commission.monthly),
      secondary: formatCNYEstimate(commission.monthly),
      caption: commission.overview.latestMonthLabel,
      icon: Wallet,
      tone: "primary",
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
      value: formatJPYDisplay(commission.total),
      secondary: formatCNYEstimate(commission.total),
      icon: CreditCard,
      tone: "default",
    },
    {
      id: "secondary-monthly",
      label: "二级分销佣金",
      value: formatJPYDisplay(commission.secondary.monthly),
      secondary:
        secondaryShare != null
          ? `占比 ${formatPercent(secondaryShare, 1)}`
          : undefined,
      icon: TrendingUp,
      tone: "default",
    },
    {
      id: "active",
      label: "活跃伙伴",
      value: `${partners.activeCount}`,
      secondary: `总数 ${partners.totalManaged}`,
      icon: Users,
      tone: "default",
    },
  ];

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}>
      {metrics.map((metric) => (
        <Card
          key={metric.id}
          className="overflow-hidden border-neutral-200/60 shadow-sm transition-all hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-500">
              {metric.label}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-neutral-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold text-neutral-900">
                {metric.value}
              </div>
              {metric.badge ? (
                <Badge
                  variant="outline"
                  className={cn(
                    "ml-2 h-5 px-1.5 text-[10px]",
                    BADGE_VARIANTS[metric.badge.tone],
                  )}
                >
                  {metric.badge.label}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-neutral-500">{metric.secondary}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
