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
import { Separator } from "~/components/ui/separator";
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
    <Card className={cn("h-full bg-white", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-neutral-900">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pb-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <MetricBlock label={latestMonthCopy} value={data.latestMonthLabel} />
          <MetricBlock
            label={latestValueCopy}
            value={formatCurrency(data.latestValue)}
          />
          <MetricBlock
            label={growthCopy}
            value={data.growthRatio === null ? "--" : growthLabel}
            tone={
              data.growthRatio === null
                ? undefined
                : data.growthRatio >= 0
                  ? "positive"
                  : "negative"
            }
          />
        </div>
        <Separator />
        <ChartContainer
          className="aspect-auto h-[280px]"
          config={{
            value: {
              label: seriesLabel,
              color: CHART_COLORS.primary.DEFAULT,
            },
          }}
        >
          <AreaChart data={data.monthlyTrend}>
            <CartesianGrid
              strokeDasharray={CHART_CONFIG.grid.strokeDasharray}
              strokeOpacity={CHART_CONFIG.grid.strokeOpacity}
              stroke={CHART_CONFIG.grid.stroke}
              vertical={false}
            />
            <XAxis
              dataKey="shortLabel"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={{ fill: "#6b7280", fontSize: 12 }}
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
                stroke: CHART_COLORS.alpha.primary12,
                strokeWidth: 2,
              }}
              content={
                <ChartTooltipContent
                  className="bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-lg rounded-lg px-3 py-2"
                  labelClassName="text-sm font-semibold text-neutral-900"
                  formatter={(value) => (
                    <span className="font-mono font-semibold text-neutral-900">
                      {formatCurrency(Number(value))}
                    </span>
                  )}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={CHART_COLORS.primary.dark}
              strokeWidth={CHART_CONFIG.area.strokeWidth}
              strokeLinecap="round"
              fill={CHART_COLORS.alpha.primary12}
              fillOpacity={1}
              dot={{
                r: CHART_CONFIG.area.dotRadius,
                fill: CHART_COLORS.primary.dark,
                stroke: "#fff",
                strokeWidth: 2,
              }}
              activeDot={{
                r: CHART_CONFIG.area.activeDotRadius,
                fill: CHART_COLORS.primary.dark,
                stroke: "#fff",
                strokeWidth: 2.5,
                filter: "drop-shadow(0 2px 4px rgba(37, 99, 235, 0.3))",
              }}
            />
          </AreaChart>
        </ChartContainer>
        {hasDailyTrend ? (
          <div className="rounded-xl bg-neutral-50 p-4">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-medium">{dailyRangeCopy}</span>
              <Badge
                variant="outline"
                className="border-neutral-200 bg-white text-[11px] text-neutral-500"
              >
                {dailyUnitCopy}
              </Badge>
            </div>
            <ChartContainer
              className="aspect-auto h-[170px] pt-3"
              config={{
                value: {
                  label: dailySeriesLabel,
                  color: CHART_COLORS.primary.DEFAULT,
                },
              }}
            >
              <BarChart data={data.dailyTrend}>
                <CartesianGrid
                  strokeDasharray={CHART_CONFIG.grid.strokeDasharray}
                  strokeOpacity={CHART_CONFIG.grid.strokeOpacity}
                  stroke={CHART_CONFIG.grid.stroke}
                  vertical={false}
                />
                <XAxis
                  dataKey="shortLabel"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={6}
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                />
                <YAxis axisLine={false} tickLine={false} width={0} />
                <ChartTooltip
                  cursor={{ fill: CHART_COLORS.alpha.primary8 }}
                  content={
                    <ChartTooltipContent
                      className="bg-white/95 backdrop-blur-sm border border-neutral-200 shadow-lg rounded-lg px-3 py-2"
                      labelClassName="text-sm font-semibold text-neutral-900"
                      formatter={(value) => (
                        <span className="font-mono font-medium text-neutral-900">
                          {formatCurrency(Number(value))}
                        </span>
                      )}
                    />
                  }
                />
                <Bar
                  dataKey="value"
                  radius={CHART_CONFIG.bar.radius}
                  fill={CHART_COLORS.primary.DEFAULT}
                  maxBarSize={CHART_CONFIG.bar.maxSize}
                  activeBar={{
                    fill: CHART_COLORS.primary.dark,
                  }}
                />
              </BarChart>
            </ChartContainer>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface MetricBlockProps {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}

function MetricBlock({ label, value, tone }: MetricBlockProps) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 transition-shadow duration-150">
      <p className="text-xs uppercase tracking-[0.18em] text-neutral-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-lg font-semibold text-neutral-900",
          tone === "positive" && "text-primary",
          tone === "negative" && "text-rose-600",
        )}
      >
        {value}
      </p>
    </div>
  );
}
