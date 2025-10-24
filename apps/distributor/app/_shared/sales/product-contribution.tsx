"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { CHART_COLORS, CHART_CONFIG } from "~/lib/chart-theme";

import type { ProductContributionItem } from "./data";
import { formatCurrency, formatPercent } from "./formatters";
import { cn } from "~/lib/utils";

interface ProductContributionProps {
  data: ProductContributionItem[];
  className?: string;
}

export function ProductContribution({
  data,
  className,
}: ProductContributionProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-neutral-900">
          产品贡献
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pb-6">
        <ChartContainer
          className="aspect-auto h-[240px]"
          config={{
            amount: {
              label: "销售额",
              color: CHART_COLORS.primary.DEFAULT,
            },
          }}
        >
          <BarChart
            data={data.map((item) => ({
              name: item.name,
              amount: item.amount,
            }))}
            layout="vertical"
            margin={{ left: 80, right: 12, top: 12, bottom: 12 }}
          >
            <CartesianGrid
              strokeDasharray={CHART_CONFIG.grid.strokeDasharray}
              strokeOpacity={CHART_CONFIG.grid.strokeOpacity}
              stroke={CHART_CONFIG.grid.stroke}
            />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              width={120}
              tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 500 }}
            />
            <ChartTooltip
              cursor={{ fill: CHART_COLORS.alpha.primary8 }}
              content={
                <ChartTooltipContent
                  className="bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-lg rounded-lg px-3 py-2"
                  labelClassName="text-sm font-semibold text-neutral-900"
                  formatter={(value, name) => (
                    <div className="flex w-full items-center justify-between gap-4">
                      <span className="text-sm text-neutral-600">{name}</span>
                      <span className="font-mono font-semibold text-neutral-900">
                        {formatCurrency(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="amount"
              radius={[0, 6, 6, 0]}
              fill={CHART_COLORS.primary.DEFAULT}
              maxBarSize={CHART_CONFIG.bar.maxSize}
              activeBar={{
                fill: CHART_COLORS.primary.dark,
              }}
            />
          </BarChart>
        </ChartContainer>
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.name}
              className="rounded-xl bg-neutral-50 p-4 hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-neutral-900">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    <span className="font-mono font-semibold text-neutral-900">
                      {formatCurrency(item.amount)}
                    </span>
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-neutral-200 bg-white text-[11px] font-medium text-neutral-600"
                >
                  {item.category}
                </Badge>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Progress
                  value={Math.round(item.ratio * 100)}
                  className="h-2.5 bg-blue-100 [&_[data-slot=progress-indicator]]:bg-blue-600"
                />
                <span className="text-xs font-semibold text-neutral-900 shrink-0">
                  {formatPercent(item.ratio, 1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
