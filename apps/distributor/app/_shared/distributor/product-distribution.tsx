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
import { CHART_COLORS, CHART_CONFIG } from "../../../lib/chart-theme";

import type { ProductContributionItem } from "../sales/data";
import { formatCurrency, formatPercent } from "../sales/formatters";

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
    config[item.key] = {
      label: item.name,
      color:
        CHART_COLORS.data[index % CHART_COLORS.data.length] ??
        CHART_COLORS.data[0],
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
          className="mx-auto aspect-square max-h-[240px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  className="bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-lg rounded-lg px-3 py-2"
                  labelClassName="text-sm font-semibold text-neutral-900"
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
                        <span className="text-sm text-neutral-600">
                          {payload.name}
                        </span>
                        <span className="text-right font-mono text-sm font-semibold text-neutral-900">
                          {formatPercent(payload.ratio, 1)} ·{" "}
                          {formatCurrency(Number(value))}
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
              innerRadius={CHART_CONFIG.pie.innerRadius}
              outerRadius={CHART_CONFIG.pie.outerRadius}
              paddingAngle={CHART_CONFIG.pie.paddingAngle}
              strokeWidth={CHART_CONFIG.pie.strokeWidth}
            >
              {chart.map((item, index) => (
                <Cell
                  key={item.key}
                  fill={CHART_COLORS.data[index % CHART_COLORS.data.length]}
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <g>
                        <circle
                          cx={viewBox.cx}
                          cy={viewBox.cy}
                          r={56}
                          fill="#f9fafb"
                          opacity={0.6}
                        />
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-neutral-900 text-2xl font-bold"
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
                      </g>
                    );
                  }
                  return null;
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-4 grid gap-2 grid-cols-2">
          {chart.map((item, index) => (
            <div
              key={item.key}
              className="flex items-center gap-2.5 rounded-lg bg-neutral-50 px-3 py-2.5"
            >
              <span
                className="inline-block size-3 rounded-sm shrink-0"
                style={{
                  backgroundColor:
                    CHART_COLORS.data[index % CHART_COLORS.data.length],
                }}
              />
              <span className="text-xs text-neutral-600 flex-1 truncate">
                {item.name}
              </span>
              <span className="font-mono text-xs font-semibold text-neutral-900">
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
              className="group rounded-xl bg-neutral-50 p-4 hover:shadow-md hover:bg-white transition-all duration-200 border border-transparent hover:border-neutral-200"
            >
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="font-semibold uppercase tracking-[0.2em] text-neutral-400">
                  TOP {index + 1}
                </span>
                <Badge
                  variant="outline"
                  className="border-neutral-200 bg-white text-[11px] font-medium text-neutral-600"
                >
                  {formatPercent(item.ratio, 1)}
                </Badge>
              </div>
              <p className="mt-3 text-sm font-bold text-neutral-900 group-hover:text-primary transition-colors">
                {item.name}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                销售额{" "}
                <span className="font-mono font-semibold text-neutral-900">
                  {formatCurrency(item.amount)}
                </span>
              </p>
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                  类别
                </span>
                <span className="text-xs font-medium text-neutral-600">
                  {item.category}
                </span>
              </div>
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
