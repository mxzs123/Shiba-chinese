import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

import { ProductContribution, RevenueOverview } from "../../_shared/sales";
import { formatCurrency, formatPercent } from "../../_shared/sales/formatters";
import { getDistributorDashboardViewModel } from "../../_shared/distributor";

export default function DistributorHomePage() {
  const viewModel = getDistributorDashboardViewModel();
  const monthlyGrowth = viewModel.commission.overview.growthRatio;
  const growthBadge =
    monthlyGrowth === null
      ? null
      : ({
          label: `${monthlyGrowth >= 0 ? "+" : ""}${formatPercent(
            monthlyGrowth,
            1,
          )}`,
          tone: monthlyGrowth >= 0 ? "positive" : "negative",
        } as const);
  const metrics = [
    {
      label: "本月佣金",
      value: formatCurrency(viewModel.commission.monthly),
      caption: `${viewModel.commission.overview.latestMonthLabel}`,
      badge: growthBadge,
    },
    {
      label: "累计佣金",
      value: formatCurrency(viewModel.commission.total),
    },
    {
      label: "活跃伙伴",
      value: `${viewModel.partners.activeCount} 家`,
    },
    {
      label: "待审批",
      value: `${viewModel.partners.pendingApprovals} 份`,
      badge: {
        label: "待处理",
        tone: "warning" as const,
      },
    },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="py-5">
            <CardHeader className="gap-1 pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                {metric.label}
              </CardTitle>
              {metric.caption ? (
                <span className="text-xs text-neutral-500">
                  {metric.caption}
                </span>
              ) : null}
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold text-neutral-900">
                  {metric.value}
                </span>
                {metric.badge ? (
                  <Badge
                    variant="outline"
                    className={
                      metric.badge.tone === "positive"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                        : metric.badge.tone === "negative"
                          ? "border-rose-200 bg-rose-50 text-rose-600"
                          : "border-amber-200 bg-amber-50 text-amber-600"
                    }
                  >
                    {metric.badge.label}
                  </Badge>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <RevenueOverview
            data={viewModel.commission.overview}
            labels={{
              title: "佣金走势",
              latestMonth: "最新月份",
              latestValue: "当月佣金",
              growth: "环比变化",
              series: "佣金",
              dailySeries: "日佣金",
            }}
          />

          <ProductContribution data={viewModel.products} className="mt-0" />
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold text-neutral-900">
                伙伴概览
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-6">
              <PartnerStat
                label="活跃伙伴"
                value={`${viewModel.partners.activeCount} 家`}
                tone="neutral"
              />
              <PartnerStat
                label="待审批"
                value={`${viewModel.partners.pendingApprovals} 份`}
                tone="primary"
              />
              <PartnerStat
                label="长期未活跃"
                value={`${viewModel.partners.inactiveCount} 家`}
                tone="warning"
              />
            </CardContent>
          </Card>
        </aside>
      </section>
    </div>
  );
}

interface PartnerStatProps {
  label: string;
  value: string;
  tone: "neutral" | "primary" | "warning";
}

function PartnerStat({ label, value, tone }: PartnerStatProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        tone === "primary" && "border-primary/20 bg-primary/5 text-primary",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-700",
        tone === "neutral" &&
          "border-neutral-200 bg-neutral-50 text-neutral-700",
      )}
    >
      <p className="text-xs uppercase tracking-[0.2em]">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
