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
  caption?: string;
  secondary?: string;
  tone?: MetricTone;
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
  primary: "border-primary/20 bg-primary/10 text-primary",
};

const CARD_VARIANTS: Record<MetricTone, string> = {
  default:
    "border border-neutral-200 bg-white hover:shadow-md transition-shadow duration-200",
  primary:
    "border-2 border-primary/20 bg-primary/[0.02] hover:shadow-md transition-shadow duration-200",
  warning:
    "border-2 border-amber-500/20 bg-amber-50/50 hover:shadow-md transition-shadow duration-200",
  positive:
    "border-2 border-emerald-500/20 bg-emerald-50/50 hover:shadow-md transition-shadow duration-200",
  negative:
    "border-2 border-rose-500/20 bg-rose-50/50 hover:shadow-md transition-shadow duration-200",
};

const MOCK_JPY_TO_CNY_RATE = 0.048; // TODO: 上线前改为实时汇率

function formatNumber(value: number) {
  const rounded = Math.round(value);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatJPYDisplay(value: number) {
  return `JPY ${formatNumber(value)}`;
}

function formatCNYEstimate(value: number) {
  const cny = Math.round(value * MOCK_JPY_TO_CNY_RATE);
  return `≈ 人民币 ${formatCurrency(cny)}`;
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
      tone: "default",
    },
    {
      id: "secondary-monthly",
      label: "二级分销佣金",
      value: formatJPYDisplay(commission.secondary.monthly),
      secondary:
        secondaryShare != null
          ? `占总佣金 ${formatPercent(secondaryShare, 1)}`
          : undefined,
      tone: "default",
    },
    {
      id: "active",
      label: "活跃伙伴",
      value: `${partners.activeCount} 家`,
      tone: "default",
    },
  ];

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-4", className)}>
      {metrics.map((metric) => (
        <Card
          key={metric.id}
          className={cn("gap-4 py-5", CARD_VARIANTS[metric.tone ?? "default"])}
        >
          <CardHeader className="gap-1 px-5 pb-1">
            <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              {metric.label}
            </CardTitle>
            <span
              className={cn(
                "block min-h-[1rem] text-xs text-neutral-500",
                metric.caption ? undefined : "invisible",
              )}
              aria-hidden={!metric.caption}
            >
              {metric.caption ?? "\u00A0"}
            </span>
          </CardHeader>
          <CardContent className="px-5 pb-1 pt-0">
            <div className="flex items-end justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-4xl font-bold tracking-tight text-neutral-900">
                  {metric.value}
                </span>
                {metric.secondary ? (
                  <span className="mt-1.5 text-xs text-neutral-500">
                    {metric.secondary}
                  </span>
                ) : null}
              </div>
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
