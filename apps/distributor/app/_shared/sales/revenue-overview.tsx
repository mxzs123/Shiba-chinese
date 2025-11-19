"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";
import { cn } from "~/lib/utils";
import { CHART_COLORS, CHART_CONFIG } from "../../../lib/chart-theme";

import type { RevenueOverviewData } from "./data";
import { formatCurrency, formatPercent } from "./formatters";

interface RevenueOverviewProps {
  data: RevenueOverviewData;
  className?: string;
  labels?: {
    title?: string;
    latestMonth?: string;
    latestValue?: string;
    growth?: string;
    series?: string;
    dailySeries?: string;
    dailyRange?: string;
    dailyUnit?: string;
  };
}

export function RevenueOverview({
  data,
  className,
  labels,
}: RevenueOverviewProps) {
  const growthLabel =
    data.growthRatio === null
      ? "--"
      : `${data.growthRatio >= 0 ? "+" : ""}${formatPercent(
          data.growthRatio,
          1,
        )}`;
  const hasDailyTrend = data.dailyTrend.length > 0;
  const title = labels?.title ?? "业绩概览";
  const latestMonthCopy = labels?.latestMonth ?? "最新月份";
  const latestValueCopy = labels?.latestValue ?? "当月营收";
  const growthCopy = labels?.growth ?? "环比变化";
  const seriesLabel = labels?.series ?? "营收";
  const dailySeriesLabel = labels?.dailySeries ?? "日营收";
  const dailyRangeCopy = labels?.dailyRange ?? "近 7 天";
  const dailyUnitCopy = labels?.dailyUnit ?? "单位：日元";

  return (
    <Card className={cn("flex flex-col h-full bg-white", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <CardTitle className="text-base font-semibold text-neutral-900">
          {title}
        </CardTitle>
        {/* Optional: Date Range Picker could go here */}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-6 pb-6">
        {/* KPI Summary Row */}
        <div className="flex items-center justify-between gap-4 px-1">
          <div>
            <p className="text-sm font-medium text-neutral-500">
              {latestValueCopy}
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-neutral-900">
                {formatCurrency(data.latestValue)}
              </span>
              <span className="text-sm text-neutral-500">
                ({data.latestMonthLabel})
              </span>
            </div>
          </div>
          <div className="text-right">
             <p className="text-sm font-medium text-neutral-500">
              {growthCopy}
            </p>
             <div className="mt-1 flex items-center justify-end gap-1.5">
                {data.growthRatio !== null && (
                  <span
                    className={cn(
                      "flex h-6 items-center rounded-full px-2 text-xs font-medium",
                      data.growthRatio >= 0
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-rose-50 text-rose-700"
                    )}
                  >
                    {growthLabel}
                  </span>
                )}
             </div>
          </div>
        </div>

        {/* Main Area Chart */}
        <div className="h-[300px] w-full">
          <ChartContainer
             className="h-full w-full"
             config={{
               value: {
                 label: seriesLabel,
                 color: CHART_COLORS.primary.DEFAULT,
               },
             }}
           >
            <AreaChart data={data.monthlyTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_COLORS.primary.DEFAULT}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={CHART_COLORS.primary.DEFAULT}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f0f0f0"
                vertical={false}
              />
              <XAxis
                dataKey="shortLabel"
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                tick={{ fill: "#9ca3af", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={42}
                tick={{ fill: "#9ca3af", fontSize: 11 }}
                tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}
              />
              <ChartTooltip
                cursor={{
                  stroke: CHART_COLORS.primary.light,
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
                content={
                  <ChartTooltipContent
                    className="min-w-[120px]"
                    formatter={(value) => (
                      <div className="flex w-full justify-between font-medium text-neutral-900">
                        <span>{formatCurrency(Number(value))}</span>
                      </div>
                    )}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={CHART_COLORS.primary.DEFAULT}
                strokeWidth={3}
                fill="url(#fillDesktop)"
                fillOpacity={1}
                activeDot={{
                  r: 6,
                  fill: CHART_COLORS.primary.DEFAULT,
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ChartContainer>
        </div>

        {/* Daily Trend Bar Chart (Optional) */}
        {hasDailyTrend && (
          <div className="mt-auto pt-4 border-t border-neutral-100">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">
                {dailyRangeCopy}
              </span>
              <Badge variant="secondary" className="text-[10px] text-neutral-500 font-normal">
                {dailyUnitCopy}
              </Badge>
            </div>
            <div className="h-[100px] w-full">
              <ChartContainer
                className="h-full w-full"
                config={{
                  value: {
                    label: dailySeriesLabel,
                    color: CHART_COLORS.primary.DEFAULT,
                  },
                }}
              >
                <BarChart data={data.dailyTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                   <ChartTooltip
                      cursor={{ fill: "rgba(0,0,0,0.04)" }}
                      content={
                        <ChartTooltipContent
                          hideLabel
                          formatter={(value) => (
                             <span className="font-medium text-neutral-900">
                               {formatCurrency(Number(value))}
                             </span>
                          )}
                        />
                      }
                    />
                  <Bar
                    dataKey="value"
                    fill={CHART_COLORS.primary.light}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

