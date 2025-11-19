"use client";

import { Pie, PieChart, Cell, Label } from "recharts";

import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { Progress } from "~/components/ui/progress";
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
    <Card className={cn("flex flex-col h-full bg-white", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-neutral-900">
          产品贡献占比
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center pb-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[200px] mb-4"
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
              innerRadius={68}
              outerRadius={82}
              strokeWidth={0}
              paddingAngle={4}
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
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-neutral-900 text-xl font-bold"
                        >
                          {chart.length}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-neutral-500 text-xs"
                        >
                          品类
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
        <div className="grid gap-2 grid-cols-2">
          {chart.map((item, index) => (
            <div
              key={item.key}
              className="flex items-center gap-2 rounded-md border border-neutral-100 px-2 py-1.5"
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    CHART_COLORS.data[index % CHART_COLORS.data.length],
                }}
              />
              <span className="text-xs text-neutral-600 flex-1 truncate">
                {item.name}
              </span>
              <span className="font-mono text-[10px] font-medium text-neutral-900">
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
  const maxAmount = Math.max(...top.map(t => t.amount));

  return (
    <Card className={cn("flex flex-col h-full bg-white", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-neutral-900">
          热销榜单
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-6">
        <div className="space-y-5">
          {top.map((item, index) => (
            <div key={item.key} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-3">
                   <span className={cn(
                     "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                     index === 0 ? "bg-yellow-100 text-yellow-700" :
                     index === 1 ? "bg-neutral-100 text-neutral-700" :
                     index === 2 ? "bg-neutral-100 text-neutral-700" :
                     "bg-neutral-50 text-neutral-500"
                   )}>
                     {index + 1}
                   </span>
                   <span className="text-sm font-medium text-neutral-900">
                     {item.name}
                   </span>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-bold text-neutral-900">
                    {formatCurrency(item.amount)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress 
                  value={(item.amount / maxAmount) * 100} 
                  className="h-1.5 flex-1" 
                />
                <span className="text-[10px] font-medium text-neutral-500 w-8 text-right">
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
