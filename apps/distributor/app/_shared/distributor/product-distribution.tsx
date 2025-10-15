"use client";

import { Pie, PieChart, Cell, Label } from "recharts";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { cn } from "~/lib/utils";

import type { ProductContributionItem } from "../sales/data";
import { formatCurrency, formatPercent } from "../sales/formatters";

const CHART_COLORS = [
  "#1d4ed8",
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
] as const;

interface PreparedProductItem extends ProductContributionItem {
  key: string;
}

function prepareProductData(data: ProductContributionItem[]): {
  chart: PreparedProductItem[];
  top: PreparedProductItem[];
  total: number;
} {
  const sorted = [...data].sort((a, b) => b.amount - a.amount);
  const total = sorted.reduce((sum, item) => sum + item.amount, 0);

  const top = sorted.slice(0, 4).map((item, index) => ({
    ...item,
    key: `top-${index}`,
  }));

  const remainder = sorted.slice(4);
  const remainderAmount = remainder.reduce((sum, item) => sum + item.amount, 0);

  const chartData = [...top];

  if (remainderAmount > 0) {
    chartData.push({
      name: "其他",
      amount: remainderAmount,
      category: "--",
      ratio: total > 0 ? remainderAmount / total : 0,
      key: "top-rest",
    });
  }

  return { chart: chartData, top, total };
}

interface ProductDistributionChartProps {
  data: ProductContributionItem[];
  className?: string;
}

export function ProductDistributionChart({
  data,
  className,
}: ProductDistributionChartProps) {
  const { chart, total } = prepareProductData(data);

  const chartConfig = chart.reduce<
    Record<string, { label: string; color: string }>
  >((config, item, index) => {
    const paletteColor = CHART_COLORS[index % CHART_COLORS.length];
    const color: string =
      paletteColor !== undefined ? paletteColor : CHART_COLORS[0];
    config[item.key] = {
      label: item.name,
      color,
    };
    return config;
  }, {});

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-neutral-900">
          产品贡献占比
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[220px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  nameKey="key"
                  formatter={(value, _name, item) => {
                    const payload = item?.payload as
                      | PreparedProductItem
                      | undefined;
                    if (!payload) {
                      return null;
                    }

                    return (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="text-neutral-500">{payload.name}</span>
                        <span className="text-right font-mono text-sm font-medium text-neutral-900">
                          {formatPercent(payload.ratio, 1)} · {formatCurrency(Number(value))}
                        </span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Pie
              data={chart.map((item) => ({
                ...item,
                value: item.amount,
              }))}
              dataKey="value"
              nameKey="name"
              innerRadius={64}
              strokeWidth={6}
            >
              {chart.map((item, index) => (
                <Cell
                  key={item.key}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-neutral-900 text-2xl font-semibold"
                        >
                          {formatCurrency(total)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 22}
                          className="fill-neutral-500 text-xs"
                        >
                          总销售额
                        </tspan>
                      </text>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {chart.map((item, index) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{
                    backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                  }}
                />
                <span className="text-xs text-neutral-600">{item.name}</span>
              </div>
              <span className="font-mono text-xs font-medium text-neutral-900">
                {formatPercent(item.ratio, 1)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

interface ProductDistributionLeaderboardProps {
  data: ProductContributionItem[];
  className?: string;
}

export function ProductDistributionLeaderboard({
  data,
  className,
}: ProductDistributionLeaderboardProps) {
  const { top } = prepareProductData(data);

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-neutral-900">
          热销产品榜
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-5">
        <div className="grid gap-3 sm:grid-cols-2">
          {top.map((item, index) => (
            <div
              key={item.key}
              className="rounded-xl border border-neutral-200 bg-neutral-50 p-4"
            >
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-medium uppercase tracking-[0.18em] text-neutral-400">
                  TOP {index + 1}
                </span>
                <Badge
                  variant="outline"
                  className="border-neutral-200 bg-white text-[11px] text-neutral-500"
                >
                  {formatPercent(item.ratio, 1)}
                </Badge>
              </div>
              <p className="mt-3 text-sm font-semibold text-neutral-900">
                {item.name}
              </p>
              <p className="text-xs text-neutral-500">
                销售额 {formatCurrency(item.amount)}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-neutral-400">
                类别 {item.category}
              </p>
            </div>
          ))}
        </div>
        {data.length > top.length ? (
          <p className="text-xs text-neutral-500">
            其余品类请在产品分析页查看更多明细。
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
